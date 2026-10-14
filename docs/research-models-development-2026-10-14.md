# Research model depth and development

Objective: explain the research and machine-learning methods behind all 11 case studies, and give each study a concrete development path that can expand as evidence and data become available.

## Delivery

Each subpage has a selectable study map and a proposed next-study map. Selecting a node explains its role and connected components. Relevant paths animate once after selection; reduced-motion settings remove animation. On narrow screens, the node grid and explicit relationship text preserve the meaning of the graph.

The 22 diagrams are also available as standalone SVG files in `portfolio/assets/models/`. These are schematic research diagrams rather than data plots. They contain no invented observations, fit scores or coefficients. Both maps and proposal disclosures remain available without JavaScript.

Existing result figures and reported samples remain in the case-study data. PRCA wording was clarified to OLS with HC1 robust standard errors, rather than implying a different robust-regression estimator. The EV willingness-to-pay node identifies the latent class model as the source of the displayed values.

## Evidence and claim boundaries

The current architecture is reconstructed from the existing case-study records, archived original subpages and manuscript figures. Those sources establish reported methods, not independent reproduction. Virtual-influencer structure was also checked against the Springer chapter abstract at https://link.springer.com/chapter/10.1007/978-981-96-4116-1_9. Speciesism points to the cue–outcome relationships as a measured moderator, rather than being drawn as an experimental condition or ordinary direct effect.

Hotel value and psychological ownership retain conceptual status. EV and motorbike pages retain CIEMB manuscript/conference status. Nutrition retains the FCBEM proceedings-linked paper status. Publication wording is not upgraded.

Every `Next study` panel says `Proposed extension · not performed`. Its protocol specifies question, design and unit, measures and analysis, data and sample needs, and a decision gate. New samples, model training, interventions, fit metrics and external validation are not claimed. Literature novelty has not been established by a systematic search.

## Development decisions

| Case | Current architecture | Proposed next decision |
| --- | --- | --- |
| Hotel segmentation | Aspect sentiment → K-means and GMM → profiles | Audit labels, compare representations and clustering, check unseen hotels and later dates, then consider a service trial |
| EV choice | MNL, mixed logit and latent class | Reproduce task coding, compare respondent-held-out choice prediction, then test a new buyer sample |
| Virtual influencers | Factorial cues, purchase intention and measured speciesism | Randomize disclosure and message quality; record behavior separately from intention and measured mechanisms |
| Nutrition | Knowledge, activity and demographics in regression | Predict later diet scores with simple and nonlinear benchmarks, then separately evaluate a support intervention |
| Motorbike phase-out | Policy attributes, preference interactions and WTP | Reproduce the specification, examine heterogeneity across districts, then evaluate observed pilot uptake |
| Hotel PRCA | Sentence-BERT, positive/negative indicators and OLS with HC1 | Audit mapping error, assess property dependence and temporal stability before prioritizing services |
| Hotel value | Themes → value dimensions → service hypotheses | Define constructs through interviews, pilot items, evaluate measurement, then estimate bounded associations |
| Influencer strategy | Split-sample measurement, engagement and retention constructs | Collect a longitudinal panel and permissioned return events; separate structural explanation from prediction |
| Buffet | Menu contrasts, intended calories, perceived value and ordinal logit | Randomize a feasible field unit and observe consumption/waste plus a commercial guardrail |
| Psychological ownership | Individual/shared ownership, commitment and cooperation | Develop measures, justify team aggregation and test the pathway over time |
| Arts workshops | Experience values, attitude, intention and PROCESS Model 4 | Test a defined beginner-guidance format against actual booking or repeat attendance |

These paths are conditional, not fixed model-count targets. More complex models proceed only when measurement, independent observations and validation support them. A well-tested simple model can remain the final choice.

## Open research requirements

The full estimation files and raw datasets were not recovered or reanalysed in this task. A future analysis requires the data dictionary, participant or property identifiers where relevant, coding and exclusions, model specifications and permission to reuse the data. A prospective study also needs a defined setting, recruitment feasibility, effect/precision-based sample rationale, missing-data and attrition plan, and an appropriate review and consent process.

Permissioned behavioral joins must specify access, linkage, de-identification, retention and sharing. These are prerequisites for conducting the proposed studies, not claims of completed approvals. No participant records or identifiable data are added to the public site.

Method references consulted on 14 October 2026 are the official Sentence Transformers semantic-similarity documentation and scikit-learn documentation for clustering, Gaussian mixtures, grouped cross-validation, cross-validation and ensembles. They support candidate-method explanations, not evidence that those candidate methods were used by Hy. Relevant links are included inside the proposal panels.

## Implementation

- Data and node explanations: `portfolio/assets/data/research-models.json`
- Page rendering and vector generation: `scripts/build-research-cases.mjs`, `scripts/research-model-markup.mjs`
- Interaction and responsive design: `portfolio/js/research-models.js`, `portfolio/styles/case-study.css`
- Generated pages: all 11 current `portfolio/research-*.html` cases

Regenerate with `node scripts/build-research-cases.mjs`, then use the required Pages staging and local link checks. Only files for this change should be staged; the pre-existing workflow, package, 404, legacy styling and output changes are unrelated.

## Verification

Local browser verification passed both modes and every model node across all 11 cases at 1440, 1024, 768, 390 and 320 px. It checked selected-node text, relationship controls, proposal disclosure, protocol expansion, keyboard activation, SVG availability, node overlap, horizontal overflow, no-JavaScript fallback and connected-path animation. No page errors were recorded. Final deployment evidence is recorded in the local audit handoff after publication.
