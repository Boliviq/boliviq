# Known Issues — Department 02 — v1.0.0

- **Coupons / promotions**: not implemented (deferred to Phase 7).
- **Rewards & referrals**: `LedgerEntry.type` includes `referral`; flow not built (deferred to Phase 7).
- **AI Max metering**: entitlement flag `ai_agents_unlimited` exposed; consumption metering built in Phase 5/7.
- **Checkout in builder preview**: blocked by design (Stripe requires the published app context); enforced via iframe detection.
- **Charge concurrency**: read-modify-write on `CreditWallet.balance` is not transactional; duplicate logical charges prevented by `idempotency_key`.

No critical or high-severity defects.