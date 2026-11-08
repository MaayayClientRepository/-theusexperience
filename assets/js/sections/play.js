/**
 * THE FUN HOUSE (#play): one-screen bento of game cards. Each card opens a dark full-screen sheet and mounts a game.
 * Game contract: assets/js/games/<id>.js → export function mount(container, ctx) → cleanup
 *   ctx = { content (this game's copy), site, orbs, sound, toast, sheet, finish({score,total,label}), best }
 * Best results are saved by the hub under store key  play:<id>  = { score, total, label, at }.
 */
import { html, raw, esc, pick, prefersReducedMotion } from '../lib/dom.js';
import { icon, registerIcon } from '../lib/icons.js';

registerIcon('hash', '<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>');
import { store } from '../lib/store.js';
import { sound } from '../lib/sound.js';
import { orbs } from '../core/orbs.js';
import { toast } from '../core/toast.js';
import { openSheet, bindCard } from '../core/sheet.js';

const bestOf = (id) => store.get('play:' + id, null);
const ratio = (r) => (r && r.total ? r.score / r.total : -1);

export function mount(el, ctx) {
  const copy = ctx.content.play || {};
  const head = copy.head || { eyebrow: 'The Fun House', title: 'Play with us.', lead: '' };
  const games = copy.games || [];
  const words = String(head.title).split(' ');
  const last = words.pop();

  el.innerHTML = String(html`
    <header class="screen__head pl-head">
      <div class="pl-head__l">
        <p class="eyebrow">${head.eyebrow}</p>
        <h2 class="display screen__title pl-title">${words.join(' ')} <em class="gold">${last}</em></h2>
        <p class="screen__lead pl-lead">${head.lead}</p>
      </div>
      <div class="pl-head__r">
        <button class="btn btn--dark btn--sm pl-all" type="button" data-magnetic aria-label="Play a random game">${raw(icon('shuffle', { size: 16, stroke: 2 }))}<span>Play all</span></button>
      </div>
    </header>
    <div class="stage pl-grid">
      ${games.map((g) => html`
        <article class="card pl-card pl-card--${g.size} pl-card--${g.id}" data-game="${g.id}" aria-label="${g.title}: ${g.tagline}">
          <i class="pl-card__glow" aria-hidden="true"></i>
          <i class="pl-card__ring" aria-hidden="true"></i>
          <div class="pl-card__top">
            <span class="pl-card__orb">${raw(icon(g.icon, { size: 30, stroke: 1.5 }))}</span>
            <span class="pl-card__chips"><span class="pl-chip">${raw(icon('clock', { size: 12, stroke: 2 }))}${g.time}</span><span class="pl-chip pl-chip--best" hidden></span></span>
          </div>
          <div class="pl-card__bot">
            <h3 class="pl-card__title">${g.title}</h3>
            <p class="pl-card__tag">${g.tagline}</p>
            <span class="pl-card__go"><span>Play</span>${raw(icon('arrow-right', { size: 16, stroke: 2 }))}</span>
          </div>
        </article>`)}
    </div>`);

  const cardOf = (id) => el.querySelector(`.pl-card[data-game="${id}"]`);
  function paintBest(id) {
    const card = cardOf(id); if (!card) return;
    const chip = card.querySelector('.pl-chip--best'), b = bestOf(id);
    if (!b) { chip.hidden = true; card.classList.remove('is-played'); return; }
    chip.hidden = false; card.classList.add('is-played');
    chip.innerHTML = `${icon('star', { size: 12, stroke: 2 })}${esc(b.label || `${b.score}/${b.total}`)}`;
  }
  games.forEach((g) => paintBest(g.id));

  function options(g) {
    const container = document.createElement('div');
    container.className = 'pl-stage';
    let cleanup = null, closed = false;
    return {
      title: g.title, size: 'fill', theme: 'dark', node: container,
      onOpen: async (api) => {
        sound.play('whoosh', { volume: .6 });
        try {
          const mod = await import(`../games/${g.id}.js`);
          if (closed) return;
          const gctx = {
            content: (ctx.content.games || {})[g.id] || {}, site: ctx.site, orbs, sound, toast, sheet: api, game: g,
            best: bestOf(g.id),
            finish({ score, total, label } = {}) {
              const prev = bestOf(g.id), next = { score, total, label: label || `${score}/${total}`, at: Date.now() };
              if (!prev || ratio(next) >= ratio(prev)) store.set('play:' + g.id, next);
              paintBest(g.id);
            },
          };
          cleanup = await mod.mount(container, gctx);
          if (closed && cleanup) { try { cleanup(); } catch { /* ignore */ } cleanup = null; }
        } catch (e) {
          console.warn('[play] game failed to load:', g.id, e);
          container.innerHTML = `<div class="pl-soon"><span class="pl-card__orb">${icon(g.icon, { size: 30, stroke: 1.5 })}</span><h3>${esc(g.title)}</h3><p>This game is being polished. Come back soon.</p></div>`;
        }
      },
      onClose: () => { closed = true; try { cleanup && cleanup(); } catch (e) { console.error(e); } cleanup = null; paintBest(g.id); },
    };
  }

  games.forEach((g) => { const c = cardOf(g.id); if (c) bindCard(c, () => options(g)); });

  // "Play all": open a random game, preferring ones the visitor has not played.
  el.querySelector('.pl-all')?.addEventListener('click', () => {
    const fresh = games.filter((g) => !bestOf(g.id));
    const g = pick(fresh.length ? fresh : games), c = cardOf(g.id);
    if (!c) return;
    sound.play('pop', { volume: .7 });
    if (!prefersReducedMotion()) { const r = c.getBoundingClientRect(); orbs.ripple(r.left + r.width / 2, r.top + r.height / 2, { r1: 160 }); }
    openSheet({ from: c, ...options(g) });
  });
}
