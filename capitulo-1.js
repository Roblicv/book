/* Capítulo I: recuadros K y Fe, contador hacia el Nobel */
(function () {
  Array.prototype.forEach.call(document.querySelectorAll('.el'), function (el) {
    el.addEventListener('click', function () { el.classList.toggle('on'); });
  });


  /* Contador hacia el Nobel de Química 2047 (miércoles 9 oct 2047, 11:45 CEST = 09:45 UTC) */
  var TARGET = Date.UTC(2047, 9, 9, 9, 45, 0);
  var C_START = Date.UTC(2026, 9, 12, 5, 0, 0), C_END = Date.UTC(2046, 9, 12, 5, 0, 0);
  function addMonths(t, n) {
    var d = new Date(t), y = d.getUTCFullYear(), m = d.getUTCMonth() + n, day = d.getUTCDate();
    var last = new Date(Date.UTC(y + Math.floor(m / 12), (m % 12 + 12) % 12 + 1, 0)).getUTCDate();
    return Date.UTC(y + Math.floor(m / 12), (m % 12 + 12) % 12, Math.min(day, last), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds());
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function tick() {
    var now = Date.now(), left = Math.max(0, TARGET - now);
    var a = new Date(now), t = new Date(TARGET);
    var tm = (t.getUTCFullYear() - a.getUTCFullYear()) * 12 + (t.getUTCMonth() - a.getUTCMonth());
    while (tm > 0 && addMonths(now, tm) > TARGET) tm--;
    var rem = Math.max(0, TARGET - addMonths(now, tm));
    document.getElementById('c-y').textContent = Math.floor(tm / 12);
    document.getElementById('c-m').textContent = tm % 12;
    document.getElementById('c-d').textContent = Math.floor(rem / 864e5);
    document.getElementById('c-h').textContent = pad(Math.floor(rem % 864e5 / 36e5));
    document.getElementById('c-n').textContent = pad(Math.floor(rem % 36e5 / 6e4));
    document.getElementById('c-s').textContent = pad(Math.floor(rem % 6e4 / 1e3));
    var p = Math.min(100, Math.max(0, (now - C_START) / (C_END - C_START) * 100));
    document.getElementById('c-p').textContent = p.toFixed(4).replace('.', ',');
    document.getElementById('c-bar').style.width = p + '%';
  }
  tick(); setInterval(tick, 1000);
})();
