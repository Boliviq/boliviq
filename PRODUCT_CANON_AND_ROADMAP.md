# Boliviq Product Canon & Implementation Roadmap

**Canon authority:** this document treats the 19-section canon pasted into this session on 2026-08-22 (Platform Overview through Design & Supply Profiles) as the sole authoritative product spec. Any older planning material found elsewhere in this repo — most notably `src/data/blueprint.js` / the in-app "Blueprint" page (`src/pages/Blueprint.jsx`), which contains a structurally different, older canon (Governance/Vision/Product sections, a different pricing model) — is **superseded** and should not be used to resolve ambiguity. That old content is still live in the running app and has not been updated or removed; flagging it here rather than silently rewriting a large hand-authored content file without confirmation. Whoever picks this up next should either replace `src/data/blueprint.js` to match this canon or retire the Blueprint page, rather than let two disagreeing canons coexist in the product.

**Purpose of this document:** the 19-canon product vision (pasted into a session on 2026-08-22) describes the full intended Boliviq ecosystem. This document reconciles that vision against what is **actually implemented in this codebase today**, so any AI agent (or human) picking up development work has an accurate starting point — what's real, what's scaffolded-but-unused, what's aspirational, and exactly where to look or start.

**Ground rule for whoever works from this doc:** never mark something "done" because a canon describes it — verify it against the current code (`base44/entities/`, `base44/functions/`, `src/pages/`) before building on top of it, the same way this document was built. Treat every status below as a starting hypothesis to re-check, not settled fact, since this repo has drifted before via bidirectional Base44 sync.

---

## 0. Actual stack (verified, not aspirational)

- Frontend: React 18 + Vite + react-router-dom + Tailwind v3 + shadcn/ui + `@tanstack/react-query`. Package manager: npm.
- Backend: **Base44** (a managed platform, not a self-hosted stack) — Deno serverless functions in `base44/functions/*/entry.ts`, JSON-Schema-with-RLS entity definitions in `base44/entities/*.jsonc`, cron/entity-trigger workflows in `base44/workflows/*.jsonc`.
- Hosting/deploy: Base44's own dashboard publishes the app; GitHub `main` bidirectionally syncs with Base44's visual builder. There is no VPS, no Docker/Coolify, no separate deploy pipeline to manage.
- Payments: Stripe (checkout + billing portal + webhooks), fully wired.
- No Supabase, no TanStack Start, no bun anywhere in this repo — several recent work orders described that stack; it does not apply here.

---

## 1. Real integrations inventory (Canon §9 reconciliation)

This is the section the task explicitly asked to get right — no invented coverage.

