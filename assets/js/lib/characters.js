/**
 * KALYANAM · characters — chibi paper dolls in the "Paper & Foil" style.
 *
 *   import { characters, react } from '../core/characters.js';
 *   el.innerHTML = characters.bride({ pose: 'wave', className: 'chr--blink chr--wave' });
 *   react(el, 'hop');                                   // one-shot reaction (el = the svg or any ancestor)
 *
 * Every function returns an inline SVG string:
 *   <svg class="chr chr-<name> <className>" viewBox="…" data-pose="…" aria-hidden="true">…</svg>
 * Pass { title: 'Ananya, waving' } to expose it to assistive tech instead (role="img" + <title>).
 *
 * ┌────────────────────────────────────────────────────────────────────────────────────────────┐
 * │ characters.bride({ pose, mood })   stand · wave · shy · dance · sit         viewBox 200×300 │
 * │ characters.groom({ pose, mood })   stand · wave · proud · dance · sit       viewBox 200×300 │
 * │ characters.couple({ pose })        hold-hands · garland · walk              viewBox 330×300 │
 * │ characters.parrot({ pose })        perch · fly · pick                       viewBox 200×220 │
 * │ characters.guest({ variant })      0…7 (+ pose: stand · wave)               viewBox 200×300 │
 * └────────────────────────────────────────────────────────────────────────────────────────────┘
 * People stand on y = 290 of a 300-tall box, so dolls rendered at the same CSS height share one
 * scale and line up on the same floor (the child guest is simply shorter).
 *
 * Common options
 *   className   extra classes, e.g. animation modifiers 'chr--blink chr--bob'
 *   title       accessible name (otherwise aria-hidden)
 *   mood        smile · grin · joy · shy · wink · wow · sleepy · love · proud (each pose has a default)
 *   look        -8…8 — turn the face left/right (features slide, like a ¾ view)
 *   standalone  true → embed the gradients inside the SVG (for <img>, data-URI or canvas export)
 * Bride: { jasmine: true } · Groom: { moustache: true, tilak: true } · Couple: { heart: true }
 * Parrot: { card: 'heart' | 'star' | 'blank', perch: true }
 *
 * Animation hooks (each hook <g> contains an invisible pivot circle centred on its joint, so
 * `transform-box: fill-box; transform-origin: 50% 50%` — or GSAP transformOrigin '50% 50%' —
 * rotates it about the shoulder / neck / feet). l / r always mean SCREEN left / right.
 *   .chr-rig (whole doll; pivot = feet)  .chr-head (neck)  .chr-eyes  .chr-mouth  .chr-blush
 *   .chr-arm-l .chr-arm-r (shoulders)    .chr-arm-hold (couple's joined arms — never auto-animated)
 *   .chr-braid  .chr-garland  .chr-foot-l .chr-foot-r  .chr-shadow  .chr-sparkle  .chr-notes  .chr-heart
 *   parrot: .chr-wing (.chr-wing-far)  .chr-tail  .chr-card  .chr-perch
 * Opt-in loops on the root (characters.css): chr--blink chr--wave chr--bob chr--flap chr--dance
 *   chr--sway chr--walk.  Looks: chr--lift (paper drop shadow) chr--glow (warm rim light at night)
 *   chr--mirror (face the other way).  One-shots via react(): hop spin nod shake wiggle cheer blush.
 */

const SVGNS = 'http://www.w3.org/2000/svg';

/* ---------- Palette (warm, never pure black; matches base.css tokens) ---------- */
const INK = '#2A1C12';          // eyes
const MOUTH = '#7E3527';
const MOUTH_IN = '#8C3A2B';
const TONGUE = '#E98C79';
const KUMKUM = '#B23A2E';
const ROSE = '#D9705F';         // shy hatching, heart eyes
const PEARL = '#FFFDF6';
const JASMINE = '#FFFEF8';
const JASMINE_SHADE = '#E3D3B0';
const MARIGOLD = '#EE9B2F';
const HAIR = { base: '#3B2A1C', hi: '#6E4E34' };
const SILVER = { base: '#DCD4C6', hi: '#F6F1E8' };
const GOLD = { base: '#D4A63A', deep: '#A97F22', hi: '#F6DE93', line: '#C99A2E', dark: '#8A6519' };
const CLOTH = { base: '#FFF6E6', panel: '#FFFBF3', line: '#E6D0A2', fold: '#EBD9B4' };
const SLEEVE = { base: '#F3E3C4', hi: '#FFFAF0' };   // long ivory sleeves: shaded base + catch-light
const SHADE = 'rgba(95,58,22,.15)';        // paper shadow cast by one layer onto the next
const HAIR_SHADE = 'rgba(70,36,14,.2)';    // hairline shadow on the forehead
const LEAF = { base: '#7FA85A', light: '#A8CB7F', deep: '#557F42', deeper: '#456C35', belly: '#C3DC97', tip: '#93BE6C' };
const CORAL = { base: '#EE8A5C', deep: '#CF6748', hi: '#F8B892', feet: '#D98B6B' };

/* Gradient paints carry a solid fallback colour: if #chr-defs is missing (e.g. the SVG was
   serialised into an <img> or canvas), the browser paints the fallback instead of nothing. */
const P = {
  gold: 'url(#chr-gold) #D4A63A',
  band: 'url(#chr-gold-band) #D9AE4A',
  silk: 'url(#chr-silk) #FFF6E6',
  blush: 'url(#chr-blush) rgba(233,128,109,.3)',
  ground: 'url(#chr-ground) rgba(95,70,18,.14)',
  leaf: 'url(#chr-leaf) #7FA85A',
};

const DEFS = [
  '<linearGradient id="chr-gold" x1="0" y1="0" x2="1" y2="1">',
  '<stop offset="0" stop-color="#B8892A"/><stop offset=".3" stop-color="#EDCB6E"/><stop offset=".48" stop-color="#FFF0BC"/>',
  '<stop offset=".66" stop-color="#D6A83E"/><stop offset="1" stop-color="#A47A20"/></linearGradient>',
  '<linearGradient id="chr-gold-band" x1="0" y1="0" x2="0" y2="1">',
  '<stop offset="0" stop-color="#F8E4A4"/><stop offset=".45" stop-color="#DCB24E"/><stop offset="1" stop-color="#A97F22"/></linearGradient>',
  '<linearGradient id="chr-silk" x1="0" y1="0" x2="1" y2="0">',
  '<stop offset="0" stop-color="#EBD7AE"/><stop offset=".28" stop-color="#FFF7E8"/><stop offset=".55" stop-color="#FFFBF3"/>',
  '<stop offset=".8" stop-color="#F8EBD2"/><stop offset="1" stop-color="#E6CF9F"/></linearGradient>',
  '<radialGradient id="chr-blush"><stop offset="0" stop-color="#EC7F6C" stop-opacity=".62"/>',
  '<stop offset=".55" stop-color="#EC7F6C" stop-opacity=".32"/><stop offset="1" stop-color="#EC7F6C" stop-opacity="0"/></radialGradient>',
  '<radialGradient id="chr-ground"><stop offset="0" stop-color="#5F4612" stop-opacity=".3"/>',
  '<stop offset=".6" stop-color="#5F4612" stop-opacity=".13"/><stop offset="1" stop-color="#5F4612" stop-opacity="0"/></radialGradient>',
  '<linearGradient id="chr-leaf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9CC273"/>',
  '<stop offset="1" stop-color="#6C9650"/></linearGradient>',
].join('');

/* ---------- Shared <defs> (injected lazily, on first use) ---------- */
let defsNode = null;
/**
 * Adds the shared gradients to the document (a zero-size, NOT display:none, svg — gradients inside
 * display:none subtrees fail in some browsers). Called automatically by every character function;
 * re-injects itself if something removed it. No-op outside a browser.
 */
export function injectCharacterDefs() {
  if (typeof document === 'undefined' || (defsNode && defsNode.isConnected)) return;
  defsNode = document.getElementById('chr-defs');
  if (defsNode) return;
  const host = document.body || document.documentElement;
  if (!host) return;
  const t = document.createElement('template');
  t.innerHTML = `<svg id="chr-defs" xmlns="${SVGNS}" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden;pointer-events:none"><defs>${DEFS}</defs></svg>`;
  defsNode = t.content.firstChild;
  host.appendChild(defsNode);
}

