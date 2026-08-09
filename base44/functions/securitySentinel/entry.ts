import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Boliviq Security Sentinel — defensive monitoring + threat detection.
// Admin-only. Analyzes security events, RLS denials, and audit logs for
// attack patterns. Creates SecurityEvent records for detected threats.
// Does NOT perform offensive actions. Does NOT expose secret data.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    const sr = base44.asServiceRole;
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    // --- Gather data ---
    const [securityEvents, rlsEvents, recentAudit] = await Promise.all([
      sr.entities.SecurityEvent.list('-created_date', 200),
      sr.entities.RlsEvent.filter({ resolved: false }, '-created_date', 100),
      sr.entities.AuditLog.filter({}, '-created_date', 500),
    ]);

    const detected: any[] = [];

    // --- Pattern: brute-force login (>=5 auth failures from same user in 1h) ---
    const authFailures = recentAudit.filter(
      (a) => a.action && a.action.includes('auth') && a.action.includes('fail') && a.created_date >= oneHourAgo
    );
    const authFailByUser = new Map<string, number>();
    for (const a of authFailures) {
      const key = a.actor_id || 'anonymous';
      authFailByUser.set(key, (authFailByUser.get(key) || 0) + 1);
    }
    for (const [uid, count] of authFailByUser) {
      if (count >= 5) {
        detected.push({
          event_type: 'brute_force_login',
          severity: 'high',
          user_id: uid === 'anonymous' ? null : uid,
          result: 'detected',
          reason: `${count} failed authentication attempts in the last hour`,
          metadata: { count, window: '1h' },
        });
      }
    }

    // --- Pattern: unresolved RLS denials (cross-workspace access attempts) ---
    const rlsByEntity = new Map<string, number>();
    for (const e of rlsEvents) {
      const key = e.entity_name || 'unknown';
      rlsByEntity.set(key, (rlsByEntity.get(key) || 0) + 1);
    }
    for (const [entity, count] of rlsByEntity) {
      if (count >= 3) {
        detected.push({
          event_type: 'cross_workspace_access',
          severity: count >= 10 ? 'critical' : 'high',
          result: 'denied',
          target_resource: entity,
          reason: `${count} unresolved RLS denials on ${entity} — possible cross-workspace access attempts`,
          metadata: { count, entity },
        });
      }
    }

    // --- Pattern: Stripe webhook signature failures ---
    const stripeSigFails = recentAudit.filter(
      (a) => a.action && a.action.includes('stripe') && a.action.includes('sig')
    );
    if (stripeSigFails.length >= 3) {
      detected.push({
        event_type: 'stripe_sig_invalid',
        severity: 'critical',
        result: 'blocked',
        reason: `${stripeSigFails.length} invalid Stripe webhook signatures — possible webhook forgery attempt`,
        metadata: { count: stripeSigFails.length },
      });
    }

    // --- Pattern: unusual credit operations volume ---
    const creditOps = recentAudit.filter(
      (a) => a.created_date >= dayAgo && (a.action === 'credit.charged' || a.action === 'credit_grant.monthly')
    );
    if (creditOps.length > 200) {
      detected.push({
        event_type: 'unusual_credit_volume',
        severity: 'medium',
        result: 'logged',
        reason: `${creditOps.length} credit operations in 24h — review for abuse`,
        metadata: { count: creditOps.length, window: '24h' },
      });
    }

    // --- Pattern: coupon/referral abuse ---
    const couponRedemptions = recentAudit.filter(
      (a) => a.created_date >= dayAgo && a.action === 'coupon.redeemed'
    );
    if (couponRedemptions.length > 20) {
      detected.push({
        event_type: 'coupon_abuse',
        severity: 'medium',
        result: 'logged',
        reason: `${couponRedemptions.length} coupon redemptions in 24h — review for abuse`,
        metadata: { count: couponRedemptions.length },
      });
    }

    // --- Persist newly detected events (dedup by event_type + reason in last hour) ---
    const recentEventKeys = new Set(
      securityEvents
        .filter((e) => e.created_date >= oneHourAgo)
        .map((e) => `${e.event_type}:${e.reason}`)
    );
    let newEvents = 0;
    for (const d of detected) {
      const key = `${d.event_type}:${d.reason}`;
      if (recentEventKeys.has(key)) continue;
      try {
        await sr.entities.SecurityEvent.create({
          ...d,
          route: 'securitySentinel',
        });
        newEvents++;
      } catch (e) {
        console.log('securitySentinel: failed to create event:', e.message);
      }
    }

    // --- Build dashboard summary ---
    const allEvents = await sr.entities.SecurityEvent.list('-created_date', 200);
    const highCritical = allEvents.filter((e) => e.severity === 'high' || e.severity === 'critical');
    const unresolvedHigh = highCritical.filter((e) => !e.resolved);
    const lastDay = allEvents.filter((e) => e.created_date >= dayAgo);

    const severityCounts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
    for (const e of lastDay) {
      severityCounts[e.severity] = (severityCounts[e.severity] || 0) + 1;
    }

    const eventTypeCounts: Record<string, number> = {};
    for (const e of lastDay) {
      eventTypeCounts[e.event_type] = (eventTypeCounts[e.event_type] || 0) + 1;
    }

    return Response.json({
      overall: unresolvedHigh.length === 0 ? 'secure' : 'threats_detected',
      timestamp: now.toISOString(),
      summary: {
        totalEvents24h: lastDay.length,
        newDetected: newEvents,
        unresolvedHighCritical: unresolvedHigh.length,
        severityCounts,
        eventTypeCounts,
        unresolvedRlsEvents: rlsEvents.length,
      },
      recentHighCritical: highCritical.slice(0, 20).map((e) => ({
        id: e.id,
        event_type: e.event_type,
        severity: e.severity,
        reason: e.reason,
        user_id: e.user_id,
        workspace_id: e.workspace_id,
        created_date: e.created_date,
        resolved: e.resolved,
      })),
      rlsEvents: rlsEvents.slice(0, 20).map((e) => ({
        id: e.id,
        entity_name: e.entity_name,
        operation: e.operation,
        status_code: e.status_code,
        error_message: e.error_message,
        created_date: e.created_date,
      })),
    });
  } catch (error) {
    console.log('securitySentinel error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});