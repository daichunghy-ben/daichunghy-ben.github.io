export const esc=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export const fmt=(value,digits=3)=>new Intl.NumberFormat('en-US',{maximumFractionDigits:digits}).format(value);
const wrap=(value,max=22)=>{const result=[];let line='';for(const word of value.split(' ')){if(line&&line.length+word.length+1>max){result.push(line);line=word}else line+=(line?' ':'')+word}if(line)result.push(line);return result};
const text=(x,y,value,options='')=>`<text x="${x}" y="${y}" ${options}>${esc(value)}</text>`;
const label=(x,y,value,max=23)=>wrap(value,max).map((l,i)=>text(x,y+i*20,l,'class="plot-label"')).join('');
const line=(x1,y1,x2,y2,options='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${options}/>`;
const dot=(x,y,color,options='')=>`<circle cx="${x}" cy="${y}" r="6" fill="${color}" ${options}/>`;
const scale=(value,range,left,right)=>left+(value-range[0])/(range[1]-range[0])*(right-left);
function svg(title,content,height=500){return `<svg class="evidence-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 ${height}" role="group" aria-label="${esc(title)}"><style>text{font-family:Calibri,Arial,sans-serif;fill:#24272c;font-size:17px}.plot-label{font-size:19px;font-weight:700}.plot-unit{font-size:13px;fill:#60646b}.plot-value{font-size:19px;font-weight:700;font-variant-numeric:tabular-nums}.plot-axis{stroke:#747975;stroke-width:1}.plot-grid{stroke:#24272c12;stroke-width:1}.plot-zero{stroke:#747975;stroke-dasharray:3 6}.plot-muted{fill:#60646b}.plot-link{fill:none;stroke:#abb1aa;stroke-width:2}.plot-focus{fill:#355d7b}.plot-node-text{font-size:21px;font-weight:700}</style><rect width="1000" height="${height}" fill="#faf9f6"/>${content}</svg>`}
const table=(headers,rows,caption)=>`<details class="evidence-table"><summary>Data & units <span aria-hidden="true">+</span></summary><div class="evidence-table-scroll"><table><caption>${esc(caption)}</caption><thead><tr>${headers.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((v,i)=>i===0?`<th scope="row">${esc(v)}</th>`:`<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></details>`;
const choices=(labels,selected=0,attr='data-evidence-item')=>`<div class="evidence-choices" role="group" aria-label="Inspect a result">${labels.map((l,i)=>`<button type="button" ${attr}="${i}" aria-pressed="${i===selected}" class="${i===selected?'is-selected':''}" disabled>${esc(l)}</button>`).join('')}</div>`;
const note=(title,body,metric='')=>`<div class="evidence-reading" aria-live="polite" aria-atomic="true">${metric?`<strong class="evidence-metric">${esc(metric)}</strong>`:''}<h4>${esc(title)}</h4><p>${esc(body)}</p></div>`;
function axis(range,ticks,left,right,top,bottom,unit){return ticks.map(t=>line(scale(t,range,left,right),top,scale(t,range,left,right),bottom,`class="${t===0?'plot-zero':'plot-grid'}"`)+text(scale(t,range,left,right),bottom+27,fmt(t),'text-anchor="middle" class="plot-unit"')).join('')+text((left+right)/2,bottom+54,unit,'text-anchor="middle" class="plot-unit"')}
export function plotSvg(e,c,state={view:0,item:0}){
 const color=c.accent||'#355d7b';let content='';
 if(e.type==='forest'){
  const l=290,r=785,scaleX=x=>scale(x,e.range,l,r),groups=state.view===0?e.groups:[e.groups[state.view-1]];
  content=axis(e.range,e.ticks,l,r,58,425,'Estimated extra amount · VND million');
  content+=groups.map((g,i)=>dot(300+i*260,25,g.color)+text(316+i*260,31,g.label+' · '+g.share+'%','class="plot-unit"')).join('');
  e.labels.forEach((name,i)=>{
   const y=97+i*95;content+=label(20,y,name,24);
   groups.forEach((g,j)=>{const cy=y+(groups.length===2?j*31-4:7),[lo,hi]=g.intervals[i],fade=i===state.item?1:.8;
    content+=`<g data-evidence-hit="${i}" role="button" tabindex="0" aria-label="${esc(name+': inspect estimate and interval')}" opacity="${fade}"><title>${esc(name+': '+g.label+', '+g.values[i]+', 95% interval '+lo+' to '+hi)}</title>${line(scaleX(lo),cy,scaleX(hi),cy,`stroke="${g.color}" stroke-width="3"`)}${line(scaleX(lo),cy-5,scaleX(lo),cy+5,`stroke="${g.color}" stroke-width="2"`)}${line(scaleX(hi),cy-5,scaleX(hi),cy+5,`stroke="${g.color}" stroke-width="2"`)}${dot(scaleX(g.values[i]),cy,g.color)}${text(820,cy+6,fmt(g.values[i],1),'class="plot-value"')}${text(900,cy+6,g.label==='Utility-focused'?'Utility':'Design','class="plot-unit"')}</g>`;
   });
  });return svg(e.title,content,505);
 }
 if(e.type==='butterfly'){
  const range=e.range,l=300,r=830,x=v=>scale(v,range,l,r),rows=e.labels.map((_,i)=>i).filter(i=>state.view===0||e.classes[i]===['','Basic','Performance','Excitement'][state.view]),bottom=90+rows.length*68;
  content=axis(range,e.ticks,l,r,65,bottom,'Regression coefficient');
  content+=dot(310,29,'#a65745')+text(326,35,'Penalty','class="plot-unit"')+dot(470,29,color)+text(486,35,'Reward','class="plot-unit"');
  rows.forEach((i,j)=>{const y=100+j*68,active=i===state.item;
   content+=label(18,y,e.labels[i],23)+text(18,y+24,e.classes[i],'class="plot-unit"');
   content+=`<g data-evidence-hit="${i}" role="button" tabindex="0" aria-label="${esc(e.labels[i]+': inspect penalty and reward')}" opacity="${active?1:.8}">${line(x(e.penalty[i]),y-3,x(e.reward[i]),y-3,'stroke="#d6d9d1" stroke-width="8" stroke-linecap="round"')}${dot(x(e.penalty[i]),y-3,'#a65745')}${dot(x(e.reward[i]),y-3,color)}${text(867,y+2,fmt(e.penalty[i]),'class="plot-value"')}${text(867,y+25,fmt(e.reward[i]),'class="plot-unit"')}</g>`;
  });return svg(e.title,content,bottom+70);
 }
 if(e.type==='policy'){
  const rows=e.labels.map((_,i)=>i).filter(i=>state.view===0||e.groups[i]===['','Restriction','Transport','Support','Governance'][state.view]),range=[-150,200],l=360,r=840,x=v=>scale(v/1000,range,l,r),bottom=75+rows.length*49;
  content=axis(range,[-100,0,100,200],l,r,42,bottom,'VND thousand / month');
  rows.forEach((i,j)=>{const y=76+j*49;content+=label(15,y,e.labels[i],34);const v=e.values[i];content+=`<g data-evidence-hit="${i}" role="button" tabindex="0" aria-label="${esc(e.labels[i]+': inspect monthly valuation')}" opacity="${i===state.item?1:.8}">${line(x(0),y-5,x(v),y-5,`stroke="${v<0?'#a65745':color}" stroke-width="8" stroke-linecap="round"`)}${dot(x(v),y-5,v<0?'#a65745':color)}${text(890,y+1,fmt(v/1000,2),'class="plot-value"')}</g>`});
  return svg(e.title,content,bottom+70);
 }
 if(e.type==='paired'){
  if(state.view===1){
   const x=v=>scale(v,[0,60],255,810);content=axis([0,60],[0,20,40,60],255,810,60,300,'Premium choice share · %');
   [{label:'Comparison',v:e.premium.before,color:'#9b9f93'},{label:'Healthier first',v:e.premium.after,color}].forEach((g,i)=>{const y=125+i*110;content+=label(15,y,g.label)+line(x(0),y-5,x(g.v),y-5,`stroke="${g.color}" stroke-width="18" stroke-linecap="round"`)+text(850,y+2,g.v+'%','class="plot-value"')});return svg(e.title,content,390);
  }
  const range=[0,1800],x=v=>scale(v,range,250,835);content=axis(range,[0,500,1000,1500],250,835,80,390,'Mean intended intake · kcal');
  content+=dot(267,30,'#9b9f93')+text(283,36,'Comparison','class="plot-unit"')+dot(490,30,color)+text(506,36,'Healthier first','class="plot-unit"');
  e.studies.forEach((s,i)=>{const y=145+i*160;content+=label(18,y,s.label)+text(18,y+26,'n = '+s.n,'class="plot-unit"')+line(x(s.after),y,x(s.before),y,'stroke="#d4d8cf" stroke-width="12" stroke-linecap="round"')+dot(x(s.before),y,'#9b9f93')+dot(x(s.after),y,color)+text(x(s.before),y-20,fmt(s.before),'text-anchor="middle" class="plot-value"')+text(x(s.after),y+35,fmt(s.after),'text-anchor="middle" class="plot-value"')+text(885,y+3,'−'+(s.before-s.after),'class="plot-value"')+text(885,y+26,'kcal','class="plot-unit"')});return svg(e.title,content,470);
 }
 if(e.type==='constructs'){
  const positions=e.inputs.length===3?[90,255,420]:[155,355],midY=255,endX=825;
  content='<defs><marker id="evidence-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 1 L9 5 L1 9" fill="none" stroke="#a1a69e" stroke-width="1.5"/></marker></defs>';
  e.inputs.forEach((n,i)=>{const y=positions[i],active=state.item===i;
   content+=`<path data-plot-path="${i}" d="M 265 ${y} C 375 ${y}, 360 255, 438 255" class="plot-link${active?' is-active':''}" stroke="${active?color:'#abb1aa'}" marker-end="url(#evidence-arrow)"/>`;
   content+=`<g data-evidence-hit="${i}" role="button" tabindex="0" aria-label="${esc(n.label+': inspect relationship')}"><ellipse cx="157" cy="${y}" rx="108" ry="55" fill="${active?color:'#e9e7df'}"/>`;
   content+=text(157,y-5,n.short,`text-anchor="middle" class="plot-node-text" style="fill:${active?'#fff':'#24272c'}"`)+text(157,y+23,n.coefficient!==undefined?'Reported path: '+n.coefficient:(n.short==='Mine'?'Personal target':n.short==='Ours'?'Shared target':'Model input'),`text-anchor="middle" class="plot-unit" style="fill:${active?'#ffffffc7':'#60646b'}"`)+'</g>';
  });
  content+=`<ellipse cx="550" cy="255" rx="108" ry="68" fill="#e9e7df"/><ellipse cx="825" cy="255" rx="112" ry="68" fill="#e9e7df"/>`;
  content+=text(550,245,e.middle.short,'text-anchor="middle" class="plot-node-text"')+text(550,273,e.middle.metric,'text-anchor="middle" class="plot-unit"');
  content+=text(825,245,e.end.short,'text-anchor="middle" class="plot-node-text"')+text(825,273,e.end.metric,'text-anchor="middle" class="plot-unit"');
  content+=`<path d="M 660 255 L 707 255" class="plot-link is-active" stroke="${color}" marker-end="url(#evidence-arrow)"/>`;
  content+=text(550,365,e.middle.label,'text-anchor="middle" class="plot-label"')+label(730,365,e.end.label,23);
  return svg(e.title,content,500);
 }
 return '';
}
export function evidenceTable(e){
 if(e.type==='forest')return table(['Attribute','Group','Estimate','95% interval'],e.labels.flatMap((l,i)=>e.groups.map(g=>[l,g.label,g.values[i],g.intervals[i].join(' to ')])),'Estimated extra amount for each feature change, in VND million. The 95% interval shows the reported uncertainty.');
 if(e.type==='butterfly')return table(['Attribute','Penalty','Reward','Reported class'],e.labels.map((l,i)=>[l,e.penalty[i],e.reward[i],e.classes[i]]),'Coefficient values from the supplied project figure.');
 if(e.type==='segments')return table(['Named profile','Share'],e.labels.map((l,i)=>[l,e.values[i]+'%']),'Share of the review sample; named profiles are not mapped to numeric cluster IDs here.');
 if(e.type==='policy')return table(['Policy attribute','Monthly WTP'],e.labels.map((l,i)=>[l,fmt(e.values[i])+' VND']),'Reported WTP values from the existing Table 5 reconstruction.');
 if(e.type==='nutrition')return table(['Predictor','Unit','Coefficient','Printed 95% CI','p'],e.regression.map(r=>[r.label,r.unit,r.estimate,r.ci.join(' to '),r.p]),'Paper Table 5. Coefficient is the model estimate; CI is its reported 95% confidence interval; p is a statistical test value. Units differ, so the estimates should not be ranked by size. The activity interval is rounded in the source.');
 if(e.type==='paired')return table(['Outcome','Comparison','Healthier first','Difference'],[...e.studies.map(s=>[s.label+' · kcal',s.before,s.after,s.after-s.before]),['Study 2 premium share',e.premium.before+'%',e.premium.after+'%',fmt(e.premium.after-e.premium.before,1)+' percentage points']],'Differences are arithmetic contrasts of reported values, without newly estimated uncertainty.');
 if(e.type==='constructs')return table(['Relationship','Available numeric output'],[...e.inputs.map(n=>[n.label+' → '+e.middle.label,n.coefficient!==undefined?'Reported path: '+n.coefficient:'No coefficient supplied']),[e.middle.label+' → '+e.end.label,e.end.coefficient!==undefined?'Reported path: '+e.end.coefficient:'No coefficient supplied']],'Diagram paths are structural or conceptual relationships; R² values, where supplied, are explained variance.');
 return '';
}
export function reading(e,state={view:0,item:0}){
 const i=state.item;
 if(e.type==='forest')return note(e.labels[i],e.notes[i],(state.view?fmt(e.groups[state.view-1].values[i],1):e.groups.map(g=>fmt(g.values[i],1)).join(' / '))+' m VND');
 if(e.type==='butterfly')return note(e.labels[i]+' · '+e.classes[i],e.notes[i],fmt(e.penalty[i])+' / '+fmt(e.reward[i]));
 if(e.type==='segments')return note(e.labels[i],e.notes[i],e.values[i]+'%');
 if(e.type==='policy')return note(e.labels[i],e.values[i]<0?'This restriction has a negative reported valuation. Compare it with the positive support attributes, while keeping the underlying package specification intact.':'The model reports a positive valuation for this attribute. It describes a stated trade-off relative to cost; it does not measure uptake.',fmt(e.values[i])+' VND');
 if(e.type==='paired')return state.view===1?note('Premium choice',`Share changes from ${e.premium.before}% to ${e.premium.after}%: a ${fmt(e.premium.before-e.premium.after,1)} percentage-point difference. The separate ordinal model reports OR = ${e.premium.oddsRatio}.`,'−'+fmt(e.premium.before-e.premium.after,1)+' pp'):note('Intended intake',`The reported differences are ${e.studies[0].before-e.studies[0].after} kcal in Study 1 and ${e.studies[1].before-e.studies[1].after} kcal in Study 2. A restaurant trial would need to observe actual consumption or waste.`,'−146 / −223 kcal');
 if(e.type==='constructs')return note(e.inputs[i].label,e.inputs[i].note);
 if(e.type==='factorial')return note(e.items[i].label,e.items[i].note);
 if(e.type==='nutrition'){
  if(state.view===0)return note('Three knowledge domains','Calories has the lowest percentage of correct answers. Each domain retains its own item count, rather than being treated as an equally weighted score.','46.1%');
  if(state.view===1)return note('Different dietary scores','Each mean is shown against its own maximum. The foods-to-limit score counts groups to limit, so a higher value does not indicate a healthier diet.');
  return note('Adjusted association','Age and knowledge have positive printed intervals. Sex crosses zero. Activity uses a much smaller measurement unit, so raw coefficients should not be ranked as relative importance.','R² 0.538');
 }
 if(e.type==='profiles')return note(e.profiles[i].label,e.profiles[i].response);
 return '';
}
export function controls(e,state={view:0,item:0}){
 let views=[];
 if(e.type==='forest')views=['Both groups','Utility-focused','Design-sensitive'];
 if(e.type==='butterfly')views=['All attributes','Basic','Performance','Excitement'];
 if(e.type==='policy')views=['All attributes','Restrictions','Transport','Support','Governance'];
 if(e.type==='paired')views=['Intended intake','Premium choice'];
 if(e.type==='nutrition')views=['Knowledge','Dietary pattern','Regression'];
 return views.length?choices(views,state.view,'data-evidence-view'):'';
}
function mobileValues(e,c,state){
 const point=(value,range,color)=>`<span class="mobile-point" style="left:${scale(value,range,0,100)}%;background:${color}"></span>`;
 const interval=(estimate,bounds,range,color)=>`<div class="mobile-interval" aria-hidden="true"><span class="mobile-zero" style="left:${scale(0,range,0,100)}%"></span><span class="mobile-interval-span" style="left:${scale(bounds[0],range,0,100)}%;width:${(bounds[1]-bounds[0])/(range[1]-range[0])*100}%;background:${color}"></span>${point(estimate,range,color)}</div>`;
 const row=(label,body,active=true)=>`<div class="evidence-mobile-row${active?' is-focused':''}"><h4>${esc(label)}</h4>${body}</div>`;
 let body='';
 if(e.type==='forest'){
  const groups=state.view===0?e.groups:[e.groups[state.view-1]];
  body=e.labels.map((l,i)=>row(l,groups.map(g=>`<div class="mobile-group"><p><span>${esc(g.label)}</span><strong>${g.values[i]}m</strong></p>${interval(g.values[i],g.intervals[i],e.range,g.color)}<small>95% interval ${g.intervals[i].join(' to ')}m VND</small></div>`).join(''),i===state.item)).join('');
 }
 if(e.type==='butterfly')body=e.labels.map((l,i)=>state.view&&e.classes[i]!==['','Basic','Performance','Excitement'][state.view]?'':row(l,`<p class="mobile-class">${e.classes[i]}</p><div class="mobile-pair"><span>Penalty<strong>${e.penalty[i]}</strong></span><span>Reward<strong>${e.reward[i]}</strong></span></div><div class="mobile-interval" aria-hidden="true"><span class="mobile-zero" style="left:${scale(0,e.range,0,100)}%"></span>${point(e.penalty[i],e.range,'#a65745')}${point(e.reward[i],e.range,c.accent)}</div>`,i===state.item)).join('');
 if(e.type==='policy')body=e.labels.map((l,i)=>state.view&&e.groups[i]!==['','Restriction','Transport','Support','Governance'][state.view]?'':row(l,`<p class="mobile-policy-value">${fmt(e.values[i])}<small> VND / month</small></p><div class="mobile-interval" aria-hidden="true"><span class="mobile-zero" style="left:${scale(0,[-150000,200000],0,100)}%"></span>${point(e.values[i],[-150000,200000],e.values[i]<0?'#a65745':c.accent)}</div>`,i===state.item)).join('');
 if(e.type==='paired')body=state.view===1?row('Premium choice share',`<div class="mobile-pair"><span>Comparison<strong>${e.premium.before}%</strong></span><span>Healthier first<strong>${e.premium.after}%</strong></span></div><p class="mobile-class">OR = ${e.premium.oddsRatio} in the separate ordinal model</p>`):e.studies.map(s=>row(s.label+' · n = '+s.n,`<div class="mobile-pair"><span>Comparison<strong>${s.before}</strong></span><span>Healthier first<strong>${s.after}</strong></span></div><p class="mobile-class">${s.after-s.before} kcal · intended intake</p>`)).join('');
 if(e.type==='constructs')body=`<div class="construct-mobile"><div>${e.inputs.map((n,i)=>`<span class="${state.item===i?'is-focused':''}">${esc(n.label)}${n.coefficient!==undefined?`<small>Reported path ${n.coefficient}</small>`:''}</span>`).join('')}</div><span class="construct-arrow" aria-hidden="true">↓</span><strong>${esc(e.middle.label)}<small>${esc(e.middle.metric)}</small></strong><span class="construct-arrow" aria-hidden="true">↓</span><strong>${esc(e.end.label)}<small>${esc(e.end.metric)}</small></strong></div>`;
 return body?`<div class="evidence-mobile evidence-mobile-${e.type}">${body}</div>`:'';
}
export function evidenceView(e,c,state={view:0,item:0}){
 let chart='',selectors='';
 if(['forest','butterfly','policy','paired','constructs'].includes(e.type)){
  chart=`<div class="evidence-plot">${plotSvg(e,c,state)}</div>${mobileValues(e,c,state)}`;
  let indices=e.labels?e.labels.map((_,i)=>i):e.inputs?.map((_,i)=>i);
  if(e.type==='butterfly'&&state.view)indices=indices.filter(i=>e.classes[i]===['','Basic','Performance','Excitement'][state.view]);
  if(e.type==='policy'&&state.view)indices=indices.filter(i=>e.groups[i]===['','Restriction','Transport','Support','Governance'][state.view]);
  if(e.type!=='paired')selectors=`<div class="evidence-choices evidence-items" role="group" aria-label="Inspect a result">${indices.map(i=>`<button type="button" data-evidence-item="${i}" aria-pressed="${i===state.item}" class="${i===state.item?'is-selected':''}" disabled>${esc(e.labels?e.labels[i]:e.inputs[i].label)}</button>`).join('')}</div>`;
 }
 if(e.type==='segments'){
  chart=`<div class="segment-ribbon" aria-label="Proportions of the 10 named profiles">${e.labels.map((l,i)=>`<span style="flex:${e.values[i]};background:color-mix(in srgb, ${c.accent} ${95-i*6}%, #ede9e2)" title="${esc(l+' '+e.values[i]+'%')}"></span>`).join('')}</div><div class="evidence-segment-list">${e.labels.map((l,i)=>`<button type="button" data-evidence-item="${i}" aria-pressed="${i===state.item}" class="${i===state.item?'is-selected':''}" disabled><span>${esc(l)}</span><span class="evidence-segment-track"><span style="width:${e.values[i]/e.values[0]*100}%"></span></span><strong>${e.values[i]}%</strong></button>`).join('')}</div>`;
 }
 if(e.type==='factorial'){
  chart=`<div class="factorial-labels"><span>Peripheral appeal</span><span>Strong argument</span><span>Weak argument</span></div><div class="factorial-grid">${e.items.map((item,i)=>`<button type="button" data-evidence-item="${i}" aria-pressed="${i===state.item}" class="factorial-cell${i===state.item?' is-selected':''}" disabled><span>${item.appeal} appeal · ${item.argument.toLowerCase()} argument</span><img src="${esc(item.image)}" alt="${esc(item.label)}" loading="lazy" width="500" height="550"/></button>`).join('')}</div>`;
 }
 if(e.type==='nutrition'){
  if(state.view===0)chart=`<div class="knowledge-domains">${e.domains.map(d=>`<div><span>${esc(d.label)}</span><strong>${d.correct}<small>% correct</small></strong><div class="knowledge-strip" aria-hidden="true"><span style="width:${d.correct}%"></span></div><p>${d.items} items · mean ${d.mean} / ${d.items}<br/>SD ${d.sd}</p></div>`).join('')}</div>`;
  if(state.view===1)chart=`<div class="knowledge-domains">${e.diet.map(d=>`<div><span>${esc(d.label)}</span><strong>${d.mean}<small> / ${d.max}</small></strong><div class="knowledge-strip${d.label==='Foods to limit'?' is-limit':''}" aria-hidden="true"><span style="width:${d.mean/d.max*100}%"></span></div><p>SD ${d.sd}<br/>${esc(d.direction)}</p></div>`).join('')}</div>`;
  if(state.view===2)chart=`<div class="regression-output"><div class="regression-fit"><strong>0.538</strong><span>Reported R²</span><p>Diet-quality model<br/>280 students</p></div><dl>${e.regression.map(r=>`<div><dt>${esc(r.label)}<small>${esc(r.unit)}</small></dt><dd><strong>${r.estimate}</strong><span>CI ${r.ci.join(' to ')}<br/>p ${r.p}</span></dd></div>`).join('')}</dl></div>`;
 }
 if(e.type==='profiles'){
  const p=e.profiles[state.item];selectors=choices(e.profiles.map(p=>p.label),state.item);
  chart=`<div class="value-profile"><img src="${esc(p.image)}" alt="${esc(p.label+' concept illustration')}" width="1000" height="700" loading="lazy"/><dl><div><dt>Review theme</dt><dd>${esc(p.theme)}</dd></div><div><dt>Service hypothesis</dt><dd>${esc(p.response)}</dd></div><div><dt>Question to validate</dt><dd>${esc(p.question)}</dd></div></dl></div>`;
 }
 return `<div class="evidence-primary">${chart}${selectors}${e.type==='factorial'?`<a class="selected-stimulus" href="${esc(e.items[state.item].image)}" data-analysis-image>Open selected stimulus ↗</a>`:''}</div>${reading(e,state)}`;
}
export function evidenceMarkup(e,c){
 const images=e.images?`<details class="evidence-source-images"><summary>${e.type==='segments'?'Original analysis figures':'Experiment stimuli'} <span aria-hidden="true">+</span></summary><div class="evidence-image-grid">${e.images.map(item=>`<figure><a href="${esc(item.image)}" data-analysis-image><img src="${esc(item.image)}" alt="${esc(item.label)}" loading="lazy" width="1200" height="650"/><span>${esc(item.label)} ↗</span></a>${item.note?`<figcaption>${esc(item.note)}</figcaption>`:''}</figure>`).join('')}</div></details>`:'';
 const sample=e.sample?`<div class="measurement-split"><p>Measurement split</p><div>${e.sample.map(([l,n])=>`<span style="flex:${n}">${esc(l)}<strong>${n}</strong></span>`).join('')}</div><p>Independent EFA and CFA/SEM subsamples; CFA and SEM use the same 365 responses.</p></div>`:'';
 const interactions=e.interactions?`<details class="evidence-interactions"><summary>Respondent interactions <span aria-hidden="true">+</span></summary><div class="interaction-list">${e.interactions.map(r=>`<div><span>${esc(r.label)}</span><strong>${r.estimate}</strong><small>SE ${r.se}</small></div>`).join('')}</div><p>Reported Table 4 values. Scale coding is required for quantitative interpretation; signs alone do not define subgroup policy effects.</p></details>`:'';
 return `<figure class="case-evidence" data-evidence><figcaption><h3>${esc(e.title)}</h3><p>${esc(e.caption)}</p></figcaption><div data-evidence-controls>${controls(e)}</div><div class="evidence-workspace" data-evidence-workspace>${evidenceView(e,c)}</div>${sample}${images}${interactions}${evidenceTable(e)}<div class="evidence-exports"><a href="assets/figures/${e.id}.svg" download="${e.id}.svg">Download figure ↓</a><a href="assets/figures/${e.id}.png" data-analysis-image>View full figure ↗</a></div><p class="evidence-source">${esc(e.source)}</p></figure><section class="case-methods" aria-labelledby="method-title"><h3 id="method-title">How the analysis works</h3><div class="method-strip">${e.method.map(([title,body])=>`<div><h4>${esc(title)}</h4><p>${esc(body)}</p></div>`).join('')}</div><details class="method-equation"><summary>Model specification <span aria-hidden="true">+</span></summary><p class="equation">${esc(e.equation)}</p><p>${esc(e.equationNote)}</p></details></section>`;
}
