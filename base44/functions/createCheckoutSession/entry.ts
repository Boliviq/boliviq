import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import Stripe from 'npm:stripe@17.4.0';

const CATALOG = {
  'price_1Tueo3Ln5267sZgIfFl7UJyL': { plan: 'beginner', mode: 'subscription' },
  'price_1Tueo3Ln5267sZgIdCh7kPNB': { plan: 'professional', mode: 'subscription' },
  'price_1Tueo3Ln5267sZgIy5W6GwdA': { plan: 'team', mode: 'subscription' },
  'price_1Tueo3Ln5267sZgILUU6ajRe': { plan: 'professional_ai_max', mode: 'subscription' },
  'price_1Tueo3Ln5267sZgIQeh80Ww8': { plan: 'team_ai_max', mode: 'subscription' },
  'price_1Tueo3Ln5267sZgI6xc526py': { plan: null, mode: 'payment', credits: 500 },
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
    const session = await stripe.checkout.sessions.create({
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
        ...(item.credits ? { credits: String(item.credits) } : {}),
      },
      ...(item.mode === 'subscription' ? {
        subscription_data: { metadata: { workspace_id: workspaceId, plan: item.plan, base44_app_id: Deno.env.get('BASE44_APP_ID') } },
      } : {}),
    });

    await base44.asServiceRole.entities.AuditLog.create({
      workspace_id: workspaceId, actor_id: user.id, action: 'checkout.session.created',
      target_type: 'price', target_id: priceId, metadata: { session_id: session.id },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.log('createCheckoutSession error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});