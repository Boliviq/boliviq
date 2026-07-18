# Implementation — Department 04

## Entity created
- MarketplaceListing (base44/entities/MarketplaceListing.jsonc): 17 trade categories, 5 listing types, 5 pricing models, 4 availability states, rating/review_count, images, tags, status. RLS owner/admin.

## Pages added
- src/pages/Marketplace.jsx — searchable grid, category filter, create/edit/delete dialog, empty/loading/no-workspace states.

## Components added
- src/components/marketplace/ListingForm.jsx — controlled form; parses comma-separated tags; coerces price to number.
- src/components/marketplace/ListingCard.jsx — card with category/type, availability badge, pricing label, rating, location, edit/delete actions.

## Files modified
- src/App.jsx — import + `/marketplace` route (WorkspaceProvider-wrapped).
- src/components/AppTopBar.jsx — NAV array (Marketplace added between CRM and Contacts).

## Reused
- workspaceContext for active workspace.
- shadcn Dialog, Input, Label, Textarea, Button, Badge.
- Pattern mirrors Properties/Contacts pages (Department 03).