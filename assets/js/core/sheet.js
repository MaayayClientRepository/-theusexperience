/**
 * KALYANAM v2 · core/sheet.js: "cards that open up". The signature interaction of the whole site.
 *
 *   import { openSheet } from '../core/sheet.js';
 *   const s = openSheet({
 *     from: cardElement,              // the card the sheet grows out of (a clip-path reveal from its exact rectangle)
 *     title: 'Our story',             // small mono label in the top bar
 *     html: String(html`...`) | node, // content (scrolls inside the sheet)
 *     theme: 'light' | 'dark',        // default 'dark'
 *     size: 'default' | 'wide' | 'narrow' | 'fill',   // 'fill' = no padding, content owns the full screen (maps, games)
 *     onOpen(api), onClose(),
 *   });
 *   s.body  s.scroller  s.panel  s.close()  s.setTitle(t)
 *
 * Mechanics: the panel is always full-screen; opening animates clip-path from the card's rectangle (with its border
 * radius) to the whole viewport (GPU-friendly, nothing reflows), then the content rises in. Closing reverses it back
 * into the card (re-measured, so it lands correctly even if the page moved). Sheets stack (a game can open from a
 * sheet). Esc / the × button close the top sheet; focus is trapped and restored; page scroll is locked while open.
 * Emits 'kalyanam:sheet' { open, depth }.
 */
import { emit, prefersReducedMotion } from '../lib/dom.js';
import { icon } from '../lib/icons.js';

const stack = [];
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';
const EASE = 'cubic-bezier(.22,1,.36,1)';
const FULL = 'inset(0px 0px 0px 0px round 0px)';

function clipFrom(rect, radius) {
  const vw = document.documentElement.clientWidth, vh = innerHeight;
  const l = Math.max(0, rect.left), t = Math.max(0, rect.top);
  return `inset(${t}px ${Math.max(0, vw - rect.right)}px ${Math.max(0, vh - rect.bottom)}px ${l}px round ${radius}px)`;
}
const radiusOf = (el) => (el ? parseFloat(getComputedStyle(el).borderTopLeftRadius) || 24 : 24);
function fallbackRect() { const w = Math.min(420, innerWidth * .8), h = 240; return { left: (innerWidth - w) / 2, right: (innerWidth + w) / 2, top: (innerHeight - h) / 2, bottom: (innerHeight + h) / 2 }; }

export function isSheetOpen() { return stack.length > 0; }
export function closeSheet() { const top = stack[stack.length - 1]; if (top) top.close(); }

