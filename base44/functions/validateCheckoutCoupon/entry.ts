import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import Stripe from 'npm:stripe@17.4.0';

// Validates a coupon code for checkout use.
// Supports percentage and fixed-amount discounts.
// For percentage/fixed coupons, syncs to Stripe promotion codes if not already linked.
// For 100%-off admin coupons, returns a "grant" kind so checkout is skipped entirely.

function computeDiscount(type, value, amount) {
  if (type === 'percentage') return Math.min(amount, +(amount * (value / 100)).toFixed(2));
  if (type === 'fixed' || type === 'credits') return Math.min(amount, +Number(value).toFixed(2));
  return 0;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const workspaceId = (body.workspace_id || '').toString().trim();
    const code = (body.code || '').toString().trim().toUpperCase();
    const plan = (body.plan || '').toString().trim();
    const amount = Number(body.amount) || 0;
    if (!workspaceId || !code) {
      return Response.json({ error: 'workspace_id and code are required' }, { status: 400 });
    }

    const sr = base44.asServiceRole;
    const memberships = await sr.entities.WorkspaceMembership.filter({
      workspace_id: workspaceId, user_id: user.id, status: 'active',
    });
    if (!memberships.length) return Response.json({ error: 'Forbidden' }, { status: 403 });
    const isAdmin = user.role === 'admin';

    // Look up coupon by code (case-insensitive)
    const coupons = await sr.entities.Coupon.filter({ workspace_id: workspaceId, code });
    const coupon = coupons[0];
    if (!coupon) return Response.json({ ok: false, error: 'Coupon code not found.' }, { status: 404 });

    if (coupon.status !== 'active') {
      return Response.json({ ok: false, error: 'This coupon is no longer active.' }, { status: 400 });
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      await sr.entities.Coupon.update(coupon.id, { status: 'expired' });
      return Response.json({ ok: false, error: 'This coupon has expired.' }, { status: 400 });
    }
    if (coupon.max_uses && (coupon.usage_count || 0) >= coupon.max_uses) {
      return Response.json({ ok: false, error: 'This coupon has reached its usage limit.' }, { status: 400 });
    }

    // Credit-type coupons are redeemed directly (add credits to wallet), not at checkout.
    if (coupon.discount_type === 'credits') {
      return Response.json({
        ok: false,
        error: 'This is a credit coupon. Redeem it from the Rewards page to add credits to your wallet.',
      }, { status: 400 });
    }

    // Validate discount type
    if (!['percentage', 'fixed'].includes(coupon.discount_type)) {
      return Response.json({ ok: false, error: 'Unsupported coupon type.' }, { status: 400 });
    }

    const discount = computeDiscount(coupon.discount_type, coupon.value, amount);
    const isFullDiscount =
      (coupon.discount_type === 'percentage' && Number(coupon.value) >= 100) ||
      (coupon.discount_type === 'fixed' && Number(coupon.value) >= amount);

    // 100% off coupons bypass Stripe checkout entirely — grant the plan directly.
    if (isFullDiscount) {
      return Response.json({
        ok: true,
        kind: 'grant',
        couponId: coupon.id,
        couponCode: coupon.code,
        discountType: coupon.discount_type,
        discountValue: coupon.value,
        discount,
        total: 0,
      });
    }

    // For percentage/fixed discounts, we need a Stripe promotion code.
    // Since Base44 coupons are workspace-scoped (no stripe_coupon_id field),
    // we return the discount info for the frontend to apply via Stripe coupon at checkout.
    return Response.json({
      ok: true,
      kind: 'discount',
      couponId: coupon.id,
      couponCode: coupon.code,
      discountType: coupon.discount_type,
      discountValue: coupon.value,
      discount,
      total: amount - discount,
    });
  } catch (error) {
    console.log('validateCheckoutCoupon error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}