/* ---------- Tiny SVG helpers ---------- */
const n = (v) => Math.round(v * 100) / 100;
const xy = (p) => `${n(p[0])} ${n(p[1])}`;
/** Circle / ellipse as path data, so many dots can share one <path> (keeps element counts low). */
const dot = (cx, cy, r) => `M${n(cx - r)} ${n(cy)}a${r} ${r} 0 1 0 ${n(2 * r)} 0a${r} ${r} 0 1 0 ${n(-2 * r)} 0Z`;
const oval = (cx, cy, rx, ry) => `M${n(cx - rx)} ${n(cy)}a${rx} ${ry} 0 1 0 ${n(2 * rx)} 0a${rx} ${ry} 0 1 0 ${n(-2 * rx)} 0Z`;
const fill = (d, paint, extra = '') => `<path d="${d}" fill="${paint}"${extra}/>`;
const stroke = (d, paint, w, extra = '') =>
  `<path d="${d}" fill="none" stroke="${paint}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;
/** Dashed stroke with butt caps (bands across a thick stroke — garlands); `cap` 'round' makes beads. */
const dash = (d, paint, w, pattern, offset = 0, cap = 'butt') =>
  `<path d="${d}" fill="none" stroke="${paint}" stroke-width="${w}" stroke-linecap="${cap}" stroke-dasharray="${pattern}"${offset ? ` stroke-dashoffset="${offset}"` : ''}/>`;
/** Invisible circle that makes a hook group's fill-box centre sit exactly on its joint. */
const pivot = (x, y, r) => `<circle class="chr-pivot" cx="${n(x)}" cy="${n(y)}" r="${r}" fill="none"/>`;
const hook = (cls, [x, y, r], inner) => `<g class="${cls}">${pivot(x, y, r)}${inner}</g>`;
const rot = (deg, x, y, inner) => (deg ? `<g transform="rotate(${n(deg)} ${n(x)} ${n(y)})">${inner}</g>` : inner);
const move = (dx, dy, inner) => (dx || dy ? `<g transform="translate(${n(dx)} ${n(dy)})">${inner}</g>` : inner);
/** 4-point foil sparkle. */
const sparkle = (x, y, s) => `M${n(x)} ${n(y - s)}Q${n(x + s * .16)} ${n(y - s * .16)} ${n(x + s)} ${n(y)}Q${n(x + s * .16)} ${n(y + s * .16)} ${n(x)} ${n(y + s)}Q${n(x - s * .16)} ${n(y + s * .16)} ${n(x - s)} ${n(y)}Q${n(x - s * .16)} ${n(y - s * .16)} ${n(x)} ${n(y - s)}Z`;
const heartPath = (x, y, s) => `M${n(x)} ${n(y + s * .85)}C${n(x - s * 1.25)} ${n(y + s * .05)} ${n(x - s * .85)} ${n(y - s * .95)} ${n(x)} ${n(y - s * .32)}C${n(x + s * .85)} ${n(y - s * .95)} ${n(x + s * 1.25)} ${n(y + s * .05)} ${n(x)} ${n(y + s * .85)}Z`;

/** Smooth path through points (Catmull-Rom → cubic Bézier). `lead` is 'M' or 'L'. */
function smooth(pts, lead = 'M') {
  let d = `${lead}${xy(pts[0])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += `C${xy([p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6])} ${xy([p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6])} ${xy(p2)}`;
  }
  return d;
}

/* Quadratic Bézier maths for the noodle arms. */
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const qAt = (a, c, b, t) => mix(mix(a, c, t), mix(c, b, t), t);
function qTan(a, c, b, t) {
  const x = 2 * (1 - t) * (c[0] - a[0]) + 2 * t * (b[0] - c[0]);
  const y = 2 * (1 - t) * (c[1] - a[1]) + 2 * t * (b[1] - c[1]);
  const l = Math.hypot(x, y) || 1;
  return [x / l, y / l];
}
const qPath = (a, c, b) => `M${xy(a)}Q${xy(c)} ${xy(b)}`;

/** Lighten (amt > 0, toward warm white) or darken (amt < 0, toward warm brown) a #rrggbb colour. */
function tint(hex, amt) {
  const v = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const to = amt > 0 ? [255, 244, 228] : [58, 30, 14];
  const a = Math.abs(amt);
  return '#' + v.map((c, i) => Math.round(c + (to[i] - c) * a).toString(16).padStart(2, '0')).join('');
}
const skinSet = (base) => ({ base, hi: tint(base, 0.2), lo: tint(base, -0.14) });
const SKIN = { bride: skinSet('#C68B5E'), groom: skinSet('#B47550') };

const escAttr = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- Root ---------- */
let seq = 0;
function root(name, viewBox, body, opts = {}, data = {}) {
  injectCharacterDefs();
  const cls = ['chr', `chr-${name}`, opts.className].filter(Boolean).join(' ');
  const title = opts.title ? escAttr(opts.title) : '';
  // Golden-ratio spread so a crowd of dolls never blinks in unison.
  const delay = -n(((seq++ * 0.6180339887) % 1) * 5);
  const attrs = Object.entries(data).map(([k, v]) => ` data-${k}="${escAttr(v)}"`).join('');
  const a11y = title ? `role="img" aria-label="${title}"` : 'aria-hidden="true"';
  return `<svg class="${escAttr(cls)}" xmlns="${SVGNS}" viewBox="${viewBox}" ${a11y} focusable="false"${attrs} style="--chr-d:${delay}s">` +
    `${title ? `<title>${title}</title>` : ''}${opts.standalone ? `<defs>${DEFS}</defs>` : ''}${body}</svg>`;
}

/* ==========================================================================
   Shared parts
   ========================================================================== */

export const MOODS = ['smile', 'grin', 'joy', 'shy', 'wink', 'wow', 'sleepy', 'love', 'proud'];

/**
 * Eyes, brows, mouth and cheeks for a face centred at (x, y).
 * brows: 'soft' (fine arch) | 'bold' | 'none'.  look shifts the features (head turn).
 */
function features(o = {}) {
  const { x = 100, y = 96, look = 0, mood = 'smile', lashes = false, brows = 'soft', browColor = HAIR.base,
    moustache = null, glasses = false, bindi = false, tilak = false, blush = true, eyeRy = 7 } = o;
  const ey = y + 10;
  const lx = x - 21 + look, rx = x + 21 + look;
  const mx = x + look * 1.1, my = y + 25 + (moustache ? 2.5 : 0);
  const kind = { joy: 'happy', proud: 'happy', shy: 'down', sleepy: 'flat', love: 'heart' }[mood] || 'open';
  let out = '';

  // Cheeks — soft radial blush (shy & love blush harder, shy adds anime hatching).
  if (blush) {
    const big = mood === 'shy' || mood === 'love';
    const rxB = big ? 11.5 : 10, ryB = big ? 7 : 6, by = ey + 13.5;
    const bl = lx - 10.5 + look * 0.15, br = rx + 10.5 + look * 0.15;
    let b = fill(oval(bl, by, rxB, ryB), P.blush) + fill(oval(br, by, rxB, ryB), P.blush);
    if (mood === 'shy') {
      const h = (bx) => `M${n(bx - 5.5)} ${n(by + 2.2)}l2.6 -4.4M${n(bx - .5)} ${n(by + 2.2)}l2.6 -4.4M${n(bx + 4.5)} ${n(by + 2.2)}l2.6 -4.4`;
      b += stroke(h(bl) + h(br), ROSE, 1.3, ' opacity=".65"');
    }
    out += `<g class="chr-blush">${b}</g>`;
  }

  // Brows
  if (brows !== 'none') {
    const w = brows === 'bold' ? 3.2 : 2.2;
    const lift = mood === 'wow' ? -3 : 0;
    let d;
    if (mood === 'shy' || mood === 'sleepy') {          // soft, worried tilt
      d = `M${n(lx - 6)} ${n(ey - 13 + lift)}Q${n(lx)} ${n(ey - 15)} ${n(lx + 6)} ${n(ey - 17)}M${n(rx - 6)} ${n(ey - 17)}Q${n(rx)} ${n(ey - 15)} ${n(rx + 6)} ${n(ey - 13 + lift)}`;
    } else {
      const k = brows === 'bold' ? 1 : 0;
      d = `M${n(lx - 6.5 - k)} ${n(ey - 13.5 + lift)}Q${n(lx)} ${n(ey - 17.5 + lift)} ${n(lx + 6 + k)} ${n(ey - 14.5 + lift)}` +
        `M${n(rx - 6 - k)} ${n(ey - 14.5 + lift)}Q${n(rx)} ${n(ey - 17.5 + lift)} ${n(rx + 6.5 + k)} ${n(ey - 13.5 + lift)}`;
    }
    out += stroke(d, browColor, w);
  }

  // Eyes (grouped so .chr--blink can squash them)
  const happy = (ex) => `M${n(ex - 6)} ${n(ey + 2)}Q${n(ex)} ${n(ey - 6.5)} ${n(ex + 6)} ${n(ey + 2)}`;
  const down = (ex) => `M${n(ex - 6)} ${n(ey - 1.5)}Q${n(ex)} ${n(ey + 4.5)} ${n(ex + 6)} ${n(ey - 1.5)}`;
  const flat = (ex) => `M${n(ex - 6)} ${n(ey + .5)}Q${n(ex)} ${n(ey + 3.5)} ${n(ex + 6)} ${n(ey + .5)}`;
  let eyes = '';
  if (kind === 'open') {
    const open = mood === 'wink' ? [lx] : [lx, rx];
    eyes += fill(open.map((ex) => oval(ex, ey, 5.6, eyeRy)).join(''), INK);
    eyes += fill(open.map((ex) => dot(ex + 1.9, ey - 2.7, 2.1) + dot(ex - 1.7, ey + 2.9, 1)).join(''), '#FFFFFF');
    if (mood === 'wink') eyes += stroke(happy(rx), INK, 2.8);
    if (lashes) eyes += stroke(`M${n(lx - 4.7)} ${n(ey - 4.6)}l-3.7 -2.6` + (mood === 'wink' ? `M${n(rx + 6)} ${n(ey + 1.6)}l3.5 -1.6` : `M${n(rx + 4.7)} ${n(ey - 4.6)}l3.7 -2.6`), INK, 1.8);
  } else if (kind === 'heart') {
    eyes += fill(heartPath(lx, ey, 6.6) + heartPath(rx, ey, 6.6), KUMKUM);
    eyes += fill(dot(lx - 2.2, ey - 2.4, 1.6) + dot(rx - 2.2, ey - 2.4, 1.6), '#FFFFFF', ' opacity=".85"');
  } else {
    const arc = kind === 'happy' ? happy : kind === 'down' ? down : flat;
    eyes += stroke(arc(lx) + arc(rx), INK, 2.7);
    if (lashes) {
      const ly = kind === 'happy' ? ey + 1.6 : kind === 'down' ? ey - 1.6 : ey + .4;
      eyes += stroke(`M${n(lx - 6)} ${n(ly)}l-3.4 -1.8M${n(rx + 6)} ${n(ly)}l3.4 -1.8`, INK, 1.7);
    }
  }
  out += `<g class="chr-eyes">${eyes}</g>`;

  if (glasses) {
    out += stroke(dot(lx, ey, 10) + dot(rx, ey, 10) + `M${n(lx + 10)} ${n(ey - 1.5)}Q${n(x + look)} ${n(ey - 5)} ${n(rx - 10)} ${n(ey - 1.5)}`, GOLD.line, 2);
    out += stroke(`M${n(lx - 5)} ${n(ey - 5.5)}q3 -2.6 6.6 -2.4M${n(rx - 5)} ${n(ey - 5.5)}q3 -2.6 6.6 -2.4`, '#FFFFFF', 1.4, ' opacity=".7"');
  }
  if (bindi) out += fill(dot(x + look * 0.7, ey - 18.5, 2.5), KUMKUM);
  if (tilak) out += fill(dot(x + look * 0.7, ey - 19, 3.3), '#EAC88E') + fill(dot(x + look * 0.7, ey - 19, 1.5), KUMKUM);

  // Moustache sits between eyes and mouth (tiny, soft, upturned tips)
  if (moustache) {
    const c = mx, t = my - 7.5;
    out += fill(`M${n(c)} ${n(t)}C${n(c - 3.6)} ${n(t - 3.2)} ${n(c - 8.6)} ${n(t - 2.6)} ${n(c - 10.6)} ${n(t + .8)}C${n(c - 7.6)} ${n(t + .6)} ${n(c - 4.4)} ${n(t + 2.4)} ${n(c)} ${n(t + 1.9)}` +
      `C${n(c + 4.4)} ${n(t + 2.4)} ${n(c + 7.6)} ${n(t + .6)} ${n(c + 10.6)} ${n(t + .8)}C${n(c + 8.6)} ${n(t - 2.6)} ${n(c + 3.6)} ${n(t - 3.2)} ${n(c)} ${n(t)}Z`, moustache);
  }

  // Mouth
  let m;
  if (mood === 'grin' || mood === 'joy' || mood === 'love') {
    m = fill(`M${n(mx - 7.5)} ${n(my - 2)}Q${n(mx)} ${n(my - .6)} ${n(mx + 7.5)} ${n(my - 2)}Q${n(mx + 6.6)} ${n(my + 9)} ${n(mx)} ${n(my + 9)}Q${n(mx - 6.6)} ${n(my + 9)} ${n(mx - 7.5)} ${n(my - 2)}Z`, MOUTH_IN) +
      fill(oval(mx, my + 6, 3.8, 2.3), TONGUE);
  } else if (mood === 'wow') {
    m = fill(oval(mx, my + 2.5, 3.6, 4.6), MOUTH_IN);
  } else if (mood === 'shy' || mood === 'sleepy') {
    m = stroke(`M${n(mx - 3.8)} ${n(my + .5)}Q${n(mx)} ${n(my + 3.4)} ${n(mx + 3.8)} ${n(my + .5)}`, MOUTH, 2.4);
  } else if (mood === 'proud') {
    m = stroke(`M${n(mx - 8.5)} ${n(my - 2.5)}Q${n(mx)} ${n(my + 6.5)} ${n(mx + 8.5)} ${n(my - 2.5)}`, MOUTH, 2.6);
  } else {
    m = stroke(`M${n(mx - 6)} ${n(my - 1)}Q${n(mx)} ${n(my + 5.6)} ${n(mx + 6)} ${n(my - 1)}`, MOUTH, 2.6);
  }
  out += `<g class="chr-mouth">${m}</g>`;
  return out;
}

