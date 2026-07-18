# Scope — Department 05 (Construction Intelligence)

## In scope
- ConstructionProject entity: name, description, status (planning/in_progress/on_hold/completed/cancelled), start/target dates, budget, spent, progress, property link.
- ConstructionTask entity: title, status (todo/in_progress/done/blocked), assignee, due date, cost estimate, actual cost.
- Construction page: project grid with progress + budget bars, create/edit dialog, link to property.
- ProjectDetail page: budget utilization, remaining, over-budget alert, 4-column task board with CRUD.
- Workspace-scoped pages with empty/loading/not-found/no-workspace states.

## Out of scope (deferred)
- Blueprint/plan file analysis (Phase 5 AI).
- Gantt/timeline scheduling view.
- Photo documentation & progress capture.
- Contractor coordination / messaging (uses Marketplace).
- Automated budget alerts (notifications deferred).
- Mobile push for task assignment.