import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import Stripe from 'npm:stripe@17.4.0';

// 2026 pricing — price_id -> { plan, mode, tokens?, annual? }
const CATALOG = {
  'price_1Tv06uGIUtciLaIv1f90LIQP': { plan: 'homeowner_ai', mode: 'subscription' },
  'price_1Tv06tGIUtciLaIvzJ4cl5nG': { plan: 'homeowner_ai', mode: 'subscription', annual: true },
  'price_1TuhKaGIUtciLaIvAwSZsSS5': { plan: 'professional', mode: 'subscription' },
  'price_1TuhKaGIUtciLaIvIpxDOqkj': { plan: 'professional', mode: 'subscription', annual: true },
  'price_1TuhKaGIUtciLaIvVcu8PYcC': { plan: 'team_professional', mode: 'subscription' },
  'price_1TuhKaGIUtciLaIvILXy4Psw': { plan: 'team_professional', mode: 'subscription', annual: true },
  'price_1TuhKaGIUtciLaIvIWw93Wci': { plan: 'professional_ai', mode: 'subscription' },
  'price_1TuhKaGIUtciLaIvZTsKam5b': { plan: 'professional_ai', mode: 'subscription', annual: true },
  'price_1TuhKaGIUtciLaIvMhfR2oie': { plan: 'team_professional_ai', mode: 'subscription' },
  'price_1TuhKaGIUtciLaIvmdlYKLNn': { plan: 'team_professional_ai', mode: 'subscription', annual: true },
  'price_1TuhKaGIUtciLaIvrsEpadrz': { plan: 'professional_ai_unlimited', mode: 'subscription' },
  'price_1TuhKaGIUtciLaIvIVidXRIC': { plan: 'professional_ai_unlimited', mode: 'subscription', annual: true },
  'price_1TuhKaGIUtciLaIvCHMv8mKB': { plan: 'team_ai_unlimited', mode: 'subscription' },
  'price_1TuhKaGIUtciLaIvHs6J4o9l': { plan: 'team_ai_unlimited', mode: 'subscription', annual: true },
  // Token packs
  'price_1TuivvGIUtciLaIvjbZLSNyr': { plan: null, mode: 'payment', tokens: 5000 },
  'price_1TuivvGIUtciLaIvxGRlnFg9': { plan: null, mode: 'payment', tokens: 15000 },
  'price_1TuivvGIUtciLaIvUXBwho8Y': { plan: null, mode: 'payment', tokens: 50000 },
  // Legacy (existing subscriptions preserved)
  'price_1Tueo3Ln5267sZgIfFl7UJyL': { plan: 'professional_ai', mode: 'subscription', legacy: true },
  'price_1Tueo3Ln5267sZgIdCh7kPNB': { plan: 'professional_ai', mode: 'subscription', legacy: true },
  'price_1Tueo3Ln5267sZgIy5W6GwdA': { plan: 'team_professional_ai', mode: 'subscription', legacy: true },
  'price_1Tueo3Ln5267sZgILUU6ajRe': { plan: 'professional_ai_unlimited', mode: 'subscription', legacy: true },
  'price_1Tueo3Ln5267sZgIQeh80Ww8': { plan: 'team_ai_unlimited', mode: 'subscription', legacy: true },
  'price_1Tueo3Ln5267sZgI6xc526py': { plan: null, mode: 'payment', tokens: 500, legacy: true },
};

// Monthly credit grant added on each subscription renewal invoice.
const MONTHLY_CREDIT_GRANT = {
  homeowner_ai: 250,
  professional_ai: 10000,
  team_professional_ai: 50000,
};

function planFromSubscription(sub) {
  const item = sub.items && sub.items.data && sub.items.data[0];
  const priceId = item && item.price && item.price.id;
  const entry = priceId ? CATALOG[priceId] : null;
  return entry && entry.plan ? entry.plan : null;
}

