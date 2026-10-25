/* Capítulo II: línea temporal con tres decisiones; cada punto abre una trayectoria en espiral hacia una línea que no ocurrió */
(function () {
  var svg = document.getElementById('linea');
  if (!svg) return;
  var cap = document.getElementById('l-cap');
  var NS = 'http://www.w3.org/2000/svg';
  var Y = 64, DX = 36, DY = 70;

  // Rama caótica: el centro avanza hacia el destino mientras el punto gira en espiral, con radio que crece y se apaga
  // (como una vuelta del ala de Lorenz). Parte exactamente del punto y termina exactamente en el destino.
  function spiral(x0, y0, x1, y1, loops, phase, amp) {
    var d = '', N = 140;
    for (var i = 0; i <= N; i++) {
      var t = i / N, env = Math.pow(Math.sin(Math.PI * t), 0.85) * (1 + 0.28 * Math.sin(5.1 * Math.PI * t + phase));
      var a = 2 * Math.PI * loops * t + phase;
      var cx = x0 + (x1 - x0) * t, cy = y0 + (y1 - y0) * t;
      var x = cx + amp * env * Math.cos(a), y = cy + amp * 0.72 * env * Math.sin(a);
      d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    return d;
  }
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function el(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    (parent || svg).appendChild(e);
    return e;
  }
  function label(parent, cls, x, y, text) {
    var t = el('text', { 'class': cls, x: x, y: y, 'text-anchor': 'middle' }, parent);
    t.textContent = text;
    return t;
  }

  var main = el('line', { 'class': 'tl-main', x1: 10, y1: Y, x2: 350, y2: Y, pathLength: 1 });
  var pts = [
    { x: 52, q: '¿Y si te recojo?', alt: 'Quedarme en casa', loops: 2.5, phase: 0.6, amp: 15 },
    { x: 168, q: 'Entrar a casa de Karen', alt: 'Dejarla en la puerta', loops: 3, phase: 2.1, amp: 16 },
    { x: 284, q: '¿Y si me quedo?', alt: 'Volver a casa', loops: 2, phase: 4.0, amp: 14 }
  ];
  var groups = [];
  // Cada punto aparece justo cuando la línea (1,6 s, ease-in-out) llega a él, no antes
  function bez(t, a, b) { return 3 * a * t * (1 - t) * (1 - t) + 3 * b * t * t * (1 - t) + t * t * t; }
  function reach(frac) {
    var lo = 0, hi = 1;
    for (var i = 0; i < 30; i++) { var m = (lo + hi) / 2; if (bez(m, 0, 1) < frac) lo = m; else hi = m; }
    var s = (lo + hi) / 2; return 1.6 * bez(s, 0.42, 0.58);
  }

  pts.forEach(function (p) {
    var g = el('g', { 'class': 'tl-pt', tabindex: 0, role: 'button', 'aria-pressed': 'false', 'aria-label': p.q + ': abrir otra línea temporal' });
    var ex = p.x + DX, ey = Y + DY;
    g.style.transitionDelay = Math.max(0, reach((p.x - 10) / 340) - 0.08).toFixed(2) + 's';
    var br = el('path', { 'class': 'tl-br', d: spiral(p.x, Y, ex, ey, p.loops, p.phase, p.amp), pathLength: 1 }, g);
    el('circle', { 'class': 'tl-end', cx: ex, cy: ey, r: 3.6 }, g);
    label(g, 'tl-alt', ex, ey + 20, p.alt);
    el('circle', { 'class': 'hit', cx: p.x, cy: Y, r: 17, fill: 'transparent' }, g);
    el('circle', { 'class': 'dot', cx: p.x, cy: Y, r: 5 }, g);
    label(g, 'tl-q', p.x, Y - 16, p.q);

    var raf = 0, prog = 0;
    function go(to) {
      cancelAnimationFrame(raf);
      var from = prog, t0 = null, dur = 1200;
      function set(v) { prog = v; br.style.strokeDashoffset = String(1 - v); }
      if (still) { set(to); return; }
      function frame(t) {
        if (t0 === null) t0 = t;
        var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        set(from + (to - from) * e);
        if (k < 1) raf = requestAnimationFrame(frame);
      }
      raf = requestAnimationFrame(frame);
    }
    function toggle() {
      var on = !g.classList.contains('open');
      g.classList.toggle('open', on);
      g.setAttribute('aria-pressed', on ? 'true' : 'false');
      go(on ? 1 : 0);
      var n = svg.querySelectorAll('.tl-pt.open').length;
      cap.textContent = n === 0
        ? 'Toca un punto para abrir otra línea temporal.'
        : (n === 1 ? 'Una línea temporal nueva, una que no ocurrió.' : n + ' líneas temporales que no ocurrieron.');
    }
    g.addEventListener('click', toggle);
    g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    groups.push(g);
  });

  setTimeout(function () { svg.closest('figure').classList.add('ready'); }, 150);
})();

/* Itinerario: el avión recorre dos veces la trayectoria de Cúcuta a Bogotá y se queda a la mitad */
(function () {
  var arc = document.querySelector('.tk-arc'), plane = document.querySelector('.tk-plane'), ticket = document.querySelector('.ticket');
  if (!arc || !plane || !ticket) return;
  var L = arc.getTotalLength(), raf = 0, played = false;
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function place(t) {
    var p = arc.getPointAtLength(L * t), q = arc.getPointAtLength(Math.min(L, L * t + 0.5)), r = arc.getPointAtLength(Math.max(0, L * t - 0.5));
    var ang = Math.atan2(q.y - r.y, q.x - r.x) * 180 / Math.PI;
    plane.setAttribute('transform', 'translate(' + p.x.toFixed(2) + ' ' + p.y.toFixed(2) + ') rotate(' + ang.toFixed(1) + ')');
  }
  place(0.5);
  if (still) return;

  var legs = [{ to: 1, dur: 2400 }, { to: 1, dur: 2400 }, { to: 0.5, dur: 1500 }];   // dos vuelos completos y uno que se detiene a la mitad
  function fly() {
    cancelAnimationFrame(raf);
    var i = 0, t0 = null;
    plane.style.opacity = 1; place(0);
    function frame(ts) {
      if (t0 === null) t0 = ts;
      var leg = legs[i], k = Math.min(1, (ts - t0) / leg.dur);
      var e = i === legs.length - 1 ? 1 - Math.pow(1 - k, 2) : (k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
      var t = leg.to * e;
      place(t);
      if (i < legs.length - 1) plane.style.opacity = t > .93 ? Math.max(0, (1 - t) / .07) : (t < .07 ? t / .07 : 1);
      if (k < 1) { raf = requestAnimationFrame(frame); return; }
      i++;
      if (i < legs.length) { t0 = null; plane.style.opacity = 0; place(0); setTimeout(function () { plane.style.opacity = 1; raf = requestAnimationFrame(frame); }, 250); }
      else plane.style.opacity = 1;
    }
    raf = requestAnimationFrame(frame);
  }
  ticket.style.cursor = 'pointer';
  ticket.addEventListener('click', fly);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es, ob) {
      if (es[0].isIntersecting && !played) { played = true; ob.disconnect(); fly(); }
    }, { threshold: 0.7 }).observe(ticket);
  }
})();
