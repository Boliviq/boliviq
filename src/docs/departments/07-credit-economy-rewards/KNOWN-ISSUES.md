# Known Issues — Department 07

- **Percent coupons**: not wired to Stripe checkout (credits-type coupons redeem here; percent-type requires Stripe promotion codes).
- **Referral automation**: no auto-tracking on signup/conversion; referrals logged manually for v1.
- **Concurrency**: usage_count read-then-write (no row lock); rare concurrent redemptions may slightly over-grant.
- **AI metering**: per-call credit charging for the AI Assistant not yet wired.
- **Automated tests**: no CLI runner; e2e deferred to Testing Agent.

No critical or high-severity defects.