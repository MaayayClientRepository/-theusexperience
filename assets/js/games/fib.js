/** TWO TRUTHS & A FIB · game module. Contract: mount(container, ctx) → cleanup. Copy: content/games/fib.js */
import { esc, shuffle, prefersReducedMotion } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { store } from '../lib/store.js';
import { resultCard } from '../lib/gameEnd.js';

export function mount(container, ctx) {
  const { content, sound, orbs, finish } = ctx;
  const names = content.names, N = Math.min(content.rounds, content.items.length);
  const aboutOf = (w) => (w === 'both' ? `${names.a} & ${names.b}` : names[w]);
  let deck = [], i = 0, score = 0, locked = false, done = false, end = null;
  const timers = [];
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };

  container.innerHTML = `
    <div class="gx gx-fib">
      <div class="pl-gh">
        <span class="pl-gh__title">Two truths <em>&amp;</em> a fib</span>
        <span class="pl-gh__mid gx-n"></span>
        <span class="pl-gh__right">Spotted <b class="gx-score">0</b></span>
      </div>
      <div class="gx-body gx-fib-play">
        <div class="pl-dots gx-dots"></div>
        <div class="gx-fib-scope" aria-hidden="true">
          <svg viewBox="0 0 400 40" preserveAspectRatio="none"><g class="gx-fib-wave"><path d="M0 20 H40 L50 20 L58 8 L66 32 L74 14 L80 20 H160 L170 20 L178 4 L188 36 L198 12 L206 20 H280 L290 20 L298 10 L306 30 L314 18 L320 20 H400 M400 20 H440 L450 20 L458 8 L466 32 L474 14 L480 20 H560 L570 20 L578 4 L588 36 L598 12 L606 20 H680 L690 20 L698 10 L706 30 L714 18 L720 20 H800"/></g></svg>
        </div>
        <p class="gx-fib-about"></p>
        <h3 class="gx-fib-q">Which one is the fib?</h3>
        <div class="gx-fib-slips" role="group" aria-label="Three claims. One is a fib."></div>
        <div class="gx-fib-reveal" hidden aria-live="polite">
          <div class="gx-fib-verdict"></div>
          <p class="gx-fib-why"></p>
          <button class="pl-gbtn gx-next" type="button"><span>Next</span>${icon('arrow-right', { size: 16, stroke: 2 })}</button>
        </div>
        <p class="gx-hint">Tap a claim, or press 1 · 2 · 3</p>
      </div>
    </div>`;
  const $ = (s) => container.querySelector(s);
  const root = $('.gx-fib'), body = $('.gx-fib-play'), slips = $('.gx-fib-slips'), reveal = $('.gx-fib-reveal'), hint = $('.gx-hint');
  const dots = $('.gx-dots');

  function start() {
    deck = shuffle(content.items).slice(0, N).map((it) => ({
      who: it.who, why: it.why,
      lines: shuffle([...it.truths.map((t) => ({ t, fib: false })), { t: it.fib, fib: true }]),
    }));
    i = 0; score = 0; done = false; $('.gx-score').textContent = '0';
    dots.innerHTML = deck.map(() => '<i></i>').join('');
    if (end) { end.stop(); end.node.remove(); end = null; }
    body.hidden = false; show();
  }

  function show() {
    const r = deck[i]; locked = false;
    $('.gx-n').textContent = `${i + 1} / ${N}`;
    [...dots.children].forEach((d, n) => { d.className = n < i ? 'is-done' : n === i ? 'is-now' : ''; });
    $('.gx-fib-about').innerHTML = `A few things about <em>${esc(aboutOf(r.who))}</em>`;
    slips.innerHTML = r.lines.map((l, n) => `
      <button class="gx-fib-slip" type="button" data-n="${n}" style="--d:${n * 90}ms">
        <span class="gx-fib-slip__n">${n + 1}</span><span class="gx-fib-slip__t">${esc(l.t)}</span><span class="gx-fib-slip__stamp" aria-hidden="true"></span>
      </button>`).join('');
    reveal.hidden = true; hint.hidden = false; root.classList.remove('is-spike');
    slips.classList.remove('is-in'); void slips.offsetWidth; slips.classList.add('is-in');
    container.scrollTop = 0;
  }

  function pick(n) {
    if (locked || done) return; locked = true;
    const r = deck[i], hit = r.lines[n].fib;
    if (hit) { score++; $('.gx-score').textContent = score; }
    sound.play(hit ? 'chime' : 'sad', { volume: .8 });
    root.classList.add('is-spike');
    [...slips.children].forEach((b, k) => {
      const l = r.lines[k]; b.disabled = true;
      b.classList.add(l.fib ? 'is-fib' : 'is-true');
      b.querySelector('.gx-fib-slip__stamp').textContent = l.fib ? 'Fib' : 'True';
      if (k === n) b.classList.add(hit ? 'is-hit' : 'is-miss');
    });
    $('.gx-fib-verdict').innerHTML = `<span class="gx-badge ${hit ? 'is-hit' : 'is-miss'}">${icon(hit ? 'check' : 'x', { size: 14, stroke: 2.4 })}${hit ? 'Fib caught' : 'Fooled'}</span>`;
    $('.gx-fib-why').textContent = r.why;
    $('.gx-next span').textContent = i === N - 1 ? 'See my result' : 'Next';
    hint.hidden = true; reveal.hidden = false;
    reveal.classList.remove('is-in'); void reveal.offsetWidth; reveal.classList.add('is-in');
    if (hit && !prefersReducedMotion()) { const rc = slips.children[n].getBoundingClientRect(); orbs.burst(rc.left + rc.width / 2, rc.top + rc.height / 2, { count: 22, power: .8 }); }
    later(() => $('.gx-next').focus({ preventScroll: true }), 80);
  }

  function next() {
    if (!locked || done) return;
    if (i < N - 1) { i++; show(); } else results();
  }

  function results() {
    done = true;
    const t = content.tiers.find((x) => score >= x.min) || content.tiers[content.tiers.length - 1];
    const prev = ctx.best;
    finish({ score, total: N, label: `${score}/${N} · ${t.title}` });
    body.hidden = true; $('.gx-n').textContent = 'Result';
    end = resultCard(ctx, {
      eyebrow: 'Fibs you caught', big: score, of: N, title: t.title, line: t.line, good: score >= 4,
      prev: prev && prev.total ? `${prev.score}/${prev.total}` : '',
      shareTitle: 'Two truths & a fib', shareText: content.share(score, N, t.title), onAgain: start,
    });
    root.appendChild(end.node);
  }

  const onKey = (e) => {
    if (e.target.closest && e.target.closest('.sheet__close')) return;
    if (['1', '2', '3'].includes(e.key) && !locked) pick(+e.key - 1);
    else if (e.key === 'Enter' && locked && e.target.tagName !== 'BUTTON' && !done) next();
  };
  document.addEventListener('keydown', onKey);
  slips.addEventListener('click', (e) => { const b = e.target.closest('.gx-fib-slip'); if (b) pick(+b.dataset.n); });
  $('.gx-next').addEventListener('click', next);
  start();

  return () => { document.removeEventListener('keydown', onKey); timers.forEach(clearTimeout); if (end) end.stop(); };
}
