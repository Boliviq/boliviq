# Boliviq Launch Readiness Runbook

Local-repo (TanStack Start + React 19 + Supabase + Stripe) steps to clear the
known launch blockers. These run in your terminal — the Base44 in-app agent
cannot run `npm run lint/typecheck/test/build` or edit the zip's files.

## Gates (run after every batch)
`npm run lint` · `npm run typecheck` · `npm run test` · `npm run build`

---

## 1. Stop the permissions banner leaking to public visitors (URGENT)

**Problem:** `<PermissionsErrorBanner />` is mounted in `RootComponent`
(`src/routes/__root.tsx` ~line 125), so it renders on every route including the
public marketing pages. `installRlsMonitor()` (`src/lib/rls-monitor.ts`)
monkey-patches `window.fetch` and pops the banner on any Supabase 401/403 — for
anyone, signed in or not.

**Fix:**
- Move `<PermissionsErrorBanner />` out of `RootComponent` and into the
  `_authenticated` admin layout, gated on the same admin role check used by the
  other `admin.*` routes: `{isAdmin && <PermissionsErrorBanner />}`.
- Gate `installRlsMonitor()` behind the admin condition so the global
  `window.fetch` patch is never installed for anonymous visitors.
- Leave `/admin/permissions-monitor` working — it only reads localStorage
  (`boliviq.rls-monitor.events.v1`).

## 2. Stop anonymous queries to private tables

**Problem:** a logged-out visitor hitting `token_ledger` is always denied by
RLS — correct behavior, but the query should not fire at all with no session.

**Fix (per table):**
- Find the code path issuing the query and determine whether it should run for a
  signed-out visitor.
- If it should NOT: guard it on an active session (`if (!session) return;`) so
  it never fires anonymously. ← start here for `token_ledger`.
- If it genuinely needs to be public: add an explicit Supabase RLS policy
  granting `select` to the `anon` role on only the columns required, as a
  migration in `supabase/`. **Never** disable RLS. **Never** use the
  service-role key from client code.

**To get the other 7 table names:** sign in as admin in that browser and open
`/admin/permissions-monitor` — events persist in localStorage and will still be
there. Capture each table name before deciding per-table which fix applies.

## 3. Fix the Supabase `this`-binding bug (onboarding/settings forms)

**Problem:** `const rpc = supabase.rpc as unknown as (...)` detaches the method,
losing `this`. At call time supabase-js throws
"undefined is not an object (evaluating 'this.rest')" and the form cannot submit.

**Confirm line numbers first** — your screenshots show "Step 1 of 4" with a
role-selection step, but the zip has a 3-step flow with no role step. The live
site is newer than the zip, so line numbers may have shifted.

**Fix** — call on the client (preferred):
```ts
await supabase.rpc("complete_onboarding", { /* args */ });
```
Or, if stale generated types force a typed alias (no `@ts-ignore`):
```ts
const rpc = supabase.rpc.bind(supabase) as unknown as (name: string, args?: object) => Promise<...>;
await rpc("complete_onboarding", { /* args */ });
```

**Harden the client** (`src/integrations/supabase/client.ts`): in the lazy Proxy,
pass the real client as receiver and bind function-valued props:
```ts
get(_prop, _receiver) {
  ensureInit();
  const value = Reflect.get(_supabase, _prop, _supabase); // receiver = real client
  return typeof value === "function" ? (value as Function).bind(_supabase) : value;
}
```

**Test:** add a test that calls the onboarding RPC path through a detached
reference and asserts it does not throw.

## 4. Reconcile env variable names

Code reads: `STRIPE_LIVE_API_KEY`, `STRIPE_SANDBOX_API_KEY`,
`PAYMENTS_LIVE_WEBHOOK_SECRET`, `PAYMENTS_SANDBOX_WEBHOOK_SECRET`.
`BOLIVIQ-HANDOFF.md` documents: `STRIPE_SECRET_KEY_LIVE`, `STRIPE_SECRET_KEY_TEST`,
`STRIPE_WEBHOOK_SECRET_LIVE`, `STRIPE_WEBHOOK_SECRET_TEST`.

**Fix:** pick ONE scheme, read the new names with the old names as fallbacks so
nothing deployed breaks, and update `.env.example`, `BOLIVIQ-HANDOFF.md`, and the
Setup page to match.

## 5. Clean lint to zero errors/warnings (do NOT weaken rules)

**Order of operations:**
1. Baseline: `npm run lint`, `typecheck`, `test`, `build`. Record counts by rule.
2. Formatting first, alone, in its own commit: `npm run format`. Re-run the
   other three gates to prove it was cosmetic. Erases the majority of findings.
3. Re-run lint, show counts by rule.
4. Type the ~151 `any`s in small batches (≤5 files), running typecheck after
   each batch. Priority: `src/lib/db-types.ts` first, then the other
   `src/lib/*.functions.ts`, then `stripe.server.ts` and
   `webhook.ts`, then the `_authenticated` route files. Derive real types from
   the Supabase schema in `supabase/` and the Stripe SDK types. Where a value is
   genuinely unknowable at compile time, use `unknown` + a runtime guard or a
   Zod schema (zod is already a dependency).
5. Remove the stale suppression in `src/routes/_authenticated/reports.tsx` and
   fix the underlying image usage instead.
6. Leave `src/routeTree.gen.ts` alone — it is generated, carries
   `/* eslint-disable */` and `@ts-nocheck`. Regenerate if out of date.

**Hard rules:** never `eslint-disable` / `@ts-ignore` / `@ts-nocheck` / `any`,
never loosen `eslint.config.js` / `tsconfig.json` / `.prettierrc`. Never change
runtime behavior while fixing a finding. One logical change per commit.

---

## Equivalent admin tooling built in the Base44 app

These exist in the Base44 workspace (not the zip) as the push-button equivalent:
- `/admin/permissions-monitor` — admin-only RLS denial log + "Test capture" button.
- `/admin/setup-health` — admin-only live Test for Stripe (live/sandbox) keys,
  webhook secrets, and OpenAI key + model, with a live/sandbox mode toggle and a
  refusal to store `VITE_`-prefixed secrets.