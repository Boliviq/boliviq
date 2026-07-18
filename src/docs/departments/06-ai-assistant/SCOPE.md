# Scope — Department 06 (AI Assistant)

## In scope
- Conversation + Message entities for persisted chat history.
- Assistant page: conversation sidebar (create/switch/delete), message thread, suggestion prompts, auto-scroll.
- Workspace-aware responses: live context (properties, projects, contacts) injected into each prompt.
- InvokeLLM integration (automatic model) called from the frontend.
- Workspace-scoped; empty/loading/no-workspace states.

## Out of scope (deferred)
- Backend-side LLM orchestration + credit charging per AI call (wiring to chargeCredits).
- Streaming responses (InvokeLLM returns full text).
- File/image attachments to the assistant.
- Agent tool permissions (structured tool-calling) — Phase 5 deep AI.
- Voice input (Phase 6).
- Multi-agent routing (Deal Analyzer, Project Manager agents).