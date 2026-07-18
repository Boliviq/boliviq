# Migrations — Department 07

## Entities created
| Order | Entity | Purpose | RLS |
|---|---|---|---|
| 018 | Coupon | Promo codes (credits/percent) | admin |
| 019 | Referral | Referral records | owner/admin |

No existing entities modified. Reuses CreditWallet, LedgerEntry, AuditLog (Dept 02).

## Rollback note
Forward-only schema. Revert via Version History; coupon/referral records are tenant data and retained.