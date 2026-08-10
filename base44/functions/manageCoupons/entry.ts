import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Lists or creates workspace-scoped Coupons.
// Coupon RLS is platform-admin-only (same pattern as CreditWallet/Subscription),
// so this uses the service role after verifying the caller's actual workspace
// role in code — consistent with redeemCoupon/validateCheckoutCoupon.
//
// Actions:
//   list   — any active member of the workspace can see its coupons.
//   create — only owner/admin callers.

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
    const memberships = await sr.entities.WorkspaceMembership.filter({
      workspace_id: workspaceId, user_id: user.id, status: 'active',
    });
    if (!memberships.length) return Response.json({ error: 'Forbidden' }, { status: 403 });

    if (action === 'list') {
      const coupons = await sr.entities.Coupon.filter({ workspace_id: workspaceId }, '-created_date', 50);
      return Response.json({ ok: true, coupons });
    }

    if (action === 'create') {
      const role = memberships[0].role;
      if (role !== 'owner' && role !== 'admin') {
        return Response.json({ error: 'Only workspace owners and admins can create coupons' }, { status: 403 });
      }

      const code = (body.code || '').toString().trim().toUpperCase();
      const discountType = (body.discount_type || 'credits').toString().trim();
      const value = Number(body.value) || 0;
      const maxUses = body.max_uses != null ? Number(body.max_uses) : undefined;
      const expiresAt = body.expires_at || undefined;
      const description = (body.description || '').toString().trim() || undefined;

      if (!code) return Response.json({ error: 'code is required' }, { status: 400 });
      if (!['credits', 'percent'].includes(discountType)) {
        return Response.json({ error: 'discount_type must be "credits" or "percent"' }, { status: 400 });
      }
      if (value <= 0) return Response.json({ error: 'value must be greater than 0' }, { status: 400 });

      const existing = await sr.entities.Coupon.filter({ workspace_id: workspaceId, code });
      if (existing && existing.length) {
        return Response.json({ error: 'A coupon with this code already exists' }, { status: 409 });
      }

      const coupon = await sr.entities.Coupon.create({
        workspace_id: workspaceId, code, discount_type: discountType, value,
        status: 'active', max_uses: maxUses, usage_count: 0, expires_at: expiresAt, description,
      });
      await sr.entities.AuditLog.create({
        workspace_id: workspaceId, actor_id: user.id, action: 'coupon.created',
        target_type: 'coupon', target_id: coupon.id, metadata: { code, discount_type: discountType, value },
      });
      return Response.json({ ok: true, coupon });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.log('manageCoupons error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
