/** STORY section: one big glass card (condensed) -> full-screen long-read sheet. Prefix st- */
import { html, raw, esc, clamp, prefersReducedMotion, isTouch } from '../lib/dom.js';

// --- timeline layout: every card lives somewhere different; the route docks at an entry edge and leaves by an exit edge.
// x / w are % of the page width (desktop), xm = x on phones; mt = gap above in vh (negative = tucks up beside the previous card).
const LAY = [
  { x: 5,  w: 38, xm: 0,  ra: '4/3',   mt: 0,  rot: -1.2, i: ['top', .55],  o: ['right', .6] },
  { x: 57, w: 37, xm: 20, ra: '1/1',   mt: -9, rot: 1.3,  i: ['left', .35], o: ['bottom', .35] },
  { x: 8,  w: 39, xm: 4,  ra: '16/10', mt: 2,  rot: -.8,  i: ['top', .5],   o: ['right', .6] },
  { x: 55, w: 38, xm: 20, ra: '4/5',   mt: -9, rot: 1.2,  i: ['left', .35], o: ['bottom', .4] },
  { x: 7,  w: 38, xm: 0,  ra: '3/2',   mt: 2,  rot: -1,   i: ['top', .5],   o: ['right', .6] },
  { x: 56, w: 38, xm: 20, ra: '16/10', mt: -9, rot: .9,   i: ['left', .35], o: null },
];
const MOB = { i: [.5, .7, .3, .6, .4, .7, .35, .55], o: [.3, .6, .7, .35, .65, .4, .7, .5], mt: [0, 70, 90, 60, 100, 70, 90, 80] };
// the short hop between two cards, each one its own shape: waypoints in the frame of the journey (a = along it, b = sideways, in page widths) + loops
const SEG = [
  { wp: [[.5, -.03]], loops: [] },
  { wp: [[.35, .07], [.7, -.05]], loops: [] },
  { wp: [[.5, .03]], loops: [] },
  { wp: [[.35, -.07], [.7, .05]], loops: [] },
  { wp: [[.5, -.03]], loops: [] },
  { wp: [[.5, .04]], loops: [] },
];
const lay = (i) => { const c = LAY[i % LAY.length]; return `--x:${c.x}%;--w:${c.w}%;--xm:${c.xm}%;--mt:calc(${c.mt} * var(--vh1));--mtm:${MOB.mt[i % 8]}px;--rot:${c.rot}deg`; };
import { ph } from '../lib/ph.js';
import { icon } from '../lib/icons.js';
import { store } from '../lib/store.js';
import { sound } from '../lib/sound.js';
import { openSheet, bindCard, plusIcon } from '../core/sheet.js';
import { goTo } from '../core/dock.js';

const fmtN = (n, f) => (f ? n.toLocaleString('en-IN') : String(n));
const title2 = (t) => raw(`${esc(t[0])} <em class="gold">${esc(t[1])}</em>${t[2] ? ' ' + esc(t[2]) : ''}`);   // optional 3rd word stays upright

export function mount(el, ctx) {
  const c = ctx.content.story;
  el.classList.add('screen--flush');
  const cd = c.card;
  el.innerHTML = String(html`
    <div class="stage st-stage">
      <article class="card st-card" aria-label="Our story: open the full story">
        <i class="st-orb st-orb--a" aria-hidden="true"></i><i class="st-orb st-orb--b" aria-hidden="true"></i><i class="st-orb st-orb--c" aria-hidden="true"></i>
        <div class="st-main">
          <div class="st-copy">
            <p class="eyebrow st-eyebrow">${cd.eyebrow}</p>
            <h2 class="display st-title"><span class="st-mask"><span>${cd.title[0]}</span></span> <span class="st-mask"><span><em class="gold">${cd.title[1]}</em></span></span></h2>
            <p class="st-text">${cd.text}</p>
            <p class="st-cta">${cd.cta} ${raw(icon('arrow-right', { size: 16, stroke: 2 }))}</p>
          </div>
          <div class="st-photos" aria-hidden="true">
            ${raw(`<figure class="st-photo">${ph({ label: cd.photo.label, file: cd.photo.file, ratio: null })}</figure>`)}
          </div>
        </div>
        ${raw(plusIcon())}
      </article>
    </div>`);
  const card = el.querySelector('.st-card');
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--px', ((e.clientX - r.left) / r.width - .5).toFixed(3));
    card.style.setProperty('--py', ((e.clientY - r.top) / r.height - .5).toFixed(3));
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px'); card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });
  card.classList.add('is-live');
  bindCard(card, () => {
    const node = document.createElement('div');
    node.className = 'st-sheet';
    node.innerHTML = String(buildSheet(c.sheet, cd));
    return { title: 'Our story', size: 'wide', theme: 'dark', node, onOpen: (api) => wire(api, node, c.sheet) };
  });
}

