export function initNav() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const toggle = navbar.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    const overlay = document.querySelector('.nav-overlay');

    if (!toggle || !links || !overlay) return;
    if (toggle.dataset.menuBound === 'true') return;
    toggle.dataset.menuBound = 'true';

    const mobileQuery = window.matchMedia('(max-width: 900px)');
    const overlayMenu = navbar.dataset.overlayMenu === 'true';

    const isMenuMode = () => overlayMenu || mobileQuery.matches;

    const setExpanded = (expanded) => {
        toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    };

    const closeMenu = () => {
        navbar.classList.remove('nav-open');
        document.body.classList.remove('nav-open');
        if (isMenuMode()) {
            links.hidden = true;
        }
        overlay.hidden = true;
        setExpanded(false);
    };

    const openMenu = () => {
        links.hidden = false;
        navbar.classList.add('nav-open');
        document.body.classList.add('nav-open');
        overlay.hidden = false;
        setExpanded(true);
    };

    const syncForViewport = () => {
        if (isMenuMode()) {
            if (!navbar.classList.contains('nav-open')) {
                links.hidden = true;
                overlay.hidden = true;
                setExpanded(false);
            } else {
                links.hidden = false;
            }
            return;
        }

        links.hidden = false;
        closeMenu();
    };

    toggle.addEventListener('click', () => {
        if (!isMenuMode()) return;
        if (navbar.classList.contains('nav-open')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    overlay.addEventListener('click', closeMenu);

    links.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            if (isMenuMode()) closeMenu();
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && navbar.classList.contains('nav-open')) {
            closeMenu();
        }
    });

    if (mobileQuery.addEventListener) {
        mobileQuery.addEventListener('change', syncForViewport);
    } else if (mobileQuery.addListener) {
        mobileQuery.addListener(syncForViewport);
    }

    syncForViewport();
}
