# Security Report — Department 01

## Checks performed
- Secret handling: no secrets in code; STRIPE_SECRET_KEY/STRIPE_PUBLISHABLE_KEY/STRIPE_WEBHOOK_SECRET stored as platform env vars. `.gitignore` excludes `.env`, `.env.*`, `*.local`.
- RLS coverage: every entity has an explicit `rls` block. Financial/audit entities are admin-only and immutable on update/delete.
- Authorization in functions: `createWorkspace` requires authenticated user; `logAudit` requires active membership in the target workspace (403 otherwise).
- No hardcoded credentials, admin backdoors, disabled auth, or commented-out authorization logic.

## Findings
- None critical or high.

## Notes
- Workspace RLS uses `created_by_id == user.id` OR admin. Co-owned workspaces (multiple members) rely on admin role; non-admin members of a workspace can read their own membership record but not other members' — acceptable for Department 01; revisit if collaboration requires broader member reads.