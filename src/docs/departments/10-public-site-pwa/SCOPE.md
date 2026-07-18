# Scope — Department 10 (Public Site & PWA)

## In scope
- PWA manifest (public/manifest.json) with navy theme, standalone display, maskable icons.
- index.html PWA meta: theme-color, apple-touch-icon, apple-mobile-web-app-capable, status-bar style, viewport-fit=cover.
- Generated 512×512 app icon used for favicon, apple-touch-icon, and manifest icons.
- Mobile bottom navigation (MobileNav) with 5 primary tabs + active-state highlighting.
- Mobile viewport spacing (body padding-bottom) so the fixed bar never covers content.
- Responsive layout across all app pages (already mobile-first throughout Departments 03–09).

## Out of scope (deferred)
- Offline service worker / cache-first strategy (requires vite-plugin-pwa or manual SW; deferred).
- Push notifications.
- App store (iOS/Android) packaging — handled by the Base44 publish flow.
- Public marketing pages beyond the existing Home landing.
- Splash-screen image assets (theme color used instead).