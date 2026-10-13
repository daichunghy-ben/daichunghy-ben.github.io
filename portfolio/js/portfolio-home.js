import { ProfilePuppet } from './profile-film.js?v=mt6';

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const menu = document.getElementById('nav-links');
const menuToggle = document.querySelector('.menu-toggle');
const closeMenu = () => { menu.hidden = true; menuToggle.setAttribute('aria-expanded', 'false'); };
menuToggle.addEventListener('click', () => { menu.hidden = !menu.hidden; menuToggle.setAttribute('aria-expanded', String(!menu.hidden)); });
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') { const wasOpen = !menu.hidden; closeMenu(); if (wasOpen) menuToggle.focus(); } });

const projectLinks = [...document.querySelectorAll('.project-link')];
function showProject(link) {
  projectLinks.forEach(item => item.classList.toggle('is-active', item === link));
  document.querySelectorAll('.project-art').forEach(art => art.classList.toggle('is-active', art.dataset.art === link.dataset.project));
}
projectLinks.forEach(link => {
  link.addEventListener('pointerenter', () => showProject(link));
  link.addEventListener('focus', () => showProject(link));
});

const control = document.getElementById('motion-control');
const stage = document.querySelector('.portrait-stage');
const closingStage = document.querySelector('.closing-portrait');
const canvas = document.getElementById('portrait-canvas');
const closingCanvas = document.getElementById('closing-canvas');
let paused = false, stageVisible = false, closingVisible = false, raf = 0;
let clock = 0, lastFrame = 0, wave, point, closing, ready = false;
let targetPoint = 0, blend = 0, pointerX = 0, pointerY = 0;
const pending = () => document.documentElement.dataset.opening === 'pending';
const canAnimate = () => ready && !pending() && !paused && !reduced.matches && !document.hidden && (stageVisible || closingVisible);

function paint(target, puppet, phase, options = {}) {
  const rect = target.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const dpr = Math.min(devicePixelRatio || 1, 1.5);
  const width = Math.round(rect.width * dpr), height = Math.round(rect.height * dpr);
  if (target.width !== width || target.height !== height) { target.width = width; target.height = height; }
  const ctx = target.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);
  const actorHeight = Math.min(rect.height * 1.03, rect.width * 1.67);
  const actorWidth = actorHeight * 1152 / 1664;
  const x = (rect.width - actorWidth) / 2 + (options.x || 0);
  const y = (rect.height - actorHeight) / 2 + rect.height * .015 + (options.y || 0);
  ctx.save();
  ctx.translate(rect.width / 2, rect.height * .8);
  ctx.rotate(options.lean || 0);
  ctx.translate(-rect.width / 2, -rect.height * .8);
  if (puppet === wave && options.mix >= .99) {
    ctx.drawImage(point.render(phase), x, y, actorWidth, actorHeight);
  } else if (puppet === wave && options.mix > .01) {
    ctx.globalAlpha = 1 - options.mix;ctx.drawImage(wave.render(phase), x, y, actorWidth, actorHeight);
    ctx.globalAlpha = options.mix;ctx.drawImage(point.render(phase), x, y, actorWidth, actorHeight);
  } else ctx.drawImage(puppet.render(phase), x, y, actorWidth, actorHeight);
  ctx.restore();
}
function updatePose() {
  const marker = document.getElementById('work').getBoundingClientRect().top;
  targetPoint = innerWidth > 760 ? Math.max(0, Math.min(1, (innerHeight * .72 - marker) / (innerHeight * .42))) : 0;
  stage.dataset.pose = targetPoint > .5 ? 'pointing' : 'greeting';
}
function staticFrame() {
  if (!ready || reduced.matches) return;
  updatePose();blend = targetPoint;
  paint(canvas, wave, clock / 1500, { mix: blend });
  paint(closingCanvas, closing, clock / 1600);
}
function frame(now) {
  raf = 0;
  if (!canAnimate()) { lastFrame = 0; return; }
  if (lastFrame && now - lastFrame < 32) { raf = requestAnimationFrame(frame); return; }
  clock += lastFrame ? Math.min(now - lastFrame, 70) : 32;
  lastFrame = now;updatePose();blend += (targetPoint - blend) * .16;
  if (stageVisible) paint(canvas, wave, clock / 1500, { mix: blend, x: pointerX * 7, y: pointerY * 3, lean: pointerX * .007 + Math.sin(clock / 2400) * .003 });
  if (closingVisible) paint(closingCanvas, closing, clock / 1600, { lean: Math.sin(clock / 2500) * .007 });
  raf = requestAnimationFrame(frame);
}
function syncMotion() {
  document.body.classList.toggle('motion-paused', paused);
  if (canAnimate() && !raf) raf = requestAnimationFrame(frame);
  if (!canAnimate() && raf) { cancelAnimationFrame(raf); raf = 0; lastFrame = 0; }
  control.hidden = reduced.matches;
  if (ready && !reduced.matches) document.body.classList.add('motion-ready');
  else document.body.classList.remove('motion-ready');
  if (reduced.matches) { stage.classList.remove('is-animated'); closingStage.classList.remove('is-animated'); }
  else if (ready) { stage.classList.add('is-animated'); closingStage.classList.add('is-animated'); staticFrame(); }
}
control.addEventListener('click', () => {
  paused = !paused;
  control.setAttribute('aria-pressed', String(paused));
  control.setAttribute('aria-label', paused ? 'Resume animations' : 'Pause animations');
  control.querySelector('span').textContent = paused ? '▷' : 'Ⅱ';syncMotion();
});
new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.target === stage) stageVisible = entry.isIntersecting; else closingVisible = entry.isIntersecting;
  syncMotion();
}, { threshold: .01 }).observe(stage);
new IntersectionObserver(entries => { closingVisible = entries[0].isIntersecting;syncMotion(); }, { threshold: .01 }).observe(closingStage);
window.addEventListener('pointermove', event => { pointerX = (event.clientX / innerWidth - .5) * 2;pointerY = (event.clientY / innerHeight - .5) * 2; }, { passive: true });
window.addEventListener('scroll', () => { if (paused) staticFrame(); }, { passive: true });
new ResizeObserver(staticFrame).observe(stage);
new ResizeObserver(staticFrame).observe(closingStage);
reduced.addEventListener('change', syncMotion);
document.addEventListener('visibilitychange', syncMotion);
document.addEventListener('portfolio:intro-ready', () => {document.querySelector('.intro-section').classList.add('is-entered');syncMotion();});
if (!pending()) document.querySelector('.intro-section').classList.add('is-entered');

async function loadPuppet(file, pointing = false) {
  const image = new Image();image.src = new URL('../assets/' + file, import.meta.url).href;await image.decode();
  return new ProfilePuppet(image, pointing);
}
Promise.all([loadPuppet('chung-hy-mascot-greeting-v1.webp'),loadPuppet('chung-hy-mascot-profile-point-v3.webp', true),loadPuppet('chung-hy-mascot-closing-v2.webp')])
  .then(puppets => { [wave, point, closing] = puppets;ready = true;staticFrame();syncMotion(); })
  .catch(() => { control.hidden = true; });

// Only section headings move into view; all body copy remains readable throughout.
const headings = document.querySelectorAll('.work-section>h2,.display-heading,.education-copy>h2,.contact-copy>h2');
const titleObserver = new IntersectionObserver(entries => { for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('in-view');titleObserver.unobserve(entry.target); } }, { threshold: .15 });
headings.forEach(heading => {heading.classList.add('reveal-title');titleObserver.observe(heading);});
