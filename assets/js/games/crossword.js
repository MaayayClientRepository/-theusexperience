/** CROSSWORD · about Prem, Nivitha and the wedding. Contract: mount(container, ctx) → cleanup. Copy + grid: content/games/crossword.js */
import { esc, prefersReducedMotion } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { resultCard } from '../lib/gameEnd.js';

const KEYS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export function mount(container, ctx) {
  const { content: C, sound, orbs, finish } = ctx;
  const rows = C.rows, H = rows.length, W = rows[0].length;
  // ----- model: entries with cells, numbers, per-cell lookups
  const entries = C.entries.map((e) => ({ ...e, cells: [...e.a].map((_, k) => (e.r + (e.d === 'd' ? k : 0)) * W + e.c + (e.d === 'a' ? k : 0)) }));
  const starts = new Map(); entries.forEach((e) => starts.set(e.cells[0], true));
  let num = 0; const numAt = {}; for (let i = 0; i < W * H; i++) if (starts.has(i)) numAt[i] = ++num;
  entries.forEach((e) => { e.n = numAt[e.cells[0]]; });
  const byCell = {}; entries.forEach((e, k) => e.cells.forEach((i) => { (byCell[i] = byCell[i] || {})[e.d] = k; }));
  const ans = (i) => rows[Math.floor(i / W)][i % W];
  const open = (i) => ans(i) !== '.';
  const ordered = entries.map((e, k) => k).sort((x, y) => entries[x].n - entries[y].n || (entries[x].d === 'a' ? -1 : 1));

  let val = {}, wrong = new Set(), reveal = new Set(), sel = -1, dir = 'a', checks = 0, reveals = 0, secs = 0, tick = null, won = false, done = false, started = false, end = null;
  const timers = [];

  container.innerHTML = `
    <div class="gx gx-cw">
      <div class="pl-gh">
        <span class="pl-gh__title">The <em>crossword</em></span>
        <span class="pl-gh__mid gx-cw-time">0:00</span>
        <span class="pl-gh__right">Done <b class="gx-score">0/${entries.length}</b></span>
      </div>
      <div class="gx-body gx-cw-body">
        <div class="gx-cw-bar">
          <button class="gx-cw-nav" type="button" data-n="-1" aria-label="Previous clue">${icon('chevron-left', { size: 18, stroke: 2.2 })}</button>
          <p class="gx-cw-clue" aria-live="polite"><b></b><span></span></p>
          <button class="gx-cw-nav" type="button" data-n="1" aria-label="Next clue">${icon('chevron-right', { size: 18, stroke: 2.2 })}</button>
        </div>
        <div class="gx-cw-main">
          <div class="gx-cw-board" style="--n:${W}"></div>
          <div class="gx-cw-side">
            <div class="gx-cw-list" data-d="a"><h4>Across</h4><ol></ol></div>
            <div class="gx-cw-list" data-d="d"><h4>Down</h4><ol></ol></div>
          </div>
        </div>
        <div class="gx-cw-tools">
          <button class="pl-gbtn pl-gbtn--ghost gx-cw-check" type="button">${icon('check', { size: 15, stroke: 2 })}<span>Check</span></button>
          <button class="pl-gbtn pl-gbtn--ghost gx-cw-rev" type="button">${icon('lightbulb', { size: 15, stroke: 2 })}<span>Reveal word</span></button>
        </div>
        <div class="gx-cw-kb" aria-label="On-screen keyboard">
          ${KEYS.map((r, n) => `<div class="gx-cw-kr">${[...r].map((k) => `<button type="button" data-k="${k}">${k}</button>`).join('')}${n === 2 ? `<button type="button" data-k="⌫" class="is-wide" aria-label="Backspace">⌫</button>` : ''}</div>`).join('')}
        </div>
        <span class="gx-hint gx-cw-help">${esc(C.hint)}</span>
        <div class="gx-start gx-cw-start">
          <p class="gx-intro">${esc(C.intro)}</p>
          <button class="pl-gbtn gx-cw-go" type="button">${icon('pencil', { size: 16, stroke: 2 })}<span>Begin</span></button>
        </div>
      </div>
    </div>`;
  const $ = (s) => container.querySelector(s);
  const root = $('.gx-cw'), body = $('.gx-cw-body'), board = $('.gx-cw-board');
  const clueB = $('.gx-cw-clue b'), clueS = $('.gx-cw-clue span');

  // ----- build board + clue lists once
  board.innerHTML = Array.from({ length: W * H }, (_, i) => open(i)
    ? `<i class="gx-cw-c" data-i="${i}">${numAt[i] ? `<sup>${numAt[i]}</sup>` : ''}<b></b></i>` : '<i class="gx-cw-c is-black"></i>').join('');
  const cellEls = [...board.children];
  ['a', 'd'].forEach((d) => {
    $(`.gx-cw-list[data-d="${d}"] ol`).innerHTML = ordered.filter((k) => entries[k].d === d).map((k) => `<li data-k="${k}"><span>${entries[k].n}</span>${esc(entries[k].clue)}</li>`).join('');
  });
  const liEl = (k) => container.querySelector(`.gx-cw-list li[data-k="${k}"]`);

  // ----- helpers
  const entryOf = (i, d) => { const m = byCell[i] || {}; return m[d] != null ? m[d] : m[d === 'a' ? 'd' : 'a']; };
  const active = () => (sel < 0 ? null : entries[entryOf(sel, dir)]);
  const complete = (e) => e.cells.every((i) => val[i] === ans(i));

  function paint() {
    const e = active(), cells = e ? new Set(e.cells) : new Set();
    cellEls.forEach((el, i) => {
      if (!open(i)) return;
      el.querySelector('b').textContent = val[i] || '';
      el.classList.toggle('is-act', cells.has(i)); el.classList.toggle('is-sel', i === sel);
      el.classList.toggle('is-wrong', wrong.has(i)); el.classList.toggle('is-rev', reveal.has(i));
    });
    if (e) { clueB.textContent = `${e.n} ${e.d === 'a' ? 'Across' : 'Down'}`; clueS.textContent = e.clue; }
    let n = 0; entries.forEach((en, k) => { const ok = complete(en); if (ok) n++; const li = liEl(k); li.classList.toggle('is-ok', ok); li.classList.toggle('is-now', en === e); });
    $('.gx-score').textContent = `${n}/${entries.length}`;
    return n;
  }
  function select(i, d) {
    if (!open(i)) return; const same = i === sel;
    if (d) dir = d; else if (same && byCell[i].a != null && byCell[i].d != null) dir = dir === 'a' ? 'd' : 'a';
    else if (byCell[i][dir] == null) dir = dir === 'a' ? 'd' : 'a';
    sel = i; paint(); sound.play('tick', { volume: .25 });
    const li = liEl(entryOf(i, dir)); if (li && li.scrollIntoView && getComputedStyle($('.gx-cw-side')).display !== 'none') li.parentElement.parentElement.scrollTop = Math.max(0, li.offsetTop - 60);
  }
  function selectEntry(k, atFirstEmpty = true) {
    const e = entries[k]; dir = e.d; const t = atFirstEmpty ? (e.cells.find((i) => !val[i]) ?? e.cells[0]) : e.cells[0]; sel = t; paint(); sound.play('tick', { volume: .25 });
  }
  function nav(step) {
    const cur = active(); const pos = ordered.indexOf(entries.indexOf(cur)); selectEntry(ordered[(pos + step + ordered.length) % ordered.length]);
  }
  function type(ch) {
    if (!started || won || done || sel < 0) return; const e = active(); wrong.delete(sel); val[sel] = ch; reveal.delete(sel);
    sound.play('type', { volume: .35 });
    const idx = e.cells.indexOf(sel); const nxt = e.cells.slice(idx + 1).find((i) => !val[i]) ?? e.cells[idx + 1];
    if (nxt != null) sel = nxt;
    const n = paint(); if (entries.every(complete)) win(); else if (complete(e)) { sound.play('chime', { volume: .5 }); }
  }
  function back() {
    if (!started || won || done || sel < 0) return; const e = active(), idx = e.cells.indexOf(sel);
    if (val[sel]) { delete val[sel]; wrong.delete(sel); } else if (idx > 0) { sel = e.cells[idx - 1]; delete val[sel]; wrong.delete(sel); }
    paint();
  }
  function check() {
    if (won || done || !started) return; checks++; wrong = new Set(Object.keys(val).map(Number).filter((i) => val[i] && val[i] !== ans(i)));
    sound.play(wrong.size ? 'sad' : 'chime', { volume: .5 }); paint();
    const t = $('.gx-cw-help'); t.hidden = false; t.textContent = wrong.size ? `${wrong.size} square${wrong.size === 1 ? ' is' : 's are'} wrong. They're marked in red.` : 'Everything filled in so far is right.';
  }
  function revealWord() {
    if (won || done || !started || sel < 0) return; const e = active(); reveals++;
    e.cells.forEach((i) => { val[i] = ans(i); reveal.add(i); wrong.delete(i); }); sound.play('pop', { volume: .5 });
    paint(); if (entries.every(complete)) win();
  }

  function begin() {
    started = true; $('.gx-cw-start').hidden = true; val = {}; wrong = new Set(); reveal = new Set(); checks = reveals = secs = 0; won = done = false;
    if (end) { end.stop(); end.node.remove(); end = null; }
    body.hidden = false; $('.gx-cw-time').textContent = '0:00'; selectEntry(ordered[0], false);
    clearInterval(tick); tick = setInterval(() => { secs++; $('.gx-cw-time').textContent = mmss(secs); }, 1000);
  }
  function win() {
    won = true; clearInterval(tick); done = true;
    const score = Math.max(0, 100 - 6 * reveals - 2 * checks), t = C.tiers.find((x) => score >= x.min) || C.tiers[C.tiers.length - 1];
    const prev = ctx.best; finish({ score, total: 100, label: `${score}/100 · ${t.title}` });
    sound.play('fanfare', { volume: .8 });
    later(() => {
      body.hidden = true; $('.gx-score').textContent = `${entries.length}/${entries.length}`;
      end = resultCard(ctx, {
        eyebrow: `Solved in ${mmss(secs)}`, big: score, of: 100, title: t.title, line: t.line, good: score >= 60,
        extra: `<p class="gx-prev">${reveals} word${reveals === 1 ? '' : 's'} revealed · ${checks} check${checks === 1 ? '' : 's'}</p>`,
        prev: prev && prev.total ? `${prev.score}/${prev.total}` : '', shareTitle: 'The crossword', shareText: C.share(score, t.title), onAgain: begin,
      });
      root.appendChild(end.node);
    }, 900);
    if (!prefersReducedMotion()) { const r = board.getBoundingClientRect(); orbs.burst(r.left + r.width / 2, r.top + r.height / 2, { count: 34, power: 1 }); }
  }
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };

  // ----- input
  board.addEventListener('click', (e) => { const el = e.target.closest('.gx-cw-c'); if (el && el.dataset.i != null && started && !done) select(+el.dataset.i); });
  container.querySelectorAll('.gx-cw-nav').forEach((b) => b.addEventListener('click', () => started && !done && nav(+b.dataset.n)));
  container.querySelectorAll('.gx-cw-list li').forEach((li) => li.addEventListener('click', () => started && !done && selectEntry(+li.dataset.k)));
  container.querySelectorAll('.gx-cw-kb button').forEach((b) => b.addEventListener('click', () => (b.dataset.k === '⌫' ? back() : type(b.dataset.k))));
  $('.gx-cw-check').addEventListener('click', check); $('.gx-cw-rev').addEventListener('click', revealWord);
  $('.gx-cw-go').addEventListener('click', () => { sound.play('pop', { volume: .6 }); begin(); });
  const onKey = (e) => {
    if (!started || done || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest && e.target.closest('.sheet__close')) return;
    const k = e.key;
    if (/^[a-zA-Z]$/.test(k)) { e.preventDefault(); type(k.toUpperCase()); }
    else if (k === 'Backspace') { e.preventDefault(); back(); }
    else if (k === 'Tab') { e.preventDefault(); nav(e.shiftKey ? -1 : 1); }
    else if (k === ' ') { e.preventDefault(); if (sel >= 0) select(sel); }
    else if (k.startsWith('Arrow') && sel >= 0) {
      e.preventDefault(); const [dx, dy] = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[k];
      let x = sel % W, y = Math.floor(sel / W);
      for (let s = 0; s < W; s++) { x += dx; y += dy; if (x < 0 || y < 0 || x >= W || y >= H) break; if (open(y * W + x)) { select(y * W + x, dx ? 'a' : 'd'); break; } }
    }
  };
  document.addEventListener('keydown', onKey);
  // show the (empty) grid behind the intro
  cellEls.forEach((el) => { if (el.dataset.i != null) el.querySelector('b').textContent = ''; });

  return () => { document.removeEventListener('keydown', onKey); clearInterval(tick); timers.forEach(clearTimeout); if (end) end.stop(); };
}
