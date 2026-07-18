# Scope — Department 03 (CRM, Pipeline & Contacts)

## In scope
- Property database (uses existing Property entity) with full CRUD.
- Drag-and-drop deal pipeline (status-based kanban via @hello-pangea/dnd).
- List view with inline edit/delete.
- Contact entity + CRUD (investors, contractors, vendors, homeowners, agents, buyers, sellers).
- Investor dashboard: portfolio value, ARV, profit potential, deals-by-stage, recent properties.
- App shell (AppTopBar) with app-wide navigation.
- Workspace-scoped pages (require active workspace; prompt to select otherwise).

## Out of scope (deferred)
- Investor contact linking to properties (Contact.property_id field exists; UI wiring deferred).
- Activity/follow-up tasks (Phase 6 follow-up automation).
- Lead scoring / AI enrichment (Phase 5).
- Bulk import / export (later phase).