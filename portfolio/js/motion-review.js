import { createOpeningScene, OPENING_DURATION } from './opening-motion.js';
import { createClosingScene, CLOSING_DURATION } from './closing-motion.js';
const opening=await createOpeningScene(document.querySelector('[data-film="opening"] canvas'));
const closing=await createClosingScene(document.querySelector('[data-film="closing"] canvas'));
// Shared by the review controls and the deterministic film exporter.
window.portfolioFilms = {
  opening:{scene:opening,duration:OPENING_DURATION,options:{includeProfile:false}},
  closing:{scene:closing,duration:CLOSING_DURATION,options:{background:'#e7ebe7',includeCopy:true}}
};
for(const section of document.querySelectorAll('[data-film]')){
  const {scene,duration,options}=window.portfolioFilms[section.dataset.film];
  const slider=section.querySelector('input'),output=section.querySelector('output'),button=section.querySelector('button');
  let frame=0,elapsed=0,last=0,playing=false;
  const paint=()=>{scene.render(elapsed,options);slider.value=elapsed;output.textContent=(elapsed/1000).toFixed(2)+' s';};
  const tick=now=>{if(!playing)return;elapsed+=last?Math.min(now-last,80):0;last=now;if(elapsed>=duration){elapsed=duration;playing=false;}paint();if(playing)frame=requestAnimationFrame(tick);};
  slider.addEventListener('input',()=>{playing=false;cancelAnimationFrame(frame);elapsed=Number(slider.value);paint();});
  button.addEventListener('click',()=>{cancelAnimationFrame(frame);elapsed=0;last=0;playing=true;frame=requestAnimationFrame(tick);});
  window.addEventListener('resize',paint);paint();
}