async function ensureWallet(sr, workspaceId) {
  const wallets = await sr.entities.CreditWallet.filter({ workspace_id: workspaceId });
  if (wallets[0]) return wallets[0];
  return await sr.entities.CreditWallet.create({ workspace_id: workspaceId, balance: 0, reserved: 0 });
}

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
        const plan = (session.metadata && session.metadata.plan) || 'professional';
        const subId = session.subscription;
        const existing = await sr.entities.Subscription.filter({ workspace_id: workspaceId });
        const data = {
          workspace_id: workspaceId, plan, status: 'active', billing_source: 'stripe',
          stripe_subscription_id: subId,
          stripe_price_lookup_key: session.metadata && session.metadata.interval === 'year' ? 'annual' : 'month',
          seats: 1, cancel_at_period_end: false,
        };
        if (existing && existing[0]) await sr.entities.Subscription.update(existing[0].id, data);
        else await sr.entities.Subscription.create(data);
        await sr.entities.Workspace.update(workspaceId, { plan, billing_source: 'stripe', subscription_id: subId });
        await sr.entities.AuditLog.create({
          workspace_id: workspaceId, actor_id: (session.metadata && session.metadata.user_id) || 'system',
          action: 'subscription.activated', target_type: 'subscription', target_id: subId, metadata: { plan },
        });
      } else if (session.mode === 'payment') {
        const tokens = Number((session.metadata && session.metadata.tokens) || 0);
        if (tokens > 0) {
          const wallet = await ensureWallet(sr, workspaceId);
          await sr.entities.CreditWallet.updateMany(
            { id: wallet.id },
            { $inc: { balance: tokens } }
          );
          const updated = await sr.entities.CreditWallet.get(wallet.id);
          const newBalance = updated.balance;
          await sr.entities.LedgerEntry.create({
            workspace_id: workspaceId, wallet_id: wallet.id, delta: tokens, type: 'pack_purchase',
            reference: session.id, idempotency_key: 'cs_' + session.id, balance_after: newBalance,
          });
          await sr.entities.AuditLog.create({
            workspace_id: workspaceId, actor_id: (session.metadata && session.metadata.user_id) || 'system',
            action: 'credit_pack.purchased', target_type: 'credit_wallet', target_id: wallet.id,
            metadata: { credits: tokens },
          });
        }
      }
    } else if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
      const sub = event.data.object;
      const plan = planFromSubscription(sub);
      const subs = await sr.entities.Subscription.filter({ stripe_subscription_id: sub.id });
      if (subs && subs[0]) {
        const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString().slice(0, 10) : undefined;
        const update = { status: sub.status, cancel_at_period_end: sub.cancel_at_period_end };
        if (plan) update.plan = plan;
        if (periodEnd) update.current_period_end = periodEnd;
        await sr.entities.Subscription.update(subs[0].id, update);
        if (plan) await sr.entities.Workspace.update(subs[0].workspace_id, { plan });
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const subs = await sr.entities.Subscription.filter({ stripe_subscription_id: sub.id });
      if (subs && subs[0]) {
        await sr.entities.Subscription.update(subs[0].id, { status: 'canceled' });
        await sr.entities.Workspace.update(subs[0].workspace_id, { plan: 'free' });
      }
    } else if (event.type === 'invoice.paid') {
      // Monthly credit grant on subscription renewal (credit-metered AI plans only).
      const invoice = event.data.object;
      const subId = invoice.subscription;
      if (subId) {
        const subs = await sr.entities.Subscription.filter({ stripe_subscription_id: subId });
        if (subs && subs[0]) {
          const plan = subs[0].plan;
          const grant = MONTHLY_CREDIT_GRANT[plan] || 0;
          if (grant > 0) {
            const idemKey = 'invoice_' + invoice.id;
            const existing = await sr.entities.LedgerEntry.filter({ workspace_id: subs[0].workspace_id, idempotency_key: idemKey });
            if (!existing || !existing.length) {
              const wallet = await ensureWallet(sr, subs[0].workspace_id);
              await sr.entities.CreditWallet.updateMany(
                { id: wallet.id },
                { $inc: { balance: grant } }
              );
              const updated = await sr.entities.CreditWallet.get(wallet.id);
              const newBalance = updated.balance;
              await sr.entities.LedgerEntry.create({
                workspace_id: subs[0].workspace_id, wallet_id: wallet.id, delta: grant, type: 'grant',
                reference: invoice.id, idempotency_key: idemKey, balance_after: newBalance,
              });
              await sr.entities.AuditLog.create({
                workspace_id: subs[0].workspace_id, actor_id: 'system',
                action: 'credit_grant.monthly', target_type: 'credit_wallet', target_id: wallet.id,
                metadata: { grant, plan, invoice_id: invoice.id },
              });
            }
          }
        }
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.log('stripeWebhook error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});