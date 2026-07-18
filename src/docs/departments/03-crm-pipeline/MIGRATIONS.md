# Migrations — Department 03

## Entity created
| Order | Entity | Purpose | RLS |
|---|---|---|---|
| 012 | Contact | CRM contacts (investors, contractors, vendors, etc.) | owner/admin |

No existing entities modified. Property is reused as-is for the pipeline.

## Rollback note
Base44 schema is forward-only. To remove Contact, revert entity JSON via Base44 Version History; created contact records are retained by the platform. No destructive change required.