/**
 * A soft "noodle" arm: quadratic curve shoulder → (control) → hand, with an optional sleeve,
 * gold bangles/cuffs and a mitten hand. Wrapped in a hook group pivoting at the shoulder.
 */
function arm({ cls, s, c, e, w = 12.5, skin, sleeve = null, sleeveHi = null, sleeveTo = 0.42, sleeveW = 0, bands = [], bandColor = GOLD.line, hand = 7, extra = '' }) {
  const d = qPath(s, c, e);
  const long = sleeve && sleeveTo >= 1;
  const sw = sleeveW || (long ? w + 2 : w + 3);
  let out = stroke(d, SHADE, (long ? sw : w) + 1, ' transform="translate(1.6 3.2)"');
  if (long) {
    out += stroke(d, sleeve, sw);
    // light catches the upper-left edge of the fabric: a narrower, lighter stroke nudged that way
    if (sleeveHi) out += stroke(d, sleeveHi, sw - 7, ' transform="translate(-1.6 -.6)"');
  } else {
    out += stroke(d, skin, w);
    if (sleeve) out += stroke(qPath(s, mix(s, c, sleeveTo), qAt(s, c, e, sleeveTo)), sleeve, sw);
  }
  if (bands.length) {
    const hw = (long ? sw : w) / 2 + .4;
    out += stroke(bands.map((t) => {
      const p = qAt(s, c, e, t), tg = qTan(s, c, e, t), nn = [-tg[1] * hw, tg[0] * hw];
      return `M${xy([p[0] + nn[0], p[1] + nn[1]])}Q${xy([p[0] + tg[0] * 2.8, p[1] + tg[1] * 2.8])} ${xy([p[0] - nn[0], p[1] - nn[1]])}`;
    }).join(''), bandColor, 2.4);
  }
  const tg = qTan(s, c, e, 1);
  out += fill(dot(e[0] + tg[0] * 2.2, e[1] + tg[1] * 2.2, hand), skin);
  return hook(cls, [s[0], s[1], 78], out + extra);
}

/** Two little feet (separate hooks so .chr--walk can step). lift: [left, right] in user units. */
function feet(xl, xr, y, skin, { lift, rx = 8.5, ry = 4.6, hooks = true } = {}) {
  const [a, b] = lift || [0, 0];
  if (!hooks) return fill(oval(xl, y - a, rx, ry) + oval(xr, y - b, rx, ry), skin);
  return `<g class="chr-foot-l">${fill(oval(xl, y - a, rx, ry), skin)}</g><g class="chr-foot-r">${fill(oval(xr, y - b, rx, ry), skin)}</g>`;
}

/** Wave motion lines near a raised hand. */
const waveLines = (x, y) => stroke(`M${n(x + 8)} ${n(y - 13)}q5.5 4 5.5 11M${n(x + 13)} ${n(y - 20)}q8 6 8 17`, GOLD.line, 1.8, ' opacity=".9"');

/** Two floating gold music notes. */
const notes = (x, y) => `<g class="chr-notes">${fill(oval(x, y, 3.6, 2.7) + oval(x + 14, y - 8, 3.2, 2.4), GOLD.base)}` +
  `${stroke(`M${n(x + 3.2)} ${n(y - .6)}V${n(y - 13)}l6 -2.4M${n(x + 17)} ${n(y - 8.6)}V${n(y - 20)}`, GOLD.base, 1.6)}</g>`;

/** Jasmine buds (one path + one shadow path). */
const buds = (pts, r = 3.2, shade = true) => (shade ? fill(pts.map(([x, y, k = 1]) => dot(x + .5, y + 1.2, r * k)).join(''), JASMINE_SHADE) : '') +
  fill(pts.map(([x, y, k = 1]) => dot(x, y, r * k)).join(''), JASMINE);

/** Ground shadow (outside the rig, so it stays put — and shrinks — while the doll hops). */
const groundShadow = (cx, rx, { y = 290, hook: isHook = true } = {}) =>
  `<ellipse${isHook ? ' class="chr-shadow"' : ''} cx="${cx}" cy="${y}" rx="${rx}" ry="${n(rx * .13)}" fill="${P.ground}"/>`;

/* ==========================================================================
   Bride — ivory silk saree with zari border, oddiyanam, braid with jasmine
   ========================================================================== */

const BRIDE_FRONT_HAIR = 'M44 106C36 62 62 34 100 34C138 34 164 62 156 106L150.5 101C149 78 130 57 100 55C70 57 51 78 49.5 101Z';
/** Soft crown shine either side of a centre parting (short, so it never reads as a headband). */
const HAIR_SHINE = 'M88 41.6C79 43.6 71.5 48.6 66.5 55.6M112 41.6C121 43.6 128.5 48.6 133.5 55.6';

function brideHead({ mood = 'smile', look = 0, tilt = 0, jasmine = true, lite = false }) {
  const S = SKIN.bride;
  let h = '';
  if (jasmine) {
    // Jasmine strand peeking around the back of the head, running down into the braid.
    const pts = [];
    for (let i = 0; i < 8; i++) {
      const a = (154 + i * 10) * Math.PI / 180;
      pts.push([100 + 62.5 * Math.cos(a), 95 - 61 * Math.sin(a), i % 2 ? .92 : 1.05]);
    }
    h += buds(pts, 3.4, !lite);
  }
  h += fill(oval(100, 94, 59, 57), HAIR.base);                                  // back hair
  h += fill(dot(49, 108, 8.5) + dot(151, 108, 8.5), S.lo);                      // ears
  h += fill(oval(100, 96, 52, 48), S.base);                                     // face
  h += fill(BRIDE_FRONT_HAIR, HAIR_SHADE, ' transform="translate(0 3.4)"');     // hairline shadow
  h += fill(BRIDE_FRONT_HAIR, HAIR.base);
  h += stroke(HAIR_SHINE, HAIR.hi, 3, ' opacity=".75"');
  h += features({ mood, look, lashes: true, brows: 'soft', bindi: true });
  // Maang tikka: chain along the parting + pendant + pearl
  const tx = 100 + look * .45;
  h += stroke(`M100 36.5Q${n(tx)} 46 ${n(tx)} 52.5`, GOLD.line, 1.5);
  // Jhumkas: stud + bell (+ pearl drops). Tikka pendant shares the gold path, pearls share one too.
  const jh = (x) => dot(x, 116.6, 2.4) + `M${x - 7.5} 130Q${x - 7.5} 121.4 ${x} 121Q${x + 7.5} 121.4 ${x + 7.5} 130Z`;
  const jp = (x) => dot(x - 6, 132.2, 1.5) + dot(x, 133.1, 1.6) + dot(x + 6, 132.2, 1.5);
  h += fill(dot(tx, 57.6, 4.5) + jh(47.5) + jh(152.5), P.gold);
  if (!lite) h += fill(dot(tx, 57.6, 1.6), KUMKUM) + fill(dot(tx, 65.2, 1.9) + jp(47.5) + jp(152.5), PEARL);
  return hook('chr-head', [100, 148, 140], rot(tilt, 100, 148, h));
}

