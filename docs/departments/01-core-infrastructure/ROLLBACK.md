# Rollback — Department 01

## Rollback point
Base44 Version History checkpoint immediately before Department 02 work began.

## Application rollback steps
1. In Base44, open Version History (clock icon).
2. Locate the checkpoint captured at the end of Department 01 (pre-Department-02).
3. Preview to confirm, then "Publish this version" (safe — keeps current draft) or "Revert to this version".

## Data rollback steps
Department 01 created no irreversible data changes. Created workspaces/subscriptions/wallets are user-owned tenant data and should NOT be rolled back. If a schema-level issue is found, apply a forward-fix (new entity version) rather than deleting data.

## Environment / integration rollback
No environment variables were introduced in Department 01 (Stripe keys belong to Department 02). No integrations to roll back.

## Verification after rollback
- `Workspaces` page loads and lists existing workspaces.
- `createWorkspace` function returns 200.