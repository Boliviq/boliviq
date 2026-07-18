# Implementation — Department 07

## Entities created
- Coupon (base44/entities/Coupon.jsonc): code, discount_type, value, status, max_uses, usage_count, expires_at. RLS admin.
- Referral (base44/entities/Referral.jsonc): referral_code, referred_email, status, reward_credits. RLS owner/admin.

## Backend function added
- base44/functions/redeemCoupon/entry.ts — auth + membership, case-insensitive code lookup, validates active/expired/max-uses, credits-type only, grants credits to CreditWallet, LedgerEntry (type adjustment, reference coupon:<code>), increments usage_count, marks redeemed at limit, AuditLog entry. Returns { ok, balance, credits }.

## Pages added
- src/pages/Rewards.jsx — balance card, referral code (BOLIVIQ-<ws suffix>) + copy, coupon redemption input → invoke redeemCoupon, admin coupon list + create dialog (CouponForm), referrals list.

## Components added
- src/components/rewards/CouponForm.jsx — code (uppercased), type, value, max_uses, expiry.

## Files modified
- src/App.jsx — import + `/rewards` route.
- src/components/AppTopBar.jsx — NAV (Rewards added).

## Reused
- CreditWallet, LedgerEntry, AuditLog (Department 02); workspaceContext; shadcn Dialog/Input/Label/Button/Badge.