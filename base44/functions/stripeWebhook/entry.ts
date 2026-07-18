import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import Stripe from 'npm:stripe@17.4.0';

const CATALOG = {
  'price_1Tueo3Ln5267sZgIfFl7UJyL': { plan: 'beginner' },
  'price_1Tueo3Ln5267sZgIdCh7kPNB': { plan: 'professional' },
  'price_1Tueo3Ln5267sZgIy5W6GwdA': { plan: 'team' },
  'price_1Tueo3Ln5267sZgILUU6ajRe': { plan: 'professional_ai_max' },
  'price_1Tueo3Ln5267sZgIQeh80Ww8': { plan: 'team_ai_max' },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature') || '';
    const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(rawBody, signature, secret);
    } catch (err) {
      return Response.json({ error: 'Invalid signature: ' + err.message }, { status: 400 });
    }

    const sr = base44.asServiceRole;

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const workspaceId = session.metadata && session.metadata.workspace_id;
      if (!workspaceId) return Response.json({ received: true });

      if (session.mode === 'subscription') {
        const plan = session.metadata && session.metadata.plan;
        const subId = session.subscription;
        const existing = await sr.entities.Subscription.filter({ workspace_id: workspaceId });
        const data = {
          workspace_id: workspaceId, plan, status: 'active', billing_source: 'stripe',
          stripe_subscription_id: subId, seats: 1, cancel_at_period_end: false,
        };
        if (existing && existing[0]) await sr.entities.Subscription.update(existing[0].id, data);
        else await sr.entities.Subscription.create(data);
        await sr.entities.Workspace.update(workspaceId, { plan, billing_source: 'stripe', subscription_id: subId });
        await sr.entities.AuditLog.create({
          workspace_id: workspaceId, actor_id: (session.metadata && session.metadata.user_id) || 'system',
          action: 'subscription.activated', target_type: 'subscription', target_id: subId, metadata: { plan },
        });
      } else if (session.mode === 'payment') {
        const credits = Number((session.metadata && session.metadata.credits) || 0);
        if (credits > 0) {
          const wallets = await sr.entities.CreditWallet.filter({ workspace_id: workspaceId });
          const wallet = wallets[0];
          if (wallet) {
            const newBalance = (wallet.balance || 0) + credits;
            await sr.entities.CreditWallet.update(wallet.id, { balance: newBalance });
            await sr.entities.LedgerEntry.create({
              workspace_id: workspaceId, wallet_id: wallet.id, delta: credits, type: 'pack_purchase',
              reference: session.id, idempotency_key: 'cs_' + session.id, balance_after: newBalance,
            });
          }
          await sr.entities.AuditLog.create({
            workspace_id: workspaceId, actor_id: (session.metadata && session.metadata.user_id) || 'system',
            action: 'credit_pack.purchased', target_type: 'credit_wallet', target_id: wallet ? wallet.id : null,
            metadata: { credits },
          });
        }
      }
    } else if (event.type === 'customer.subscription.updated') {
      const sub = event.data.object;
      const subs = await sr.entities.Subscription.filter({ stripe_subscription_id: sub.id });
      if (subs && subs[0]) {
        const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString().slice(0, 10) : undefined;
        const update = { status: sub.status, cancel_at_period_end: sub.cancel_at_period_end };
        if (periodEnd) update.current_period_end = periodEnd;
        await sr.entities.Subscription.update(subs[0].id, update);
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const subs = await sr.entities.Subscription.filter({ stripe_subscription_id: sub.id });
      if (subs && subs[0]) {
        await sr.entities.Subscription.update(subs[0].id, { status: 'canceled' });
        await sr.entities.Workspace.update(subs[0].workspace_id, { plan: 'free' });
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.log('stripeWebhook error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});