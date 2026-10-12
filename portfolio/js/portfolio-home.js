import { createClosingScene } from './closing-motion.js';

const copyNodes = [...document.querySelectorAll('[data-en]')];
for (const node of copyNodes) node.dataset.vi = node.dataset.rich ? node.innerHTML : node.textContent;
let locale = 'vi';
function setLocale(next) {
  locale = next === 'en' ? 'en' : 'vi';
  document.documentElement.lang = locale;
  document.documentElement.dataset.homeLocale = locale;
  document.title = locale === 'vi' ? 'Chung Hy Dai | Tư vấn & Nghiên cứu' : 'Chung Hy Dai | Consulting & Research';
  for (const node of copyNodes) {
    if (node.dataset.rich) node.innerHTML = node.dataset[locale];
    else node.textContent = node.dataset[locale];
  }
  document.querySelectorAll('[data-home-language]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.homeLanguage === locale)));
  try { localStorage.setItem('portfolio.homeLocale.v2', locale); } catch {}
  document.dispatchEvent(new CustomEvent('portfolio:locale', {detail:locale}));
}
try { locale = localStorage.getItem('portfolio.homeLocale.v2') || 'vi'; } catch {}
setLocale(locale);
document.querySelectorAll('[data-home-language]').forEach(b => b.addEventListener('click', () => setLocale(b.dataset.homeLanguage)));
const menu = document.getElementById('nav-links'), toggle = document.querySelector('.menu-toggle');
function closeMenu() { menu.hidden = true; toggle.setAttribute('aria-expanded','false'); }
toggle.addEventListener('click', () => { menu.hidden = !menu.hidden; toggle.setAttribute('aria-expanded', String(!menu.hidden)); });
menu.querySelectorAll('a').forEach(a => a.addEventListener('click',closeMenu));
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeMenu(); });
document.getElementById('current-year').textContent = new Date().getFullYear();

async function mountClosing() {
  const canvas=document.getElementById('closing-canvas');if(!canvas)return;
  const wrapper=canvas.closest('.closing-art'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const replay=document.getElementById('replay-closing'),pause=document.getElementById('closing-motion-toggle');
  if(reduced.matches){replay.hidden=true;pause.hidden=true;return;}
  try {
    const scene=await createClosingScene(canvas);let visible=false,elapsed=0,last=0,frame=0,paused=false;
    wrapper.classList.add('has-motion');
    const paint=()=>scene.render(elapsed);
    const tick=now=>{if(!visible||paused||document.hidden)return;elapsed+=last?Math.min(80,now-last):0;last=now;paint();frame=requestAnimationFrame(tick);};
    const resume=()=>{cancelAnimationFrame(frame);last=0;if(visible&&!paused&&!document.hidden)frame=requestAnimationFrame(tick);};
    const syncPause=()=>{pause.setAttribute('aria-pressed',String(paused));pause.textContent=paused?(locale==='vi'?'Tiếp tục chuyển động ▷':'Resume motion ▷'):(locale==='vi'?'Tạm dừng chuyển động Ⅱ':'Pause motion Ⅱ');};
    document.addEventListener('portfolio:locale',syncPause);
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;resume();},{threshold:.15}).observe(canvas);
    replay.addEventListener('click',()=>{elapsed=0;paused=false;syncPause();paint();resume();});
    pause.addEventListener('click',()=>{paused=!paused;syncPause();resume();});
    document.addEventListener('visibilitychange',resume);
    window.addEventListener('resize',paint);
    reduced.addEventListener('change',()=>{if(reduced.matches){paused=true;cancelAnimationFrame(frame);wrapper.classList.remove('has-motion');replay.hidden=true;pause.hidden=true;}else{paused=false;wrapper.classList.add('has-motion');replay.hidden=false;pause.hidden=false;resume();}});
    paint();
  } catch { replay.hidden=true;pause.hidden=true; }
}
mountClosing();
