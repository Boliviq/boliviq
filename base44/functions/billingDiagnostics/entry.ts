import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import Stripe from 'npm:stripe@17.4.0';

// Expected plan matrix — mirrors Stripe products and the billing catalog.
// lookup_key = price_id in Base44 (we use price IDs directly).
const EXPECTED_PLANS = [
  { planTier: 'homeowner_ai', name: 'Homeowner + AI', priceId: 'price_1Tv06uGIUtciLaIv1f90LIQP', expectedAmount: 9.99, interval: 'month' },
  { planTier: 'homeowner_ai', name: 'Homeowner + AI', priceId: 'price_1Tv06tGIUtciLaIvzJ4cl5nG', expectedAmount: 99.90, interval: 'year' },
  { planTier: 'professional', name: 'Professional', priceId: 'price_1TuhKaGIUtciLaIvAwSZsSS5', expectedAmount: 49.99, interval: 'month' },
  { planTier: 'professional', name: 'Professional', priceId: 'price_1TuhKaGIUtciLaIvIpxDOqkj', expectedAmount: 499.90, interval: 'year' },
  { planTier: 'team_professional', name: 'Team Professional', priceId: 'price_1TuhKaGIUtciLaIvVcu8PYcC', expectedAmount: 199.00, interval: 'month' },
  { planTier: 'team_professional', name: 'Team Professional', priceId: 'price_1TuhKaGIUtciLaIvILXy4Psw', expectedAmount: 1910.40, interval: 'year' },
  { planTier: 'professional_ai', name: 'Professional + AI', priceId: 'price_1TuhKaGIUtciLaIvIWw93Wci', expectedAmount: 149.99, interval: 'month' },
  { planTier: 'professional_ai', name: 'Professional + AI', priceId: 'price_1TuhKaGIUtciLaIvZTsKam5b', expectedAmount: 1439.90, interval: 'year' },
  { planTier: 'team_professional_ai', name: 'Team Professional + AI', priceId: 'price_1TuhKaGIUtciLaIvMhfR2oie', expectedAmount: 699.00, interval: 'month' },
  { planTier: 'team_professional_ai', name: 'Team Professional + AI', priceId: 'price_1TuhKaGIUtciLaIvmdlYKLNn', expectedAmount: 6710.40, interval: 'year' },
  { planTier: 'professional_ai_unlimited', name: 'Professional AI Unlimited', priceId: 'price_1TuhKaGIUtciLaIvrsEpadrz', expectedAmount: 499.00, interval: 'month' },
  { planTier: 'professional_ai_unlimited', name: 'Professional AI Unlimited', priceId: 'price_1TuhKaGIUtciLaIvIVidXRIC', expectedAmount: 4790.40, interval: 'year' },
  { planTier: 'team_ai_unlimited', name: 'Team AI Unlimited', priceId: 'price_1TuhKaGIUtciLaIvCHMv8mKB', expectedAmount: 1299.00, interval: 'month' },
  { planTier: 'team_ai_unlimited', name: 'Team AI Unlimited', priceId: 'price_1TuhKaGIUtciLaIvHs6J4o9l', expectedAmount: 12470.40, interval: 'year' },
];

