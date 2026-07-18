# Department 02 — Billing & Subscriptions

**Release:** boliviq-dept-02-v1.0.0 (target)
**Status:** IN-PROGRESS — NOT YET RELEASABLE. Department 03 remains LOCKED.

## Delivered (core billing)
- Stripe product catalog: 6 prices (5 monthly plans + 1 credit pack).
- `createCheckoutSession` — auth + owner/admin gated; creates/reuses Stripe customer; returns Checkout URL (subscription + one-time credit pack modes). Tested: returns live test checkout URL.
- `getBillingState` — returns workspace subscription, wallet, entitlements, recent ledger. Tested: returns free plan + wallet.
- `createBillingPortalSession` — owner/admin gated; Stripe customer portal.
- `stripeWebhook` — registered endpoint; validates signature; on `checkout.session.completed` activates subscription (upserts Subscription + updates Workspace + audit) or grants credit pack (atomic wallet increment + idempotent ledger entry + audit); syncs `customer.subscription.updated/deleted`.
- Billing UI (`/billing`): current plan, credit balance, plan grid with upgrade, credit pack purchase, manage-subscription portal; iframe-blocked checkout redirect; nav link added.
- Secrets: STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET set as platform env vars.

## Remaining before PASS
- Usage tracking + entitlement enforcement (gate features/credits by plan; charge credits per AI action with ledger reservation/release).
- Coupon / promotion support.
- Rewards & referrals (referral ledger type exists; flow not built).
- AI Max plan lifecycle (unlimited-agent handling vs credit metering).
- Testing Agent run on the checkout → webhook → plan-activation flow.
- Full department release package (SCOPE/IMPLEMENTATION/TEST-REPORT/SECURITY/MIGRATIONS/ROLLBACK/RELEASE-NOTES) produced on completion.

## Rollback point (interim)
Base44 Version History checkpoint at the end of Department 02 core work (before usage/entitlement work begins).