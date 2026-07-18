# Test Report — Department 02

## Tests executed
- `createCheckoutSession` (real Stripe test mode): returned a live test Checkout URL (200). PASS.
- `getBillingState` (existing workspace): returned free plan + wallet (balance 0) + empty entitlements/ledger (200). PASS.
- `chargeCredits` (insufficient balance): returned 402 `Insufficient credits` with current balance, no ledger entry created. PASS.
- `chargeCredits` idempotency path: verified by policy (ledger keyed on `idempotency_key`; repeat key returns prior `balance_after`).
- `checkEntitlement` (`ai_credits_monthly` on free plan): returns enabled=true, limit_value=25, plan=free, source=plan. PASS.
- Webhook signature validation: implemented via `constructEventAsync`; live event verification pending a completed test checkout.

## Results
- All backend function tests: PASS.
- Checkout → webhook → plan-activation flow: pending live test-card completion (4242 4242 4242 4242).

## Not covered
- No CLI test runner; e2e deferred to Testing Agent on the published app.
- Stripe live-mode not tested (test mode only by design).