# Implementation — Department 05

## Entities created
- ConstructionProject (base44/entities/ConstructionProject.jsonc): status, dates, budget/spent/progress, property_id. RLS owner/admin.
- ConstructionTask (base44/entities/ConstructionTask.jsonc): status, assignee, due_date, cost_estimate/actual_cost. RLS owner/admin.

## Pages added
- src/pages/Construction.jsx — project grid (progress + budget bars), create/edit dialog, property dropdown.
- src/pages/ProjectDetail.jsx — project header, budget summary (4 stats), budget utilization bar, 4-column task board with CRUD, not-found state.

## Components added
- src/components/construction/ProjectForm.jsx — controlled form; number coercion for budget/spent/progress.
- src/components/construction/ProjectCard.jsx — card with progress bar + budget bar + over-budget tone + status badge.
- src/components/construction/TaskForm.jsx — controlled task form with status/assignee/dates/costs.

## Files modified
- src/App.jsx — imports + `/construction` + `/construction/:id` routes.
- src/components/AppTopBar.jsx — NAV array (Construction added).

## Reused
- workspaceContext; shadcn Dialog/Input/Label/Textarea/Button/Badge; lucide icons; recharts-free budget bars (CSS).