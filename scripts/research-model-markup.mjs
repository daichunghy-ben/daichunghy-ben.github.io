const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const lines=(value,max=19)=>{
 const output=[];let line='';
 for(const word of value.split(' ')){if(line&&line.length+word.length+1>max){output.push(line);line=word}else line+=(line?' ':'')+word}
 if(line)output.push(line);return output;
};
const geometry=(a,b)=>{
 const ax=a.x*10,ay=a.y*5,bx=b.x*10,by=b.y*5;
 if(Math.abs(bx-ax)<184&&Math.abs(by-ay)>110){
  const sign=Math.sign(by-ay),start=ay+sign*49,end=by-sign*56;
  return `M ${ax} ${start} C ${ax} ${(start+end)/2}, ${bx} ${(start+end)/2}, ${bx} ${end}`;
 }
 const sign=Math.sign(bx-ax)||1,start=ax+sign*92,end=bx-sign*99;
 return `M ${start} ${ay} C ${(start+end)/2} ${ay}, ${(start+end)/2} ${by}, ${end} ${by}`;
};
const edgeGeometry=(g,e)=>{
 const a=g.nodes.find(n=>n.id===e.from),b=g.nodes.find(n=>n.id===e.to);
 if(!e.target)return geometry(a,b);
 const start=g.nodes.find(n=>n.id===e.target[0]),end=g.nodes.find(n=>n.id===e.target[1]);
 const x=(start.x+end.x)*5-3.5,y=(start.y+end.y)*2.5,sign=Math.sign(y-a.y*5)||1,ay=a.y*5+sign*49;
 return `M ${a.x*10} ${ay} C ${a.x*10} ${(ay+y)/2}, ${x} ${(ay+y)/2}, ${x} ${y}`;
};
export function validateModels(cases,models){
 if(models.length!==cases.length)throw new Error('Every case requires a model map');
 const ids=new Set();
 for(const model of models){
  if(ids.has(model.id)||!cases.some(c=>c.id===model.id))throw new Error('Unexpected or duplicate model ID');ids.add(model.id);
  for(const mode of ['study','next']){
   const graph=model[mode],nodes=new Set(graph.nodes.map(n=>n.id));
   if(nodes.size!==graph.nodes.length||!nodes.has(graph.selected))throw new Error('Invalid model selection');
   if(!graph.title||!graph.summary||!graph.legend)throw new Error('Missing graph context');
   for(const n of graph.nodes)if(!n.label||!n.detail||!n.kind||n.x<10||n.x>90||n.y<15||n.y>85)throw new Error('Invalid model node');
   for(const e of graph.edges){
    if(!nodes.has(e.from)||!nodes.has(e.to)||!['flow','relation','moderation'].includes(e.type))throw new Error('Invalid model edge');
    if(e.target&&!graph.edges.some(other=>other.from===e.target[0]&&other.to===e.target[1]&&!other.target))throw new Error('Invalid moderation target');
   }
   if(mode==='next'&&graph.plan.length<5)throw new Error('Missing proposal protocol');
  }
 }
}
const edges=(g,marker)=>g.edges.map(e=>{
 const a=g.nodes.find(n=>n.id===e.from),b=g.nodes.find(n=>n.id===e.to);
 return `<path d="${edgeGeometry(g,e)}" class="model-edge${e.type==='moderation'?' is-moderation':''}" data-from="${escape(e.from)}" data-to="${escape(e.to)}"${e.target?` data-ref-from="${escape(e.target[0])}" data-ref-to="${escape(e.target[1])}"`:''} fill="none" stroke="#b8b9b2" stroke-width="1.7"${e.type==='moderation'?' stroke-dasharray="7 6"':''} marker-end="url(#${marker})"><title>${escape(a.label+' → '+b.label+(e.label?': '+e.label:''))}</title></path>`;
}).join('');
const marker=id=>`<defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="#858981" stroke-width="1.5"/></marker></defs>`;
export function modelSvg(caseStudy,model,mode){
 const g=model[mode],id=model.id+'-'+mode,caption=mode==='next'?'Proposed extension · not performed':(['hotel-value-framework','psych-ownership'].includes(model.id)?'Conceptual framework · not estimated':'Reported study architecture');
 const selected=g.nodes.find(n=>n.id===g.selected);
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" role="img" aria-labelledby="title desc"><title id="title">${escape(caseStudy.title+' · '+g.title)}</title><desc id="desc">${escape(caption+'. '+g.summary+' '+g.legend)}</desc><rect width="1000" height="700" rx="18" fill="#faf9f6"/><g font-family="Calibri,Arial,sans-serif" fill="#24272c"><text x="35" y="41" font-size="15" fill="${caseStudy.accent}">${escape(caption)}</text><text x="35" y="82" font-size="29" font-weight="700">${escape(g.title)}</text><g transform="translate(0 105)">${marker('arrow')}${edges(g,'arrow')}${g.nodes.map(n=>{
 const label=lines(n.label),active=n.id===g.selected,x=n.x*10,y=n.y*5;
 return `<g><title>${escape(n.detail)}</title><rect x="${x-92}" y="${y-49}" width="184" height="98" rx="12" fill="${active?caseStudy.accent:'#eeece5'}"/><text x="${x}" y="${y-26}" text-anchor="middle" font-size="12" fill="${active?'#ffffffcc':'#666b66'}">${escape(n.kind)}</text>${label.map((l,i)=>`<text x="${x}" y="${y+1+i*24}" text-anchor="middle" font-size="20" font-weight="700" fill="${active?'#fff':'#24272c'}">${escape(l)}</text>`).join('')}</g>`;
 }).join('')}</g><text x="35" y="622" font-size="15" fill="#666b66">${escape(g.legend)}</text>${lines(selected.detail,120).slice(0,3).map((l,i)=>`<text x="35" y="${651+i*18}" font-size="13" fill="#666b66">${escape(l)}</text>`).join('')}</g></svg>`;
}
const nodeMarkup=(n,selected,mode)=>`<button class="model-node${selected?' is-selected':''}" style="--node-x:${n.x}%;--node-y:${n.y}%" type="button" data-model-node="${escape(n.id)}" aria-pressed="${selected}" aria-controls="model-detail-${mode}" disabled><span>${escape(n.kind)}</span><strong>${escape(n.label)}</strong></button>`;
export function modelMarkup(c,model){
 const conceptual=['hotel-value-framework','psych-ownership'].includes(c.id);
 return `<section class="case-models" id="models" aria-labelledby="models-title"><div class="models-heading"><div><p class="model-kicker">${conceptual?'Framework & development':'Methods & development'}</p><h2 id="models-title">Inside the research</h2></div><div class="model-modes" role="group" aria-label="Research map"><button type="button" class="is-selected" data-model-mode="study" aria-pressed="true" aria-controls="model-study" disabled>${conceptual?'Current framework':'Study model'}</button><button type="button" data-model-mode="next" aria-pressed="false" aria-controls="model-next" disabled>Next study <span aria-hidden="true">↗</span></button></div></div>${['study','next'].map(mode=>{
 const g=model[mode],selected=g.nodes.find(n=>n.id===g.selected),id=model.id+'-'+mode;
 return `<div class="model-panel" data-model-panel="${mode}" id="model-${mode}"><div class="model-context"><h3>${escape(g.title)}</h3><p>${escape(g.summary)}</p><span class="model-evidence">${mode==='next'?'Proposed extension · not performed':conceptual?'Conceptual framework · not estimated':'Reported methods · project sources'}</span></div><div class="model-workspace"><div class="model-map" data-model-map="${mode}" aria-label="${escape(g.title)}"><svg class="model-connections" viewBox="0 0 1000 500" preserveAspectRatio="none" aria-hidden="true">${marker('arrow-'+mode)}${edges(g,'arrow-'+mode)}</svg>${g.nodes.map(n=>nodeMarkup(n,n.id===g.selected,mode)).join('')}</div><div class="model-detail" id="model-detail-${mode}" aria-live="polite" aria-atomic="true"><p data-model-kind>${escape(selected.kind)}</p><h4 data-model-title>${escape(selected.label)}</h4><p data-model-description>${escape(selected.detail)}</p><span class="model-hint">Select a node to inspect its role.</span></div></div><div class="model-caption"><p>${escape(g.legend)}</p><a href="assets/models/${id}.svg" download="${id}.svg">Download diagram <span aria-hidden="true">↓</span></a></div>${mode==='next'?`<details class="model-protocol"><summary>Study plan <span aria-hidden="true">+</span></summary><dl>${g.plan.map(([k,v])=>`<div><dt>${escape(k)}</dt><dd>${escape(v)}</dd></div>`).join('')}</dl>${g.references.length?`<div class="model-references">${g.references.map(([label,url])=>`<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)} ↗</a>`).join('')}</div>`:''}</details>`:''}</div>`;
 }).join('')}<noscript><p class="model-fallback">Both maps are shown. Download the diagrams for the selected model explanation.</p></noscript></section>`;
}
