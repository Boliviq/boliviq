# Implementation — Department 02

## Backend functions
| Function | Purpose |
|---|---|
| `createCheckoutSession` | Auth + owner/admin; creates/reuses Stripe customer; Checkout URL for subscription or one-time pack; metadata includes `base44_app_id`. |
| `getBillingState` | Returns subscription, wallet, entitlements, recent ledger for a workspace (membership-gated). |
| `createBillingPortalSession` | Owner/admin; Stripe customer portal. |
| `stripeWebhook` | Verifies signature; on `checkout.session.completed` activates subscription (upsert + workspace + audit) or grants credit pack (wallet increment + idempotent ledger + audit); syncs `customer.subscription.updated/deleted`. |
| `chargeCredits` | Membership-gated; idempotency via ledger key; decrements wallet; writes ledger + audit. Returns 402 on insufficient. |
| `checkEntitlement` | Membership-gated; resolves feature enabled/limit from plan defaults, with Entitlement-record overrides (owner_grant/promotion/manual). |

## Files added
- base44/functions/createCheckoutSession/entry.ts
- base44/functions/getBillingState/entry.ts
- base44/functions/createBillingPortalSession/entry.ts
- base44/functions/stripeWebhook/entry.ts
- base44/functions/chargeCredits/entry.ts
- base44/functions/checkEntitlement/entry.ts
- src/data/billingCatalog.js
- src/pages/Billing.jsx

## Files modified
- src/App.jsx (`/billing` route + WorkspaceProvider)
- src/components/boliviq/SectionNav.jsx (Billing nav link)

## Secrets (platform env vars, never in repo)
- STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET

## Entitlement model
`checkEntitlement` computes defaults from a plan→feature map; explicit `Entitlement` records override. Features: `ai_credits_monthly`, `max_properties`, `construction_intelligence`, `ai_agents_unlimited`, `seats`. `null` limit = unlimited.