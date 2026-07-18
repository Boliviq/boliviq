# Rollback — Department 09

## Rollback point
Base44 Version History checkpoint at end of Department 09.

## Application rollback steps
1. Open Version History → select Department 09 completion checkpoint → publish/revert.
2. Remove `/admin` route from App.jsx + NAV entry in AppTopBar.

## Data rollback steps
None — no data changes beyond audit entries (immutable, retained).

## Integration rollback
None (uses platform inviteUser + existing entities).

## Verification after rollback
- App loads; all other routes still work.