export function openSheet({ from = null, title = '', html: markup = '', node = null, theme = 'dark', size = 'default', onOpen = null, onClose = null, label = '' } = {}) {
  const reduce = prefersReducedMotion();
  const prevFocus = document.activeElement;
  const root = document.createElement('div');
  root.className = `sheet${size === 'wide' ? ' sheet--wide' : size === 'narrow' ? ' sheet--narrow' : size === 'fill' ? ' sheet--fill' : ''}`;
  root.style.zIndex = String(80 + stack.length * 2);
  root.innerHTML = `
    <div class="sheet__panel" data-theme="${theme}" role="dialog" aria-modal="true" aria-label="${(label || title || 'Details').replace(/"/g, '&quot;')}">
      <div class="sheet__bg" aria-hidden="true"><i></i><i></i></div>
      <div class="sheet__progress" aria-hidden="true"></div>
      <div class="sheet__bar">
        <button class="sheet__close" type="button" aria-label="Close">${icon('x', { size: 18, stroke: 2.4 })}<span>Close</span></button>
        <span class="sheet__title"></span></div>
      <div class="sheet__scroll"><div class="sheet__body"></div></div>
    </div>`;
  document.body.appendChild(root);
  const panel = root.querySelector('.sheet__panel'), scroller = root.querySelector('.sheet__scroll'), body = root.querySelector('.sheet__body');
  root.querySelector('.sheet__title').textContent = title;
  if (node) body.appendChild(node); else body.innerHTML = String(markup);

  const wasLocked = document.documentElement.classList.contains('is-locked');
  document.documentElement.classList.add('is-locked');
  if (from) { from.classList.add('is-lifted'); from.style.visibility = 'hidden'; }

  const rect = from ? from.getBoundingClientRect() : fallbackRect();
  const rad = radiusOf(from);
  const start = clipFrom(rect, rad);
  panel.style.clipPath = start;
  let anim = null, closed = false;
  const run = (a, b, ms, done) => {
    if (reduce || !panel.animate) { panel.style.clipPath = b === FULL ? 'none' : b; done && done(); return; }
    anim = panel.animate([{ clipPath: a }, { clipPath: b }], { duration: ms, easing: EASE, fill: 'forwards' });
    anim.onfinish = () => { if (b === FULL) { panel.style.clipPath = 'none'; anim.cancel(); } done && done(); };
  };

  requestAnimationFrame(() => {
    run(start, FULL, 760, () => { api.opened = true; });
    root.classList.add('is-in');
    const cl = root.querySelector('.sheet__close'); try { cl.focus({ preventScroll: true }); } catch { /* ignore */ }
  });

  scroller.addEventListener('scroll', () => {
    const max = scroller.scrollHeight - scroller.clientHeight;
    panel.style.setProperty('--p', max > 0 ? (scroller.scrollTop / max).toFixed(4) : 0);
  }, { passive: true });

  function close() {
    if (closed) return; closed = true;
    root.classList.remove('is-in');
    const i = stack.indexOf(api); if (i >= 0) stack.splice(i, 1);
    const r2 = from && document.body.contains(from) ? from.getBoundingClientRect() : fallbackRect();
    if (anim) anim.cancel();
    panel.style.clipPath = FULL;
    const end = clipFrom(r2, rad);
    run(FULL, end, 560, finish);
    if (reduce) return;
    setTimeout(finish, 700);
  }
  let finished = false;
  function finish() {
    if (finished) return; finished = true;
    root.remove();
    if (from) { from.style.visibility = ''; from.classList.remove('is-lifted'); }
    if (!stack.length && !wasLocked) document.documentElement.classList.remove('is-locked');
    emit('sheet', { open: stack.length > 0, depth: stack.length });
    try { onClose && onClose(); } catch (e) { console.error(e); }
    try { prevFocus && prevFocus.focus && prevFocus.focus({ preventScroll: true }); } catch { /* ignore */ }
  }

  root.addEventListener('keydown', (e) => {
    if (stack[stack.length - 1] !== api) return;
    if (e.key === 'Escape') { e.stopPropagation(); close(); return; }
    if (e.key !== 'Tab') return;
    const f = Array.from(panel.querySelectorAll(FOCUSABLE)).filter((n) => n.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  root.querySelector('.sheet__close').addEventListener('click', close);

  const api = { el: root, panel, body, scroller, close, opened: false, setTitle: (t) => { root.querySelector('.sheet__title').textContent = t; } };
  stack.push(api);
  emit('sheet', { open: true, depth: stack.length });
  try { onOpen && onOpen(api); } catch (e) { console.error('[sheet] onOpen failed', e); }
  return api;
}

/** Make any element open a sheet on click / Enter / Space. Returns off(). */
export function bindCard(card, getOptions) {
  if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');
  if (!card.hasAttribute('role')) card.setAttribute('role', 'button');
  card.classList.add('card--open');
  // Make "this opens" obvious without words: the gold orb gets a little hand that taps, with a ripple ring.
  // Cards that already carry their own labelled button (e.g. the games' "Play") are left alone.
  if (!card.querySelector('.pl-card__go')) {
    let cue = card.querySelector('.plus');
    if (!cue) { cue = document.createElement('span'); cue.className = 'plus'; cue.setAttribute('aria-hidden', 'true'); card.appendChild(cue); }
    cue.innerHTML = `<span class="plus__ripple"></span>${icon('pointer', { size: 20, stroke: 2 })}`;
    cue.classList.add('plus--tap');
  }
  card.classList.add('card--cue');
  const go = (e) => { if (e.target.closest('a,input,textarea,select,[data-no-open]')) return; const o = typeof getOptions === 'function' ? getOptions() : getOptions; openSheet({ from: card, ...o }); };
  const key = (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target === card) { e.preventDefault(); go(e); } };
  card.addEventListener('click', go); card.addEventListener('keydown', key);
  return () => { card.removeEventListener('click', go); card.removeEventListener('keydown', key); };
}
export const plusIcon = () => `<span class="plus" aria-hidden="true">${icon('plus', { size: 18, stroke: 2.2 })}</span>`;
