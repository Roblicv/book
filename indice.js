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
