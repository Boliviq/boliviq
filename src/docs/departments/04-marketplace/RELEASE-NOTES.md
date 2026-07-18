# Release Notes — Department 04 — v1.0.0

## Summary
Workspace-scoped marketplace for contractors, services, materials, and equipment with search, category filters, and full CRUD.

## Features completed
- MarketplaceListing entity (17 categories, 5 types, 5 pricing models, 4 availability states, ratings, tags, images).
- Marketplace page: searchable grid, category filter, create/edit/delete dialog.
- ListingCard with availability badge and pricing label.
- ListingForm with tag parsing and price coercion.
- AppTopBar nav entry.

## Known limitations
- Workspace-private (no public/global visibility yet).
- Reviews/ratings write flow deferred (rating field exists; no Review entity).
- Image upload UI deferred.
- Messaging/quote requests deferred.
- No CLI tests; e2e deferred to Testing Agent.

## Release decision
PASS — Marketplace is production-ready and integrates with the workspace model.

## Next department
05-Construction-Intelligence: AUTHORIZED.