/**
 * DOOR · the knock-twice title card. Two full-screen champagne-metal doors, edge to edge.
 * Knock (click / tap / Enter / the Knock button) twice within 2.5 s: the doors swing wide, the camera pushes through
 * and the landing page zooms in from behind them (no white-out).
 * Contract: mount(el, ctx). Exposes window.kalyanam2.replayDoor().
 */
import { emit, esc, prefersReducedMotion, wait } from '../lib/dom.js';
import { session } from '../lib/store.js';
import { sound } from '../lib/sound.js';
import { orbs } from '../core/orbs.js';

const WINDOW_MS = 2500, RESET_MS = 3000;

function guestName() {
  try {
    const raw = new URLSearchParams(location.search).get('to');
    if (!raw) return '';
    return raw.replace(/[<>]/g, '').trim().slice(0, 36);
  } catch { return ''; }
}

export function mount(el, ctx) {
  const site = ctx?.site || {};
  const root = document.documentElement;
  const bride = site.couple?.pair?.[0]?.first || 'Prem', groom = site.couple?.pair?.[1]?.first || 'Nivitha';
  const dates = (site.wedding?.days || []).length === 2 ? '19 — 20 NOV 2026' : String(site.wedding?.dateLabel || '').toUpperCase();
  const who = guestName();
  let knocks = [], busy = false, resetT = 0, killed = false;

  const handle = (cls) => `<i class="dr-handle ${cls}" aria-hidden="true"></i>`;
  const panel = (side) => `
    <div class="dr-panel dr-${side}" data-side="${side}">
      <div class="dr-face">
        <i class="dr-brush"></i><i class="dr-frame-line"></i><i class="dr-frame-line dr-frame-line--2"></i>
        <i class="dr-sheen"></i>${handle(side === 'l' ? 'dr-handle--r' : 'dr-handle--l')}
        <i class="dr-shade"></i>
      </div>
    </div>`;

  function render() {
    killed = false; knocks = []; busy = false; clearTimeout(resetT);
    el.className = ''; el.removeAttribute('hidden');
    el.innerHTML = `
      <div class="dr-scene" aria-hidden="true"><i class="dr-glow"></i><i class="dr-grain"></i></div>
      <div class="dr-shake">
        <div class="dr-rig" data-knock>
          <div class="dr-behind" aria-hidden="true"><i class="dr-leak"></i></div>
          ${panel('l')}${panel('r')}
          <i class="dr-seam" aria-hidden="true"></i>
        </div>
      </div>
      <i class="dr-vig" aria-hidden="true"></i>
      <div class="dr-top"><p class="dr-eyebrow"><span>${esc(bride.toUpperCase())} &amp; ${esc(groom.toUpperCase())} · ${esc(dates)}</span>${who ? `<b>For ${esc(who)}</b>` : ''}</p></div>
      <div class="dr-foot">
        <p class="dr-hint"><span>Knock twice</span><i class="dr-dots" aria-hidden="true"><i></i><i></i></i></p>
        <button type="button" class="dr-btn" aria-label="Knock on the door. Knock twice to come in.">Knock</button>
      </div>
      <p class="sr-only" role="status" aria-live="polite" data-live></p>`;
    orbs.setBoost?.(.6);
    const rig = el.querySelector('.dr-rig'), btn = el.querySelector('.dr-btn');
    rig.addEventListener('click', (e) => knock(e.clientX, e.clientY));
    btn.addEventListener('click', (e) => {
      const b = rig.getBoundingClientRect();
      const kb = e.detail === 0 || (!e.clientX && !e.clientY);
      knock(kb ? b.left + b.width / 2 : e.clientX, kb ? b.top + b.height * .45 : e.clientY - 40);
    });
    requestAnimationFrame(() => el.classList.add('dr-ready'));
  }

  const live = (t) => { const n = el.querySelector('[data-live]'); if (n) n.textContent = t; };
  const setDots = (n) => el.querySelectorAll('.dr-dots i').forEach((d, i) => d.classList.toggle('is-on', i < n));

  function shudder(power = 1) {
    const s = el.querySelector('.dr-shake'); if (!s || prefersReducedMotion()) return;
    const p = 4 * power;
    s.animate([
      { transform: 'translate3d(0,0,0) rotateY(0)' }, { transform: `translate3d(${p}px,0,0) rotateY(${-.5 * power}deg)`, offset: .16 },
      { transform: `translate3d(${-p * .75}px,0,0) rotateY(${.35 * power}deg)`, offset: .36 }, { transform: `translate3d(${p * .45}px,0,0)`, offset: .56 },
      { transform: `translate3d(${-p * .2}px,0,0)`, offset: .76 }, { transform: 'translate3d(0,0,0)' },
    ], { duration: 520, easing: 'cubic-bezier(.2,.7,.3,1)' });
    el.querySelectorAll('.dr-panel').forEach((pn, i) => pn.animate(
      [{ filter: 'brightness(1)' }, { filter: 'brightness(1.18)', offset: .12 }, { filter: 'brightness(1)' }], { duration: 480, delay: i * 30 }));
  }
  function pulseSeam() {
    el.querySelector('.dr-seam')?.animate([{ opacity: .55, transform: 'scaleX(1)' }, { opacity: 1, transform: 'scaleX(3.2)', offset: .25 }, { opacity: .55, transform: 'scaleX(1)' }], { duration: 760, easing: 'ease-out' });
    el.querySelector('.dr-leak')?.animate([{ opacity: .6 }, { opacity: 1, offset: .25 }, { opacity: .6 }], { duration: 760 });
  }

  function knock(x, y) {
    if (busy || killed) return;
    const now = performance.now();
    knocks = knocks.filter((t) => now - t < WINDOW_MS); knocks.push(now);
    try { orbs.ripple?.(x, y, { r1: 170, life: 1.1 }); } catch {}
    try { sound.play('knock'); } catch {}
    try { navigator.vibrate?.(12); } catch {}
    shudder(knocks.length > 1 ? 1.25 : 1); pulseSeam(); setDots(knocks.length);
    clearTimeout(resetT);
    if (knocks.length >= 2) { live('Welcome in.'); open(); return; }
    live('One knock. Once more.');
    resetT = setTimeout(() => {
      knocks = []; setDots(0);
      const h = el.querySelector('.dr-hint');
      if (h && !prefersReducedMotion()) h.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(0)' }], { duration: 460 });
    }, RESET_MS);
  }

  async function open() {
    busy = true; el.classList.add('dr-swell');
    orbs.setBoost?.(1.5);
    try { sound.play('whoosh'); } catch {}
    session.set('doorSeen', true);
    const home = document.getElementById('home');
    if (prefersReducedMotion()) {
      el.classList.add('dr-rm', 'dr-leaving');
      await wait(60); el.classList.add('dr-fade');
      emit('door-open'); await wait(520); finish(); return;
    }
    // hold the landing page just out of sight, scaled up: it will zoom into place as the doors part
    if (home && home.animate) home.animate([{ opacity: 0, transform: 'scale(1.55)', filter: 'blur(16px)' }, { opacity: 0, transform: 'scale(1.55)', filter: 'blur(16px)' }], { duration: 900, fill: 'both' });
    await wait(650);
    el.classList.add('dr-open');                       // panels swing wide + the camera pushes through
    if (home && home.getAnimations) home.getAnimations().forEach((a) => a.cancel());
    let zoom = null;
    if (home && home.animate) zoom = home.animate(
      [{ opacity: 0, transform: 'scale(1.55)', filter: 'blur(16px)' }, { opacity: 1, transform: 'scale(1)', filter: 'blur(0px)' }],
      { duration: 2100, delay: 380, easing: 'cubic-bezier(.16,.84,.3,1)', fill: 'both' });
    await wait(620);
    el.classList.add('dr-reveal');                     // the dark scene dissolves; the site is already arriving behind it
    await wait(560);
    el.classList.add('dr-leaving');                    // keeps the overlay alive after html.is-door is removed
    emit('door-open');                                 // landing entrance animations + HUD/dock
    await wait(1500);
    el.classList.add('dr-fade');
    orbs.setBoost?.(1);
    await wait(500);
    try { zoom && zoom.cancel(); } catch {}
    finish();
  }
  function finish() { killed = true; el.classList.remove('dr-leaving'); el.innerHTML = ''; }

  const wasDoor = root.classList.contains('is-door');
  if (wasDoor) render();

  window.kalyanam2 = window.kalyanam2 || {};
  window.kalyanam2.replayDoor = () => {
    root.classList.add('is-door');
    if (window.kalyanam2) window.kalyanam2.introDone = false;
    window.scrollTo(0, 0);
    el.className = ''; render();
  };
}
