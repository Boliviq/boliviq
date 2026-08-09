import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import Stripe from 'npm:stripe@17.4.0';
import {
  CATALOG, MONTHLY_CREDIT_GRANT,
  planFromSubscription, intervalFromSubscription,
  subscriptionIdFromInvoice, periodEndFromSubscription,
  billingMonthFromTimestamp,
} from '../../shared/billingCatalog.ts';

async function ensureWallet(sr, workspaceId) {
  const wallets = await sr.entities.CreditWallet.filter({ workspace_id: workspaceId });
  if (wallets[0]) return wallets[0];
  return await sr.entities.CreditWallet.create({ workspace_id: workspaceId, balance: 0, reserved: 0 });
}

// Idempotent credit grant: checks ledger BEFORE incrementing wallet.
// Returns { idempotent: true } if already processed, { granted: true } otherwise.
async function grantCreditsIdempotent(sr, workspaceId, amount, type, reference, idempotencyKey, auditAction, auditMeta) {
  // Check idempotency FIRST — before any wallet mutation.
  const existing = await sr.entities.LedgerEntry.filter({
    workspace_id: workspaceId, idempotency_key: idempotencyKey,
  });
  if (existing && existing.length) {
    return { idempotent: true, balance: existing[0].balance_after };
  }
  // Grant credits atomically.
  const wallet = await ensureWallet(sr, workspaceId);
  await sr.entities.CreditWallet.updateMany({ id: wallet.id }, { $inc: { balance: amount } });
  const updated = await sr.entities.CreditWallet.get(wallet.id);
  await sr.entities.LedgerEntry.create({
    workspace_id: workspaceId, wallet_id: wallet.id, delta: amount, type,
    reference, idempotency_key: idempotencyKey, balance_after: updated.balance,
  });
  await sr.entities.AuditLog.create({
    workspace_id: workspaceId, actor_id: 'system',
    action: auditAction, target_type: 'credit_wallet', target_id: wallet.id,
    metadata: auditMeta,
  });
  return { idempotent: false, granted: true, balance: updated.balance };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature') || '';
    const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!secret) {
      console.log('stripeWebhook: STRIPE_WEBHOOK_SECRET not configured');
      return Response.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(rawBody, signature, secret);
    } catch (err) {
      // Don't leak signature details in the response.
      console.log('stripeWebhook: signature verification failed');
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const sr = base44.asServiceRole;

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const workspaceId = session.metadata && session.metadata.workspace_id;
      if (!workspaceId) return Response.json({ received: true });

      if (session.mode === 'subscription') {
        // Determine plan from the actual Stripe Price ID — NOT from client metadata.
        const subId = session.subscription;
        let plan = null;
        let interval = 'month';

        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId, { expand: ['items.data.price'] });
          plan = planFromSubscription(sub);
          interval = intervalFromSubscription(sub);
        }

        // Fail safely if we can't determine the plan from the price ID.
        if (!plan) {
          console.log('stripeWebhook: Could not determine plan from subscription price for session', session.id);
          await sr.entities.AuditLog.create({
            workspace_id: workspaceId, actor_id: 'system',
            action: 'subscription.unknown_plan', target_type: 'subscription', target_id: subId,
            metadata: { session_id: session.id },
          });
          return Response.json({ received: true });
        }

        // Idempotency: check if subscription record already exists for this Stripe sub ID.
        const existing = await sr.entities.Subscription.filter({ stripe_subscription_id: subId });
        const data = {
          workspace_id: workspaceId, plan, status: 'active', billing_source: 'stripe',
          stripe_subscription_id: subId,
          stripe_price_lookup_key: interval === 'year' ? 'annual' : 'month',
          seats: 1, cancel_at_period_end: false,
        };
        if (existing && existing[0]) {
          await sr.entities.Subscription.update(existing[0].id, data);
        } else {
          await sr.entities.Subscription.create(data);
        }
        await sr.entities.Workspace.update(workspaceId, { plan, billing_source: 'stripe', subscription_id: subId });
        await sr.entities.AuditLog.create({
          workspace_id: workspaceId, actor_id: (session.metadata && session.metadata.user_id) || 'system',
          action: 'subscription.activated', target_type: 'subscription', target_id: subId,
          metadata: { plan, interval },
        });
      } else if (session.mode === 'payment') {
        // Verify payment is actually successful before granting credits.
        if (session.payment_status !== 'paid') {
          console.log('stripeWebhook: Checkout session not paid:', session.id, 'status:', session.payment_status);
          await sr.entities.AuditLog.create({
            workspace_id: workspaceId, actor_id: 'system',
            action: 'credit_pack.unpaid', target_type: 'checkout_session', target_id: session.id,
            metadata: { payment_status: session.payment_status },
          });
          return Response.json({ received: true });
        }

        // Determine credit amount from the Stripe Price ID — NOT from client metadata.
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { expand: ['data.price'] });
        const lineItem = lineItems && lineItems.data && lineItems.data[0];
        let priceId = null;
        if (lineItem && lineItem.price) {
          priceId = typeof lineItem.price === 'object' ? lineItem.price.id : lineItem.price;
        }
        const entry = priceId ? CATALOG[priceId] : null;

        if (!entry || !entry.tokens) {
          console.log('stripeWebhook: Unknown or non-pack price for credit pack purchase:', priceId);
          await sr.entities.AuditLog.create({
            workspace_id: workspaceId, actor_id: 'system',
            action: 'credit_pack.unknown_price', target_type: 'checkout_session', target_id: session.id,
            metadata: { price_id: priceId },
          });
          return Response.json({ received: true });
        }

        const tokens = entry.tokens;
        const idemKey = 'cs_' + session.id;

        // Idempotency: check BEFORE granting — prevents duplicate credit on webhook redelivery.
        const result = await grantCreditsIdempotent(
          sr, workspaceId, tokens, 'pack_purchase', session.id, idemKey,
          'credit_pack.purchased', { credits: tokens, price_id: priceId, session_id: session.id }
        );

        if (result.idempotent) {
          return Response.json({ received: true, idempotent: true });
        }
      }
    } else if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
      const sub = event.data.object;
      const plan = planFromSubscription(sub);
      const subs = await sr.entities.Subscription.filter({ stripe_subscription_id: sub.id });
      if (subs && subs[0]) {
        const periodEndTs = periodEndFromSubscription(sub);
        const periodEnd = periodEndTs ? new Date(periodEndTs * 1000).toISOString().slice(0, 10) : undefined;
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
        await sr.entities.AuditLog.create({
          workspace_id: subs[0].workspace_id, actor_id: 'system',
          action: 'subscription.canceled', target_type: 'subscription', target_id: sub.id,
          metadata: {},
        });
      }
    } else if (event.type === 'invoice.paid') {
      // Monthly credit grant on subscription renewal (credit-metered AI plans only).
      const invoice = event.data.object;
      const subId = subscriptionIdFromInvoice(invoice);
      if (subId) {
        const subs = await sr.entities.Subscription.filter({ stripe_subscription_id: subId });
        if (subs && subs[0]) {
          const plan = subs[0].plan;
          const grant = MONTHLY_CREDIT_GRANT[plan] || 0;
          if (grant > 0) {
            // Determine billing month from the invoice period start (or creation date as fallback).
            const ts = (invoice.period_start || invoice.created || Math.floor(Date.now() / 1000));
            const billingMonth = billingMonthFromTimestamp(ts);
            const newKey = 'grant_' + subs[0].workspace_id + '_' + billingMonth;
            const oldKey = 'invoice_' + invoice.id;

            // Check both old and new idempotency keys for backward compatibility.
            const existingNew = await sr.entities.LedgerEntry.filter({
              workspace_id: subs[0].workspace_id, idempotency_key: newKey,
            });
            const existingOld = await sr.entities.LedgerEntry.filter({
              workspace_id: subs[0].workspace_id, idempotency_key: oldKey,
            });
            if ((existingNew && existingNew.length) || (existingOld && existingOld.length)) {
              return Response.json({ received: true, idempotent: true });
            }

            // Grant credits using the new month-based key (shared with scheduled monthly grants).
            const wallet = await ensureWallet(sr, subs[0].workspace_id);
            await sr.entities.CreditWallet.updateMany({ id: wallet.id }, { $inc: { balance: grant } });
            const updated = await sr.entities.CreditWallet.get(wallet.id);
            await sr.entities.LedgerEntry.create({
              workspace_id: subs[0].workspace_id, wallet_id: wallet.id, delta: grant, type: 'grant',
              reference: invoice.id, idempotency_key: newKey, balance_after: updated.balance,
            });
            await sr.entities.AuditLog.create({
              workspace_id: subs[0].workspace_id, actor_id: 'system',
              action: 'credit_grant.monthly', target_type: 'credit_wallet', target_id: wallet.id,
              metadata: { grant, plan, invoice_id: invoice.id, billing_month: billingMonth },
            });
          }
        }
      }
    } else if (event.type === 'invoice.payment_failed') {
      // Record payment failure — let Stripe's retry/dunning system operate.
      const invoice = event.data.object;
      const subId = subscriptionIdFromInvoice(invoice);
      if (subId) {
        const subs = await sr.entities.Subscription.filter({ stripe_subscription_id: subId });
        if (subs && subs[0]) {
          // Idempotency: check if we already processed this invoice's payment failure.
          const existingAudits = await sr.entities.AuditLog.filter({
            workspace_id: subs[0].workspace_id,
            action: 'subscription.payment_failed',
            target_id: subId,
          });
          const alreadyProcessed = existingAudits.some(
            (a) => a.metadata && a.metadata.invoice_id === invoice.id
          );
          if (!alreadyProcessed) {
            // Mark subscription as past_due — do NOT downgrade or delete (let Stripe retry).
            await sr.entities.Subscription.update(subs[0].id, { status: 'past_due' });
            await sr.entities.AuditLog.create({
              workspace_id: subs[0].workspace_id, actor_id: 'system',
              action: 'subscription.payment_failed', target_type: 'subscription', target_id: subId,
              metadata: {
                invoice_id: invoice.id,
                attempt_count: invoice.attempt_count || 1,
                next_attempt: invoice.next_payment_attempt || null,
                amount_due: invoice.amount_due || 0,
              },
            });
          }
        }
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.log('stripeWebhook error:', error.message);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
});