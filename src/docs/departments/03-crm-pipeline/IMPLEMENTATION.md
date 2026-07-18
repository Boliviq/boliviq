# Implementation — Department 03

## Entity created
- Contact (base44/entities/Contact.jsonc): full_name, email, phone, company, role, type, stage, notes, tags, property_id. RLS owner/admin.

## Pages added
- src/pages/Properties.jsx — pipeline (kanban) + list tabs; add/edit dialog; delete; drag-to-move status; empty + loading + no-workspace states.
- src/pages/Contacts.jsx — contact cards grid; add/edit dialog; delete; empty/loading/no-workspace states.
- src/pages/Dashboard.jsx — stats (properties, pipeline value, ARV, profit potential); deals-by-stage pie (recharts); recent properties.

## Components added
- src/components/AppTopBar.jsx — sticky app shell nav (Dashboard, CRM, Contacts, Workspaces, Billing) + active workspace name.
- src/components/crm/PropertyForm.jsx — controlled form (address, status, deal_strategy, type, occupancy, valuation, ARV, notes).
- src/components/crm/PropertyCard.jsx — kanban card (address, strategy badge, valuation, ARV).
- src/components/crm/PipelineBoard.jsx — DragDropContext kanban; onDragEnd → Property.update(status).
- src/components/crm/ContactForm.jsx — controlled form (name, email, phone, company, role, type, stage, notes).

## Files modified
- src/App.jsx — imports + routes for Properties, Contacts, Dashboard (wrapped in WorkspaceProvider).
- src/components/AppTopBar.jsx — NAV array (Dashboard added).
- src/components/boliviq/SectionNav.jsx — CRM + Contacts marketing nav links.

## Reused
- Property entity (Department 01) for property database + pipeline.
- workspaceContext for active workspace + role.
- shadcn Dialog, Tabs, Select, Input, Label, Textarea, Badge, Button; recharts; @hello-pangea/dnd.