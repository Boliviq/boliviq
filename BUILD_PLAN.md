# Boliviq Build Plan — Now Through Full Canon Completion

This is the execution sequence for building the full 19-canon vision (see `PRODUCT_CANON_AND_ROADMAP.md` for the canon-by-canon status this plan is built from) on top of the current codebase. It has no calendar dates — I have no way to know your team's real velocity, and a fabricated timeline would be worse than none. Each phase instead has an explicit **entry condition** (what must be true to start it), **exit condition** (how to know it's actually done — not just "code written"), and a **relative size** (S/M/L/XL, meaning roughly proportional build effort, not days).

**Ordering principle:** phases are sequenced by dependency, not by canon number. Building a Lender or Property Manager persona (canons 16–17) before the profile-type foundation exists would mean rebuilding it once that foundation lands. Cheap, high-leverage, foundational work goes first; the most isolated, from-zero work goes last.

**Rule for whoever executes this, human or agent:** at the start of every phase, re-verify its entry condition against the actual code — this repo has drifted from documentation before via bidirectional Base44 sync. Don't trust this plan's description of "current state" without a quick check against `PRODUCT_CANON_AND_ROADMAP.md`'s own instruction to re-verify.

---

## Phase 0 — Foundation decisions (no code yet)

**Entry condition:** none — start here.
**Size:** S
**Owner action required:** yes (decisions only, not credentials)

Before any of canons 12–19 can be built without rework, three decisions need to be made and written down (not left implicit):

1. **Reconcile the two canons.** `src/data/blueprint.js` (the in-app "Blueprint" page) holds an older, disagreeing canon. Decide: replace its content to match the new 19-canon doc, or retire the Blueprint page entirely. Either way, stop shipping two disagreeing sources of truth in the live app.
2. **Decide the profile-type data model shape.** Two real options: (a) a single `primary_role` enum field added to `User` (simple, matches canon §1's "select one primary profile" framing), or (b) a separate `ProfessionalProfile` entity per user holding role-specific fields (license, insurance, portfolio, service area) — more normalized, needed anyway once canon §2's professional-onboarding fields and canon §6's verification fields exist. **Recommendation: option (b).** A flat enum on `User` can't hold the license/insurance/portfolio fields canon §2 requires without bloating `User` with fields that only apply to some roles.
3. **Decide RLS strategy for the new entities this plan creates.** Every new professional-profile-scoped entity will hit the same limitation already documented for `Property`/`Contact`/etc.: Base44 RLS can't express "workspace member" or "verified professional" declaratively. Default to the established pattern — service-role functions gated by explicit code-level checks (extend `workspaceRecords`'s `ENTITIES` safelist where the entity is workspace-scoped CRUD; write a dedicated function where it isn't, exactly as `dealDiscovery` and `manageWorkspaceMembers` already do).

**Exit condition:** a short decisions doc (append to `PRODUCT_CANON_AND_ROADMAP.md` or a new `DECISIONS.md`) recording the three choices above, so no later phase re-litigates them.

---

## Phase 1 — Profile-type foundation (canon §1, §2 partial)

**Entry condition:** Phase 0 decisions recorded.
**Size:** M
**Depends on:** Phase 0.

This is the single highest-leverage phase — nearly every persona canon (12–19) is currently a marketing page with no underlying data model, and this phase gives them one.

- New `ProfessionalProfile` entity (per Phase 0 decision 2): `user_id`, `workspace_id`, `primary_role` (the 17-value enum from canon §1), `secondary_roles[]`, plus the professional-onboarding fields from canon §2 (company name, business address, phone, website, description, service categories, service area, years in business, license info, insurance info, certifications, portfolio images, logo, operating hours, preferred lead types) — nullable/optional except for `primary_role`, since homeowners won't fill most of it.
- Registration flow update (`Register.jsx`): add the primary-role selector from canon §1's list of 17, with save-and-resume support (canon §2's explicit requirement) — persist partial `ProfessionalProfile` state as the user progresses rather than requiring one long form.
- Extend `workspaceRecords`'s `ENTITIES` safelist with `ProfessionalProfile`, following the existing pattern exactly.
- Wire the 4 existing persona pages (`HomeownerHome`, `ContractorHome`, `AgentHome`, `InvestorHome`) to actually read `ProfessionalProfile.primary_role` and branch real content/navigation instead of being static marketing pages — this is the first place the foundation pays off visibly.

