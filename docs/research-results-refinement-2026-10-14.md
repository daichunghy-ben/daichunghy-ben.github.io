# Research case studies: result-first refinement

The previous model-map release explained analysis sequences but made the cases feel interchangeable. This refinement gives each research family a result figure that matches its question. The existing paper palette, Calibri typography, page navigation and English profile remain the visual system.

## Changes

| Study | Main result figure | Detail now visible |
| --- | --- | --- |
| EV choice | Two-group interval plot | Four attribute estimates and all eight reported 95% intervals; shared zero reference and model-class filtering |
| Hotel segmentation | Segment distribution and original analysis gallery | Ten named shares, sentiment heatmap with original numeric cluster IDs, and weekly review-volume figure |
| PRCA | Paired coefficient plot | Penalty and reward on one scale, preserved negative WiFi reward, reported Kano classes and class filters |
| Virtual influencers | 2 × 2 stimulus matrix | All four experimental conditions together; selected stimulus opens at full size |
| Nutrition | Knowledge domains, dietary-score view and regression output | Item counts, means/SDs, each dietary scale's own maximum, coefficient units and printed intervals |
| Motorbike policy | Full attribute valuation plot | All 14 recorded Table 5 values and the five Table 4 interaction coefficients/SEs |
| Buffet | Paired-intake comparison and premium-choice view | Both studies' means, sample sizes, premium shares, 28.6 percentage-point contrast and separate OR = 0.52 interpretation |
| Influencer strategy | Construct diagram and split-sample display | CX/CEX/BE → CE → CR, reported R² values and the 200/365 EFA/CFA-SEM split |
| Arts workshops | Experience-value mediation diagram | All three experience dimensions; only the supplied 0.35 and 0.59 paths carry numeric labels |
| Psychological ownership | Individual/shared ownership diagram | Individual and collective levels remain distinct; paths retain conceptual status |
| Hotel value | Image-led service-profile comparison | Review theme, service hypothesis and validation question for each conceptual profile |

Main plots have keyboard-operable selections. Desktop charts can also be inspected directly by selecting their points or construct labels. Mobile uses readable values and compact interval/relationship layouts instead of shrinking desktop plot text. Details carry exact tables, model specification, original source images and the previously developed future-study maps.

The analysis map and proposed next study are behind a disclosure. The `Model map` link and direct `#models` URLs open it automatically. First-view copy now focuses on findings and their interpretation.

## Source handling

Values come from the existing case-study record, archived original subpages, `js/research-ev-interaction.js`, `scripts/build_motorbike_figures.py`, manuscript figures and the hosted FCBEM nutrition paper. The review heatmap is shown as an original image, not converted into fabricated numeric cells. A verified name-to-cluster-ID mapping is unavailable, so labels are not silently joined.

The nutrition paper Table 5 rounds the physical-activity CI to `[0.003, 0.003]` while printing a point estimate of `0.0029`. The page preserves the printed numbers and identifies the rounding issue; it does not invent extra precision. Regression coefficients retain their measurement units and are not presented as standardized importance.

EV intervals are shown individually. No cross-class difference interval, additive scenario confidence interval or revenue forecast is constructed. No raw dataset was fitted in this task. The hypothetical future studies remain separate from performed methods.

Arts interpretation distinguishes the displayed mediated pathway from a complete PROCESS Model 4 specification. A direct-effect coefficient and consistent scaling for the two displayed paths are unavailable. They are not multiplied into a claimed indirect estimate. Method explanations were checked against Andrew Hayes's official PROCESS documentation at `https://www.afhayes.com/home.html`, `https://wp.afhayes.com/history.html` and `https://www.afhayes.com/public/apimemprocess.pdf`. Confidence-interval explanation was checked against the NIST handbook at `https://www.itl.nist.gov/div898/handbook/prc/section1/prc14.htm`.

## Deterministic exports

`portfolio/assets/figures/` holds a standalone SVG and a 2700 × 1620 PNG for each case. These are composed with standard plotting tools from `portfolio/assets/data/research-evidence.json`, using Calibri when available. They use real recorded values or explicit conceptual diagrams. Source stimuli and profile illustrations are retained inside the relevant exported figures. No generative image model writes chart numbers or labels.

Regenerate exports with `python3 scripts/build-research-figures.py` in a runtime with matplotlib and Pillow. Validate locked values with `node scripts/validate-research-evidence.mjs`, then regenerate pages with `node scripts/build-research-cases.mjs`.

## Verification

All result views, item selections, disclosures, data tables, keyboard controls and model links were checked locally across the 11 cases at 1440, 1024, 768, 390 and 320 px. No page errors, horizontal overflow or clipped plot text were recorded. No-JavaScript defaults and source tables remain readable. Additional checks exercised every direct chart target by keyboard, a construct-label click, source-image modals, actual SVG download, reduced-motion cancellation and the `#models` deep link.

The publication and final production checks are recorded in the local audit handoff. Pre-existing workflow, package, 404, legacy CSS and build-script edits must remain outside this change.
