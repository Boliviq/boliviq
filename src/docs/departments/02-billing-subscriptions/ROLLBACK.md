# Rollback — Department 02

## Rollback point
Base44 Version History checkpoint captured at the end of Department 02 (before Department 03 work).

## Application rollback steps
1. Open Base44 Version History (clock icon).
2. Select the Department 02 completion checkpoint.
3. "Publish this version" (safe) or "Revert to this version".

## Data rollback steps
No destructive data changes. Subscriptions, wallets, and ledger entries are retained. If a billing bug is found, apply a forward-fix (new function version) rather than deleting ledger/wallet records — the ledger is immutable by design.

## Integration / Stripe rollback
- Disable the Stripe webhook endpoint in the Stripe dashboard if the webhook handler must be reverted.
- Webhook secret (`STRIPE_WEBHOOK_SECRET`) remains valid; no rotation needed for a code rollback.
- Active Stripe subscriptions continue in Stripe regardless of app code; the app re-syncs on the next webhook event after rollback.

## Verification after rollback
- `/billing` page loads and shows current plan + balance.
- `getBillingState` returns 200.