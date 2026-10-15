// Optional interactions. Profiles, source image, explanation and study results
// are server-rendered; no selection changes or hides the reported findings.
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const animateChange=node=>{if(!reducedMotion.matches)node.animate([{opacity:.65,transform:'translateY(4px)'},{opacity:1,transform:'none'}],{duration:220,easing:'ease-out'});};

const choice=document.querySelector('[data-choice-experience]');
if(choice){
 const tasks=JSON.parse(choice.querySelector('[data-choice-tasks]').textContent);
 let taskIndex=0;const answers=new Map();
 const chooseButtons=[...choice.querySelectorAll('[data-choose]')];
 const stepButtons=[...choice.querySelectorAll('[data-choice-step]')];
 const result=choice.querySelector('[data-choice-result]');
 const renderSelection=()=>{
  const selected=answers.get(taskIndex);
  for(const id of ['a','b']){
   const active=selected===id;
   choice.querySelector(`[data-choice-option="${id}"]`).classList.toggle('is-chosen',active);
   choice.querySelector(`[data-choice-selected="${id}"]`).textContent=active?'Your choice':'';
   const button=chooseButtons.find(button=>button.dataset.choose===id);
   button.setAttribute('aria-pressed',String(active));
  }
  result.textContent=selected?`You chose ${selected.toUpperCase()}.`:'Compare price, range and charging.';
 };
 const renderTask=()=>{
  const task=tasks[taskIndex];
  for(const id of ['a','b'])for(const key of ['price','range','charging'])choice.querySelector(`[data-spec="${id}-${key}"]`).textContent=task[id][key];
  const price=task.b.price-task.a.price,range=task.b.range-task.a.range,charging=task.b.charging-task.a.charging;
  choice.querySelector('[data-choice-comparison]').textContent=`B costs VND ${price} million more${range?`, adds ${range} km of range`:`, offers the same range`}${charging<0?` and charges ${-charging} minutes faster.`:` and takes ${charging} minutes longer to charge.`}`;
  choice.querySelector('[data-task-count]').textContent=`Comparison ${taskIndex+1} / ${tasks.length}`;
  stepButtons[0].disabled=taskIndex===0;stepButtons[1].disabled=taskIndex===tasks.length-1;
  renderSelection();animateChange(choice.querySelector('.choice-options'));
 };
 for(const button of chooseButtons){button.hidden=false;button.addEventListener('click',()=>{answers.set(taskIndex,button.dataset.choose);renderSelection();});}
 choice.querySelector('.choice-step-controls').hidden=false;
 for(const button of stepButtons)button.addEventListener('click',()=>{taskIndex=Math.max(0,Math.min(tasks.length-1,taskIndex+Number(button.dataset.choiceStep)));renderTask();});
}

const map=document.querySelector('[data-attribute-map]');
if(map){
 const controls=map.querySelector('.attribute-controls');
 const stage=map.querySelector('.attribute-stage');
 const buttons=[...controls.querySelectorAll('button')];
 const before=map.querySelector('.attribute-shade-before'),after=map.querySelector('.attribute-shade-after');
 const styles=getComputedStyle(map),left=parseFloat(styles.getPropertyValue('--plot-left')),right=parseFloat(styles.getPropertyValue('--plot-right'));
 const columnWidth=(right-left)/(buttons.length-1);
 controls.hidden=false;
 for(const button of buttons)button.addEventListener('click',()=>{
  const all=button.dataset.attribute==='all';
  for(const peer of buttons)peer.setAttribute('aria-pressed',String(peer===button));
  stage.classList.toggle('has-highlight',!all);
  if(!all){
   const column=Number(button.dataset.attribute),start=left+columnWidth*column;
   before.style.width=`${start-left}%`;after.style.left=`${start+columnWidth}%`;after.style.width=`${right-start-columnWidth}%`;
   const scroller=map.querySelector('.attribute-scroll');
   scroller.scrollTo({left:stage.clientWidth*(start+columnWidth/2)/100-scroller.clientWidth/2,behavior:reducedMotion.matches?'instant':'smooth'});
  }
  map.querySelector('[data-attribute-reading]').textContent=all?'All eight topics are visible. Color shows whether comments were negative or positive (−1 to +1).':`${button.textContent} highlighted across review groups 0–9. Compare the colors down this column; the other topics remain visible.`;
 });
}
