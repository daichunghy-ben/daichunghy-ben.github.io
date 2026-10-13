# Portfolio simplification and navigation repair

Objective: make the website calmer and simpler, particularly research, while retaining the illustrated opening, portrait and current English MT profile.

## Design

The character remains the visual signature. The rest uses one warm off-white background, dark Calibri text and a restrained red accent. Headings are smaller, experience uses a common employer/role/date hierarchy, and the two employers share one section. Removed the result card, separate full-height FPT scene, oversized headings, dark research block, rotated image frame and crossfading project preview.

The homepage has three research links, each with a small image and one description. The research archive uses the same format for four selected studies and simple links to seven additional studies. All 11 study destinations are preserved. The archive no longer displays the old sidebar, filters, duplicate featured sections, decorative charts, 100+ deliverables, or unsupported Insight Impact +24% label.

Detailed experience remains in `portfolio/about.html`; study methods and evidence remain on the existing study pages. The latest General MT CV remains the content source from the preceding revision. This change does not establish additional publication records or business outcomes.

## Repairs

- Render only one portrait pose per frame; eliminated the overlapping-hand transition.
- Removed hidden-heading reveal logic so section titles remain readable, including while motion is paused.
- Pause no longer redraws the portrait when the page scrolls.
- Navigation initializes before dynamically importing portrait animation. The Menu control is disabled until its listener is attached.
- Menu closes with Escape, an outside click, a destination click, or a resize to desktop.
- Old home fragments Education, Honors, Certificates, Skills and Info redirect to the relevant section of the full profile. Existing no-JavaScript anchor locations remain available.
- Reduced motion skips portrait-library loading. Animation stops when out of view or the page is hidden; a restored page resumes correctly.

## Verified local status

`npm run stage:pages` and `npm run check:local` passed. The internal check verified 276 URLs. Browser verification covered the home, research archive and full profile at 320, 390, 768, 1024 and 1440px widths. No horizontal overflow or broken visible images was found. All 11 archive study destinations returned HTTP 200. Delaying the opening module kept page content hidden until the opening finished. Pause remained frozen during scroll; resume restored animation. Mobile navigation, Escape, legacy redirects and no-JavaScript content fallback passed without page errors.

`npm run audit:externals` ran; because its default scan covers root HTML, an additional audit was scoped to the three changed portfolio pages. Seven destinations were reachable; LinkedIn retains an automated-access limitation (status 999). No new external media was added.

Evidence: `.audit/simple7/verification.json` and desktop/mobile captures. Further status is recorded in `.audit/simple7/handoff.md` after production verification.

## Files and boundaries

Site files: `portfolio/index.html`, `portfolio/projects.html`, `portfolio/about.html`, `portfolio/styles/home-v2.css`, `portfolio/styles/study-archive.css`, `portfolio/js/portfolio-home.js`.

Existing unrelated edits remain outside this commit: `.github/workflows/deploy-pages.yml`, `404.html`, `portfolio/404.html`, `package.json`, `package-lock.json`, `portfolio/research-arts-workshop.html`, `portfolio/research-buffet.html`, `portfolio/research-motorbike-ban.html`, `scripts/build-images.mjs`, `scripts/check-site-local.mjs`, `styles/research-ev-immersive.css`. Existing untracked outputs and other assets are also retained.