/** Braid over her (screen-left) shoulder, wound with jasmine, ending in a gold kunjalam tassel. */
function brideBraid({ swing = 0, jasmine = true, lite = false }) {
  const B = [[86, 134, 8.7], [83, 149, 8.5], [80.8, 164, 8.1], [79.5, 179, 7.6], [79.2, 194, 7.1], [79.8, 209, 6.5], [81, 225, 5.7]];
  const left = B.map(([x, y, w]) => [x - w, y]);
  const right = B.map(([x, y, w]) => [x + w, y]).reverse();
  let b = fill(smooth(left) + smooth(right, 'L') + 'Z', HAIR.base);
  // weave chevrons every half segment
  let weave = '';
  for (let i = 1; i < B.length; i++) {
    for (const t of [0, .5]) {
      const p = i - 1 + t + .5;
      if (p >= B.length - .4) continue;
      const a = B[Math.floor(p)], z = B[Math.min(B.length - 1, Math.ceil(p))], k = p % 1;
      const x = a[0] + (z[0] - a[0]) * k, y = a[1] + (z[1] - a[1]) * k, w = (a[2] + (z[2] - a[2]) * k) * .9;
      weave += `M${n(x - w)} ${n(y - 4)}Q${n(x)} ${n(y + 4)} ${n(x + w)} ${n(y - 4)}`;
    }
  }
  b += stroke(weave, HAIR.hi, 2, ' opacity=".85"');
  if (jasmine) b += buds(B.slice(1).map(([x, y, w], i) => [x + (i % 2 ? 1 : -1) * w * .72, y + 2, i % 2 ? .95 : 1.05]), 3.2, !lite);
  // kunjalam: cap + three bobbles
  b += fill('M75 226.5H87L84.4 234.5H77.6Z' + dot(77.4, 238.6, 2.6) + dot(81, 240.8, 2.9) + dot(84.6, 238.6, 2.6), P.gold);
  return hook('chr-braid', [86, 134, 125], rot(swing, 86, 134, b));
}

const BRIDE_POSES = {
  stand: { mood: 'smile', l: { c: [65, 187], e: [64.5, 209] }, r: { c: [135, 187], e: [135.5, 209] } },
  wave: { mood: 'grin', l: { c: [65, 187], e: [64.5, 209] }, r: { c: [158, 170], e: [166, 137] }, rFront: true, wave: true },
  // Shy: hands tucked behind her back, rocking on one heel, head tilted, cheeks on fire.
  shy: { mood: 'shy', tilt: 8, lean: -1.5, behind: true, lift: [3.5, 0], l: { c: [64, 190], e: [83, 207] }, r: { c: [136, 190], e: [117, 207] } },
  dance: { mood: 'joy', lean: 3.5, tilt: -6, swing: 14, l: { c: [48, 188], e: [69, 201] }, r: { c: [152, 152], e: [158, 120] }, rFront: true, notes: [150, 92] },
  sit: { mood: 'smile', sit: 46, l: { c: [64, 190], e: [84, 202] }, r: { c: [136, 190], e: [116, 202] } },
};

/**
 * Bride parts as layers so the couple can reuse them.
 * Returns { shadow, body } where body is the doll without the ground shadow.
 */
function brideFigure(opts = {}) {
  const pose = BRIDE_POSES[opts.pose] ? opts.pose : 'stand';
  const cfg = { ...BRIDE_POSES[pose], ...(opts.override || {}) };
  const S = SKIN.bride;
  const mood = opts.mood || cfg.mood;
  const look = opts.look ?? cfg.look ?? 0;
  const jas = opts.jasmine !== false;
  const lite = !!opts.lite;
  const dy = cfg.sit || 0;
  let lower = '', upper = '';

  const mk = (side, a) => arm({
    cls: a.cls || `chr-arm-${side}`, s: side === 'l' ? [74.5, 166] : [125.5, 166], c: a.c, e: a.e,
    w: 12.5, skin: S.base, sleeve: P.gold, sleeveTo: .36, sleeveW: 14.6, bands: [.83, .9],
    extra: a.extra || '',
  });
  const armL = mk('l', cfg.l);
  const armR = mk('r', { ...cfg.r, extra: cfg.wave ? waveLines(cfg.r.e[0], cfg.r.e[1]) : '' });
  // Hands tucked behind her back: the arms sit behind the skirt and torso.
  if (cfg.behind) lower += armL + armR;

  if (dy) {
    // Seated cross-legged: silk pools over two soft knees, the pleats fan out in front.
    lower += fill('M68 238C46 240 34 254 36 270C37 281 47 287 60 287Q100 292 140 287C153 287 163 281 164 270C166 254 154 240 132 238Z', P.silk);
    lower += fill(oval(60, 262, 17, 11) + oval(140, 262, 17, 11), '#FFFCF5', ' opacity=".75"');
    lower += stroke('M82 252C78 262 77 272 78 282M118 252C122 262 123 272 122 282', CLOTH.fold, 1.8);
    lower += fill('M100 249L121 289Q100 292.6 79 289Z', CLOTH.panel);
    lower += stroke('M100 250L85 289.4M100 250L93 290.8M100 250L100.6 291.4M100 250L108 290.8M100 250L115 289.4', CLOTH.line, 1.4);
    lower += fill('M36.8 276.6C40 283.6 48 287 60 287Q100 292 140 287C152 287 160 283.6 163.2 276.6Q100 286.4 36.8 276.6Z', P.band);
    if (!lite) lower += fill(dot(56, 252, 1.8) + dot(146, 252, 1.8) + dot(68, 270, 1.6) + dot(133, 270, 1.6), GOLD.base);
  } else {
    lower += feet(89, 111, 287, S.base, { lift: cfg.lift, hooks: !lite || !!cfg.lift });
    lower += fill('M72 196H128C136 222 146 252 153 278Q100 291 47 278C54 252 64 222 72 196Z', P.silk);
    if (!lite) lower += stroke('M80 216C76 238 70 258 64.5 273M121 216C125 238 131 258 136 273', CLOTH.fold, 2);
    lower += fill('M95 204H111L127 282Q107 288 86 284Z', CLOTH.panel);                       // pleats
    lower += stroke('M99 206L94.5 284M103 206L101.5 285.5M107 206L109 285.5M110.5 205L117 284', CLOTH.line, 1.5);
    lower += fill('M49.6 268Q100 281 150.4 268L153 278Q100 291 47 278Z', P.band);           // zari hem
    if (!lite) {
      lower += stroke('M51.2 272.4Q100 285 148.8 272.4', GOLD.hi, 1, ' opacity=".8"');
      lower += stroke('M95.5 273.5L94.5 284M102 275L101.5 285.5M108.4 275L109 285.5M115.4 274L117 284', GOLD.deep, 1.3);
      lower += fill(dot(70, 228, 1.8) + dot(84, 250, 1.8) + dot(129, 233, 1.8) + dot(137, 256, 1.8) + dot(64, 256, 1.8) + dot(119, 222, 1.6), GOLD.base);
    }
  }

  // Torso: neck, saree wrap, gold blouse, diagonal pallu, oddiyanam, necklaces
  upper += fill('M90 132H110V162Q100 167 90 162Z', S.base);
  upper += fill(oval(100, 146, 10, 6), S.lo);
  const torso = 'M75 157C80 155 85 154 88.5 154Q100 167 111.5 154C115 154 120 155 125 157C132 160 135 167 134 176';
  upper += fill(`${torso}L130 202H70L66 176C65 167 68 160 75 157Z`, P.silk);
  upper += fill(`${torso}L133.4 185H66.6L66 176C65 167 68 160 75 157Z`, P.gold);
  upper += fill('M66 186L113 155C123 152 132 156 135 166L70 208C65 202 64 193 66 186Z', P.silk);
  upper += stroke('M67.6 190.4L114 158.6M70.4 203.6L132.6 165.4', GOLD.line, 2.4);
  if (!lite) upper += fill(dot(86, 186, 1.5) + dot(104, 176, 1.5) + dot(121, 167, 1.4), GOLD.base);
  upper += fill('M68.8 197Q100 205.5 131.2 197L131.6 204.4Q100 213.5 68.4 204.4Z', P.band);    // oddiyanam
  upper += fill(oval(100, 205, 8.6, 6.4), P.gold);
  upper += stroke('M88.6 155.6Q100 166 111.4 155.6', P.gold, 4);                               // choker
  upper += stroke('M85 157Q100 196 115 157', GOLD.line, 2);                                    // haram
  upper += fill('M100 179.5C103.6 179.5 105.6 183 104.8 186C104 189 100 191.5 100 191.5C100 191.5 96 189 95.2 186C94.4 183 96.4 179.5 100 179.5Z', P.gold);
  upper += fill(dot(100, 205, 2.6) + dot(100, 185.6, 1.8), KUMKUM);

  // Pallu tucked over the (screen-right) shoulder
  const fold = fill('M118 153C127 151 135 156 137 165C134 170 129 171 124 168C124 162 122 157 118 153Z', P.silk) +
    stroke('M120.5 154.2C128 153.5 134.5 158 136 165', GOLD.line, 2);

  if (!cfg.behind) upper += armL;
  upper += brideBraid({ swing: cfg.swing || 0, jasmine: jas, lite });
  if (!cfg.rFront) upper += (cfg.behind ? '' : armR) + fold;
  upper += brideHead({ mood, look, tilt: cfg.tilt || 0, jasmine: jas, lite });
  if (cfg.rFront) upper += armR + fold;
  if (cfg.notes) upper += notes(cfg.notes[0], cfg.notes[1]);

  const body = rot(cfg.lean || 0, 100, 290, lower + move(0, dy, upper));
  return { shadow: groundShadow(100, dy ? 66 : 54), body };
}

