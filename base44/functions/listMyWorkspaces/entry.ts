import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Returns the Workspace records the signed-in user has an active membership
// in. Workspace RLS is created_by_id-only (or platform admin), so an invited
// teammate who isn't the workspace's creator can never read the Workspace
// record directly — even though they have a real, active WorkspaceMembership.
// Without this, the /workspaces switcher shows "you don't belong to any
// workspaces yet" for every invited teammate.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const sr = base44.asServiceRole;
    const memberships = await sr.entities.WorkspaceMembership.filter({ user_id: user.id, status: 'active' });
    const workspaceIds = Array.from(new Set(memberships.map((m) => m.workspace_id))).filter(Boolean);

    let workspaces = [];
    if (workspaceIds.length) {
      workspaces = await sr.entities.Workspace.filter({ id: { $in: workspaceIds } });
    }

    return Response.json({ ok: true, memberships, workspaces });
  } catch (error) {
    console.log('listMyWorkspaces error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
