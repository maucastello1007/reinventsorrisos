// ===== Reinvent Sorrisos — interações da LP =====
(function () {
  'use strict';

  // ---- nav background on scroll ----
  var nav = document.getElementById('nav');
  var floatCta = document.getElementById('floatCta');
  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle('scrolled', y > 24);
    if (floatCta) floatCta.classList.toggle('show', y > 760);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- scroll reveal (rect-based, robust in preview iframes) ----
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  function checkReveals() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    for (var i = reveals.length - 1; i >= 0; i--) {
      var el = reveals[i];
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) {
        el.classList.add('in');
        reveals.splice(i, 1);
      }
    }
  }
  window.addEventListener('scroll', checkReveals, { passive: true });
  window.addEventListener('resize', checkReveals);
  checkReveals();
  requestAnimationFrame(checkReveals);
  // failsafe: if transitions are throttled (background/inactive tab) and never
  // advance, snap any still-hidden element straight to its final state.
  setTimeout(function () {
    document.querySelectorAll('.reveal:not(.snapped)').forEach(function (el) {
      var cs = getComputedStyle(el);
      if (cs.opacity !== '1') {
        el.style.transition = 'none';
        el.classList.add('in', 'snapped');
      }
    });
  }, 1400);

  // ---- period toggle (manhã / tarde pricing) ----
  var toggle = document.getElementById('periodToggle');
  if (toggle) {
    var btns = toggle.querySelectorAll('button');
    var vals = document.querySelectorAll('.plan .p-price .val');
    function setPeriod(period) {
      btns.forEach(function (b) { b.classList.toggle('active', b.dataset.period === period); });
      vals.forEach(function (v) {
        var target = v.getAttribute('data-' + period);
        if (target == null) return;
        animateNumber(v, parseInt(v.textContent.replace(/\D/g, ''), 10) || 0, parseInt(target, 10));
      });
    }
    btns.forEach(function (b) {
      b.addEventListener('click', function () { setPeriod(b.dataset.period); });
    });
  }

  function animateNumber(el, from, to) {
    if (from === to) { el.textContent = to; return; }
    var start = null, dur = 380;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    // guarantee final value even if rAF is throttled (background/inactive tab)
    setTimeout(function () { el.textContent = to; }, dur + 60);
  }

  // ---- FAQ accordion ----
  var faq = document.getElementById('faq');
  if (faq) {
    faq.querySelectorAll('.faq-item').forEach(function (item) {
      var q = item.querySelector('.faq-q');
      var a = item.querySelector('.faq-a');
      q.addEventListener('click', function () {
        var isOpen = item.classList.contains('open');
        faq.querySelectorAll('.faq-item.open').forEach(function (other) {
          if (other !== item) {
            other.classList.remove('open');
            other.querySelector('.faq-a').style.maxHeight = null;
          }
        });
        if (isOpen) {
          item.classList.remove('open');
          a.style.maxHeight = null;
        } else {
          item.classList.add('open');
          a.style.maxHeight = a.scrollHeight + 'px';
        }
      });
    });
    window.addEventListener('resize', function () {
      var open = faq.querySelector('.faq-item.open .faq-a');
      if (open) open.style.maxHeight = open.scrollHeight + 'px';
    });
  }
  // ---- carousel: Nossa Estrutura ----
  var track = document.getElementById('carTrack');
  if (track) {
    var slides = Array.prototype.slice.call(track.children);
    var dotsWrap = document.getElementById('carDots');
    var prev = document.getElementById('carPrev');
    var next = document.getElementById('carNext');
    var dots = [];
    slides.forEach(function (s, i) {
      var b = document.createElement('button');
      b.setAttribute('aria-label', 'Ir para foto ' + (i + 1));
      b.addEventListener('click', function () { scrollToSlide(i); });
      dotsWrap.appendChild(b);
      dots.push(b);
    });
    function slideStep() {
      if (slides.length < 2) return slides[0].offsetWidth;
      return slides[1].getBoundingClientRect().left - slides[0].getBoundingClientRect().left;
    }
    function currentIndex() {
      var center = track.scrollLeft + track.clientWidth / 2;
      var best = 0, bestDist = Infinity;
      slides.forEach(function (s, i) {
        var c = s.offsetLeft + s.offsetWidth / 2;
        var d = Math.abs(c - center);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      return best;
    }
    function scrollToSlide(i) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      var s = slides[i];
      track.scrollTo({ left: s.offsetLeft - (track.clientWidth - s.offsetWidth) / 2, behavior: 'smooth' });
    }
    function syncDots() {
      var idx = currentIndex();
      dots.forEach(function (d, i) { d.classList.toggle('active', i === idx); });
    }
    prev.addEventListener('click', function () { stopAuto(); scrollToSlide(currentIndex() - 1); });
    next.addEventListener('click', function () { stopAuto(); scrollToSlide(currentIndex() + 1); });
    var st;
    track.addEventListener('scroll', function () {
      clearTimeout(st);
      st = setTimeout(syncDots, 60);
    }, { passive: true });
    syncDots();

    // gentle autoplay (setInterval survives rAF throttling); pause on interaction
    var auto = setInterval(function () {
      var idx = currentIndex();
      scrollToSlide(idx >= slides.length - 1 ? 0 : idx + 1);
    }, 4500);
    function stopAuto() { clearInterval(auto); }
    ['pointerdown', 'wheel', 'touchstart', 'mouseenter'].forEach(function (ev) {
      track.addEventListener(ev, stopAuto, { passive: true });
    });
  }
})();
