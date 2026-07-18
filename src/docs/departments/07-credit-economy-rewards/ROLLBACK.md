# Rollback — Department 07

## Rollback point
Base44 Version History checkpoint at end of Department 07.

## Application rollback steps
1. Open Version History → select Department 07 completion checkpoint → publish/revert.
2. Remove `/rewards` route from App.jsx + NAV entry in AppTopBar.

## Data rollback steps
No destructive changes. Coupon/Referral records retained. Wallet balance reflects redeemed credits — do NOT auto-reverse ledger entries on code rollback (manual accounting if needed).

## Integration rollback
No new integrations/secrets (redeemCoupon uses the Base44 SDK service role).

## Verification after rollback
- App loads; `/billing`, `/assistant`, `/construction`, `/marketplace`, `/properties` still work.