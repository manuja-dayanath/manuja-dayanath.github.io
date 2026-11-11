(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* ---------- Scroll reveal ---------- */
  var selectors = [
    '.section h2', '.section .lead', '.two-col > *', '.flow', '.feature', '.trio article',
    '.vision', '.advisor', '.pubs > li', '.pub-foot', '.awards article', '.cop', '.footer .wrap'
  ];
  var targets = Array.prototype.slice.call(document.querySelectorAll(selectors.join(',')));

  // stagger siblings so groups cascade in
  var counts = new Map();
  targets.forEach(function (el) {
    el.classList.add('reveal');
    var n = counts.get(el.parentNode) || 0;
    counts.set(el.parentNode, n + 1);
    el.style.setProperty('--d', Math.min(n, 4) * 0.1 + 's');
  });

  if (reduce || !hasIO) {
    targets.forEach(function (el) { el.classList.add('in'); });
  } else {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          revealer.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (el) { revealer.observe(el); });
  }

  /* ---------- Progress bar and nav shadow ---------- */
  var bar = document.querySelector('.progress');
  var nav = document.querySelector('.nav');
  var ticking = false;
  function update() {
    var d = document.documentElement;
    var max = d.scrollHeight - d.clientHeight;
    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? d.scrollTop / max : 0) + ')';
    if (nav) nav.classList.toggle('scrolled', d.scrollTop > 8);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', update);
  update();

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector('.nav-toggle');
  function setMenu(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (toggle) {
    toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
    document.querySelectorAll('.nav nav a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    document.addEventListener('click', function (e) { if (nav.classList.contains('open') && !nav.contains(e.target)) setMenu(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 760) setMenu(false); });
  }

  /* ---------- Active section in nav ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav nav a[href^="#"]'));
  var order = links.map(function (a) {
    return { a: a, el: document.getElementById(a.getAttribute('href').slice(1)) };
  }).filter(function (x) { return x.el; });
  function spy() {
    var line = window.innerHeight * 0.35, current = null;
    order.forEach(function (x) {
      if (x.el.getBoundingClientRect().top <= line) current = x;
    });
    order.forEach(function (x) { x.a.classList.toggle('active', x === current); });
  }
  window.addEventListener('scroll', function () { requestAnimationFrame(spy); }, { passive: true });
  window.addEventListener('resize', spy);
  spy();
})();
