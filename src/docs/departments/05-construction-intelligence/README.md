# Department 05 — Construction Intelligence

**Release:** boliviq-dept-05-v1.0.0
**Status:** PASS
**Rollback point:** Base44 Version History checkpoint at end of Department 05.

## What this department delivered
Construction project management with budget tracking, progress visualization, and a status-based task board.

## Key artifacts
- New entities: ConstructionProject, ConstructionTask (owner/admin RLS).
- Pages: Construction (project grid + CRUD), ProjectDetail (budget summary + task kanban + task CRUD).
- Components: ProjectForm, ProjectCard, TaskForm.
- Routes: `/construction`, `/construction/:id`. Nav added to AppTopBar.