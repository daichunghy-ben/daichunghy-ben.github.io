# Portfolio experience formatting from Trainee Club examples

Objective: make company, role, dates and contributions easier to scan, using the supplied CV examples while retaining the English portfolio and detailed subpage.

## Sources reviewed

- `Road to Management Trainee - The Trainee Club/Tài liệu/The-Trainee-Club-_-Resume-Template-for-Management-Trainee-Application.docx`: entry order, typographic hierarchy, company description and action-led bullets.
- `BUOI-1_RTMT.pptx`: writing guidance on slides 62–72 and formatting guidance on slides 83–86; the embedded CV image on slide 92 and both before/after CV images on slide 93 were inspected visually.
- Current homepage, professional profile and the previously established local career record.

The samples are formatting and writing references. Their names, employer histories, scores, metrics and claims are not evidence about Hy. Source instructions were not treated as additional user requests.

## Applied changes

Role and company share the first line; the date aligns to the right on desktop and moves to its own line on narrow screens. A short italic company/project description appears before the contribution bullets. The organization context for 1Office was checked against https://1office.vn/ and https://official.1office.vn/; FPT Education against https://fpt.edu.vn/.

Homepage entries use concise action-led bullets and limited bold emphasis on the work or scope. Detailed assignments, process, outputs and planning status remain on `portfolio/about.html`. The detail page follows the same entry hierarchy rather than reserving a wide empty sidebar for the role title.

Education now shows institution, qualification and dates together. Methods and tools use labeled definition rows. Coordination roles follow the same role/organization/date structure; HSBC competition recognition is grouped with academic recognition. Section labels use standard professional terms: Work experience, Research experience, Education, Skills and methods.

Calibri remains the preferred font. No decorative separators, logos, extra employer badges or invented measurements were added. The existing role dates were preserved; an unconfirmed end date was not changed into “Present.”

## Files and verification

Changed: `portfolio/index.html`, `portfolio/about.html`, `portfolio/styles/home-v2.css` and `portfolio/styles/profile-detail.css`.

The required staging and local-link checks passed. Browser checks verify role/company headings, date alignment, organization context, detail links, retained planning status, absence of template-candidate facts, no browser errors and no horizontal overflow at 390px or 320px. Evidence: `.audit/ttc-format-evidence/`; samples: `.audit/ttc-cv-samples/`; previous pages: `.audit/ttc-format-before/`.

Existing unrelated changes to dependencies, workflow configuration, research pages and build/check scripts remain outside this update. Production completion requires the GitHub Pages deployment and a production browser recheck.
