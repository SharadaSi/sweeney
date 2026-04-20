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

  // ---- Nav Sub-menu Toggle (down-arrow button) ----
  const navToggles = document.querySelectorAll('.nav__toggle');

  navToggles.forEach((toggleBtn) => {
    toggleBtn.addEventListener('click', () => {
      // Find the sibling sublist within the same nav__item
      const sublist = toggleBtn.nextElementSibling;
      const isOpen = toggleBtn.classList.contains('is-open');

      // Toggle open/close state on both button and sublist
      toggleBtn.classList.toggle('is-open', !isOpen);
      sublist.classList.toggle('is-open', !isOpen);
      toggleBtn.setAttribute('aria-expanded', String(!isOpen));
    });
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

// ==========================================================================
// Email copy-to-clipboard fallback
// Handles every .email-copy__btn on the page.
// When the user clicks the clipboard icon:
//   1. The email address is written to the clipboard via the Clipboard API.
//   2. The button briefly shows a "Copied!" tooltip as confirmation.
//   3. After 2 s the UI resets to its default state.
// ==========================================================================

(() => {
  // Timeout handle stored per button so rapid re-clicks reset the timer cleanly
  const resetTimers = new WeakMap();

  const RESET_DELAY_MS = 2000;

  /**
   * Trigger the copy action for a given copy button element.
   * @param {HTMLButtonElement} btn - The .email-copy__btn that was activated.
   */
  const handleCopyClick = async (btn) => {
    const email = btn.dataset.email;
    if (!email) return;

    try {
      await navigator.clipboard.writeText(email);
    } catch {
      // Clipboard API unavailable (unlikely in modern browsers, but degrade gracefully)
      return;
    }

    // Show success state on the icon
    btn.classList.add('email-copy__btn--copied');
    // Swap to a checkmark icon to give clear visual feedback
    const icon = btn.querySelector('iconify-icon');
    if (icon) icon.setAttribute('icon', 'ri:check-line');

    // Show the tooltip
    const tooltip = btn.closest('.email-copy')?.querySelector('.email-copy__tooltip');
    if (tooltip) tooltip.classList.add('email-copy__tooltip--visible');

    // Clear any existing reset timer for this button
    if (resetTimers.has(btn)) clearTimeout(resetTimers.get(btn));

    // Reset back to default after a short delay
    const timerId = setTimeout(() => {
      btn.classList.remove('email-copy__btn--copied');
      if (icon) icon.setAttribute('icon', 'ri:file-copy-line');
      if (tooltip) tooltip.classList.remove('email-copy__tooltip--visible');
      resetTimers.delete(btn);
    }, RESET_DELAY_MS);

    resetTimers.set(btn, timerId);
  };

  // Attach listeners to all copy buttons present in the DOM
  document.querySelectorAll('.email-copy__btn').forEach((btn) => {
    btn.addEventListener('click', () => handleCopyClick(btn));
  });
})();