/* ==========================================================================
   Groom — ivory shirt, gold-bordered veshti & angavastram, neat side part
   ========================================================================== */

const GROOM_BACK_HAIR = 'M45.5 112C38 64 64 31 100 31C136 31 162 64 154.5 112Z';
/** Neat side part on the screen-left; the fringe rises into a soft quiff and sweeps right. */
const GROOM_FRONT_HAIR = 'M46.5 104C40 66 54 38 77 30C86 21 104 18 118 21C140 25 158 44 157 70C157 82 155.5 94 153.5 104' +
  'L149.5 103.5C150 90 148 80 143 73C135 79 119 78 106 70.5C94 63.5 85 55 78.5 46.5C67 57 56.5 76 51 104Z';
const GROOM_HAIR_SHINE = 'M88 34C104 26.5 126 30 141 45M59 69C61.5 61 65.5 55 71 50';

function groomHead({ mood = 'smile', look = 0, tilt = 0, moustache = true, tilak = true }) {
  const S = SKIN.groom;
  let h = '';
  h += fill(GROOM_BACK_HAIR, HAIR.base);
  h += fill(dot(49.5, 108, 8.5) + dot(150.5, 108, 8.5), S.lo);
  h += fill(oval(100, 96, 52, 48), S.base);
  h += fill(GROOM_FRONT_HAIR, HAIR_SHADE, ' transform="translate(0 3.4)"');
  h += fill(GROOM_FRONT_HAIR, HAIR.base);
  h += stroke(GROOM_HAIR_SHINE, HAIR.hi, 3.2, ' opacity=".8"');
  // the parting itself, and a cheeky flick at the fringe tip
  h += stroke('M78.5 46.5C80 39.5 83.5 34 88.5 30.5', S.lo, 1.5, ' opacity=".8"');
  h += stroke('M143 73C147.5 76.5 147.5 83 143.5 85.5', HAIR.base, 3.2);
  h += features({ mood, look, brows: 'bold', moustache: moustache ? HAIR.base : null, tilak, eyeRy: 6.8 });
  return hook('chr-head', [100, 148, 140], rot(tilt, 100, 148, h));
}

const GROOM_POSES = {
  stand: { mood: 'smile', l: { c: [61, 187], e: [61.5, 205] }, r: { c: [139, 187], e: [138.5, 205] } },
  wave: { mood: 'grin', l: { c: [61, 187], e: [61.5, 205] }, r: { c: [160, 170], e: [167, 138] }, rFront: true, wave: true },
  proud: { mood: 'proud', l: { c: [38, 186], e: [67, 204] }, r: { c: [162, 186], e: [133, 204] }, sparkle: true },
  dance: { mood: 'joy', lean: -4, tilt: 6, l: { c: [46, 158], e: [37, 187] }, r: { c: [152, 150], e: [146, 118] }, rFront: true, notes: [44, 96] },
  sit: { mood: 'smile', sit: 46, l: { c: [58, 188], e: [58, 206] }, r: { c: [142, 188], e: [142, 206] } },
};

function groomFigure(opts = {}) {
  const pose = GROOM_POSES[opts.pose] ? opts.pose : 'stand';
  const cfg = { ...GROOM_POSES[pose], ...(opts.override || {}) };
  const S = SKIN.groom;
  const mood = opts.mood || cfg.mood;
  const look = opts.look ?? cfg.look ?? 0;
  const lite = !!opts.lite;
  const dy = cfg.sit || 0;
  let lower = '', upper = '';

  if (dy) {
    // Cross-legged: the veshti spreads over two knees, feet tucked in at the front.
    lower += fill('M68 238C46 240 34 254 36 270C37 281 47 287 60 287Q100 292 140 287C153 287 163 281 164 270C166 254 154 240 132 238Z', P.silk);
    lower += fill(oval(60, 262, 17, 11) + oval(140, 262, 17, 11), '#FFFCF5', ' opacity=".75"');
    lower += stroke('M80 250C90 258 110 258 120 250', CLOTH.fold, 1.8);
    lower += fill('M36.8 276.6C40 283.6 48 287 60 287Q100 292 140 287C152 287 160 283.6 163.2 276.6Q100 286.4 36.8 276.6Z', P.band);
    lower += fill(oval(87, 282, 10, 5) + oval(113, 282, 10, 5), S.base);
  } else {
    lower += feet(90, 110, 287, S.base, { lift: cfg.lift, hooks: !lite || !!cfg.lift });
    lower += fill('M69 206H131L137 281Q100 290 63 281Z', P.silk);                               // veshti
    if (!lite) lower += stroke('M85 222L79 274M93 224L91 278', CLOTH.fold, 1.8);
    lower += fill('M64.2 269.4Q100 278.4 135.8 269.4L137 281Q100 290 63 281Z', P.band);
    if (!lite) lower += stroke('M65.4 273.6Q100 282.6 134.6 273.6', GOLD.hi, 1, ' opacity=".8"');
    lower += fill('M111 212L116 212L121.6 286.4L116.6 287Z', P.gold);                         // front kara
  }

  upper += fill('M89 128H111V163Q100 167 89 163Z', S.base);
  upper += fill(oval(100, 146, 10, 6), S.lo);
  const shirt = 'M74 157C82 153 118 153 126 157C133 160 136 167 135 177L133 214Q100 221 67 214L65 177C64 167 67 160 74 157Z';
  if (!dy) upper += fill('M67 214Q100 221 133 214L133 218.5Q100 226 67 218.5Z', SHADE);     // shirt hem shadow
  upper += fill(shirt, P.silk);
  upper += stroke('M100 163V213', CLOTH.line, 1.6);
  upper += fill(dot(100, 171, 1.9) + dot(100, 185, 1.9) + dot(100, 199, 1.9), GOLD.base);
  upper += fill('M88.4 152.6Q100 160 111.6 152.6L112.2 157.6Q100 165.6 87.8 157.6Z', CLOTH.panel);  // collar
  if (!lite) upper += stroke('M87.8 157.6Q100 165.6 112.2 157.6', GOLD.line, 1.6);
  // Angavastram over his (screen-right) shoulder
  const anga = 'M112 154.5C121 151 131 154 134.5 160L131.5 233L114 230.5L115.4 170C115.6 163 114.4 158.5 112 154.5Z';
  if (!lite) upper += fill(anga, SHADE, ' transform="translate(1.4 2.4)"');
  upper += fill(anga, P.silk);
  upper += stroke('M117.6 158.6L117.4 228.6M130 160.5L127.6 231', GOLD.line, 2.2);
  upper += fill('M114.3 222.4L131.9 224.6L131.5 233L114 230.5Z', P.band);
  if (!lite) upper += stroke('M116.4 234v3.6M120.4 234.6v3.6M124.4 235.2v3.6M128.4 235.6v3.6', GOLD.line, 1.3);

  const mk = (side, a) => arm({
    cls: a.cls || `chr-arm-${side}`, s: side === 'l' ? [70, 165] : [130, 165], c: a.c, e: a.e,
    w: 13, skin: S.base, sleeve: SLEEVE.base, sleeveHi: SLEEVE.hi, sleeveTo: 1, sleeveW: 15, bands: [.93], hand: 7.2,
    extra: a.extra || '',
  });
  const armL = mk('l', cfg.l);
  const armR = mk('r', { ...cfg.r, extra: cfg.wave ? waveLines(cfg.r.e[0], cfg.r.e[1]) : '' });

  upper += armL;
  if (!cfg.rFront) upper += armR;
  upper += groomHead({ mood, look, tilt: cfg.tilt || 0, moustache: opts.moustache !== false, tilak: opts.tilak !== false });
  if (cfg.rFront) upper += armR;
  if (cfg.sparkle) upper += `<g class="chr-sparkle">${fill(sparkle(160, 52, 9) + sparkle(172, 74, 5), P.gold)}</g>`;
  if (cfg.notes) upper += notes(cfg.notes[0], cfg.notes[1]);

  const body = rot(cfg.lean || 0, 100, 290, lower + move(0, dy, upper));
  return { shadow: groundShadow(100, dy ? 66 : 52), body };
}

/* ==========================================================================
   Public: single characters
   ========================================================================== */

export const POSES = {
  bride: Object.keys(BRIDE_POSES),
  groom: Object.keys(GROOM_POSES),
  couple: ['hold-hands', 'garland', 'walk'],
  parrot: ['perch', 'fly', 'pick'],
  guest: ['stand', 'wave'],
};

/** The bride. pose: stand | wave | shy | dance | sit */
export function bride(opts = {}) {
  const pose = BRIDE_POSES[opts.pose] ? opts.pose : 'stand';
  const f = brideFigure({ ...opts, pose });
  return root('bride', '0 0 200 300', f.shadow + hook('chr-rig', [100, 290, 330], f.body), opts, { pose });
}

/** The groom. pose: stand | wave | proud | dance | sit */
export function groom(opts = {}) {
  const pose = GROOM_POSES[opts.pose] ? opts.pose : 'stand';
  const f = groomFigure({ ...opts, pose });
  return root('groom', '0 0 200 300', f.shadow + hook('chr-rig', [100, 290, 330], f.body), opts, { pose });
}

/* ==========================================================================
   Couple — both together. Bride on screen-left (names read "Ananya & Arjun").
   ========================================================================== */

