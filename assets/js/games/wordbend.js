/** WORD BEND · bending-path word game. Contract: mount(container, ctx) → cleanup. Copy + grids: content/games/wordbend.js */
import { esc, shuffle, prefersReducedMotion } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { resultCard } from '../lib/gameEnd.js';

const DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0]];
const HUES = ['#EFD68C', '#F2A7B6', '#8FD3C8', '#B9A7F2', '#F2B88A', '#9CC8F2', '#C8E58F'];

// all placements of `word` (forward) in the grid: arrays of cell indices
function placements(rows, word) {
  const R = rows.length, C = rows[0].length, out = [];
  const go = (x, y, i, used) => {
    if (rows[y][x] !== word[i]) return;
    used.push(y * C + x);
    if (i === word.length - 1) out.push([...used]);
    else for (const [dx, dy] of DIRS) { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < C && ny < R && !used.includes(ny * C + nx)) go(nx, ny, i + 1, used); }
    used.pop();
  };
  for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) go(x, y, 0, []);
  return out;
}

export function mount(container, ctx) {
  const { content: C, sound, orbs, finish } = ctx;
  const P = C.puzzles, N = P.length, TOTAL = N * 100;
  let pi = 0, score = 0, slips = 0, hints = 0, rows, R, W, cells, answers, found, path, hintCell, won = false, done = false, end = null, drag = false, started = false;
  const timers = [];
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };

  container.innerHTML = `
    <div class="gx gx-wb">
      <div class="pl-gh">
        <span class="pl-gh__title">Word <em>bend</em></span>
        <span class="pl-gh__mid gx-n"></span>
        <span class="pl-gh__right">Points <b class="gx-score">0</b></span>
      </div>
      <div class="gx-body gx-wb-body">
        <div class="pl-dots gx-dots"></div>
        <h3 class="gx-wb-title"></h3>
        <div class="gx-wb-cur" aria-live="polite"><span></span></div>
        <div class="gx-wb-board" aria-label="Letter grid. Drag through neighbouring letters to spell an answer.">
          <svg class="gx-wb-lines" aria-hidden="true"></svg>
          <div class="gx-wb-grid"></div>
        </div>
        <ul class="gx-wb-clues"></ul>
        <div class="gx-wb-tools">
          <button class="pl-gbtn pl-gbtn--ghost gx-wb-hint" type="button">${icon('lightbulb', { size: 15, stroke: 2 })}<span>Hint</span></button>
          <button class="pl-gbtn pl-gbtn--ghost gx-wb-shuf" type="button">${icon('shuffle', { size: 15, stroke: 2 })}<span>Shuffle clues</span></button>
        </div>
        <span class="gx-hint gx-wb-help">${esc(C.hint)}</span>
        <div class="gx-wb-reveal" hidden aria-live="polite">
          <div class="gx-wb-pts"><span class="gx-badge"></span><b class="gx-wb-pn">+0</b></div>
          <p class="gx-wb-note"></p>
          <button class="pl-gbtn gx-next" type="button"><span>Next</span>${icon('arrow-right', { size: 16, stroke: 2 })}</button>
        </div>
      </div>
    </div>`;
  const $ = (s) => container.querySelector(s);
  const root = $('.gx-wb'), body = $('.gx-wb-body'), board = $('.gx-wb-board'), grid = $('.gx-wb-grid'), lines = $('.gx-wb-lines'), cur = $('.gx-wb-cur span'), list = $('.gx-wb-clues'), dots = $('.gx-dots'), reveal = $('.gx-wb-reveal'), tools = $('.gx-wb-tools');

  const xy = (i) => [(i % W) * 100 + 50, Math.floor(i / W) * 100 + 50];
  const pts = (ids) => ids.map((i) => xy(i).join(',')).join(' ');
  function paint() {
    let h = '';
    answers.forEach((a, k) => { if (found[k]) h += `<polyline class="gx-wb-ln gx-wb-ln--ok" style="--c:${HUES[k % HUES.length]}" points="${pts(found[k])}"/>`; });
    if (path.length > 1) h += `<polyline class="gx-wb-ln gx-wb-ln--cur" points="${pts(path)}"/>`;
    lines.innerHTML = h;
    const owner = {}; found.forEach((ids, k) => ids && ids.forEach((i) => { owner[i] = k; }));
    [...grid.children].forEach((el, i) => {
      const k = owner[i];
      el.classList.toggle('is-found', k != null); el.style.setProperty('--c', k != null ? HUES[k % HUES.length] : '');
      el.classList.toggle('is-sel', path.includes(i)); el.classList.toggle('is-hint', i === hintCell);
    });
    cur.textContent = path.map((i) => cells[i]).join('') || ' ';
    cur.parentElement.classList.toggle('is-on', path.length > 0);
  }
  function renderClues() {
    list.innerHTML = clueOrder.map((k) => {
      const c = P[pi].clues[k], ok = !!found[k];
      return `<li class="gx-wb-clue${ok ? ' is-ok' : ''}" style="--c:${HUES[k % HUES.length]}"><span class="gx-wb-pat">${ok ? esc(c.a) : esc('_ '.repeat(c.a.length).trim())}</span><span class="gx-wb-q">${esc(qsel[k])}</span></li>`;
    }).join('');
  }
  let clueOrder = [], qsel = [];

  function show() {
    const pz = P[pi]; rows = pz.rows; R = rows.length; W = rows[0].length; cells = rows.join('').split('');
    answers = pz.clues.map((c) => c.a); qsel = pz.clues.map((c) => (c.qs ? c.qs[Math.floor(Math.random() * c.qs.length)] : c.q)); found = answers.map(() => null); path = []; slips = 0; hints = 0; hintCell = -1; won = false; drag = false;
    board.style.setProperty('--cols', W); board.style.setProperty('--rows', R);
    lines.setAttribute('viewBox', `0 0 ${W * 100} ${R * 100}`);
    grid.innerHTML = cells.map((ch) => `<i class="gx-wb-cell"><b>${esc(ch)}</b></i>`).join('');
    clueOrder = answers.map((_, k) => k);
    $('.gx-n').textContent = `Puzzle ${pi + 1} / ${N}`;
    [...dots.children].forEach((d, n) => { d.className = n < pi ? 'is-done' : n === pi ? 'is-now' : ''; });
    $('.gx-wb-title').textContent = pz.title;
    reveal.hidden = true; tools.hidden = false; $('.gx-wb-help').hidden = false;
    renderClues(); paint();
    board.classList.remove('is-in'); void board.offsetWidth; board.classList.add('is-in'); container.scrollTop = 0;
  }
  function begin() {
    started = true; score = 0; done = false; $('.gx-score').textContent = '0';
    dots.innerHTML = P.map(() => '<i></i>').join('');
    if (end) { end.stop(); end.node.remove(); end = null; }
    body.hidden = false; pi = 0; show();
  }

  const cellAt = (e) => {
    const r = grid.getBoundingClientRect(), cw = r.width / W, ch = r.height / R;
    const fx = (e.clientX - r.left) / cw, fy = (e.clientY - r.top) / ch; if (fx < 0 || fy < 0 || fx >= W || fy >= R) return -1;
    const cx = Math.floor(fx), cy = Math.floor(fy);
    if (Math.hypot(fx - cx - .5, fy - cy - .5) > .46) return -1; // ignore the corners, so a diagonal sweep does not misfire
    return cy * W + cx;
  };
  const taken = (i) => found.some((ids) => ids && ids.includes(i));
  function onDown(e) {
    if (!started || won || done) return; const i = cellAt(e); if (i < 0 || taken(i)) return;
    hintCell = -1; path = [i]; drag = true; try { board.setPointerCapture(e.pointerId); } catch (_) {} sound.play('tick', { volume: .3 }); paint();
  }
  function onMove(e) {
    if (!drag) return; const i = cellAt(e); if (i < 0) return; const last = path[path.length - 1]; if (i === last) return;
    if (path.length > 1 && i === path[path.length - 2]) { path.pop(); paint(); return; }
    const adj = Math.abs((i % W) - (last % W)) + Math.abs(Math.floor(i / W) - Math.floor(last / W)) === 1;
    if (!adj || path.includes(i) || taken(i)) return;
    path.push(i); sound.play('tick', { volume: .3 }); paint();
  }
  function onUp() {
    if (!drag) return; drag = false;
    const word = path.map((i) => cells[i]).join(''), rev = [...word].reverse().join('');
    const k = path.length > 1 ? answers.findIndex((a, n) => !found[n] && (a === word || a === rev)) : -1;
    if (k >= 0) { found[k] = path.slice(); path = []; sound.play('chime', { volume: .8 }); renderClues(); paint(); if (found.every(Boolean)) win(); else flash(k); }
    else {
      if (path.length > 2) { slips++; sound.play('sad', { volume: .35 }); board.classList.remove('is-shake'); void board.offsetWidth; board.classList.add('is-shake'); }
      path = []; paint();
    }
  }
  const flash = (k) => { const li = list.children[clueOrder.indexOf(k)]; if (li) { li.classList.remove('is-pop'); void li.offsetWidth; li.classList.add('is-pop'); } };

  function win() {
    won = true; const pts = Math.max(20, 100 - 5 * slips - 15 * hints); score += pts; $('.gx-score').textContent = score;
    sound.play(pts >= 85 ? 'fanfare' : 'success', { volume: .8 });
    tools.hidden = true; $('.gx-wb-help').hidden = true;
    const badge = $('.gx-wb-pts .gx-badge'); badge.className = 'gx-badge ' + (pts >= 70 ? 'is-hit' : 'is-miss'); badge.textContent = pts === 100 ? 'Clean sweep' : pts >= 70 ? 'Nicely done' : 'Got there';
    $('.gx-wb-pn').textContent = '+' + pts;
    $('.gx-wb-note').textContent = slips + hints === 0 ? 'Not a single slip or hint.' : `${slips} slip${slips === 1 ? '' : 's'}, ${hints} hint${hints === 1 ? '' : 's'}.`;
    $('.gx-next span').textContent = pi === N - 1 ? 'See my result' : 'Next puzzle';
    later(() => {
      reveal.hidden = false; reveal.classList.remove('is-in'); void reveal.offsetWidth; reveal.classList.add('is-in');
      if (!prefersReducedMotion()) { const r = board.getBoundingClientRect(); orbs.burst(r.left + r.width / 2, r.top + r.height / 2, { count: pts >= 85 ? 30 : 16, power: .9 }); }
      $('.gx-next').focus({ preventScroll: true });
    }, 450);
  }
  function hint() {
    if (won || done || !started) return; const open = answers.map((a, k) => k).filter((k) => !found[k]); if (!open.length) return;
    const k = open[Math.floor(Math.random() * open.length)], pl = placements(rows, answers[k])[0]; if (!pl) return;
    hints++; hintCell = pl[0]; paint();
    flash(k); const q = list.children[clueOrder.indexOf(k)]; if (q) q.classList.add('is-hinted');
    sound.play('pop', { volume: .5 });
  }
  function reshuffle() { if (won || done) return; clueOrder = shuffle(clueOrder); renderClues(); }
  function next() { if (!won || done) return; if (pi < N - 1) { pi++; show(); } else results(); }

  function results() {
    done = true;
    const ratio = score / TOTAL, t = C.tiers.find((x) => ratio >= x.min) || C.tiers[C.tiers.length - 1];
    const prev = ctx.best;
    finish({ score, total: TOTAL, label: `${score}/${TOTAL} · ${t.title}` });
    body.hidden = true; $('.gx-n').textContent = 'Result';
    end = resultCard(ctx, {
      eyebrow: 'Your score', big: score, of: TOTAL, title: t.title, line: t.line, good: ratio >= .6,
      prev: prev && prev.total ? `${prev.score}/${prev.total}` : '',
      shareTitle: 'Word Bend', shareText: C.share(score, TOTAL, t.title), onAgain: begin,
    });
    root.appendChild(end.node);
  }

  board.addEventListener('pointerdown', onDown); board.addEventListener('pointermove', onMove);
  board.addEventListener('pointerup', onUp); board.addEventListener('pointercancel', onUp);
  $('.gx-wb-hint').addEventListener('click', hint); $('.gx-wb-shuf').addEventListener('click', reshuffle);
  $('.gx-next').addEventListener('click', next);
  const onKey = (e) => { if (e.key === 'Enter' && won && !done && e.target.tagName !== 'BUTTON') { e.preventDefault(); next(); } };
  document.addEventListener('keydown', onKey);
  begin();

  return () => { document.removeEventListener('keydown', onKey); timers.forEach(clearTimeout); if (end) end.stop(); };
}
