/**
 * HOME · the hero. A luminous orb, enormous editorial names, a live countdown.
 * Contract: mount(el, ctx). Copy lives in content/home.js.
 */
import { html, raw, esc, listen, whileVisible, prefersReducedMotion, formatDate, formatTime } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { goTo } from '../core/dock.js';
import { downloadICS } from '../lib/ics.js';
import { toast } from '../core/toast.js';

const pad = (n) => String(n).padStart(2, '0');

export function mount(el, ctx) {
  const c = ctx.content.home || {}, site = ctx.site;
  const bride = site.couple.pair[0].first, groom = site.couple.pair[1].first;   // display order (see site.couple.pair)
  const target = new Date(site.wedding.muhurtham);
  let who = '';
  try { who = (new URLSearchParams(location.search).get('to') || '').replace(/[<>]/g, '').trim().slice(0, 36); } catch {}
  const L = c.labels || {};
  const units = [['d', L.days || 'days'], ['h', L.hours || 'hours'], ['m', L.minutes || 'minutes'], ['s', L.seconds || 'seconds']];

  el.innerHTML = html`
    <img class="hm-bg" src="assets/img/bg-poly.webp" alt="" aria-hidden="true" width="2400" height="1500" decoding="async">
    <div class="hm-stage">
      <div class="hm-orbs" aria-hidden="true">
        <div class="hm-sat hm-sat--1"><i></i></div><div class="hm-sat hm-sat--2"><i></i></div><div class="hm-sat hm-sat--3"><i></i></div>
        <div class="hm-orb"><img class="hm-art" src="assets/img/us-art.webp" alt="An illustration of Prem and Nivitha laughing together" width="1000" height="1000" decoding="async"><i class="hm-orb__halo"></i><div class="hm-orb__sphere"><i class="hm-orb__drift"></i><i class="hm-orb__drift hm-orb__drift--2"></i><i class="hm-orb__spec"></i><i class="hm-orb__rim"></i></div></div>
      </div>

            <p class="hm-top"><span class="eyebrow">${c.eyebrow || 'And life brought us here!'}</span>${who ? html`<span class="hm-for">${c.greeting ? c.greeting(who) : `For ${who}`}</span>` : ''}</p>

      <h1 class="hm-names" aria-label="${esc(bride)} and ${esc(groom)}">
        <span class="hm-line hm-line--a"><span class="hm-mask"><span class="hm-w" style="--i:0">${bride}</span></span><span class="hm-mask hm-amp"><span class="hm-w gold" style="--i:1">&amp;</span></span></span>
        <span class="hm-line hm-line--b"><span class="hm-mask"><span class="hm-w" style="--i:2">${groom}</span></span></span>
      </h1>

      <div class="hm-base">
        <div class="hm-when hm-fade" style="--i:3">
          <p class="hm-date">${site.wedding.dateLabel} <i></i> ${c.place || site.wedding.city}</p>
        </div>
        <div class="hm-count hm-fade" style="--i:4">
          <div class="hm-pill" role="timer" aria-label="Countdown to the wedding">
            ${units.map(([k, label], i) => html`${i ? raw('<span class="hm-sep" aria-hidden="true"></span>') : ''}<div class="hm-unit" data-u="${k}"><span class="hm-num"><b class="hm-digit"></b></span><span class="hm-lab">${label}</span></div>`)}
          </div>
        </div>
        <div class="hm-cta hm-fade" style="--i:5">
          <button class="hm-save" type="button">${raw(icon('calendar-plus', { size: 16, stroke: 1.6 }))}<span>${c.cta?.save || 'Save the date'}</span></button>
        </div>
      </div>

      <button class="hm-scroll" type="button" aria-label="Scroll to the story"><i></i><span>Scroll</span></button>
    </div>`;

  const $ = (s) => el.querySelector(s);
  $('.hm-scroll').addEventListener('click', () => goTo('story'));
  $('.hm-save').addEventListener('click', () => { if (downloadICS(site.events, 'prem-nivitha-wedding.ics')) toast('Saved. Your calendar will take it from here.'); });

  /* ---- reveal ---- */
  let shown = false;
  const reveal = () => { if (shown) return; shown = true; el.classList.add('is-in'); };
  const hidden = () => { shown = false; el.classList.remove('is-in'); };
  listen('door-open', () => setTimeout(reveal, document.documentElement.classList.contains('is-door') ? 150 : 40));
  if (!document.documentElement.classList.contains('is-door')) setTimeout(reveal, 120);
  // after a door replay the names rise again
  const mo = new MutationObserver(() => { if (document.documentElement.classList.contains('is-door')) hidden(); });
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  /* ---- countdown ---- */
  const digits = {}; units.forEach(([k]) => { digits[k] = { host: $(`[data-u="${k}"] .hm-num`), val: null, min: k === 'd' ? 2 : 2 }; });
  function setDigit(k, v) {
    const d = digits[k], txt = k === 'd' ? String(v).padStart(2, '0') : pad(v);
    if (d.val === txt) return;
    // Background tabs pause animations (so `finished` never fires and old digits pile up): swap instantly there.
    if (d.val == null || document.hidden || prefersReducedMotion()) { d.host.replaceChildren(Object.assign(document.createElement('b'), { className: 'hm-digit', textContent: txt })); d.val = txt; return; }
    const nu = document.createElement('b'); nu.className = 'hm-digit'; nu.textContent = txt;
    while (d.host.children.length > 1) d.host.firstElementChild.remove();
    const old = d.host.firstElementChild;
    d.val = txt; d.host.appendChild(nu);
    const o = { duration: 520, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' };
    nu.animate([{ transform: 'translateY(60%)', opacity: 0, filter: 'blur(4px)' }, { transform: 'none', opacity: 1, filter: 'none' }], o);
    old?.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateY(-60%)', opacity: 0, filter: 'blur(4px)' }], o);
    setTimeout(() => old?.remove(), 600);
  }
  // coming back to the tab: drop any half-finished animation leftovers and resync
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    units.forEach(([k]) => { const h = digits[k].host; while (h.children.length > 1) h.firstElementChild.remove(); h.lastElementChild?.getAnimations().forEach((a) => a.finish()); });
    tick();
  });
  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      el.classList.add('is-after');
      units.forEach(([k]) => setDigit(k, 0));
      return;
    }
    const s = Math.floor(diff / 1000);
    setDigit('d', Math.floor(s / 86400)); setDigit('h', Math.floor(s % 86400 / 3600)); setDigit('m', Math.floor(s % 3600 / 60)); setDigit('s', s % 60);
  }
  tick();

  /* ---- orb parallax (pointer + gyro) while visible ---- */
  const stage = $('.hm-stage'), S = { tx: 0, ty: 0, x: 0, y: 0, raf: 0, timer: 0 };
  const onMove = (e) => { S.tx = (e.clientX / innerWidth - .5) * 2; S.ty = (e.clientY / innerHeight - .5) * 2; };
  const onGyro = (e) => { if (e.gamma == null) return; S.tx = Math.max(-1, Math.min(1, e.gamma / 28)); S.ty = Math.max(-1, Math.min(1, (e.beta - 50) / 28)); };
  const loop = () => {
    S.x += (S.tx - S.x) * .06; S.y += (S.ty - S.y) * .06;
    stage.style.setProperty('--px', S.x.toFixed(3)); stage.style.setProperty('--py', S.y.toFixed(3));
    S.raf = requestAnimationFrame(loop);
  };
  whileVisible(el, {
    onEnter() {
      tick(); S.timer = setInterval(tick, 1000);
      if (!prefersReducedMotion()) { window.addEventListener('pointermove', onMove, { passive: true }); window.addEventListener('deviceorientation', onGyro); S.raf = requestAnimationFrame(loop); }
    },
    onLeave() { clearInterval(S.timer); cancelAnimationFrame(S.raf); window.removeEventListener('pointermove', onMove); window.removeEventListener('deviceorientation', onGyro); },
  });
}
