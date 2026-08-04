import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Phase 5 Launch Monitor — comprehensive launch readiness + ongoing monitoring.
// Admin-only. Aggregates system health, Stripe sync, entity counts, and activity metrics.

const STRIPE_PRICE_IDS = [
  'price_1Tv06uGIUtciLaIv1f90LIQP', // Homeowner+AI monthly
  'price_1TuhKaGIUtciLaIvAwSZsSS5', // Professional monthly
  'price_1TuhKaGIUtciLaIvIWw93Wci', // Professional+AI monthly
  'price_1TuhKaGIUtciLaIvrsEpadrz', // Professional AI Unlimited monthly
  'price_1TuhKaGIUtciLaIvCHMv8mKB', // Team AI Unlimited monthly
  'price_1TuivvGIUtciLaIvjbZLSNyr', // 5K credits
  'price_1TuivvGIUtciLaIvUXBwho8Y', // 50K credits
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    const sr = base44.asServiceRole;
    const checks = [];
    const metrics = {};

    // === LAUNCH READINESS ===

    // 1 — Stripe products synced.
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    let stripeSynced = false;
    let stripeDetail = 'Stripe not configured';
    if (stripeKey) {
      try {
        let okCount = 0;
        for (const priceId of STRIPE_PRICE_IDS) {
          const resp = await fetch(`https://api.stripe.com/v1/prices/${priceId}`, {
            headers: { Authorization: `Bearer ${stripeKey}` },
          });
          if (resp.ok) okCount++;
        }
        stripeSynced = okCount === STRIPE_PRICE_IDS.length;
        stripeDetail = `${okCount}/${STRIPE_PRICE_IDS.length} Stripe prices verified`;
      } catch (e) {
        stripeDetail = `Stripe API error: ${e.message}`;
      }
    }
    checks.push({ name: 'Stripe products synced', passed: stripeSynced, detail: stripeDetail });

    // 2 — Stripe webhook secret configured.
    const hasWebhookSecret = !!Deno.env.get('STRIPE_WEBHOOK_SECRET');
    checks.push({ name: 'Stripe webhook secret configured', passed: hasWebhookSecret, detail: hasWebhookSecret ? 'Webhook signature verification active' : 'Missing STRIPE_WEBHOOK_SECRET' });

    // 3 — OpenAI API key configured.
    const hasOpenAI = !!Deno.env.get('OPENAI_API_KEY');
    checks.push({ name: 'OpenAI API key configured', passed: hasOpenAI, detail: hasOpenAI ? 'AI pipeline ready' : 'Missing OPENAI_API_KEY' });

    // 4 — No negative wallet balances.
    const wallets = await sr.entities.CreditWallet.list('-created_date', 500);
    const negativeWallets = wallets.filter((w) => (w.balance || 0) < 0);
    checks.push({ name: 'No negative wallet balances', passed: negativeWallets.length === 0, detail: negativeWallets.length === 0 ? 'All balances non-negative' : `${negativeWallets.length} negative wallet(s)` });

    // 5 — All workspaces have credit wallets.
    const workspaces = await sr.entities.Workspace.list('-created_date', 500);
    const walletWsIds = new Set(wallets.map((w) => w.workspace_id));
    const wsWithoutWallets = workspaces.filter((w) => !walletWsIds.has(w.id));
    checks.push({ name: 'All workspaces have wallets', passed: wsWithoutWallets.length === 0, detail: wsWithoutWallets.length === 0 ? 'Wallet coverage complete' : `${wsWithoutWallets.length} workspace(s) missing wallets` });

    // 6 — All workspaces have active owners.
    const ownerMemberships = await sr.entities.WorkspaceMembership.filter({ role: 'owner', status: 'active' }, '-created_date', 500);
    const ownerWsIds = new Set(ownerMemberships.map((m) => m.workspace_id));
    const wsWithoutOwners = workspaces.filter((w) => !ownerWsIds.has(w.id));
    checks.push({ name: 'All workspaces have owners', passed: wsWithoutOwners.length === 0, detail: wsWithoutOwners.length === 0 ? 'Owner coverage complete' : `${wsWithoutOwners.length} workspace(s) without owners` });

    // 7 — No unresolved RLS events.
    const unresolvedRls = await sr.entities.RlsEvent.filter({ resolved: false }, '-created_date', 100);
    checks.push({ name: 'No unresolved RLS events', passed: unresolvedRls.length === 0, detail: unresolvedRls.length === 0 ? 'All RLS events resolved' : `${unresolvedRls.length} unresolved` });

    // 8 — Audit logging is active.
    const recentLogs = await sr.entities.AuditLog.list('-created_date', 1);
    checks.push({ name: 'Audit logging active', passed: recentLogs.length > 0, detail: recentLogs.length > 0 ? `Last: ${recentLogs[0].action}` : 'No audit entries' });

    // 9 — No orphaned ledger entries.
    const walletIds = new Set(wallets.map((w) => w.id));
    const ledgerEntries = await sr.entities.LedgerEntry.list('-created_date', 100);
    const orphanedLedger = ledgerEntries.filter((l) => l.wallet_id && !walletIds.has(l.wallet_id));
    checks.push({ name: 'No orphaned ledger entries', passed: orphanedLedger.length === 0, detail: orphanedLedger.length === 0 ? 'All entries reference valid wallets' : `${orphanedLedger.length} orphaned` });

    // 10 — No active subs on suspended workspaces.
    const suspendedWs = workspaces.filter((w) => w.status === 'suspended');
    const suspendedIds = new Set(suspendedWs.map((w) => w.id));
    const allSubs = await sr.entities.Subscription.list('-created_date', 500);
    const activeSubsOnSuspended = allSubs.filter((s) => suspendedIds.has(s.workspace_id) && s.status === 'active');
    checks.push({ name: 'No active subs on suspended workspaces', passed: activeSubsOnSuspended.length === 0, detail: activeSubsOnSuspended.length === 0 ? 'Clean' : `${activeSubsOnSuspended.length} conflict(s)` });

    // === SYSTEM METRICS ===

    const activeSubs = allSubs.filter((s) => s.status === 'active');
    const trialingSubs = allSubs.filter((s) => s.status === 'trialing');
    const pastDueSubs = allSubs.filter((s) => s.status === 'past_due');
    const canceledSubs = allSubs.filter((s) => s.status === 'canceled');

    const planBreakdown = {};
    for (const s of activeSubs) {
      planBreakdown[s.plan] = (planBreakdown[s.plan] || 0) + 1;
    }

    const totalCredits = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);
    const zeroBalanceWallets = wallets.filter((w) => (w.balance || 0) === 0).length;

    const properties = await sr.entities.Property.list('-created_date', 500);
    const listings = await sr.entities.MarketplaceListing.filter({ status: 'active' }, '-created_date', 500);
    const contacts = await sr.entities.Contact.list('-created_date', 500);
    const projects = await sr.entities.ConstructionProject.list('-created_date', 500);

    // Recent activity (last 24h).
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const recentAudit = await sr.entities.AuditLog.filter({}, '-created_date', 500);
    const auditLast24h = recentAudit.filter((l) => l.created_date && l.created_date >= yesterday).length;

    metrics.workspaces = workspaces.length;
    metrics.activeWorkspaces = workspaces.filter((w) => w.status === 'active').length;
    metrics.subscriptions = { active: activeSubs.length, trialing: trialingSubs.length, pastDue: pastDueSubs.length, canceled: canceledSubs.length };
    metrics.planBreakdown = planBreakdown;
    metrics.totalCredits = totalCredits;
    metrics.walletCount = wallets.length;
    metrics.zeroBalanceWallets = zeroBalanceWallets;
    metrics.properties = properties.length;
    metrics.activeListings = listings.length;
    metrics.contacts = contacts.length;
    metrics.projects = projects.length;
    metrics.auditLast24h = auditLast24h;
    metrics.unresolvedRls = unresolvedRls.length;

    const passed = checks.filter((c) => c.passed).length;
    const total = checks.length;

    return Response.json({
      overall: passed === total ? 'ready' : 'blocked',
      passed,
      total,
      checks,
      metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.log('launchMonitor error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});