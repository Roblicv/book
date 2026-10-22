(function () {
  var bar = document.getElementById('bar');
  function upd() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? Math.min(100, window.scrollY / h * 100) : 0) + '%';
  }
  window.addEventListener('scroll', upd, { passive: true });
  window.addEventListener('resize', upd);
  upd();

  Array.prototype.forEach.call(document.querySelectorAll('.el'), function (el) {
    el.addEventListener('click', function () { el.classList.toggle('on'); });
  });

  var tags = [
    ['Karen', '5:14 p. m.'], ['Julián', '9:52 p. m.'], 'Karen', 'Karen', 'Julián', 'Karen', 'Karen', 'Julián',
    'Karen', 'Karen', 'Julián', 'Karen', 'Julián', 'Julián', 'Karen', 'Karen', 'Karen', 'Karen', 'Karen',
    'Julián', 'Julián', 'Julián', 'Karen', 'Karen', 'Karen', 'Karen', 'Karen', 'Karen', 'Karen', 'Karen',
    'Karen', 'Karen'
  ];
  var lines = document.querySelectorAll('.book p.d');
  if (lines.length === tags.length) {
    Array.prototype.forEach.call(lines, function (p, i) {
      var t = tags[i];
      p.setAttribute('data-tag', Array.isArray(t) ? t.join(' · ') : t);
      p.setAttribute('tabindex', '0');
    });
  }

  function jump(e) {
    var a = e.target.closest ? e.target.closest('sup.fn a, .notes .back') : null;
    if (!a) return;
    e.preventDefault();
    var target = document.getElementById(a.getAttribute('href').slice(1));
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    var li = target.closest ? target.closest('li') : null;
    if (li) { li.classList.add('flash'); setTimeout(function () { li.classList.remove('flash'); }, 1600); }
  }
  document.addEventListener('click', jump);

  /* Índice */
  var msg = document.getElementById('tocmsg');
  Array.prototype.forEach.call(document.querySelectorAll('.toc li.lock'), function (li) {
    function nudge() {
      li.classList.remove('shake'); void li.offsetWidth; li.classList.add('shake');
      msg.textContent = 'Este capítulo todavía no existe. La anomalía sigue bajo observación.';
    }
    li.addEventListener('click', nudge);
    li.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nudge(); } });
  });
  var openLi = document.querySelector('.toc li.open');
  function goChapter() { document.getElementById('capitulo').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  openLi.addEventListener('click', goChapter);
  openLi.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goChapter(); } });

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

  /* Lectura en voz alta */
  (function () {
    var box = document.getElementById('listen');
    var playBtn = document.getElementById('play'), stopBtn = document.getElementById('stop');
    var playI = document.getElementById('play-i'), playT = document.getElementById('play-t');
    var sel = document.getElementById('voice'), rate = document.getElementById('rate'), vopt = document.getElementById('vopt');
    var synth = window.speechSynthesis;
    var audio = null, audioMode = false;
    var items = [], idx = 0, state = 'idle', token = 0, voices = [], timer = 0;

    function clean(el) {
      var c = el.cloneNode(true);
      Array.prototype.forEach.call(c.querySelectorAll('sup'), function (s) { s.remove(); });
      return c.textContent.replace(/^\s*[—–-]+\s*/, '').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '')
        .replace(/!{2,}/g, '!').replace(/\s+/g, ' ').trim();
    }
    items.push({ el: document.querySelector('.opener'), text: 'Capítulo uno. La anomalía del potasio y el hierro. Doce de octubre de dos mil veintiséis.' });
    Array.prototype.forEach.call(document.querySelectorAll('.book p'), function (p) {
      var t = p.classList.contains('kicker') ? clean(p) + '.' : clean(p);
      if (t) items.push({ el: p, text: t });
    });
    var total = items.reduce(function (s, it) { return s + it.text.length; }, 0);

    function mark(i) {
      items.forEach(function (it) { it.el.classList.remove('speaking'); });
      if (items[i]) {
        items[i].el.classList.add('speaking');
        items[i].el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    function ui(s) {
      state = s;
      var on = s === 'playing';
      playBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      playI.textContent = on ? '❚❚' : '▶';
      playT.textContent = on ? 'Pausar' : (s === 'paused' ? 'Seguir' : 'Escuchar');
      stopBtn.hidden = s === 'idle';
    }
    function pickScore(v) {
      var s = 0;
      if (/natural|neural|premium|enhanced|mejorad|siri|online/i.test(v.name)) s += 6;
      if (/google/i.test(v.name)) s += 2;
      if (/^es[-_]CO/i.test(v.lang)) s += 4; else if (/^es[-_](MX|US|419|AR)/i.test(v.lang)) s += 2; else if (/^es[-_]ES/i.test(v.lang)) s += 1;
      return s;
    }
    function loadVoices() {
      if (!synth) return;
      voices = synth.getVoices().filter(function (v) { return /^es/i.test(v.lang); })
        .sort(function (a, b) { return pickScore(b) - pickScore(a); });
      var saved = ''; try { saved = localStorage.getItem('cap1-voice') || ''; } catch (e) {}
      sel.innerHTML = '';
      voices.forEach(function (v, i) {
        var o = document.createElement('option'); o.value = v.name; o.textContent = v.name + ' (' + v.lang + ')';
        if (saved ? v.name === saved : i === 0) o.selected = true;
        sel.appendChild(o);
      });
      if (!audioMode) box.hidden = voices.length === 0;
    }
    function curVoice() { for (var i = 0; i < voices.length; i++) if (voices[i].name === sel.value) return voices[i]; return voices[0]; }

    function speak(i) {
      if (i >= items.length) { finish(); return; }
      idx = i; var my = ++token; mark(i);
      var u = new SpeechSynthesisUtterance(items[i].text);
      var v = curVoice(); if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = 'es-CO'; }
      u.rate = parseFloat(rate.value) || 0.95;
      u.onend = function () { if (my === token && state === 'playing') setTimeout(function () { if (my === token && state === 'playing') speak(i + 1); }, 160); };
      u.onerror = function (e) { if (my === token && e.error !== 'canceled' && e.error !== 'interrupted') { ui('idle'); mark(-1); } };
      synth.cancel(); synth.speak(u);
    }
    function finish() { token++; ui('idle'); idx = 0; mark(-1); }

    function audioIndex(frac) {
      var target = frac * total, acc = 0;
      for (var i = 0; i < items.length; i++) { acc += items[i].text.length; if (acc >= target) return i; }
      return items.length - 1;
    }

    playBtn.addEventListener('click', function () {
      if (audioMode) {
        if (audio.paused) { audio.play(); ui('playing'); } else { audio.pause(); ui('paused'); }
        return;
      }
      if (state === 'playing') { token++; synth.cancel(); ui('paused'); }
      else { ui('playing'); speak(state === 'paused' ? idx : 0); }
    });
    stopBtn.addEventListener('click', function () {
      if (audioMode) { audio.pause(); audio.currentTime = 0; ui('idle'); mark(-1); return; }
      token++; if (synth) synth.cancel(); finish();
    });
    sel.addEventListener('change', function () {
      try { localStorage.setItem('cap1-voice', sel.value); } catch (e) {}
      if (state === 'playing') speak(idx);
    });
    rate.addEventListener('change', function () { if (state === 'playing') speak(idx); });
    window.addEventListener('pagehide', function () { if (synth) synth.cancel(); });

    function useAudio() {
      audio = new Audio('narracion.mp3'); audioMode = true;
      vopt.hidden = true; box.hidden = false;
      var last = -1;
      audio.addEventListener('timeupdate', function () {
        if (!audio.duration) return;
        var i = audioIndex(audio.currentTime / audio.duration);
        if (i !== last) { last = i; mark(i); }
      });
      audio.addEventListener('ended', function () { ui('idle'); mark(-1); });
    }

    var hasSynth = !!synth && typeof SpeechSynthesisUtterance !== 'undefined';
    if (hasSynth) { loadVoices(); synth.addEventListener && synth.addEventListener('voiceschanged', loadVoices); }
    if (window.fetch) {
      fetch('narracion.mp3', { method: 'HEAD' }).then(function (r) {
        if (r.ok && /audio|mpeg|octet/i.test(r.headers.get('content-type') || '')) useAudio();
      }).catch(function () {});
    }
  })();

  var size = 1.22;
  try { var s = parseFloat(localStorage.getItem('cap1-fs')); if (s >= 1 && s <= 1.7) size = s; } catch (e) {}
  function apply() {
    document.body.style.setProperty('--fs', size + 'rem');
    try { localStorage.setItem('cap1-fs', size); } catch (e) {}
    upd();
  }
  apply();
  document.getElementById('inc').onclick = function () { size = Math.min(1.7, +(size + 0.08).toFixed(2)); apply(); };
  document.getElementById('dec').onclick = function () { size = Math.max(1, +(size - 0.08).toFixed(2)); apply(); };
})();
