/** WHO'S MORE LIKELY TO · game module. Contract: mount(container, ctx) → cleanup. Copy: content/games/likely.js */
import { html, raw, esc, shuffle, prefersReducedMotion, copyText } from '../lib/dom.js';
import { icon, registerIcon } from '../lib/icons.js';
import { characters, injectCharacterDefs } from '../lib/characters.js';

registerIcon('play', '<polygon points="6 3 20 12 6 21 6 3"/>');

export function mount(container, ctx) {
  const { content, sound, orbs, toast, finish, best } = ctx;
  const names = content.names, N = Math.min(content.rounds || 10, content.prompts.length);
  const prompts = shuffle(content.prompts).slice(0, N);
  let i = 0, score = 0, locked = false, done = false, timers = [];
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };

  const pickBtn = (k) => html`
    <button class="gm-likely-pick gm-likely-pick--${k}" type="button" data-k="${k}" aria-label="${names[k]}">
      <span class="gm-likely-pick__face">${raw(characters[k === 'a' ? 'bride' : 'groom']({ pose: 'stand', mood: k === 'a' ? 'love' : 'smile' }))}</span>
      <span class="gm-likely-pick__name"><span>${names[k]}</span></span>
    </button>`;

  container.innerHTML = String(html`
    <div class="gm-likely">
      <div class="pl-gh">
        <span class="pl-gh__title">${names.a} <em>&amp;</em> ${names.b}</span>
        <span class="pl-gh__mid"><span class="gm-likely-n">1 / ${N}</span></span>
        <span class="pl-gh__right">Matched <b class="gm-likely-score">0</b></span>
      </div>
      <div class="gm-likely-play">
        <div class="pl-dots gm-likely-dots">${raw(prompts.map(() => '<i></i>').join(''))}</div>
        <div class="gm-likely-arena">
          ${pickBtn('a')}
          <div class="gm-likely-deck">
            <div class="gm-likely-swipe" tabindex="0" aria-label="Question card. Swipe left for ${names.a}, right for ${names.b}, up for both, down for neither.">
              <span class="gm-likely-stamp" aria-hidden="true"></span>
              <span class="gm-likely-count"></span>
              <h3 class="gm-likely-q" aria-live="polite"></h3>
            </div>
          </div>
          ${pickBtn('b')}
        </div>
        <div class="gm-likely-choices" role="group" aria-label="Both or neither">
          ${[['both', 'Both', 'heart'], ['neither', 'Neither', 'x']].map(([k, label, ic]) => html`
            <button class="gm-likely-pick gm-likely-pick--c gm-likely-pick--${k}" type="button" data-k="${k}" aria-label="${label}">
              <span class="gm-likely-pick__name">${raw(icon(ic, { size: 18, stroke: 2 }))}<span>${label}</span></span>
            </button>`)}
        </div>
        <div class="gm-likely-reveal" aria-live="polite">
          <div class="gm-likely-hint" aria-live="polite">Swipe the card, tap an answer, or press 1 · 2 · 3 · 4</div>
        </div>
      </div>
      <div class="gm-likely-end" hidden></div>
    </div>`);

  injectCharacterDefs();
  const $ = (s) => container.querySelector(s);
  const stamp = container.querySelector('.gm-likely-stamp'), qEl = $('.gm-likely-q'), swipe = $('.gm-likely-swipe'), cntEl = $('.gm-likely-count'), nEl = $('.gm-likely-n'), scEl = $('.gm-likely-score'), dots = [...container.querySelectorAll('.gm-likely-dots i')];
  const KEYS = ['a', 'b', 'both', 'neither'], orbEls = Object.fromEntries(KEYS.map((k) => [k, $(`.gm-likely-pick--${k}`)]));
  const hint = $('.gm-likely-hint'), play = $('.gm-likely-play'), end = $('.gm-likely-end');

  const HINT = 'Swipe the card, tap an answer, or press 1 · 2 · 3 · 4';
  function show() {
    const p = prompts[i]; locked = false;
    qEl.innerHTML = `…${esc(p.q)}?`; cntEl.textContent = `${i + 1} / ${N}`;
    swipe.style.transition = ''; swipe.style.transform = ''; swipe.style.opacity = ''; swipe.hidden = false; stamp.style.opacity = 0;
    swipe.classList.remove('is-in', 'is-gone'); void swipe.offsetWidth; swipe.classList.add('is-in');
    nEl.textContent = `${i + 1} / ${N}`;
    dots.forEach((d, n) => { d.className = n < i ? 'is-done' : n === i ? 'is-now' : ''; });
    hint.className = 'gm-likely-hint'; hint.textContent = HINT;
    Object.values(orbEls).forEach((o) => { o.className = o.className.replace(/\bis-(picked|truth|dim|match|miss|aim|shake)\b/g, '').trim(); o.disabled = false; });
    container.scrollTop = 0;
  }

  // swipe direction -> answer
  const DIR = { left: 'a', right: 'b', up: 'both', down: 'neither' };
  const VEC = { a: [-1, 0], b: [1, 0], both: [0, -1], neither: [0, 1] };
  const LABEL = { a: names.a, b: names.b, both: 'Both', neither: 'Neither' };
  const dirOf = (dx, dy) => (Math.abs(dx) >= Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down'));
  function flyOff(k) {
    if (prefersReducedMotion()) { swipe.hidden = true; return; }
    const [vx, vy] = VEC[k];
    swipe.classList.add('is-gone');
    swipe.style.transition = 'transform .45s cubic-bezier(.4,0,.8,.4), opacity .45s';
    swipe.style.transform = `translate(${vx * innerWidth}px, ${vy * innerHeight * .8}px) rotate(${vx * 24}deg)`;
    swipe.style.opacity = '0';
    later(() => { swipe.hidden = true; }, 460);
  }
  const label = (k) => (k === 'both' ? 'both of them' : k === 'neither' ? 'neither of them' : names[k]);
  function pick(k) {
    if (locked || done) return; locked = true;
    const p = prompts[i], hit = k === p.truth;
    if (hit) { score++; scEl.textContent = score; }
    sound.play(hit ? 'chime' : 'pop', { volume: .8 });
    flyOff(k);
    KEYS.forEach((x) => { orbEls[x].disabled = true; orbEls[x].classList.add(x === k ? 'is-picked' : 'is-dim'); });
    orbEls[p.truth].classList.remove('is-dim'); orbEls[p.truth].classList.add('is-truth');
    hint.className = `gm-likely-hint is-${hit ? 'hit' : 'miss'}`;
    hint.textContent = hit ? `Match! The couple says ${label(p.truth)}` : `The couple says ${label(p.truth)}`;
    if (!hit) {
      // wrong: buzz the phone where supported, and shake the card you picked (iOS and desktop have no vibrate)
      try { navigator.vibrate && navigator.vibrate([70, 50, 70]); } catch (e) { /* unsupported */ }
      if (!prefersReducedMotion()) { void orbEls[k].offsetWidth; orbEls[k].classList.add('is-shake'); }
    }
    if (hit && !prefersReducedMotion()) { const r = orbEls[k].getBoundingClientRect(); orbs.burst(r.left + r.width / 2, r.top + r.height / 2, { count: 22, power: .8 }); }
    later(next, prefersReducedMotion() ? 1500 : 1300);
  }

  function next() {
    if (done) return;
    if (i < N - 1) { i++; show(); } else results();
  }

  function tier() { return content.tiers.find((t) => score >= t.min) || content.tiers[content.tiers.length - 1]; }
  function results() {
    done = true; const t = tier();
    finish({ score, total: N, label: `${score}/${N} · ${t.title}` });
    play.hidden = true; end.hidden = false;
    dots.forEach((d) => { d.className = 'is-done'; }); nEl.textContent = 'Result';
    end.innerHTML = String(html`
      <div class="gm-likely-end__in">
        <span class="gm-likely-end__eyebrow">You matched the couple</span>
        <div class="gm-likely-big"><span class="gm-likely-big__n">0</span><span class="gm-likely-big__of">/ ${N}</span></div>
        <h3 class="gm-likely-tier">${t.title}</h3>
        <p class="gm-likely-line">${t.line}</p>
        ${best && best.total ? html`<p class="gm-likely-prev">Previous best <b>${best.score}/${best.total}</b></p>` : ''}
        <div class="gm-likely-actions">
          <button class="pl-gbtn gm-likely-share" type="button">${raw(icon('share-2', { size: 16, stroke: 2 }))}<span>Share my score</span></button>
          <button class="pl-gbtn pl-gbtn--ghost gm-likely-again" type="button">${raw(icon('rotate-ccw', { size: 16, stroke: 2 }))}<span>Play again</span></button>
        </div>
      </div>`);
    const num = end.querySelector('.gm-likely-big__n'); let c = 0;
    const tick = () => { num.textContent = c; if (c < score) { c++; later(tick, 90); } };
    tick();
    sound.play(score >= 7 ? 'fanfare' : 'success', { volume: .8 });
    if (score >= 5) later(() => orbs.celebrate(innerWidth / 2, innerHeight * .4), 250);
    end.querySelector('.gm-likely-share').addEventListener('click', async () => {
      const url = ctx.site.siteUrl || __pageLoc.href.split('#')[0];
      const text = content.share(score, N, t.title);
      try { if (navigator.share) { await navigator.share({ title: 'Who’s more likely to', text, url }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
      (await copyText(text + url)) ? toast('Score copied. Send it to someone you can beat.') : toast('Could not copy: ' + text);
    });
    end.querySelector('.gm-likely-again').addEventListener('click', () => {
      sound.play('pop', { volume: .6 });
      prompts.splice(0, prompts.length, ...shuffle(content.prompts).slice(0, N));
      i = 0; score = 0; done = false; scEl.textContent = '0'; end.hidden = true; play.hidden = false; show();
    });
  }

  const onKey = (e) => {
    if (e.target.closest && e.target.closest('.sheet__close')) return;
    if (['1', '2', '3', '4'].includes(e.key)) { e.preventDefault(); pick(KEYS[+e.key - 1]); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); pick('a'); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); pick('b'); }
  };
  document.addEventListener('keydown', onKey);
  container.querySelectorAll('.gm-likely-pick').forEach((o) => o.addEventListener('click', () => pick(o.dataset.k)));
  let swayed = false;
  swipe.addEventListener('animationend', (e) => {
    if (e.animationName === 'gm-likely-sway') { swipe.classList.remove('is-sway'); return; }
    swipe.classList.remove('is-in');
    // first card only: a small sideways nudge to say "drag me"
    if (!swayed && i === 0 && !prefersReducedMotion()) { swayed = true; swipe.classList.add('is-sway'); }
  });
  const aim = (k) => KEYS.forEach((x) => orbEls[x].classList.toggle('is-aim', x === k));
  let sx = null, sy = 0;
  const setD = (dx, dy) => {
    swipe.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx / 18}deg)`;
    const d = Math.hypot(dx, dy), k = DIR[dirOf(dx, dy)];
    aim(k); stamp.textContent = LABEL[k]; stamp.dataset.k = k; stamp.style.opacity = Math.max(0, Math.min(1, (d - 14) / 70));
  };
  swipe.addEventListener('pointerdown', (e) => { if (locked || done) return; sx = e.clientX; sy = e.clientY; swipe.setPointerCapture(e.pointerId); swipe.style.transition = 'none'; swipe.classList.remove('is-in', 'is-sway'); swipe.classList.add('is-drag'); });
  swipe.addEventListener('pointermove', (e) => { if (sx != null) setD(e.clientX - sx, e.clientY - sy); });
  const release = (e) => {
    if (sx == null) return; const dx = e.clientX - sx, dy = e.clientY - sy; sx = null; swipe.classList.remove('is-drag'); aim(null);
    if (Math.hypot(dx, dy) > 80) pick(DIR[dirOf(dx, dy)]);
    else { swipe.style.transition = 'transform .4s var(--ease)'; swipe.style.transform = ''; stamp.style.opacity = 0; }
  };
  swipe.addEventListener('pointerup', release); swipe.addEventListener('pointercancel', release);
  show();

  return () => { document.removeEventListener('keydown', onKey); timers.forEach(clearTimeout); };
}
