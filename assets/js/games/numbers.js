/** THE NUMBERS OF US · game module. Slide to guess; scored by closeness. Contract: mount(container, ctx) → cleanup. Copy: content/games/numbers.js */
import { esc, shuffle, clamp, prefersReducedMotion } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { resultCard } from '../lib/gameEnd.js';

const fmt = (v) => (Number.isInteger(v) ? v.toLocaleString('en-IN') : v.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }));

export function mount(container, ctx) {
  const { content, sound, orbs, finish } = ctx;
  const N = Math.min(content.rounds, content.questions.length), TOTAL = N * 100;
  let qs = [], i = 0, total = 0, locked = false, done = false, end = null;
  const timers = [];
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };

  container.innerHTML = `
    <div class="gx gx-num">
      <div class="pl-gh">
        <span class="pl-gh__title">The numbers <em>of us</em></span>
        <span class="pl-gh__mid gx-n"></span>
        <span class="pl-gh__right">Points <b class="gx-score">0</b></span>
      </div>
      <div class="gx-body gx-num-play">
        <div class="pl-dots gx-dots"></div>
        <h3 class="gx-num-q"></h3>
        <div class="gx-num-read"><b class="gx-num-val" aria-live="off">0</b><span class="gx-num-unit"></span></div>
        <div class="gx-num-track">
          <input class="gx-num-range" type="range" aria-label="Your guess">
          <i class="gx-num-pin gx-num-pin--ans" hidden><span></span></i>
          <i class="gx-num-pin gx-num-pin--you" hidden><span>You</span></i>
        </div>
        <div class="gx-num-ends"><span class="gx-num-min"></span><span class="gx-num-max"></span></div>
        <button class="pl-gbtn gx-num-lock" type="button">${icon('check', { size: 16, stroke: 2.2 })}<span>Lock it in</span></button>
        <div class="gx-num-reveal" hidden aria-live="polite">
          <div class="gx-num-verdict"><span class="gx-badge"></span><b class="gx-num-pts">+0</b></div>
          <p class="gx-num-ans"></p>
          <p class="gx-num-note"></p>
          <button class="pl-gbtn gx-next" type="button"><span>Next</span>${icon('arrow-right', { size: 16, stroke: 2 })}</button>
        </div>
      </div>
    </div>`;
  const $ = (s) => container.querySelector(s);
  const root = $('.gx-num'), body = $('.gx-num-play'), range = $('.gx-num-range'), valEl = $('.gx-num-val'), dots = $('.gx-dots');
  const lockBtn = $('.gx-num-lock'), reveal = $('.gx-num-reveal'), pinA = $('.gx-num-pin--ans'), pinY = $('.gx-num-pin--you');

  const pct = (q, v) => (v - q.min) / (q.max - q.min);
  const paint = () => {
    const q = qs[i], v = +range.value;
    valEl.textContent = fmt(v);
    range.style.setProperty('--p', pct(q, v));
  };

  function start() {
    qs = shuffle(content.questions).slice(0, N);
    i = 0; total = 0; done = false; $('.gx-score').textContent = '0';
    dots.innerHTML = qs.map(() => '<i></i>').join('');
    if (end) { end.stop(); end.node.remove(); end = null; }
    body.hidden = false; show();
  }

  function show() {
    const q = qs[i]; locked = false;
    $('.gx-n').textContent = `${i + 1} / ${N}`;
    [...dots.children].forEach((d, n) => { d.className = n < i ? 'is-done' : n === i ? 'is-now' : ''; });
    $('.gx-num-q').textContent = q.q;
    $('.gx-num-unit').textContent = q.unit;
    $('.gx-num-min').textContent = fmt(q.min); $('.gx-num-max').textContent = fmt(q.max);
    range.min = q.min; range.max = q.max; range.step = q.step; range.disabled = false;
    range.value = Math.round((q.min + (q.max - q.min) / 2) / q.step) * q.step;
    pinA.hidden = true; pinY.hidden = true; reveal.hidden = true; lockBtn.hidden = false;
    root.classList.remove('is-locked'); body.classList.remove('is-in'); void body.offsetWidth; body.classList.add('is-in');
    paint(); container.scrollTop = 0;
  }

  function lock() {
    if (locked || done) return; locked = true;
    const q = qs[i], g = +range.value, f = Math.abs(g - q.answer) / (q.max - q.min);
    const pts = Math.round(100 * Math.max(0, 1 - f * 4)); total += pts;
    const verdict = content.verdicts.find((v) => f <= v.within) || content.verdicts[content.verdicts.length - 1];
    sound.play(pts >= 60 ? 'chime' : 'pop', { volume: .8 });
    range.disabled = true; lockBtn.hidden = true; root.classList.add('is-locked');
    pinA.style.setProperty('--p', pct(q, q.answer)); pinY.style.setProperty('--p', pct(q, g));
    pinA.hidden = false; pinY.hidden = false;
    pinA.querySelector('span').textContent = fmt(q.answer);
    pinY.classList.toggle('is-near', Math.abs(pct(q, q.answer) - pct(q, g)) < .12);
    const badge = $('.gx-num-verdict .gx-badge');
    badge.className = 'gx-badge ' + (pts >= 60 ? 'is-hit' : 'is-miss'); badge.textContent = verdict.title;
    $('.gx-num-ans').innerHTML = `The answer is <em>${esc(fmt(q.answer))}</em> ${esc(q.unit)}. You said ${esc(fmt(g))}.`;
    $('.gx-num-note').textContent = q.note;
    $('.gx-next span').textContent = i === N - 1 ? 'See my result' : 'Next';
    reveal.hidden = false; reveal.classList.remove('is-in'); void reveal.offsetWidth; reveal.classList.add('is-in');
    const ptsEl = $('.gx-num-pts');
    if (prefersReducedMotion() || !pts) ptsEl.textContent = '+' + pts;
    else { let n = 0; const tick = () => { n = Math.min(pts, n + Math.ceil(pts / 14)); ptsEl.textContent = '+' + n; if (n < pts) later(tick, 28); }; tick(); }
    $('.gx-score').textContent = total;
    if (pts >= 95 && !prefersReducedMotion()) { const r = pinA.getBoundingClientRect(); orbs.burst(r.left + r.width / 2, r.top, { count: 26, power: .9 }); }
    later(() => $('.gx-next').focus({ preventScroll: true }), 80);
  }

  function next() {
    if (!locked || done) return;
    if (i < N - 1) { i++; show(); } else results();
  }

  function results() {
    done = true;
    const ratio = total / TOTAL, t = content.tiers.find((x) => ratio >= x.min) || content.tiers[content.tiers.length - 1];
    const prev = ctx.best;
    finish({ score: total, total: TOTAL, label: `${total}/${TOTAL} · ${t.title}` });
    body.hidden = true; $('.gx-n').textContent = 'Result';
    end = resultCard(ctx, {
      eyebrow: 'Your score', big: total, of: TOTAL, title: t.title, line: t.line, good: ratio >= .6,
      prev: prev && prev.total ? `${prev.score}/${prev.total}` : '',
      shareTitle: 'The numbers of us', shareText: content.share(total, TOTAL, t.title), onAgain: start,
    });
    root.appendChild(end.node);
  }

  range.addEventListener('input', paint);
  lockBtn.addEventListener('click', lock);
  $('.gx-next').addEventListener('click', next);
  const onKey = (e) => {
    if (e.target.closest && e.target.closest('.sheet__close')) return;
    if (e.key === 'Enter' && e.target.tagName !== 'BUTTON' && !done) { e.preventDefault(); locked ? next() : lock(); }
  };
  document.addEventListener('keydown', onKey);
  start();

  return () => { document.removeEventListener('keydown', onKey); timers.forEach(clearTimeout); if (end) end.stop(); };
}
