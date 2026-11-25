# ORNIVALIS Architecture

## Current repository baseline

The current website is primarily a static HTML page with embedded styling and scripting. Its existing sections include:

- Surat Terbuka untuk XII-1
- Galeri Kenangan
- Video Kenangan
- Kata-Kata yang Menyentuh
- Hal-Hal Kecil yang Akan Selalu Kita Ingat
- Pesan untuk ORNIVALIS
- Closing section

The repository also contains `stats.html`, an `images/` collection, a `videos/` collection, and `worker/ornivalis-stats.js`.

The frontend is hosted on GitHub Pages. The statistics and guestbook API are served separately by a Cloudflare Worker, which uses the `ORNIVALIS_STATS` KV binding and the `ORNIVALIS_STATS_PASSWORD` secret.

## Design principles for 2.0

1. Preserve existing photographs, videos, stories, and working features.
2. Prefer progressive enhancement over a risky full rewrite.
3. Keep the public frontend static and lightweight.
4. Keep secrets and privileged operations on the server side.
5. Make motion optional and respect reduced-motion preferences.
6. Validate and safely render all user-submitted content.
7. Make mobile usability and accessibility part of each stage.

## Target structure

This is the intended direction, not a claim that all files already exist:

```text
/
├── index.html
├── stats.html
├── manifest.json
├── sw.js
├── assets/
│   ├── icons/
│   └── fonts/
├── css/
│   ├── base.css
│   ├── theme.css
│   ├── layout.css
│   ├── components.css
│   └── responsive.css
├── js/
│   ├── app.js
│   ├── navigation.js
│   ├── gallery.js
│   ├── yearbook.js
│   ├── timeline.js
│   ├── guestbook.js
│   └── animations.js
├── data/
│   ├── members.json
│   ├── gallery.json
│   └── timeline.json
├── images/
├── videos/
├── worker/
│   └── ornivalis-stats.js
└── docs/
    ├── ARCHITECTURE.md
    ├── CHANGELOG.md
    └── DEPLOYMENT.md
```

Move code and assets in small, verifiable steps. Do not remove the existing inline implementation until an equivalent external module has been tested.

## Delivery stages

1. Foundation, repository audit, backup branch, and documentation.
2. Visual identity, responsive layout, navigation, and accessibility.
3. Digital yearbook and member profile data.
4. Gallery search, filters, albums, and accessible lightbox.
5. Guestbook moderation, validation, and abuse controls.
6. Timeline and memory storytelling.
7. Cinematic effects with reduced-motion and user controls.
8. Privacy-conscious analytics and statistics dashboard.
9. Performance and optional PWA/offline support.
10. Security review, regression tests, documentation, and release.

## Data and privacy boundaries

- Public profile and gallery data should contain only information approved for publication.
- Never commit Worker secrets, API credentials, private contact information, or authentication tokens.
- Keep privileged statistics and deletion actions protected by server-side authorization.
- Treat browser-submitted messages as untrusted input.
- Minimize analytics collection and avoid exposing raw identifiers.
