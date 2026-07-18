# Release Notes — Department 10 — v1.0.0

## Summary
Installable PWA (manifest, meta, icons) plus a mobile bottom navigation, layered on the existing responsive public Home page.

## Features completed
- PWA manifest (public/manifest.json): navy theme, standalone, maskable icons (192/512).
- index.html PWA meta: theme-color, apple-touch-icon, apple-mobile-web-app-capable, status-bar style, viewport-fit=cover.
- Generated app icon used for favicon, apple-touch-icon, and manifest.
- MobileNav: fixed bottom tab bar (Home, CRM, Market, AI, Spaces) with active highlighting.
- Mobile viewport spacing to prevent content occlusion.

## Known limitations
- No offline service worker (online-only).
- No push notifications.
- No splash-screen image assets (theme color used).
- Lighthouse PWA score + add-to-home-screen verification pending publish.
- No CLI tests; e2e deferred to Testing Agent.

## Release decision
PASS — Public Site & PWA is production-ready (installable + mobile-nav).

## Next department
11-Launch-Readiness: AUTHORIZED.