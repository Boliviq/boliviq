# Department 03 — CRM, Pipeline & Contacts

**Release:** boliviq-dept-03-v1.0.0
**Status:** PASS
**Rollback point:** Base44 Version History checkpoint at end of Department 03.

## What this department delivered
The CRM core: property database, drag-and-drop deal pipeline, contacts, and an investor dashboard.

## Key artifacts
- New entity: Contact (owner/admin RLS).
- Pages: Properties (pipeline + list, CRUD), Contacts (CRUD), Dashboard (portfolio overview).
- Components: AppTopBar (app shell), PropertyForm, PropertyCard, PipelineBoard (dnd), ContactForm.
- Routes: `/properties`, `/contacts`, `/dashboard` (all workspace-scoped).
- Nav: AppTopBar + marketing SectionNav links.