# Changelog

Notable project changes are recorded here.

## ORNIVALIS 2.0 — in progress

### Stage 01: Foundation

- Created a dedicated `ornivalis-2.0-stage-01` development branch from `main`.
- Documented the existing project purpose, technology stack, and feature baseline.
- Added an architecture plan that prioritizes incremental migration and preservation of existing media.
- Added deployment and privacy guidance.

### Planned

- Responsive visual refinement and accessibility.
- Yearbook profiles and improved gallery discovery.
- Timeline storytelling and guestbook safeguards.
- Performance, optional PWA support, security review, and release testing.

### Full 2.0 implementation pass

- Refined the existing site without replacing its original memories, media, or main content.
- Added sticky section navigation, active-section indication, reading progress, and a back-to-top control.
- Added manual light/dark theme selection with local preference persistence.
- Added gallery text search combined with the existing category filters and live result counts.
- Enabled native video controls, lazy image loading, and responsive visual refinements.
- Added a web app manifest and a lightweight service worker for the site shell and image cache.
- Updated the statistics page to send its admin key in a request header instead of placing it in the URL.
- Restricted Worker CORS to the official GitHub Pages origin and added safer response headers.

**Deployment note:** Worker source changes in this repository still need to be deployed separately in Cloudflare. GitHub Pages branch preview does not deploy the Cloudflare Worker.