/** Thick malai: marigold base banded with jasmine and rose (period 11), plus a gold tassel. */
function garland(cx, top, bottom, spread = 18, shade = true) {
  const d = `M${n(cx - spread)} ${top}C${n(cx - spread - 5)} ${n(top + (bottom - top) * .62)} ${n(cx - 10)} ${bottom} ${cx} ${bottom}` +
    `C${n(cx + 10)} ${bottom} ${n(cx + spread + 5)} ${n(top + (bottom - top) * .62)} ${n(cx + spread)} ${top}`;
  return hook('chr-garland', [cx, top, bottom - top + 30],
    (shade ? stroke(d, SHADE, 13.5, ' transform="translate(1.4 2.6)"') : '') +
    stroke(d, MARIGOLD, 13) +
    dash(d, JASMINE, 13, '4.5 6.5') +
    dash(d, '#E07A66', 13, '2.2 8.8', -6.65) +
    fill(`M${n(cx - 5)} ${n(bottom + 3)}L${n(cx + 5)} ${n(bottom + 3)}L${n(cx + 2.8)} ${n(bottom + 17)}L${n(cx - 2.8)} ${n(bottom + 17)}Z` + dot(cx, bottom + 18.5, 3.4), P.gold) +
    fill(dot(cx, bottom + 1, 6.4), '#E07A66'));
}

const COUPLE_POSES = {
  'hold-hands': {
    bride: { mood: 'smile', look: 4, tilt: 4, r: { cls: 'chr-arm-hold', c: [143, 197], e: [159, 207] } },
    groom: { mood: 'smile', look: -4, tilt: -4, l: { cls: 'chr-arm-hold', c: [56, 197], e: [41, 207] } },
    heart: true,
  },
  garland: {
    bride: { mood: 'grin', look: 3, tilt: 5, r: { cls: 'chr-arm-hold', c: [143, 197], e: [159, 207] } },
    groom: { mood: 'joy', look: -3, tilt: -5, l: { cls: 'chr-arm-hold', c: [56, 197], e: [41, 207] } },
    garland: true,
  },
  walk: {
    bride: { mood: 'grin', look: 7, lean: 5, swing: -12, l: { c: [60, 182], e: [50, 199] }, r: { cls: 'chr-arm-hold', c: [144, 200], e: [160, 210] }, lift: [5, 0] },
    groom: { mood: 'smile', look: 7, lean: 5, l: { cls: 'chr-arm-hold', c: [55, 200], e: [40, 210] }, r: { c: [150, 180], e: [156, 197] }, lift: [0, 5] },
  },
};

/** The couple. pose: hold-hands | garland | walk */
export function couple(opts = {}) {
  const pose = COUPLE_POSES[opts.pose] ? opts.pose : 'hold-hands';
  const cfg = COUPLE_POSES[pose];
  const bo = { ...cfg.bride }, go = { ...cfg.groom };
  // Pose tables are partial: fill the missing arm from the solo stand pose.
  bo.l = bo.l || BRIDE_POSES.stand.l; bo.r = bo.r || BRIDE_POSES.stand.r;
  go.l = go.l || GROOM_POSES.stand.l; go.r = go.r || GROOM_POSES.stand.r;
  const b = brideFigure({ pose: 'stand', mood: opts.moodBride || bo.mood, look: bo.look, lite: true, jasmine: opts.jasmine, override: bo });
  const g = groomFigure({ pose: 'stand', mood: opts.moodGroom || go.mood, look: go.look, lite: true, moustache: opts.moustache, tilak: opts.tilak, override: go });

  // The bride is drawn a touch smaller so the pair reads as a couple, not twins.
  let brideBody = `<g transform="translate(101 290) scale(.96) translate(-100 -290)">${b.body}`;
  let groomBody = `<g transform="translate(130 0)">${g.body}`;
  if (cfg.garland) {
    brideBody += garland(100, 154, 240, 17.5, false);
    groomBody += garland(100, 154, 244, 19, false);
  }
  brideBody += '</g>';
  groomBody += '</g>';

  let extra = '';
  if (cfg.heart && opts.heart !== false) {
    // a little foil heart floating between them (beats under .chr--blink)
    extra += `<g class="chr-heart">${fill(heartPath(166, 34, 12), KUMKUM, ' opacity=".92"')}${fill(heartPath(166, 33, 6.4), P.gold)}${fill(sparkle(184, 22, 5), P.gold)}</g>`;
  }

  const shadows = `<g class="chr-shadow">${groundShadow(101, 52, { hook: false })}${groundShadow(230, 50, { hook: false })}</g>`;
  return root('couple', '0 0 330 300', shadows + hook('chr-rig', [165, 290, 420], brideBody + groomBody + extra), opts, { pose });
}

/* ==========================================================================
   Parrot — the Kili Josiyam fortune parrot (rose-ringed, gold collar)
   ========================================================================== */

const PARROT = {
  body: 'M110 78C134 82 144 108 140 134C136 158 118 168 98 166C78 164 66 148 68 124C70 96 86 76 110 78Z',
  belly: 'M129 98C140 114 140 142 128 156C119 165 106 167 98 162C111 148 121 124 129 98Z',
  wingFolded: 'M106 92C88 92 72 108 70 132C69 146 74 158 82 166C92 156 104 136 110 116C113 104 112 94 106 92Z',
  wingSpread: 'M108 102C94 92 80 74 74 52C71 41 77 33 85 37C90 39 92 45 92 51C95 43 103 40 107 46C110 51 108 58 104 64C110 60 118 62 118 70C118 79 112 88 108 102Z',
  tailA: 'M86 146C76 172 64 196 50 214C66 202 84 180 98 154Z',
  tailB: 'M94 150C90 176 82 198 72 214C86 202 100 180 104 156Z',
};

function parrotHead({ card = null, mood = 'smile' }) {
  let h = '';
  h += fill('M116 34C111 24 115 15 124 13C120 21 122 28 127 33ZM107 38C101 31 102 22 109 18C107 26 109 32 113 36Z', LEAF.base);  // crest
  h += fill(dot(120, 64, 35), LEAF.light);
  h += stroke('M93 53C98 41 108 34 121 32.5', '#CBE2A6', 4, ' opacity=".9"');
  h += stroke('M91 94C105 107 131 108 148 96', P.gold, 5);                    // gold collar (rose-ringed!)
  h += stroke('M93 89C106 100.5 129 102 145.5 91', '#E8A190', 2, ' opacity=".9"');
  h += fill(oval(136.5, 82, 7.6, 5), P.blush);
  // eye (one visible in profile): happy arc, sleepy line, heart, or a big shiny dot
  let eye;
  if (mood === 'joy' || mood === 'proud' || mood === 'wink' || mood === 'grin') eye = stroke('M122.5 63Q129 55.5 135.5 63', INK, 2.8);
  else if (mood === 'sleepy' || mood === 'shy') eye = stroke('M122.5 60.5Q129 65 135.5 60.5', INK, 2.6);
  else if (mood === 'love') eye = fill(heartPath(129, 60, 7.2), KUMKUM) + fill(dot(126.6, 57.4, 1.7), '#FFFFFF', ' opacity=".85"');
  else {
    const big = mood === 'wow' ? 1.15 : 1;
    eye = fill(oval(129, 60, 6.6 * big, 7.6 * big), INK) + fill(dot(131, 57, 2.4) + dot(127.2, 63, 1.1), '#FFFFFF');
  }
  h += `<g class="chr-eyes">${eye}</g>`;
  h += fill('M149 72C155 74 159 78 159 86C153 87 148 83 146 78Z', CORAL.deep);   // lower beak
  if (card) h += card;
  h += fill('M148 50C162 48 173 58 171 72C170 80 165 86 159 88C160 80 157 74 149 72C146 64 146 56 148 50Z', CORAL.base);
  h += stroke('M152.5 53.5C160 53.5 166 58.5 167 66', CORAL.hi, 2);
  return h;
}

/** Little fortune card held in the beak (kept level while the head bows). */
function fortuneCard(mark = 'heart') {
  let c = fill('M141 80H167V114H141Z', SHADE, ' transform="translate(1.4 2.4)"');
  c += `<rect x="141" y="80" width="26" height="34" rx="2.6" fill="${CLOTH.panel}"/>`;
  c += `<rect x="144" y="83" width="20" height="28" rx="1.6" fill="none" stroke="${GOLD.line}" stroke-width="1.1"/>`;
  if (mark === 'heart') c += fill(heartPath(154, 94, 4.6), KUMKUM);
  else if (mark === 'star') c += fill(sparkle(154, 94, 6), P.gold);
  c += stroke('M148 103.5H160M150 107.5H158', GOLD.line, 1.1);
  return hook('chr-card', [154, 80, 42], rot(-17, 154, 80, c));
}