**Exit condition:** a new user can select a primary role at registration, a `ProfessionalProfile` record is created and readable/editable by its owner via `workspaceRecords`, and at least one existing persona page (pick Contractor, since it has the most existing surface area — `ContractorTools.jsx`, Construction entities) visibly changes behavior based on it.

---

## Phase 2 — Trust & Verification (canon §6)

**Entry condition:** Phase 1's `ProfessionalProfile` entity exists.
**Size:** S–M
**Depends on:** Phase 1 (verification fields attach to `ProfessionalProfile`).

Cheap relative to its leverage — every persona canon references trust signals, so building this once now avoids rebuilding it per-persona later.

- Add verification-tier fields to `ProfessionalProfile`: `identity_verified`, `license_verified`, `insurance_verified`, `boliviq_certified` (booleans or timestamped-when-verified), each with a `verified_by`/`verified_at` audit pair.
- A `Review` entity (rating + text + `reviewer_id` + `subject_profile_id` + `related_property_id`/`related_project_id` where applicable) — `MarketplaceListing.rating`/`review_count` already exist as aggregate fields but nothing currently writes a real review record; this phase makes those fields real instead of decorative.
- Admin review queue (new tab in `Admin.jsx` or a dedicated page): pending verification requests, with approve/reject actions writing to the new tier fields and `AuditLog` (matches the existing admin-action-audit pattern already used everywhere else).
- Explicit UI rule per canon §6: no badge implies Boliviq guarantees the person's work — bake the disclaimer text into whatever badge component gets built, don't leave it as a later content pass.

**Exit condition:** a professional profile can display a verification badge that reflects a real admin-approved state (not a hardcoded true), and at least one review can be submitted and displayed end-to-end.

---

## Phase 3 — Communication Center (canon §4)

