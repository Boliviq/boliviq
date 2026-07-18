# Scope — Department 02 (Billing & Subscriptions)

## In scope
- Stripe product catalog: 6 prices (Beginner, Professional, Team, Professional AI Max, Team AI Max, Credit Pack 500).
- Checkout session creation (subscriptions + one-time credit packs).
- Billing portal session creation.
- Webhook-driven subscription lifecycle: activation, update, cancellation.
- Webhook-driven credit pack purchase: atomic wallet increment + idempotent ledger entry + audit.
- Billing state aggregation (subscription, wallet, entitlements, ledger).
- Credit charging with idempotency (`chargeCredits`).
- Entitlement enforcement by plan with override support (`checkEntitlement`).
- Billing UI: current plan, credit balance, plan grid, credit packs, manage-subscription portal.
- Secrets as platform environment variables (STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET).

## Out of scope (deferred to later phases)
- Coupons / promotions → Phase 7.
- Rewards & referrals → Phase 7.
- AI Max metering internals → Phase 5/7 (entitlement flag exposed now).
- Usage dashboards / quotas UI → Phase 8.