// ==========================================================================
// Model Page — GSAP Animations (ScrollTrigger)
// ==========================================================================

(() => {
  // Guard: only run on model pages where GSAP is loaded
  if (typeof gsap === 'undefined' || !document.querySelector('.mp-hero')) return;

  // Register the ScrollTrigger plugin with GSAP core
  gsap.registerPlugin(ScrollTrigger);

  // ---- HERO: entrance animation timeline ----
  const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

  heroTimeline
    // Label pill fades in from top
    .from('.mp-hero__label', {
      y: -30,
      opacity: 0,
      duration: 0.8,
    })
    // Title scales up and fades in
    .from('.mp-hero__title', {
      y: 60,
      opacity: 0,
      duration: 1,
      ease: 'power4.out',
    }, '-=0.4')
    // Subtitle slides up
    .from('.mp-hero__subtitle', {
      y: 40,
      opacity: 0,
      duration: 0.8,
    }, '-=0.5')
    // Metrics stagger in from below
    .from('.mp-hero__metric', {
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.15,
    }, '-=0.3')
    // House image floats up and scales in
    .from('.mp-hero__image', {
      y: 80,
      scale: 0.9,
      opacity: 0,
      duration: 1.2,
      ease: 'power2.out',
    }, '-=0.8')
    // Scroll indicator fades in last
    .from('.mp-hero__scroll', {
      opacity: 0,
      duration: 0.6,
    }, '-=0.2');

  // ---- HERO: subtle parallax on the house image while scrolling ----
  gsap.to('.mp-hero__image', {
    y: -60,
    ease: 'none',
    scrollTrigger: {
      trigger: '.mp-hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  });

  // ---- SHOWCASE: image parallax with scale-in reveal ----
  const showcaseImage = document.querySelector('.mp-showcase__image');
  if (showcaseImage) {
    // Scale the image from 1.15 → 1 as user scrolls through the section
    gsap.fromTo('.mp-showcase__image', {
      scale: 1.15,
    }, {
      scale: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: '.mp-showcase',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

    // Quote text fades in and slides up
    gsap.from('.mp-showcase__quote', {
      y: 40,
      opacity: 0,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.mp-showcase',
        start: 'top 60%',
        toggleActions: 'play none none none',
      },
    });
  }

  // ---- FEATURES: staggered card reveal ----
  const featureItems = document.querySelectorAll('.mp-features__item');
  if (featureItems.length) {
    // Header elements animate in first
    gsap.from('.mp-features__header', {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.mp-features',
        start: 'top 75%',
        toggleActions: 'play none none none',
      },
    });

    // Feature cards stagger in from below with a slight scale
    gsap.from('.mp-features__item', {
      y: 60,
      opacity: 0,
      scale: 0.95,
      duration: 0.7,
      stagger: 0.12,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.mp-features__grid',
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });
  }

  // ---- GALLERY: horizontal scroll driven by vertical scroll ----
  const galleryWrapper = document.querySelector('.mp-gallery__wrapper');
  const galleryTrack = document.querySelector('.mp-gallery__track');

  if (galleryWrapper && galleryTrack) {
    // Calculate how far the track needs to move horizontally
    const getScrollDistance = () => {
      return galleryTrack.scrollWidth - galleryWrapper.offsetWidth;
    };

    // Horizontal scroll animation pinned to the viewport
    gsap.to(galleryTrack, {
      x: () => -getScrollDistance(),
      ease: 'none',
      scrollTrigger: {
        trigger: '.mp-gallery',
        start: 'top top',
        // Pin duration proportional to content width
        end: () => '+=' + getScrollDistance(),
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    // Gallery header reveal
    gsap.from('.mp-gallery__header', {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.mp-gallery',
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });

    // Individual slide reveal — each slide scales in as it enters the viewport
    document.querySelectorAll('.mp-gallery__slide').forEach((slide) => {
      gsap.from(slide, {
        scale: 0.85,
        opacity: 0.4,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: slide,
          // Because the gallery scrolls horizontally, we use the wrapper as scroller
          containerAnimation: ScrollTrigger.getAll().find(
            (st) => st.vars.trigger === '.mp-gallery'
          )
            ? undefined
            : undefined,
          start: 'left 90%',
          toggleActions: 'play none none none',
          horizontal: true,
        },
      });
    });
  }

  // ---- CTA: reveal on scroll ----
  const ctaSection = document.querySelector('.mp-cta');
  if (ctaSection) {
    gsap.from('.mp-cta__container', {
      y: 50,
      opacity: 0,
      duration: 0.9,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.mp-cta',
        start: 'top 75%',
        toggleActions: 'play none none none',
      },
    });
  }

  // ---- Refresh ScrollTrigger after all images are loaded ----
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });
})();
