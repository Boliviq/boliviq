# Scope — Department 11 (Launch Readiness)

## In scope
- Consolidated verification that Departments 01–10 are code-complete, documented, and PASS.
- Router/imports consistency check (src/App.jsx — 14 routes, clean `<Routes>`).
- Governance status finalized in VERSION-CONTROL.md.
- Master launch report (docs/LAUNCH-REPORT.md).
- QA handoff: define the Testing Agent goals for the published app (e2e coverage of key flows).
- Honest gap log: items that require the published runtime (Lighthouse, a11y, live Stripe checkout, live InvokeLLM, add-to-home-screen).

## Out of scope (requires published runtime — handed off)
- Lighthouse performance/PWA/SEO/a11y scoring.
- Live Stripe Checkout + portal + webhook e2e (blocked in builder iframe by design).
- Live InvokeLLM response verification.
- Automated e2e suite (Testing Agent on publish).
- Add-to-home-screen / installability prompt on device.