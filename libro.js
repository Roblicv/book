/* Comportamiento compartido por todos los capítulos */
(function () {
  var bar = document.getElementById('bar');
  function upd() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? Math.min(100, window.scrollY / h * 100) : 0) + '%';
  }
  window.addEventListener('scroll', upd, { passive: true });
  window.addEventListener('resize', upd);
  upd();


  /* Etiqueta de quién habla: al pasar el cursor, enfocar o tocar un mensaje */
  function clearTags() { Array.prototype.forEach.call(document.querySelectorAll('.book p.d.on'), function (x) { x.classList.remove('on'); }); }
  Array.prototype.forEach.call(document.querySelectorAll('.book p.d[data-tag]'), function (p) {
    p.setAttribute('tabindex', '0');
    p.addEventListener('click', function () { var was = p.classList.contains('on'); clearTags(); if (!was) p.classList.add('on'); });
  });
  document.addEventListener('click', function (e) { if (!(e.target.closest && e.target.closest('.book p.d'))) clearTags(); });

  function jump(e) {
    var a = e.target.closest ? e.target.closest('sup.fn a, .notes .back') : null;
    if (!a) return;
    e.preventDefault();
    var det = document.getElementById('notas');
    if (det && a.closest('sup.fn') && !det.open) det.open = true;
    var isBack = a.classList.contains('back');
    var target = document.getElementById(a.getAttribute('href').slice(1));
    if (!target) return;
    if (isBack && det) det.open = false;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    var li = target.closest ? target.closest('li') : null;
    if (li) { li.classList.add('flash'); setTimeout(function () { li.classList.remove('flash'); }, 1600); }
  }
  document.addEventListener('click', jump);

  var size = 1.22;
  try { var s = parseFloat(localStorage.getItem('libro-fs')); if (s >= 1 && s <= 1.7) size = s; } catch (e) {}
  function apply() {
    document.body.style.setProperty('--fs', size + 'rem');
    try { localStorage.setItem('libro-fs', size); } catch (e) {}
    upd();
  }
  apply();
  document.getElementById('inc').onclick = function () { size = Math.min(1.7, +(size + 0.08).toFixed(2)); apply(); };
  document.getElementById('dec').onclick = function () { size = Math.max(1, +(size - 0.08).toFixed(2)); apply(); };
})();
