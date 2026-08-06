import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Invites a user to a workspace and creates a membership record.
// Uses the service role to bypass the WorkspaceMembership RLS
// (which only allows platform admins to create memberships).
// Verifies the caller is an owner/admin of the workspace first.

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const workspaceId = (body.workspace_id || '').toString().trim();
    const email = (body.email || '').toString().trim().toLowerCase();
    const memberRole = (body.role || 'member').toString().trim();

    if (!workspaceId || !email) {
      return Response.json({ error: 'workspace_id and email are required' }, { status: 400 });
    }

    const validRoles = ['admin', 'manager', 'member', 'finance', 'contractor', 'agent', 'viewer'];
    if (!validRoles.includes(memberRole)) {
      return Response.json({ error: 'Invalid role' }, { status: 400 });
    }

    const sr = base44.asServiceRole;

    // Verify caller is an owner or admin of this workspace.
    const memberships = await sr.entities.WorkspaceMembership.filter({
      workspace_id: workspaceId, user_id: user.id, status: 'active',
    });
    if (!memberships.length) {
      return Response.json({ error: 'Forbidden — not a member of this workspace' }, { status: 403 });
    }
    const callerRole = memberships[0].role;
    if (callerRole !== 'owner' && callerRole !== 'admin') {
      return Response.json({ error: 'Only workspace owners and admins can invite members' }, { status: 403 });
    }

    // Check for existing membership (prevent duplicates).
    const existing = await sr.entities.WorkspaceMembership.filter({
      workspace_id: workspaceId, user_id: email,
    });
    if (existing && existing.length) {
      return Response.json({ error: 'This user has already been invited or added' }, { status: 409 });
    }

    // Invite the user to the Base44 app (sends registration email if not yet registered).
    await base44.users.inviteUser(email, 'user');

    // Create the workspace membership with the service role.
    // user_id stores the email temporarily — when the invited user registers
    // and logs in, a follow-up process can link their actual user ID.
    const membership = await sr.entities.WorkspaceMembership.create({
      workspace_id: workspaceId,
      user_id: email,
      role: memberRole,
      status: 'invited',
    });

    await sr.entities.AuditLog.create({
      workspace_id: workspaceId,
      actor_id: user.id,
      action: 'member.invited',
      target_type: 'workspace_membership',
      target_id: membership.id,
      metadata: { email, role: memberRole },
    });

    return Response.json({ ok: true, membership });
  } catch (error) {
    console.log('inviteWorkspaceMember error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}