(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* ---------- Scroll reveal ---------- */
  var selectors = [
    '.section h2', '.section .lead', '.two-col > *', '.flow', '.feature', '.trio article',
    '.vision', '.pubs > li', '.pub-foot', '.awards article', '.cop', '.footer .wrap'
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

  /* ---------- Active section in nav ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav nav a[href^="#"]'));
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
  if (hasIO) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('active'); });
        var a = byId[e.target.id];
        if (a) a.classList.add('active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { spy.observe(s); });
  }
})();
