# EV choice and hotel attribute experiences

## Scope and design

Add two optional interactions to the existing English portfolio. Retain the
current Calibri typography, warm paper surfaces and muted blue/teal accents.
No framework, dependency, external service, tracking or generated scientific
figure is added. All study findings, figures and methods remain visible.

## EV: what is the visitor comparing?

- Question: what changes when an alternative costs more but has different range
  or charging time?
- Dataset: three explicitly illustrative pairs in
  `portfolio/assets/data/research-experiences.json`. These are not recovered
  survey tasks, model inputs or fitted predictions.
- Units: price in VND million; distance in km per charge; charging minutes for
  the same illustrative 20–80% interval. Network and body design are held fixed.
- Calculation: the comparison sentence subtracts A from B within the active
  task. No willingness-to-pay, demand, segment assignment or scores are derived.
- Interaction: choose either alternative, switch comparisons, revisit a choice.
  Choices remain only in page memory and reset on reload.
- Equivalent: both alternatives and their numeric specifications are text.
  The first comparison, explanation and findings also work without JavaScript.
- Detail destination: the existing reported estimates and methodology directly
  below the experience; they are never changed by the visitor's selection.

## Hotel: what is the visitor comparing?

- Question: how does one attribute's sentiment vary across the ten original
  numeric cluster IDs?
- Authoritative figure: `portfolio/assets/fig03_valence_heatmap.png`, displayed
  through its existing 1800 px WebP. Its underlying numbers were not recovered
  from colors or estimated from image pixels.
- Metric: original aspect valence, scale −1 to +1. This is sentiment, not
  attribute importance, mention frequency or service priority.
- Scope: all ten cluster rows and all eight attributes stay in the original
  order. No aggregation, ranking, rounding or filtering of the data occurs.
- Interaction: select one attribute to leave its column clear and apply a
  translucent overlay to the other columns. All attributes restores the
  untouched figure. The overlays have no independent quantitative meaning.
- Source coordinates: original plotting area x 63–1432 px, y 68–522 px on the
  1800×720 source WebP; eight equally spaced columns. These coordinates only
  position the presentation overlay.
- Mobile: the figure scrolls within its own region; row IDs stay pinned, with
  a separate text scale key. Attribute selection brings its column into view.
- Limitation: the checked source record has no verified crosswalk from numeric
  IDs 0–9 to the named guest profiles. Named profiles and shares remain below
  the map; the experience does not join the two label systems.
- Access: named buttons, pressed state, keyboard activation, live selection
  text, image description and reduced motion. Numeric cell values are not
  invented as an accessible table when the source has not supplied them.

## Production sources

- `scripts/research-experience-markup.mjs`: static HTML and illustrative registry.
- `portfolio/js/research-experiences.js`: local state and source-column overlay.
- `portfolio/styles/research-experiences.css`: styles limited to these pages.
- `scripts/build-research-cases.mjs`: conditional inclusion for EV and Hotel.
- `scripts/static-research-evidence.mjs`: avoids repeating the same heatmap in
  the old source-image section; original review-coverage figure stays inline.

## Verification

Targeted browser checks cover every EV task and both choices, previous/next
boundaries, revisiting a choice, keyboard activation, eight Hotel columns and
restore-all, unchanged findings and profile shares, no page overflow, normal
and reduced motion, and content without JavaScript. Local widths: 1440, 768,
390 and 320 px. Production verification repeats 1440 and 390 px.

Required release checks: `npm run stage:pages`, `npm run check:local` and the
existing source-bound evidence validator. External links and source media are
unchanged. Browser receipts and screenshots are in the task's `.audit/` and
`output/playwright/` folders.

The chart skill guides data meaning and accessibility. Creative Production's
exact-content guidance calls for deterministic composition for scientific
data; no image-generation asset is needed. Visualize's project-change guidance
applies: these are features in the existing site, not a separate chat mockup.
