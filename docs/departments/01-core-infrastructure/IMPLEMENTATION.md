# Implementation — Department 01

## Entities created (11)
Workspace, WorkspaceMembership, Invitation, Property, Subscription, Entitlement, CreditWallet, LedgerEntry, AuditLog, AgentDefinition, AgentRun.

Each entity is a Base44 JSON schema file under `base44/entities/`. Built-in fields (id, created_date, updated_date, created_by_id) are implicit.

## RLS strategy
- **Workspace, Property, AgentRun:** owner (`created_by_id == user.id`) OR admin.
- **WorkspaceMembership, Invitation:** self (`user_id`/`email == user`) OR admin.
- **Subscription, Entitlement, CreditWallet, AuditLog, LedgerEntry:** admin-only. This isolates financial records to workspace admins.
- **LedgerEntry, AuditLog:** `update: false`, `delete: false` (immutable append-only).

## Backend functions
- `base44/functions/createWorkspace/entry.ts` — auth + name/slug validation; creates Workspace, WorkspaceMembership (owner), Subscription (free), CreditWallet, AuditLog.
- `base44/functions/logAudit/entry.ts` — auth + active-membership authorization; writes AuditLog with optional target/metadata.

## Frontend
- `src/lib/workspaceContext.jsx` — fetches memberships/workspaces, manages active workspace + role, persists selection.
- `src/pages/Workspaces.jsx` — list/create/select workspaces.
- `src/components/boliviq/SectionNav.jsx` — Workspaces nav link.
- `src/App.jsx` — `/workspaces` route wrapped in `WorkspaceProvider`.

## Files added
- base44/entities/{Workspace,WorkspaceMembership,Invitation,Property,Subscription,Entitlement,CreditWallet,LedgerEntry,AuditLog,AgentDefinition,AgentRun}.jsonc
- base44/functions/createWorkspace/entry.ts
- base44/functions/logAudit/entry.ts
- src/lib/workspaceContext.jsx
- src/pages/Workspaces.jsx

## Files modified
- src/App.jsx (route + provider)
- src/components/boliviq/SectionNav.jsx (nav)