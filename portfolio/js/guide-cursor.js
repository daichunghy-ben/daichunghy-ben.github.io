/**
 * Guided Tour Cursor for Chung Hy Portfolio
 * Features:
 * - Organic mouse physics (Minimum-jerk trajectory + spring-damper inertia)
 * - Natural human resting tremor (quiets down while typing)
 * - Dynamic typewriter speech bubble with grapheme segmentation & punctuation pacing
 * - Smart viewport collision detection (flips up/left to stay on screen)
 * - Direct mascot gaze synchronization via native PointerEvents
 * - One-time auto-run per session (sessionStorage) with '?tour' replay & floating replay pill
 */

(() => {
  const desktop = matchMedia(
    '(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'
  );
  if (!desktop.matches) return;

  const store = {
    get(key) {
      try {
        return sessionStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, val) {
      try {
        sessionStorage.setItem(key, val);
      } catch {}
    }
  };

  const isVi = document.documentElement.lang === 'vi';

  const stepsData = {
    en: [
      {
        guide: 'intro',
        at: 'above',
        free: true,
        text: "Hi, I'm Chung Hy! Welcome to my corner of the web 👋"
      },
      {
        guide: 'skills',
        at: 'below',
        text: "AI & B2B Digital Transformation consultant — turning chaotic spreadsheets into sleek workflows (yes, Excel is my superpower) ⚡"
      },
      {
        guide: 'nav-work',
        at: 'below',
        text: "My battle-tested work at 1Office & FPT Education — ask me how we cut a 3-day reporting nightmare down to 30 mins! 🚀"
      },
      {
        guide: 'nav-research',
        at: 'below',
        text: "Peer-reviewed research and a Springer chapter — proof that I don't just guess, I bring the data 📊"
      },
      {
        guide: 'nav-contact',
        at: 'below',
        text: "Got a fun project or want to chat digital transformation? Don't be shy, say hi! ☕"
      }
    ],
    vi: [
      {
        guide: 'intro',
        at: 'above',
        free: true,
        text: "Chào bạn, mình là Chung Hy! Chào mừng bạn ghé thăm góc nhỏ của mình 👋"
      },
      {
        guide: 'skills',
        at: 'below',
        text: "Chuyên viên tư vấn AI & Chuyển đổi số B2B — chuyên 'trị' bảng tính lộn xộn thành quy trình mượt mà (Excel là siêu năng lực của mình đấy) ⚡"
      },
      {
        guide: 'nav-work',
        at: 'below',
        text: "Kinh nghiệm thực chiến tại 1Office & FPT Education — giảm một bản báo cáo từ 3 ngày xuống còn 30 phút là có thật nhé! 🚀"
      },
      {
        guide: 'nav-research',
        at: 'below',
        text: "Nghiên cứu khoa học và chương sách Springer — bằng chứng là mình không đoán mò mà nói chuyện bằng dữ liệu 📊"
      },
      {
        guide: 'nav-contact',
        at: 'below',
        text: "Có dự án thú vị hoặc muốn trò chuyện về chuyển đổi số? Đừng ngần ngại nhắn mình nhé! ☕"
      }
    ]
  };

  const steps = isVi ? stepsData.vi : stepsData.en;

  function ensureElements() {
    let root = document.getElementById('guideCursor');
    if (!root) {
      root = document.createElement('div');
      root.id = 'guideCursor';
      root.setAttribute('aria-hidden', 'true');
      root.innerHTML = `
        <svg class="gc-arrow" viewBox="0 0 24 24" fill="none">
          <path class="gc-rim" d="M5.5 5.5l3.9 11.7 2.2-5.6 5.6-2.2-11.7-3.9z"/>
          <path class="gc-body" d="M5.5 5.5l3.9 11.7 2.2-5.6 5.6-2.2-11.7-3.9z"/>
        </svg>
        <div class="gc-tag">
          <span class="gc-name">Chung Hy</span>
          <div class="gc-clip"><div class="gc-text" data-gc-text></div></div>
          <div class="gc-text gc-measure" data-gc-measure></div>
          <span class="gc-caret"></span>
        </div>
      `;
      document.body.appendChild(root);
    }

    let prompt = document.getElementById('guidePrompt');
    if (!prompt) {
      prompt = document.createElement('div');
      prompt.id = 'guidePrompt';
      prompt.setAttribute('aria-hidden', 'true');
      prompt.innerHTML = `
        <button type="button" class="gp-replay" data-guide-replay>
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13 8a5 5 0 11-1.6-3.7M13 2.5v2.6h-2.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <span data-guide-prompt-text>${isVi ? 'Xem lại tour' : 'Take the tour again'}</span>
        </button>
        <button type="button" class="gp-dismiss" data-guide-dismiss aria-label="${isVi ? 'Đóng' : 'Dismiss'}">
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
      `;
      document.body.appendChild(prompt);
    }

    return { root, prompt };
  }

  const { root, prompt } = ensureElements();
  const tag = root.querySelector('.gc-tag');
  const name = root.querySelector('.gc-name');
  const clip = root.querySelector('.gc-clip');
  const inner = root.querySelector('[data-gc-text]');
  const measure = root.querySelector('[data-gc-measure]');
  const caret = root.querySelector('.gc-caret');
  const graphemes = 'Segmenter' in Intl ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null;

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const rand = (min, max) => min + Math.random() * (max - min);

  const goal = { x: 0, y: 0 };
  const shown = { x: 0, y: 0, vx: 0, vy: 0 };
  const SPRING = 190;
  const DAMPING = 2 * Math.sqrt(SPRING) * 0.82;
  const waiters = [];

  let clock = 0;
  let last = 0;
  let running = false;
  let away = false;
  let move = null;
  let hovered = null;
  let typing = false;
  let tremor = 1;

  function isAway() {
    return (
      !desktop.matches ||
      document.hidden ||
      document.body.classList.contains('intro-gate-pending')
    );
  }

  function frame(now) {
    if (!running) return;
    const dt = Math.min(now - last, 50);
    last = now;

    const nowAway = isAway();
    if (nowAway !== away) {
      away = nowAway;
      root.classList.toggle('is-away', away);
    }

    if (!away) {
      clock += dt;
      if (move) {
        const p = Math.min((clock - move.t0) / move.dur, 1);
        const u = Math.pow(p, move.skew);
        const e = u * u * u * (u * (u * 6 - 15) + 10); // Minimum-jerk curve
        const arc = Math.sin(p * Math.PI);
        const curTarget = move.to();
        const curFrom = move.from;
        const curDx = curTarget.x - curFrom.x;
        const curDy = curTarget.y - curFrom.y;
        const curDist = Math.hypot(curDx, curDy) || 1;
        const nx = -curDy / curDist;
        const ny = curDx / curDist;
        const lateral = (move.b1 * (1 - p) + move.b2 * p) * arc;

        goal.x = curFrom.x + curDx * e + nx * lateral;
        goal.y = curFrom.y + curDy * e + ny * lateral;

        if (p >= 1) {
          const done = move.done;
          move = null;
          done();
        }
      }

      // Spring physics toward goal
      const stepsCount = Math.max(1, Math.round(dt / 16));
      const h = (dt / 1000) / stepsCount;
      for (let i = 0; i < stepsCount; i++) {
        shown.vx += (SPRING * (goal.x - shown.x) - DAMPING * shown.vx) * h;
        shown.vy += (SPRING * (goal.y - shown.y) - DAMPING * shown.vy) * h;
        shown.x += shown.vx * h;
        shown.y += shown.vy * h;
      }

      // Resting hand tremor (quiets down while typing)
      tremor += ((typing ? 0 : 1) - tremor) * Math.min(dt / 280, 1);
      const x =
        shown.x +
        (Math.sin(clock / 830 + 1.3) * 1.5 +
          Math.sin(clock / 310 + 4.1) * 0.6 +
          Math.sin(clock / 127) * 0.22) *
          tremor;
      const y =
        shown.y +
        (Math.cos(clock / 1010 + 0.4) * 1.3 +
          Math.sin(clock / 370 + 2.2) * 0.55 +
          Math.cos(clock / 141 + 5) * 0.2) *
          tremor;

      root.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;

      // Dispatch coordinate to guide mascot's eye gaze smoothly
      window.dispatchEvent(
        new PointerEvent('pointermove', {
          clientX: Math.round(x),
          clientY: Math.round(y),
          bubbles: true
        })
      );

      for (let i = waiters.length - 1; i >= 0; i--) {
        if (waiters[i].at <= clock) {
          waiters.splice(i, 1)[0].done();
        }
      }
    }

    requestAnimationFrame(frame);
  }

  const sleep = (ms) =>
    new Promise((done) => waiters.push({ at: clock + ms, done }));

  function glide(to, dur) {
    return new Promise((done) => {
      const from = { x: goal.x, y: goal.y };
      const target = to();
      const dx = target.x - from.x;
      const dy = target.y - from.y;
      const dist = Math.hypot(dx, dy) || 1;
      const b1 = Math.min(dist * rand(0.08, 0.28), 64) * (Math.random() < 0.5 ? -1 : 1);
      const b2 = Math.random() < 0.3 ? -b1 * rand(0.3, 0.8) : b1 * rand(0.4, 1.1);
      move = {
        from,
        to,
        t0: clock,
        dur,
        skew: rand(0.72, 0.94),
        nx: -dy / dist,
        ny: dx / dist,
        b1,
        b2,
        done
      };
    });
  }

  async function moveTo(to, opts = {}) {
    const off = { x: rand(-2.5, 2.5), y: rand(-1.5, 1.5) };
    const aim = opts.direct
      ? to
      : () => {
          const t = to();
          return { x: t.x + off.x, y: t.y + off.y };
        };
    const target = aim();
    const dx = target.x - goal.x;
    const dy = target.y - goal.y;
    const dist = Math.hypot(dx, dy) || 1;
    const dur =
      (opts.dur || clamp(220 + Math.sqrt(dist) * 26, 340, 1050)) *
      rand(0.88, 1.15);
    const roll = Math.random();

    if (opts.direct || dist < 160 || roll > 0.65) {
      return glide(aim, dur);
    }

    // Natural human reach: slight overshoot/undershoot + corrective glide
    const miss = clamp(dist * rand(0.025, 0.06), 5, 20) * (roll < 0.4 ? 1 : -1);
    const drift = rand(-0.4, 0.4) * miss;
    const ox = (dx / dist) * miss - (dy / dist) * drift;
    const oy = (dy / dist) * miss + (dx / dist) * drift;

    await glide(() => {
      const t = aim();
      return { x: t.x + ox, y: t.y + oy };
    }, dur);
    await sleep(rand(40, 100));
    await glide(aim, rand(140, 220));
  }

  function resolveElement(guideKey) {
    if (guideKey === 'intro') {
      return (
        document.querySelector('[data-guide="intro"]') ||
        document.getElementById('intro-title') ||
        document.querySelector('.intro-section')
      );
    }
    if (guideKey === 'skills') {
      return (
        document.querySelector('[data-guide="skills"]') ||
        document.querySelector('.intro-skills') ||
        document.querySelector('.intro-lede')
      );
    }
    if (guideKey === 'nav-work') {
      return (
        document.querySelector('[data-guide="nav-work"]') ||
        document.querySelector('.desktop-nav a[href="#work"]') ||
        document.getElementById('work')
      );
    }
    if (guideKey === 'nav-research') {
      return (
        document.querySelector('[data-guide="nav-research"]') ||
        document.querySelector('.desktop-nav a[href="#publications"]') ||
        document.getElementById('publications')
      );
    }
    if (guideKey === 'nav-contact') {
      return (
        document.querySelector('[data-guide="nav-contact"]') ||
        document.querySelector('.desktop-nav a[href="#contact"]') ||
        document.getElementById('contact')
      );
    }
    return document.querySelector(`[data-guide="${guideKey}"]`);
  }

  function anchor(el, at) {
    return () => {
      const r = el.getBoundingClientRect();
      if (at === 'above') {
        return { x: r.left + Math.min(r.width * 0.3, 140), y: Math.max(16, r.top - 20) };
      }
      if (at === 'below') {
        return { x: r.left + r.width / 2, y: r.bottom + 4 };
      }
      return { x: r.right + 6, y: r.top + r.height / 2 };
    };
  }

  function openSpace(fx, fy) {
    const point = { x: innerWidth * fx, y: innerHeight * fy };
    return () => point;
  }

  function setHover(el) {
    if (hovered) hovered.classList.remove('gc-hover');
    hovered = el || null;
    if (hovered) hovered.classList.add('gc-hover');
  }

  function compose(text) {
    const parts = graphemes
      ? Array.from(graphemes.segment(text), (s) => s.segment)
      : Array.from(text);
    const chars = parts.map((part) => {
      const span = document.createElement('span');
      span.className = 'gc-ch';
      span.textContent = part;
      return span;
    });
    measure.replaceChildren(...chars);
    const boxes = chars.map((span) => ({
      right: span.offsetLeft + span.offsetWidth,
      top: span.offsetTop,
      bottom: span.offsetTop + span.offsetHeight
    }));
    return {
      parts,
      chars,
      boxes,
      width: Math.ceil(measure.getBoundingClientRect().width),
      height: measure.offsetHeight
    };
  }

  function place(point, layout, prefer) {
    const w = Math.max(name.offsetWidth, layout.width) + 26;
    const h = name.offsetHeight + layout.height + 12;
    const fitsBelow = point.y + 19 + h + 10 <= innerHeight;
    const fitsAbove = point.y - h - 10 >= 0;

    root.classList.toggle('is-up', fitsAbove && (prefer === 'above' || !fitsBelow));
    root.classList.toggle('is-left', point.x + 16 + w + 10 > innerWidth);
  }

  async function type(layout) {
    inner.style.width = layout.width + 'px';
    inner.replaceChildren(...layout.chars, caret);
    tag.classList.add('is-talking', 'is-typing');
    typing = true;
    const pace = rand(0.9, 1.2);
    let width = 0;

    for (let i = 0; i < layout.chars.length; i++) {
      const box = layout.boxes[i];
      const part = layout.parts[i];
      layout.chars[i].classList.add('is-on');
      width = Math.max(width, box.right);
      clip.style.width = Math.ceil(width) + 2 + 'px';
      clip.style.height = box.bottom + 'px';
      caret.style.transform = `translate(${box.right}px, ${box.top}px)`;

      let wait = rand(8, 22) * pace;
      if (/[.!?]/.test(part)) wait = rand(90, 160);
      else if (/[,:—-]/.test(part)) wait = rand(50, 95);
      else if (part === ' ' && Math.random() < 0.12) wait += rand(60, 140);
      else if (Math.random() < 0.06) wait += rand(30, 75);

      await sleep(wait);
    }

    typing = false;
    tag.classList.remove('is-typing');
  }

  function hush() {
    clip.style.width = clip.style.height = '0px';
    tag.classList.remove('is-talking', 'is-typing');
  }

  async function say(step) {
    const el = resolveElement(step.guide);
    const targetPoint = el ? anchor(el, step.at) : openSpace(rand(0.45, 0.55), rand(0.4, 0.5));
    const layout = compose(step.text);

    hush();
    place(targetPoint(), layout, step.at);
    setHover(el);

    await moveTo(targetPoint);
    await sleep(rand(80, 150));
    await type(layout);

    // Reading pause tailored to text length
    await sleep((750 + layout.chars.length * 24) * rand(0.95, 1.12));
    setHover(null);
  }

  function showPrompt() {
    if (store.get('guideTourPrompt') !== 'off') {
      prompt.classList.add('is-on');
    }
  }

  prompt.querySelector('[data-guide-replay]').addEventListener('click', () => {
    prompt.classList.remove('is-on');
    start();
  });

  prompt.querySelector('[data-guide-dismiss]').addEventListener('click', () => {
    prompt.classList.remove('is-on');
    store.set('guideTourPrompt', 'off');
  });

  async function run() {
    await sleep(500);
    root.classList.add('is-here');
    store.set('guideTourSeen', '1');

    for (const step of steps) {
      await say(step);
    }

    // Exit stage right smoothly
    hush();
    await sleep(rand(300, 500));
    const exit = { x: innerWidth + 90, y: innerHeight * rand(0.25, 0.45) };
    await moveTo(() => exit, { direct: true });
    root.classList.remove('is-here');
    await sleep(500);

    running = false;
    showPrompt();
  }

  function start() {
    if (running) return;
    running = true;
    move = null;
    goal.x = shown.x = innerWidth + 40;
    goal.y = shown.y = innerHeight * rand(0.4, 0.6);
    shown.vx = shown.vy = 0;
    root.classList.remove('is-up', 'is-left');
    root.style.transform = `translate3d(${goal.x}px, ${goal.y}px, 0)`;

    requestAnimationFrame((now) => {
      last = now;
      frame(now);
    });

    run();
  }

  function waitForIntro() {
    const rootEl = document.documentElement;
    if (rootEl.dataset.opening === 'ready' || rootEl.dataset.opening === 'bypass') {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const onReady = () => {
        document.removeEventListener('portfolio:intro-ready', onReady);
        resolve();
      };
      document.addEventListener('portfolio:intro-ready', onReady);
      setTimeout(resolve, 8000); // safety fallback
    });
  }

  async function init() {
    await waitForIntro();
    // Brief settle time after opening door completes
    await new Promise((r) => setTimeout(r, 700));

    const forceTour = new URLSearchParams(location.search).has('tour');
    if (store.get('guideTourSeen') !== '1' || forceTour) {
      start();
    } else {
      showPrompt();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
