# ORNIVALIS

ORNIVALIS is a digital yearbook and memory space for the XII-1 class. It brings together class stories, photographs, videos, messages, and shared moments in one website.

**Live website:** https://muchammadleonardtaufikputra-bot.github.io/ornivalis/

## Current stack

- HTML, CSS, and vanilla JavaScript
- GitHub Pages for the public website
- Cloudflare Worker for visitor statistics and guestbook API
- Cloudflare KV for the Worker data store

## Existing features

- Intro and landing experience
- Class letter and memory sections
- Photo gallery and video memories
- Quotes and class recollections
- Guestbook messages
- Visitor statistics and a separate statistics page

## ORNIVALIS 2.0

The 2.0 work is being developed incrementally on the `ornivalis-2.0-stage-01` branch. The existing site and its media are treated as source material: changes should preserve existing content and avoid destructive rewrites.

Planned areas include a clearer project structure, responsive visual refinement, searchable yearbook and gallery experiences, timeline storytelling, safer guestbook handling, performance improvements, optional PWA support, and release testing.

See [Architecture](docs/ARCHITECTURE.md), [Deployment](docs/DEPLOYMENT.md), and [Changelog](docs/CHANGELOG.md).

## Safety and privacy

Only publish photos, videos, names, and messages that the people shown or named have agreed to share. Do not put private contact details, passwords, access keys, or other sensitive information in the public repository. Keep Cloudflare secrets in Worker environment settings, never in frontend files.
