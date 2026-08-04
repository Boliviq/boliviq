import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Phase 4 Pre-Launch Security Audit — runtime security posture verification.
// Admin-only. Complements the static audit (RLS schema scan, secret scan).

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const sr = base44.asServiceRole;
    const checks = [];

    // 1 — Stripe webhook secret is configured.
    const hasStripeSecret = !!Deno.env.get('STRIPE_WEBHOOK_SECRET');
    checks.push({
      name: 'Stripe webhook signature secret configured',
      passed: hasStripeSecret,
      detail: hasStripeSecret ? 'STRIPE_WEBHOOK_SECRET is set' : 'STRIPE_WEBHOOK_SECRET is missing — webhook spoofing risk',
    });

    // 2 — Stripe live secret key is configured.
    const hasStripeKey = !!Deno.env.get('STRIPE_SECRET_KEY');
    checks.push({
      name: 'Stripe live secret key configured',
      passed: hasStripeKey,
      detail: hasStripeKey ? 'STRIPE_SECRET_KEY is set' : 'STRIPE_SECRET_KEY is missing — payments will fail',
    });

    // 3 — OpenAI API key configured (for AI assistant).
    const hasOpenAI = !!Deno.env.get('OPENAI_API_KEY');
    checks.push({
      name: 'OpenAI API key configured',
      passed: hasOpenAI,
      detail: hasOpenAI ? 'OPENAI_API_KEY is set' : 'OPENAI_API_KEY is missing — AI features will fail',
    });

    // 4 — No negative wallet balances (financial safety).
    const wallets = await sr.entities.CreditWallet.list('-created_date', 500);
    const negativeWallets = wallets.filter((w) => (w.balance || 0) < 0);
    checks.push({
      name: 'No negative wallet balances',
      passed: negativeWallets.length === 0,
      detail: negativeWallets.length === 0
        ? 'All wallets have non-negative balances'
        : `${negativeWallets.length} wallet(s) with negative balance`,
    });

    // 5 — No unresolved RLS denial events.
    const rlsEvents = await sr.entities.RlsEvent.filter({ resolved: false }, '-created_date', 100);
    checks.push({
      name: 'No unresolved RLS events',
      passed: rlsEvents.length === 0,
      detail: rlsEvents.length === 0
        ? 'All RLS events resolved'
        : `${rlsEvents.length} unresolved RLS event(s)`,
    });

    // 6 — All workspaces have credit wallets.
    const workspaces = await sr.entities.Workspace.list('-created_date', 500);
    const walletWsIds = new Set(wallets.map((w) => w.workspace_id));
    const wsWithoutWallets = workspaces.filter((w) => !walletWsIds.has(w.id));
    checks.push({
      name: 'All workspaces have credit wallets',
      passed: wsWithoutWallets.length === 0,
      detail: wsWithoutWallets.length === 0
        ? 'All workspaces have wallets'
        : `${wsWithoutWallets.length} workspace(s) without wallets`,
    });

    // 7 — All workspaces have active owners.
    const ownerMemberships = await sr.entities.WorkspaceMembership.filter(
      { role: 'owner', status: 'active' }, '-created_date', 500
    );
    const ownerWsIds = new Set(ownerMemberships.map((m) => m.workspace_id));
    const wsWithoutOwners = workspaces.filter((w) => !ownerWsIds.has(w.id));
    checks.push({
      name: 'All workspaces have active owners',
      passed: wsWithoutOwners.length === 0,
      detail: wsWithoutOwners.length === 0
        ? 'All workspaces have owners'
        : `${wsWithoutOwners.length} workspace(s) without owners`,
    });

    // 8 — No orphaned ledger entries.
    const walletIds = new Set(wallets.map((w) => w.id));
    const ledgerEntries = await sr.entities.LedgerEntry.list('-created_date', 100);
    const orphanedLedger = ledgerEntries.filter((l) => l.wallet_id && !walletIds.has(l.wallet_id));
    checks.push({
      name: 'No orphaned ledger entries',
      passed: orphanedLedger.length === 0,
      detail: orphanedLedger.length === 0
        ? 'All ledger entries reference valid wallets'
        : `${orphanedLedger.length} orphaned ledger entry(ies)`,
    });

    // 9 — No suspended workspaces with active subscriptions.
    const suspendedWs = workspaces.filter((w) => w.status === 'suspended');
    const suspendedIds = new Set(suspendedWs.map((w) => w.id));
    const allSubs = await sr.entities.Subscription.list('-created_date', 500);
    const activeSubsOnSuspended = allSubs.filter(
      (s) => suspendedIds.has(s.workspace_id) && s.status === 'active'
    );
    checks.push({
      name: 'No active subs on suspended workspaces',
      passed: activeSubsOnSuspended.length === 0,
      detail: activeSubsOnSuspended.length === 0
        ? 'No suspended workspaces have active subscriptions'
        : `${activeSubsOnSuspended.length} active sub(s) on suspended workspace(s)`,
    });

    // 10 — Audit log is being written (recent entries exist).
    const recentLogs = await sr.entities.AuditLog.list('-created_date', 1);
    checks.push({
      name: 'Audit logging is active',
      passed: recentLogs.length > 0,
      detail: recentLogs.length > 0
        ? `Last audit entry: ${recentLogs[0].action}`
        : 'No audit log entries found — audit trail is not recording',
    });

    const passed = checks.filter((c) => c.passed).length;
    const total = checks.length;

    return Response.json({
      overall: passed === total ? 'secure' : 'needs_attention',
      passed,
      total,
      checks,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.log('securityAudit error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});