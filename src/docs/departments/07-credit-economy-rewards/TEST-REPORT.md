# Test Report — Department 07

## Tests executed
- Backend: redeemCoupon tested via test_backend_function with a non-member workspace id → returned 403 Forbidden. This confirms the auth + active-membership gate works correctly (the function correctly refuses non-members before any data access). The invalid-code (404) and grant paths require a real member session and are verified by code review + pending live test on publish.
- Code-path review: valid credits coupon → wallet balance incremented, ledger entry (adjustment), usage_count incremented, status flipped to redeemed at max, audit logged.
- Manual path (pending publish): Rewards loads → balance shown → redeem code → balance updates → admin creates coupon → appears in list → referral code copy.

## Results
- redeemCoupon authorization gate: PASS (403 on non-member, confirmed via test_backend_function).
- redeemCoupon grant/ledger path: code-reviewed; uses the same proven pattern as chargeCredits; live verification pending publish.
- Coupon CRUD (admin): PASS (SDK create + list).
- Referral code derivation: deterministic from workspace id.

## Not covered
- Percent coupons at Stripe checkout (deferred — needs Stripe coupon wiring).
- Concurrency on usage_count increment (relies on read-then-write; acceptable for v1, noted).
- Live e2e on published app (Testing Agent).