/* ------------------------------------------------------------------ sheet markup */
function buildSheet(s) {
  const o = s.open, t = s.timeline, mem = s.memories, n = s.numbers, cl = s.close;
  return html`
  <section class="st-open">
    <img class="st-open__orb" src="assets/photos/story/open-moon.jpg" alt="" aria-hidden="true" decoding="async">
    <p class="eyebrow rv">${o.kicker}</p>
    <div class="st-open__h">${o.body.map((t, i) => html`<p class="rv" style="--d:${(0.15 + i * 0.15).toFixed(2)}s">${t}</p>`)}</div>
    <p class="st-scrollhint rv" style="--d:.8s">${raw(icon('arrow-down', { size: 16, stroke: 2 }))} Scroll</p>
  </section>

  <section class="st-tl" aria-labelledby="st-tl-h">
    <div class="st-sec-head rv"><p class="eyebrow">${t.eyebrow}</p><h3 id="st-tl-h" class="st-h2">${title2(t.title)}</h3></div>
    <ol class="st-tl__list">
      <li class="st-tl__map" aria-hidden="true">
        <svg class="st-tl__svg"><path class="st-tl__ghost"/><path class="st-tl__route"/></svg>
        <div class="st-tl__deco"></div>
      </li>
      <i class="st-tl__trav" aria-hidden="true"></i>
      ${t.items.map((it, i) => html`
        <li class="st-ms${it.last ? ' st-ms--last' : ''}${it.file ? '' : ' st-ms--nopic'} rv" style="${lay(i)}">
          <span class="st-ms__orb" aria-hidden="true"></span>
          <div class="st-ms__text"><p class="st-ms__date">${it.date}</p><p>${it.text}</p></div>
          ${it.file ? html`<figure class="st-ms__pic">${raw(ph({ label: it.date, file: it.file, ratio: LAY[i % LAY.length].ra }))}</figure>` : ''}
        </li>`)}
    </ol>
  </section>

  <section class="st-mem" aria-labelledby="st-mem-h">
    <div class="st-mem__top rv"><p class="eyebrow">${mem.eyebrow}</p><h3 id="st-mem-h" class="st-h2">${title2(mem.title)}</h3><p class="st-sub">${mem.sub}</p></div>
    <div class="st-rail__wrap rv">
      <div class="st-rail" tabindex="0" role="region" aria-label="Photo memories, scrollable">
        ${mem.items.map((it, i) => html`<figure class="st-mem__it"><div class="st-mem__pic">${raw(ph({ label: it.label, file: it.file, ratio: null, tone: i % 2 ? 'gold' : 'gold' }))}</div></figure>`)}
      </div>
      <div class="st-rail__btns">
        <button class="st-rbtn" type="button" data-dir="-1" aria-label="Previous photos">${raw(icon('arrow-left', { size: 18, stroke: 2 }))}</button>
        <button class="st-rbtn" type="button" data-dir="1" aria-label="Next photos">${raw(icon('arrow-right', { size: 18, stroke: 2 }))}</button>
      </div>
    </div>
  </section>

  <section class="st-num" aria-labelledby="st-num-h">
    <div class="st-sec-head rv"><p class="eyebrow">${n.eyebrow}</p><h3 id="st-num-h" class="st-h2">${title2(n.title)}</h3>${n.sub ? html`<p class="st-sub">${n.sub}</p>` : ''}</div>
    ${n.together ? raw(`<div class="st-tog rv" role="timer" aria-label="Time we have been together"><p class="st-tog__lab">${esc(n.together.label)}</p><div class="st-tog__row">${['years', 'months', 'days', 'hours', 'mins', 'secs'].map((u) => `<div class="st-tog__u"><b class="gold" data-tog="${u}">0</b><i>${u}</i></div>`).join('')}</div></div>`) : ''}
    <ul class="st-num__grid">
      ${n.items.map((it, i) => html`<li class="st-num__it rv" style="--d:${i * 0.07}s">${typeof it.n === 'number' ? html`<b class="gold" data-count="${it.n}" data-fmt="${it.fmt ? 1 : 0}">${fmtN(it.n, it.fmt)}</b>` : html`<b class="gold">${it.n}</b>`}<span>${it.label}</span></li>`)}
    </ul>
  </section>

  <section class="st-end">
    <i class="st-end__orb" aria-hidden="true"></i>
    <h3 class="st-end__h">${cl.line.map((l, i) => html`<span class="rv" style="--d:${i * 0.12}s">${i === 2 ? raw(`<em class="gold">${esc(l)}</em>`) : l}</span>`)}</h3>
    <p class="st-end__sub rv" style="--d:.4s">${cl.sub}${cl.invite ? html` <strong>${cl.invite}</strong>` : ''}</p>
    <button class="btn btn--lg rv" style="--d:.5s" type="button" data-magnetic data-go>${cl.cta} ${raw(icon('arrow-right', { size: 18, stroke: 2 }))}</button>
  </section>`;
}

