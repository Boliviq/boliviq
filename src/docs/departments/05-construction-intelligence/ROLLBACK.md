# Rollback — Department 05

## Rollback point
Base44 Version History checkpoint at end of Department 05.

## Application rollback steps
1. Open Version History → select Department 05 completion checkpoint → publish/revert.
2. Remove `/construction` routes from App.jsx + NAV entry in AppTopBar.

## Data rollback steps
No destructive changes. Project/Task records are user-owned tenant data; do not delete on rollback.

## Integration rollback
No integrations added.

## Verification after rollback
- App loads; `/marketplace`, `/properties`, `/dashboard`, `/billing` still work.