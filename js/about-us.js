// ==========================================================================
// About Us — Card flip: 360° diagonal rotation, JS face swap at midpoint
// ==========================================================================

(() => {
  const TRANSITION_MS = 700; // must match CSS transition duration
  const HALF = TRANSITION_MS / 2;
  const isHoverDevice = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  document.querySelectorAll('.about-team__card').forEach((card) => {
    const inner = card.querySelector('.about-team__card-inner');
    const front = card.querySelector('.about-team__face--front');
    const back = card.querySelector('.about-team__face--back');
    let swapTimer = null;
    let showingBack = false;

    function flipToBack() {
      clearTimeout(swapTimer);
      inner.classList.add('is-flipped');
      swapTimer = setTimeout(() => {
        front.style.visibility = 'hidden';
        back.style.visibility = 'visible';
        showingBack = true;
      }, HALF);
    }

    function flipToFront() {
      clearTimeout(swapTimer);
      inner.classList.remove('is-flipped');
      swapTimer = setTimeout(() => {
        front.style.visibility = 'visible';
        back.style.visibility = 'hidden';
        showingBack = false;
      }, HALF);
    }

    // Desktop: hover in/out
    if (isHoverDevice) {
      card.addEventListener('mouseenter', flipToBack);
      card.addEventListener('mouseleave', flipToFront);
    }

    // Touch: tap toggle
    card.addEventListener('click', () => {
      if (!isHoverDevice) {
        if (showingBack) {
          flipToFront();
        } else {
          flipToBack();
        }
      }
    });
  });
})();

// ==========================================================================
// About Us — Horizontal sliding image gallery
// ==========================================================================

(() => {
  const slider = document.querySelector('.about-gallery__slider');
  if (!slider) return;

  const track = slider.querySelector('.about-gallery__track');
  const slides = Array.from(slider.querySelectorAll('.about-gallery__slide'));
  const prevBtn = slider.querySelector('.about-gallery__arrow--prev');
  const nextBtn = slider.querySelector('.about-gallery__arrow--next');

  if (slides.length < 2) return;

  const count = slides.length;
  let current = 0;
  let autoTimer = null;
  let isTransitioning = false;
  const AUTO_INTERVAL = 4000;

  // Clone first and last slides for seamless looping
  const firstClone = slides[0].cloneNode(true);
  const lastClone = slides[count - 1].cloneNode(true);
  track.appendChild(firstClone);
  track.insertBefore(lastClone, slides[0]);

  // Offset by 1 because of the prepended clone
  function setPosition(index, animate) {
    if (!animate) {
      track.style.transition = 'none';
    } else {
      track.style.transition = '';
    }
    track.style.transform = 'translateX(-' + ((index + 1) * 100) + '%)';
  }

  // Initial position (no animation)
  setPosition(0, false);

  function goTo(index) {
    if (isTransitioning) return;
    isTransitioning = true;
    current = index;
    setPosition(current, true);
  }

  // After each transition, snap to the real slide if we're on a clone
  track.addEventListener('transitionend', () => {
    isTransitioning = false;
    if (current >= count) {
      current = 0;
      setPosition(current, false);
    } else if (current < 0) {
      current = count - 1;
      setPosition(current, false);
    }
  });

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => goTo(current + 1), AUTO_INTERVAL);
  }

  function stopAuto() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  prevBtn.addEventListener('click', () => {
    goTo(current - 1);
    startAuto();
  });

  nextBtn.addEventListener('click', () => {
    goTo(current + 1);
    startAuto();
  });

  // Swipe support for touch devices
  let touchStartX = 0;
  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  slider.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      goTo(diff > 0 ? current + 1 : current - 1);
      startAuto();
    }
  }, { passive: true });

  startAuto();
})();