const TOKEN_PACK_PRICES = [
  { name: '5K Credits', priceId: 'price_1TuivvGIUtciLaIvjbZLSNyr', expectedAmount: 49.00 },
  { name: '15K Credits', priceId: 'price_1TuivvGIUtciLaIvxGRlnFg9', expectedAmount: 129.00 },
  { name: '50K Credits', priceId: 'price_1TuivvGIUtciLaIvUXBwho8Y', expectedAmount: 399.00 },
];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const rows = [];

    // Check subscription plans
    for (const expected of EXPECTED_PLANS) {
      const notes = [];
      let status = 'PASS';
      try {
        const price = await stripe.prices.retrieve(expected.priceId);
        const amount = price.unit_amount ? price.unit_amount / 100 : undefined;
        const interval = price.recurring?.interval;
        const amountMatches = amount === expected.expectedAmount;
        const intervalMatches = interval === expected.interval;
        const priceActive = price.active;

        if (!priceActive) { status = 'FAIL'; notes.push('Price is archived/inactive in Stripe.'); }
        if (!amountMatches) { status = 'WARNING'; notes.push(`Amount is $${amount} but expected $${expected.expectedAmount}.`); }
        if (!intervalMatches) { status = 'WARNING'; notes.push(`Interval is "${interval}" but expected "${expected.interval}".`); }

        let productActive = undefined;
        let productName = undefined;
        try {
          const productId = typeof price.product === 'string' ? price.product : price.product?.id;
          if (productId) {
            const product = await stripe.products.retrieve(productId);
            productActive = product.active;
            productName = product.name;
            if (!productActive) { status = 'FAIL'; notes.push('Parent product is archived/inactive.'); }
          }
        } catch { /* non-fatal */ }

        rows.push({
          priceId: expected.priceId, planTier: expected.planTier, name: expected.name,
          status, found: true, priceActive, amount, expectedAmount: expected.expectedAmount,
          amountMatches, currency: price.currency, interval, expectedInterval: expected.interval,
          intervalMatches, productName, productActive, notes,
        });
      } catch (e) {
        rows.push({
          priceId: expected.priceId, planTier: expected.planTier, name: expected.name,
          status: 'OWNER ACTION REQUIRED', found: false,
          expectedAmount: expected.expectedAmount, expectedInterval: expected.interval,
          notes: [`Price not found in Stripe. Verify the price ID exists.`],
        });
      }
    }

    // Check token pack prices
    for (const expected of TOKEN_PACK_PRICES) {
      const notes = [];
      let status = 'PASS';
      try {
        const price = await stripe.prices.retrieve(expected.priceId);
        const amount = price.unit_amount ? price.unit_amount / 100 : undefined;
        const amountMatches = amount === expected.expectedAmount;
        if (!price.active) { status = 'FAIL'; notes.push('Price is archived/inactive.'); }
        if (!amountMatches) { status = 'WARNING'; notes.push(`Amount is $${amount} but expected $${expected.expectedAmount}.`); }
        rows.push({
          priceId: expected.priceId, planTier: 'token_pack', name: expected.name,
          status, found: true, priceActive: price.active, amount, expectedAmount: expected.expectedAmount,
          amountMatches, currency: price.currency, notes,
        });
      } catch (e) {
        rows.push({
          priceId: expected.priceId, planTier: 'token_pack', name: expected.name,
          status: 'OWNER ACTION REQUIRED', found: false,
          expectedAmount: expected.expectedAmount, notes: ['Price not found in Stripe.'],
        });
      }
    }

    // Environment checks
    const environmentChecks = [
      { key: 'stripe_secret_key', status: Deno.env.get('STRIPE_SECRET_KEY') ? 'PASS' : 'FAIL', detail: 'STRIPE_SECRET_KEY is ' + (Deno.env.get('STRIPE_SECRET_KEY') ? 'set' : 'missing') },
      { key: 'stripe_publishable_key', status: Deno.env.get('STRIPE_PUBLISHABLE_KEY') ? 'PASS' : 'FAIL', detail: 'STRIPE_PUBLISHABLE_KEY is ' + (Deno.env.get('STRIPE_PUBLISHABLE_KEY') ? 'set' : 'missing') },
      { key: 'stripe_webhook_secret', status: Deno.env.get('STRIPE_WEBHOOK_SECRET') ? 'PASS' : 'FAIL', detail: 'STRIPE_WEBHOOK_SECRET is ' + (Deno.env.get('STRIPE_WEBHOOK_SECRET') ? 'set' : 'missing') },
      { key: 'base44_app_id', status: Deno.env.get('BASE44_APP_ID') ? 'PASS' : 'FAIL', detail: 'BASE44_APP_ID is ' + (Deno.env.get('BASE44_APP_ID') ? 'set' : 'missing') },
    ];

    const blocked =
      environmentChecks.some(c => c.status === 'FAIL') ||
      rows.some(r => r.status === 'FAIL' || r.status === 'OWNER ACTION REQUIRED');

    return Response.json({
      overall: blocked ? 'BLOCKED' : 'READY',
      timestamp: new Date().toISOString(),
      stripeMode: 'live',
      environmentChecks,
      plans: rows,
      summary: {
        total: rows.length,
        pass: rows.filter(r => r.status === 'PASS').length,
        warning: rows.filter(r => r.status === 'WARNING').length,
        fail: rows.filter(r => r.status === 'FAIL').length,
        actionRequired: rows.filter(r => r.status === 'OWNER ACTION REQUIRED').length,
      },
    });
  } catch (error) {
    console.log('billingDiagnostics error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}