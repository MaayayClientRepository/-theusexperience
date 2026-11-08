/**
 * KALYANAM v2 · core/snap.js: idle scroll settling.
 * When scrolling stops between two screens, glide (slow ease, never a jump) to the nearest resting place.
 * A resting place is any scroll position where the viewport sits fully inside one section, so a section taller
 * than the viewport can still be read; only the seams between sections are never allowed to be a final stop.
 */
import { prefersReducedMotion } from '../lib/dom.js';

const IDLE_MS = 140;

export function initSnap() {
  const root = document.documentElement;
  const secs = () => [...document.querySelectorAll('#world > [data-section]')];
  let timer = 0, raf = 0, touching = false, programmatic = false;

  const rest = () => {
    const y = window.scrollY, vh = window.innerHeight;
    const max = root.scrollHeight - vh;
    let best = null;
    for (const s of secs()) {
      const top = s.offsetTop, bottom = top + s.offsetHeight;
      const hi = Math.max(top, bottom - vh);
      const c = Math.min(Math.max(y, top), hi, max);
      if (best === null || Math.abs(c - y) < Math.abs(best - y)) best = c;
    }
    return best;
  };

  const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; programmatic = false; };

  const glide = (to) => {
    const from = window.scrollY, d = to - from;
    const dur = Math.min(1100, 520 + Math.abs(d) * 0.9);
    const t0 = performance.now();
    programmatic = true;
    const ease = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      window.scrollTo(0, from + d * ease(t));
      if (t < 1) raf = requestAnimationFrame(step); else { raf = 0; setTimeout(() => { programmatic = false; }, 60); }
    };
    raf = requestAnimationFrame(step);
  };

  const settle = () => {
    if (touching || raf) return;
    if (root.classList.contains('is-door') || root.classList.contains('is-locked')) return;
    const to = rest();
    if (to === null || Math.abs(to - window.scrollY) < 2) return;
    if (prefersReducedMotion()) { window.scrollTo(0, to); return; }
    glide(to);
  };

  const arm = () => { clearTimeout(timer); timer = setTimeout(settle, IDLE_MS); };
  const interrupt = () => { if (raf) stop(); arm(); };

  window.addEventListener('scroll', () => { if (!programmatic) arm(); }, { passive: true });
  window.addEventListener('wheel', interrupt, { passive: true });
  window.addEventListener('keydown', interrupt);
  window.addEventListener('touchstart', () => { touching = true; if (raf) stop(); clearTimeout(timer); }, { passive: true });
  const release = () => { touching = false; arm(); };
  window.addEventListener('touchend', release, { passive: true });
  window.addEventListener('touchcancel', release, { passive: true });
  window.addEventListener('resize', arm);
}
