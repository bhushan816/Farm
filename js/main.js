/* ============================================
   GOVARDHAN FARM — MAIN JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── NAV SCROLL BEHAVIOUR ── */
  const nav = document.querySelector('.nav');
  const handleScroll = () => {
    nav?.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* ── HAMBURGER MOBILE MENU ── */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open);
    });
    /* Close on link click */
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
    /* Close on outside click */
    document.addEventListener('click', e => {
      if (!nav.contains(e.target)) {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
      }
    });
  }

  /* ── HERO LOAD ANIMATION ── */
  const heroBg = document.querySelector('.hero-bg, .celebrations-hero .hero-bg');
  if (heroBg) setTimeout(() => heroBg.classList.add('loaded'), 100);
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) setTimeout(() => heroContent.classList.add('visible'), 400);

  /* ── SCROLL REVEAL ── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ── ACTIVE NAV LINK ── */
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    link.classList.toggle('active',
      (href === 'index.html'        && (path === '/' || path.endsWith('index.html'))) ||
      (href === 'celebrations.html' && path.includes('celebrations'))
    );
  });

  /* ── PARALLAX HERO (desktop only) ── */
  const heroBgEl = document.querySelector('.hero-bg');
  if (heroBgEl && window.innerWidth > 900 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          heroBgEl.style.transform = `translateY(${window.scrollY * 0.35}px)`;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ── GET DIRECTIONS BUTTONS ── */
  document.querySelectorAll('[data-map]').forEach(btn => {
    btn.addEventListener('click', () => {
      window.open('https://maps.google.com/?q=22.512460,70.264592', '_blank', 'noopener,noreferrer');
    });
  });

  /* ── DRONE CARD HOVER Z-INDEX ── */
  document.querySelectorAll('.drone-card').forEach(card => {
    card.addEventListener('mouseenter', () => { card.style.zIndex = '10'; });
    card.addEventListener('mouseleave', () => { card.style.zIndex = ''; });
  });

  /* ── NUMBER COUNTER ANIMATION ── */
  const counterEl = document.querySelector('[data-counter]');
  if (counterEl) {
    const target  = parseInt(counterEl.dataset.counter, 10);
    let started   = false;
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !started) {
          started = true;
          animateCounter(counterEl, target, 1800);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counterObserver.observe(counterEl);
  }

  function animateCounter(el, target, duration) {
    const start    = Date.now();
    const startVal = Math.floor(target * 0.7);
    const step = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(startVal + (target - startVal) * eased).toLocaleString('en-IN');
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString('en-IN');
    };
    requestAnimationFrame(step);
  }

  /* ── DYNAMIC FOOTER YEAR ── */
  const footerYear = document.querySelector('.footer-year');
  if (footerYear) footerYear.textContent = new Date().getFullYear();

  /* ════════════════════════════════════════════════════
     MOBILE BOTTOM NAVIGATION BAR
     Injected on every page — auto-detects active page
     and session state (logged-in vs guest)
  ════════════════════════════════════════════════════ */
  (function injectBottomNav() {

    /* Only inject on mobile — avoids any impact on desktop */
    if (window.innerWidth > 640) return;

    /* Session helper */
    function getSession() {
      try {
        const s = JSON.parse(localStorage.getItem('gf_session'));
        if (!s) return null;
        if (Date.now() - s.loginTime > 90 * 24 * 60 * 60 * 1000) {
          localStorage.removeItem('gf_session'); return null;
        }
        return s;
      } catch { return null; }
    }
    const session    = getSession();
    const isLoggedIn = !!session;
    const canAccess  = !!session; // All logged-in users have full access

    /* Detect current page */
    const path = window.location.pathname;
    const page =
      path.endsWith('celebrations.html') ? 'celebrations' :
      path.endsWith('enquiry.html')      ? 'enquiry'      :
      path.endsWith('videos.html')       ? 'videos'       :
      path.endsWith('profile.html')      ? 'profile'      :
      path.endsWith('login.html')        ? 'login'        : 'home';

    /* Add body class for page-specific styling */
    if (page === 'videos') document.body.classList.add('page-videos');

    /* Don't show bottom nav on login page */
    if (page === 'login') return;

    /* SVG icons */
    const icons = {
      home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>`,
      celebrations: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
      enquiry: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
      videos: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><polygon points="10,8 16,11 10,14"/></svg>`,
      profile: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    };

    /* Build tabs config */
    const tabs = [
      { id: 'home',         href: 'index.html',        label: 'Home',        always: true  },
      { id: 'celebrations', href: 'celebrations.html',  label: 'Memories',    always: true  },
      { id: 'enquiry',      href: 'enquiry.html',       label: 'Enquiry',     always: false },
      { id: 'videos',       href: 'videos.html',        label: 'Reels',       always: false },
      { id: 'profile',      href: 'profile.html',       label: 'Profile',     always: false },
    ];

    /* Build HTML */
    const navEl = document.createElement('nav');
    navEl.className   = 'bottom-nav';
    navEl.setAttribute('aria-label', 'Mobile navigation');
    navEl.setAttribute('role', 'navigation');

    tabs.forEach(tab => {
      const isActive = page === tab.id;
      const locked   = !tab.always && !canAccess;

      const a = document.createElement('a');
      a.className  = 'bnav-item' + (isActive ? ' active' : '') + (locked ? ' locked' : '');
      a.setAttribute('aria-label', tab.label);
      a.setAttribute('aria-current', isActive ? 'page' : 'false');

      if (locked) {
        /* Locked: tap takes to login */
        a.href = 'login.html';
        a.setAttribute('title', 'Sign in to access ' + tab.label);
      } else {
        a.href = tab.href;
      }

      a.innerHTML = `
        <div class="bnav-icon">${icons[tab.id]}</div>
        <span class="bnav-label">${tab.label}</span>`;

      navEl.appendChild(a);
    });

    document.body.appendChild(navEl);

    /* Smooth entrance animation */
    navEl.style.transform    = 'translateY(120%)';
    navEl.style.opacity      = '0';
    navEl.style.transition   = 'transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.5s';
    requestAnimationFrame(() => {
      setTimeout(() => {
        navEl.style.transform = 'translateY(0)';
        navEl.style.opacity   = '1';
      }, 300);
    });

    /* Hide nav when keyboard is open (input focused) */
    document.querySelectorAll('input, textarea, select').forEach(el => {
      el.addEventListener('focus', () => { navEl.style.transform = 'translateY(140%)'; navEl.style.opacity = '0'; });
      el.addEventListener('blur',  () => { navEl.style.transform = 'translateY(0)';    navEl.style.opacity = '1'; });
    });

  })();

});

