# Department 04 — Marketplace

**Release:** boliviq-dept-04-v1.0.0
**Status:** PASS
**Rollback point:** Base44 Version History checkpoint at end of Department 04.

## What this department delivered
A workspace-scoped marketplace for contractors, services, materials, and equipment with search, category filters, and full CRUD.

## Key artifacts
- New entity: MarketplaceListing (owner/admin RLS).
- Page: Marketplace (grid + search + category filter + create/edit/delete dialog).
- Components: ListingForm, ListingCard.
- Route: `/marketplace` (workspace-scoped). Nav added to AppTopBar.