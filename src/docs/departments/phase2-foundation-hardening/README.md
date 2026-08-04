# Phase 2 — Foundation Hardening

## Status: ✅ Complete

## Scope

Phase 2 hardens the data layer, closes concurrency gaps in the credit economy, and adds admin visibility into structural integrity.

## Changes

### 1. Credit Wallet Concurrency Fix (`chargeCredits`)
**Problem:** The charge function used a read-check-write pattern (`filter → check balance → update`). Two concurrent charges could both read the same balance, both pass the sufficiency check, and both deduct — overdrawing the wallet.

**Fix:** Replaced with an atomic conditional decrement using `updateMany` + `$inc`:
```typescript
const result = await sr.entities.CreditWallet.updateMany(
  { id: wallet.id, balance: { $gte: amount } },
  { $inc: { balance: -amount } }
);
```
The database only applies the decrement if the balance is still sufficient at write time. If `matched_count === 0`, the charge is rejected — no overdraw possible.

### 2. Webhook Credit Grants (`stripeWebhook`)
Applied the same atomic `$inc` pattern to both credit grant paths:
- Token pack purchases (one-time `payment` mode)
- Monthly credit grants on subscription renewal (`invoice.paid`)

Both now use `updateMany({ id }, { $inc: { balance: n } })` instead of read-then-write.

### 3. Foundation Health Backend Function (`foundationHealth`)
New admin-only backend function that verifies 7 structural integrity checks:

| # | Check | Purpose |
|---|-------|---------|
| 1 | No negative wallet balances | Concurrency safety net |
| 2 | No unresolved RLS events | Security monitoring |
| 3 | All workspaces have credit wallets | Workspace completeness |
| 4 | All workspaces have subscriptions | Billing integrity |
| 5 | All workspaces have active owners | Ownership chain |
| 6 | No orphaned ledger entries | Financial audit trail |
| 7 | No active subs on suspended workspaces | Billing-state consistency |

### 4. Foundation Health Dashboard (`/admin/foundation-health`)
Admin page that calls the health function and renders a pass/fail dashboard with summary stats.

## Verification

```
foundationHealth: 7/7 checks passed — overall: healthy
chargeCredits: correctly returns 403 for unauthorized workspace access
```

## Test Results

- Foundation health function: ✅ 200 response, 7/7 checks pass
- Charge credits auth guard: ✅ 403 for non-members
- Atomic decrement: ✅ Uses `$inc` with `$gte` filter (no race condition)
- Webhook credit grants: ✅ Both paths use atomic `$inc