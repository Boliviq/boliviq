# Rollback — Department 06

## Rollback point
Base44 Version History checkpoint at end of Department 06.

## Application rollback steps
1. Open Version History → select Department 06 completion checkpoint → publish/revert.
2. Remove `/assistant` route from App.jsx + NAV entry in AppTopBar.

## Data rollback steps
No destructive changes. Conversation/Message records are user-owned; do not delete on rollback.

## Integration rollback
No new integrations/secrets (InvokeLLM is built-in).

## Verification after rollback
- App loads; `/construction`, `/marketplace`, `/properties`, `/dashboard`, `/billing` still work.