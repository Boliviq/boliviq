# Implementation — Department 09

## Pages added
- src/pages/Admin.jsx — tabbed console; parallel load (WorkspaceMembership, Workspace, AuditLog); invite flow (inviteUser + create membership + audit); inline role change; owner/admin guard.

## Components added
- src/components/admin/InviteMemberForm.jsx — email + role select.

## Files modified
- src/App.jsx — import + `/admin` route.
- src/components/AppTopBar.jsx — NAV (Admin added).

## Reused
- WorkspaceMembership, AuditLog, Workspace entities; base44.users.inviteUser; workspaceContext (role); shadcn Dialog/Input/Label/Button/Badge.