# Scope — Department 04 (Marketplace)

## In scope
- MarketplaceListing entity: title, description, category (17 trades), listing_type, provider name/contact, location, service area, pricing model, price, availability, rating, tags, images, status.
- Marketplace page: searchable grid, category filter, create/edit/delete.
- ListingCard with availability badge, pricing label, rating, location.
- ListingForm with controlled inputs and tag parsing.
- Workspace-scoped pages with empty/loading/no-workspace states.

## Out of scope (deferred)
- Public/global marketplace visibility (currently workspace-private; owner/admin RLS).
- Reviews/ratings write flow (rating field exists; no Review entity yet).
- Messaging/quote requests between buyers and providers.
- Image uploads (field exists; upload UI deferred).
- Booking/scheduling.
- Payments for marketplace services (uses Billing credits/Stripe separately).