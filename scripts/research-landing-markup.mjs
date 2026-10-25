// Product-page rhythm from OneShop and Nhà cấp 4, with source-bound research data.
// Paper / navy / teal / yellow, Calibri, open sections, no decorative borders.
// Every number below is read from the existing study or evidence dataset.
import {esc, fmt} from '../portfolio/js/evidence-render.js';

export const researchVersion = 'research-product-20261025';
export const themes = {
 'hotel-segmentation':['#087b75','#eaf6f2','#fffcf3'],
 'ev-choice':['#2463aa','#edf4fc','#f7faff'],
 'virtual-influencers':['#ad4e37','#fff0e8','#fffaf5'],
 'nutrition-diet':['#39714a','#eff6e9','#fbfcf5'],
 'motorbike-phaseout':['#246477','#eaf4f6','#f6fbfc'],
 'hotel-prca':['#087b75','#eaf6f2','#fffcf3'],
 'hotel-value-framework':['#3e715b','#edf5ef','#fffcf4'],
 'influencer-strategy':['#ae543a','#fff0e9','#fffaf6'],
 'buffet-nudging':['#a95627','#fff1df','#fffbf4'],
 'psych-ownership':['#42659a','#eef3fa','#f8faff'],
 'arts-workshop':['#946132','#f7f0e5','#fffdf7']
};
export const themeStyle = id => {
 const [accent,soft,paper]=themes[id];
 return `--case-accent:${accent};--case-soft:${soft};--case-paper:${paper}`;
};
const palette=['#087b75','#23968d','#49aaa0','#73b7a0','#91c3a3','#bad49c','#dce3a3','#f2dd65','#d5d7c5','#aebbbc'];
const figure=(title,body,caption='')=>`<figure class="research-preview"><figcaption>${esc(title)}</figcaption>${body}${caption?`<p class="preview-footnote">${esc(caption)}</p>`:''}</figure>`;
const bars=(rows,max,unit='')=>{
 const diverging=rows.some(r=>r.value<0);
 return `<div class="preview-bars">${rows.map(r=>{const width=Math.abs(r.value)/max*(diverging?50:100);return `<div class="preview-bar-row"><span>${esc(r.label)}</span><strong>${esc(r.display??fmt(r.value,1))}${unit?` <small>${esc(unit)}</small>`:''}</strong><span class="preview-bar-track${diverging?' is-diverging':''}" aria-hidden="true"><i style="width:${width}%;${diverging?'left:'+(r.value<0?50-width:50)+'%;':''}background:${r.color??'var(--case-accent)'}"></i></span></div>`}).join('')}</div>`;
};
function segments(e,interactive){
 let start=0;
 const arcs=e.values.map((value,i)=>{
  const out=`<circle cx="120" cy="120" r="94" fill="none" stroke="${palette[i]}" stroke-width="37" pathLength="100" stroke-dasharray="${value} ${100-value}" stroke-dashoffset="${-start}" transform="rotate(-90 120 120)"/>`;
  start+=value;return out;
 }).join('');
 const tag=interactive?'button':'div';
 return `<div class="preview-segments"><div class="preview-donut"><svg viewBox="0 0 240 240" aria-hidden="true">${arcs}</svg><div class="preview-donut-value"${interactive?' aria-live="polite" aria-atomic="true"':''}><strong data-segment-value>${e.values[0]}%</strong><span data-segment-label>${esc(e.labels[0])}</span></div></div><div class="preview-legend"${interactive?' role="group" aria-label="Inspect a guest group"':''}>${e.labels.map((label,i)=>`<${tag}${interactive?` type="button" data-segment="${i}" data-value="${e.values[i]}%" aria-pressed="${i===0}"`:''} class="preview-legend-row" style="--segment-color:${palette[i]}"><span class="legend-dot" aria-hidden="true"></span><span data-segment-name>${esc(label)}</span><strong>${e.values[i]}%</strong></${tag}>`).join('')}</div></div>`;
}
function forest(e){
 const max=Math.max(...e.groups.flatMap(g=>g.values));
 return `<div class="preview-compare-legend">${e.groups.map((g,i)=>`<span><i style="background:${i?'#e2a84d':'var(--case-accent)'}" aria-hidden="true"></i>${esc(g.label)}</span>`).join('')}</div><div class="preview-comparisons">${e.labels.map((label,i)=>`<div class="preview-compare-row"><span>${esc(label)}</span>${e.groups.map((g,j)=>`<div><span class="preview-bar-track" aria-hidden="true"><i style="width:${g.values[i]/max*100}%;background:${j?'#e2a84d':'var(--case-accent)'}"></i></span><strong>${g.values[i]}</strong></div>`).join('')}</div>`).join('')}</div>`;
}
function flow(e){
 return `<div class="preview-flow"><div class="preview-flow-inputs">${e.inputs.map(n=>`<div>${esc(n.label)}${n.coefficient!==undefined?`<small>Reported path <strong>${n.coefficient}</strong></small>`:''}</div>`).join('')}</div><span class="preview-flow-arrow" aria-hidden="true">↓</span><div class="preview-flow-middle">${esc(e.middle.label)}<small>${esc(e.middle.metric)}</small></div><span class="preview-flow-arrow" aria-hidden="true">↓</span><div class="preview-flow-end">${esc(e.end.label)}<small>${esc(e.end.metric)}</small></div></div>`;
}
export function heroPreview(c,e,{interactive=true}={}){
 if(e.type==='segments')return figure('Share of the review sample',segments(e,interactive),interactive?'Named profiles from the study. Select a group to inspect its share.':'Named profiles from the study.');
 if(e.type==='forest')return figure('Estimated extra amount · VND million',forest(e),'Point estimates. Reported 95% intervals appear with the findings below.');
 if(e.type==='nutrition')return figure('Nutrition knowledge',bars(e.domains.map(d=>({label:d.label,value:d.correct,display:d.correct+'%'})),100),'Correct answers within each knowledge domain.');
 if(e.type==='butterfly')return figure('The cost of a service failure',bars(e.labels.slice(0,4).map((label,i)=>({label,value:e.penalty[i],color:'#b8664c'})),Math.max(...e.penalty.map(Math.abs))),'Negative regression coefficients. Praise and complaints are compared below.');
 if(e.type==='policy'){
  const indices=[0,1,e.values.indexOf(Math.max(...e.values))];
  return figure('Policy trade-offs · VND / month',bars(indices.map(i=>({label:e.labels[i],value:e.values[i],display:fmt(e.values[i]),color:e.values[i]<0?'#b8664c':undefined})),Math.max(...e.values.map(Math.abs))),'Reported valuations of hypothetical policy attributes.');
 }
 if(e.type==='paired')return figure('A different menu order. A different choice.',`<div class="preview-paired">${e.studies.map(s=>`<div><span>${esc(s.label)}</span><p><span>${fmt(s.before)}</span><i aria-hidden="true">→</i><strong>${fmt(s.after)}</strong><small>kcal</small></p></div>`).join('')}</div><p class="preview-paired-key">${esc('Comparison → Healthier first')}</p>`,'Mean intended intake. The studies did not measure food eaten.');
 if(e.type==='constructs')return figure(c.id==='psych-ownership'?'A framework to test':'The relationships examined',flow(e),c.id==='psych-ownership'?'Proposed relationships, without measured effect sizes.':'Relationships from the study; the diagram does not establish causation.');
 if(e.type==='factorial')return figure('Four versions of a post',`<div class="preview-factorial">${e.items.map(item=>`<div><img src="${esc(item.image)}" alt="${esc(item.label)}" width="500" height="550"/><p>${esc(item.label)}</p></div>`).join('')}</div>`,'Experimental stimuli. Purchase intention is not an observed purchase.');
 if(e.type==='profiles')return figure('Three service ideas to examine',`<div class="preview-profile-list">${e.profiles.map((p,i)=>`<div><span aria-hidden="true">0${i+1}</span><div><strong>${esc(p.label)}</strong><p>${esc(p.theme)}</p></div></div>`).join('')}</div>`,'Conceptual profiles, without measured group sizes.');
 throw new Error('Missing research preview '+e.type);
}

