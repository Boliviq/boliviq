# Known Issues & Status — Department 02

**Release decision: FAIL (in-progress). Next department (03-Marketplace): LOCKED.**

## Outstanding work
1. **Usage tracking + entitlement enforcement** — no per-action credit charging or feature gating yet; credits can be purchased but not spent.
2. **Coupons / promotions** — not implemented.
3. **Rewards & referrals** — `LedgerEntry.type` includes `referral`; flow not built.
4. **AI Max lifecycle** — plans exist in catalog; unlimited-agent metering/bypass logic not implemented.
5. **End-to-end test** — checkout → webhook → plan activation not yet run through the Testing Agent.

## Verified so far
- `createCheckoutSession`: PASS (live test checkout URL returned).
- `getBillingState`: PASS (free plan + wallet returned).
- `createBillingPortalSession`: implemented; requires an existing Stripe customer (created on first checkout).
- Webhook signature validation path implemented; live event verification pending a real test checkout completion.

No critical or high-severity defects in delivered code. Department is not marked complete because required features remain.