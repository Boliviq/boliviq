# Migrations — Department 04

## Entity created
| Order | Entity | Purpose | RLS |
|---|---|---|---|
| 013 | MarketplaceListing | Marketplace services/materials/equipment listings | owner/admin |

No existing entities modified.

## Rollback note
Forward-only schema. To remove, revert entity JSON via Base44 Version History; created records are retained. No destructive change required.