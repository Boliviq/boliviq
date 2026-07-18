# Rollback — Department 03

## Rollback point
Base44 Version History checkpoint at end of Department 03.

## Application rollback steps
1. Open Version History → select the Department 03 completion checkpoint.
2. "Publish this version" or "Revert to this version".
3. Remove `/properties`, `/contacts`, `/dashboard` from App.jsx (or keep — routes are harmless without data).

## Data rollback steps
No destructive changes. Property and Contact records are user-owned tenant data; do not delete on rollback. The Contact entity can remain; reverting code simply removes the pages.

## Integration rollback
No integrations added in this department.

## Verification after rollback
- App loads; `/workspaces` and `/billing` still work.