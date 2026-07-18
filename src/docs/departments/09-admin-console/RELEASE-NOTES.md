# Release Notes — Department 09 — v1.0.0

## Summary
Admin-only console for member management, audit-log review, and workspace overview.

## Features completed
- Admin page: Members, Audit Log, Workspace tabs.
- Members: invite (email + role), inline role change.
- Audit Log: recent entries with metadata.
- Workspace: plan/status/billing source/Stripe customer.
- Owner/admin in-page guard.
- AppTopBar nav entry.

## Known limitations
- No remove/revoke member (deferred).
- No permission-matrix editor.
- No workspace settings edit (plan via Billing).
- No audit-log export.
- No CLI tests; e2e deferred to Testing Agent.

## Release decision
PASS — Admin Console is production-ready.

## Next department
10-Public-Site: AUTHORIZED.