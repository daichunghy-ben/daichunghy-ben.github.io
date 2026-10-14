const source=document.getElementById('study-model-data');
const lab=document.querySelector('.case-models');
if(source&&lab){
 const model=JSON.parse(source.textContent),reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let mode='study',frame=0;
 const panels=[...lab.querySelectorAll('[data-model-panel]')];
 panels.forEach(panel=>panel.hidden=panel.dataset.modelPanel!==mode);
 reduce.addEventListener('change',()=>{if(reduce.matches)lab.getAnimations({subtree:true}).forEach(animation=>animation.cancel())});
 function connect(panel){
  const map=panel.querySelector('[data-model-map]'),svg=map.querySelector('svg'),box=map.getBoundingClientRect();
  if(!box.width||!box.height||getComputedStyle(svg).display==='none')return;
  svg.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);
  [...svg.querySelectorAll('.model-edge')].sort((a,b)=>Number(Boolean(a.dataset.refFrom))-Number(Boolean(b.dataset.refFrom))).forEach(path=>{
   const a=map.querySelector(`[data-model-node="${path.dataset.from}"]`).getBoundingClientRect(),b=map.querySelector(`[data-model-node="${path.dataset.to}"]`).getBoundingClientRect();
   const ax=a.x+a.width/2-box.x,ay=a.y+a.height/2-box.y,bx=b.x+b.width/2-box.x,by=b.y+b.height/2-box.y;
   let d;
   if(path.dataset.refFrom){
    const relation=svg.querySelector(`[data-from="${path.dataset.refFrom}"][data-to="${path.dataset.refTo}"]:not(.is-moderation)`),target=relation.getPointAtLength(relation.getTotalLength()/2);
    const sign=Math.sign(target.y-ay)||1,start=ay+sign*a.height/2,mid=(start+target.y)/2;
    d=`M ${ax} ${start} C ${ax} ${mid}, ${target.x} ${mid}, ${target.x} ${target.y}`;
   }else if(Math.abs(bx-ax)<(a.width+b.width)/2+15&&Math.abs(by-ay)>(a.height+b.height)/2+10){
    const sign=Math.sign(by-ay),start=ay+sign*a.height/2,end=by-sign*(b.height/2+6),mid=(start+end)/2;
    d=`M ${ax} ${start} C ${ax} ${mid}, ${bx} ${mid}, ${bx} ${end}`;
   }else{
    const sign=Math.sign(bx-ax)||1,start=ax+sign*a.width/2,end=bx-sign*(b.width/2+6),mid=(start+end)/2;
    d=`M ${start} ${ay} C ${mid} ${ay}, ${mid} ${by}, ${end} ${by}`;
   }
   path.setAttribute('d',d);
  });
 }
 function related(graph,node){
  const incoming=[...new Set(graph.edges.filter(e=>e.to===node.id&&!e.target).map(e=>graph.nodes.find(n=>n.id===e.from).label))];
  const outgoing=graph.edges.filter(e=>e.from===node.id&&!e.target).map(e=>graph.nodes.find(n=>n.id===e.to).label);
  const moderation=graph.edges.filter(e=>e.from===node.id&&e.target).map(e=>e.target.map(id=>graph.nodes.find(n=>n.id===id).label).join(' → '));
  return [incoming.length?'From: '+incoming.join(', '):'',outgoing.length?'To: '+outgoing.join(', '):'',moderation.length?'Moderates: '+moderation.join('; '):''].filter(Boolean).join(' · ');
 }
 function inspect(panel,id,animate=true){
  const graph=model[panel.dataset.modelPanel],node=graph.nodes.find(n=>n.id===id);if(!node)return;
  panel.querySelectorAll('[data-model-node]').forEach(button=>{
   const selected=button.dataset.modelNode===id;button.classList.toggle('is-selected',selected);button.setAttribute('aria-pressed',String(selected));
  });
  const detail=panel.querySelector('.model-detail');
  detail.querySelector('[data-model-kind]').textContent=node.kind;
  detail.querySelector('[data-model-title]').textContent=node.label;
  detail.querySelector('[data-model-description]').textContent=node.detail;
  let links=detail.querySelector('[data-model-links]');
  if(!links){links=document.createElement('p');links.dataset.modelLinks='';links.className='model-relations';detail.querySelector('.model-hint').before(links)}
  links.textContent=related(graph,node);
  panel.querySelectorAll('.model-edge').forEach(path=>{
   const active=path.dataset.from===id||path.dataset.to===id;path.classList.toggle('is-active',active);
   if(active&&animate&&!reduce.matches){const length=path.getTotalLength();path.animate([{strokeDasharray:length,strokeDashoffset:length},{strokeDasharray:length,strokeDashoffset:0}],{duration:600,easing:'cubic-bezier(.2,.7,.2,1)'})}
  });
  if(animate&&!reduce.matches)detail.animate([{opacity:.55,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:300,easing:'ease-out'});
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(()=>{frame=0;panels.filter(p=>!p.hidden).forEach(connect)})}
 panels.forEach(panel=>{
  panel.querySelectorAll('[data-model-node]').forEach(button=>{button.disabled=false;button.addEventListener('click',()=>inspect(panel,button.dataset.modelNode))});
  inspect(panel,model[panel.dataset.modelPanel].selected,false);
 });
 lab.querySelectorAll('[data-model-mode]').forEach(button=>{
  button.disabled=false;
  button.addEventListener('click',()=>{
   if(button.dataset.modelMode===mode)return;mode=button.dataset.modelMode;
   lab.querySelectorAll('[data-model-mode]').forEach(b=>{const active=b===button;b.classList.toggle('is-selected',active);b.setAttribute('aria-pressed',String(active))});
   panels.forEach(panel=>panel.hidden=panel.dataset.modelPanel!==mode);
   const panel=panels.find(p=>!p.hidden);connect(panel);
   if(!reduce.matches)panel.animate([{opacity:.4,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:400,easing:'ease-out'});
  });
 });
 const disclosure=document.getElementById('model-details');
 if(disclosure){disclosure.addEventListener('toggle',schedule);const openMap=()=>{if(location.hash==='#models'){disclosure.open=true;requestAnimationFrame(()=>lab.scrollIntoView({behavior:reduce.matches?'instant':'smooth'}))}};addEventListener('hashchange',openMap);openMap()}
 const observer=new ResizeObserver(schedule);panels.forEach(panel=>observer.observe(panel.querySelector('[data-model-map]')));
 document.fonts.ready.then(schedule);schedule();
 if(!reduce.matches){
  const entrance=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){
   const panel=panels.find(p=>!p.hidden);inspect(panel,panel.querySelector('[aria-pressed="true"]').dataset.modelNode);
   entrance.disconnect();
  }},{threshold:.3});entrance.observe(lab);
  addEventListener('pagehide',()=>entrance.disconnect(),{once:true});
 }
 addEventListener('pagehide',()=>{observer.disconnect();if(frame)cancelAnimationFrame(frame);frame=0},{once:true});
 addEventListener('pageshow',()=>{panels.forEach(panel=>observer.observe(panel.querySelector('[data-model-map]')));schedule()});
}
