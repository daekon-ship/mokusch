/* ═══════════════════════════════════════════════════════════
   MÓKUSCH — interakciók
   reveal · parallax · cursor · magnet · nav · tortarendelés
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var doc = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };

  /* ── Intro ─────────────────────────────────────────────── */
  function boot() {
    doc.body.classList.remove('is-loading');
    doc.body.classList.add('is-ready');
    var intro = $('#intro');
    if (!intro) return;
    window.setTimeout(function () {
      intro.classList.add('is-done');
      window.setTimeout(function () { intro.setAttribute('hidden', ''); }, 900);
    }, reduce ? 0 : 1000);
  }
  if (doc.readyState === 'complete') { boot(); }
  else { window.addEventListener('load', boot); window.setTimeout(boot, 2200); }

  /* ── Header + aktív navigáció ──────────────────────────── */
  var header = $('#siteHeader');
  var lastY = 0;
  function onScrollHeader() {
    var y = window.pageYOffset;
    header.classList.toggle('is-scrolled', y > 60);
    if (y < 240) navLinks.forEach(function (a) { a.classList.remove('is-active'); });
    lastY = y;
  }

  var navLinks = $$('[data-nav]');
  if ('IntersectionObserver' in window && navLinks.length) {
    var secs = navLinks.map(function (a) { return doc.getElementById(a.getAttribute('href').slice(1)); }).filter(Boolean);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(function (s) { io.observe(s); });
  }

  /* ── Mobil menü ────────────────────────────────────────── */
  var burger = $('#burger');
  var menu = $('#mobileMenu');
  function setMenu(open) {
    if (!menu) return;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Menü bezárása' : 'Menü megnyitása');
    if (open) {
      menu.hidden = false;
      doc.body.classList.add('is-locked');
      window.requestAnimationFrame(function () { menu.classList.add('is-open'); });
    } else {
      menu.classList.remove('is-open');
      doc.body.classList.remove('is-locked');
      window.setTimeout(function () { menu.hidden = true; }, 700);
    }
  }
  if (burger) {
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') { setMenu(false); burger.focus(); }
    });
  }

  /* ── Reveal ────────────────────────────────────────────── */
  var revealEls = $$('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); ro.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { ro.observe(el); });
  }

  /* ── Parallax + görgetés-alapú munka (rAF) ────────────── */
  var pxEls = $$('[data-parallax]').map(function (el) {
    return { el: el, f: parseFloat(el.getAttribute('data-parallax')) || 0 };
  }).filter(function (o) { return o.f !== 0; });
  var ticking = false;

  function frame() {
    ticking = false;
    var vh = window.innerHeight;
    if (!reduce) {
      for (var i = 0; i < pxEls.length; i++) {
        var o = pxEls[i];
        var r = o.el.getBoundingClientRect();
        if (r.bottom < -240 || r.top > vh + 240) continue;
        var p = (r.top + r.height / 2 - vh / 2) / vh;
        if (p < -1.4) p = -1.4; else if (p > 1.4) p = 1.4;
        o.el.style.transform = 'translate3d(0,' + (p * o.f * 170).toFixed(2) + 'px,0)';
      }
    }
    onScrollHeader();
    stickyCta();
  }
  function request() { if (!ticking) { ticking = true; window.requestAnimationFrame(frame); } }
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);

  /* ── Sticky mobil CTA ──────────────────────────────────── */
  var sticky = $('#stickyCta');
  var orderSec = $('#rendeles');
  function stickyCta() {
    if (!sticky) return;
    var past = window.pageYOffset > window.innerHeight * 0.85;
    var inOrder = false;
    if (orderSec) {
      var r = orderSec.getBoundingClientRect();
      inOrder = r.top < window.innerHeight * 0.75 && r.bottom > 140;
    }
    sticky.classList.toggle('is-on', past && !inOrder);
  }

  /* ── Hero: képcsere + egér-mélység ────────────────────── */
  var heroImgs = $$('[data-hero-img]');
  if (heroImgs.length > 1 && !reduce) {
    var hi = 0;
    window.setInterval(function () {
      heroImgs[hi].classList.remove('is-active');
      hi = (hi + 1) % heroImgs.length;
      heroImgs[hi].classList.add('is-active');
    }, 7200);
  }
  var depthEls = $$('[data-depth]');
  if (depthEls.length && fine && !reduce) {
    var hero = $('.hero');
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!raf) raf = window.requestAnimationFrame(loopDepth);
    });
    hero.addEventListener('mouseleave', function () { tx = 0; ty = 0; });
    function loopDepth() {
      cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
      depthEls.forEach(function (el) {
        var d = parseFloat(el.getAttribute('data-depth')) || 10;
        el.style.marginLeft = (-cx * d).toFixed(2) + 'px';
        el.style.marginTop = (-cy * d * 0.7).toFixed(2) + 'px';
      });
      raf = (Math.abs(cx - tx) > 0.001 || Math.abs(cy - ty) > 0.001)
        ? window.requestAnimationFrame(loopDepth) : null;
    }
  }

  /* ── Egyéni kurzor ─────────────────────────────────────── */
  var cursor = $('.cursor');
  if (cursor && fine && !reduce) {
    var cLabel = $('.cursor__label', cursor);
    var mx = 0, my = 0, cxs = 0, cys = 0, active = false;
    doc.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (!active) { active = true; cxs = mx; cys = my; cursor.classList.add('is-on'); }
    });
    doc.addEventListener('mouseleave', function () { cursor.classList.remove('is-on'); active = false; });
    (function loopCursor() {
      cxs += (mx - cxs) * 0.2; cys += (my - cys) * 0.2;
      cursor.style.transform = 'translate3d(' + cxs.toFixed(1) + 'px,' + cys.toFixed(1) + 'px,0)';
      window.requestAnimationFrame(loopCursor);
    })();
    doc.addEventListener('mouseover', function (e) {
      var labelled = e.target.closest('[data-cursor]');
      var interactive = e.target.closest('a,button,label,input,select,textarea,summary');
      cursor.classList.toggle('is-label', !!labelled);
      cursor.classList.toggle('is-big', !labelled && !!interactive);
      if (labelled) cLabel.textContent = labelled.getAttribute('data-cursor') || '';
    });
  }

  /* ── Mágneses gombok ───────────────────────────────────── */
  if (fine && !reduce) {
    $$('[data-magnetic]').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - r.left - r.width / 2) * 0.22;
        var dy = (e.clientY - r.top - r.height / 2) * 0.3;
        el.style.transform = 'translate3d(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px,0)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ── Nyitvatartás: ma ──────────────────────────────────── */
  (function hours() {
    var list = $('#hoursList');
    if (!list) return;
    var now = new Date();
    var day = now.getDay();
    var row = list.querySelector('[data-day="' + day + '"]');
    if (row) {
      row.classList.add('is-today');
      var dd = row.querySelector('dd').textContent.trim().split('–');
      var mins = now.getHours() * 60 + now.getMinutes();
      var open = parseInt(dd[0].split(':')[0], 10) * 60 + parseInt(dd[0].split(':')[1], 10);
      var close = parseInt(dd[1].split(':')[0], 10) * 60 + parseInt(dd[1].split(':')[1], 10);
      var out = $('#hoursNow');
      if (out) {
        out.hidden = false;
        out.textContent = mins >= open && mins < close
          ? 'Ma nyitva vagyunk — gyere be.'
          : (mins < open ? 'Ma ' + dd[0] + '-kor nyitunk.' : 'Ma zárva vagyunk — holnap ' + (day === 6 ? '09:00-kor' : '07:30-kor') + ' jövünk.');
      }
    }
    var y = $('#year');
    if (y) y.textContent = String(new Date().getFullYear());
  })();

  /* ── Lightbox ──────────────────────────────────────────── */
  (function lightbox() {
    var triggers = $$('[data-cursor="Nagyítás"]');
    if (!triggers.length) return;
    var ov = doc.createElement('div');
    ov.className = 'lightbox';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-label', 'Képnagyítás');
    ov.hidden = true;
    ov.innerHTML =
      '<button class="lightbox__close" type="button" aria-label="Bezárás">✕</button>' +
      '<button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="Előző kép">&#8592;</button>' +
      '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button class="lightbox__nav lightbox__nav--next" type="button" aria-label="Következő kép">&#8594;</button>';
    doc.body.appendChild(ov);
    var img = $('img', ov), cap = $('figcaption', ov);
    var idx = 0, opener = null;

    /* a legnagyobb, ténylegesen elérhető srcset-változat (max. 1800) */
    function bestSrc(source) {
      var best = null, fallback = null;
      (source.getAttribute('srcset') || '').split(',').forEach(function (part) {
        var bits = part.trim().split(/\s+/);
        if (!bits[0]) return;
        var w = bits[1] ? parseInt(bits[1], 10) || 0 : 0;
        if (!fallback || w > fallback.w) fallback = { w: w, url: bits[0] };
        if (w > 0 && w <= 1800 && (!best || w > best.w)) best = { w: w, url: bits[0] };
      });
      var pick = best || fallback;
      if (!pick) return source.currentSrc || source.src;
      return new URL(pick.url, window.location.href).href;
    }
    function show(i) {
      idx = (i + triggers.length) % triggers.length;
      var t = triggers[idx];
      var source = $('img', t);
      if (!source) return;
      img.src = bestSrc(source);
      img.alt = source.alt || '';
      var fc = t.querySelector('figcaption');
      cap.textContent = fc ? fc.textContent : '';
    }
    function open(i) {
      opener = doc.activeElement;
      show(i);
      ov.hidden = false;
      doc.body.classList.add('is-locked');
      window.requestAnimationFrame(function () { ov.classList.add('is-open'); });
      $('.lightbox__close', ov).focus();
    }
    function close() {
      ov.classList.remove('is-open');
      doc.body.classList.remove('is-locked');
      window.setTimeout(function () { ov.hidden = true; }, 320);
      if (opener && opener.focus) opener.focus();
    }
    triggers.forEach(function (t, i) {
      t.setAttribute('tabindex', '0');
      t.setAttribute('role', 'button');
      t.addEventListener('click', function () { open(i); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
      });
    });
    $('.lightbox__close', ov).addEventListener('click', close);
    $('.lightbox__nav--prev', ov).addEventListener('click', function () { show(idx - 1); });
    $('.lightbox__nav--next', ov).addEventListener('click', function () { show(idx + 1); });
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    doc.addEventListener('keydown', function (e) {
      if (ov.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(idx + 1);
      if (e.key === 'ArrowLeft') show(idx - 1);
    });
  })();

  /* ══ Tortarendelés — 8 lépéses folyamat ═══════════════ */
  (function order() {
    var form = $('#orderForm');
    if (!form) return;

    var panels = $$('.opanel[data-step]', form);
    var total = panels.length;
    var step = 1;
    var maxStep = 1;
    var back = $('#orderBack'), next = $('#orderNext'), send = $('#orderSend');
    var bar = $('#orderBar'), cur = $('#orderCurrent'), label = $('#orderLabel');
    var live = $('#orderLive');
    var stepnav = $('.order__stepnav', form);
    var done = $('#orderDone');

    /* dátum: legkorábbi megengedett = ma + 5 nap */
    var dateInput = $('#datum');
    function iso(d) { return d.toISOString().slice(0, 10); }
    var minDate = new Date(); minDate.setDate(minDate.getDate() + 5);
    if (dateInput) {
      dateInput.min = iso(minDate);
      $$('[data-quick-dates] .ghost-tag').forEach(function (b) {
        b.addEventListener('click', function () {
          var d = new Date(); d.setDate(d.getDate() + parseInt(b.getAttribute('data-days'), 10));
          dateInput.value = iso(d);
          clearError(dateInput);
        });
      });
      dateInput.addEventListener('change', function () { clearError(dateInput); });
    }

    /* lépés-jelölők */
    var dots = [];
    panels.forEach(function (p, i) {
      var b = doc.createElement('button');
      b.type = 'button';
      b.className = 'stepdot';
      b.textContent = (i + 1) + ' · ' + p.getAttribute('data-label');
      b.addEventListener('click', function () { if (i + 1 <= maxStep) go(i + 1); });
      stepnav.appendChild(b);
      dots.push(b);
    });

    function panel(n) { return panels[n - 1]; }
    function showError(key, on) {
      var e = form.querySelector('[data-error-for="' + key + '"]');
      if (e) e.hidden = !on;
    }
    function clearError(input) {
      if (!input) return;
      input.classList.remove('is-invalid');
      var name = input.getAttribute('name');
      if (name) showError(name, false);
      var grp = input.closest('[data-required-group]');
      if (grp) { var k = $('input', grp).getAttribute('name'); showError(k, false); }
    }
    form.addEventListener('change', function (e) { clearError(e.target); });

    function validate(n) {
      var p = panel(n);
      var ok = true;
      if (n === 1) {
        var a = $('input[name="alkalom"]:checked', p);
        showError('alkalom', !a); if (!a) ok = false;
      }
      if (n === 2) {
        var v = dateInput.value;
        var bad = !v || v < dateInput.min;
        dateInput.classList.toggle('is-invalid', bad);
        showError('datum', bad); if (bad) ok = false;
      }
      if (n === 3) {
        var m = $('input[name="meret"]:checked', p);
        showError('meret', !m); if (!m) ok = false;
      }
      if (n === 4) {
        var iz = $$('input[name="iz"]:checked', p);
        showError('iz', !iz.length); if (!iz.length) ok = false;
      }
      if (n === 6 && files.length) {
        var badFile = files.some(function (f) { return !f.ok; });
        showError('referencia', badFile); if (badFile) ok = false;
      }
      if (n === 7) {
        var nev = $('#nev'), email = $('#email'), tel = $('#telefon'), hoz = $('#hogoz');
        var eOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
        email.classList.toggle('is-invalid', !eOk); showError('email', !eOk);
        var nOk = nev.value.trim().length > 1;
        nev.classList.toggle('is-invalid', !nOk); showError('nev', !nOk);
        var tOk = !tel.value.trim() || /^[+\d][\d\s()-]{5,}$/.test(tel.value.trim());
        tel.classList.toggle('is-invalid', !tOk); showError('telefon', !tOk);
        showError('hozzajarulas', !hoz.checked);
        ok = eOk && nOk && tOk && hoz.checked;
      }
      if (n === 8) {
        var okBox = $('#ok');
        showError('ok', !okBox.checked); if (!okBox.checked) ok = false;
      }
      if (!ok) {
        var firstErr = p.querySelector('.field-error:not([hidden])');
        if (firstErr) {
          var field = p.querySelector('.is-invalid, input:invalid');
          if (field && field.focus) field.focus({ preventScroll: false });
        }
        if (live) live.textContent = 'Van még kitöltendő mező ezen a lépésen.';
      }
      return ok;
    }

    function buildSummary() {
      var data = [
        ['Alkalom', (form.querySelector('input[name="alkalom"]:checked') || {}).value],
        ['Dátum', dateInput.value ? new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(dateInput.value + 'T12:00:00')) : ''],
        ['Méret', (form.querySelector('input[name="meret"]:checked') || {}).value],
        ['Ízvilág', $$('input[name="iz"]:checked', form).map(function (i) { return i.value; }).join(', ')],
        ['Elképzelés', $('#elkepzeles').value.trim()],
        ['Referencia', files.length ? files.length + ' kép' : 'nincs'],
        ['Név', $('#nev').value.trim()],
        ['E-mail', $('#email').value.trim()],
        ['Telefon', $('#telefon').value.trim() || '—'],
        ['Átvétel', $('#atvetel').value]
      ];
      var dl = $('#orderSummary');
      dl.innerHTML = '';
      data.forEach(function (row) {
        if (!row[1]) return;
        var wrap = doc.createElement('div');
        wrap.className = 'summary__row';
        var dt = doc.createElement('dt'); dt.textContent = row[0];
        var dd = doc.createElement('dd'); dd.textContent = row[1];
        wrap.appendChild(dt); wrap.appendChild(dd);
        dl.appendChild(wrap);
      });
    }

    function go(n) {
      step = n;
      panels.forEach(function (p, i) {
        var on = (i + 1) === n;
        p.classList.toggle('is-active', on);
        if (on) p.removeAttribute('hidden'); else p.setAttribute('hidden', '');
      });
      if (done) { done.hidden = true; done.classList.remove('is-active'); }
      back.disabled = n === 1;
      next.hidden = n === total; send.hidden = n !== total;
      next.querySelector('span').textContent = n === total - 1 ? 'Áttekintés' : 'Tovább';
      bar.style.width = (n / total * 100) + '%';
      cur.textContent = String(n);
      label.textContent = panel(n).getAttribute('data-label');
      dots.forEach(function (d, i) {
        d.classList.toggle('is-current', i + 1 === n);
        d.classList.toggle('is-done', i + 1 < n);
      });
      if (n === total) buildSummary();
      if (live) live.textContent = n + '. lépés: ' + panel(n).getAttribute('data-label');
      var shell = $('.order__shell');
      if (shell && window.pageYOffset > shell.getBoundingClientRect().top + window.pageYOffset - 140) {
        window.scrollTo({ top: shell.getBoundingClientRect().top + window.pageYOffset - 130, behavior: reduce ? 'auto' : 'smooth' });
      }
    }

    next.addEventListener('click', function () {
      if (!validate(step)) return;
      if (step < total) { maxStep = Math.max(maxStep, step + 1); go(step + 1); }
    });
    back.addEventListener('click', function () { if (step > 1) go(step - 1); });

    /* fájlok */
    var files = [];
    var input = $('#referencia');
    var list = $('#fileList');
    function renderFiles() {
      list.innerHTML = '';
      files.forEach(function (f, i) {
        var li = doc.createElement('li');
        li.className = 'file-pill';
        var im = doc.createElement('img'); im.src = f.url; im.alt = '';
        var sp = doc.createElement('span'); sp.textContent = f.name;
        var rm = doc.createElement('button');
        rm.type = 'button'; rm.textContent = '×';
        rm.setAttribute('aria-label', f.name + ' eltávolítása');
        rm.addEventListener('click', function () { files.splice(i, 1); renderFiles(); });
        li.appendChild(im); li.appendChild(sp); li.appendChild(rm);
        list.appendChild(li);
      });
    }
    function addFiles(fl) {
      Array.prototype.slice.call(fl).forEach(function (f) {
        if (files.length >= 3) return;
        files.push({
          name: f.name,
          url: f.type.indexOf('image/') === 0 ? URL.createObjectURL(f) : '',
          ok: f.type.indexOf('image/') === 0 && f.size <= 8 * 1024 * 1024
        });
      });
      showError('referencia', files.some(function (f) { return !f.ok; }));
      renderFiles();
    }
    if (input) {
      input.addEventListener('change', function () { addFiles(input.files); input.value = ''; });
      var zone = $('#dropZone');
      ['dragenter', 'dragover'].forEach(function (ev) {
        zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.add('is-over'); });
      });
      ['dragleave', 'drop'].forEach(function (ev) {
        zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.remove('is-over'); });
      });
      zone.addEventListener('drop', function (e) { if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files); });
    }

    /* karakter-számláló */
    var ta = $('#elkepzeles'), counter = $('#elkepzelesCount');
    if (ta && counter) {
      ta.addEventListener('input', function () { counter.textContent = String(ta.value.length); });
    }

    /* küldés (szimulált) */
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(8)) return;
      panels.forEach(function (p) { p.classList.remove('is-active'); p.setAttribute('hidden', ''); });
      $('#orderSummary').innerHTML = '';
      $('.order__nav', form).hidden = true;
      stepnav.hidden = true;
      $('.order__progress').hidden = true;
      done.hidden = false;
      done.classList.add('is-active');
      bar.style.width = '100%';
      if (live) live.textContent = 'Az ajánlatkérés elküldve. Köszönjük!';
      done.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    });

    var reset = $('#orderReset');
    if (reset) {
      reset.addEventListener('click', function () {
        form.reset();
        files = []; renderFiles();
        $('.order__nav', form).hidden = false;
        stepnav.hidden = false;
        $('.order__progress').hidden = false;
        maxStep = 1;
        $$('.field-error', form).forEach(function (e) { e.hidden = true; });
        $$('.is-invalid', form).forEach(function (e) { e.classList.remove('is-invalid'); });
        go(1);
      });
    }

    go(1);
  })();

  /* ── Sima horgony-görgetés fejléc-eltolással ──────────── */
  doc.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id === '#' || id.length < 2) return;
    var t = doc.querySelector(id);
    if (!t) return;
    e.preventDefault();
    var top = t.getBoundingClientRect().top + window.pageYOffset - (id === '#top' ? 0 : 78);
    window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    if (history.replaceState) history.replaceState(null, '', id);
  });

  /* ── Térkép: csak kattintásra tölt be ─────────────────── */
  (function mapFacade() {
    var btn = $('#mapFacade');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var box = btn.parentNode;
      var fr = doc.createElement('iframe');
      fr.title = 'Térkép — Mókusch, Várfok utca 30., Budapest';
      fr.src = btn.getAttribute('data-map');
      fr.loading = 'lazy';
      fr.referrerPolicy = 'no-referrer-when-downgrade';
      fr.setAttribute('allowfullscreen', '');
      box.replaceChildren(fr);
    });
  })();

  frame();
})();
