import fs from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd();
const {cases}=JSON.parse(await fs.readFile(path.join(root,'portfolio/assets/data/case-studies.json'),'utf8'));
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const text=value=>escape(value);
const number=value=>new Intl.NumberFormat('en-US',{maximumFractionDigits:3}).format(value);
const button=(label,index,active=false)=>`<button type="button" class="case-choice${active?' is-selected':''}" data-choice="${index}" aria-pressed="${active}" disabled>${text(label)}</button>`;
const note=(value,tag='p')=>`<${tag} class="figure-note" data-figure-note>${text(value)}</${tag}>`;
const barRows=(labels,values,maximum,unit)=>labels.map((label,i)=>`<div class="data-row"><span class="data-label">${text(label)}</span><span class="data-track" aria-hidden="true"><span class="data-bar${values[i]<0?' is-negative':''}" style="width:${Math.min(100,Math.abs(values[i])/maximum*100)}%"></span></span><strong class="data-value">${number(values[i])}<small>${text(unit)}</small></strong></div>`).join('\n');
function visualMarkup(v){
 if(v.type==='comparison'){
  const s=v.states[0];return `<div class="figure-choices" aria-label="Comparison">${v.states.map((s,i)=>button(s.label,i,i===0)).join('')}</div><div class="bar-chart" data-chart>${barRows(s.labels||v.labels,s.values,s.max||v.max,s.unit||v.unit)}</div>${note(s.note)}`;
 }
 if(v.type==='segments')return `<div class="segment-layout"><div class="segment-detail" aria-live="polite"><strong data-share>${v.items[0][1]}<small>%</small></strong><h3 data-segment>${text(v.items[0][0])}</h3><p>Share of the review sample</p></div><div class="segment-bars" aria-label="Guest segments">${v.items.map(([label,value],i)=>`<button class="segment-row${i===0?' is-selected':''}" data-choice="${i}" type="button" aria-pressed="${i===0}" disabled><span>${text(label)}</span><span class="segment-track" aria-hidden="true"><span style="width:${value/v.items[0][1]*100}%"></span></span><strong>${value}%</strong></button>`).join('')}</div></div>`;
 if(v.type==='stimuli'||v.type==='profiles'){
  const s=v.items[0];return `<div class="figure-choices" aria-label="${v.type==='stimuli'?'Experimental condition':'Guest profile'}">${v.items.map((s,i)=>button(s.label,i,i===0)).join('')}</div><div class="image-inspector${v.type==='stimuli'?' is-stimulus':''}"><img data-inspector-image src="${escape(s.image)}" alt="${escape(s.label)}" width="1000" height="1100" loading="lazy"/><div class="inspector-copy" aria-live="polite"><h3 data-inspector-title>${text(s.title||s.label)}</h3><p data-inspector-note>${text(s.note)}</p></div></div>`;
 }
 if(v.type==='pathway')return `<div class="figure-choices" aria-label="Model input">${v.items.map((s,i)=>button(s.label,i,i===0)).join('')}</div><div class="pathway-board" aria-live="polite"><div class="pathway-node is-input"><span>Input</span><strong data-path-input>${text(v.items[0].label)}</strong></div><span class="pathway-arrow" aria-hidden="true">→</span><div class="pathway-node"><span data-path-metric>${text(v.middleMetric)}</span><strong>${text(v.middle)}</strong></div><span class="pathway-arrow" aria-hidden="true">→</span><div class="pathway-node is-output"><span>${text(v.endMetric)}</span><strong>${text(v.end)}</strong></div></div>${note(v.items[0].note)}`;
 throw new Error('Unknown visual '+v.type);
}
const localLink=href=>!/^https?:/.test(href);
const link=(label,href)=>`<a href="${escape(href)}"${localLink(href)?'':' target="_blank" rel="noopener noreferrer"'}>${text(label)} <span aria-hidden="true">↗</span></a>`;
for(let i=0;i<cases.length;i++){
 const c=cases[i],next=cases[(i+1)%cases.length];
 if(!/^research-[\w-]+\.html$/.test(c.file))throw new Error('Invalid filename');
 const canonical='https://daichunghy-ben.github.io/portfolio/'+c.file;
 const figure=visualMarkup(c.visual);
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
<link rel="stylesheet" href="styles/case-study.css?v=cases8"/>
</head>
<body class="case-study" data-study="${escape(c.id)}" style="--case-accent:${c.accent}">
<header class="case-header page-width"><a class="back-link" href="projects.html">← Research</a><nav aria-label="Portfolio navigation"><a href="index.html#work">Experience</a><a href="about.html#research">Full profile ↗</a></nav></header>
<main class="page-width case-main">
<section class="case-hero" aria-labelledby="case-title">
<div class="case-hero-copy"><p class="case-topic">${text(c.topic)}</p><h1 id="case-title">${text(c.title)}</h1><p class="case-lede">${text(c.lead)}</p><p class="case-status">${text(c.status)}</p><a class="case-jump" href="#findings">Explore findings <span aria-hidden="true">↓</span></a></div>
<figure class="case-cover"><img class="case-hero-image" src="${escape(c.image)}" alt="${escape(c.imageAlt)}" width="1440" height="1024" fetchpriority="high"/></figure>
</section>
<dl class="case-facts">${c.facts.map(([label,value])=>`<div><dt>${text(label)}</dt><dd>${text(value)}</dd></div>`).join('')}</dl>
<section class="case-overview" aria-labelledby="question-title"><h2 id="question-title">${text(c.question)}</h2><p>${text(c.study)}</p></section>
<section id="findings" class="case-findings" aria-labelledby="finding-title"><div class="finding-intro"><h2 id="finding-title">${text(c.findingTitle)}</h2><p>${text(c.finding)}</p></div>
<figure class="case-figure" data-figure><figcaption><h3>${text(c.visual.title)}</h3><p>${text(c.visual.caption)}</p></figcaption>${figure}</figure>
</section>
<section class="case-interpretation" aria-labelledby="use-title"><h2 id="use-title">${text(c.useTitle)}</h2><div><p>${text(c.use)}</p><p class="case-limit">${text(c.limit)}</p></div></section>
<details class="case-notes" id="study-notes"><summary>Methods & sources <span aria-hidden="true">+</span></summary><div class="notes-content"><dl>${c.notes.map(([label,value])=>`<div><dt>${text(label)}</dt><dd>${text(value)}</dd></div>`).join('')}</dl>${c.sources.length?`<div class="case-sources">${c.sources.map(([label,href])=>link(label,href)).join('')}</div>`:''}</div></details>
<nav class="case-next" aria-label="More research"><a href="projects.html">All studies <span aria-hidden="true">↗</span></a><a href="${escape(next.file)}" data-study-link><span>Next study</span><strong>${text(next.title)} <span aria-hidden="true">→</span></strong></a></nav>
</main>
<script type="application/json" id="study-visual-data">${JSON.stringify(c.visual).replaceAll('<','\\u003c')}</script>
<script type="module" src="js/case-study.js?v=cases8"></script>
</body>
</html>
`;
 await fs.writeFile(path.join(root,'portfolio',c.file),html);
}
await fs.writeFile(path.join(root,'portfolio/research-hanoi-phaseout.html'),`<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Motorbike phase-out policy | Dai Chung Hy</title><meta name="robots" content="noindex,follow"/><link rel="canonical" href="https://daichunghy-ben.github.io/portfolio/research-motorbike-ban.html"/><meta http-equiv="refresh" content="0;url=research-motorbike-ban.html"/><link rel="stylesheet" href="styles/home-v2.css?v=cases8"/></head><body><main class="page-width" style="padding-block:80px"><h1>Motorbike phase-out policy</h1><p style="margin-top:25px"><a href="research-motorbike-ban.html">Open the study ↗</a></p></main><script>location.replace('research-motorbike-ban.html'+location.hash)</script></body></html>\n`);
console.log('Rendered '+cases.length+' study pages and the legacy policy route.');