/** The fortune parrot. pose: perch | fly | pick */
export function parrot(opts = {}) {
  const pose = POSES.parrot.includes(opts.pose) ? opts.pose : 'perch';
  const mood = opts.mood || (pose === 'fly' ? 'joy' : 'smile');
  const perched = pose !== 'fly';
  const showPerch = perched && opts.perch !== false;
  const tail = hook('chr-tail', [92, 150, 95],
    rot(pose === 'fly' ? 24 : 0, 92, 150,
      fill(PARROT.tailA, LEAF.deeper) + fill(PARROT.tailB, LEAF.base) +
      stroke('M92 150Q72 182 52 211M99 154Q90 184 74 211', GOLD.line, 1.2, ' opacity=".9"')));
  const folded = hook('chr-wing', [104, 96, 95],
    fill(PARROT.wingFolded, LEAF.deep) +
    stroke('M72 138c4 6 10 8 14 6M75 150c4 6 9 8 13 5M80 160c3 4 7 5 10 3', LEAF.tip, 2) +
    stroke('M106 93C90 94 76 108 72 128', GOLD.line, 1.6));
  // Spread wing: drawn once around its shoulder, then scaled up and swung out past the big head.
  const spread = (cls, paint, deg) => hook(cls, [98, 106, 120], rot(deg, 98, 106,
    `<g transform="translate(98 106) rotate(-16) scale(1.32) translate(-108 -102)">` +
    fill(PARROT.wingSpread, paint) +
    stroke('M101 90C93 80 87 68 84 55M106 84C103 74 101 64 100 55M109 80C110 74 111 70 112 67', LEAF.tip, 1.5, ' opacity=".85"') +
    stroke('M108 102C94 92 80 74 74 52', GOLD.line, 1.3) + '</g>'));
  const card = pose === 'pick' ? fortuneCard(opts.card || 'heart') : null;
  const head = hook('chr-head', [114, 98, 150], rot(pose === 'pick' ? 26 : 0, 114, 98, parrotHead({ card, mood })));

  let perch = '';
  if (showPerch) {
    perch = `<g class="chr-perch"><rect x="36" y="171" width="130" height="7" rx="3.5" fill="${SHADE}"/>` +
      `<rect x="34" y="166" width="132" height="9" rx="4.5" fill="${P.band}"/>${fill(dot(34, 170.5, 6) + dot(166, 170.5, 6), P.gold)}</g>`;
  }
  const feetDomes = fill('M90 170c0-6.5 3.6-10 8-10s8 3.5 8 10c-3 1.6-13 1.6-16 0ZM108 170c0-6.5 3.6-10 8-10s8 3.5 8 10c-3 1.6-13 1.6-16 0Z', CORAL.feet);
  const bodyShapes = `<g class="chr-body">${fill(PARROT.body, P.leaf)}${fill(PARROT.belly, LEAF.belly, ' opacity=".9"')}</g>`;

  let inner;
  if (pose === 'fly') {
    inner = rot(-14, 105, 120,
      spread('chr-wing chr-wing-far', LEAF.deeper, 24) + tail + bodyShapes +
      fill(dot(100, 165, 4.4) + dot(112, 164, 4.4), CORAL.feet) +
      spread('chr-wing', LEAF.deep, 0) + head);
    return root('parrot', '0 0 200 220', groundShadow(104, 38, { y: 208 }) + hook('chr-rig', [105, 120, 230], inner), opts, { pose });
  }
  inner = tail + perch + rot(pose === 'pick' ? 7 : 0, 104, 168, bodyShapes + folded + head) + feetDomes;
  return root('parrot', '0 0 200 220', hook('chr-rig', [104, 170, 240], inner), opts, { pose });
}

/* ==========================================================================
   Guests — eight tiny paper-doll avatars for the RSVP plus-one counter
   ========================================================================== */

export const GUESTS = [
  { id: 'meera', label: 'Aunty in a rose silk saree', skin: '#C68B5E', hair: 'bun', outfit: 'saree', main: '#E7A495', top: '#D4A63A', bindi: true, studs: true, jasmine: true },
  { id: 'karthik', label: 'Uncle with gold specs', skin: '#A86E47', hair: 'side', outfit: 'kurta', main: '#93AE7E', glasses: true, moustache: true },
  { id: 'divya', label: 'Cousin with a bob cut', skin: '#D19A6E', hair: 'bob', outfit: 'kurti', main: '#F2B05A', studs: true, bindi: true },
  { id: 'ravi', label: 'Friend with curls and a beard', skin: '#94603E', hair: 'curly', outfit: 'veshti', main: '#E6CB98', beard: true },
  { id: 'pappu', label: 'The little one', skin: '#C9905F', hair: 'pigtails', outfit: 'pavadai', main: '#EFA69B', top: '#F7C873', kid: true, bindi: true },
  { id: 'paati', label: 'Paati, the grandmother', skin: '#B57B52', hair: 'bun', silver: true, outfit: 'saree', main: '#C98E3A', top: '#E9C88A', glasses: true, bindi: true, studs: true },
  { id: 'vikram', label: 'Friend in a gold jacket', skin: '#BF8558', hair: 'wavy', outfit: 'jacket', main: '#D6AE57' },
  { id: 'thatha', label: 'Thatha, the grandfather', skin: '#A26A45', hair: 'bald', silver: true, outfit: 'veshti', main: '#FFF6E6', glasses: true, moustache: true, stick: true, angavastram: true },
];

function guestHair(g, H, part) {
  // part: 'back' (behind the face) | 'front' (over the face)
  switch (g.hair) {
    case 'bun': {
      if (part === 'back') {
        let s = fill(dot(146, 50, 18), H.base) + stroke('M136 39C143 34 152 34 158 39', H.hi, 2.6, ' opacity=".8"');
        if (g.jasmine) s += buds([[128, 46], [131, 37], [138, 31], [147, 29], [156, 31], [163, 37], [166, 46]], 3);
        return s + fill(oval(100, 94, 58, 56), H.base);
      }
      const f = 'M44 106C36 62 62 34 100 34C138 34 164 62 156 106L150.5 101C149 78 130 57 100 55C70 57 51 78 49.5 101Z';
      return fill(f, HAIR_SHADE, ' transform="translate(0 3.4)"') + fill(f, H.base) +
        stroke('M57 75C61 61 72 50 86 45M143 75C139 61 128 50 114 45', H.hi, 3.2, ' opacity=".85"');
    }
    case 'side': {
      if (part === 'back') return fill(GROOM_BACK_HAIR, H.base);
      const f = `<g transform="matrix(-1 0 0 1 200 0)">${fill(GROOM_FRONT_HAIR, HAIR_SHADE, ' transform="translate(0 3.4)"')}${fill(GROOM_FRONT_HAIR, H.base)}${stroke('M84 45C101 36.5 126 39 142 55', H.hi, 3.2, ' opacity=".85"')}</g>`;
      return f;
    }
    case 'bob': {
      if (part === 'back') return fill('M41 126C33 66 60 35 100 35C140 35 167 66 159 126C158 133 150 135 146 131L144 96H56L54 131C50 135 42 133 41 126Z', H.base);
      const f = 'M43 108C37 62 62 33 100 33C138 33 163 62 157 108L151 104C151 90 148 80 143 73C126 76 110 70 100 64C90 70 74 76 57 73C52 80 49 90 49 104Z';
      return fill(f, HAIR_SHADE, ' transform="translate(0 3.4)"') + fill(f, H.base) + stroke('M60 58C70 46 84 40 98 39', H.hi, 3.2, ' opacity=".85"');
    }
    case 'curly': {
      const c = [[52, 78, 15], [60, 56, 16], [78, 41, 16], [100, 35, 17], [122, 41, 16], [140, 56, 16], [148, 78, 15], [45, 98, 11], [155, 98, 11]];
      if (part === 'back') return fill(c.map(([x, y, r]) => dot(x, y, r)).join(''), H.base);
      const f = c.slice(1, 6).map(([x, y, r]) => dot(x, y + 7, r * .82)).join('') + dot(66, 70, 11) + dot(134, 70, 11);
      return fill(f, HAIR_SHADE, ' transform="translate(0 3)"') + fill(f, H.base) +
        stroke('M70 46q6 -5 12 -3M93 39q7 -4 14 -1M118 44q6 -2 11 2M61 63q2 -5 6 -7M133 59q4 2 6 6', H.hi, 2.4, ' opacity=".8"');
    }
    case 'pigtails': {
      if (part === 'back') {
        return fill(oval(38, 112, 13, 18) + oval(162, 112, 13, 18), H.base) +
          fill(oval(100, 94, 58, 56), H.base);
      }
      const f = 'M44 106C36 62 62 34 100 34C138 34 164 62 156 106L150.5 101C149 80 132 62 100 61C68 62 51 80 49.5 101Z';
      return fill(f, HAIR_SHADE, ' transform="translate(0 3.4)"') + fill(f, H.base) +
        stroke('M57 75C61 61 72 50 86 45M143 75C139 61 128 50 114 45', H.hi, 3.2, ' opacity=".85"') +
        fill('M40 88l-9 -7 1 13ZM40 88l9 -7 -1 13ZM160 88l-9 -7 1 13ZM160 88l9 -7 -1 13Z' + dot(40, 88, 3.4) + dot(160, 88, 3.4), MARIGOLD);
    }
    case 'wavy': {
      // Tousled waves: a bumpy crown and three curls falling over the forehead.
      if (part === 'back') return fill('M44 116C36 64 60 28 100 28C140 28 164 64 156 116Z', H.base);
      const f = 'M45 104C38 62 52 36 72 30C80 21 96 18 106 24C116 18 134 21 141 33C156 42 162 66 155 104L150 103' +
        'C151 88 148 76 141 68C137 76 127 78 120 71C117 79 107 81 100 73C95 81 84 81 79 71C71 77 61 78 53 77C50.5 86 49.5 95 50 104Z';
      return fill(f, HAIR_SHADE, ' transform="translate(0 3.4)"') + fill(f, H.base) +
        stroke('M64 46C70 38 79 33 88 32M104 30C112 26 122 26 130 31M136 41C142 46 146 52 148 59', H.hi, 3, ' opacity=".8"');
    }
    case 'bald': {
      if (part === 'back') return fill('M44 118C38 96 42 80 50 72C58 80 58 100 60 118ZM156 118C162 96 158 80 150 72C142 80 142 100 140 118Z', H.base);
      return stroke('M68 58C76 50 86 47 96 47', '#FFFFFF', 3.6, ' opacity=".35"');
    }
    default: return '';
  }
}

