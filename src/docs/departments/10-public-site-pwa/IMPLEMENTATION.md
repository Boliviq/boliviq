# Implementation — Department 10

## Files added
- public/manifest.json — PWA manifest (navy theme, standalone, maskable icons).
- src/components/MobileNav.jsx — fixed bottom tab bar (md:hidden), 5 tabs, useLocation active state, safe-area padding.

## Files modified
- index.html — favicon + apple-touch-icon → generated icon; theme-color #0a1424; apple-mobile-web-app-capable; status-bar black-translucent; viewport-fit=cover; mobile-web-app-capable.
- src/components/AppTopBar.jsx — import + render MobileNav inside the header.
- src/index.css — `@media (max-width:767px) body { padding-bottom: 3.5rem }` to reserve space for the bottom bar.

## Reused
- Existing responsive Home page (public site); lucide icons; react-router useLocation.