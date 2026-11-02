/* Capítulo III: diagrama de Feynman. Dos trayectorias avanzan en el tiempo (de abajo hacia arriba) y se acercan
   intercambiando un fotón por cada día de la semana, de lunes a sábado. Cada toque añade un día; al final vuelve a empezar. */
(function () {
  var svg = document.getElementById('feyn');
  if (!svg) return;
  var cap = document.getElementById('f-cap');
  var NS = 'http://www.w3.org/2000/svg';
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DAYS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var TOP = 14, BOT = 222, STEP = 30, n = 0;
  function Y(i) { return BOT - 26 - i * STEP; }
  function xJ(i) { return 78 + i * 13; }
  function xK(i) { return 282 - i * 13; }

  function mk(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    (parent || svg).appendChild(e);
    return e;
  }
  function grow(el, dur, delay) {
    if (still) return;
    var L = el.getTotalLength();
    el.style.strokeDasharray = L; el.style.strokeDashoffset = L;
    el.getBoundingClientRect();
    el.style.transition = 'stroke-dashoffset ' + dur + 'ms ease ' + (delay || 0) + 'ms';
    el.style.strokeDashoffset = 0;
  }
  function wave(x1, x2, y) {
    var d = 'M' + x1 + ' ' + y, N = 48, waves = Math.max(4, Math.round((x2 - x1) / 13));
    for (var s = 1; s <= N; s++) {
      var t = s / N;
      d += ' L' + (x1 + (x2 - x1) * t).toFixed(1) + ' ' + (y + 4.2 * Math.sin(t * waves * 2 * Math.PI)).toFixed(1);
    }
    return d;
  }

  var g = mk('g', {});

  function render(first) {
    g.textContent = '';
    var dj = 'M' + xJ(0) + ' ' + BOT, dk = 'M' + xK(0) + ' ' + BOT;
    for (var i = 0; i < n; i++) { dj += ' L' + xJ(i + 1) + ' ' + Y(i); dk += ' L' + xK(i + 1) + ' ' + Y(i); }
    dj += ' L' + xJ(n) + ' ' + TOP; dk += ' L' + xK(n) + ' ' + TOP;
    var pj = mk('path', { 'class': 'fy-j', d: dj }, g), pk = mk('path', { 'class': 'fy-k', d: dk }, g);
    if (first) { grow(pj, 1400); grow(pk, 1400); }
    for (var j = 0; j < n; j++) {
      var last = j === n - 1, y = Y(j);
      var ph = mk('path', { 'class': 'fy-ph', d: wave(xJ(j + 1), xK(j + 1), y) }, g);
      var lab = mk('text', { 'class': 'fy-day' + (last ? ' fy-new' : ''), x: 180, y: y - 8, 'text-anchor': 'middle' }, g);
      lab.textContent = DAYS[j];
      mk('circle', { 'class': 'fy-v', cx: xJ(j + 1), cy: y, r: 2.6 }, g);
      mk('circle', { 'class': 'fy-v', cx: xK(j + 1), cy: y, r: 2.6 }, g);
      if (last) grow(ph, 800);
    }
    var a = mk('text', { 'class': 'fy-name', x: xJ(0), y: BOT + 16, 'text-anchor': 'middle' }, g); a.textContent = 'Julián';
    var b = mk('text', { 'class': 'fy-name', x: xK(0), y: BOT + 16, 'text-anchor': 'middle' }, g); b.textContent = 'Karen';
    svg.setAttribute('aria-label', 'Diagrama de Feynman: ' + (n ? n + (n === 1 ? ' intercambio' : ' intercambios') + ', hasta el ' + DAYS[n - 1] : 'sin intercambios todavía') + '. Activa para añadir el siguiente día.');
  }
  function step() {
    n = n >= DAYS.length ? 0 : n + 1;
    render(n === 0);
    cap.textContent = n === 0 ? 'Toca el diagrama: un intercambio por cada día.'
      : n === DAYS.length ? 'Seis días, seis intercambios, cada vez más cerca.'
      : 'El intercambio del ' + DAYS[n - 1] + '.';
  }
  render(true);
  svg.addEventListener('click', step);
  svg.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); step(); } });
})();
