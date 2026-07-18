# Scope — Department 01

## In scope
- Multi-tenant data model: Workspace, WorkspaceMembership, Invitation, Property.
- Billing data model: Subscription, Entitlement, CreditWallet, LedgerEntry.
- Observability: AuditLog, AgentDefinition, AgentRun.
- Row-Level Security: owner-scoped reads/updates; admin-only for financial/audit records; immutable ledger + audit (update/delete = false).
- `createWorkspace` function: provisions workspace, owner membership, free subscription, credit wallet, audit entry.
- `logAudit` function: workspace-membership-authorized audit writes.
- `WorkspaceProvider` context (active workspace, role, persistence).
- `Workspaces` page: list, create, select.

## Out of scope (deferred)
- Team workspace sharing UI (invitations accept flow).
- Property CRUD UI (Department 05).
- Billing UI and Stripe (Department 02).
- Agent execution runtime (Department 07).