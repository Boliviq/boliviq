import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const workspaceId = (body.workspace_id || '').toString().trim();
    const code = (body.code || '').toString().trim().toUpperCase();
    if (!workspaceId || !code) {
      return Response.json({ error: 'workspace_id and code are required' }, { status: 400 });
    }

    const sr = base44.asServiceRole;
    const memberships = await sr.entities.WorkspaceMembership.filter({
      workspace_id: workspaceId, user_id: user.id, status: 'active',
    });
    if (!memberships.length) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const coupons = await sr.entities.Coupon.filter({ workspace_id: workspaceId, code });
    const coupon = coupons[0];
    if (!coupon) return Response.json({ error: 'Invalid coupon code' }, { status: 404 });
    if (coupon.status !== 'active') return Response.json({ error: 'Coupon no longer active' }, { status: 400 });
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      await sr.entities.Coupon.update(coupon.id, { status: 'expired' });
      return Response.json({ error: 'Coupon has expired' }, { status: 400 });
    }
    if (coupon.max_uses && (coupon.usage_count || 0) >= coupon.max_uses) {
      return Response.json({ error: 'Coupon usage limit reached' }, { status: 400 });
    }
    if (coupon.discount_type !== 'credits') {
      return Response.json({ error: 'Only credit coupons are redeemable here. Percent coupons apply at checkout.' }, { status: 400 });
    }

    const amount = Number(coupon.value) || 0;
    if (amount <= 0) return Response.json({ error: 'Coupon has no credit value' }, { status: 400 });

    const wallets = await sr.entities.CreditWallet.filter({ workspace_id: workspaceId });
    const wallet = wallets[0];
    if (!wallet) return Response.json({ error: 'No credit wallet found' }, { status: 404 });

    const newBalance = (wallet.balance || 0) + amount;
    await sr.entities.CreditWallet.update(wallet.id, { balance: newBalance });
    const newUsage = (coupon.usage_count || 0) + 1;
    const reached = coupon.max_uses && newUsage >= coupon.max_uses;
    await sr.entities.Coupon.update(coupon.id, {
      usage_count: newUsage,
      status: reached ? 'redeemed' : 'active',
    });
    await sr.entities.LedgerEntry.create({
      workspace_id: workspaceId, wallet_id: wallet.id, delta: amount, type: 'adjustment',
      reference: `coupon:${code}`, balance_after: newBalance,
    });
    await sr.entities.AuditLog.create({
      workspace_id: workspaceId, actor_id: user.id, action: 'coupon.redeemed',
      target_type: 'coupon', target_id: coupon.id,
      metadata: { code, amount, balance_after: newBalance },
    });

    return Response.json({ ok: true, balance: newBalance, credits: amount });
  } catch (error) {
    console.log('redeemCoupon error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});