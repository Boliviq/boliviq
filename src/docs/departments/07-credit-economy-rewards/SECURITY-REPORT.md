# Security Report — Department 07

## Checks performed
- RLS: Coupon admin-only (only admins can read/create/modify coupons; redemption happens server-side via service role, so users never need direct Coupon read access). Referral owner/admin.
- Authorization: redeemCoupon verifies auth + active workspace membership before any wallet mutation.
- Validation: code uppercased/trimmed; expiry checked; max_uses enforced; credits-type enforced.
- Ledger integrity: immutable LedgerEntry written per grant (update/delete false on LedgerEntry). AuditLog written.
- No secrets/PII added; no disabled auth.

## Findings
- None critical or high.

## Notes
- usage_count increment is read-then-write (no row lock); concurrent redemptions could slightly over-grant. Acceptable for v1; documented in known issues. Idempotency on the ledger reference (coupon:<code> per workspace) could be added later to dedupe.