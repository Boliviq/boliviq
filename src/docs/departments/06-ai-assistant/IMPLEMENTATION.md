# Implementation — Department 06

## Entities created
- Conversation (base44/entities/Conversation.jsonc): workspace_id, title. RLS owner/admin.
- Message (base44/entities/Message.jsonc): conversation_id, role (user/assistant), content. RLS owner/admin.

## Pages added
- src/pages/Assistant.jsx — two-pane chat: conversation sidebar (create/switch/delete) + thread (suggestions, auto-scroll, send-on-Enter). Builds workspace context from Property/ConstructionProject/Contact and calls Core.InvokeLLM.

## Files modified
- src/App.jsx — import + `/assistant` route.
- src/components/AppTopBar.jsx — NAV (AI Assistant added).

## Integration
- Core.InvokeLLM({ prompt, model: "automatic" }) called from the page after assembling: system instruction + live workspace context (20 properties, 10 projects, 10 contacts) + transcript. Reply persisted as an assistant Message.

## Reused
- workspaceContext; shadcn primitives; lucide icons; base44.integrations.Core.