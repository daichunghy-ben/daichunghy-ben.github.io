const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const element=(tag,className,content)=>{const el=document.createElement(tag);if(className)el.className=className;if(content!==undefined)el.textContent=content;return el;};

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

addEventListener('pageswap',()=>{
 if(!image)return;const box=image.getBoundingClientRect();
 if(box.bottom<0||box.top>innerHeight)image.style.viewTransitionName='none';
});
addEventListener('pageshow',()=>{image?.style.removeProperty('view-transition-name');scheduleCover()});

// Static figures remain readable; scrolling adds a single, bounded entrance.
if(!reduced.matches){
 const targets=document.querySelectorAll('.evidence-svg,.inline-model img,.factorial-grid,.value-profiles-all');
 const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.animate([{opacity:.75,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:450,easing:'ease-out'});observer.unobserve(entry.target)}},{threshold:.15});
 targets.forEach(node=>observer.observe(node));
 addEventListener('pagehide',()=>observer.disconnect(),{once:true});
 reduced.addEventListener('change',()=>{if(reduced.matches)document.getAnimations().forEach(animation=>animation.cancel())});
}

// Analysis-image links stay within the study; original files remain available.
const imageLinks=[...document.querySelectorAll('.case-sources a,[data-analysis-image]')].filter(a=>/\.(?:svg|png|webp|jpe?g)$/i.test(new URL(a.href).pathname));
if(imageLinks.length){
 const dialog=element('dialog','analysis-dialog');
 if(typeof dialog.showModal==='function'){
  const header=element('div','analysis-dialog-header'),title=element('h2','');title.id='analysis-image-title';
  dialog.setAttribute('aria-labelledby',title.id);
  const close=element('button','analysis-dialog-close','Close');close.type='button';close.addEventListener('click',()=>dialog.close());header.append(title,close);
  const image=element('img','analysis-dialog-image'),original=element('a','analysis-dialog-original','Open original image ↗');original.target='_blank';original.rel='noopener noreferrer';
  dialog.append(header,image,original);document.body.append(dialog);let returnTarget;
  document.addEventListener('click',event=>{
   const link=event.target.closest('.case-sources a,[data-analysis-image]');
   if(!link||!/\.(?:svg|png|webp|jpe?g)$/i.test(new URL(link.href).pathname))return;
   if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   event.preventDefault();returnTarget=link;title.textContent=link.textContent.replace('↗','').trim();image.src=link.href;image.alt=link.querySelector('img')?.alt||title.textContent;original.href=link.href;dialog.showModal();
   if(!reduced.matches)dialog.animate([{opacity:.5,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:280,easing:'ease-out'});
  });
  dialog.addEventListener('close',()=>returnTarget?.focus());
  dialog.addEventListener('click',event=>{const box=dialog.getBoundingClientRect();if(event.target===dialog&&(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom))dialog.close()});
 }
}
