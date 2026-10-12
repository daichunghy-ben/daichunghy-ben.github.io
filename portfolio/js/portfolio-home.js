const nodes = [ ...document.querySelectorAll("[data-en]") ];

for (const n of nodes) n.dataset.vi = n.dataset.rich ? n.innerHTML : n.textContent;

let locale = "vi";

function setLocale(next) {
    locale = next === "en" ? "en" : "vi";
    document.documentElement.lang = locale;
    document.documentElement.dataset.homeLocale = locale;
    document.title = locale === "vi" ? "Chung Hy Dai | Tư vấn & Nghiên cứu" : "Chung Hy Dai | Consulting & Research";
    for (const n of nodes) {
        if (n.dataset.rich) n.innerHTML = n.dataset[locale]; else n.textContent = n.dataset[locale];
    }
    document.querySelectorAll("[data-home-language]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.homeLanguage === locale)));
    try {
        localStorage.setItem("portfolio.homeLocale.v2", locale);
    } catch {}
}

try {
    locale = localStorage.getItem("portfolio.homeLocale.v2") || "vi";
} catch {}

setLocale(locale);

document.querySelectorAll("[data-home-language]").forEach(b => b.addEventListener("click", () => setLocale(b.dataset.homeLanguage)));

const menu = document.getElementById("nav-links"), toggle = document.querySelector(".menu-toggle");

const closeMenu = () => {
    menu.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
};

toggle.addEventListener("click", () => {
    menu.hidden = !menu.hidden;
    toggle.setAttribute("aria-expanded", String(!menu.hidden));
});

menu.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));

document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeMenu();
});

const reduced = matchMedia("(prefers-reduced-motion: reduce)"), video = document.getElementById("profile-film"), card = video.closest(".profile-film-card"), motionToggle = document.getElementById("profile-video-toggle");

let paused = false, videoVisible = false;

const syncVideo = () => {
    if (reduced.matches) {
        video.pause();
        card.classList.add("is-static");
        motionToggle.hidden = true;
    } else {
        card.classList.remove("is-static");
        motionToggle.hidden = false;
        if (videoVisible && !paused && !document.hidden) video.play().catch(() => card.classList.add("is-static")); else video.pause();
    }
};

new IntersectionObserver(entries => {
    videoVisible = entries[0].isIntersecting;
    syncVideo();
}, {
    threshold: .08
}).observe(video);

video.addEventListener("error", () => card.classList.add("is-static"));

motionToggle.addEventListener("click", () => {
    paused = !paused;
    document.body.classList.toggle("motion-paused", paused);
    motionToggle.setAttribute("aria-pressed", String(paused));
    motionToggle.textContent = paused ? "▷" : "Ⅱ";
    motionToggle.setAttribute("aria-label", paused ? "Tiếp tục chuyển động" : "Tạm dừng chuyển động");
    syncVideo();
});

reduced.addEventListener("change", () => {
    syncVideo();
    if (reduced.matches) document.querySelectorAll(".home-motion [style]").forEach(n => {
        if (n.matches(".case-visual,.profile-film-card")) n.style.transform = "";
    });
});

document.addEventListener("visibilitychange", syncVideo);

syncVideo();

// Reveals show the content once, while the illustrative cards keep telling their story.
if (!reduced.matches) {
    document.body.classList.add("home-motion");
    const targets = document.querySelectorAll(".section-heading,.case-copy,.research-card,.about-copy,.journey li");
    const reveal = new IntersectionObserver(entries => entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add("in-view");
            reveal.unobserve(e.target);
        }
    }), {
        threshold: .12
    });
    targets.forEach((n, i) => {
        n.style.setProperty("--reveal-delay", Math.min(i % 3 * 100, 200) + "ms");
        reveal.observe(n);
    });
}

const graphics = [ ...document.querySelectorAll(".case-visual") ];

let beat = 0;

setInterval(() => {
    if (reduced.matches || paused || document.hidden) return;
    beat = (beat + 1) % 3;
    for (const n of graphics) {
        const box = n.getBoundingClientRect();
        if (box.bottom > 0 && box.top < innerHeight) n.dataset.step = String(beat);
    }
}, 2200);

let scrollFrame = 0;

const followScroll = () => {
    scrollFrame = 0;
    if (reduced.matches || paused) return;
    const viewport = innerHeight;
    for (const n of graphics) {
        const r = n.getBoundingClientRect();
        if (r.bottom > 0 && r.top < viewport) {
            const progress = (r.top + r.height / 2 - viewport / 2) / viewport;
            n.style.transform = `translateY(${progress * -24}px) rotate(${progress * 2.8}deg)`;
        }
    }
    const r = document.querySelector(".intro-section").getBoundingClientRect();
    if (r.bottom > 0) {
        const progress = Math.max(0, Math.min(1, -r.top / viewport));
        card.style.transform = `rotate(${-1.6 + progress * 3.2}deg)`;
    }
};

window.addEventListener("scroll", () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(followScroll);
}, {
    passive: true
});

followScroll();