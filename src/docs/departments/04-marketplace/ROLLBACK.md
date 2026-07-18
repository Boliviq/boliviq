# Rollback — Department 04

## Rollback point
Base44 Version History checkpoint at end of Department 04.

## Application rollback steps
1. Open Version History → select the Department 04 completion checkpoint.
2. Publish/revert to that version.
3. Remove `/marketplace` from App.jsx and the NAV entry in AppTopBar (routes are harmless without data).

## Data rollback steps
No destructive changes. MarketplaceListing records are user-owned tenant data; do not delete on rollback.

## Integration rollback
No integrations added in this department.

## Verification after rollback
- App loads; `/properties`, `/contacts`, `/dashboard`, `/billing` still work.