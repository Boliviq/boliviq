import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Generic workspace-scoped CRUD for the shared CRM/marketplace/construction
// entities. Their RLS restricts read/write to created_by_id === user (or a
// platform admin) — there is no verified way to express "any active member
// of this record's workspace" as a declarative Base44 RLS rule, so teammates
// invited to a workspace cannot see records another member created. This
// function moves that access behind a code-level workspace-membership check
// using the service role, the same pattern already used by
// chargeCredits/getBillingState/manageWorkspaceMembers/manageCoupons.
//
// Actions:
//   list   — any active member of the workspace.
//   get    — any active member; 404s (not 403) if the record belongs to a
//            different workspace, to avoid confirming record existence.
//   create — any active member. workspace_id/created_by_id/id in the
//            submitted data are ignored — always set server-side.
//   update — any active member (this is the collaborative editing Team plans
//            are sold on — any teammate can update a shared record).
//   delete — only the record's creator or a workspace owner/admin.

const ENTITIES = new Set(['Property', 'Contact', 'ConstructionProject', 'ConstructionTask', 'MarketplaceListing', 'BuyBox']);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const entity = (body.entity || '').toString().trim();
    const action = (body.action || 'list').toString().trim();
    const workspaceId = (body.workspace_id || '').toString().trim();

    if (!ENTITIES.has(entity)) return Response.json({ error: 'Unsupported entity' }, { status: 400 });
    if (!workspaceId) return Response.json({ error: 'workspace_id is required' }, { status: 400 });

    const sr = base44.asServiceRole;
    const memberships = await sr.entities.WorkspaceMembership.filter({
      workspace_id: workspaceId, user_id: user.id, status: 'active',
    });
    if (!memberships.length) return Response.json({ error: 'Forbidden — not a member of this workspace' }, { status: 403 });
    const callerRole = memberships[0].role;
    const callerIsAdmin = callerRole === 'owner' || callerRole === 'admin';

    const Model = sr.entities[entity];

    if (action === 'list') {
      const extraFilter = (body.filter && typeof body.filter === 'object') ? body.filter : {};
      const records = await Model.filter(
        { ...extraFilter, workspace_id: workspaceId },
        body.sort || '-updated_date',
        Math.min(Number(body.limit) || 200, 500),
      );
      return Response.json({ ok: true, records });
    }

    if (action === 'get') {
      const id = (body.id || '').toString().trim();
      if (!id) return Response.json({ error: 'id is required' }, { status: 400 });
      const record = await Model.get(id).catch(() => null);
      if (!record || record.workspace_id !== workspaceId) {
        return Response.json({ error: 'Not found' }, { status: 404 });
      }
      return Response.json({ ok: true, record });
    }

    if (action === 'create') {
      const data = (body.data && typeof body.data === 'object') ? { ...body.data } : {};
      delete data.workspace_id; delete data.created_by_id; delete data.id;
      const record = await Model.create({ ...data, workspace_id: workspaceId, created_by_id: user.id });
      return Response.json({ ok: true, record });
    }

    if (action === 'update' || action === 'delete') {
      const id = (body.id || '').toString().trim();
      if (!id) return Response.json({ error: 'id is required' }, { status: 400 });
      const existing = await Model.get(id).catch(() => null);
      if (!existing || existing.workspace_id !== workspaceId) {
        return Response.json({ error: 'Not found' }, { status: 404 });
      }

      if (action === 'delete') {
        const isCreator = existing.created_by_id === user.id;
        if (!isCreator && !callerIsAdmin) {
          return Response.json({ error: 'Only the creator or a workspace owner/admin can delete this record' }, { status: 403 });
        }
        await Model.delete(id);
        return Response.json({ ok: true });
      }

      const data = (body.data && typeof body.data === 'object') ? { ...body.data } : {};
      delete data.workspace_id; delete data.created_by_id; delete data.id;
      const record = await Model.update(id, data);
      return Response.json({ ok: true, record });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.log('workspaceRecords error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
