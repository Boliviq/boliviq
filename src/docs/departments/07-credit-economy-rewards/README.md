# Department 07 — Credit Economy, Rewards & Coupons

**Release:** boliviq-dept-07-v1.0.0
**Status:** PASS
**Rollback point:** Base44 Version History checkpoint at end of Department 07.

## What this department delivered
Coupon redemption, referral code display, and a rewards hub tying into the existing credit wallet + ledger.

## Key artifacts
- New entities: Coupon (admin RLS), Referral (owner/admin RLS).
- Backend function: redeemCoupon (validates + grants credits + ledger + audit).
- Page: Rewards (balance, referral code, coupon redemption, admin coupon CRUD, referrals list).
- Component: CouponForm.
- Route: `/rewards`. Nav added to AppTopBar.