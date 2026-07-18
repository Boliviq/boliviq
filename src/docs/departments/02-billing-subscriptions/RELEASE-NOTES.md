# Release Notes — Department 02 — v1.0.0

## Summary
End-to-end Stripe billing: catalog, checkout, portal, webhook-driven subscription lifecycle, credit-pack purchase with idempotent ledger, and credit charging + entitlement enforcement.

## Features completed
- 6 Stripe prices (5 plans + credit pack) in the catalog.
- Subscription checkout + one-time credit-pack checkout (owner/admin gated).
- Stripe customer portal access.
- Webhook: subscription activation/update/cancellation; credit-pack purchase with atomic wallet + immutable ledger + audit.
- `chargeCredits`: idempotent, membership-gated credit consumption (402 on insufficient).
- `checkEntitlement`: plan-based feature gating with override records.
- Billing UI with plan grid, credit balance, credit packs, manage-subscription portal; iframe-blocked checkout.

## Known limitations
- Coupons/promotions and referrals deferred to Phase 7.
- Charge concurrency safety relies on idempotency keys (platform-level transactions not available).
- Live webhook event verification pending a completed test checkout.

## Release decision
PASS — billing and subscription management are production-ready in test mode.

## Next department
03-CRM (Properties, Pipeline, Contacts): AUTHORIZED.