// Boliviq billing catalog — shared by stripeWebhook, createCheckoutSession, and grantMonthlyCredits.
// Source of truth for price_id -> { plan, mode, interval, tokens } mapping.
// Never trust client-controlled metadata for billing entitlement — always use this catalog.

export const CATALOG = {
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
  // Legacy prices (preserved for existing subscriptions — do not remove)
  'price_1Tueo3Ln5267sZgIfFl7UJyL': { plan: 'professional_ai', mode: 'subscription', legacy: true },
  'price_1Tueo3Ln5267sZgIdCh7kPNB': { plan: 'professional_ai', mode: 'subscription', legacy: true },
  'price_1Tueo3Ln5267sZgIy5W6GwdA': { plan: 'team_professional_ai', mode: 'subscription', legacy: true },
  'price_1Tueo3Ln5267sZgILUU6ajRe': { plan: 'professional_ai_unlimited', mode: 'subscription', legacy: true },
  'price_1Tueo3Ln5267sZgIQeh80Ww8': { plan: 'team_ai_unlimited', mode: 'subscription', legacy: true },
  'price_1Tueo3Ln5267sZgI6xc526py': { plan: null, mode: 'payment', tokens: 500, legacy: true },
};

// Monthly AI credit grants per plan. Unlimited plans don't consume credits, so no grant needed.
export const MONTHLY_CREDIT_GRANT = {
  homeowner_ai: 250,
  professional_ai: 10000,
  team_professional_ai: 50000,
};

// Extract price ID from a Stripe subscription object (supports expanded and non-expanded items).
export function priceIdFromSubscription(sub) {
  const item = sub && sub.items && sub.items.data && sub.items.data[0];
  if (!item) return null;
  if (item.price && typeof item.price === 'object') return item.price.id;
  if (typeof item.price === 'string') return item.price;
  if (item.plan && item.plan.id) return item.plan.id;
  return null;
}

// Determine plan from a Stripe subscription by looking up the price ID in the catalog.
export function planFromSubscription(sub) {
  const priceId = priceIdFromSubscription(sub);
  const entry = priceId ? CATALOG[priceId] : null;
  return entry && entry.plan ? entry.plan : null;
}

// Determine billing interval from a Stripe subscription.
export function intervalFromSubscription(sub) {
  const item = sub && sub.items && sub.items.data && sub.items.data[0];
  if (item && item.plan && item.plan.interval) return item.plan.interval;
  if (item && item.price && item.price.recurring && item.price.recurring.interval) return item.price.recurring.interval;
  const priceId = priceIdFromSubscription(sub);
  const entry = priceId ? CATALOG[priceId] : null;
  return entry && entry.interval ? entry.interval : 'month';
}

// Extract subscription ID from a Stripe invoice — supports modern and legacy API field locations.
// Modern (2025+): invoice.parent.subscription_details.subscription
// Legacy: invoice.subscription
export function subscriptionIdFromInvoice(invoice) {
  if (invoice && invoice.parent && invoice.parent.subscription_details && invoice.parent.subscription_details.subscription) {
    return invoice.parent.subscription_details.subscription;
  }
  return (invoice && invoice.subscription) || null;
}

// Extract period end timestamp from a Stripe subscription — supports modern and legacy field locations.
// Modern: sub.items.data[0].current_period_end
// Legacy: sub.current_period_end
export function periodEndFromSubscription(sub) {
  const item = sub && sub.items && sub.items.data && sub.items.data[0];
  if (item && item.current_period_end) return item.current_period_end;
  return (sub && sub.current_period_end) || null;
}

// Format a billing month key (YYYY-MM) from a timestamp (seconds) or Date.
export function billingMonthFromTimestamp(ts) {
  const date = ts instanceof Date ? ts : new Date(ts * 1000);
  return date.toISOString().slice(0, 7);
}

// Current billing month key (YYYY-MM) for scheduled grants.
export function currentBillingMonth() {
  return new Date().toISOString().slice(0, 7);
}