**Entry condition:** none beyond current state (doesn't strictly need Phases 1–2, but sequenced here because "connect with a professional" — the payoff of Phases 1–2 — needs real messaging to mean anything).
**Size:** L
**Depends on:** conceptually pairs with Phase 1/2 but is technically independent; could be parallelized with Phase 2 if two build tracks exist.

The current `Conversation`/`Message` entities are AI-chat-only. This phase builds real human-to-human messaging, which canon §4 and nearly every persona canon assume exists.

- Extend `Conversation` (or add a new entity if reusing `Conversation` would conflict with the AI-chat usage — check whether `Conversation.workspace_id`-only scoping is enough to distinguish, or whether a `kind: 'ai_chat' | 'human'` discriminator is cleaner) to support multiple human participants, and property/project-specific threads (`related_property_id`/`related_project_id`).
- New backend function (e.g. `sendMessage`/`listConversations`) following the membership-gated pattern — a conversation's participants need read/write access regardless of which workspace originated it, which is a genuinely new access shape (cross-workspace, participant-list-based) not yet covered by any existing function; design it explicitly rather than forcing it into `workspaceRecords`.
- UI: an inbox page, conversation view, file/photo attachment (reuse the existing Base44 file-storage pattern already used for `Property.photos`).
- Consent/quiet-hours/opt-out enforcement (canon §4's explicit rule) for any email/SMS notification triggered by a new message — extend the pattern already established in `sendDealAlerts`/`dealScoutScan` for respecting notification preferences.

**Exit condition:** two users in different workspaces (e.g., a homeowner and a contractor) can message each other about a specific property, with the thread visible to both and no one else.

---

## Phase 4 — Flesh out the partially-built personas (canons 12–15)

**Entry condition:** Phases 1–3 complete.
**Size:** L (roughly M per persona × 4)
**Depends on:** Phases 1–3.

Now that profile type, trust, and messaging exist, extend the 4 personas that already have partial groundwork, in this priority order (most existing surface area first):

1. **Investor & Wholesaler (canon §15)** — already the most-built canon (Deal Discovery, BuyBox, dealCalculator). Add wholesaler-specific flows not yet built: assignment-opportunity posts, buyer lists, proof-of-funds requests, jurisdiction-sensitive compliance notices (canon's explicit rule that wholesaling disclosure requirements vary by state — this needs real content/legal input, flag as owner-review item).
2. **Contractor & Trade Professional (canon §13)** — build on `ContractorTools.jsx`/Construction entities: lead feed (surfaces homeowner repair posts matching the contractor's service categories — reuses Deal Discovery's matching logic pattern, applied to a new "repair request" listing type), bid invitations, change orders, subcontractor management.
3. **Homeowner (canon §12)** — the "invite a professional into a property workspace" flow: a lightweight variant of the existing team-invite system (`inviteWorkspaceMember`/`acceptWorkspaceInvites`) scoped to a single property rather than a whole workspace.
4. **Realtor & Broker (canon §14)** — CMA workspace (reuses `dealCalculator`-style comp analysis), showing management, listing pipeline. Its MLS/IDX dependency is shared with Deal Discovery's existing adapter — no new integration code needed, just a real credential (see Phase 7).

**Exit condition:** each of the 4 personas has at least one complete, real workflow beyond its current marketing page — not four still-static pages with a role label attached.

---

## Phase 5 — Marketplace & Search broadening (canon §3)

**Entry condition:** Phase 1 (profile types inform which marketplace categories a user sees/posts to).
**Size:** M–L

- Unify posting across canon §3's full category list (currently split awkwardly between `Property.visibility` for deal-flow and `MarketplaceListing` for contractor services) — likely needs a new `listing_category` discriminator or a genuinely new unified `Listing` entity, rather than continuing to overload `Property` for things that aren't property deals (repair requests, jobs, businesses, education/networking posts).
- Real geocoding: populate `Property.latitude`/`longitude` from address on save (this is the first real Maps/geocoding integration — pairs with Phase 7's external-integrations work, but the geocode-on-save trigger is app logic, not just a credential).
- Real radius search replacing the current text-substring location match in `dealDiscovery`'s `matchesFilters`.
- Map view for search results, listing expiration, view/response analytics, save/share/report-listing actions.

**Exit condition:** a non-property listing type (e.g., a homeowner's repair request) can be posted, searched by radius on a map, and expires on schedule.

---

## Phase 6 — CRM & Pipeline enhancements (canon §5)

**Entry condition:** none blocking; can run in parallel with Phase 4 or 5.
**Size:** M

- New `Task`/`Appointment` entities, workspace-scoped via `workspaceRecords` (straightforward extension of the existing pattern).
- Lead-source tagging, assignment rules, duplicate detection on `Contact`, CSV import/export.
- Custom-field support if needed (evaluate whether `Property.characteristics`'s existing free-form object field is sufficient before building a dedicated custom-fields system).

**Exit condition:** a lead can move through all 12 canon-§5 pipeline stages with a task/appointment attached at each stage, and a CSV of contacts can be imported and exported.

---

## Phase 7 — Connect real external integrations (canon §9)

**Entry condition:** the adapter code already exists for MLS/RESO and the 9 off-market sources (see `PRODUCT_CANON_AND_ROADMAP.md` §1) — this phase is mostly **owner action**, not new code.
**Size:** S per source (code) / owner-dependent (credentials, contracts, legal agreements)

- **Owner-driven, not agent-buildable:** MLS/board membership agreements, a public-records data provider subscription, a maps/geocoding API key, an e-signature provider account, an SMS provider account, a video-meeting provider, an accounting-export provider, a CAPTCHA provider, an error-monitoring account, a translation service. Each just needs its credential set in Base44's environment variables — the moment that happens, `sourceConnectionStatus` and the relevant adapter start reporting "connected" with zero further code changes for MLS/off-market specifically (per the pattern already built).
- **Agent-buildable once credentials exist:** the calendar-sync, e-signature, video-meeting, and accounting-export integrations don't have adapters yet (unlike MLS/off-market) — building those adapters is real code work, but should wait until Phase 7 is reached so it's built against real sandbox credentials instead of guessed API shapes.

**Exit condition:** at least one on-market MLS feed returns real listings through Deal Discovery, and the Data Sources admin panel shows more than the two first-party sources as "connected."

---

## Phase 8 — AI Features expansion (canon §7)

**Entry condition:** Phase 1 (personas exist to serve) and ideally Phase 4 (persona workflows exist to act on).
**Size:** M–L

- Wire `AgentDefinition`/`AgentRun` (currently scaffolded, unused) into a real dispatch system. Build the highest-value 2–3 specialized agents first rather than all ten at once — likely candidates given what already exists: a **Property Analysis Agent** (extends `dealCalculator`+`dealDiscovery`, already has the data model), a **Lead Qualification Agent** (needs Phase 6's CRM enhancements), a **Communication/Follow-Up Agent** (needs Phase 3's messaging).
- Enforce canon §7's explicit permission boundary in code, not just prompt instructions: agents must not autonomously send messages without an approved automation, sign agreements, move money, or publish listings without confirmation. Where an agent's action would cross one of those lines, require an explicit human-confirmation step in the UI before the action executes — don't rely on the LLM prompt alone to self-restrict, the same way `chargeCredits`/`stripeWebhook` don't rely on trusting client input for money-affecting decisions.

**Exit condition:** one real specialized agent runs end-to-end (creates an `AgentRun` record, produces a real result, respects the permission boundary) rather than existing only as an unused entity.

---

## Phase 9 — Administrative System completion (canon §10)

**Entry condition:** Phases 2 (verification), 5 (marketplace moderation needs real listings to moderate) ideally in place.
**Size:** M

- Marketplace moderation / reported-content review queue.
- Dispute management.
- Feature flags (useful scaffolding for every later phase's gradual rollout, arguably worth pulling earlier if any phase above needs staged rollout).
- Support tickets, notification-template management, revenue/usage reporting beyond the current `Analytics.jsx`/`launchMonitor`, data export/deletion requests (compliance-driven — flag for legal review on retention requirements before building).

**Exit condition:** a reported marketplace listing can be reviewed and actioned by an admin, and a user can request their data be exported or deleted with the request actually processed, not just logged.

---

## Phase 10 — From-zero personas (canons 16–19 + remainder of 18)

**Entry condition:** Phases 1–3 complete and proven on at least 2 existing personas (Phase 4) — don't build a 5th persona's data model before confirming the foundation actually generalizes.
**Size:** XL (5 personas: Lender, Property Manager, Inspector, Appraiser, Title/Closing, Insurance, Attorney, Architect/Engineer/Designer, Supplier — canon groups several per section)

Recommended internal order by regulatory sensitivity (least to most, so the compliance-heaviest personas benefit from lessons learned on the simpler ones):

1. **Supplier/Material Vendor & Architect/Engineer/Designer (canon §19)** — lowest regulatory complexity, mostly catalog/portfolio + lead-connection, similar shape to Contractor.
2. **Inspector & Appraiser (canon §18 partial)** — appointment scheduling + report upload, moderate complexity; canon's explicit rule that Boliviq estimates must stay clearly separated from licensed appraisal reports needs real UI treatment, not just a disclaimer line.
3. **Property Manager (canon §17)** — owner/tenant/vendor records; canon explicitly requires tenant screening/rent collection/lease execution to route through compliant third-party services rather than being built in-house — treat that as a hard boundary, not a nice-to-have.
4. **Lender (canon §16)** — canon explicitly warns Boliviq must not make lending decisions unless separately licensed for it; scope this persona to lead intake/document collection/status tracking only, and get real legal review before building anything that looks like underwriting.
5. **Title/Closing, Insurance, Attorney (canon §18 remainder)** — highest sensitivity (wire-fraud exposure on title/closing, attorney conflict-of-interest checks, licensed-legal-advice boundaries). Canon's own rules here (encryption, warning banners, anti-wire-fraud protections, "AI must not represent itself as an attorney") need to be treated as launch blockers for this phase specifically, the same rigor this session applied to Stripe/auth/RLS earlier in the project.

**Exit condition (per persona):** a real workflow exists end-to-end, not just a landing page, and every canon-stated compliance rule for that persona has been explicitly implemented or explicitly deferred with a named reason — never silently skipped.

---

## Phase 11 — Mobile, PWA & App Store (canon §11)

**Entry condition:** the core feature set feels stable — this phase packages what exists, so doing it before Phase 10 finishes just means repackaging repeatedly.
**Size:** M–L
**Owner action required:** yes (Apple/Google developer accounts, app-store review)

- Push notifications, offline draft saving, camera upload/document scanning, deep links — build on the existing `manifest.json`/`MobileNav.jsx` PWA shell.
- App-store packaging (both stores) — canon's own explicit rule: review current Apple/Google payment rules before publication; don't assume external payment links are permitted in every category/region. This needs a real policy check at build time, not an assumption carried over from web Stripe checkout.

**Exit condition:** the PWA is installable with working push notifications, and app-store submission has either completed review or has a documented, current list of open review requirements.

---

## Phase 12 — Full-system hardening pass ("the end")

**Entry condition:** Phases 1–11 substantially complete.
**Size:** L

Before calling the canon "built," repeat the rigor already applied once this session to auth/billing/RLS — but now across every new persona and integration added since:

- Re-run the workspace-isolation verification pattern (two users, two workspaces, cross-workspace access denial) against every new entity introduced in Phases 1–10, not just the original CRM entities.
- Re-verify every new money-adjacent or compliance-sensitive flow (lending, title/closing, insurance, attorney) for the same idempotency/authorization rigor already established in the Stripe/credit-wallet code.
- Live-verify (not just code-review) every newly connected external integration from Phase 7 — the same "PASS only if actually exercised live" standard already applied to Stripe/auth this session.
- Full regression across auth, billing, RLS/workspace isolation, and every persona's core workflow.

**Exit condition:** every phase's individual exit condition still holds simultaneously, live, in the deployed app — not just at the moment each phase was originally finished.

---

## Summary sequencing (dependency graph, left to right)

```
Phase 0 (decisions)
  └─▶ Phase 1 (profile-type foundation)
        ├─▶ Phase 2 (trust & verification)
        ├─▶ Phase 4 (flesh out 4 existing personas) ◀── Phase 3 (messaging, parallelizable)
        │        └─▶ Phase 10 (from-zero personas, after proven on 2+)
        ├─▶ Phase 5 (marketplace broadening)
        ├─▶ Phase 6 (CRM enhancements, parallelizable anytime)
        └─▶ Phase 8 (AI agents, after Phase 4 gives them something to act on)
Phase 7 (real integrations) — owner-credential-gated, can start anytime, unblocks Phase 5's geocoding and Phase 4's Realtor MLS need
Phase 9 (admin completion) — after Phase 2 and Phase 5 give it something to moderate
Phase 11 (mobile/app-store) — after the feature set stabilizes
Phase 12 (hardening) — last, and re-run its checks after every subsequent change forever after
```
