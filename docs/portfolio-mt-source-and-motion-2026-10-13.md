# Portfolio: latest MT source and illustrated motion

## Source

Primary source: `/Users/macos/Desktop/CV/CV_Cap_nhat_2026-10-12/Dai_Chung_Hy_General_MT_CV.docx`.
File modified: 12 October 2026, 16:00:25 local time. Paired PDF modified at 16:00:28.
SHA-256: `2a8962fcadbd63c06504f57444d04da3bc4d9eabb1d5982777b8a6fe3c9486b8`.

The earlier home/profile revision used the older portfolio and consulting profile. This revision replaces that positioning with the current General MT CV. The Techcombank-specific CV is not the source. CV statements are candidate-provided evidence; this revision does not independently certify their business outcomes.

## Content decisions

- 1Office: AI Business Consultant, Apr–Sep 2026. Three workflows for 400 apartments; report preparation and approval submission reduced from about three days to 30 minutes. Separate customer analysis covers 595 records across two years.
- Planned sales AI agent: 600 customer profiles, records maintained by 80 sales representatives. These are data-source counts, not deployed users or performance results.
- FPT: AI Chatbot Project Assistant, Mar–May 2025. Questionnaire and feedback from six high schools; concept, information structure and proposal to a research council.
- Hospitality: 20,000 reviews, 300 accommodation providers, eight segments, market recommendations for a Marriott Resort project. This is not represented as employment at Marriott.
- CIEMB: two manuscripts, not newly established publications. Springer chapter and FCBEM proceedings-linked nutrition paper retain their distinct publication labels.
- VietPride: Volunteer Team Leader, 2025, 30 volunteers and 300+ parade participants.
- SUS Business Club: Human Resources Member, Sep 2023–Dec 2025, monthly reviews for 20 members.
- Swinburne: Bachelor of Business, Marketing, Sep 2022–Feb 2026. Awards, skills and 2026 training follow the latest CV. Removed older, unnecessary credentials and tools from this profile.

Home retains selected evidence and short links. `portfolio/about.html` contains the full experience, research, leadership, education and skills. The original CV files are unchanged and are not uploaded to the public website.

## Design and motion

Reference choice remains Huyml and Cartooneast, as selected by Hy. Preserve the opening gate so the door scene appears before the website, and the existing no-skip opening. Reuse existing generated character artwork.

The homepage uses a full-height cutout character next to the profile, with a sticky portrait through experience. Greeting transitions into a pointing pose on scroll. The head, hand and torso use the existing mesh animation, with limited pointer response. Research links change a large project preview on hover or keyboard focus. Contact ends with a waving character. No brand lockup, embedded video labels, ornamental section numbers, or footer is added.

Continuous animation stops when out of view, paused, or the document is hidden. Reduced motion uses static images and bypasses the opening. A no-JavaScript fallback keeps content and project images readable. Mobile uses a single column with visible project images and no pinned scroll sequence.

## Scope and handoff

Changed files: `portfolio/index.html`, `portfolio/about.html`, `portfolio/styles/home-v2.css`, `portfolio/styles/profile-detail.css`, `portfolio/js/portfolio-home.js`, `portfolio/js/profile-film.js` and `portfolio/js/profile-copy.js`.

Unrelated existing edits in the deployment workflow, dependencies, 404 pages, other research pages and build/check scripts remain outside this commit. No new external media is introduced.

Validation and live deployment evidence are recorded below after verification.

## Verified local result

- `npm run stage:pages` succeeded; `npm run check:local` verified 293 internal URLs.
- Active-page external audit checked seven unique URLs: six reachable, LinkedIn requires manual access because it returns status 999 to automated requests. No replacement target was found. The default audit command scans root HTML, so the additional audit was scoped to the two changed portfolio pages.
- Browser checks passed at desktop 1440 × 900 and mobile 390/320 × 844. Delaying the opening module by 2.2 seconds kept the homepage and header hidden until the intro completed.
- Compared rendered canvas frames: greeting and closing change over time, pause freezes the drawing, resume restores movement, and scroll switches the portrait to the pointing pose.
- Research preview switches on hover and keyboard focus. Mobile navigation opens and closes after selecting a destination. All visible images load, there is no horizontal overflow, and reduced-motion/no-JavaScript fallbacks display content.
- Visual review caught and fixed an initially hidden section-heading effect and the cropped presentation portrait.
- Local browser evidence: `.audit/mt6-evidence/validation.json` and the associated desktop/mobile captures.
- Local review video: `output/portfolio-review/mt6/website-motion.mp4`, 25.92 seconds, 1280 × 800. It records the actual opening, portrait/experience transition, research preview, education and closing scene.

Existing unrelated tracked edits retained outside the publication commit:
`.github/workflows/deploy-pages.yml`, `404.html`, `package.json`, `package-lock.json`, `portfolio/404.html`, `portfolio/research-arts-workshop.html`, `portfolio/research-buffet.html`, `portfolio/research-motorbike-ban.html`, `scripts/build-images.mjs`, `scripts/check-site-local.mjs`, `styles/research-ev-immersive.css`.
