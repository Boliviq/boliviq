# Department 10 — Public Site & PWA

**Release:** boliviq-dept-10-v1.0.0
**Status:** PASS
**Rollback point:** Base44 Version History checkpoint at end of Department 10.

## What this department delivered
Installable PWA (manifest + meta + icons) and a mobile bottom navigation, layered on the existing responsive public Home page.

## Key artifacts
- public/manifest.json (name, theme/background navy #0a1424, standalone display, 192 + 512 maskable icons).
- index.html: theme-color, apple-touch-icon, apple-mobile-web-app-capable, status-bar style, viewport-fit=cover, mobile-web-app-capable, favicon → generated icon.
- src/components/MobileNav.jsx — fixed bottom tab bar (mobile only): Home, CRM, Market, AI, Spaces.
- AppTopBar renders MobileNav; index.css reserves bottom padding on mobile.
- Public landing page (Home) already serves as the public site.