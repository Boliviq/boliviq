import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Phase 2 Foundation Hardening — verifies data integrity, wallet safety,
// and workspace completeness. Admin-only.

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

    // 1 — No negative wallet balances (concurrency safety net).
    const wallets = await sr.entities.CreditWallet.list('-created_date', 500);
    const negativeWallets = wallets.filter((w) => (w.balance || 0) < 0);
    checks.push({
      name: 'No negative wallet balances',
      passed: negativeWallets.length === 0,
      detail: negativeWallets.length === 0
        ? 'All wallets have non-negative balances'
        : `${negativeWallets.length} wallet(s) with negative balance`,
    });

    // 2 — Unresolved RLS denial events.
    const rlsEvents = await sr.entities.RlsEvent.filter({ resolved: false }, '-created_date', 100);
    checks.push({
      name: 'No unresolved RLS events',
      passed: rlsEvents.length === 0,
      detail: rlsEvents.length === 0
        ? 'All RLS events resolved'
        : `${rlsEvents.length} unresolved RLS event(s)`,
    });

    // 3 — Every workspace has a credit wallet.
    const workspaces = await sr.entities.Workspace.list('-created_date', 500);
    const walletWorkspaceIds = new Set(wallets.map((w) => w.workspace_id));
    const workspacesWithoutWallets = workspaces.filter((w) => !walletWorkspaceIds.has(w.id));
    checks.push({
      name: 'All workspaces have credit wallets',
      passed: workspacesWithoutWallets.length === 0,
      detail: workspacesWithoutWallets.length === 0
        ? 'All workspaces have wallets'
        : `${workspacesWithoutWallets.length} workspace(s) without wallets`,
    });

    // 4 — Every workspace has a subscription record.
    const allSubs = await sr.entities.Subscription.list('-created_date', 500);
    const subWorkspaceIds = new Set(allSubs.map((s) => s.workspace_id));
    const workspacesWithoutSubs = workspaces.filter((w) => !subWorkspaceIds.has(w.id));
    checks.push({
      name: 'All workspaces have subscriptions',
      passed: workspacesWithoutSubs.length === 0,
      detail: workspacesWithoutSubs.length === 0
        ? 'All workspaces have subscriptions'
        : `${workspacesWithoutSubs.length} workspace(s) without subscriptions`,
    });

    // 5 — Every workspace has an active owner membership.
    const ownerMemberships = await sr.entities.WorkspaceMembership.filter(
      { role: 'owner', status: 'active' }, '-created_date', 500
    );
    const ownerWorkspaceIds = new Set(ownerMemberships.map((m) => m.workspace_id));
    const workspacesWithoutOwners = workspaces.filter((w) => !ownerWorkspaceIds.has(w.id));
    checks.push({
      name: 'All workspaces have active owners',
      passed: workspacesWithoutOwners.length === 0,
      detail: workspacesWithoutOwners.length === 0
        ? 'All workspaces have owners'
        : `${workspacesWithoutOwners.length} workspace(s) without owners`,
    });

    // 6 — No orphaned ledger entries (wallet must exist).
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

    // 7 — No suspended workspaces with active subscriptions.
    const suspendedWs = workspaces.filter((w) => w.status === 'suspended');
    const suspendedIds = new Set(suspendedWs.map((w) => w.id));
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

    const passed = checks.filter((c) => c.passed).length;
    const total = checks.length;

    return Response.json({
      overall: passed === total ? 'healthy' : 'needs_attention',
      passed,
      total,
      checks,
      summary: {
        workspaces: workspaces.length,
        wallets: wallets.length,
        subscriptions: allSubs.length,
        rls_events_unresolved: rlsEvents.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.log('foundationHealth error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});