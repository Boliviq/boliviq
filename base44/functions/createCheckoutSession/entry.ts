import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import Stripe from 'npm:stripe@17.4.0';

// 2026 pricing — price_id -> { plan, mode, interval?, tokens? }
const CATALOG = {
  // Homeowner + AI
  'price_1Tv06uGIUtciLaIv1f90LIQP': { plan: 'homeowner_ai', mode: 'subscription', interval: 'month' },
  'price_1Tv06tGIUtciLaIvzJ4cl5nG': { plan: 'homeowner_ai', mode: 'subscription', interval: 'year' },
  // Professional
  'price_1TuhKaGIUtciLaIvAwSZsSS5': { plan: 'professional', mode: 'subscription', interval: 'month' },
  'price_1TuhKaGIUtciLaIvIpxDOqkj': { plan: 'professional', mode: 'subscription', interval: 'year' },
  // Team Professional
  'price_1TuhKaGIUtciLaIvVcu8PYcC': { plan: 'team_professional', mode: 'subscription', interval: 'month' },
  'price_1TuhKaGIUtciLaIvILXy4Psw': { plan: 'team_professional', mode: 'subscription', interval: 'year' },
  // Professional + AI
  'price_1TuhKaGIUtciLaIvIWw93Wci': { plan: 'professional_ai', mode: 'subscription', interval: 'month' },
  'price_1TuhKaGIUtciLaIvZTsKam5b': { plan: 'professional_ai', mode: 'subscription', interval: 'year' },
  // Team Professional + AI
  'price_1TuhKaGIUtciLaIvMhfR2oie': { plan: 'team_professional_ai', mode: 'subscription', interval: 'month' },
  'price_1TuhKaGIUtciLaIvmdlYKLNn': { plan: 'team_professional_ai', mode: 'subscription', interval: 'year' },
  // Professional AI Unlimited
  'price_1TuhKaGIUtciLaIvrsEpadrz': { plan: 'professional_ai_unlimited', mode: 'subscription', interval: 'month' },
  'price_1TuhKaGIUtciLaIvIVidXRIC': { plan: 'professional_ai_unlimited', mode: 'subscription', interval: 'year' },
  // Team AI Unlimited
  'price_1TuhKaGIUtciLaIvCHMv8mKB': { plan: 'team_ai_unlimited', mode: 'subscription', interval: 'month' },
  'price_1TuhKaGIUtciLaIvHs6J4o9l': { plan: 'team_ai_unlimited', mode: 'subscription', interval: 'year' },
  // Token packs (one-time)
  'price_1TuivvGIUtciLaIvjbZLSNyr': { plan: null, mode: 'payment', tokens: 5000 },
  'price_1TuivvGIUtciLaIvxGRlnFg9': { plan: null, mode: 'payment', tokens: 15000 },
  'price_1TuivvGIUtciLaIvUXBwho8Y': { plan: null, mode: 'payment', tokens: 50000 },
  // Legacy prices (preserved for existing subscriptions)
  'price_1Tueo3Ln5267sZgIfFl7UJyL': { plan: 'professional_ai', mode: 'subscription', legacy: true },
  'price_1Tueo3Ln5267sZgIdCh7kPNB': { plan: 'professional_ai', mode: 'subscription', legacy: true },
  'price_1Tueo3Ln5267sZgIy5W6GwdA': { plan: 'team_professional_ai', mode: 'subscription', legacy: true },
  'price_1Tueo3Ln5267sZgILUU6ajRe': { plan: 'professional_ai_unlimited', mode: 'subscription', legacy: true },
  'price_1Tueo3Ln5267sZgIQeh80Ww8': { plan: 'team_ai_unlimited', mode: 'subscription', legacy: true },
  'price_1Tueo3Ln5267sZgI6xc526py': { plan: null, mode: 'payment', tokens: 500, legacy: true },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const workspaceId = (body.workspace_id || '').toString().trim();
    const priceId = (body.price_id || '').toString().trim();
    if (!workspaceId || !priceId) return Response.json({ error: 'workspace_id and price_id are required' }, { status: 400 });

    const item = CATALOG[priceId];
    if (!item) return Response.json({ error: 'Unknown price' }, { status: 400 });

    const memberships = await base44.asServiceRole.entities.WorkspaceMembership.filter({
      workspace_id: workspaceId, user_id: user.id, status: 'active',
    });
    if (!memberships.length) return Response.json({ error: 'Forbidden' }, { status: 403 });
    const role = memberships[0].role;
    if (role !== 'owner' && role !== 'admin') {
      return Response.json({ error: 'Only workspace owners/admins can manage billing' }, { status: 403 });
    }

    const workspace = await base44.asServiceRole.entities.Workspace.get(workspaceId);
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    let customerId = workspace.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name || workspace.name,
        metadata: { workspace_id: workspaceId, base44_app_id: Deno.env.get('BASE44_APP_ID') },
      });
      customerId = customer.id;
      await base44.asServiceRole.entities.Workspace.update(workspaceId, { stripe_customer_id: customerId, billing_source: 'stripe' });
    }

    const origin = req.headers.get('origin') || 'https://app.boliviq.com';
    const sessionOpts = {
      mode: item.mode,
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: origin + '/billing?status=success',
      cancel_url: origin + '/billing?status=cancel',
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        workspace_id: workspaceId,
        user_id: user.id,
        ...(item.plan ? { plan: item.plan } : {}),
        ...(item.tokens ? { tokens: String(item.tokens) } : {}),
        ...(item.interval ? { interval: item.interval } : {}),
      },
    };
    if (item.mode === 'subscription') {
      sessionOpts.subscription_data = {
        metadata: {
          workspace_id: workspaceId, plan: item.plan,
          interval: item.interval || 'month',
          base44_app_id: Deno.env.get('BASE44_APP_ID'),
        },
      };
    }
    const session = await stripe.checkout.sessions.create(sessionOpts);

    await base44.asServiceRole.entities.AuditLog.create({
      workspace_id: workspaceId, actor_id: user.id, action: 'checkout.session.created',
      target_type: 'price', target_id: priceId, metadata: { session_id: session.id, plan: item.plan, interval: item.interval },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.log('createCheckoutSession error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});