# Scope — Department 09 (Admin Console)

## In scope
- Admin page with three tabs: Members, Audit Log, Workspace.
- Members: list WorkspaceMembership, invite a member (email + role) via base44.users.inviteUser + create membership + audit entry, change a member's role inline.
- Audit Log: list recent AuditLog entries (action, target, metadata, timestamp).
- Workspace: overview card (name, plan, status, billing source, Stripe customer).
- In-page guard: owner/admin only; non-admins see an "Admins only" screen.

## Out of scope (deferred)
- Revoke/remove members.
- Per-role permission matrix editor (roles are enum-based; fine-grained perms deferred).
- Workspace settings edit (plan changes via Billing; settings object editing deferred).
- Platform-admin / support tooling.
- Export audit log.