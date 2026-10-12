# English portfolio and opening sequence

Objective: replace conversational first-person copy with an English professional record, keep the homepage concise, move detailed contributions to a subpage, simplify distracting motion and prevent the website appearing before the door-opening sequence.

## Content

`portfolio/index.html` is English in the saved HTML. It does not wait for a locale script, read an old language preference or offer a language toggle. The homepage summarizes experience at 1Office and FPT Education, three selected research projects, education, methods, tools and coordination experience. Each experience links to its detail section in `portfolio/about.html`; research cards retain the existing study pages.

`portfolio/about.html` now contains the detailed professional profile: responsibilities, selected assignments, methods, outputs, research records, coordination roles, education and credentials. The sales AI agent is explicitly presented as a planning-stage project. The 600 profiles and 80 sales representatives describe source-data scope, not deployment or performance improvement.

Copy follows the CV Making and Trainee Club guidance: action, object, method or scope, then supported output. Sources are the previous homepage, the local consulting profile and the publication registry. No new performance metrics, project deployments or ownership claims were added. Existing role dates were retained.

## Opening sequence

The original defect was a late activation: the saved HTML hid the opening screen, and the module showed it only after the homepage had already rendered. The new HTML starts with the opening visible, critical styles hide the header and main content, and preload hints prioritize the opening assets. A small head script handles deep links and reduced motion before the first paint.

The scene reveals the homepage at the end of the accepted door sequence. A 15-second fail-safe releases the page if the module or image cannot load. Reduced-motion users and deep links open directly. With JavaScript disabled, the English page remains readable through the noscript fallback. No skip button or footer was reintroduced.

## Motion

Removed recurring card rotations, workflow reshuffling and the tall duplicate work menu. Section entrances run once with short opacity and position transitions. The profile film is a continuous character pose with hand, head and shoulder movement; embedded Vietnamese labels and recurring paper wipes were removed.

New film: `portfolio/assets/video/chung-hy-profile-loop-v4.mp4`, H.264, 720 × 900, 30 fps, 9 seconds. Static fallback: `portfolio/assets/chung-hy-profile-film-v4-poster.webp`. Existing images and previous films are preserved. `scripts/export-profile-film.mjs` accepts `PORTFOLIO_FILM_VERSION`; no new image generation was needed.

## Verification and scope

Required staging and local-link checks were run. Browser verification covers a delayed opening-module load, initial content visibility, automatic reveal, English copy, detail links and planning status, 390/320px layouts, reduced motion and no-JavaScript fallback. Evidence is saved in `.audit/english-v4-evidence/`; the previous pages are preserved in `.audit/english-v4-before/`.

The external-audit command only scans root HTML, so the two active pages were additionally audited with its existing checker. Publisher, FCBEM, ORCID and GitHub links responded; LinkedIn restricts automated checks.

Pre-existing edits in workflow/dependency configuration, 404 pages, research pages and build/check scripts remain outside this update. The publication state must be confirmed after the GitHub Pages deployment and a production browser check.

The follow-up visual cleanup removes the header monogram/name/tagline block and the repeated name/location caption under the character. Decorative section-number labels were also removed from the homepage. The substantive profile name, role, education, location and publication status remain in the content.
