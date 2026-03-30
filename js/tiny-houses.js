// ==========================================================================
// Tiny Houses — Zoom-in click animation
// Temporarily disabled
// ==========================================================================

/*
(() => {
  const overlay = document.getElementById('th-zoom-overlay');
  const modelLinks = document.querySelectorAll('[data-model-link]');

  modelLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      const section = link.closest('.th-model');
      const targetUrl = section?.dataset.modelUrl;
      if (!section || section.classList.contains('is-zooming')) return;

      // Trigger zoom on the image
      section.classList.add('is-zooming');

      // Fade overlay in partway through the zoom
      setTimeout(() => {
        overlay.classList.add('is-active');
      }, 400);

      // Navigate after the zoom + fade completes
      setTimeout(() => {
        if (targetUrl && targetUrl !== '#') {
          window.location.href = targetUrl;
        } else {
          // Reset if no real URL yet
          section.classList.remove('is-zooming');
          overlay.classList.remove('is-active');
        }
      }, 1200);
    });
  });
})();
*/
