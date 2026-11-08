/**
 * DOM + math + timing helpers shared by every module.
 * Keep this file dependency-free.
 */

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/** addEventListener that returns an `off()` function. */
export function on(target, type, handler, opts) {
  target.addEventListener(type, handler, opts);
  return () => target.removeEventListener(type, handler, opts);
}

/** Dispatch a namespaced window event, e.g. emit('section', { id }) -> 'kalyanam:section'. */
export function emit(name, detail = {}) {
  window.dispatchEvent(new CustomEvent(`kalyanam:${name}`, { detail }));
}
/** Listen to a namespaced window event. Returns off(). */
export function listen(name, handler) {
  const fn = (e) => handler(e.detail, e);
  window.addEventListener(`kalyanam:${name}`, fn);
  return () => window.removeEventListener(`kalyanam:${name}`, fn);
}

/* ---------- HTML templating ---------- */
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
/** Escape text for safe insertion into HTML. */
export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

class Raw { constructor(s) { this.s = String(s ?? ''); } toString() { return this.s; } }
/** Mark a string as trusted HTML so `html` will not escape it (use for SVG/art/icons). */
export const raw = (s) => new Raw(s);

/**
 * Tagged template that escapes interpolations unless wrapped with raw().
 * Arrays are joined (each item escaped unless raw / already produced by html``).
 * Returns a Raw, so nested html`` calls are not double-escaped. Use String(result) or .toString().
 */
export function html(strings, ...vals) {
  let out = '';
  strings.forEach((s, i) => {
    out += s;
    if (i < vals.length) out += fmt(vals[i]);
  });
  return new Raw(out);
}
function fmt(v) {
  if (v == null || v === false) return '';
  if (v instanceof Raw) return v.s;
  if (Array.isArray(v)) return v.map(fmt).join('');
  return esc(v);
}

/** Create a single Element from an HTML string (or Raw). */
export function el(markup) {
  const t = document.createElement('template');
  t.innerHTML = String(markup).trim();
  return t.content.firstElementChild;
}
/** Create a DocumentFragment from an HTML string. */
export function frag(markup) {
  const t = document.createElement('template');
  t.innerHTML = String(markup).trim();
  return t.content;
}

/**
 * Allow a tiny, safe subset of inline markup inside content strings:
 * *italic*, **bold**, and line breaks (\n). Everything else is escaped.
 */
export function richText(str) {
  return esc(str)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

/* ---------- Math ---------- */
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const mapRange = (v, inMin, inMax, outMin, outMax) => outMin + ((v - inMin) * (outMax - outMin)) / (inMax - inMin);
export const rand = (min = 0, max = 1) => min + Math.random() * (max - min);
export const randInt = (min, max) => Math.floor(rand(min, max + 1));
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- Timing ---------- */
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
export const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));
export function debounce(fn, ms = 150) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}
export function throttle(fn, ms = 100) {
  let last = 0, t;
  return (...a) => {
    const now = performance.now();
    const left = ms - (now - last);
    if (left <= 0) { last = now; fn(...a); }
    else { clearTimeout(t); t = setTimeout(() => { last = performance.now(); fn(...a); }, left); }
  };
}

/**
 * requestAnimationFrame loop with start/stop. fn(dt, t) receives seconds since last frame.
 * Automatically stops while the tab is hidden.
 */
export function createLoop(fn) {
  let id = 0, last = 0, running = false;
  const tick = (t) => {
    id = 0;
    if (!running) return;
    const dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016;
    last = t;
    fn(dt, t / 1000);
    // fn() may have called stop() (and even start() again) — never schedule a second frame.
    if (running && !id && !document.hidden) id = requestAnimationFrame(tick);
  };
  const loop = {
    start() { if (running) return; running = true; last = 0; if (!id && !document.hidden) id = requestAnimationFrame(tick); },
    stop() { running = false; if (id) { cancelAnimationFrame(id); id = 0; } },
    get running() { return running; },
  };
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if (id) { cancelAnimationFrame(id); id = 0; } }
    else if (running && !id) { last = 0; id = requestAnimationFrame(tick); }
  });
  return loop;
}

