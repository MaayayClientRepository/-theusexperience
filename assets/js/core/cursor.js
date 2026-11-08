/**
 * Desktop pointer magic: a luminous cursor orb that grows over interactive things, and a soft light that follows the
 * pointer inside every glass card (.card gets --mx/--my). [data-magnetic] elements lean toward the cursor.
 * Fine pointers only; nothing on touch devices or with reduced motion.
 */
import { prefersReducedMotion, clamp } from '../lib/dom.js';

export function initCursor() {
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!fine || prefersReducedMotion()) return;
  const host = document.getElementById('cursor'); if (!host) return;
  const dot = host.firstElementChild;
  let x = -100, y = -100, tx = -100, ty = -100, raf = 0;
  const hot = 'a, button, [role="button"], input, textarea, select, label, .card--open, .dock__item, [data-magnetic]';
  const tick = () => { x += (tx - x) * .22; y += (ty - y) * .22; host.style.transform = `translate3d(${x}px,${y}px,0)`; raf = (Math.abs(tx - x) + Math.abs(ty - y) > .3) ? requestAnimationFrame(tick) : 0; };
  addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    tx = e.clientX; ty = e.clientY; host.classList.add('is-on');
    host.classList.toggle('is-hover', !!e.target.closest?.(hot));
    if (!raf) raf = requestAnimationFrame(tick);
    const card = e.target.closest?.('.card');
    if (card) { const r = card.getBoundingClientRect(); card.style.setProperty('--mx', (e.clientX - r.left) + 'px'); card.style.setProperty('--my', (e.clientY - r.top) + 'px'); card.classList.add('is-live'); }
    const mag = e.target.closest?.('[data-magnetic]');
    document.querySelectorAll('[data-magnetic].is-mag').forEach((m) => { if (m !== mag) { m.style.translate = ''; m.classList.remove('is-mag'); } });
    if (mag) { const r = mag.getBoundingClientRect(); mag.style.translate = `${clamp((e.clientX - (r.left + r.width / 2)) * .12, -8, 8)}px ${clamp((e.clientY - (r.top + r.height / 2)) * .12, -8, 8)}px`; mag.classList.add('is-mag'); }
  }, { passive: true });
  document.addEventListener('pointerleave', () => host.classList.remove('is-on'));
}
