# Scope — Department 08 (Analytics & BI)

## In scope
- Analytics page aggregating Property, ConstructionProject, Contact, and MarketplaceListing.
- KPIs: property count, pipeline value, total ARV, over-budget projects, project/contact/listing counts.
- Charts: deals by stage (pie), deals by strategy (pie), contacts by type (pie), marketplace by category (pie), project budget vs spent (bar).
- Reusable chart components (CategoryPie, BudgetBar).
- Workspace-scoped; empty/loading/no-workspace states.

## Out of scope (deferred)
- Time-series / trend analytics (no historical snapshots yet).
- Export to CSV/PDF.
- Saved custom dashboards / widgets.
- Lighthouse + accessibility scoring (requires published app runtime).
- Admin settings panel (Phase 9).
- Automated test suite run (Testing Agent on publish).