# Release Notes — Department 06 — v1.0.0

## Summary
In-app conversational AI assistant reasoning over live workspace data with persistent chat history.

## Features completed
- Conversation + Message entities (persisted chat history).
- Assistant page: conversation sidebar (create/switch/delete), message thread, suggestion prompts, auto-scroll, send-on-Enter.
- Workspace-aware prompts: live context (properties, projects, contacts) injected per call.
- Core.InvokeLLM integration (wired; live response verification pending publish — sandbox exec auth blocks the smoke test).
- AppTopBar nav entry.

## Known limitations
- No per-call credit charging yet (deferred to Phase 7 wiring with chargeCredits).
- No streaming (full-text response).
- No file/image attachments.
- No structured tool-calling / multi-agent routing (Phase 5 deep AI).
- No voice input (Phase 6).
- No CLI tests; e2e deferred to Testing Agent.

## Release decision
PASS (code-complete; live LLM response to be re-verified on publish).

## Next department
07-Credit-Economy-Rewards: AUTHORIZED.