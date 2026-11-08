/**
 * KALYANAM v2 · core/dock.js: HUD + bottom dock + active-section tracking.
 * Sections come from <section data-dock data-title data-icon data-theme> in index.html order.
 *  - dock: glass pill with an icon per section; the active one expands (desktop) and a gold indicator glides under it.
 *  - sets <html data-theme> from the section in view (light/dark) so the orbs, glass and text re-theme smoothly.
 *  - goTo(id): smooth scroll. Emits 'kalyanam:section' { id, prev }.
 */
import { $, $$, emit, listen, prefersReducedMotion } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { sound } from '../lib/sound.js';
import { orbs } from './orbs.js';

const S = { items: [], active: null, secs: [], ind: null, dock: null };

export function goTo(id, { instant = false } = {}) {
  const el = document.getElementById(id); if (!el) return;
  document.documentElement.style.scrollSnapType = 'none';
  el.scrollIntoView({ behavior: instant || prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  setTimeout(() => { document.documentElement.style.scrollSnapType = ''; }, 900);
}
export const currentSection = () => S.active;

function place() {
  const it = S.items.find((i) => i.id === S.active); if (!it || !S.ind) return;
  const d = S.dock.getBoundingClientRect(), r = it.btn.getBoundingClientRect();
  S.ind.style.width = r.width + 'px'; S.ind.style.transform = `translateX(${r.left - d.left - 1}px)`;
}

function setActive(id) {
  if (id === S.active) return;
  const prev = S.active; S.active = id;
  S.items.forEach((i) => { const on = i.id === id; i.btn.classList.toggle('is-active', on); if (on) i.btn.setAttribute('aria-current', 'true'); else i.btn.removeAttribute('aria-current'); });
  document.documentElement.classList.toggle('at-end', !S.items.some((i) => i.id === id));
  if (S.ind) S.ind.style.opacity = S.items.some((i) => i.id === id) ? '1' : '0';
  requestAnimationFrame(() => { place(); setTimeout(place, 560); });
  const sec = S.secs.find((s) => s.id === id);
  const theme = sec?.el.dataset.theme || 'light';
  document.documentElement.dataset.theme = theme; orbs.setTheme(theme);
  const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.content = theme === 'dark' ? '#0D0B09' : '#FBF9F4';
  remember(id);
  emit('section', { id, prev });
}

/* Keep the URL hash on the section in view. If the phone discards the tab to free memory and reloads it later, the page
   comes back to the same section (the hash lives on the outer shell page, not on this iframe). */
function remember(id) {
  if (!id || document.documentElement.classList.contains('is-door')) return;
  try { const w = window.parent !== window ? window.parent : window; w.history.replaceState(null, '', '#' + id); } catch (e) { /* cross-origin or blocked: ignore */ }
}

function measure() {
  const mid = innerHeight * .5; let best = null;
  for (const s of S.secs) { const r = s.el.getBoundingClientRect(); if (r.top <= mid && r.bottom > mid) { best = s; break; } }
  if (best) setActive(best.id);
}

export function initDock() {
  listen('door-open', () => setTimeout(() => remember(S.active), 100));
  const dock = S.dock = $('#dock'); if (!dock) return;
  S.secs = $$('main > [data-section]').map((el) => ({ id: el.id, el, dock: el.hasAttribute('data-dock'), title: el.dataset.title || el.id, icon: el.dataset.icon || 'sparkle' }));
  dock.innerHTML = '<span class="dock__ind" aria-hidden="true"></span>';
  S.ind = dock.firstElementChild;
  S.secs.filter((s) => s.dock).forEach((s) => {
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'dock__item'; btn.setAttribute('aria-label', s.title);
    btn.innerHTML = `${icon(s.icon, { size: 19, stroke: 1.8 })}<span>${s.title}</span>`;
    btn.addEventListener('click', () => { sound.play('tick'); goTo(s.id); });
    dock.appendChild(btn); S.items.push({ id: s.id, btn });
  });
  // the footer is not in the dock, but still drives the theme
  let ticking = false;
  addEventListener('scroll', () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { ticking = false; measure(); }); }, { passive: true });
  addEventListener('resize', () => { place(); measure(); });
  document.fonts?.ready.then(() => { place(); });
  measure(); if (!S.active && S.secs[0]) setActive(S.secs[0].id);

  // HUD
  const snd = $('#hud-sound');
  if (snd) {
    const paint = () => { snd.innerHTML = icon(sound.enabled ? 'volume-2' : 'volume-x', { size: 18, stroke: 1.8 }); snd.setAttribute('aria-pressed', String(!!sound.enabled)); snd.setAttribute('aria-label', sound.enabled ? 'Sound on. Tap to mute' : 'Sound off. Tap to turn on'); };
    paint(); snd.addEventListener('click', () => { sound.toggle(); sound.unlock(); sound.play('chime'); paint(); }); listen('sound', paint);
  }
  $$('[data-goto]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); goTo(a.dataset.goto); }));
}
