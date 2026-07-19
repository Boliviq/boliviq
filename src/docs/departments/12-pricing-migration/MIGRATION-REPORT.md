# Boliviq Pricing Model Migration — Department 12

**Date:** 2026-07-19
**Status:** Complete — all systems synchronized to the new 7-tier pricing model.

## New membership structure

| # | Plan | Monthly | Annual (20% off) | Seats | AI mode |
|---|------|---------|------|-------|---------|
| 1 | Homeowner | $0 | $0 | 1 | None |
| 2 | Professional | $49.99 | $479.90 | 1 | None |
| 3 | Team Professional | $199 | $1,910.40 | 5 | None |
| 4 | Professional + AI | $149.99 | $1,439.90 | 1 | Tokens |
| 5 | Team Professional + AI | $699 | $6,710.40 | 5 | Tokens (shared) |
| 6 | Professional AI Unlimited | $499 | $4,790.40 | 1 | Unlimited |
| 7 | Team AI Unlimited | $1,299 | $12,470.40 | 5 | Unlimited (shared) |

**Marketplace** remains free for everyone. Professional plans unlock business tools. AI plans unlock AI. Unlimited plans bypass tokens entirely (server-side verified).

## AI token system

- Token-metered plans (Professional + AI, Team Professional + AI) consume 1 token per AI request via `chargeCredits`.
- Monthly token grants added automatically on each renewal invoice: 10,000 (Professional + AI), 50,000 (Team Professional + AI).
- Token packs (one-time top-ups): 5,000/$49, 15,000/$129, 50,000/$399.
- Unlimited AI plans bypass token deduction securely in `chargeCredits` — no client-side bypass possible.

## Files changed

### Database / entity schemas
- `base44/entities/Subscription.jsonc` — plan enum replaced with 7 new slugs (`free`, `professional`, `team_professional`, `professional_ai`, `team_professional_ai`, `professional_ai_unlimited`, `team_ai_unlimited`).
- `base44/entities/Workspace.jsonc` — same plan enum updated; default `free`.

### Backend functions
- `base44/functions/checkEntitlement/entry.ts` — new `PLAN_ENTITLEMENTS` map with feature keys `marketplace`, `crm`, `construction_intelligence`, `deal_calculator`, `ai_access`, `ai_unlimited`, `ai_credits_monthly`, `seats`.
- `base44/functions/chargeCredits/entry.ts` — server-side AI gating (403 for non-AI plans), unlimited bypass for `professional_ai_unlimited`/`team_ai_unlimited`, token deduction for metered plans.
- `base44/functions/createCheckoutSession/entry.ts` — new CATALOG mapping 12 subscription prices + 3 token packs + 6 legacy prices; annual interval metadata; iframe-safe checkout.
- `base44/functions/stripeWebhook/entry.ts` — plan resolution from price_id, annual handling, token-pack crediting, monthly token grant on `invoice.paid` (idempotent), legacy price mapping.

### Frontend
- `src/data/billingCatalog.js` — full rewrite: 7 tiers with monthly/annual price IDs, AI mode, seats, features, restrictions; 3 token packs; AI mode badges.
- `src/pages/Billing.jsx` — monthly/annual toggle, 7 plan cards with AI badges + restriction lists, token pack purchase, onboarding-plan banner, unlimited-AI indicator.
- `src/pages/Assistant.jsx` — server-side AI entitlement gate before every request; token metering (1 token/request) with unlimited bypass; upgrade prompt when AI unavailable.
- `src/pages/Register.jsx` — post-signup onboarding plan picker; paid plans route to `/billing`, Homeowner routes to app.
- `src/components/onboarding/PlanPicker.jsx` — NEW: 7-tier comparison + token vs unlimited explainer.
- `src/components/admin/AdminPricing.jsx` — NEW: admin pricing matrix (plans, token packs, feature entitlement table).
- `src/pages/Admin.jsx` — added "Pricing & Plans" tab.
- `src/data/blueprint.js` — marketing `plans`, `creditPacks`, `coupons` arrays updated to 7 tiers + token packs (drives `PricingView`).

## Stripe changes

