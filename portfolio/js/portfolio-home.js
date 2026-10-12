const menu=document.getElementById('nav-links');
const toggle=document.querySelector('.menu-toggle');
const closeMenu=()=>{menu.hidden=true;toggle.setAttribute('aria-expanded','false');};
toggle.addEventListener('click',()=>{menu.hidden=!menu.hidden;toggle.setAttribute('aria-expanded',String(!menu.hidden));});
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();});

const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const video=document.getElementById('profile-film');
const card=video.closest('.profile-film-card');
const control=document.getElementById('profile-video-toggle');
let paused=false,visible=false;
function syncVideo(){
  const pending=document.documentElement.dataset.opening==='pending';
  if(reduced.matches){video.pause();card.classList.add('is-static');control.hidden=true;return;}
  card.classList.remove('is-static');control.hidden=false;
  if(visible&&!paused&&!document.hidden&&!pending){video.play().catch(()=>card.classList.add('is-static'));}
  else video.pause();
}
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;syncVideo();},{threshold:.08}).observe(video);
video.addEventListener('error',()=>card.classList.add('is-static'));
control.addEventListener('click',()=>{paused=!paused;control.setAttribute('aria-pressed',String(paused));control.textContent=paused?'▷':'Ⅱ';control.setAttribute('aria-label',paused?'Resume animation':'Pause animation');syncVideo();});
reduced.addEventListener('change',syncVideo);
document.addEventListener('visibilitychange',syncVideo);
document.addEventListener('portfolio:intro-ready',syncVideo);
syncVideo();

// A single entrance establishes hierarchy; content does not rotate or shuffle.
let revealStarted=false;
function mountReveal(){
  if(revealStarted||reduced.matches)return;
  revealStarted=true;document.body.classList.add('home-reveal');
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target);}},{threshold:.08});
  document.querySelectorAll('.section-heading,.experience-row,.research-card,.background-grid>article').forEach(node=>observer.observe(node));
}
if(document.documentElement.dataset.opening==='pending')document.addEventListener('portfolio:intro-ready',mountReveal,{once:true});
else mountReveal();
