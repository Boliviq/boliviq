import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const workspaceId = (body.workspace_id || '').toString().trim();
    if (!workspaceId) return Response.json({ error: 'workspace_id is required' }, { status: 400 });

    const memberships = await base44.asServiceRole.entities.WorkspaceMembership.filter({
      workspace_id: workspaceId, user_id: user.id, status: 'active',
    });
    if (!memberships.length) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const sr = base44.asServiceRole;
    const subscriptions = await sr.entities.Subscription.filter({ workspace_id: workspaceId });
    const wallets = await sr.entities.CreditWallet.filter({ workspace_id: workspaceId });
    const entitlements = await sr.entities.Entitlement.filter({ workspace_id: workspaceId });
    const ledger = await sr.entities.LedgerEntry.filter({ workspace_id: workspaceId }, '-created_date', 10);

    return Response.json({
      subscription: subscriptions[0] || null,
      wallet: wallets[0] || null,
      entitlements,
      ledger,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});