/* ---------- Environment ---------- */
const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const mqCoarse = window.matchMedia('(hover: none), (pointer: coarse)');
export const prefersReducedMotion = () => mqReduce.matches;
export const isTouch = () => mqCoarse.matches;
export const isMobile = () => window.innerWidth < 768;
export const isIOS = () => /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
/** Rough device capability tier: 'low' | 'mid' | 'high' — use to scale particle counts etc. */
export function perfTier() {
  const cores = navigator.hardwareConcurrency || 4;
  const mem = navigator.deviceMemory || 4;
  if (prefersReducedMotion()) return 'low';
  if (cores <= 4 || mem <= 2) return 'low';
  if (isMobile() || cores <= 6) return 'mid';
  return 'high';
}

/* ---------- Visibility ---------- */
/**
 * Call cb(entry) when el becomes visible. once=true disconnects after first hit.
 * Returns a disconnect function.
 */
export function onVisible(el, cb, { once = true, rootMargin = '0px 0px -10% 0px', threshold = 0.15 } = {}) {
  if (!('IntersectionObserver' in window)) { cb({ isIntersecting: true, target: el }); return () => {}; }
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        cb(entry);
        if (once) io.disconnect();
      }
    }
  }, { rootMargin, threshold });
  io.observe(el);
  return () => io.disconnect();
}

/**
 * Track enter/leave of the viewport — use it to start/stop loops and pause CSS animations.
 * Adds/removes `.is-paused` on el automatically unless { pauseClass: false }.
 */
export function whileVisible(el, { onEnter, onLeave } = {}, { rootMargin = '120px 0px', pauseClass = true } = {}) {
  let visible = false;
  if (pauseClass) el.classList.add('is-paused');
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting && !visible) {
        visible = true;
        if (pauseClass) el.classList.remove('is-paused');
        onEnter && onEnter(entry);
      } else if (!entry.isIntersecting && visible) {
        visible = false;
        if (pauseClass) el.classList.add('is-paused');
        onLeave && onLeave(entry);
      }
    }
  }, { rootMargin, threshold: 0 });
  io.observe(el);
  return () => io.disconnect();
}

/* ---------- Interaction ---------- */
/**
 * Make any element behave like a button: click + Enter/Space, role/tabindex if missing.
 * Returns off().
 */
export function pressable(elm, handler, { label } = {}) {
  if (!/^(BUTTON|A|INPUT|SELECT|TEXTAREA)$/.test(elm.tagName)) {
    if (!elm.hasAttribute('role')) elm.setAttribute('role', 'button');
    if (!elm.hasAttribute('tabindex')) elm.setAttribute('tabindex', '0');
  }
  if (label && !elm.hasAttribute('aria-label')) elm.setAttribute('aria-label', label);
  const onClick = (e) => handler(e);
  const onKey = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !/^(BUTTON|A|INPUT|SELECT|TEXTAREA)$/.test(elm.tagName)) {
      e.preventDefault();
      handler(e);
    }
  };
  elm.addEventListener('click', onClick);
  elm.addEventListener('keydown', onKey);
  return () => { elm.removeEventListener('click', onClick); elm.removeEventListener('keydown', onKey); };
}

/** Center point of an element in viewport coordinates. */
export function centerOf(elm) {
  const r = elm.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/** Copy text to clipboard with a graceful fallback. Resolves true on success. */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;opacity:0;left:-9999px';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}

/* ---------- Dates ---------- */
/** Format a date in the wedding's timezone (Asia/Kolkata by default). */
export function formatDate(date, opts = { day: 'numeric', month: 'long', year: 'numeric' }, tz = 'Asia/Kolkata') {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('en-IN', { timeZone: tz, ...opts }).format(d);
}
export function formatTime(date, tz = 'Asia/Kolkata') {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('en-IN', { timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: true }).format(d).replace(/\s?(am|pm)$/i, (m) => ' ' + m.trim().toUpperCase());
}
