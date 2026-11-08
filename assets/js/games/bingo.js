/**
 * WEDDING BINGO · a 5×5 "spot it at the wedding" card. Shuffled per player, saved in localStorage.
 * export mount(container, ctx) → cleanup     (copy/data: content/games/bingo.js)
 */
import { esc, shuffle, copyText, prefersReducedMotion } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { store } from '../lib/store.js';

const KEY = 'game-bingo';
const FREE = 12;
const LINES = (() => {
  const l = [];
  for (let r = 0; r < 5; r++) l.push([0, 1, 2, 3, 4].map((c) => r * 5 + c));
  for (let c = 0; c < 5; c++) l.push([0, 1, 2, 3, 4].map((r) => r * 5 + c));
  l.push([0, 6, 12, 18, 24], [4, 8, 12, 16, 20]);
  return l;
})();

export function mount(container, ctx) {
  const { content, site, orbs, sound, toast } = ctx;
  const pool = content.moments;
  const timers = [];
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };

  /* ---------- state ---------- */
  const WORD = ['B', 'I', 'N', 'G', 'O'];
  const fresh = () => ({ card: shuffle(pool.slice()).slice(0, 24), marks: [], done: [], letters: 0, over: false });
  let st = store.get(KEY, null);
  if (!st || !Array.isArray(st.card) || st.card.length !== 24 || st.card.some((t) => !pool.includes(t))) st = fresh();
  st.marks = (st.marks || []).filter((i) => i !== FREE && i >= 0 && i < 25);
  st.done = st.done || [];
  st.letters = Math.min(5, st.letters || 0); st.over = st.letters >= 5;
  const save = () => store.set(KEY, st);
  // card index 0..24 → text (centre is free)
  const textAt = (i) => (i === FREE ? null : st.card[i < FREE ? i : i - 1]);
  const isOn = (i) => i === FREE || st.marks.includes(i);
  const lineDone = () => LINES.map((ln, k) => (ln.every(isOn) ? k : -1)).filter((k) => k >= 0);
  const spotted = () => st.marks.length;

  /* ---------- markup ---------- */
  container.classList.add('gm-root', 'gm-bingo');
  container.innerHTML = `
    <div class="gm-bingo-wrap">
      <header class="gm-head">
        <div class="gm-head__title"><span class="gm-eyebrow">Fun House</span><h2 class="gm-h">Wedding <em class="gold">Bingo</em></h2></div>
        <div class="gm-head__stat" aria-live="polite"><b class="gm-bingo-count">0</b><span>/ 24<span class="gm-lg"> spotted</span></span><i class="gm-bingo-lines" aria-label="Bingo letters earned"></i></div>
      </header>
      <div class="gm-bingo-board" data-board><div class="gm-bingo-grid" role="grid" aria-label="Wedding bingo card"></div></div>
      <footer class="gm-foot">
        <p class="gm-foot__hint">${esc(content.intro)}</p>
        <div class="gm-foot__btns">
          <button class="gm-btn gm-btn--ghost" type="button" data-new>${icon('refresh-cw', { size: 16 })}<span>New card</span></button>
          <button class="gm-btn" type="button" data-share>${icon('share-2', { size: 16 })}<span>Share</span></button>
        </div>
      </footer>
      <div class="gm-bingo-overlay" hidden role="dialog" aria-modal="true" aria-label="Bingo">
        <div class="gm-bingo-overlay__in">
          <span class="gm-eyebrow" data-o-eyebrow></span>
          <div class="gm-bingo-word" aria-hidden="true"></div>
          <p class="gm-bingo-quip" data-o-quip></p>
          <div class="gm-foot__btns">
            <button class="gm-btn" type="button" data-keep>Keep playing</button>
            <button class="gm-btn gm-btn--ghost" type="button" data-oshare>${icon('share-2', { size: 16 })}<span>Share</span></button>
            <button class="gm-btn gm-btn--ghost" type="button" data-finish hidden>Finish</button>
          </div>
        </div>
      </div>
    </div>`;
  const q = (s) => container.querySelector(s);
  const grid = q('.gm-bingo-grid');
  const overlay = q('.gm-bingo-overlay');

  function build() {
    grid.innerHTML = '';
    for (let i = 0; i < 25; i++) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'gm-bingo-sq'; b.dataset.i = i; b.setAttribute('role', 'gridcell');
      b.style.setProperty('--d', (i * 22) + 'ms');
      if (i === FREE) {
        b.classList.add('is-free', 'is-on');
        b.innerHTML = `<span class="gm-bingo-free"><i></i>${esc(content.freeLabel || 'Free')}</span><em class="gm-bingo-stamp"></em>`;
        b.setAttribute('aria-label', 'Free square'); b.disabled = true;
      } else {
        b.innerHTML = `<small>${String(i < FREE ? i + 1 : i).padStart(2, '0')}</small><span>${esc(textAt(i))}</span><em class="gm-bingo-stamp"></em>`;
        b.setAttribute('aria-pressed', 'false');
      }
      grid.appendChild(b);
    }
    paint(false);
    grid.classList.remove('is-in'); void grid.offsetWidth; grid.classList.add('is-in');
  }

  function paint(announce = true) {
    const dl = lineDone();
    const inLine = new Set(dl.flatMap((k) => LINES[k]));
    grid.querySelectorAll('.gm-bingo-sq').forEach((b) => {
      const i = +b.dataset.i;
      if (i !== FREE) { const on = isOn(i); b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); b.setAttribute('aria-label', `${textAt(i)}${on ? ', spotted' : ''}`); }
      b.classList.toggle('is-line', inLine.has(i));
    });
    q('.gm-bingo-count').textContent = spotted();
    q('.gm-bingo-lines').innerHTML = WORD.map((c, k) => `<span class="${k < st.letters ? 'is-on' : ''}">${c}</span>`).join('');
    return dl;
  }

  /* ---------- play ---------- */
  function onTap(e) {
    const b = e.target.closest('.gm-bingo-sq'); if (!b || b.disabled) return;
    const i = +b.dataset.i;
    const idx = st.marks.indexOf(i);
    if (st.over) return;
    if (idx >= 0) { st.marks.splice(idx, 1); sound.play('tick', { pitch: .8 }); save(); paint(); return; }
    st.marks.push(i); sound.play('stamp'); 
    const r = b.getBoundingClientRect(); orbs.ripple(r.left + r.width / 2, r.top + r.height / 2, { r1: Math.min(110, r.width * 1.1), life: .8 });
    if (!prefersReducedMotion()) { b.classList.remove('is-stamp'); void b.offsetWidth; b.classList.add('is-stamp'); }
    const dl = paint();
    st.done = dl;
    if (dl.length > st.letters) {
      const from = st.letters; st.letters = Math.min(5, dl.length); save(); paint(false);
      later(() => win(from, st.letters), 450);   // one flip shows every letter earned by this tap
    } else save();
  }
  grid.addEventListener('click', onTap);

  function win(from, to) {
    const over = to >= 5, got = WORD.slice(from, to), n = to - from;
    sound.play(over ? 'fanfare' : 'success');
    q('[data-o-eyebrow]').textContent = over ? 'You got every letter' : n > 1 ? `${n} lines at once: ${got.join(' · ')}` : `A line: ${got[0]}`;
    const word = q('.gm-bingo-word');
    word.innerHTML = WORD.map((c, k) => `<span class="${k < from ? 'is-have' : k < to ? 'is-new' : 'is-dim'}" style="--k:${k < from ? 0 : k - from}">${c}${over && k === 4 ? '!' : ''}</span>`).join('');
    overlay.classList.toggle('is-full', over);
    q('[data-o-quip]').textContent = over ? content.fullQuip : content.lineQuip[Math.min(to, content.lineQuip.length) - 1];
    q('[data-finish]').hidden = !over; q('[data-keep]').hidden = over;
    overlay.hidden = false; void overlay.offsetWidth; overlay.classList.add('is-in');
    const r = grid.getBoundingClientRect();
    orbs.celebrate(r.left + r.width / 2, r.top + r.height / 2);
    if (over) { st.over = true; save(); later(() => orbs.celebrate(innerWidth * .25, innerHeight * .4), 500); later(() => orbs.celebrate(innerWidth * .75, innerHeight * .4), 900); }
    (over ? q('[data-finish]') : q('[data-keep]')).focus({ preventScroll: true });
  }
  const closeOverlay = () => { overlay.classList.remove('is-in'); later(() => { overlay.hidden = true; }, 350); };
  q('[data-keep]').addEventListener('click', closeOverlay);
  q('[data-finish]').addEventListener('click', () => { closeOverlay(); ctx.finish({ score: spotted(), total: 24, label: `BINGO · ${spotted()}/24 spotted` }); });

  /* ---------- new card + share ---------- */
  let armed = 0;
  const newBtn = q('[data-new]');
  newBtn.addEventListener('click', () => {
    if (spotted() > 2 && !armed) {
      newBtn.querySelector('span').textContent = 'Sure? Tap again'; newBtn.classList.add('is-armed');
      armed = setTimeout(() => { armed = 0; newBtn.querySelector('span').textContent = 'New card'; newBtn.classList.remove('is-armed'); }, 2600); timers.push(armed); return;
    }
    clearTimeout(armed); armed = 0; newBtn.querySelector('span').textContent = 'New card'; newBtn.classList.remove('is-armed');
    st = fresh(); save(); grid.classList.remove('is-over'); build(); sound.play('whoosh'); toast('A fresh card, shuffled just for you');
  });
  async function share() {
    const text = `${site.couple.pair[0].first} & ${site.couple.pair[1].first} Wedding Bingo: I have spotted ${spotted()}/24 moments and earned ${st.over ? 'B-I-N-G-O' : st.letters ? WORD.slice(0, st.letters).join('-') : 'no letters yet'}. Beat that. ${site.siteUrl || __pageLoc.href.split('#')[0]}`;
    if (navigator.share) { try { await navigator.share({ text }); return; } catch { /* fall through */ } }
    toast((await copyText(text)) ? 'Copied. Paste it in the family group.' : 'Could not copy');
  }
  q('[data-share]').addEventListener('click', share);
  q('[data-oshare]').addEventListener('click', share);
  const onKey = (e) => { if (e.key === 'Escape' && !overlay.hidden && !st.over) closeOverlay(); };
  window.addEventListener('keydown', onKey);

  build();
  if (st.over) grid.classList.add('is-over');

  return () => { timers.forEach(clearTimeout); window.removeEventListener('keydown', onKey); container.innerHTML = ''; container.classList.remove('gm-root', 'gm-bingo'); };
}
