/**
 * KALYANAM v2 · core/orbs.js: the living background. A fixed canvas of soft gold / champagne / white orbs of light.
 *  - drift slowly, respond to the pointer (gentle repel + parallax) and to scroll,
 *  - change palette with <html data-theme="light|dark"> (orbs glow additively on dark),
 *  - also draw one-shot effects:   orbs.ripple(x, y)   orbs.burst(x, y, { count, power })   (viewport coordinates)
 * Cheap by design: every orb is a pre-rendered radial sprite, a frame is ~14 drawImage calls; the loop pauses with the
 * tab (createLoop) and the canvas is capped at DPR 1.5.
 */
import { createLoop, clamp, rand, prefersReducedMotion, perfTier } from '../lib/dom.js';

const TAU = Math.PI * 2;
const PALETTES = {
  light: ['#F3D98F', '#E9C877', '#FFFFFF', '#F7EBC8', '#D9B45C', '#FFF7DC'],
  dark:  ['#E3C26E', '#B68A33', '#FFF1C2', '#8A6420', '#F6E6B4', '#CBA24A'],
};
const state = { cv: null, ctx: null, w: 0, h: 0, dpr: 1, orbs: [], fx: [], sprites: {}, px: .5, py: .5, tx: .5, ty: .5, sy: 0, theme: 'light', mix: 0, loop: null, hasPointer: false, boost: 1 };

function sprite(color) {
  if (state.sprites[color]) return state.sprites[color];
  const s = 256, c = document.createElement('canvas'); c.width = c.height = s;
  const g = c.getContext('2d'), rg = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  rg.addColorStop(0, color); rg.addColorStop(.38, color + 'AA'); rg.addColorStop(1, color + '00');
  g.fillStyle = rg; g.fillRect(0, 0, s, s);
  return (state.sprites[color] = c);
}

function seedOrbs() {
  const n = { low: 7, mid: 10, high: 14 }[perfTier()] || 10;
  state.orbs = Array.from({ length: n }, (_, i) => ({
    x: rand(0, 1), y: rand(0, 1), r: rand(.16, .44), depth: rand(.15, 1), ci: i % 6,
    vx: rand(-.006, .006), vy: rand(-.005, .005), ph: rand(0, TAU), sp: rand(.12, .32), a: rand(.35, .75),
  }));
}

function resize() {
  state.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  state.w = innerWidth; state.h = innerHeight;
  state.cv.width = Math.round(state.w * state.dpr); state.cv.height = Math.round(state.h * state.dpr);
}