/** One guest avatar. variant 0…7 (see GUESTS); pose: stand | wave */
export function guest(opts = {}) {
  const count = GUESTS.length;
  const v = ((Math.floor(Number(opts.variant) || 0) % count) + count) % count;
  const g = GUESTS[v];
  const pose = opts.pose === 'wave' ? 'wave' : 'stand';
  const S = skinSet(g.skin);
  const H = g.silver ? SILVER : HAIR;
  const mood = opts.mood || (g.kid ? 'grin' : pose === 'wave' ? 'grin' : 'smile');
  const female = ['saree', 'kurti', 'pavadai'].includes(g.outfit);
  const longSleeve = ['kurta', 'veshti', 'jacket'].includes(g.outfit);
  const topColor = g.outfit === 'jacket' ? CLOTH.base : g.outfit === 'saree' || g.outfit === 'pavadai' ? g.top : g.main;
  const sleeveColor = g.outfit === 'jacket' || topColor === CLOTH.base ? SLEEVE.base : topColor;
  let b = '';

  // Legs & lower garment
  if (g.outfit === 'saree' || g.outfit === 'pavadai') {
    b += feet(89, 111, 287, S.base);
    b += fill('M72 196H128C136 222 146 252 153 278Q100 291 47 278C54 252 64 222 72 196Z', g.main);
    b += stroke('M100 206L97 284M106 206L108 285M112 205L118 283', tint(g.main, -.12), 1.4, ' opacity=".6"');
    b += fill('M49.6 268Q100 281 150.4 268L153 278Q100 291 47 278Z', P.band);
  } else if (g.outfit === 'veshti') {
    b += feet(90, 110, 287, S.base);
    b += fill('M69 206H131L137 281Q100 290 63 281Z', P.silk);
    b += fill('M64.2 269.4Q100 278.4 135.8 269.4L137 281Q100 290 63 281Z', P.band);
    b += fill('M111 212L116 212L121.6 286.4L116.6 287Z', P.gold);
  } else {
    // kurta / jacket: ivory churidar; kurti: cream leggings
    const leg = g.outfit === 'kurti' ? '#F7E7C8' : CLOTH.base;
    b += feet(87, 113, 287, S.base);
    b += fill('M74 228H98L96.5 284H80ZM102 228H126L120 284H103.5Z', leg);
    b += stroke('M80.6 278.5H96M104 278.5H119.6', tint(leg, -.1), 1.4);
  }

  // Torso
  b += fill('M90 132H110V162Q100 167 90 162Z', S.base);
  b += fill(oval(100, 146, 10, 6), S.lo);
  const shoulders = 'M75 157C80 155 85 154 88.5 154Q100 167 111.5 154C115 154 120 155 125 157C132 160 135 167 134 176';
  if (g.outfit === 'saree') {
    b += fill(`${shoulders}L130 202H70L66 176C65 167 68 160 75 157Z`, g.main);
    b += fill(`${shoulders}L133.4 185H66.6L66 176C65 167 68 160 75 157Z`, g.top);
    b += fill('M66 186L113 155C123 152 132 156 135 166L70 208C65 202 64 193 66 186Z', tint(g.main, .08));
    b += stroke('M67.6 190.4L114 158.6M70.4 203.6L132.6 165.4', GOLD.line, 2.4);
  } else if (g.outfit === 'pavadai') {
    b += fill(`${shoulders}L131 200H69L66 176C65 167 68 160 75 157Z`, g.top);
    b += fill('M68.8 196Q100 203 131.2 196L131.4 201Q100 208.5 68.6 201Z', P.band);
  } else {
    // Shirt to the hip (veshti), kurti to mid-thigh, kurta / jacket-kurta to the knee.
    const hem = g.outfit === 'kurti' ? 238 : g.outfit === 'veshti' ? 214 : 250;
    const flare = hem === 214 ? 2 : 3;
    const body = `M74 157C82 153 118 153 126 157C133 160 136 167 135 177L${135 + flare} ${hem}Q100 ${hem + 7} ${65 - flare} ${hem}L65 177C64 167 67 160 74 157Z`;
    b += fill(body, SHADE, ' transform="translate(1 3)"');
    b += fill(body, g.outfit === 'jacket' || g.main === CLOTH.base ? P.silk : g.main);
    if (g.outfit === 'kurti') b += stroke('M88 155.5Q100 168 112 155.5', GOLD.line, 2.2) + stroke('M63 230Q100 245 137 230', GOLD.line, 1.8, ' opacity=".9"');
    else b += stroke('M100 163V200', tint(g.outfit === 'jacket' ? '#FFF6E6' : g.main, -.14), 1.6) + fill(dot(100, 171, 1.9) + dot(100, 184, 1.9), GOLD.base);
    if (g.outfit === 'jacket') {
      b += fill('M74 157C82 153 88 153 92 154L100 172L108 154C112 153 118 153 126 157C133 160 136 167 135 177L134 224Q118 229 100 222Q82 229 66 224L65 177C64 167 67 160 74 157Z', g.main);
      b += stroke('M92 154L100 172L108 154M100 172V222', GOLD.dark, 1.5, ' opacity=".7"') + fill(dot(100, 184, 2) + dot(100, 197, 2) + dot(100, 210, 2), GOLD.dark);
    }
    if (g.outfit !== 'kurti' && g.outfit !== 'jacket') b += fill('M88.4 152.6Q100 160 111.6 152.6L112.2 157.6Q100 165.6 87.8 157.6Z', tint(g.main, .1));
  }
  if (g.angavastram) {
    b += fill('M112 154.5C121 151 131 154 134.5 160L131.5 233L114 230.5L115.4 170C115.6 163 114.4 158.5 112 154.5Z', P.silk);
    b += stroke('M117.6 158.6L117.4 228.6M130 160.5L127.6 231', GOLD.line, 2.2);
  }

  // Arms
  const right = pose === 'wave' ? { c: [158, 170], e: [166, 137] } : { c: [137, 187], e: [137, 207] };
  const sArm = (cls, s, a) => arm({ cls, s, c: a.c, e: a.e, w: 12.5, skin: S.base, sleeve: sleeveColor, sleeveTo: longSleeve ? 1 : .36, sleeveW: longSleeve ? 14.5 : 14.4,
    sleeveHi: longSleeve ? (g.outfit === 'jacket' || g.outfit === 'veshti' && g.main === CLOTH.base ? SLEEVE.hi : tint(g.main, .28)) : null,
    bands: female ? [.86] : longSleeve ? [.93] : [], hand: 7, extra: a.extra || '' });
  b += sArm('chr-arm-l', [72, 165], { c: [63, 187], e: [63, 207] });
  if (g.stick) b += fill('M140.6 212L145.6 290L141.6 290.4L136.8 212.4Z', '#9C6B3F') + stroke('M138.5 213C138 205 146 203 148 209', '#9C6B3F', 4.2);
  const armR = sArm('chr-arm-r', [128, 165], { ...right, extra: pose === 'wave' ? waveLines(166, 137) : '' });
  if (pose !== 'wave') b += armR;

  // Head
  let h = guestHair(g, H, 'back');
  h += fill(dot(49, 108, 8.5) + dot(151, 108, 8.5), S.lo);
  if (g.hair === 'bald') {
    h += fill('M48 96C48 52 72 38 100 38C128 38 152 52 152 96Z', S.base);     // bare crown
  }
  h += fill(oval(100, 96, 52, 48), S.base);
  if (g.beard) h += fill('M49 104C52 138 76 150 100 150C124 150 148 138 151 104C146 122 132 128 120 126C112 124 106 125 100 127C94 125 88 124 80 126C68 128 54 122 49 104Z', H.base);
  h += guestHair(g, H, 'front');
  h += features({ mood, lashes: female, brows: female || g.kid ? 'soft' : 'bold', browColor: H === SILVER ? '#9C9082' : HAIR.base,
    glasses: g.glasses, bindi: g.bindi, moustache: g.moustache || g.beard ? H.base : null, eyeRy: g.kid ? 7.4 : 7 });
  if (g.studs) h += fill(dot(47.5, 118, 2.6) + dot(152.5, 118, 2.6), P.gold);
  b += hook('chr-head', [100, 148, 140], h);
  if (pose === 'wave') b += armR;

  const body = g.kid ? `<g transform="translate(100 290) scale(.8) translate(-100 -290)">${b}</g>` : b;
  return root('guest', '0 0 200 300', groundShadow(100, g.kid ? 42 : 50) + hook('chr-rig', [100, 290, 330], body), opts, { variant: v, pose });
}

/* ==========================================================================
   Reactions & convenience
   ========================================================================== */

const REACTIONS = { hop: 720, spin: 900, nod: 800, shake: 700, wiggle: 650, cheer: 1100, blush: 1300 };
const timers = new WeakMap();
const reduced = () => typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Play a one-shot reaction on a character: hop | spin | nod | shake | wiggle | cheer | blush.
 * target = the .chr svg or any element containing one. Resolves true when finished
 * (false if nothing played, e.g. reduced motion). Re-triggering restarts it.
 */
export function react(target, kind = 'hop') {
  const svg = target && target.classList && target.classList.contains('chr') ? target : target && target.querySelector && target.querySelector('.chr');
  if (!svg || !REACTIONS[kind] || reduced()) return Promise.resolve(false);
  const cls = `chr--${kind}`;
  const prev = timers.get(svg);
  if (prev) { clearTimeout(prev.t); prev.resolve(false); svg.classList.remove(prev.cls); }
  svg.classList.remove(cls);
  void svg.getBoundingClientRect();         // restart the CSS animation
  svg.classList.add(cls);
  return new Promise((resolve) => {
    const t = setTimeout(() => { svg.classList.remove(cls); timers.delete(svg); resolve(true); }, REACTIONS[kind] + 40);
    timers.set(svg, { t, cls, resolve });
  });
}

/** Render by name: render('parrot', { pose: 'pick' }). Unknown names fall back to the bride. */
export function render(name, opts = {}) {
  const fn = { bride, groom, couple, parrot, guest }[name] || bride;
  return fn(opts);
}

export const characters = { bride, groom, couple, parrot, guest, render, react, POSES, MOODS, GUESTS };
export default characters;