export function methodSteps(e,capability){
 const conceptual=['psych-ownership','hotel-value-framework'].includes(e.id);
 return `<section class="research-methods" id="models" aria-labelledby="models-title"><div class="research-section-head"><h2 id="models-title">${conceptual?'Research design':'How the study was conducted'}</h2><p>${capability.methods.map(method=>`<span>${esc(method)}</span>`).join(' · ')}</p></div><ol class="research-method-steps">${e.method.map(([title,body],i)=>`<li><span class="method-number" aria-hidden="true">${i+1}</span><div><h3>${esc(title)}</h3><p>${esc(body)}</p></div></li>`).join('')}</ol></section>`;
}

export function researchArchive(cases,entries){
 const featuredIds=['hotel-segmentation','ev-choice','virtual-influencers','nutrition-diet'];
 const featured=featuredIds.map(id=>cases.find(c=>c.id===id));
 return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="theme-color" content="#ffffff"/>
<title>Dai Chung Hy | Research</title><meta name="description" content="Selected studies in hospitality, mobility, consumer trust and student nutrition by Dai Chung Hy."/>
<link rel="canonical" href="https://daichunghy-ben.github.io/portfolio/projects.html"/><link rel="icon" href="assets/favicon.svg"/>
<link rel="stylesheet" href="styles/home-v2.css?v=cases8"/><link rel="stylesheet" href="styles/research-landing.css?v=${researchVersion}"/></head>
<body class="research-library" data-research-version="${researchVersion}">
<header class="case-header page-width"><a class="back-link" href="index.html#publications">← Portfolio</a><nav aria-label="Portfolio navigation"><a href="about.html#research">Full profile ↗</a></nav></header>
<main class="page-width"><section class="library-intro"><h1>Research</h1><p>Selected studies in hospitality, mobility and consumer behavior.</p></section>
<div class="research-library-list">${featured.map(c=>`<article class="library-study" style="${themeStyle(c.id)}"><div class="library-study-copy"><p class="library-study-status">${esc(c.topic)}</p><h2><a href="${esc(c.file)}">${esc(c.title)}</a></h2><p>${esc(c.lead)}</p><span class="library-study-fact">${esc(c.facts[0][1])}</span><a class="research-button" href="${esc(c.file)}">Explore the study <span aria-hidden="true">↗</span></a></div><div class="library-study-preview">${heroPreview(c,entries.find(e=>e.id===c.id),{interactive:false})}</div></article>`).join('')}</div>
<section class="library-more"><h2>Other studies</h2><div>${cases.filter(c=>!featuredIds.includes(c.id)).map(c=>`<a href="${esc(c.file)}"><span><strong>${esc(c.title)}</strong><span>${esc(c.status)}</span></span><span aria-hidden="true">↗</span></a>`).join('')}</div></section>
</main><script type="module" src="js/study-navigation.js?v=cases8"></script></body></html>`;
}
