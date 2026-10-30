// Static links work without JavaScript. This preserves the current section.
const links=[...document.querySelectorAll('[data-locale-link]')];
function readingAnchor(){
 const existing=document.getElementById(location.hash.slice(1));
 if(existing){const box=existing.getBoundingClientRect();if(box.top<=innerHeight*.5&&box.bottom>=0)return existing.id;}
 const candidates=[...document.querySelectorAll('main section[id],main h2[id],main h3[id]')];
 return candidates.filter(node=>node.getBoundingClientRect().top<=innerHeight*.3).at(-1)?.id||location.hash.slice(1);
}
for(const link of links)link.addEventListener('click',()=>{
 const target=new URL(link.href,location.href),anchor=readingAnchor();
 if(anchor)target.hash=anchor;link.href=target.href;
});

// A short, unobtrusive response to pointer activation on interactive controls.
const interactionMotion = matchMedia('(prefers-reduced-motion: reduce)');
document.addEventListener('pointerdown', event => {
 if (event.button !== 0 || interactionMotion.matches || document.body.classList.contains('motion-paused')) return;
 const control = event.target instanceof Element && event.target.closest('a[href],button:not(:disabled),[role="button"]');
 if (!control || control.closest('[inert]')) return;
 const pulse = document.createElement('span');
 pulse.className = 'interaction-pulse';
 pulse.setAttribute('aria-hidden', 'true');
 pulse.style.left = `${event.clientX}px`;
 pulse.style.top = `${event.clientY}px`;
 document.body.append(pulse);
 pulse.addEventListener('animationend', () => pulse.remove(), {once: true});
 setTimeout(() => pulse.remove(), 700);
}, {passive: true});
