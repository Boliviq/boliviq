# Release Notes — Department 03 — v1.0.0

## Summary
CRM core: property database, drag-and-drop deal pipeline, contacts, and an investor dashboard with portfolio metrics.

## Features completed
- Properties: pipeline (kanban) + list views, full CRUD, drag-to-change-status.
- Contacts: CRUD card grid with type/stage.
- Investor dashboard: property count, pipeline value, total ARV, profit potential, deals-by-stage pie, recent properties.
- App shell (AppTopBar) with consistent navigation.
- Workspace-scoped pages with empty/loading/no-workspace states.

## Known limitations
- Contact↔property linking field exists; UI wiring deferred.
- Follow-up activity/tasks deferred to Phase 6.
- Team-wide record visibility limited to owner/admin RLS pattern.

## Release decision
PASS — CRM, pipeline, and contacts are production-ready and integrate with the workspace model from Department 01.

## Next department
04-Marketplace: AUTHORIZED.