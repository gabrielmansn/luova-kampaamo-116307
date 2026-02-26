/* ============================================
   LUOVA KAMPAAMO – main.js
   ============================================ */

'use strict';

/* ============================================
   NAVIGAATIO – scroll-tila & hampurilaisvalikko
   ============================================ */
(function initNav() {
  const header     = document.querySelector('.site-header');
  const hamburger  = document.getElementById('hamburger');
  const navMenu    = document.getElementById('nav-menu');
  const navLinks   = navMenu ? navMenu.querySelectorAll('.nav-link, .nav-cta') : [];

  if (!header || !hamburger || !navMenu) return;

  // Lisää scrolled-luokka kun käyttäjä on scrollannut alas
  function onScroll() {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Tarkista tila heti

  // Hampurilaisvalikko
  function openMenu() {
    navMenu.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Sulje valikko');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Avaa valikko');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function () {
    const isOpen = navMenu.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  // Sulje valikko linkkiä klikatessa
  navLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Sulje valikko Escape-näppäimellä
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
      closeMenu();
      hamburger.focus();
    }
  });

  // Sulje valikko klikkaamalla taustan ulkopuolelle
  document.addEventListener('click', function (e) {
    if (
      navMenu.classList.contains('open') &&
      !navMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      closeMenu();
    }
  });
})();

/* ============================================
   SMOOTH SCROLL – ankkurilinkit
   ============================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const navHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-height'),
        10
      ) || 68;

      const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 8;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });
})();

/* ============================================
   FADE-IN ANIMAATIOT – IntersectionObserver
   ============================================ */
(function initFadeIn() {
  // Lisää fade-in-luokka animoitaville elementeille
  const selectors = [
    '.service-card',
    '.pricing-category',
    '.about-image-col',
    '.about-content-col',
    '.section-header',
    '.trust-item',
    '.mid-cta-inner',
    '.contact-info',
    '.contact-form-wrap',
  ];

  const elements = document.querySelectorAll(selectors.join(', '));

  // Tarkista prefers-reduced-motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) return;

  elements.forEach(function (el, index) {
    el.classList.add('fade-in');

    // Porrastus grid-elementeillä
    const parent = el.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children);
      const siblingIndex = siblings.indexOf(el);
      if (siblingIndex >= 0) {
        el.style.transitionDelay = Math.min(siblingIndex * 80, 320) + 'ms';
      }
    }
  });

  if (!('IntersectionObserver' in window)) {
    // Fallback: näytä kaikki suoraan
    elements.forEach(function (el) {
      el.classList.add('visible');
    });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  elements.forEach(function (el) {
    observer.observe(el);
  });
})();

/* ============================================
   YHTEYDENOTTOLOMAKE – lähetys & palaute
   ============================================ */
(function initContactForm() {
  const form       = document.getElementById('contact-form');
  const statusEl   = document.getElementById('form-status');
  const submitBtn  = document.getElementById('submit-btn');

  if (!form || !statusEl || !submitBtn) return;

  const originalBtnText = submitBtn.textContent;

  function showStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = 'form-status ' + type;
    statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function clearStatus() {
    statusEl.textContent = '';
    statusEl.className = 'form-status';
  }

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? 'Lähetetään…' : originalBtnText;
    submitBtn.style.opacity = isLoading ? '0.7' : '';
    submitBtn.style.cursor  = isLoading ? 'not-allowed' : '';
  }

  // Lomakkeen validointi
  function validateForm() {
    const name    = form.querySelector('#name');
    const phone   = form.querySelector('#phone');
    const emailEl = form.querySelector('#email-input');

    if (!name.value.trim()) {
      name.focus();
      showStatus('Kirjoita nimesi ennen lähettämistä.', 'error');
      return false;
    }

    if (!phone.value.trim() && !emailEl.value.trim()) {
      phone.focus();
      showStatus('Anna joko puhelinnumero tai sähköpostiosoite, jotta voimme olla yhteydessä.', 'error');
      return false;
    }

    if (emailEl.value.trim() && !isValidEmail(emailEl.value.trim())) {
      emailEl.focus();
      showStatus('Tarkista sähköpostiosoitteen muoto.', 'error');
      return false;
    }

    return true;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearStatus();

    if (!validateForm()) return;

    setLoading(true);

    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        showStatus(
          '✓ Viesti lähetetty! Palaamme sinulle pian.',
          'success'
        );
        form.reset();
        submitBtn.textContent = 'Lähetetty ✓';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
      } else {
        const data = await response.json().catch(() => ({}));
        const msg =
          data && data.errors
            ? data.errors.map(function (err) { return err.message; }).join(', ')
            : 'Lähetys epäonnistui. Kokeile soittaa tai laita sähköpostia.';
        showStatus(msg, 'error');
        setLoading(false);
      }
    } catch (err) {
      showStatus(
        'Yhteysvirhe. Tarkista verkkoyhteys tai ota yhteyttä puhelimitse.',
        'error'
      );
      setLoading(false);
    }
  });

  // Poista virheviesti kun käyttäjä alkaa kirjoittaa
  form.querySelectorAll('.form-input').forEach(function (input) {
    input.addEventListener('input', function () {
      if (statusEl.classList.contains('error')) {
        clearStatus();
      }
    });
  });
})();

/* ============================================
   AKTIIVINEN NAVIGOINTILINKKI – scroll-seuranta
   ============================================ */
(function initActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!sections.length || !navLinks.length) return;

  const navHeight = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-height'),
    10
  ) || 68;

  function updateActiveLink() {
    let currentId = '';

    sections.forEach(function (section) {
      const top = section.getBoundingClientRect().top;
      if (top <= navHeight + 60) {
        currentId = section.id;
      }
    });

    navLinks.forEach(function (link) {
      const href = link.getAttribute('href');
      if (href === '#' + currentId) {
        link.setAttribute('aria-current', 'true');
        link.style.color = '';
        link.classList.add('nav-link--active');
      } else {
        link.removeAttribute('aria-current');
        link.classList.remove('nav-link--active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();
})();

/* ============================================
   TRUST BAR – hover-efekti
   ============================================ */
(function initTrustBar() {
  const items = document.querySelectorAll('.trust-item');

  items.forEach(function (item) {
    item.addEventListener('mouseenter', function () {
      this.style.transform = 'translateY(-2px)';
      this.style.transition = 'transform 200ms ease';
    });

    item.addEventListener('mouseleave', function () {
      this.style.transform = '';
    });
  });
})();