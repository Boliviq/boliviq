# Rollback — Department 11

## Rollback point
Base44 Version History checkpoint at launch baseline (end of Department 11).

## Application rollback steps
1. Open Version History → select the launch baseline checkpoint → Publish/Revert.
2. For per-department rollback, use each department's documented checkpoint (Departments 01–10 each have a rollback point).

## Data rollback steps
No data changes in this department. Tenant data (workspaces, properties, projects, contacts, ledger, conversations) is retained on code rollback — do not auto-delete.

## Integration rollback
Stripe (live mode) remains configured; webhook + checkout code can be reverted independently via Version History.

## Verification after rollback
- App loads; `/` (Home) and `/workspaces` accessible; auth + workspace selection functional.