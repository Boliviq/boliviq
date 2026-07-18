# Migrations — Department 01

Base44 entities are JSON schema files (not SQL). "Migrations" here are schema-version records.

## Schema created (initial)
| Order | Entity | Purpose | RLS |
|---|---|---|---|
| 001 | Workspace | Tenant root | owner/admin |
| 002 | WorkspaceMembership | User↔workspace + role | self/admin |
| 003 | Invitation | Pending invites | self(by email)/admin |
| 004 | Property | Real estate records | owner/admin |
| 005 | Subscription | Plan + status | admin |
| 006 | Entitlement | Feature flags/limits | admin |
| 007 | CreditWallet | AI credit balance | admin |
| 008 | LedgerEntry | Immutable credit ledger | admin, immutable |
| 009 | AuditLog | Immutable audit trail | admin, immutable |
| 010 | AgentDefinition | AI agent registry | public read/admin write |
| 011 | AgentRun | Agent execution records | owner/admin |

## Rollback note
Base44 schema is forward-only (no down-migration). Rollback = revert entity JSON via Base44 Version History; data created under a reverted schema is preserved by the platform. Where destructive changes are needed, prefer forward-fix migrations and document here.