# Boliviq Version Control, Release & Rollback Process

This document adapts the Boliviq Version Control Directive to the realities of the Base44 platform. It is the authoritative process for gating every department.

## Platform reality vs. directive intent

| Directive requirement | Base44 mechanism | Notes |
|---|---|---|
| Git repo as source of truth | GitHub 2-way sync (`main` only) | Connect via Dashboard → GitHub icon. Only `main` auto-syncs; PRs into `main` are the review gate. |
| `main` / `staging` / `development` / `department/*` branches | `main` only for sync | Department branches don't reflect in the app. Tracked via docs + Base44 version history instead of physical branches. |
| Annotated release tags `boliviq-dept-NN-vX.Y.Z` | GitHub tags on `main` (post-connect) + Base44 Version History checkpoint | Tag created in the GitHub repo once sync is connected; the Base44 version snapshot is the live rollback reference. |
| Commits in logical units with `type(scope): desc` | Conventional-commit messages on `main` | Applied when committing via the connected repo / PRs. |
| SQL migration files | Base44 entity JSON schema files | Schema changes are versioned as entity JSON + documented in `MIGRATIONS.md`. Forward-fix preferred. |
| Staging environment | Preview + Test Data environment + Testing Agent | "Staging smoke tests" = Testing Agent runs on key flows before publish. |
| Rollback to previous tag | Base44 Version History → Revert/Publish older version | Primary rollback; GitHub revert as secondary once connected. |
| Checksums (CHECKSUMS.txt) | File manifest + Base44 version checkpoint | True file hashes aren't computable in the build sandbox; we record the file manifest and version checkpoint honestly. |
| Pre-commit test suite | Testing Agent (e2e) + manual verification | No CLI test runner in sandbox; results recorded in TEST-REPORT.md. |

## Department completion gate (mandatory)

A department may NOT be marked PASS and the next department stays **LOCKED** until:

1. All planned features, screens, mobile + desktop responsiveness, loading/empty/error states are implemented.
2. Authentication, authorization, and workspace isolation (RLS) are verified.
3. Backend functions tested via `test_backend_function` and recorded.
4. Testing Agent runs on the department's key flows and passes.
5. Security scan of code committed (secrets, PII, disabled auth) — clean.
6. Department release folder created under `docs/departments/NN-name/` with all required files.
7. Release report produced in the exact format (below) with decision PASS.
8. Rollback point recorded (Base44 version checkpoint + note).
9. No critical or high-severity defects remain.

## Required release files per department

`docs/departments/NN-name/` contains: `README.md`, `SCOPE.md`, `IMPLEMENTATION.md`, `TEST-REPORT.md`, `SECURITY-REPORT.md`, `MIGRATIONS.md`, `KNOWN-ISSUES.md`, `ROLLBACK.md`, `RELEASE-NOTES.md`.

## Release report format

```
Department: <name and number>
Branch: <Base44 working set / GitHub main PR>
Starting Version: <Base44 version checkpoint or tag>
Final Version: <Base44 version checkpoint or tag>
Files Changed: added / modified / deleted
Database Changes: entity schema changes + RLS impact
Features Completed: exact features
Tests Executed: commands/categories and results
Security Review: checks and findings
Performance Review: checks and findings
Issues Found: all discovered issues
Issues Resolved: each correction
Known Limitations: deferred items
Rollback Point: previous stable checkpoint + instructions
Release Decision: PASS | FAIL
Next Department Status: LOCKED | AUTHORIZED
```

The next department remains LOCKED unless the current release decision is PASS.

## Secret hygiene

Secrets (Stripe keys, webhook secret) are stored as Base44 platform environment variables — never in code or repo. `.gitignore` excludes `.env`, `.env.*`, `*.local`, `node_modules`, build outputs. No private keys, certificates, or user data are committed.

## Status summary

- GitHub 2-way sync: **pending owner connection** (Dashboard → GitHub → Connect; requires Builder plan+).
- Department 01 (Core Infrastructure): **PASS — v1.0.0**.
- Department 02 (Billing & Subscriptions): **PASS — v1.0.0** (Stripe test mode; checkout, portal, webhook lifecycle, credit charging, entitlement enforcement). Coupons/referrals deferred to Phase 7.
- Department 03 (CRM, Pipeline & Contacts): **PASS — v1.0.0** (properties, drag-and-drop pipeline, contacts, investor dashboard).
- Department 04 (Marketplace): **PASS — v1.0.0** (service/material/equipment listings, search, category filters, CRUD).
- Department 05 (Construction Intelligence): **PASS — v1.0.0** (projects, budget tracking, task board).
- Department 06 (AI Assistant): **PASS — v1.0.0** (conversational AI over live workspace data, persistent history).
- Department 07 (Credit Economy & Rewards): **PASS — v1.0.0** (coupons, referral codes, redeemCoupon function, rewards hub).
- Department 08 (Analytics & BI): **PASS — v1.0.0** (KPIs + 5 charts across portfolio/construction/contacts/marketplace).
- Department 09 (Admin Console): **PASS — v1.0.0** (members, audit log, workspace overview; owner/admin guarded).
- Department 10 (Public Site & PWA): **PASS — v1.0.0** (installable manifest, PWA meta, mobile bottom nav, responsive).
- Department 11 (Launch Readiness): **PASS — v1.0.0** (consolidation, QA handoff, master launch report).
- **PLATFORM STATUS: ALL DEPARTMENTS PASS — code-complete; live QA gate pending publish.** (See docs/LAUNCH-REPORT.md)