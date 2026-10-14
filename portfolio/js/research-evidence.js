import {controls,evidenceView} from './evidence-render.js';
const source=document.getElementById('study-evidence-data'),figure=document.querySelector('[data-evidence]');
if(source&&figure){
 const {entry,accent}=JSON.parse(source.textContent),c={accent},reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const state={view:0,item:0},workspace=figure.querySelector('[data-evidence-workspace]'),control=figure.querySelector('[data-evidence-controls]');
 const announcement=document.createElement('p');announcement.className='evidence-announcement';announcement.setAttribute('role','status');announcement.setAttribute('aria-atomic','true');figure.append(announcement);
 function activate(){figure.querySelectorAll('[data-evidence-item],[data-evidence-view]').forEach(b=>b.disabled=false)}
 function render(focus){
  control.innerHTML=controls(entry,state);workspace.innerHTML=evidenceView(entry,c,state);activate();
  announcement.textContent=workspace.querySelector('.evidence-reading').textContent;
  if(focus){const b=figure.querySelector(`[${focus.attr}="${focus.index}"]`);b?.focus({preventScroll:true})}
  if(!reduce.matches){
   if(focus?.attr==='data-evidence-view')workspace.querySelector('.evidence-primary')?.animate([{opacity:.5},{opacity:1}],{duration:330,easing:'ease-out'});
   workspace.querySelector('.evidence-reading')?.animate([{opacity:.4,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:300,easing:'ease-out'});
   workspace.querySelectorAll('.evidence-svg .is-active').forEach(p=>{if(typeof p.getTotalLength==='function'){const len=p.getTotalLength();p.animate([{strokeDasharray:len,strokeDashoffset:len},{strokeDasharray:len,strokeDashoffset:0}],{duration:600,easing:'ease-out'})}});
  }
 }
 figure.addEventListener('click',event=>{
  const b=event.target.closest('[data-evidence-item],[data-evidence-view],[data-evidence-hit]');if(!b)return;
  if(b.hasAttribute('data-evidence-view')){
   state.view=Number(b.dataset.evidenceView);
   if(entry.type==='butterfly')state.item=entry.classes.findIndex(v=>!state.view||v===['','Basic','Performance','Excitement'][state.view]);
   if(entry.type==='policy')state.item=entry.groups.findIndex(v=>!state.view||v===['','Restriction','Transport','Support','Governance'][state.view]);
   render({attr:'data-evidence-view',index:state.view});
  }else{state.item=Number(b.dataset.evidenceItem??b.dataset.evidenceHit);render({attr:b.hasAttribute('data-evidence-hit')?'data-evidence-hit':'data-evidence-item',index:state.item})}
 });
 figure.addEventListener('keydown',event=>{const target=event.target.closest('[data-evidence-hit]');if(target&&['Enter',' '].includes(event.key)){event.preventDefault();target.dispatchEvent(new MouseEvent('click',{bubbles:true}))}});
 activate();
 reduce.addEventListener('change',()=>{if(reduce.matches)figure.getAnimations({subtree:true}).forEach(a=>a.cancel())});
 if(!reduce.matches){
  const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){
   figure.querySelectorAll('.segment-ribbon>span,.knowledge-strip>span,.evidence-segment-track>span').forEach((n,i)=>n.animate([{transform:'scaleX(.05)'},{transform:'scaleX(1)'}],{duration:650,delay:i*25,easing:'cubic-bezier(.2,.7,.2,1)'}));observer.disconnect();
  }},{threshold:.15});observer.observe(figure);addEventListener('pagehide',()=>observer.disconnect(),{once:true});
 }
}