| Canon integration | Status here | Detail |
|---|---|---|
| Payments (Stripe) | ✅ **Connected** | `base44/functions/{createCheckoutSession,createBillingPortalSession,stripeWebhook,chargeCredits,redeemCoupon,validateCheckoutCoupon,grantMonthlyCredits}`. Handles checkout, portal, subscription lifecycle, `invoice.paid`/`invoice.payment_failed`, atomic credit ledger. |
| AI model provider | ✅ **Connected**, abstracted | Via Base44's own `Core.InvokeLLM` integration (used in `dealDiscovery`, `websiteChatbot`, `Assistant.jsx`'s prompt flow). Not a customer-supplied OpenAI/Anthropic key — Base44 manages the model call. There is no user-facing "paste your API key" flow anywhere in this codebase. |
| Email provider | ✅ **Connected**, abstracted | Via Base44's `Core.SendEmail` integration, used by `sendDealAlerts` and `dealScoutScan`. No dedicated provider (SendGrid/Postmark/etc.) is configured separately — it's whatever Base44's platform sends through. |
| Auth | ✅ **Connected** | Base44's own hosted auth: email/password + Google OAuth (`base44.auth.loginViaEmailPassword`, `loginWithProvider`). No SMS/mobile verification, no MFA — canon §2 expects both; neither exists in code. |
| File/document storage | ✅ **Connected**, implicit | `Property.photos`/`documents`, `MarketplaceListing.images` are string-array fields presumed to hold Base44-hosted file URLs (Base44's built-in storage). No explicit signed-URL or private-document-center implementation was found — worth verifying directly against Base44's file-upload docs before assuming private-by-default. |
| MLS / RESO (on-market listings) | 🟡 **Adapter built, not connected** | `base44/shared/dealDiscovery.ts` (`ON_MARKET_SOURCE`) + real OData call in `base44/functions/dealDiscovery/entry.ts`. Gated on `MLS_RESO_API_KEY` + `MLS_RESO_BASE_URL` env vars — unset today, so it honestly reports `connection_required` and returns zero fabricated results. |
| Off-market/public-record data (county assessor, tax delinquency, foreclosure/auction, code violations, absentee owner, probate, FSBO, expired listings, partner API) | 🔴 **Not connected** (9 sources) | Registered in `base44/shared/dealDiscovery.ts` (`OFF_MARKET_SOURCES`), each gated on its own env var, visible in Admin → Data Sources (`sourceConnectionStatus` function, `DataSourcesPanel.jsx`). Zero real providers wired — this is the single biggest gap between canon §9/§15 and reality. |
| Maps / geocoding | 🔴 **Not connected** | `Property` has `latitude`/`longitude` fields, but nothing populates them from an address — no Google Maps/Mapbox/geocoding call exists anywhere in the code. Deal Discovery's "location" filter is a plain text substring match against address/city/state/zip, not a real radius search. |
| SMS / voice | 🔴 **Not connected** | No Twilio or equivalent anywhere. |
| Calendar sync | 🔴 **Not connected** | No calendar entity, no Google/Outlook calendar integration. |
| E-signature | 🔴 **Not connected** | No DocuSign/HelloSign or equivalent. No contract/agreement entity at all. |
| Video meetings | 🔴 **Not connected** | No Zoom/Meet integration. |
| Accounting export | 🔴 **Not connected** | No QuickBooks/Xero integration. |
| CAPTCHA / bot protection | 🔴 **Not connected** | Only defense present is the in-memory per-instance rate limiter (`base44/shared/rateLimiter.ts`) on a handful of functions — not a real CAPTCHA. |
| Analytics (product) | 🟡 **Partial** | `src/pages/Analytics.jsx` exists but is a self-built dashboard over the app's own entities (property/contact/construction/listing counts), not a third-party product-analytics tool (Amplitude/Mixpanel/PostHog). |
| Error monitoring | 🔴 **Not connected** | No Sentry or equivalent. Errors are `console.log`'d inside Deno functions only. |
| Translation / multilingual | 🔴 **Not connected** | No i18n framework, no language switcher found. |

**Rule for future work (per canon §9):** when connecting any 🔴 item, follow the pattern already established for MLS/off-market — add the source to the registry with an explicit env-var gate, make it honestly report `connection_required` until configured, and never fabricate data to fill the gap.

---

## 2. Current data model (26 entities — `base44/entities/*.jsonc`)

| Entity | Purpose | Access pattern |
|---|---|---|
| `Workspace` | Tenant root: plan, billing_source, stripe_customer_id | RLS creator-only; real access via `listMyWorkspaces`/`manageWorkspaceMembers` |
| `WorkspaceMembership` | User↔workspace + role (owner/admin/manager/member/finance/contractor/agent/viewer/support/platform_admin) + status | RLS platform-admin-only; real access via service-role functions |
| `Invitation` | Token-based invite schema — **defined but unused**; actual invite flow uses `WorkspaceMembership.status:'invited'` + email placeholder instead. Dead code, flagged, never reconciled. | n/a |
| `Property` | Core deal/CRM record: address fields, status pipeline, deal_strategy, valuation/ARV/asking_price/estimated_rehab, `visibility` (public/private — powers Deal Discovery's marketplace source), `source`/`source_type`/`distress_indicators`/`days_on_market` (Deal Discovery fields) | Workspace-scoped via `workspaceRecords` function |
| `Contact` | CRM contacts | Workspace-scoped via `workspaceRecords` |
| `ConstructionProject` / `ConstructionTask` | Project + task tracking, budget/spent/progress | Workspace-scoped via `workspaceRecords` |
| `MarketplaceListing` | Contractor/vendor **service** listings (not property listings) — categories are trades (plumbing, roofing, etc.) | Workspace-scoped via `workspaceRecords` |
| `BuyBox` | Investor saved search criteria + monitor/auto-add-to-pipeline flags | Workspace-scoped via `workspaceRecords` |
| `DealAlert` | Legacy location/price/strategy email-alert subscriptions (predates BuyBox; still wired to `sendDealAlerts`) | User-scoped, direct entity access from `DealAlerts.jsx` |
| `Coupon` / `Referral` | Discount codes, referral tracking | Coupon via `manageCoupons`; Referral direct entity access (unreconciled — see §9 note below) |
| `CreditWallet` / `LedgerEntry` | AI credit balance + immutable append-only transaction ledger | Platform-admin RLS; real access only via service-role functions (`chargeCredits`, `redeemCoupon`, `grantMonthlyCredits`, `stripeWebhook`) |
| `Subscription` / `Entitlement` | Active plan record; per-feature overrides | Platform-admin RLS; real access via `getBillingState`/`checkEntitlement` |
| `AuditLog` | Immutable action log | Platform-admin RLS; written by nearly every function |
| `SecurityEvent` / `RlsEvent` | Security-monitoring records for `securitySentinel`/`foundationHealth` | Platform-admin RLS |
| `Conversation` / `Message` | AI Assistant chat history (not human-to-human messaging — see canon §4 gap) | Direct entity access (user-scoped) |
| `KnowledgeArticle` | Public knowledge-base content | Public read, admin write |
| `AgentDefinition` / `AgentRun` | **Scaffolded, not wired to real logic** — entities exist for a multi-agent system (canon §7's specialized agents) but nothing in `base44/functions/` currently creates an `AgentRun` or dispatches to an `AgentDefinition`. This is the concrete starting point for building canon §7's specialized-agent roster. | Public-ish read; unused in practice |
| `JobEstimate` | Referenced in entity list; not observed wired to any function or page in this session's work — verify before assuming it's live. | Unverified |
| `User` | Base44 built-in + one custom field: `role` (admin/user) — this is the **platform-wide** admin flag, distinct from `WorkspaceMembership.role` | Base44-managed |

---

## 3. Current backend functions (30 — `base44/functions/`)

**Billing/credits:** `createCheckoutSession`, `createBillingPortalSession`, `stripeWebhook`, `chargeCredits`, `redeemCoupon`, `validateCheckoutCoupon`, `grantMonthlyCredits`, `getBillingState`, `checkEntitlement`, `manageCoupons`

**Workspace/team:** `createWorkspace`, `inviteWorkspaceMember`, `acceptWorkspaceInvites`, `manageWorkspaceMembers`, `listMyWorkspaces`, `workspaceRecords` (generic CRUD for Property/Contact/ConstructionProject/ConstructionTask/MarketplaceListing/BuyBox)

**Deal Discovery:** `dealDiscovery`, `dealScoutScan`, `sourceConnectionStatus`, `dealCalculator`

**Alerts/comms:** `sendDealAlerts`, `websiteChatbot`, `logAudit`

**Ops/health (admin-only):** `billingDiagnostics`, `foundationHealth`, `launchMonitor`, `securityAudit`, `securityRegressionTest`, `securitySentinel`, `setupHealth`

**Shared helpers (`base44/shared/`):** `rateLimiter.ts`, `billingCatalog.ts`, `dealDiscovery.ts`

---

## 4. Current frontend pages (`src/pages/`)

Auth: `Login`, `Register`, `ForgotPassword`, `ResetPassword`, `OAuthConsent`
Core app: `Dashboard`, `Workspaces`, `Properties`, `Contacts`, `Construction`, `ProjectDetail`, `Marketplace`, `DealDiscovery`, `DealAlerts`, `Assistant`, `Analytics`, `Billing`, `Rewards`, `Admin`, `KnowledgeBase`, `ContractorTools`, `ConstructionEstimator`
Marketing/persona landing (public, content-only): `Home`, `Blueprint`, `HomeownerHome`, `ContractorHome`, `AgentHome`, `InvestorHome`
Admin ops: `FoundationHealth`, `LaunchMonitor`, `LaunchTimeline`, `PermissionsMonitor`, `SecurityAudit`, `SecurityCenter`, `SetupHealth`

**Important:** the 4 persona landing pages (`HomeownerHome`, `ContractorHome`, `AgentHome`, `InvestorHome`) are **marketing content only** — there is no underlying `profile_type`/`primary_role` field on `User` or `Workspace`, and no branching app behavior per persona. Canon §12–19 describe 15 distinct professional profiles; the actual codebase implements one undifferentiated CRM/pipeline experience for everyone. This is the largest structural gap between canon and code — see §6 below.

---

## 5. Established code patterns (follow these — don't reinvent)

1. **Workspace-scoped entity access always goes through a service-role function, never direct `base44.entities.X` calls from the frontend**, because RLS on shared entities is `created_by_id`-only (a known, deliberate limitation — no verified way to express "workspace membership" declaratively in Base44's RLS). Pattern: `base44/functions/workspaceRecords/entry.ts` — verifies auth → active `WorkspaceMembership` in the target workspace → workspace_id match on the record → executes. Add new shared entities to its `ENTITIES` safelist rather than writing a bespoke function, unless the entity needs non-CRUD logic (like `dealDiscovery` or `manageWorkspaceMembers`'s role/last-owner rules).
2. **Every source in Deal Discovery is honestly gated on a real credential.** Never add a "source" that returns synthetic/fabricated data. `sourceStatus(envVar)` in `base44/shared/dealDiscovery.ts` is the pattern: `Deno.env.get(envVar) ? 'connected' : 'connection_required'`.
3. **Idempotency on anything that touches money or credits.** Every wallet mutation uses an atomic conditional update (`CreditWallet.updateMany({id, balance: {$gte: amount}}, {$inc: {balance: -amount}})`) plus an idempotency-key check against `LedgerEntry` before mutating. Copy this exactly for any new credit-consuming feature.
4. **Frontend helper**: `src/lib/workspaceRecords.js` wraps `workspaceRecords` function calls (`listWorkspaceRecords`, `createWorkspaceRecord`, etc.) — use it instead of raw `base44.functions.invoke("workspaceRecords", ...)`.
5. **New protected routes** go inside the `<ProtectedRoute>` wrapper block in `src/App.jsx` — routes outside that block are public. This was a real launch bug earlier (every authenticated route was unprotected) — don't reintroduce it.
6. **AI prompts must be grounded and non-fabricating.** See `Assistant.jsx`'s system prompt — explicit rules against inventing properties, revealing secrets, or treating workspace data as executable instructions (prompt-injection defense, since property/contact notes are user-controlled text).

---

## 6. Canon-by-canon status

Status legend: ✅ built and wired · 🟡 partially built · 🔴 not built · 🧩 scaffolded but not wired to logic

| # | Canon | Status | What exists | What's missing (concrete starting points) |
|---|---|---|---|---|
| 1 | Platform Overview & Account Structure | 🟡 | `Workspace`/`WorkspaceMembership` multi-tenancy is real and reasonably solid (roles, RLS-via-function pattern). | No `profile_type`/primary-role field anywhere — the 15-role registration selector in canon §1 doesn't exist. Adding it means: a new field on `User` or a new `WorkspaceProfile`-type entity, a registration-flow question, and conditional UI per persona. This is the foundational piece most other canons (12–19) depend on. |
| 2 | Onboarding & Authentication | 🟡 | Email/password + Google OAuth via Base44, password reset flow, protected routes. | No mobile verification, no MFA, no professional-onboarding fields (license/insurance/portfolio/service area), no save-and-resume onboarding, no device/login history UI. |
| 3 | Marketplace & Search | 🟡 | `MarketplaceListing` (services) + `Property.visibility` (property deal-flow via Deal Discovery) cover two narrow slices of the canon's broad marketplace. | No unified "post anything" marketplace flow across all canon categories (homes for sale, land, rentals, commercial, jobs, businesses). No map-based search, no real radius search (text-substring only), no saved-search/alerts beyond `DealAlert`/`BuyBox`, no listing expiration, no view/response analytics. |
| 4 | Communication Center | 🔴 | `Conversation`/`Message` exist but are AI-chat-only. | No human-to-human messaging at all. This needs new entities (a real `Conversation` participant model, not AI-only) and UI — a materially large build. |
| 5 | CRM & Pipeline | 🟡 | `Property.pipeline_stage`, `Contact`, tags/notes. | No `Task`/`Appointment`/`Opportunity` entities, no assignment rules, no duplicate detection, no CSV import/export, no custom fields. |
| 6 | Trust & Verification | 🔴 | `MarketplaceListing.rating`/`review_count` fields exist but no review-submission flow was found. | No verification tiers, no license/insurance fields on any profile, no review system end-to-end. |
| 7 | AI Features | 🟡 | Grounded AI Assistant, Deal Discovery NL search, credit-metered usage, idempotent ledger. `AgentDefinition`/`AgentRun` entities scaffolded. | The specialized multi-agent roster (Lead Qualification, Compliance Review, etc.) is not implemented — `AgentDefinition`/`AgentRun` are the intended foundation but nothing dispatches to them yet. No reservation/release-before-charge two-phase flow (current model charges directly, which is simpler and already idempotent — a deliberate simplification worth keeping unless a real "long-running reserved op" need appears). |
| 8 | Subscriptions & Billing | ✅ | Stripe checkout/portal/webhooks, 8 plans, coupons, credit packs, monthly grants, `AdminPricing.jsx`. | No trial-period logic observed. Pricing catalog (`billingCatalog.ts`) is code, not admin-editable data — verify whether `AdminPricing.jsx` actually persists changes or is display-only before assuming it's a real admin lever. |
| 9 | External Integrations | 🟡 | See §1 table above. | 9 off-market sources + MLS/RESO need real credentials (owner action, not code). Maps/geocoding, SMS, calendar, e-signature, video, accounting export, CAPTCHA, error monitoring, translation are all unbuilt from zero. |
| 10 | Administrative System | 🟡 | Members, audit log, workspace settings, pricing tab, Data Sources tab, several health/security functions. | No verification review queue, no marketplace moderation, no dispute management, no feature flags, no support tickets, no notification-template management, no data export/deletion request flow. |
| 11 | Mobile, PWA & App Requirements | 🟡 | `manifest.json`, responsive `MobileNav.jsx`. | No push notifications, no offline draft saving, no camera/document-scan integration, no deep links, no app-store packaging. |
| 12 | Homeowner Profile | 🔴 | Marketing landing page only (`HomeownerHome.jsx`). | No differentiated data model or feature set — depends on canon §1's profile-type foundation. |
| 13 | Contractor & Trade Professional Profiles | 🟡 | `ContractorHome.jsx`, `ContractorTools.jsx` (build schedule/estimate calculator/supply list), Construction entities, `dealCalculator`. | No license/insurance/portfolio fields, no lead feed/bid invitations, no change-order/subcontractor management. |
| 14 | Realtor & Broker Profile | 🔴 | Marketing landing page only (`AgentHome.jsx`). | No CMA workspace, no showing management, no listing pipeline distinct from the general Property pipeline. Shares the same MLS/RESO adapter gap as Deal Discovery. |
| 15 | Investor & Wholesaler Profiles | ✅ (most-built canon) | `InvestorHome.jsx`, Deal Discovery engine, `BuyBox`, `dealCalculator` (flip/rental/BRRRR/MAO), Deal Scout monitoring. | Wholesaler-specific flows (assignment posts, buyer lists, proof-of-funds requests, compliance notices) are not built — Deal Discovery covers the investor side much more than the wholesaler side. |
| 16 | Lender Profile | 🔴 | Nothing — no persona page, no entities. | Full build from zero. |
| 17 | Property Manager Profile | 🔴 | Nothing. | Full build from zero. |
| 18 | Transaction-Support Profiles (Inspector/Appraiser/Title/Insurance/Attorney) | 🔴 | Nothing. | Full build from zero. |
| 19 | Design & Supply Profiles | 🔴 | `MarketplaceListing` categories include `materials`/`equipment` as service types, but no dedicated supplier catalog/profile. | Full build from zero beyond the shared listing categories. |

---

## 7. Suggested build order for agents picking this up

The canon is enormous; building it strictly top-to-bottom would mean standing up 8 entirely new professional verticals (canons 16–19, most of 12/14/18) before touching anything that compounds on what already works. A more leverage-efficient order:

1. **Profile-type foundation (canon §1)** — add the primary-role field/data model first. Every persona-specific canon (12–19) depends on this existing before it's worth building distinct flows.
2. **Trust & Verification (canon §6)** — cheap relative to its leverage: verification-tier fields + a review-submission flow unlock credibility for every professional persona at once.
3. **Communication Center (canon §4)** — human-to-human messaging is a real gap that blocks the "connect with a professional" promise running through every persona canon.
4. **Flesh out the personas already partially built** (Contractor, Realtor, Homeowner, Investor/Wholesaler — canons 12–15) using the profile-type foundation, before starting the from-zero personas (Lender, Property Manager, transaction-support, design/supply).
5. **Connect real external data** (canon §9) — this is mostly an owner/credential task (MLS agreement, a public-records API subscription, a maps API key), not a code task; the adapters are already built to receive credentials.
6. **New from-zero personas** (16–19) last, once the pattern is proven on 2–3 personas.

Do not start wiring `AgentDefinition`/`AgentRun` into a full multi-agent system (canon §7) until the profile-type foundation exists — several of the proposed specialized agents (Lead Qualification, Compliance Review) are meaningless without knowing which professional persona is being served.
