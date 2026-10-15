import fs from 'node:fs/promises';
import path from 'node:path';
import {validateModels,modelSvg} from './research-model-markup.mjs';
import {modelMarkup} from './static-research-models.mjs';
import {evidenceMarkup,methodsMarkup} from './static-research-evidence.mjs';
import {researchExperienceMarkup} from './research-experience-markup.mjs';

const root=process.cwd();
const {cases}=JSON.parse(await fs.readFile(path.join(root,'portfolio/assets/data/case-studies.json'),'utf8'));
const {models}=JSON.parse(await fs.readFile(path.join(root,'portfolio/assets/data/research-models.json'),'utf8'));
const {entries}=JSON.parse(await fs.readFile(path.join(root,'portfolio/assets/data/research-evidence.json'),'utf8'));
if(entries.length!==cases.length||new Set(entries.map(e=>e.id)).size!==cases.length)throw new Error('Invalid evidence set');
validateModels(cases,models);
const {entries:capabilities}=JSON.parse(await fs.readFile(path.join(root,'portfolio/assets/data/research-capabilities.json'),'utf8'));
await fs.mkdir(path.join(root,'portfolio/assets/models'),{recursive:true});
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const text=value=>escape(value);
const localLink=href=>!/^https?:/.test(href);
const link=(label,href)=>`<a href="${escape(href)}"${localLink(href)?'':' target="_blank" rel="noopener noreferrer"'}>${text(label)} <span aria-hidden="true">↗</span></a>`;
for(let i=0;i<cases.length;i++){
 const c=cases[i],next=cases[(i+1)%cases.length];
 if(!/^research-[\w-]+\.html$/.test(c.file))throw new Error('Invalid filename');
 const canonical='https://daichunghy-ben.github.io/portfolio/'+c.file;
 const evidence=entries.find(e=>e.id===c.id);
 if(!evidence)throw new Error('Missing case evidence');
 const figure=evidenceMarkup(evidence,c);
 const experience=researchExperienceMarkup(c.id);
 const model=models.find(m=>m.id===c.id);
 const capability=capabilities.find(entry=>entry.id===c.id);
 if(!capability)throw new Error('Missing capability');
 for(const mode of ['study','next'])await fs.writeFile(path.join(root,'portfolio/assets/models',c.id+'-'+mode+'.svg'),modelSvg(c,model,mode));
 const html=`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="theme-color" content="#faf9f6"/>
<title>${text(c.title)} | Dai Chung Hy</title>
<meta name="description" content="${escape(c.lead)}"/>
<meta property="og:title" content="${escape(c.title)} | Dai Chung Hy"/>
<meta property="og:description" content="${escape(c.lead)}"/>
<meta property="og:url" content="${canonical}"/>
<link rel="canonical" href="${canonical}"/>
<link rel="icon" href="../assets/favicon.png"/>
<link rel="stylesheet" href="styles/home-v2.css?v=cases8"/>
<link rel="stylesheet" href="styles/case-study.css?v=reader-first1"/>
<link rel="stylesheet" href="styles/research-evidence.css?v=reader-first1"/>
<link rel="stylesheet" href="styles/reader-first.css?v=reader-first1"/>${['ev-choice','hotel-segmentation'].includes(c.id)?'\n<link rel="stylesheet" href="styles/research-experiences.css?v=experiences1"/>':''}
</head>
<body class="case-study" data-study="${escape(c.id)}" style="--case-accent:${c.accent}">
<header class="case-header page-width"><a class="back-link" href="projects.html">← Research</a><nav aria-label="Portfolio navigation"><a href="index.html#work">Experience</a><a href="about.html#research">Full profile ↗</a></nav></header>
<main class="page-width case-main">
<section class="case-hero" aria-labelledby="case-title">
<div class="case-hero-copy"><p class="case-topic">${text(c.topic)}</p><h1 id="case-title">${text(c.title)}</h1><p class="case-lede">${text(capability.work)}</p><p class="case-skills">${capability.skills.map(text).join(' · ')}</p><div class="case-output"><span>Output</span><p>${text(capability.output)}</p></div><p class="case-status">${text(c.status)}</p></div>
<figure class="case-cover"><img class="case-hero-image" src="${escape(c.image)}" alt="${escape(c.imageAlt)}" width="1440" height="1024" fetchpriority="high"/>${c.image.includes('research-reader-first/')?'<figcaption class="cover-label">Concept illustration</figcaption>':''}</figure>
</section>
<dl class="case-facts">${c.facts.map(([label,value])=>`<div><dt>${text(label)}</dt><dd>${text(value)}</dd></div>`).join('')}</dl>
<section class="case-overview" aria-labelledby="question-title"><h2 id="question-title">${text(c.question)}</h2><p>${text(c.study)}</p></section>${experience?'\n'+experience:''}
<section id="findings" class="case-findings" aria-labelledby="finding-title"><div class="finding-intro"><h2 id="finding-title">${text(c.findingTitle)}</h2><p>${text(c.finding)}</p></div>
<section class="case-interpretation" aria-labelledby="use-title"><h2 id="use-title">${text(c.useTitle)}</h2><div><p>${text(c.use)}</p><p class="case-limit">${text(c.limit)}</p></div></section>
${figure}
</section>
${methodsMarkup(evidence)}
${modelMarkup(c,model)}
<section class="case-notes" id="study-notes"><h2>Study notes & sources</h2><div class="notes-content"><dl>${c.notes.map(([label,value])=>`<div><dt>${text(label)}</dt><dd>${text(value)}</dd></div>`).join('')}</dl><div class="case-sources">${c.sources.filter(([label,href])=>!href.endsWith('.pdf')&&!/figure|diagram/i.test(label)).map(([label,href])=>link(label,href)).join('')}</div></div></section>
<nav class="case-next" aria-label="More research"><a href="projects.html">All studies <span aria-hidden="true">↗</span></a><a href="${escape(next.file)}" data-study-link><span>Next study</span><strong>${text(next.title)} <span aria-hidden="true">→</span></strong></a></nav>
</main>
<script type="module" src="js/case-study.js?v=reader-first1"></script>${['ev-choice','hotel-segmentation'].includes(c.id)?'\n<script type="module" src="js/research-experiences.js?v=plain-research1"></script>':''}
</body>
</html>
`;
 await fs.writeFile(path.join(root,'portfolio',c.file),html);
}
await fs.writeFile(path.join(root,'portfolio/research-hanoi-phaseout.html'),`<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Motorbike phase-out policy | Dai Chung Hy</title><meta name="robots" content="noindex,follow"/><link rel="canonical" href="https://daichunghy-ben.github.io/portfolio/research-motorbike-ban.html"/><meta http-equiv="refresh" content="0;url=research-motorbike-ban.html"/><link rel="stylesheet" href="styles/home-v2.css?v=cases8"/></head><body><main class="page-width" style="padding-block:80px"><h1>Motorbike phase-out policy</h1><p style="margin-top:25px"><a href="research-motorbike-ban.html">Open the study ↗</a></p></main><script>location.replace('research-motorbike-ban.html'+location.hash)</script></body></html>\n`);
console.log('Rendered '+cases.length+' study pages and the legacy policy route.');
