# Migrations — Department 11

No new migrations. This department consolidates the schema state across Departments 01–10.

## Final entity inventory (19 entities)
Workspace, WorkspaceMembership, Invitation, Subscription, CreditWallet, LedgerEntry, AuditLog, Entitlement, Property, Contact, MarketplaceListing, ConstructionProject, ConstructionTask, Conversation, Message, Coupon, Referral, AgentDefinition, AgentRun (+ built-in User).

All schema changes are forward-only; revert via Base44 Version History per-department rollback points.