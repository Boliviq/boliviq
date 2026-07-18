# Migrations — Department 02

No new entities were created in this department (Subscription, Entitlement, CreditWallet, LedgerEntry were provisioned in Department 01). This department wires Stripe to those existing entities.

## Behavioral changes
- `Subscription`: now written by the webhook on `checkout.session.completed` (upsert) and lifecycle events.
- `Workspace.plan` / `billing_source` / `subscription_id` / `stripe_customer_id`: set by checkout + webhook flows.
- `CreditWallet.balance`: incremented by credit-pack purchase; decremented by `chargeCredits`.
- `LedgerEntry`: appended on purchase (`pack_purchase`) and charge (`charge`). Immutable.
- `Entitlement`: readable for overrides; plan defaults live in `checkEntitlement` code.

## Rollback note
Base44 schema is forward-only. Rollback = revert function code via Base44 Version History; data (subscriptions, ledger) is retained. No destructive schema change to undo.