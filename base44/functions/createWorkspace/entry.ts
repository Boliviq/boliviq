import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const name = (body.name || '').toString().trim();
    if (!name) return Response.json({ error: 'Workspace name is required' }, { status: 400 });

    const slug = (body.slug || name)
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const workspace = await base44.asServiceRole.entities.Workspace.create({
      name,
      slug,
      owner_id: user.id,
      plan: 'free',
      status: 'active',
      billing_source: 'owner_grant',
    });

    const membership = await base44.asServiceRole.entities.WorkspaceMembership.create({
      workspace_id: workspace.id,
      user_id: user.id,
      role: 'owner',
      status: 'active',
    });

    await base44.asServiceRole.entities.Subscription.create({
      workspace_id: workspace.id,
      plan: 'free',
      status: 'active',
      billing_source: 'owner_grant',
      seats: 1,
    });

    await base44.asServiceRole.entities.CreditWallet.create({
      workspace_id: workspace.id,
      balance: 0,
      reserved: 0,
    });

    await base44.asServiceRole.entities.AuditLog.create({
      workspace_id: workspace.id,
      actor_id: user.id,
      action: 'workspace.created',
      target_type: 'workspace',
      target_id: workspace.id,
      metadata: { name },
    });

    return Response.json({ workspace, membership });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});