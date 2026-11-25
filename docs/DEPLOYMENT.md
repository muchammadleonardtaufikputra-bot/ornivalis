# Deployment Guide

## Website

The public website is hosted with GitHub Pages:

https://muchammadleonardtaufikputra-bot.github.io/ornivalis/

The current project uses static HTML, CSS, JavaScript, images, and videos. Keep asset paths compatible with the repository's project-site base path (`/ornivalis/`) when adding links, manifests, or service-worker files.

## Safe release workflow

1. Make changes on the feature branch, not directly on `main`.
2. Review the changed-file list and confirm that existing media and content remain present.
3. Test the site locally or with a preview before merging.
4. Check desktop and mobile layouts, navigation, gallery, videos, and guestbook.
5. Confirm that no secrets or private information were added.
6. Merge only after the changes are reviewed and working.
7. Confirm the GitHub Pages deployment and test the live site.

## Cloudflare Worker

The Worker source is `worker/ornivalis-stats.js`. It expects the configured KV binding `ORNIVALIS_STATS` and secret `ORNIVALIS_STATS_PASSWORD`.

Deploy Worker changes through the Cloudflare dashboard or the project's approved deployment workflow. Do not put secret values in this repository or in frontend JavaScript.

After a Worker deployment, verify the supported routes and confirm that guestbook and statistics behavior still works. Avoid destructive tests against live visitor or message data.

## PWA notes

If a web app manifest or service worker is introduced, verify that its scope and asset paths work under the GitHub Pages project path `/ornivalis/`. Test cache updates and ensure the service worker does not keep users stuck on an outdated release.
