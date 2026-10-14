# Research subpages: design and copy revision

## Objective and scope

Replace the remaining legacy research pages with a concise case-study design that belongs to the current portfolio. Scope is the 11 studies linked from `portfolio/projects.html`, plus the old Hanoi policy alias. The homepage and archive receive only the shared stylesheet version and study-navigation transition.

Every study now has a short introduction, study scope, method, findings, an interactive figure, a practical interpretation, and expandable methods/source notes. The earlier left profile banner, quote, oversized poster statistics, decorative charts and old page scripts are removed from these pages. The main portfolio opening is retained.

## Design and motion

The case pages use the current warm paper background, Calibri and restrained colour. Study-specific imagery and figure colours give each subject a recognizable visual. No decorative separator borders are introduced.

The motion choices were researched proactively:

- [Codrops: Eduard Bodak's portfolio motion](https://tympanus.net/codrops/2025/07/29/built-to-move-a-closer-look-at-the-animations-behind-eduard-bodaks-portfolio/) informed bounded image movement and interactions that respond to reading progress. The implementation uses native browser capabilities rather than adding a scrolling library.
- [MDN: cross-document view transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@view-transition) informed the thumbnail-to-cover transition on supported browsers.
- [MDN: reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion) informs the static fallback. View transitions are a progressive enhancement; unsupported browsers retain normal navigation.

The new figures compare EV buyer groups, hotel segment shares, experimental influencer stimuli, nutrition measures, policy estimates, hotel penalty/reward coefficients, value profiles and model pathways. Choices work with keyboard buttons and update readable values. Figures and method notes remain readable without JavaScript.

## Copy and evidence

Applied `/Users/macos/.codex/skills/humanizer/SKILL.md` in rewrite mode with a corrective second pass. Removed promotional language, staged reveals, generic conclusions, repeated summaries and unnecessary technical framing. Rebuilt the narrative around the research question, actual procedure and supported result. No first-person experience, new anecdotes or new commercial outcomes were invented.

Text inventory, excluding scripts/styles and including the expandable notes and controls: 6,396 words before; 3,242 after. Combined reduction: 49.3%. Each of the 11 pages is shorter. Evidence: `.audit/case-redesign-2026-10-14/copy-audit.json`.

Important source distinctions:

- EV willingness-to-pay figures are model estimates with uncertainty. Removed the misleading revenue interpretation of a modelled scenario gap.
- Hotel segmentation retains the reported project dataset of 74,896 reviews, 458 hotels and 10 groups. This case uses its research materials; the 20,000-review figure in the MT CV is not substituted into this case. The relationship between those source counts is not established by this redesign.
- Virtual influencer N = 244, experimental design and publication date were checked against the [Springer record](https://doi.org/10.1007/978-981-96-4116-1_9). The hosted `Virtual-Influencer.pdf` is a conference certificate, and its link is labelled correctly.
- Nutrition measures and values were checked against the hosted `FCBEM-029-Nutrition.pdf`, particularly Tables 2 and 3. Cross-sectional associations are retained without causal claims.
- CIEMB EV and policy work remains manuscript/conference context. Framework pages do not acquire invented samples or numerical effect sizes.
- Buffet intake is intended intake, not observed restaurant food waste. The odds ratio and choice-share change retain distinct meanings.
- The arts sample and paths remain reported project values; the redesign does not establish a verified publication or causal attendance result.

The original page snapshots and pre-existing research diff are saved locally under `.audit/case-redesign-2026-10-14/sources/`.

## Files

- `portfolio/assets/data/case-studies.json`: concise narratives, figure values, notes and sources.
- `scripts/build-research-cases.mjs`: renders the 11 static HTML pages and the policy alias. Run from the repository root after editing the data.
- `portfolio/styles/case-study.css`: case layout and figures.
- `portfolio/js/case-study.js`: figure interaction, image movement and reading entry effects.
- `portfolio/js/study-navigation.js` and the addition to `portfolio/styles/home-v2.css`: image/navigation transition.
- `portfolio/assets/buffet-case-cover.webp`: compressed cover derived from the existing PNG; the original is preserved.

## Verified local status

`npm run stage:pages` passed. `npm run check:local` verified 134 internal URLs. The active-page external audit checked 19 destinations: 18 reachable, LinkedIn limited automated access; no replacement destination was found.

Browser verification passed on all 11 studies at desktop 1440px and at 768, 390 and 320px, including opened notes. No horizontal overflow, broken visible images or page errors were found. Selectors update content; keyboard activation and method/source disclosure work. Archive → EV → archive navigation and the policy alias work. Static figures and disclosure remain readable without JavaScript. Analysis-image sources open in a viewer with keyboard dismissal and a link to the original file. Cover motion responds to scroll. A native cross-document transition was observed in the browser used for the review recording.

Local evidence: `.audit/case-redesign-2026-10-14/verification.json`, desktop/mobile captures and `output/portfolio-review/cases-2026-10-14/research-motion.mp4`. Production evidence is recorded in `.audit/case-redesign-2026-10-14/handoff.md` after deployment.

## Existing edits

The previous canonical-URL corrections on arts, buffet and motorbike pages are retained in the regenerated pages; those pages are now part of the authorized research redesign.

Unrelated tracked edits remain outside this publication: `.github/workflows/deploy-pages.yml`, `404.html`, `portfolio/404.html`, `package.json`, `package-lock.json`, `scripts/build-images.mjs`, `scripts/check-site-local.mjs`, `styles/research-ev-immersive.css`. Other existing untracked assets and outputs are retained.
