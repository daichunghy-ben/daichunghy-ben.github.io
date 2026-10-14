const dataNode=document.getElementById('study-visual-data');
const visual=dataNode?JSON.parse(dataNode.textContent):null;
const figure=document.querySelector('[data-figure]');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const number=value=>new Intl.NumberFormat('en-US',{maximumFractionDigits:3}).format(value);
const element=(tag,className,content)=>{const el=document.createElement(tag);if(className)el.className=className;if(content!==undefined)el.textContent=content;return el;};
const setText=(selector,text)=>{const node=figure?.querySelector(selector);if(node)node.textContent=text;};

function buildBars(state){
 const labels=state.labels||visual.labels,unit=state.unit||visual.unit,maximum=state.max||visual.max;
 const chart=figure.querySelector('[data-chart]');
 const prior=[...chart.querySelectorAll('.data-bar')].map(bar=>bar.style.width);
 const rows=state.values.map((value,i)=>{
  const row=element('div','data-row');row.append(element('span','data-label',labels[i]));
  const track=element('span','data-track');track.setAttribute('aria-hidden','true');
  const bar=element('span','data-bar'+(value<0?' is-negative':''));const target=Math.min(100,Math.abs(value)/maximum*100)+'%';
  bar.style.width=prior[i]||target;track.append(bar);row.append(track);
  const valueNode=element('strong','data-value',number(value));valueNode.append(element('small','',unit));row.append(valueNode);
  requestAnimationFrame(()=>{bar.style.width=target});return row;
 });
 chart.replaceChildren(...rows);setText('[data-figure-note]',state.note);
}
let selectionVersion=0;
function select(index){
 selectionVersion++;
 const version=selectionVersion;
 figure.querySelectorAll('[data-choice]').forEach(button=>{
  const selected=Number(button.dataset.choice)===index;button.classList.toggle('is-selected',selected);button.setAttribute('aria-pressed',String(selected));
 });
 if(visual.type==='comparison')buildBars(visual.states[index]);
 if(visual.type==='segments'){
  const [label,share]=visual.items[index];const target=figure.querySelector('[data-share]');
  target.replaceChildren(document.createTextNode(String(share)),element('small','', '%'));setText('[data-segment]',label);
 }
 if(visual.type==='profiles'||visual.type==='stimuli'){
  const item=visual.items[index],target=figure.querySelector('[data-inspector-image]'),preview=new Image();
  preview.src=item.image;
  preview.decode().then(()=>{
   if(version!==selectionVersion)return;
   target.src=item.image;target.alt=item.label;setText('[data-inspector-title]',item.title||item.label);setText('[data-inspector-note]',item.note);
   if(!reduced.matches)target.animate([{opacity:.45,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:380,easing:'ease-out'});
  }).catch(()=>{
   if(version!==selectionVersion)return;
   setText('[data-inspector-title]',item.title||item.label);setText('[data-inspector-note]',item.note+' Image unavailable.');
  });
 }
 if(visual.type==='pathway'){
  const item=visual.items[index];setText('[data-path-input]',item.label);setText('[data-figure-note]',item.note);
  if(visual.inputMetrics)setText('[data-path-metric]',visual.inputMetrics[index]);
  if(!reduced.matches)figure.querySelector('.pathway-node.is-input').animate([{transform:'translateY(7px)'},{transform:'translateY(0)'}],{duration:350,easing:'ease-out'});
 }
}
if(figure&&visual){
 const choices=[...figure.querySelectorAll('[data-choice]')];
 choices.forEach(button=>{button.disabled=false;button.addEventListener('click',()=>select(Number(button.dataset.choice)))});
 document.body.classList.add('case-ready');
 const live=figure.querySelector('[data-figure-note]');if(live){live.setAttribute('aria-live','polite');live.setAttribute('aria-atomic','true')}
}

// Bounded image movement follows scrolling; body copy remains visible without JS.
const cover=document.querySelector('.case-cover'),image=document.querySelector('.case-hero-image');
let scrollFrame=0;
function updateCover(){
 scrollFrame=0;if(!cover||!image)return;
 if(reduced.matches){image.style.removeProperty('--image-offset');return;}
 const box=cover.getBoundingClientRect();
 if(box.bottom<0||box.top>innerHeight)return;
 const progress=Math.max(-1,Math.min(1,(box.top+box.height/2-innerHeight/2)/innerHeight));
 image.style.setProperty('--image-offset',(progress*-14).toFixed(2)+'px');
}
function scheduleCover(){if(!scrollFrame)scrollFrame=requestAnimationFrame(updateCover)}
addEventListener('scroll',scheduleCover,{passive:true});addEventListener('resize',scheduleCover,{passive:true});reduced.addEventListener('change',scheduleCover);scheduleCover();
addEventListener('pagehide',()=>{if(scrollFrame)cancelAnimationFrame(scrollFrame);scrollFrame=0});

if(!reduced.matches&&figure){
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries)if(entry.isIntersecting){
   figure.animate([{opacity:.65,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,easing:'cubic-bezier(.2,.7,.2,1)'});
   figure.querySelectorAll('.data-bar,.segment-track>span').forEach((bar,i)=>bar.animate([{transform:'scaleX(.1)'},{transform:'scaleX(1)'}],{duration:600,delay:i*25,easing:'cubic-bezier(.2,.7,.2,1)'}));
   observer.disconnect();
  }
 },{threshold:.12});observer.observe(figure);
}

addEventListener('pageswap',()=>{
 if(!image)return;const box=image.getBoundingClientRect();
 if(box.bottom<0||box.top>innerHeight)image.style.viewTransitionName='none';
});
addEventListener('pageshow',()=>{image?.style.removeProperty('view-transition-name');scheduleCover()});

// Analysis-image links stay within the study; original files remain available.
const imageLinks=[...document.querySelectorAll('.case-sources a')].filter(a=>/\.(?:svg|png|webp|jpe?g)$/i.test(new URL(a.href).pathname));
if(imageLinks.length){
 const dialog=element('dialog','analysis-dialog');
 if(typeof dialog.showModal==='function'){
  const header=element('div','analysis-dialog-header'),title=element('h2','');title.id='analysis-image-title';
  dialog.setAttribute('aria-labelledby',title.id);
  const close=element('button','analysis-dialog-close','Close');close.type='button';close.addEventListener('click',()=>dialog.close());header.append(title,close);
  const image=element('img','analysis-dialog-image'),original=element('a','analysis-dialog-original','Open original image ↗');original.target='_blank';original.rel='noopener noreferrer';
  dialog.append(header,image,original);document.body.append(dialog);let returnTarget;
  imageLinks.forEach(link=>link.addEventListener('click',event=>{
   if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   event.preventDefault();returnTarget=link;title.textContent=link.textContent.replace('↗','').trim();image.src=link.href;image.alt=title.textContent;original.href=link.href;dialog.showModal();
   if(!reduced.matches)dialog.animate([{opacity:.5,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:280,easing:'ease-out'});
  }));
  dialog.addEventListener('close',()=>returnTarget?.focus());
  dialog.addEventListener('click',event=>{const box=dialog.getBoundingClientRect();if(event.target===dialog&&(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom))dialog.close()});
 }
}