/* ------------------------------------------------------------------ sheet behaviour */
function wire(api, root, s) {
  const sc = api.scroller, reduce = prefersReducedMotion();
  const cleanups = [];
  // scroll reveals
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { root: sc, threshold: .12, rootMargin: '0px 0px -6% 0px' });
  root.querySelectorAll('.rv').forEach((n) => io.observe(n));
  cleanups.push(() => io.disconnect());
  setTimeout(() => root.querySelector('.st-open').classList.add('is-in'), 350);
  sc.style.scrollBehavior = 'auto'; // snappier for scroll-linked effects; smooth only via buttons

  // --- numbers: tap a figure to reveal its working
  root.querySelectorAll('.st-num__it[data-f]').forEach((li) => {
    const flip = () => { const f = li.querySelector('.st-num__f'), open = f.hidden; f.hidden = !open; li.setAttribute('aria-expanded', String(open)); };
    li.addEventListener('click', flip);
    li.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
  });

  // --- timeline: a travel-map route (loops, arcs, bubbles, map doodles) that the traveller-orb follows as you scroll
  const list = root.querySelector('.st-tl__list');
  const svg = list.querySelector('.st-tl__svg'), ghost = svg.querySelector('.st-tl__ghost'), route = svg.querySelector('.st-tl__route');
  const trav = list.querySelector('.st-tl__trav'), deco = list.querySelector('.st-tl__deco');
  const ms = [...root.querySelectorAll('.st-ms')];
  const ORN = [   // little line-art map doodles, one per gap
    '<circle cx="32" cy="32" r="26"/><circle cx="32" cy="32" r="19" stroke-dasharray="2 4"/><path d="M32 5l4 23 23 4-23 4-4 23-4-23-23-4 23-4z"/><path d="M32 1v5" />',                  // compass
    '<circle cx="22" cy="40" r="15"/><circle cx="46" cy="22" r="9"/><circle cx="47" cy="48" r="5"/><path d="M13 36a10 10 0 0 1 7-7M43 18a5 5 0 0 1 3-2"/>',                                      // bubbles
    '<path d="M5 31L59 8 41 57 31 37z"/><path d="M31 37L59 8"/><path d="M2 50c6-2 10 2 16 0" stroke-dasharray="2 4"/>',                                                                        // paper plane
    '<path d="M3 53L22 21l10 16 9-12 20 28z"/><circle cx="49" cy="12" r="6"/><path d="M17 30l5 4 5-5"/>',                                                                                       // mountains
    '<path d="M32 59C21 44 14 35 14 26a18 18 0 0 1 36 0c0 9-7 18-18 33z"/><circle cx="32" cy="26" r="6.5"/><ellipse cx="32" cy="60" rx="10" ry="2.5" stroke-dasharray="2 3"/>',                // pin
    '<path d="M32 6v40M32 9l18 32H32M32 19L17 41h15"/><path d="M8 49h48l-7 8H15z"/><path d="M2 60c6-3 10 3 16 0s10 3 16 0 10 3 16 0 10 3 12 0" stroke-dasharray="2 4"/>',                       // sailboat
    '<path d="M18 46a10 10 0 0 1 1-20 14 14 0 0 1 27 4 8 8 0 0 1-1 16z"/><path d="M8 54h14M42 54h14" stroke-dasharray="2 4"/>',                                                                // cloud
    '<ellipse cx="32" cy="32" rx="27" ry="21" transform="rotate(-18 32 32)"/><ellipse cx="32" cy="32" rx="18" ry="13" transform="rotate(-18 32 32)"/><ellipse cx="32" cy="32" rx="9" ry="6" transform="rotate(-18 32 32)"/>', // contour rings
  ];
  ORN.push(
    '<path d="M32 4a20 20 0 0 1 12 36H20A20 20 0 0 1 32 4z"/><path d="M32 4v36M20 40l5 11h14l5-11"/><path d="M26 51v6h12v-6z"/><path d="M22 22h20" stroke-dasharray="2 3"/>',                                  // hot-air balloon
    '<rect x="8" y="20" width="48" height="34" rx="6"/><path d="M24 20v-7h16v7M8 34h48M28 34v6h8v-6"/>',                                                                                       // suitcase
    '<rect x="5" y="19" width="54" height="34" rx="7"/><circle cx="32" cy="36" r="11"/><circle cx="32" cy="36" r="5"/><path d="M20 19l4-7h16l4 7"/><circle cx="50" cy="27" r="1.5"/>',            // camera
    '<path d="M3 55L32 13l29 42z"/><path d="M32 13v42M21 55l11-19 11 19"/><path d="M32 13V3h10l-3 4 3 4H32"/>',                                                                                // tent + flag
    '<path d="M10 24h34v14a14 14 0 0 1-14 14h-6a14 14 0 0 1-14-14z"/><path d="M44 28h4a6 6 0 0 1 0 12h-4"/><path d="M19 8c-3 4 3 6 0 10M29 8c-3 4 3 6 0 10M38 8c-3 4 3 6 0 10"/>',               // filter coffee
    '<path d="M32 58C14 43 7 33 7 22a12.5 12.5 0 0 1 25-4 12.5 12.5 0 0 1 25 4c0 11-7 21-25 36z"/><path d="M20 22a6 6 0 0 1 6-6" />',                                                           // heart
    '<circle cx="23" cy="38" r="15"/><circle cx="41" cy="38" r="15"/><path d="M32 8l6 7-6 8-6-8z"/><path d="M26 15h12"/>',                                                                     // rings
    '<path d="M30 6v54M30 12h22l7 6-7 6H30zM30 30H12l-7 6 7 6h18z"/><path d="M22 60h16" />',                                                                                                    // signpost
    '<path d="M22 58l5-38h10l5 38z"/><path d="M25 20h14l-7-11z"/><path d="M26 36h12M24 47h16"/><path d="M8 12l12 5M56 12l-12 5M6 24h12M58 24H46" stroke-dasharray="2 3"/>',                    // lighthouse (the proposal)
    '<ellipse cx="22" cy="46" rx="6" ry="10" transform="rotate(-12 22 46)"/><ellipse cx="42" cy="22" rx="6" ry="10" transform="rotate(12 42 22)"/><path d="M30 8v3M38 50v3M18 28v3" stroke-dasharray="1 4"/>', // footprints
    '<path d="M4 22q7-9 14 0q7-9 14 0M30 38q7-9 14 0q7-9 14 0M20 52q5-6 10 0q5-6 10 0"/>',                                                                                                     // birds
    '<circle cx="32" cy="32" r="10"/><path d="M32 6v8M32 50v8M6 32h8M50 32h8M13 13l6 6M45 45l6 6M51 13l-6 6M19 45l-6 6"/>',                                                                    // sun
    '<path d="M6 20h52v10a4 4 0 0 0 0 8v10H6V38a4 4 0 0 0 0-8z"/><path d="M24 20v28" stroke-dasharray="3 3"/><path d="M32 29h18M32 39h12"/>',                                                    // boarding ticket
    '<path d="M32 60c0-18 2-28 2-36"/><path d="M34 24c-10-10-21-6-27 0M34 24c10-10 21-6 27 0M34 24c-5-13 4-19 12-19M34 24c-6-10-15-12-21-8"/>',                                                // palm tree
    '<path d="M5 14l18 6 18-6 18 6v34l-18-6-18 6-18-6z"/><path d="M23 20v34M41 14v34"/><path d="M28 30l6 6M34 30l-6 6" />',                                                                     // folded map with X
    '<path d="M32 6l5 18 18 5-18 5-5 18-5-18-18-5 18-5z"/>',                                                                                                                                   // sparkle
    '<circle cx="14" cy="46" r="10"/><circle cx="50" cy="46" r="10"/><path d="M14 46l12-20h16l8 20M26 26l-4-8h-8M42 26l4-8h6"/>'                                                              // bicycle
  );
  let keys = [], total = 0, ornEls = [];   // keys: [scrollY-in-list, routeLength] at each card, to map scroll → position on the route
  const rng = (seed) => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  function crSpline(P) {   // centripetal Catmull-Rom through P; returns points + the point index of every control
    const out = [P[0]], idx = [0], dd = (a, b) => Math.sqrt(Math.hypot(a[0] - b[0], a[1] - b[1])) || 1e-3;
    for (let i = 0; i < P.length - 1; i++) {
      const p1 = P[i], p2 = P[i + 1];
      const p0 = i ? P[i - 1] : [2 * p1[0] - p2[0], 2 * p1[1] - p2[1]], p3 = i + 2 < P.length ? P[i + 2] : [2 * p2[0] - p1[0], 2 * p2[1] - p1[1]];
      const t0 = 0, t1 = t0 + dd(p0, p1), t2 = t1 + dd(p1, p2), t3 = t2 + dd(p2, p3);
      const n = Math.max(8, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / 5));
      for (let k = 1; k <= n; k++) {
        const t = t1 + (t2 - t1) * k / n, c = [0, 0];
        for (let j = 0; j < 2; j++) {
          const A1 = (t1 - t) / (t1 - t0) * p0[j] + (t - t0) / (t1 - t0) * p1[j], A2 = (t2 - t) / (t2 - t1) * p1[j] + (t - t1) / (t2 - t1) * p2[j], A3 = (t3 - t) / (t3 - t2) * p2[j] + (t - t2) / (t3 - t2) * p3[j];
          const B1 = (t2 - t) / (t2 - t0) * A1 + (t - t0) / (t2 - t0) * A2, B2 = (t3 - t) / (t3 - t1) * A2 + (t - t1) / (t3 - t1) * A3;
          c[j] = (t2 - t) / (t2 - t1) * B1 + (t - t1) / (t2 - t1) * B2;
        }
        out.push(c);
      }
      idx.push(out.length - 1);
    }
    return { out, idx };
  }
  function buildRoute() {
    const W = list.clientWidth, H = list.clientHeight, narrow = matchMedia('(max-width:860px)').matches;
    if (!ms.length || !W) return;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', W); svg.setAttribute('height', H);
    const dock = (c, [sd, f]) => { const w = c.r - c.l, h = c.b - c.t;
      return sd === 'top' ? { x: c.l + f * w, y: c.t, dx: 0, dy: -1 } : sd === 'bottom' ? { x: c.l + f * w, y: c.b, dx: 0, dy: 1 } : sd === 'left' ? { x: c.l, y: c.t + f * h, dx: -1, dy: 0 } : { x: c.r, y: c.t + f * h, dx: 1, dy: 0 }; };
    const cards = ms.map((m, i) => {
      const L = LAY[i % LAY.length], l = m.offsetLeft, t = m.offsetTop, c = { l, t, r: l + m.offsetWidth, b: t + m.offsetHeight, cx: l + m.offsetWidth / 2, cy: t + m.offsetHeight / 2 };
      c.in = dock(c, narrow ? ['top', MOB.i[i % 8]] : L.i);
      c.out = narrow ? dock(c, i < ms.length - 1 ? ['bottom', MOB.o[i % 8]] : ['bottom', .5]) : (L.o ? dock(c, L.o) : null);
      const o = m.querySelector('.st-ms__orb'); o.style.left = (c.in.x - c.l) + 'px'; o.style.top = (c.in.y - c.t) + 'px';
      return c;
    });
    // control points of the whole journey: tail → [entry, card centre (hidden behind the card), exit] → wandering waypoints → next card …
    const ctrl = [], kind = [];
    const push = (p, k) => { ctrl.push([p[0], p[1]]); kind.push(k); };
    const segAt = [];
    cards.forEach((c, i) => {
      if (i) { push([c.in.x + c.in.dx * 46, c.in.y + c.in.dy * 46]); push([c.in.x, c.in.y], 'entry'); push([c.cx, c.cy], 'card'); }   // the line starts AFTER the first card
      if (!c.out) return;
      push([c.out.x, c.out.y], 'exit'); push([c.out.x + c.out.dx * 46, c.out.y + c.out.dy * 46]);
      const n = cards[i + 1]; if (!n) return;
      const A = ctrl[ctrl.length - 1], B = [n.in.x + n.in.dx * 46, n.in.y + n.in.dy * 46];
      const vx = B[0] - A[0], vy = B[1] - A[1], vl = Math.hypot(vx, vy) || 1, nx = -vy / vl, ny = vx / vl, sp = SEG[i % SEG.length];
      segAt[i] = ctrl.length - 1;
      sp.wp.forEach(([a, b]) => push([clamp(A[0] + vx * a + nx * b * W * (narrow ? 1.15 : 1), 12, W - 12), A[1] + vy * a + ny * b * W * (narrow ? 1.15 : 1)]));
    });
    const sp = crSpline(ctrl);
    // resample at an even 3px so loops can be cut in by arc length
    const cum = [0]; sp.out.forEach((q, i) => { if (i) cum.push(cum[i - 1] + Math.hypot(q[0] - sp.out[i - 1][0], q[1] - sp.out[i - 1][1])); });
    const STEP = 3, N = Math.floor(cum[cum.length - 1] / STEP), uni = [], at = (s) => { let lo = 0, hi = cum.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; cum[m] <= s ? (lo = m) : (hi = m); } const f = (s - cum[lo]) / ((cum[hi] - cum[lo]) || 1); return [sp.out[lo][0] + (sp.out[hi][0] - sp.out[lo][0]) * f, sp.out[lo][1] + (sp.out[hi][1] - sp.out[lo][1]) * f]; };
    for (let n = 0; n <= N; n++) uni.push(at(n * STEP));
    const ctrlS = sp.idx.map((i) => cum[i]);                     // arc length of every control point
    const pts = uni.map((q, n) => {
      const s = n * STEP; let dx = 0, dy = 0, add = [0, 0];
      cards.forEach((c, i) => { const info = segAt[i]; if (info == null) return;
        const s0 = ctrlS[info], s1 = ctrlS[info + SEG[i % SEG.length].wp.length + 1];   // the stretch between exit and next entry
        SEG[i % SEG.length].loops.forEach((lp) => { const R = lp.R * (narrow ? .6 : 1), lw = 2 * Math.PI * R * .62, sc0 = s0 + (s1 - s0) * lp.f - lw / 2;
          if (s <= sc0 || s >= sc0 + lw) return;
          const a = uni[Math.min(n + 2, N)], b = uni[Math.max(n - 2, 0)]; let tx = a[0] - b[0], ty = a[1] - b[1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
          const th = 2 * Math.PI * (s - sc0) / lw;
          add[0] += tx * R * Math.sin(th) - ty * lp.s * R * (1 - Math.cos(th)); add[1] += ty * R * Math.sin(th) + tx * lp.s * R * (1 - Math.cos(th)); });
      });
      return [q[0] + add[0], q[1] + add[1]];
    });
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`; pts.slice(1).forEach((q) => { d += `L${q[0].toFixed(1)} ${q[1].toFixed(1)}`; });
    ghost.setAttribute('d', d); route.setAttribute('d', d);
    total = route.getTotalLength(); route.style.strokeDasharray = total;
    // scroll → route length, keyed at each card centre
    const lead = sc.clientHeight * .3;   // the line finishes a little BEFORE its card reaches the reading line
    keys = [[pts[0][1], 0]];
    const addKey = (y, L) => { const prev = keys[keys.length - 1]; keys.push([Math.max(y, prev[0] + 1), Math.max(L, prev[1])]); };
    kind.forEach((k, i) => { if (k === 'entry') addKey(ctrl[i][1] - lead, Math.round(ctrlS[i] / STEP) * STEP); if (k === 'exit') addKey(ctrl[i][1] - lead * .5, Math.round(ctrlS[i] / STEP) * STEP); });
    // doodles + bubbles scattered at random (but seeded, so it never jumps), kept clear of the cards and the route
    const R1 = rng(2026), near = pts.filter((_, n) => n % 6 === 0);
    const inCard = (x, y, pad) => cards.some((c) => x > c.l - pad && x < c.r + pad && y > c.t - pad && y < c.b + pad);
    const order = ORN.map((_, i) => i).sort(() => R1() - .5), placed = []; let html = '', k = 0;
    const want = narrow ? 18 : 40;
    for (let tries = 0; placed.length < want && tries < want * 40; tries++) {
      const sz = narrow ? 30 + R1() * 18 : 46 + R1() * 46, x = sz / 2 + 4 + R1() * (W - sz - 8), y = R1() * H;
      if (inCard(x, y, sz * .55 + 10) || near.some((q) => Math.hypot(q[0] - x, q[1] - y) < sz * .6 + 12) || placed.some((q) => Math.hypot(q[0] - x, q[1] - y) < (narrow ? 60 : 110))) continue;
      placed.push([x, y]);
      html += `<svg class="st-tl__orn" data-y="${y}" style="left:${x}px;top:${y}px;width:${sz}px;height:${sz}px;--r:${Math.round((R1() - .5) * 30)}deg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="${(1.5 + 24 / sz).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round">${ORN[order[k++ % order.length]]}</svg>`;
    }
    for (let j = 0, nb = 0; nb < (narrow ? 14 : 30) && j < 400; j++) {
      const q = near[Math.floor(R1() * near.length)], off = (R1() < .5 ? -1 : 1) * (22 + R1() * 60), x = q[0] + off, y = q[1] + (R1() - .5) * 50, dm = 6 + R1() * 12;
      if (x < 10 || x > W - 10 || inCard(x, y, 8)) continue; nb++;
      html += `<i class="st-tl__bub" data-y="${y}" style="left:${x}px;top:${y}px;width:${dm}px;height:${dm}px;--f:${(R1() * 4).toFixed(1)}s"></i>`;
    }
    deco.innerHTML = html; ornEls = [...deco.children];
    drawLine();
  }
  function lengthAtY(y) {
    if (y <= keys[0][0]) return 0;
    for (let i = 1; i < keys.length; i++) if (y <= keys[i][0]) { const [y0, l0] = keys[i - 1], [y1, l1] = keys[i]; return l0 + (l1 - l0) * (y - y0) / ((y1 - y0) || 1); }
    return keys[keys.length - 1][1];
  }
  function drawLine() {
    if (!keys.length) return;
    const sr = sc.getBoundingClientRect(), lr = list.getBoundingClientRect();
    const mid = sr.top + sr.height * .55, yIn = mid - lr.top;
    const L = clamp(lengthAtY(yIn), 0, total);
    route.style.strokeDashoffset = total - L;
    const pt = route.getPointAtLength(L);
    trav.style.transform = `translate3d(${pt.x}px,${pt.y}px,0)`;
    ornEls.forEach((o) => o.classList.toggle('is-on', +o.dataset.y < yIn + 60));
    ms.forEach((m) => { const r = m.getBoundingClientRect(); m.classList.toggle('is-lit', r.top + r.height / 2 < mid + 6); });
  }
  const tlRO = new ResizeObserver(buildRoute); tlRO.observe(list);
  cleanups.push(() => tlRO.disconnect());

  // --- count-ups
  const nums = [...root.querySelectorAll('[data-count]')];
  const cio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const end = +e.target.dataset.count, f = e.target.dataset.fmt === '1';
    if (reduce) { e.target.textContent = fmtN(end, f); return; }
    const t0 = performance.now(), D = 1600;
    (function tick(now) {
      const k = clamp((now - t0) / D, 0, 1), v = end % 1 ? Math.round(end * 10 * (1 - Math.pow(1 - k, 4))) / 10 : Math.round(end * (1 - Math.pow(1 - k, 4)));
      e.target.textContent = fmtN(v, f); if (k < 1) requestAnimationFrame(tick);
    })(t0);
  }), { root: sc, threshold: .6 });
  nums.forEach((n) => { n.textContent = '0'; cio.observe(n); });
  cleanups.push(() => cio.disconnect());

  // --- live "together for" clock: counts up from the day we met (calendar years/months/days, then h/m/s)
  if (s.numbers.together) {
    const since = new Date(s.numbers.together.since), cells = {};
    root.querySelectorAll('[data-tog]').forEach((b) => { cells[b.dataset.tog] = b; });
    const pad = (v) => String(v).padStart(2, '0');
    const tickTog = () => {
      const now = new Date();
      let y = now.getFullYear() - since.getFullYear(), mo = now.getMonth() - since.getMonth(), d = now.getDate() - since.getDate();
      let h = now.getHours() - since.getHours(), mi = now.getMinutes() - since.getMinutes(), se = now.getSeconds() - since.getSeconds();
      if (se < 0) { se += 60; mi--; } if (mi < 0) { mi += 60; h--; } if (h < 0) { h += 24; d--; }
      if (d < 0) { d += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); mo--; } if (mo < 0) { mo += 12; y--; }
      const v = { years: y, months: mo, days: d, hours: pad(h), mins: pad(mi), secs: pad(se) };
      for (const k in cells) if (cells[k].textContent !== String(v[k])) cells[k].textContent = v[k];
    };
    tickTog(); const togT = setInterval(tickTog, 1000);
    cleanups.push(() => clearInterval(togT));
  }

  // --- opener parallax
  const open = root.querySelector('.st-open'), oOrb = root.querySelector('.st-open__orb'), oH = root.querySelector('.st-open__h');
  const endOrb = root.querySelector('.st-end__orb');
  function onScroll() {
    if (sc.scrollLeft) sc.scrollLeft = 0;
    drawLine();
    const y = sc.scrollTop;
    if (y < innerHeight * 1.2 && !reduce) { if (innerWidth > 700) { oOrb.style.transform = `translate3d(0,${y * .28}px,0) scale(${1 + y / 2200})`; oH.style.transform = `translate3d(0,${y * -.1}px,0)`; } /* phones: the moon sits above the text, so no parallax that would slide it over the words */ open.style.setProperty('--o', clamp(1 - y / (innerHeight * .9), 0, 1)); }
  }
  sc.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  window.addEventListener('resize', drawLine);
  cleanups.push(() => { sc.removeEventListener('scroll', onScroll); window.removeEventListener('resize', drawLine); });

  // --- rail: drag + buttons
  const rail = root.querySelector('.st-rail');
  let down = false, sx = 0, sl = 0, moved = 0;
  rail.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; moved = 0; sx = e.clientX; sl = rail.scrollLeft; rail.classList.add('is-drag'); });
  const mv = (e) => { if (!down) return; const dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx)); rail.scrollLeft = sl - dx; };
  const up = () => { down = false; rail.classList.remove('is-drag'); };
  window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
  cleanups.push(() => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); });
  root.querySelectorAll('.st-rbtn').forEach((b) => b.addEventListener('click', () => rail.scrollBy({ left: +b.dataset.dir * rail.clientWidth * .7, behavior: 'smooth' })));

  // --- closing button
  root.querySelector('[data-go]').addEventListener('click', () => { api.close(); setTimeout(() => goTo('us'), 520); });
  void endOrb;
  const prevClose = api.close;
  api.close = () => { cleanups.forEach((f) => f()); prevClose(); };
  root.closest('.sheet')?.querySelector('.sheet__close')?.addEventListener('click', () => cleanups.forEach((f) => f()));
  void isTouch; void openSheet;
}
