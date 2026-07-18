# Department 01 — Core Infrastructure

**Release:** boliviq-dept-01-v1.0.0
**Status:** PASS
**Rollback point:** Base44 Version History checkpoint immediately before Department 02 work began.

## What this department delivered

The foundational multi-tenant infrastructure for Boliviq: workspace isolation, membership, invitations, properties, the billing data model, the credit ledger, audit logging, agent definitions/runs, and the workspace management UI.

## Key artifacts

- 11 entities provisioned with owner-scoped + admin RLS.
- 2 backend functions: `createWorkspace`, `logAudit`.
- `WorkspaceProvider` context + `Workspaces` management page.
- Navigation integration.