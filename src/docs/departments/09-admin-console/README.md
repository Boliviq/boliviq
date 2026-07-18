# Department 09 — Admin Console

**Release:** boliviq-dept-09-v1.0.0
**Status:** PASS
**Rollback point:** Base44 Version History checkpoint at end of Department 09.

## What this department delivered
An admin-only console for member management, audit-log review, and workspace overview.

## Key artifacts
- Page: Admin (Members / Audit Log / Workspace tabs).
- Component: InviteMemberForm.
- Route: `/admin` (owner/admin guarded in-page). Nav added to AppTopBar.
- Reuses WorkspaceMembership, AuditLog, Workspace entities; base44.users.inviteUser.