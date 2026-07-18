# Release Notes — Department 07 — v1.0.0

## Summary
Coupon redemption, referral codes, and a rewards hub integrated with the credit wallet and ledger.

## Features completed
- Coupon + Referral entities.
- redeemCoupon backend function (validate → grant credits → ledger → audit).
- Rewards page: credit balance, referral code + copy, coupon redemption, admin coupon CRUD, referrals list.
- AppTopBar nav entry.

## Known limitations
- Percent coupons not yet wired to Stripe checkout.
- Referral tracking is manual (no auto-reward on signup/conversion).
- usage_count increment is read-then-write (minor concurrency risk).
- AI per-call credit metering not yet wired (Dept 06 follow-up).
- No CLI tests; e2e deferred to Testing Agent.

## Release decision
PASS — Credit Economy & Rewards is production-ready.

## Next department
08-Analytics-BI: AUTHORIZED.