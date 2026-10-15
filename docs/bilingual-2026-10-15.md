# Vietnamese and English portfolio

The 14 active pages have separate English and Vietnamese versions: home,
profile, research archive and all 11 research cases. English filenames remain
unchanged; Vietnamese filenames end in `.vi.html` in the same directory.

Each page has native VI / EN links, a matching HTML language, canonical URL
and reciprocal language alternatives. Navigation within the Vietnamese site
continues to Vietnamese pages. Switching language preserves the current page
and reading anchor; changing language on the home page does not replay the
entrance scene. The links and translated body copy work without JavaScript.

`scripts/build-locales.mjs` generates the pairs from the English pages and the
edited Vietnamese dictionary in `portfolio/assets/data/translations-vi.json`.
The release staging script runs generation before copying the site. Unknown
English text fails generation rather than silently falling back. Generation
is repeatable. Edit the dictionary, rather than generated `.vi.html` pages.

Vietnamese copy was reviewed for professional CV wording, research terms,
units and the distinction between results and proposals. Proper names,
official course names and source profile labels are retained where needed.
Original raster scientific figures and model-image labels stay intact;
Vietnamese captions and explanations sit next to them. Inline charts and
their HTML data are localized without changing the values.

EV choices, comparison explanations and Hotel highlighting messages follow
the document language. The home motion control has matching accessible labels.
No runtime translation provider, third-party translation script, language
gate or additional application framework is introduced.

Validation confirms unchanged English body copy on 14 pages and unchanged
contents of all five research data/model registries. Local browser checks
cover all 28 pages at 1440 and 390 px, five core page pairs at 320 px,
language/anchor round trips, no-JavaScript use and both interactive experiences.
Required stage/build, internal URL checks and source evidence checks also pass.
Browser receipts and screenshots are in the task's audit/output directories.

Pre-existing image/provenance, package, workflow, 404 and other unrelated
working-tree changes are excluded from this update.
