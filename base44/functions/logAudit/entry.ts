import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = (body.action || '').toString().trim();
    const workspaceId = (body.workspace_id || '').toString().trim();
    if (!action || !workspaceId) {
      return Response.json({ error: 'action and workspace_id are required' }, { status: 400 });
    }

    const memberships = await base44.asServiceRole.entities.WorkspaceMembership.filter({
      workspace_id: workspaceId,
      user_id: user.id,
      status: 'active',
    });
    if (!memberships || memberships.length === 0) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const entry = { workspace_id: workspaceId, actor_id: user.id, action };
    if (body.target_type) entry.target_type = body.target_type;
    if (body.target_id) entry.target_id = body.target_id;
    if (body.metadata) entry.metadata = body.metadata;

    await base44.asServiceRole.entities.AuditLog.create(entry);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});