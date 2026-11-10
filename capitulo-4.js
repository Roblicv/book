/* Capítulo IV: un piano de cinco teclas blancas (Do a Sol) y sus tres negras, que suena al tocarlo.
   El sonido se sintetiza en el navegador (Web Audio): armónicos con un ataque rápido y una caída lenta, como una cuerda percutida. */
(function () {
  var kb = document.getElementById('kb');
  if (!kb) return;
  var cap = document.getElementById('k-cap');
  var NOTES = [
    { n: 'Do', f: 261.63, k: 'a' }, { n: 'Do♯', f: 277.18, k: 'w', b: 1 }, { n: 'Re', f: 293.66, k: 's' },
    { n: 'Re♯', f: 311.13, k: 'e', b: 1 }, { n: 'Mi', f: 329.63, k: 'd' }, { n: 'Fa', f: 349.23, k: 'f' },
    { n: 'Fa♯', f: 369.99, k: 't', b: 1 }, { n: 'Sol', f: 392.0, k: 'g' }
  ];
  var ctx = null, master = null;
  function audio() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.32;
      var comp = ctx.createDynamicsCompressor();
      master.connect(comp); comp.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function strike(f) {
    var c = audio(); if (!c) return;
    var t = c.currentTime, out = c.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(1, t + 0.008);
    out.gain.exponentialRampToValueAtTime(0.25, t + 0.35);
    out.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
    var lp = c.createBiquadFilter(); lp.type = 'lowpass';
    lp.frequency.setValueAtTime(f * 9, t); lp.frequency.exponentialRampToValueAtTime(f * 2.5, t + 1.2);
    out.connect(lp); lp.connect(master);
    [[1, 1, 'triangle'], [2.001, 0.42, 'sine'], [3.004, 0.18, 'sine'], [4.01, 0.09, 'sine']].forEach(function (h) {
      var o = c.createOscillator(), g = c.createGain();
      o.type = h[2]; o.frequency.value = f * h[0]; g.gain.value = h[1];
      o.connect(g); g.connect(out); o.start(t); o.stop(t + 2.7);
    });
  }
  var whites = NOTES.filter(function (x) { return !x.b; }).length, wi = 0, byKey = {};
  NOTES.forEach(function (x) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = x.b ? 'b' : 'w';
    btn.setAttribute('aria-label', x.n + ', ' + x.f.toFixed(1).replace('.', ',') + ' hercios');
    if (x.b) btn.style.left = (100 * wi / whites) + '%';
    else { btn.textContent = x.n; wi++; }
    function down(e) {
      if (e) e.preventDefault();
      strike(x.f);
      btn.classList.add('on');
      cap.textContent = x.n + ' · ' + x.f.toFixed(1).replace('.', ',') + ' Hz';
    }
    function up() { btn.classList.remove('on'); }
    btn.addEventListener('pointerdown', down);
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { btn.addEventListener(ev, up); });
    btn.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) { down(e); } });
    btn.addEventListener('keyup', function (e) { if (e.key === 'Enter' || e.key === ' ') up(); });
    byKey[x.k] = { down: down, up: up };
    kb.appendChild(btn);
  });
  // Teclado de la computadora: A S D F G (blancas) y W E T (negras), solo mientras la portada está a la vista
  var visible = true;
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(kb);
  document.addEventListener('keydown', function (e) {
    var k = byKey[(e.key || '').toLowerCase()];
    if (!k || e.repeat || !visible || e.metaKey || e.ctrlKey || e.altKey || /input|textarea|select/i.test(e.target.tagName)) return;
    k.down();
  });
  document.addEventListener('keyup', function (e) { var k = byKey[(e.key || '').toLowerCase()]; if (k) k.up(); });
})();
