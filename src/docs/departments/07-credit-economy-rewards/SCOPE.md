# Scope — Department 07 (Credit Economy, Rewards & Coupons)

## In scope
- Coupon entity: code, type (credits/percent), value, status, max_uses, usage_count, expiry. Admin-only RLS.
- Referral entity: referral code, referred email, status, reward credits. Owner/admin RLS.
- redeemCoupon backend function: validate (active/expired/limit), grant credits to wallet, ledger entry (type adjustment), audit log, increment usage / mark redeemed.
- Rewards page: credit balance, referral code + copy, coupon redemption input, admin coupon list + create dialog, referrals list.

## Out of scope (deferred)
- Percent coupons at Stripe checkout (requires Stripe coupon/promotion code wiring).
- Auto-referral tracking on signup (referrals are manual/logged for v1).
- Referral reward auto-grant on conversion.
- Usage analytics / leaderboard.
- AI per-call credit metering wiring (Dept 06 follow-up).