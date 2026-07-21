/* ============================================================
   script.js
   - Intro orchestration
   - GSAP hero timeline (corre al cerrar el intro)
   - GSAP ScrollTrigger para reveals on-scroll
   - PhotoSwipe v5 lightbox (carrusel unificado de las 64 fotos)
   ============================================================ */

(function () {
  'use strict';

  // ============================================================
  // 0. Esperar a que todas las librerías carguen antes de inicializar
  // ============================================================
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
    initHeroAnimations();
    initScrollReveals();
    initLightbox();
  }

  // ============================================================
  // 1. INTRO — overlay de bienvenida
  // ============================================================
  function initIntro() {
    const intro = document.getElementById('intro');
    const introButton = document.getElementById('introButton');
    if (!intro || !introButton) {
      document.body.classList.add('intro-done');
      document.body.classList.remove('intro-active');
      return;
    }

    // Preload imágenes visibles en background mientras corre la intro
    document.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src');
      if (!src || img.complete) return;
      const preloader = new Image();
      preloader.decoding = 'async';
      preloader.src = src;
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        intro.classList.add('is-active');
      });
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

      // Cuando termina la transición, removemos y disparamos el hero
      setTimeout(() => {
        if (intro.parentNode) intro.parentNode.removeChild(intro);
        playHeroTimeline();
      }, 950);
    }
  }

  // ============================================================
  // 2. HERO — animación con GSAP (corre al cerrar el intro)
  // ============================================================
  let heroPlayed = false;

  function playHeroTimeline() {
    if (heroPlayed) return;
    heroPlayed = true;

    if (typeof gsap === 'undefined') {
      // Fallback sin GSAP: simplemente hacemos visibles
      document.querySelectorAll('.hero-eyebrow, .hero-date, .hero-title, .hero-decoration, .hero-message, .scroll-hint, .hero-rule')
        .forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; });
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.from('.hero-eyebrow',   { y: 20, opacity: 0, duration: 0.9 }, 0)
      .from('.hero-date-day',  { y: 80, opacity: 0, duration: 1.4, ease: 'expo.out' }, 0.1)
      .from('.hero-date-month',{ y: 30, opacity: 0, duration: 0.9 }, '-=0.7')
      .from('.hero-rule',      { width: 0, opacity: 0, duration: 1.0 }, '-=0.3')
      .from('.hero-title',     { y: 30, opacity: 0, duration: 1.0 }, '-=0.5')
      .from('.hero-decoration',{ scale: 0.4, opacity: 0, duration: 1.2, ease: 'back.out(2)' }, '-=0.5')
      .from('.hero-message',   { y: 25, opacity: 0, duration: 1.0 }, '-=0.6')
      .from('.scroll-hint',    { y: 20, opacity: 0, duration: 0.8 }, '-=0.4');
  }

  // Si el intro no existe (no-JS / hot-reload), arrancamos igual
  function initHeroAnimations() {
    if (!document.getElementById('intro')) {
      setTimeout(playHeroTimeline, 100);
    }
  }

  // ============================================================
  // 3. SCROLL REVEALS — GSAP ScrollTrigger
  // ============================================================
  function initScrollReveals() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      // Fallback: hace visibles
      document.querySelectorAll('[data-reveal]').forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    // Revela cualquier elemento con data-reveal cuando entra en viewport
    const revealItems = document.querySelectorAll('[data-reveal]');
    revealItems.forEach((el) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 1.0,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      });
    });

    // Moment cards: stagger con entrada desde abajo
    gsap.utils.toArray('.moment-card').forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0,
          duration: 0.9,
          delay: i * 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    // Gallery items: stagger sutil al entrar
    ScrollTrigger.batch('.gallery-item', {
      start: 'top 90%',
      onEnter: (els) => {
        gsap.fromTo(els,
          { opacity: 0, y: 30, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.04, ease: 'power2.out' }
        );
      },
      once: true,
    });

    // Featured photo: entrada con scale
    const featuredFrame = document.querySelector('.featured-frame');
    if (featuredFrame) {
      gsap.fromTo(featuredFrame,
        { opacity: 0, scale: 0.85, rotate: -6 },
        {
          opacity: 1, scale: 1, rotate: -1.8,
          duration: 1.2,
          ease: 'elastic.out(1, 0.7)',
          scrollTrigger: {
            trigger: featuredFrame,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    }

    // Letter stanzas: stagger entrada
    gsap.utils.toArray('.letter-stanza, .letter-divider, .letter-final, .letter-signature').forEach((el, i) => {
      gsap.fromTo(el,
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0,
          duration: 0.9,
          delay: i * 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    // Closing: entrada lenta y serena
    const closingDivider = document.querySelector('.closing-divider');
    const closingMessage = document.querySelector('.closing-message');
    if (closingDivider) {
      gsap.to(closingDivider, {
        opacity: 0.7, y: 0,
        duration: 1.0,
        ease: 'sine.out',
        scrollTrigger: { trigger: '.closing', start: 'top 80%', toggleActions: 'play none none none' },
      });
    }
    if (closingMessage) {
      gsap.to(closingMessage, {
        opacity: 1, y: 0,
        duration: 1.4,
        delay: 0.15,
        ease: 'sine.out',
        scrollTrigger: { trigger: '.closing', start: 'top 80%', toggleActions: 'play none none none' },
      });
    }

    // Parallax sutil del hero al hacer scroll
    gsap.to('.hero-content', {
      y: -60,
      opacity: 0.3,
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }

  // ============================================================
  // 4. PHOTOSWIPE v5 — lightbox + carrusel unificado
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
      // Mobile-friendly
      pinchToClose: true,
      closeOnVerticalDrag: true,
    });

    lightbox.init();
  }

  // ============================================================
  // 5. SMOOTH ANCHOR SCROLL (para links # que NO son lightbox)
  // ============================================================
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    if (link.hasAttribute('data-pswp-src')) return;  // no interceptar lightbox

    const href = link.getAttribute('href');
    if (!href || href.length <= 1) return;
    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

})();
