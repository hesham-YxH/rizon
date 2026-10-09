/* RIZON — رايزن · interactions */
(function () {
  'use strict';
  var I = window.RIZON_I18N, CFG = window.RIZON_CONFIG || {};
  var html = document.documentElement;
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    sget: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    sset: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };
  var qp = new URLSearchParams(location.search).get('lang');
  var lang = (qp && I[qp]) ? qp : (I[store.get('rz-lang')] ? store.get('rz-lang') : 'ar');
  var T = I[lang];
  html.lang = lang; html.dir = lang === 'ar' ? 'rtl' : 'ltr';
  store.set('rz-lang', lang);
  var RTL = lang === 'ar';
  var reduced = html.classList.contains('reduced');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------------- copy */
  document.title = T['meta.title'];
  var md = $('meta[name="description"]'); if (md) md.setAttribute('content', T['meta.desc']);
  $$('[data-i]').forEach(function (el) { var v = T[el.getAttribute('data-i')]; if (v != null) el.innerHTML = v; });
  $$('[data-i-aria]').forEach(function (el) { var v = T[el.getAttribute('data-i-aria')]; if (v != null) el.setAttribute('aria-label', v); });
  $$('.yr').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------------------------------------------------------------- contact + whatsapp */
  var wa = CFG.whatsapp ? 'https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent(T['wa.msg']) : null;
  var toastEl = $('.toast'), toastT;
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 3800); }
  $$('[data-wa]').forEach(function (a) {
    if (wa) { a.href = wa; a.target = '_blank'; a.rel = 'noopener'; }
    else a.addEventListener('click', function () { toast(T['toast.wa']); });
  });
  var cl = $('.contact-list');
  if (cl) {
    var items = [];
    if (CFG.whatsapp) {
      var n = CFG.whatsapp.replace(/^(\d{2})(\d{3})(\d{3})(\d+)$/, '+$1 $2 $3 $4');
      items.push('<a class="ltr" href="' + wa + '" target="_blank" rel="noopener">' + n + '</a>');
    }
    if (CFG.email) items.push('<a class="ltr" href="mailto:' + CFG.email + '">' + CFG.email + '</a>');
    [['instagram', 'Instagram'], ['tiktok', 'TikTok'], ['facebook', 'Facebook'], ['linkedin', 'LinkedIn']].forEach(function (s) {
      if (CFG[s[0]]) items.push('<a class="ltr" href="' + CFG[s[0]] + '" target="_blank" rel="noopener">' + s[1] + '</a>');
    });
    cl.innerHTML = items.join('');
  }

  /* ---------------------------------------------------------------- language switch */
  var curtain = $('.curtain');
  $$('.lang').forEach(function (b) {
    b.addEventListener('click', function () {
      var next = lang === 'ar' ? 'en' : 'ar';
      store.set('rz-lang', next); store.sset('rz-switch', '1');
      var go = function () { location.href = location.pathname + '?lang=' + next; };
      if (window.gsap && !reduced) gsap.fromTo(curtain, { yPercent: 100 }, { yPercent: 0, duration: .7, ease: 'expo.inOut', onComplete: go });
      else go();
    });
  });

  /* ---------------------------------------------------------------- menu */
  var burger = $('.burger'), mmenu = $('.mmenu'), lenis = null;
  function setMenu(open) {
    html.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    mmenu.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (lenis) { open ? lenis.stop() : lenis.start(); }
  }
  burger.addEventListener('click', function () { setMenu(!html.classList.contains('menu-open')); });

  /* ---------------------------------------------------------------- anchors */
  function scrollToTarget(id) {
    var t = id === '#top' ? 0 : $(id);
    if (t === null) return;
    if (lenis) lenis.scrollTo(t, { duration: 1.5, easing: function (x) { return 1 - Math.pow(1 - x, 4); } });
    else if (t === 0) window.scrollTo({ top: 0 }); else t.scrollIntoView();
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id.length < 2) return;
    e.preventDefault();
    setMenu(false);
    scrollToTarget(id);
  });
  var tt = $('.to-top'); if (tt) tt.addEventListener('click', function () { scrollToTarget('#top'); });

  /* ---------------------------------------------------------------- tabs (works without gsap too) */
  var tabs = $$('.tab'), tp = $('.tp'), tabTimer, tabIdx = 1;
  function setTab(i, user) {
    tabIdx = i;
    tabs.forEach(function (t) { t.setAttribute('aria-selected', t.getAttribute('data-tab') == i ? 'true' : 'false'); });
    var txt = T['cl.p' + i];
    if (window.gsap && !reduced) {
      gsap.to(tp, { yPercent: -40, opacity: 0, duration: .3, ease: 'power2.in', onComplete: function () { tp.innerHTML = txt; gsap.fromTo(tp, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .6, ease: 'expo.out' }); } });
    } else tp.innerHTML = txt;
    if (user) clearInterval(tabTimer);
  }
  tabs.forEach(function (t) { t.addEventListener('click', function () { setTab(+t.getAttribute('data-tab'), true); }); });

  /* ---------------------------------------------------------------- motion */
  function ready(fn) { if (document.fonts && document.fonts.ready) document.fonts.ready.then(fn); else fn(); }

  ready(function () {
    if (!window.gsap || reduced) {
      $$('.rv').forEach(function (el) { el.style.opacity = 1; el.style.transform = 'none'; });
      var ld = $('.loader'); if (ld) ld.style.display = 'none';
      return;
    }
    gsap.registerPlugin(ScrollTrigger, SplitText);
    var mm = gsap.matchMedia();
    var fine = matchMedia('(hover:hover) and (pointer:fine)').matches;

    /* smooth scroll */
    lenis = new Lenis({ lerp: .09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    lenis.stop();

    /* header: hide on scroll down, solid after hero, theme by section */
    var hdr = $('.hdr');
    var lightSecs = $$('.light, .services, .clinics, .session, .foot');
    var climbLinks = $$('.climb a');
    var climbTargets = climbLinks.map(function (a) { return $(a.getAttribute('href')); });
    climbLinks.forEach(function (a, i) { a.style.width = (10 + i * 5) + 'px'; });
    lenis.on('scroll', function (e) {
      var y = e.scroll;
      hdr.classList.toggle('is-solid', y > 40);
      hdr.classList.toggle('is-hidden', e.direction === 1 && y > 300 && !html.classList.contains('menu-open'));
      var probe = 40, onLight = false;
      for (var i = 0; i < lightSecs.length; i++) { var r = lightSecs[i].getBoundingClientRect(); if (r.top <= probe && r.bottom > probe) { onLight = true; break; } }
      hdr.classList.toggle('on-light', onLight);
      var mid = innerHeight * .5, act = 0;
      climbTargets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top <= mid) act = i; });
      climbLinks.forEach(function (a, i) { a.classList.toggle('on', i <= act); });
    });

    /* cursor */
    if (fine) {
      var dot = $('.cursor'), ring = $('.cursor-ring');
      var dx = gsap.quickTo(dot, 'x', { duration: .12, ease: 'power3' }), dy = gsap.quickTo(dot, 'y', { duration: .12, ease: 'power3' });
      var rx = gsap.quickTo(ring, 'x', { duration: .45, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: .45, ease: 'power3' });
      addEventListener('pointermove', function (e) { html.classList.add('has-cursor'); dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
      document.addEventListener('pointerleave', function () { html.classList.remove('has-cursor'); });
      document.addEventListener('pointerover', function (e) {
        var t = e.target.closest('[data-cursor], a, button');
        ring.classList.toggle('is-hover', !!(t && t.hasAttribute('data-cursor')));
        gsap.to(ring, { scale: t && !t.hasAttribute('data-cursor') ? 1.4 : 1, duration: .3 });
      });
      /* magnetic */
      $$('[data-magnetic]').forEach(function (el) {
        el.addEventListener('pointermove', function (e) {
          var r = el.getBoundingClientRect();
          gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * .22, y: (e.clientY - r.top - r.height / 2) * .35, duration: .4, ease: 'power3' });
        });
        el.addEventListener('pointerleave', function () { gsap.to(el, { x: 0, y: 0, duration: .8, ease: 'elastic.out(1,.4)' }); });
      });
    }

    /* split reveals */
    function splitReveal(el, opts) {
      opts = opts || {};
      return SplitText.create(el, {
        type: 'lines,words', mask: 'lines', linesClass: 'line', autoSplit: true,
        onSplit: function (self) {
          return gsap.from(self.words, {
            yPercent: 115, duration: 1.15, ease: 'expo.out', stagger: opts.stagger || .045, delay: opts.delay || 0,
            scrollTrigger: opts.noTrigger ? null : { trigger: el, start: 'top 86%', once: true }, paused: !!opts.paused
          });
        }
      });
    }
    $$('[data-split]').forEach(function (el) { splitReveal(el); });

    /* generic reveals */
    gsap.set('.rv', { opacity: 0, y: 40 });
    ScrollTrigger.batch('.rv', { start: 'top 88%', once: true, onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: .12 }); } });

    /* ---------------- hero */
    var heroSplit = SplitText.create('.hero h1', { type: 'lines,words', mask: 'lines', linesClass: 'line' });
    gsap.set(heroSplit.words, { yPercent: 115 });
    gsap.set(['.hero .eyebrow', '.hero .lead', '.hero-ctas', '.scroll-hint'], { opacity: 0, y: 30 });
    gsap.set('.hs', { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set('.sun i', { yPercent: 60, opacity: 0 });
    gsap.set('.sun b', { xPercent: -50, yPercent: 12 });
    var heroIn = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } })
      .to('.hero-horizon', { scaleX: 1, duration: 1.6 }, 0)
      .to('.hs', { scaleY: 1, duration: 1.4, stagger: .08 }, 0)
      .to('.sun i', { yPercent: 0, opacity: 1, duration: 2.4 }, .2)
      .to('.sun b', { yPercent: -46, duration: 2.6 }, .3)
      .to(heroSplit.words, { yPercent: 0, duration: 1.2, stagger: .06 }, .25)
      .to(['.hero .eyebrow', '.hero .lead', '.hero-ctas', '.scroll-hint'], { opacity: 1, y: 0, duration: 1.2, stagger: .1 }, .55)
      .add(function () { lenis.start(); }, .6);

    /* hero scroll scrub */
    gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
      .to('.sun b', { yPercent: -82, ease: 'none' }, 0)
      .to('.sun i', { yPercent: -18, ease: 'none' }, 0)
      .to('.hero-stairs', { yPercent: -18, ease: 'none' }, 0)
      .to('.hero-in', { y: 120, opacity: .15, ease: 'none' }, 0);
    if (fine) {
      var hs = $('.hero-stairs'), sun = $('.sun');
      var hx = gsap.quickTo(hs, 'x', { duration: 1.2, ease: 'power3' }), sx = gsap.quickTo(sun, 'x', { duration: 1.6, ease: 'power3' }), sy = gsap.quickTo(sun, 'y', { duration: 1.6, ease: 'power3' });
      $('.hero').addEventListener('pointermove', function (e) {
        var px = e.clientX / innerWidth - .5, py = e.clientY / innerHeight - .5;
        hx(px * -30); sx(px * 40); sy(py * 20);
      });
    }

    /* ---------------- marquee (velocity reactive) */
    var mq = gsap.to('.marquee-track', { xPercent: -50, ease: 'none', duration: 34, repeat: -1 });
    ScrollTrigger.create({
      trigger: '.marquee', start: 'top bottom', end: 'bottom top',
      onUpdate: function (self) {
        var v = self.getVelocity() / 260, d = self.direction;
        gsap.timeline({ overwrite: true }).to(mq, { timeScale: d * (1 + Math.min(Math.abs(v), 6)), duration: .25 }).to(mq, { timeScale: d, duration: 1.2 });
      }
    });

    /* ---------------- manifesto */
    gsap.from('.man-bar', { scaleX: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.manifesto', start: 'top 70%', once: true } });
    gsap.to('.man-lines p', { color: '#F4F1EA', stagger: .6, ease: 'none', scrollTrigger: { trigger: '.man-lines', start: 'top 78%', end: 'bottom 45%', scrub: true } });
    gsap.fromTo('.man-big', { yPercent: 25 }, { yPercent: -10, ease: 'none', scrollTrigger: { trigger: '.manifesto', start: 'top bottom', end: 'bottom top', scrub: true } });

    /* ---------------- idea + rise (pinned on desktop) */
    mm.add('(min-width: 900px)', function () {
      gsap.set('.eq-result', { opacity: 0, scale: .82 });
      gsap.timeline({ scrollTrigger: { trigger: '.idea-stage', start: 'top top', end: '+=130%', pin: true, scrub: 1 } })
        .to('.eq .x', { color: '#2E2B28', duration: 1, stagger: .1 })
        .to('.eq .op', { opacity: 0, duration: .6 }, '<')
        .to('.eq', { scale: .62, opacity: .14, yPercent: -40, duration: 1 })
        .to('.eq-result', { opacity: 1, scale: 1, duration: 1, ease: 'power2.out' }, '<')
        .from('.idea-wm .zsun', { y: -260, duration: .8, ease: 'power2.out' }, '-=.4');

      var steps = $$('.step'), rc = $('.rc');
      gsap.set(steps, { clipPath: 'inset(100% 0% 0% 0%)' });
      gsap.set('.step .k, .step p', { opacity: 0, y: 24 });
      gsap.set('.sunbar', { yPercent: -100 });
      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.rise-stage', start: 'top top', end: '+=220%', pin: true, scrub: 1,
          onUpdate: function (self) { rc.textContent = '0' + Math.min(4, Math.floor(self.progress * 4.2) + 1); }
        }
      });
      steps.forEach(function (s, i) {
        tl.to(s, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power2.out' }, i)
          .to(s.querySelectorAll('.k, p'), { opacity: 1, y: 0, duration: .6, stagger: .15 }, i + .4);
      });
      tl.to('.sunbar', { yPercent: 0, duration: .6, ease: 'back.out(2)' }, 4.1).to({}, { duration: .4 });
      return function () { gsap.set('.eq-result, .step, .step .k, .step p, .sunbar', { clearProps: 'all' }); };
    });
    mm.add('(max-width: 899px)', function () {
      gsap.to('.eq .x', { color: '#2E2B28', scrollTrigger: { trigger: '.eq', start: 'top 70%', once: true }, duration: 1, stagger: .1 });
      gsap.from('.eq-result', { opacity: 0, scale: .85, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.eq-result', start: 'top 85%', once: true } });
      $$('.step').forEach(function (s) { gsap.from(s, { opacity: 0, y: 50, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: s, start: 'top 88%', once: true } }); });
      gsap.from('.sunbar', { yPercent: -100, duration: .8, ease: 'back.out(2)', scrollTrigger: { trigger: '.step[data-step="3"]', start: 'top 70%', once: true } });
    });

    /* ---------------- who: tilt cards */
    if (fine) $$('.pain').forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        gsap.to(c, { rotateY: px * 10, rotateX: -py * 10, transformPerspective: 900, duration: .5, ease: 'power3' });
      });
      c.addEventListener('pointerleave', function () { gsap.to(c, { rotateX: 0, rotateY: 0, duration: .8, ease: 'elastic.out(1,.5)' }); });
    });

    /* ---------------- services rows */
    gsap.set('.svc', { opacity: 0, y: 40 });
    ScrollTrigger.batch('.svc', { start: 'top 90%', once: true, onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: .08 }); } });

    /* ---------------- clinics */
    gsap.fromTo('.clin-card', { scale: .9, borderRadius: 64 }, { scale: 1, borderRadius: 36, ease: 'none', scrollTrigger: { trigger: '.clin-card', start: 'top 98%', end: 'top 30%', scrub: true } });
    gsap.fromTo('.clin-card .bgz', { yPercent: 20, rotate: -4 }, { yPercent: -10, rotate: 0, ease: 'none', scrollTrigger: { trigger: '.clin-card', start: 'top bottom', end: 'bottom top', scrub: true } });
    ScrollTrigger.create({ trigger: '.clin-card', start: 'top 60%', once: true, onEnter: function () { tabTimer = setInterval(function () { setTab(tabIdx % 3 + 1); }, 5200); } });

    /* ---------------- session */
    gsap.from('.ses-list li', { opacity: 0, x: RTL ? -30 : 30, duration: .9, ease: 'expo.out', stagger: .14, scrollTrigger: { trigger: '.ses-card', start: 'top 80%', once: true } });
    gsap.from('.ses-list li i', { scale: 0, duration: .7, ease: 'back.out(3)', stagger: .14, delay: .2, scrollTrigger: { trigger: '.ses-card', start: 'top 80%', once: true } });

    /* ---------------- promise strikes */
    $$('.pr-row').forEach(function (row) {
      gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 88%', end: 'top 55%', scrub: true } })
        .from(row.querySelector('.yes'), { opacity: .15, ease: 'none' }, 0)
        .to(row.querySelector('.no'), { '--s': 1, ease: 'none' }, 0);
    });

    /* ---------------- footer reveal */
    gsap.from('.foot .wrap', { yPercent: -18, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'top 20%', scrub: true } });

    /* ---------------- preloader */
    var loader = $('.loader');
    var fast = store.sget('rz-switch') === '1';
    store.sset('rz-switch', '');
    function startHero() { heroIn.play(); ScrollTrigger.refresh(); }
    if (fast) {
      loader.style.display = 'none';
      gsap.set(curtain, { yPercent: 0 });
      gsap.to(curtain, { yPercent: -100, duration: .9, ease: 'expo.inOut', delay: .05, onStart: function () { setTimeout(startHero, 250); } });
    } else {
      var lc = $('.lc'), cnt = { v: 0 };
      gsap.set('#lz-hz', { scaleX: 0, transformOrigin: RTL ? '100% 50%' : '0% 50%' });
      gsap.set('#lz-b', { scaleX: 0, transformOrigin: '0% 50%' });
      gsap.set(['#lz-s1', '#lz-s2', '#lz-s3'], { scaleY: 0, transformOrigin: '50% 100%' });
      gsap.set('#lz-sun', { y: 150 });
      gsap.timeline({ defaults: { ease: 'expo.out' } })
        .to(cnt, { v: 100, duration: 2.3, ease: 'power2.inOut', onUpdate: function () { lc.textContent = String(Math.round(cnt.v)).padStart(2, '0'); } }, 0)
        .to('#lz-hz', { scaleX: 1, duration: .8 }, .05)
        .to('#lz-b', { scaleX: 1, duration: .55 }, .3)
        .to('#lz-s1', { scaleY: 1, duration: .5 }, .62)
        .to('#lz-s2', { scaleY: 1, duration: .5 }, .82)
        .to('#lz-s3', { scaleY: 1, duration: .5 }, 1.02)
        .to('#lz-sun', { y: 0, duration: .9, ease: 'expo.out' }, 1.3)
        .to('#lz-hz', { opacity: 0, duration: .4 }, 1.6)
        .to('.lword', { opacity: 1, y: 0, duration: .8 }, 1.7)
        .fromTo('.lword', { y: 18 }, { y: 0, duration: .8 }, 1.7)
        .to(loader, { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, 2.55)
        .add(startHero, 2.85)
        .set(loader, { display: 'none' });
    }
  });
})();
