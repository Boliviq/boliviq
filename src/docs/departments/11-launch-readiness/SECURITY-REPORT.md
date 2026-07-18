# Security Report — Department 11 (platform-wide summary)

## RLS posture (all owner/admin unless noted)
- Owner/admin: Property, Contact, MarketplaceListing, ConstructionProject, ConstructionTask, Conversation, Message, Referral, Workspace.
- Admin-only: Subscription, CreditWallet, Entitlement, LedgerEntry (create admin; update/delete false), AuditLog (create admin; update/delete false), Coupon, WorkspaceMembership (create/update/delete admin), Invitation.
- Open read: AgentDefinition (create/update/delete admin).

## Auth & secrets
- Auth is platform-managed (no custom auth backend).
- Secrets: Stripe secret/publishable keys, webhook secrets — stored as platform env vars; never in code/repo.
- Stripe webhook signature verification enforced (stripeWebhook).
- redeemCoupon + chargeCredits verify auth + active workspace membership before any wallet mutation.
- Immutable ledger (LedgerEntry update/delete false) + audit trail (AuditLog immutable).

## Findings
- None critical or high.
- Known hardening opportunities (deferred): coupon usage_count concurrency (read-then-write); team-wide record sharing via membership-aware RLS; percent coupons at Stripe checkout.

## Conclusion
Security posture is production-ready for launch subject to live verification on publish.