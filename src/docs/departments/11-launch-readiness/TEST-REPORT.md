# Test Report — Department 11

## In-builder verification (this run)
- Backend function smoke tests executed and passed:
  - chargeCredits → 402 Insufficient (no mutation) — PASS.
  - checkEntitlement → free/25 credits — PASS.
  - redeemCoupon → 403 Forbidden on non-member workspace (auth/membership gate) — PASS.
- InvokeLLM smoke test: BLOCKED in sandbox (private-app auth in exec context); wiring correct; re-verify on publish.
- Router audit: PASS (14 routes, clean structure).

## Handed off to Testing Agent (on published app)
Suggested goal phrasings:
- "Create a workspace, add a property, and move it across pipeline stages."
- "Invite a member and change their role in the admin console."
- "Start an AI assistant conversation and get a pipeline summary."
- "Create a coupon and redeem it in Rewards; confirm credit balance increases."
- "Open a construction project, add tasks, and check the budget utilization bar."
- "Browse the marketplace, filter by category, and create a listing."
- "Open Analytics and confirm charts render for the workspace's data."

## Pending live verification (publish required)
- Lighthouse (perf/PWA/SEO/a11y).
- Live Stripe Checkout + portal + webhook e2e.
- Live InvokeLLM response.
- Installability / add-to-home-screen on device.