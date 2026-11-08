/**
 * KALYANAM v2 · boot loader.
 * Loads content, starts the core systems, mounts every section (each isolated: one failure never blanks the page).
 * Section contract:  export function mount(el, ctx)   ctx = { content, site }
 * Game contract:     assets/js/games/<id>.js  export function mount(container, ctx) → cleanup   (see content/play.js)
 */
import { emit, listen, $ } from './lib/dom.js';
import { session } from './lib/store.js';
import { sound } from './lib/sound.js';
import { orbs } from './core/orbs.js';
import { initDock, goTo } from './core/dock.js';
import { initCursor } from './core/cursor.js';
import { openSheet } from './core/sheet.js';
import { initSnap } from './core/snap.js';

const SECTIONS = ['door', 'home', 'story', 'us', 'wedding', 'rsvp', 'play', 'karur', 'footer'];
const CONTENT = ['site', 'home', 'story', 'us', 'wedding', 'play', 'karur', 'rsvp', 'footer'];
const g = window;

if (g.gsap) {
  const plugins = ['ScrollTrigger', 'Draggable', 'InertiaPlugin', 'MotionPathPlugin', 'DrawSVGPlugin', 'SplitText', 'ScrollToPlugin', 'CustomEase', 'Flip', 'TextPlugin'].map((n) => g[n]).filter(Boolean);
  g.gsap.registerPlugin(...plugins); g.gsap.config({ nullTargetWarn: false });
  if (g.ScrollTrigger) g.ScrollTrigger.config({ ignoreMobileResize: true });
}
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
const safe = (label, fn) => { try { return fn(); } catch (err) { console.error(`[kalyanam] ${label} failed`, err); } };

async function loadContent() {
  const results = await Promise.allSettled(CONTENT.map((n) => import(`../../content/${n}.js`)));
  const content = {};
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') content[CONTENT[i]] = r.value.default ?? r.value;
    else { content[CONTENT[i]] = {}; console.error(`[kalyanam] content/${CONTENT[i]}.js failed`, r.reason); }
  });
  // per-game content
  content.games = {};
  const list = content.play?.games || [];
  const gr = await Promise.allSettled(list.map((x) => import(`../../content/games/${x.id}.js`)));
  gr.forEach((r, i) => { if (r.status === 'fulfilled') content.games[list[i].id] = r.value.default ?? r.value; else console.warn(`[kalyanam] content/games/${list[i].id}.js missing`); });
  return content;
}

async function boot() {
  const content = await loadContent();
  const site = content.site || {};
  g.kalyanam2 = { content, site, orbs, goTo, openSheet, introDone: false };

  safe('orbs', () => orbs.init());
  safe('sound', () => sound.init());
  safe('dock', () => initDock());
  safe('cursor', () => initCursor());
  safe('snap', () => initSnap());

  const root = document.documentElement;
  const finishDoor = (skipped) => {
    if (g.kalyanam2.introDone) return;
    g.kalyanam2.introDone = true;
    root.classList.remove('is-door');
    if (!skipped) session.set('doorSeen', true);
    orbs.setBoost(1);
    requestAnimationFrame(() => g.ScrollTrigger && g.ScrollTrigger.refresh());
    const hash = decodeURIComponent(location.hash.slice(1));
    if (hash && $(`#${CSS.escape(hash)}`)) setTimeout(() => goTo(hash, { instant: true }), 60);
    emit('ready', { skipped });
  };
  listen('door-open', () => finishDoor(false));

  const mods = await Promise.allSettled(SECTIONS.map((s) => import(`./sections/${s}.js`)));
  const ctx = { content, site };
  mods.forEach((r, i) => {
    const id = SECTIONS[i], elm = document.getElementById(id);
    if (r.status !== 'fulfilled') { console.error(`[kalyanam] sections/${id}.js failed to load`, r.reason); return; }
    if (elm && typeof r.value.mount === 'function') safe(`mount(${id})`, () => r.value.mount(elm, ctx));
  });

  // No door shown (?skipdoor=1, already seen, or the door failed): go straight in.
  const doorEl = document.getElementById('door');
  if (!root.classList.contains('is-door') || !doorEl || !doorEl.childElementCount) { root.classList.remove('is-door'); setTimeout(() => finishDoor(true), 30); emit('door-open', { skipped: true }); }

  root.classList.add('is-ready');
  document.fonts?.ready.then(() => g.ScrollTrigger && g.ScrollTrigger.refresh());
}

boot().catch((err) => { console.error('[kalyanam] boot failed', err); document.documentElement.classList.remove('is-door'); });
