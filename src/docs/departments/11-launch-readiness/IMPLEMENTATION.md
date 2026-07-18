# Implementation — Department 11

## Verification performed (in-builder)
- src/App.jsx audit: 14 routes registered; all page imports present; `<Routes>` contains only `<Route>` elements; scaffold (AuthProvider, QueryClientProvider, Router, Toaster, ScrollToTop) intact; WorkspaceProvider wraps workspace-scoped routes.
- Backend functions inventory: chargeCredits, checkEntitlement, createBillingPortalSession, createCheckoutSession, createWorkspace, getBillingState, logAudit, redeemCoupon, stripeWebhook (9 functions).
- Entities inventory: Workspace, WorkspaceMembership, Invitation, Subscription, CreditWallet, LedgerEntry, AuditLog, Entitlement, Property, Contact, MarketplaceListing, ConstructionProject, ConstructionTask, Conversation, Message, Coupon, Referral, AgentDefinition, AgentRun (19 entities).
- PWA: manifest + meta + mobile nav verified.
- Governance: every department 01–10 has README/SCOPE/IMPLEMENTATION/TEST-REPORT/SECURITY-REPORT/MIGRATIONS/ROLLBACK/RELEASE-NOTES/KNOWN-ISSUES.

## No new code
This department adds no application code; it is the readiness gate and documentation consolidation.