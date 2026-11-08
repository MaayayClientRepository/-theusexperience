/**
 * Shared result screen for the Fun House games.
 *   const end = resultCard(ctx, { eyebrow, big, of, title, line, prev, extra, good, shareTitle, shareText, onAgain });
 *   container.appendChild(end.node);  …later…  end.stop();
 * `big` counts up from 0. `extra` is optional trusted HTML shown under the line. Styles: .gx-end in play-games-c.css.
 */
import { esc, copyText, prefersReducedMotion } from './dom.js';
import { icon } from './icons.js';

export function resultCard(ctx, o) {
  const { sound, orbs, toast, site } = ctx;
  const node = document.createElement('div');
  node.className = 'gx-end';
  node.innerHTML = `
    <div class="gx-end__in">
      <span class="gx-eyebrow">${esc(o.eyebrow)}</span>
      <div class="gx-big"><span class="gx-big__n">0</span>${o.of != null ? `<span class="gx-big__of">/ ${esc(o.of)}</span>` : ''}</div>
      <h3 class="gx-tier">${esc(o.title)}</h3>
      <p class="gx-line">${esc(o.line)}</p>
      ${o.extra || ''}
      ${o.prev ? `<p class="gx-prev">Previous best <b>${esc(o.prev)}</b></p>` : ''}
      <div class="gx-actions">
        <button class="pl-gbtn gx-share" type="button">${icon('share-2', { size: 16, stroke: 2 })}<span>Share my result</span></button>
        <button class="pl-gbtn pl-gbtn--ghost gx-again" type="button">${icon('rotate-ccw', { size: 16, stroke: 2 })}<span>Play again</span></button>
      </div>
    </div>`;

  const timers = [];
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
  const numEl = node.querySelector('.gx-big__n'), target = Math.round(Number(o.big) || 0);
  if (prefersReducedMotion() || target <= 0) numEl.textContent = target;
  else {
    const steps = Math.min(target, 30), per = Math.max(24, Math.min(90, 1400 / steps));
    let n = 0;
    const tick = () => { n++; numEl.textContent = Math.round(target * n / steps); if (n < steps) later(tick, per); };
    tick();
  }
  sound.play(o.good ? 'fanfare' : 'success', { volume: .8 });
  if (o.good && !prefersReducedMotion()) later(() => orbs.celebrate(innerWidth / 2, innerHeight * .4), 250);

  node.querySelector('.gx-share').addEventListener('click', async () => {
    const url = site.siteUrl || __pageLoc.href.split('#')[0], text = o.shareText;
    try { if (navigator.share) { await navigator.share({ title: o.shareTitle || 'The Fun House', text, url }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
    (await copyText(text + url)) ? toast('Result copied. Send it to someone you can beat.') : toast('Could not copy: ' + text);
  });
  node.querySelector('.gx-again').addEventListener('click', () => { sound.play('pop', { volume: .6 }); o.onAgain(); });

  return { node, stop: () => timers.forEach(clearTimeout) };
}
