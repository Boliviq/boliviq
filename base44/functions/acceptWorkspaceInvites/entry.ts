import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Activates any pending workspace invitations for the signed-in user.
//
// inviteWorkspaceMember creates a WorkspaceMembership with status:'invited'
// and user_id set to the invitee's email (a placeholder, since the invitee
// may not have a Base44 user id yet). Nothing previously converted that
// placeholder into a real, active membership once the invitee registered
// and logged in — so invited teammates could never actually gain access.
// This function is meant to be called once per session (e.g. from
// WorkspaceProvider's load) right after auth resolves; it is a safe no-op
// when the user has no pending invites.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const email = (user.email || '').toString().trim().toLowerCase();
    if (!email) return Response.json({ ok: true, activated: 0 });

    const sr = base44.asServiceRole;
    const pending = await sr.entities.WorkspaceMembership.filter({ user_id: email, status: 'invited' });

    let activated = 0;
    for (const invite of pending) {
      // Don't clobber an existing active membership for this user in the same workspace.
      const already = await sr.entities.WorkspaceMembership.filter({
        workspace_id: invite.workspace_id, user_id: user.id, status: 'active',
      });
      if (already.length) {
        await sr.entities.WorkspaceMembership.update(invite.id, { status: 'revoked' });
        continue;
      }
      await sr.entities.WorkspaceMembership.update(invite.id, { user_id: user.id, status: 'active' });
      await sr.entities.AuditLog.create({
        workspace_id: invite.workspace_id, actor_id: user.id, action: 'member.invite_accepted',
        target_type: 'workspace_membership', target_id: invite.id, metadata: { email },
      });
      activated++;
    }

    return Response.json({ ok: true, activated });
  } catch (error) {
    console.log('acceptWorkspaceInvites error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
