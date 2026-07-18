# Security Report — Department 06

## Checks performed
- RLS: Conversation & Message owner/admin. A user can only read/modify their own chats; admins see all.
- Authorization: SDK calls are user-scoped (RLS server-enforced). Workspace context is loaded only after the page confirms an active workspace (membership enforced by RLS on entities).
- Prompt hygiene: workspace data is summarized server-side via SDK (user-scoped); no credentials in prompts. LLM output is rendered as text (React escapes); no dangerouslySetInnerHTML.
- No secrets/PII added; InvokeLLM is a built-in integration (no key handling).

## Findings
- None critical or high.

## Notes
- AI replies are not sanitized for advisability; the assistant is informational. Financial/legal advice disclaimers are a content concern, not a security vulnerability — deferred.
- Per-call credit charging is not yet enforced (deferred to Phase 7 wiring with chargeCredits).