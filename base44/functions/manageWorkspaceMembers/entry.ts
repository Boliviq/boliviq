import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Lists, re-roles, or revokes workspace members.
// Uses the service role to bypass the WorkspaceMembership RLS (which only
// allows platform admins to read/write directly), after verifying the
// caller's actual workspace role in code — same pattern as inviteWorkspaceMember.
//
// Actions:
//   list        — any active member of the workspace can see the roster.
//   update_role — only owner/admin callers. Cannot assign 'owner' or
//                 'platform_admin' (those are not grantable through invite/re-role),
//                 and cannot change the workspace's last remaining active owner.
//   remove      — only owner/admin callers. Soft-deletes (status: 'revoked').
//                 Cannot remove the workspace's last remaining active owner.

const ASSIGNABLE_ROLES = ['admin', 'manager', 'member', 'finance', 'contractor', 'agent', 'viewer'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const workspaceId = (body.workspace_id || '').toString().trim();
    const action = (body.action || 'list').toString().trim();
    if (!workspaceId) return Response.json({ error: 'workspace_id is required' }, { status: 400 });

    const sr = base44.asServiceRole;
    const callerMemberships = await sr.entities.WorkspaceMembership.filter({
      workspace_id: workspaceId, user_id: user.id, status: 'active',
    });
    if (!callerMemberships.length) {
      return Response.json({ error: 'Forbidden — not a member of this workspace' }, { status: 403 });
    }
    const callerRole = callerMemberships[0].role;
    const callerIsAdmin = callerRole === 'owner' || callerRole === 'admin';

    if (action === 'list') {
      // Workspace and AuditLog RLS are creator-only / platform-admin-only respectively,
      // so a non-creator owner/admin/member can't read them directly from the client —
      // return them here (already membership-checked) alongside the roster.
      const [members, workspaces, audit] = await Promise.all([
        sr.entities.WorkspaceMembership.filter({ workspace_id: workspaceId }, 'created_date', 200),
        sr.entities.Workspace.filter({ id: workspaceId }),
        sr.entities.AuditLog.filter({ workspace_id: workspaceId }, '-created_date', 50),
      ]);
      return Response.json({ ok: true, members, workspace: workspaces[0] || null, audit });
    }

    if (!callerIsAdmin) {
      return Response.json({ error: 'Only workspace owners and admins can manage members' }, { status: 403 });
    }

    const memberId = (body.member_id || '').toString().trim();
    if (!memberId) return Response.json({ error: 'member_id is required' }, { status: 400 });

    const target = await sr.entities.WorkspaceMembership.get(memberId);
    if (!target || target.workspace_id !== workspaceId) {
      return Response.json({ error: 'Member not found in this workspace' }, { status: 404 });
    }

    if (target.role === 'owner') {
      const owners = await sr.entities.WorkspaceMembership.filter({
        workspace_id: workspaceId, role: 'owner', status: 'active',
      });
      if (owners.length <= 1) {
        return Response.json({ error: 'Cannot remove or re-role the workspace\'s last remaining owner' }, { status: 400 });
      }
    }

    if (action === 'update_role') {
      const newRole = (body.role || '').toString().trim();
      if (!ASSIGNABLE_ROLES.includes(newRole)) {
        return Response.json({ error: 'Invalid role' }, { status: 400 });
      }
      await sr.entities.WorkspaceMembership.update(memberId, { role: newRole });
      await sr.entities.AuditLog.create({
        workspace_id: workspaceId, actor_id: user.id, action: 'member.role_changed',
        target_type: 'workspace_membership', target_id: memberId,
        metadata: { from: target.role, to: newRole, member_user_id: target.user_id },
      });
      return Response.json({ ok: true });
    }

    if (action === 'remove') {
      await sr.entities.WorkspaceMembership.update(memberId, { status: 'revoked' });
      await sr.entities.AuditLog.create({
        workspace_id: workspaceId, actor_id: user.id, action: 'member.removed',
        target_type: 'workspace_membership', target_id: memberId,
        metadata: { role: target.role, member_user_id: target.user_id },
      });
      return Response.json({ ok: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.log('manageWorkspaceMembers error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
