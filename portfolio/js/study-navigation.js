const reduced=matchMedia('(prefers-reduced-motion: reduce)');
// A native cross-document transition connects a selected thumbnail to its study.
document.addEventListener('click',event=>{
 if(reduced.matches||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button>0)return;
 const link=event.target.closest('a[href]');if(!link)return;
 const url=new URL(link.href,location.href);
 if(url.origin!==location.origin||!url.pathname.split('/').pop()?.startsWith('research-')||link.target==='_blank')return;
 const image=link.querySelector('img');if(!image)return;
 document.querySelectorAll('img').forEach(img=>{if(img.style.viewTransitionName==='study-image')img.style.removeProperty('view-transition-name')});
 image.style.viewTransitionName='study-image';
});
addEventListener('pageshow',()=>document.querySelectorAll('img').forEach(img=>img.style.removeProperty('view-transition-name')));
