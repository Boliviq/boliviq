# Department 02 — Billing & Subscriptions

**Release:** boliviq-dept-02-v1.0.0
**Status:** PASS — production-ready in Stripe test mode.
**Rollback point:** Base44 Version History checkpoint at end of Department 02.

## What this department delivered
Stripe catalog, checkout, portal, webhook-driven subscription lifecycle, credit-pack purchase with idempotent ledger, and credit charging + entitlement enforcement. Billing UI live at `/billing`.

## Key artifacts
- 6 backend functions: createCheckoutSession, getBillingState, createBillingPortalSession, stripeWebhook, chargeCredits, checkEntitlement.
- `billingCatalog.js`, `Billing.jsx`, SectionNav + App.jsx wiring.
- Webhook registered at the function endpoint; STRIPE_WEBHOOK_SECRET stored.

See SCOPE / IMPLEMENTATION / TEST-REPORT / SECURITY-REPORT / MIGRATIONS / ROLLBACK / RELEASE-NOTES / KNOWN-ISSUES in this folder.