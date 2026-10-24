/* Índice: capítulos bloqueados y órbitas de fondo */
(function () {
  var msg = document.getElementById('msg');
  Array.prototype.forEach.call(document.querySelectorAll('.index li.lock'), function (li) {
    function nudge() {
      li.classList.remove('shake'); void li.offsetWidth; li.classList.add('shake');
      msg.textContent = 'Este capítulo todavía no existe. La anomalía sigue bajo observación.';
    }
    li.addEventListener('click', nudge);
    li.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nudge(); } });
  });

  /* Dos planetas gigantes, cada uno en su órbita; las órbitas se solapan como un diagrama de Venn y ocupan toda la página.
     El movimiento de uno es el espejo del otro, así que se encuentran siempre en una de las dos intersecciones (arriba y abajo, por turnos).
     Al acercarse se aceleran y, al separarse, recuperan su velocidad. La velocidad base se calibra para que haya un encuentro
     cada LEG segundos, y el primero ocurre apenas carga la página. La línea de la órbita se recorta bajo cada planeta. */
  var svg = document.getElementById('dos');
  if (!svg) return;
  var NS = 'http://www.w3.org/2000/svg';
  var LEG = 8.5;                              // segundos entre un encuentro y el siguiente
  var K = 1.9;                                // intensidad de la aceleración al encontrarse
  var DR = 1.35, ALPHA = Math.acos(DR / 2);   // separación entre centros (en R) y ángulo de los encuentros
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cx, cy, R, D, SIGMA, vertical, pr;

  function mk(name, attrs, parent) { var n = document.createElementNS(NS, name); for (var k in attrs) n.setAttribute(k, attrs[k]); (parent || svg).appendChild(n); return n; }
  var defs = mk('defs', {});
  var mask = mk('mask', { id: 'orbcut', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: 1, height: 1 }, defs);
  var mrect = mk('rect', { x: 0, y: 0, width: 1, height: 1, fill: '#fff' }, mask);
  var ma = mk('circle', { fill: '#000' }, mask), mb = mk('circle', { fill: '#000' }, mask);
  var lines = mk('g', { mask: 'url(#orbcut)' });
  var oa = mk('circle', { 'class': 'o-a' }, lines), ob = mk('circle', { 'class': 'o-b' }, lines);
  var pl = mk('g', { 'class': 'pl' }), pb = mk('circle', { 'class': 'p-b' }, pl), pa = mk('circle', { 'class': 'p-a' }, pl);

  function layout() {
    var w = window.innerWidth, h = window.innerHeight;
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    mask.setAttribute('width', w); mask.setAttribute('height', h);
    mrect.setAttribute('width', w); mrect.setAttribute('height', h);
    vertical = false;                                          // círculos lado a lado; los planetas se cruzan en vertical (arriba y abajo)
    R = Math.min(h * 0.6, w * 0.55); D = R * DR;                   // el punto de encuentro queda siempre dentro de la pantalla
    cx = w / 2; cy = h / 2; SIGMA = R * 0.5; pr = Math.max(24, R * 0.09);
    var ax = vertical ? cx : cx - D / 2, ay = vertical ? cy - D / 2 : cy;
    var bx = vertical ? cx : cx + D / 2, by = vertical ? cy + D / 2 : cy;
    oa.setAttribute('cx', ax); oa.setAttribute('cy', ay); oa.setAttribute('r', R);
    ob.setAttribute('cx', bx); ob.setAttribute('cy', by); ob.setAttribute('r', R);
    pa.setAttribute('r', pr); pb.setAttribute('r', pr);
    ma.setAttribute('r', pr + 1); mb.setAttribute('r', pr + 1);
  }
  function pos(th) { return [-D / 2 + R * Math.cos(th), R * Math.sin(th)]; }
  function xy(p, mirror) {
    var s = mirror ? -1 : 1;
    return vertical ? [cx - p[1], cy + s * p[0]] : [cx + s * p[0], cy - p[1]];
  }
  function draw(th) {
    var p = pos(th), a = xy(p, false), b = xy(p, true);
    pa.setAttribute('cx', a[0].toFixed(1)); pa.setAttribute('cy', a[1].toFixed(1));
    pb.setAttribute('cx', b[0].toFixed(1)); pb.setAttribute('cy', b[1].toFixed(1));
    ma.setAttribute('cx', a[0].toFixed(1)); ma.setAttribute('cy', a[1].toFixed(1));
    mb.setAttribute('cx', b[0].toFixed(1)); mb.setAttribute('cy', b[1].toFixed(1));
  }

  /* Velocidad angular: más lenta dentro de la lente (arco corto) que fuera (arco largo), para que ambos tramos
     duren lo mismo; más rápida cerca del encuentro. */
  var cIn = 1, w0 = 1;
  function speed(th) {
    var t = Math.atan2(Math.sin(th), Math.cos(th));            // (-π, π]
    var w = 0.5 - 0.5 * Math.tanh((Math.abs(t) - ALPHA) / 0.18);
    var dist = Math.abs(-DR + 2 * Math.cos(t));               // en unidades de R
    var boost = 1 + K * Math.exp(-Math.pow(dist / 0.5, 2));
    return w0 * (cIn * w + (1 - w)) * boost;
  }
  function leg(a, b) { var n = 600, s = 0, d = (b - a) / n; for (var i = 0; i < n; i++) s += d / speed(a + d * (i + 0.5)); return s; }
  (function calibrate() {
    var lo = 0.05, hi = 3;
    for (var i = 0; i < 40; i++) {
      cIn = (lo + hi) / 2;
      if (leg(-ALPHA, ALPHA) > leg(ALPHA, 2 * Math.PI - ALPHA)) lo = cIn; else hi = cIn;   // más lenta adentro → tramo más largo
    }
    w0 = leg(ALPHA, 2 * Math.PI - ALPHA) / LEG;
  })();

  var th = ALPHA - 0.36, last = null;                           // empieza justo antes del primer encuentro
  layout(); draw(still ? 1.0 : th);
  window.addEventListener('resize', function () { layout(); draw(th); });
  if (still) return;

  function frame(t) {
    if (last === null) last = t;
    var dt = Math.min(0.05, (t - last) / 1000); last = t;
    th += speed(th) * dt;
    draw(th);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
