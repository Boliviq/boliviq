# Known Issues — Department 11 (consolidated)

Carried from Departments 02–10 (no critical/high):
- Checkout blocked in builder iframe by design (works on publish).
- Charge concurrency relies on idempotency keys (no row-level locking).
- Coupon usage_count is read-then-write (minor concurrency risk).
- Live InvokeLLM response unverified in sandbox.
- No offline service worker (online-only PWA).
- No automated e2e in sandbox (Testing Agent on publish).
- Team-wide record visibility limited to owner/admin RLS (no membership-aware sharing).
- Percent coupons not wired to Stripe checkout.

## Pre-launch actions required
1. Publish the app.
2. Run Testing Agent e2e (goals in TEST-REPORT.md).
3. Run Lighthouse; address perf/a11y findings.
4. Verify live Stripe Checkout + portal + webhook in live mode.
5. Verify add-to-home-screen on iOS/Android.
6. Connect GitHub 2-way sync (Dashboard → GitHub) for repo-level version control.

No critical or high-severity defects block launch.