/* Índice: capítulos bloqueados */
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
})();

/* Entrada animada: título letra por letra y luego el índice, cada vez que se carga la página. */
(function () {
  var root = document.documentElement;
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still) { root.classList.remove('anim'); return; }
  var h1 = document.querySelector('.cover h1'), i = 0;
  if (h1) {
    h1.setAttribute('aria-label', h1.textContent);
    h1.innerHTML = h1.textContent.split(' ').map(function (w) {
      return '<span class="w" aria-hidden="true">' + w.split('').map(function (c) {
        return '<span class="ch" style="transition-delay:' + (0.04 * i++).toFixed(2) + 's">' + c + '</span>';
      }).join('') + '</span>';
    }).join(' ');
  }
  var rows = document.querySelectorAll('.index h2, .index li, .colophon');
  Array.prototype.forEach.call(rows, function (r, k) { r.style.transitionDelay = (1.1 + k * 0.09).toFixed(2) + 's'; });
  requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.add('ready'); }); });
  setTimeout(function () { Array.prototype.forEach.call(rows, function (r) { r.style.transitionDelay = ''; }); }, 2800);
})();
