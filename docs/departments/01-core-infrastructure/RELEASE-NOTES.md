# Release Notes — Department 01 — v1.0.0

## Summary
Foundation of the Boliviq multi-tenant platform: 11 entities with owner/admin RLS, immutable ledger and audit, workspace provisioning, and the workspace management UI.

## Features completed
- Multi-tenant workspace model with owner-scoped isolation.
- Membership + invitation entities.
- Billing data model (subscription, entitlement, credit wallet, immutable ledger).
- Immutable audit log.
- Agent definition + run registry.
- `createWorkspace` and `logAudit` backend functions (tested).
- Workspace selection + creation UI with active-workspace context.

## Known limitations
- Team sharing (invitation accept flow) deferred.
- No CLI test suite; e2e validation via Testing Agent pending publish.

## Release decision
PASS — core infrastructure is stable and serves as the base for Department 02.

## Next department
02-Billing-Subscriptions: AUTHORIZED.