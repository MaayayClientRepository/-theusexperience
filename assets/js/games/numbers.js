/** THE NUMBERS OF US · game module. Pick a range (Less → Infinity); full marks for the right step, partial for one step off. Contract: mount(container, ctx) → cleanup. Copy: content/games/numbers.js */
import { esc, shuffle, prefersReducedMotion } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { resultCard } from '../lib/gameEnd.js';

export function mount(container, ctx) {
  const { content, sound, orbs, finish } = ctx;
  const sc = content.scale, pts = content.points, N = Math.min(content.rounds, content.questions.length), TOTAL = N * pts.exact;
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
        <div class="gx-num-scale" role="group" aria-label="Pick a range">
          ${sc.map((st, n) => `
          <button class="gx-num-step" type="button" data-n="${n}" aria-label="${esc(st.label)}">
            <span class="gx-num-step__k" aria-hidden="true">${n + 1}</span><span class="gx-num-step__g" aria-hidden="true">${esc(st.glyph)}</span><span class="gx-num-step__l">${esc(st.label)}</span>
          </button>`).join('')}
        </div>
        <div class="gx-num-ends"><span>${esc(sc[0].label)}</span><span>${esc(sc[sc.length - 1].label)}</span></div>
        <div class="gx-num-reveal" hidden aria-live="polite">
          <div class="gx-num-verdict"><span class="gx-badge"></span><b class="gx-num-pts">+0</b></div>
          <p class="gx-num-ans"></p>
          <p class="gx-num-note"></p>
          <button class="pl-gbtn gx-next" type="button"><span>Next</span>${icon('arrow-right', { size: 16, stroke: 2 })}</button>
        </div>
      </div>
    </div>`;
  const $ = (s) => container.querySelector(s);
  const root = $('.gx-num'), body = $('.gx-num-play'), dots = $('.gx-dots'), reveal = $('.gx-num-reveal');
  const steps = [...container.querySelectorAll('.gx-num-step')];

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
    steps.forEach((b) => { b.disabled = false; b.className = 'gx-num-step'; });
    reveal.hidden = true;
    root.classList.remove('is-locked'); body.classList.remove('is-in'); void body.offsetWidth; body.classList.add('is-in');
    container.scrollTop = 0;
  }

  function pick(g) {
    if (locked || done) return; locked = true;
    const q = qs[i], gap = Math.abs(g - q.answer);
    const pts_ = gap === 0 ? pts.exact : gap === 1 ? pts.near : 0, kind = gap === 0 ? 'exact' : gap === 1 ? 'near' : 'far';
    total += pts_;
    sound.play(gap === 0 ? 'chime' : 'pop', { volume: .8 });
    root.classList.add('is-locked');
    steps.forEach((b, n) => {
      b.disabled = true; b.classList.add(n === q.answer ? 'is-ans' : 'is-dim');
      if (n === g) { b.classList.add('is-picked'); if (gap) { b.classList.remove('is-dim'); b.classList.add('is-miss'); } }
    });
    const badge = $('.gx-num-verdict .gx-badge');
    badge.className = 'gx-badge ' + (gap === 0 ? 'is-hit' : 'is-miss'); badge.textContent = content.verdicts[kind];
    $('.gx-num-ans').innerHTML = gap === 0 ? `The couple says <em>${esc(sc[q.answer].label)}</em>.` : `The couple says <em>${esc(sc[q.answer].label)}</em>. You said ${esc(sc[g].label)}.`;
    $('.gx-num-note').textContent = q.note || ''; $('.gx-num-note').hidden = !q.note;
    $('.gx-next span').textContent = i === N - 1 ? 'See my result' : 'Next';
    reveal.hidden = false; reveal.classList.remove('is-in'); void reveal.offsetWidth; reveal.classList.add('is-in');
    const ptsEl = $('.gx-num-pts');
    if (prefersReducedMotion() || !pts_) ptsEl.textContent = '+' + pts_;
    else { let n = 0; const tick = () => { n = Math.min(pts_, n + Math.ceil(pts_ / 14)); ptsEl.textContent = '+' + n; if (n < pts_) later(tick, 28); }; tick(); }
    $('.gx-score').textContent = total;
    if (gap === 0 && !prefersReducedMotion()) { const r = steps[g].getBoundingClientRect(); orbs.burst(r.left + r.width / 2, r.top, { count: 26, power: .9 }); }
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

  steps.forEach((b) => b.addEventListener('click', () => pick(+b.dataset.n)));
  $('.gx-next').addEventListener('click', next);
  const onKey = (e) => {
    if (e.target.closest && e.target.closest('.sheet__close')) return;
    if (!locked && /^[1-9]$/.test(e.key) && +e.key <= sc.length) pick(+e.key - 1);
    else if (e.key === 'Enter' && locked && e.target.tagName !== 'BUTTON' && !done) { e.preventDefault(); next(); }
  };
  document.addEventListener('keydown', onKey);
  start();

  return () => { document.removeEventListener('keydown', onKey); timers.forEach(clearTimeout); if (end) end.stop(); };
}
