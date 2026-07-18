# Department 06 — AI Assistant

**Release:** boliviq-dept-06-v1.0.0
**Status:** PASS
**Rollback point:** Base44 Version History checkpoint at end of Department 06.

## What this department delivered
An in-app conversational AI assistant that reasons over live workspace data (properties, projects, contacts) with persistent conversation history.

## Key artifacts
- New entities: Conversation, Message (owner/admin RLS).
- Page: Assistant (conversation sidebar + message thread + suggestion prompts).
- Route: `/assistant`. Nav added to AppTopBar.
- Integration: Core.InvokeLLM (called from frontend with assembled workspace context).