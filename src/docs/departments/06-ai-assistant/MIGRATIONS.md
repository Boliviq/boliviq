# Migrations — Department 06

## Entities created
| Order | Entity | Purpose | RLS |
|---|---|---|---|
| 016 | Conversation | AI assistant chat sessions | owner/admin |
| 017 | Message | Messages within a conversation | owner/admin |

No existing entities modified.

## Rollback note
Forward-only schema. Revert via Version History; chat records are user-owned tenant data and retained. No destructive change.