# Migrations — Department 05

## Entities created
| Order | Entity | Purpose | RLS |
|---|---|---|---|
| 014 | ConstructionProject | Construction projects (budget, progress, status) | owner/admin |
| 015 | ConstructionTask | Project tasks (status, assignee, costs) | owner/admin |

No existing entities modified.

## Rollback note
Forward-only schema. Revert via Version History; records retained. No destructive change.