/* ============================================================
   script.js
   Optimizaciones para evitar parpadeo y problemas de rendimiento:
   - Sin `scale` (subpixel rendering en imágenes)
   - `gsap.set()` para estado inicial + `gsap.to()` (sin salto de `fromTo`)
   - `force3D: false` en set() y en galería (no crea capas compositor)
   - `clearProps: 'transform'` (libera GPU, mantiene opacity inline)
   - `lazy: true` en ScrollTriggers
   - Sin `elastic` (rebotes que causan parpadeo)
   - `will-change` NO se usa (sería contraproducente)
   ============================================================ */

(function () {
  'use strict';

  function whenReady(cb) {
    if (typeof gsap !== 'undefined' && typeof PhotoSwipe !== 'undefined' && typeof PhotoSwipeLightbox !== 'undefined') {
      cb();
    } else {
      setTimeout(() => whenReady(cb), 80);
    }
  }

  whenReady(init);

  function init() {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }
    initIntro();
    initMusic();
    initScrollAnimations();
    initLightbox();
  }

  // ============================================================
  // 1.5. MUSIC PLAYER
  // ============================================================
  let musicControls = null;

  function initMusic() {
    const audio = document.getElementById('bgMusic');
    const toggle = document.getElementById('musicToggle');
    if (!audio || !toggle) return;

    let isPlaying = false;
    let fadeInterval = null;
    const targetVolume = 0.5;

    audio.volume = 0;

    function clearFade() {
      if (fadeInterval) { clearInterval(fadeInterval); fadeInterval = null; }
    }

    function fadeIn() {
      clearFade();
      const step = 0.025;
      const interval = 80;
      fadeInterval = setInterval(() => {
        if (audio.volume < targetVolume - 0.01) {
          audio.volume = Math.min(targetVolume, audio.volume + step);
        } else {
          audio.volume = targetVolume;
          clearFade();
        }
      }, interval);
    }

    function fadeOut() {
      clearFade();
      const step = 0.04;
      const interval = 50;
      fadeInterval = setInterval(() => {
        if (audio.volume > 0.01) {
          audio.volume = Math.max(0, audio.volume - step);
        } else {
          audio.volume = 0;
          clearFade();
          audio.pause();
        }
      }, interval);
    }

    function play() {
      // Esperar a que el audio esté listo si todavía no se cargó
      if (audio.readyState < 2) {
        audio.addEventListener('canplay', () => play(), { once: true });
        return;
      }

      audio.play().then(() => {
        isPlaying = true;
        toggle.classList.add('is-playing');
        toggle.setAttribute('aria-label', 'Pausar música');
        fadeIn();
      }).catch((err) => {
        console.warn('No se pudo reproducir automáticamente:', err.message || err);
      });
    }

    function pause() {
      isPlaying = false;
      toggle.classList.remove('is-playing');
      toggle.setAttribute('aria-label', 'Activar música');
      fadeOut();
    }

    toggle.addEventListener('click', () => {
      if (isPlaying) {
        pause();
      } else {
        play();
      }
    });

    musicControls = { play, pause };
  }

  // ============================================================
  // 1. INTRO
  // ============================================================
  function initIntro() {
    const intro = document.getElementById('intro');
    const introButton = document.getElementById('introButton');
    if (!intro || !introButton) {
      document.body.classList.add('intro-done');
      document.body.classList.remove('intro-active');
      playOpeningTimeline();
      return;
    }

    // Preload imágenes visibles
    document.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src');
      if (!src || img.complete) return;
      const preloader = new Image();
      preloader.decoding = 'async';
      preloader.src = src;
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => intro.classList.add('is-active'));
    });

    introButton.addEventListener('click', dismissIntro);
    introButton.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        dismissIntro();
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !intro.classList.contains('is-leaving')) {
        dismissIntro();
      }
    });

    function dismissIntro() {
      if (intro.classList.contains('is-leaving')) return;
      intro.classList.add('is-leaving');
      document.body.classList.remove('intro-active');
      document.body.classList.add('intro-done');

      setTimeout(() => {
        if (intro.parentNode) intro.parentNode.removeChild(intro);
        playOpeningTimeline();
        // Intentar autoplay de música (el click en "Abrir" es un user gesture)
        if (musicControls) musicControls.play();
      }, 950);
    }
  }

  // ============================================================
  // 2. OPENING TIMELINE — polaroid entrance
  // ============================================================
  let openingPlayed = false;
  function playOpeningTimeline() {
    if (openingPlayed) return;
    openingPlayed = true;
    if (typeof gsap === 'undefined') return;

    // Estado inicial con gsap.set (sin parpadeo, sin capas innecesarias)
    gsap.set('.letter-featured-eyebrow', { opacity: 0, y: 15, force3D: false });
    gsap.set('.featured-frame', { opacity: 0, y: 30, rotate: -4, force3D: false });
    gsap.set('.featured-caption', { opacity: 0, y: 15, force3D: false });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('.letter-featured-eyebrow', { opacity: 1, y: 0, duration: 0.8, force3D: false }, 0)
      .to('.featured-frame', { opacity: 1, y: 0, rotate: -1.8, duration: 1.1, ease: 'power2.out', force3D: false }, 0.2)
      .to('.featured-caption', { opacity: 1, y: 0, duration: 0.8, force3D: false }, 0.6)
      .eventCallback('onComplete', () => {
        gsap.set('.featured-frame', { clearProps: 'transform' });
      });
  }

  // ============================================================
  // 3. SCROLL ANIMATIONS
  // ============================================================
  function initScrollAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      // Fallback sin GSAP
      document.querySelectorAll(
        '[data-reveal], .moment-card, .gallery-item, .letter-stanza, .letter-divider, .letter-final, .letter-featured-eyebrow, .featured-frame, .featured-caption, .closing-divider, .closing-message'
      ).forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    // ---- Estado inicial (force3D: false evita crear capas de compositor) ----
    gsap.set('[data-reveal]', { opacity: 0, y: 18, force3D: false });
    gsap.set('.moment-card', { opacity: 0, y: 25, force3D: false });
    gsap.set('.gallery-item', { opacity: 0, y: 18, force3D: false });
    gsap.set('.letter-stanza, .letter-divider, .letter-final', { opacity: 0, y: 18, force3D: false });
    gsap.set('.closing-divider', { opacity: 0, y: 12, force3D: false });
    gsap.set('.closing-message', { opacity: 0, y: 22, force3D: false });

    // ---- data-reveal (eyebrows, titles, subs) ----
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      gsap.to(el, {
        opacity: 1, y: 0,
        duration: 1.0,
        ease: 'power3.out',
        force3D: false,
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none',
          lazy: true,
        },
        onComplete: () => gsap.set(el, { clearProps: 'transform' }),
      });
    });

    // ---- Moment cards (stagger) ----
    gsap.utils.toArray('.moment-card').forEach((card, i) => {
      gsap.to(card, {
        opacity: 1, y: 0,
        duration: 1.0,
        delay: i * 0.12,
        ease: 'power3.out',
        force3D: false,
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          toggleActions: 'play none none none',
          lazy: true,
        },
        onComplete: () => gsap.set(card, { clearProps: 'transform' }),
      });
    });

    // ---- Gallery (batch, sin scale, sin force3D) ----
    ScrollTrigger.batch('.gallery-item', {
      start: 'top 92%',
      once: true,
      onEnter: (els) => {
        gsap.to(els, {
          opacity: 1, y: 0,
          duration: 0.8,
          stagger: 0.03,
          ease: 'sine.out',
          force3D: false,
          onComplete: () => gsap.set(els, { clearProps: 'transform' }),
        });
      },
    });

    // ---- Letter stanzas (stagger) ----
    gsap.utils.toArray('.letter-stanza, .letter-divider, .letter-final').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1, y: 0,
        duration: 1.0,
        delay: i * 0.1,
        ease: 'power2.out',
        force3D: false,
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none',
          lazy: true,
        },
        onComplete: () => gsap.set(el, { clearProps: 'transform' }),
      });
    });

    // ---- Closing ----
    const closingDivider = document.querySelector('.closing-divider');
    const closingMessage = document.querySelector('.closing-message');
    if (closingDivider) {
      gsap.to(closingDivider, {
        opacity: 0.7, y: 0,
        duration: 1.0,
        ease: 'sine.out',
        force3D: false,
        scrollTrigger: { trigger: '.closing', start: 'top 82%', toggleActions: 'play none none none', lazy: true },
        onComplete: () => gsap.set(closingDivider, { clearProps: 'transform' }),
      });
    }
    if (closingMessage) {
      gsap.to(closingMessage, {
        opacity: 1, y: 0,
        duration: 1.4,
        delay: 0.15,
        ease: 'sine.out',
        force3D: false,
        scrollTrigger: { trigger: '.closing', start: 'top 82%', toggleActions: 'play none none none', lazy: true },
        onComplete: () => gsap.set(closingMessage, { clearProps: 'transform' }),
      });
    }
  }

  // ============================================================
  // 4. PHOTOSWIPE v5
  // ============================================================
  function initLightbox() {
    if (typeof PhotoSwipe === 'undefined' || typeof PhotoSwipeLightbox === 'undefined') {
      return setTimeout(initLightbox, 200);
    }

    const lightbox = new PhotoSwipeLightbox({
      gallery: document.body,
      children: 'a[data-pswp-src]',
      pswpModule: PhotoSwipe,
      bgOpacity: 0.95,
      showHideAnimationType: 'fade',
      padding: { top: 24, bottom: 24, left: 24, right: 24 },
      doubleTapAction: 'zoom',
      tapAction: 'close',
      pinchToClose: true,
      closeOnVerticalDrag: true,
    });

    lightbox.init();
  }

  // ============================================================
  // 5. SMOOTH ANCHOR SCROLL
  // ============================================================
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    if (link.hasAttribute('data-pswp-src')) return;
    const href = link.getAttribute('href');
    if (!href || href.length <= 1) return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

})();