function frame(dt, t) {
  const { ctx, w, h } = state;
  state.px += (state.tx - state.px) * Math.min(1, dt * 3); state.py += (state.ty - state.py) * Math.min(1, dt * 3);
  const target = state.theme === 'dark' ? 1 : 0; state.mix += (target - state.mix) * Math.min(1, dt * 1.6);
  ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  const dark = state.mix > .5, pal = PALETTES[dark ? 'dark' : 'light'], m = Math.min(w, h);
  ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over';
  for (const o of state.orbs) {
    o.x += o.vx * dt * state.boost; o.y += o.vy * dt * state.boost;
    if (o.x < -.2 || o.x > 1.2) o.vx *= -1; if (o.y < -.2 || o.y > 1.2) o.vy *= -1;
    const sx = Math.sin(t * o.sp + o.ph) * .03, sy = Math.cos(t * o.sp * .8 + o.ph) * .03;
    const px = (state.px - .5) * 90 * o.depth, py = (state.py - .5) * 70 * o.depth;
    const cx = (o.x + sx) * w + px, cy = (o.y + sy) * h + py - state.sy * (.06 + o.depth * .1);
    const r = o.r * m * (1 + Math.sin(t * o.sp * 1.4 + o.ph) * .05);
    ctx.globalAlpha = o.a * (dark ? .5 : .62) * state.boost;
    ctx.drawImage(sprite(pal[o.ci]), cx - r, cy - r, r * 2, r * 2);
  }
  ctx.globalCompositeOperation = 'source-over';
  // one-shot effects
  for (let i = state.fx.length - 1; i >= 0; i--) {
    const f = state.fx[i]; f.t += dt;
    const k = f.t / f.life;
    if (k >= 1) { state.fx.splice(i, 1); continue; }
    if (f.kind === 'ring') {
      ctx.globalAlpha = (1 - k) * .55; ctx.lineWidth = 2 * (1 - k) + .5; ctx.strokeStyle = dark ? '#F6E6B4' : '#CBA24A';
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r0 + (f.r1 - f.r0) * (1 - Math.pow(1 - k, 3)), 0, TAU); ctx.stroke();
    } else {
      f.vy += 260 * dt * f.g; f.x += f.vx * dt; f.y += f.vy * dt;
      ctx.globalAlpha = (1 - k) * .95; ctx.fillStyle = f.c;
      ctx.beginPath(); ctx.arc(f.x, f.y, f.s * (1 - k * .5), 0, TAU); ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

export const orbs = {
  init() {
    if (state.cv) return;
    state.cv = document.getElementById('orbs') || Object.assign(document.createElement('canvas'), { id: 'orbs' });
    if (!state.cv.parentNode) document.body.prepend(state.cv);
    state.ctx = state.cv.getContext('2d'); seedOrbs(); resize();
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', (e) => { if (e.pointerType === 'touch') return; state.hasPointer = true; state.tx = e.clientX / innerWidth; state.ty = e.clientY / innerHeight; }, { passive: true });
    window.addEventListener('scroll', () => { state.sy = scrollY; }, { passive: true });
    // phones: tilt the light with the gyroscope when allowed
    window.addEventListener('deviceorientation', (e) => { if (state.hasPointer || e.gamma == null) return; state.tx = clamp(.5 + e.gamma / 70, 0, 1); state.ty = clamp(.5 + (e.beta - 45) / 90, 0, 1); }, { passive: true });
    state.loop = createLoop(frame);
    if (prefersReducedMotion()) { state.boost = .6; frame(.016, 0); } else state.loop.start();
  },
  /** 'light' | 'dark' (usually set from the section in view via <html data-theme>). */
  setTheme(theme) { state.theme = theme === 'dark' ? 'dark' : 'light'; },
  /** Intensity multiplier (1 = normal). The door uses > 1 for the light flooding in. */
  setBoost(v) { state.boost = clamp(v, .2, 2.4); },
  ripple(x, y, { r0 = 6, r1 = 120, life = .9 } = {}) { if (state.cv) state.fx.push({ kind: 'ring', x, y, r0, r1, life, t: 0 }); },
  burst(x, y, { count = 26, power = 1, colors } = {}) {
    if (!state.cv || prefersReducedMotion()) return;
    const cols = colors || ['#FFF3C9', '#E3C26E', '#F6E6B4', '#CBA24A', '#FFFFFF'];
    for (let i = 0; i < count; i++) {
      const a = rand(0, TAU), v = rand(60, 280) * power;
      state.fx.push({ kind: 'dot', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, g: rand(.4, 1), s: rand(1.6, 4.2), c: cols[i % cols.length], life: rand(.7, 1.5), t: 0 });
    }
    if (state.fx.length > 220) state.fx.splice(0, state.fx.length - 220);
  },
  /** Fireworks-like celebration made only of light. */
  celebrate(x = innerWidth / 2, y = innerHeight / 2) {
    this.ripple(x, y, { r1: 220, life: 1.2 }); this.burst(x, y, { count: 60, power: 1.3 });
    setTimeout(() => { this.ripple(x, y, { r1: 320, life: 1.5 }); this.burst(x, y, { count: 40, power: 1.6 }); }, 200);
  },
};
export default orbs;
