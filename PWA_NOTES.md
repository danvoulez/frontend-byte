# PWA & iPhone Safe-Area Setup

This Next.js app was adapted to run as a PWA and respect iPhone safe areas.

## What was added
- `/public/manifest.webmanifest` with basic metadata and icons in `/public/icons`.
- `/public/sw.js` (network-first, basic offline fallback).
- `app/viewport.ts` with `viewportFit: 'cover'` (iOS notches).
- `app/layout.tsx` updated to include PWA `<Head>` tags and to register the Service Worker.
- `app/globals.css` updated with `env(safe-area-inset-*)` safe-area paddings and `min-height: 100dvh` to avoid URL-bar jumps.

## How to test
1. `pnpm install` (or `npm i`, `yarn`).
2. `pnpm dev` and open on iPhone Safari (or Simulator).
3. Add to Home Screen to fully hide the URL bar (standalone mode).

## Notes
- iOS Safari can't be forced to hide the URL bar in normal browsing. Installing as a PWA (Add to Home Screen) removes it.
- Adjust colors/titles in `manifest.webmanifest` and `<meta name="theme-color">` as desired.