### Products created (6 paid tiers)
- `prod_UuWNVrvIKvCIlR` — Boliviq Professional Plan
- `prod_UuWN7Wy8Zup48N` — Boliviq Team Professional Plan
- `prod_UuWNx1C4mlgor4` — Boliviq Professional + AI Plan
- `prod_UuWNVohbc7H2k5` — Boliviq Team Professional + AI Plan
- `prod_UuWNgOpRnvnEVw` — Boliviq Professional AI Unlimited Plan
- `prod_UuWNhwzrUGpBYK` — Boliviq Team AI Unlimited Plan
- `prod_UuWNIBrok2tQGe` — Boliviq AI Token Pack (one-time)

### Prices created (12 subscriptions + 3 token packs)
**Monthly / annual subscription prices:**
- Professional: `price_1TuhKaGIUtciLaIvAwSZsSS5` / `price_1TuhKaGIUtciLaIvIpxDOqkj`
- Team Professional: `price_1TuhKaGIUtciLaIvVcu8PYcC` / `price_1TuhKaGIUtciLaIvILXy4Psw`
- Professional + AI: `price_1TuhKaGIUtciLaIvIWw93Wci` / `price_1TuhKaGIUtciLaIvZTsKam5b`
- Team Professional + AI: `price_1TuhKaGIUtciLaIvMhfR2oie` / `price_1TuhKaGIUtciLaIvmdlYKLNn`
- Professional AI Unlimited: `price_1TuhKaGIUtciLaIvrsEpadrz` / `price_1TuhKaGIUtciLaIvIVidXRIC`
- Team AI Unlimited: `price_1TuhKaGIUtciLaIvCHMv8mKB` / `price_1TuhKaGIUtciLaIvHs6J4o9l`

**Token packs (one-time):**
- 5,000 tokens: `price_1TuivvGIUtciLaIvjbZLSNyr` ($49)
- 15,000 tokens: `price_1TuivvGIUtciLaIvxGRlnFg9` ($129)
- 50,000 tokens: `price_1TuivvGIUtciLaIvUXBwho8Y` ($399)

### Webhook
- Registered at `https://boliviq-os-pro.base44.app/api/functions/stripeWebhook` for `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`.
- Signing secret stored as `STRIPE_WEBHOOK_SECRET`.

## Data migration

Legacy plan slugs remapped (access-preserving) to new tiers via `updateMany` on both `Subscription` and `Workspace`:
- `beginner` → `professional_ai`
- `professional` → `professional_ai`
- `team` → `team_professional_ai`
- `professional_ai_max` → `professional_ai_unlimited`
- `team_ai_max` → `team_ai_unlimited`
- `free` → `free` (Homeowner, unchanged)

Result: 0 records matched in this environment (no existing subscribers). Existing Stripe subscriptions on legacy price IDs continue billing at their original rates; webhook events map them to the new plan slugs via the legacy CATALOG entries, preserving access.

## Entitlements modified

New feature-key model (server-authoritative via `checkEntitlement`):
- `marketplace` — all plans
- `crm` — Professional and above
- `construction_intelligence` — Professional and above
- `deal_calculator` — all plans
- `ai_access` — AI plans only (Professional + AI, Team Professional + AI, Professional AI Unlimited, Team AI Unlimited)
- `ai_unlimited` — unlimited plans only
- `ai_credits_monthly` — 10k (Professional + AI), 50k (Team Professional + AI), null (unlimited), 0 (non-AI)
- `seats` — 1 (solo tiers) / 5 (team tiers)

## Security

- AI access enforced server-side in `chargeCredits` (403 for non-AI plans).
- Unlimited bypass enforced server-side in `chargeCredits` — verified by plan, not client flag.
- Token deduction is idempotent (keyed by `idempotency_key`).
- Webhook signature verification via `STRIPE_WEBHOOK_SECRET`.
- Checkout blocked inside builder iframe (iframe detection in `Billing.jsx`).
- All billing mutations require workspace owner/admin role.

## Verification

- `createCheckoutSession` — deploys, returns 400 for missing params (✓).
- `checkEntitlement` — deploys, returns 403 for non-members (✓).
- `chargeCredits` — deploys, returns 403 for non-members (✓).
- `stripeWebhook` — deploys, rejects missing signature (✓).
- Full live Stripe checkout + webhook lifecycle requires published app runtime.

## Known limitations / deferred

- Runtime editing of Stripe prices from the admin UI is display-only; price changes are made in Stripe + `billingCatalog.js` (single source of truth) to avoid drift.
- Percent coupons via Stripe Checkout — deferred (credit/token coupons handled via `redeemCoupon`).
- Live checkout, portal, and webhook end-to-end verification requires the published app.