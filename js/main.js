// ==========================================================================
// Main JS — Hamburger Navigation + Scroll Reveal
// ==========================================================================

(() => {
  // ---- DOM Elements ----
  const hamburgerButton = document.querySelector('.hamburger');
  const navigationPanel = document.getElementById('nav-main');
  const navigationOverlay = document.getElementById('nav-overlay');
  const navigationLinks = document.querySelectorAll('.nav__link');

  // ---- Navigation Toggle ----
  const openNavigation = () => {
    hamburgerButton.classList.add('hamburger--active');
    navigationPanel.classList.add('nav--open');
    navigationOverlay.classList.add('nav-overlay--visible');
    hamburgerButton.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeNavigation = () => {
    hamburgerButton.classList.remove('hamburger--active');
    navigationPanel.classList.remove('nav--open');
    navigationOverlay.classList.remove('nav-overlay--visible');
    hamburgerButton.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  const toggleNavigation = () => {
    const isOpen = navigationPanel.classList.contains('nav--open');
    isOpen ? closeNavigation() : openNavigation();
  };

  hamburgerButton.addEventListener('click', toggleNavigation);
  navigationOverlay.addEventListener('click', closeNavigation);

  // Close nav on link click (for same-page anchors)
  navigationLinks.forEach((navLink) => {
    navLink.addEventListener('click', closeNavigation);
  });

  // Close on Escape key
  document.addEventListener('keydown', ({ key }) => {
    if (key === 'Escape' && navigationPanel.classList.contains('nav--open')) {
      closeNavigation();
    }
  });

  // ---- Floating Button: color switch on scroll past hero ----
  const floatBtn = document.querySelector('.float-btn');
  const heroSection = document.querySelector('.hero');

  if (floatBtn && heroSection) {
    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        floatBtn.classList.toggle('float-btn--dark', !entry.isIntersecting);
      },
      { threshold: 0.90 }
    );
    heroObserver.observe(heroSection);
  }

  // ---- Scroll Reveal (IntersectionObserver) ----
  const revealElements = document.querySelectorAll(
    '.reveal, .reveal--left, .reveal--right, .reveal--scale'
  );

  const revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      }
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  revealElements.forEach((revealElement) => {
    revealObserver.observe(revealElement);
  });
})();
