/** THE COUPLE: two big portrait cards -> two full-screen profile sheets. Prefix us- */
import { html, raw, esc, clamp, prefersReducedMotion, isTouch } from '../lib/dom.js';
import { ph } from '../lib/ph.js';
import { icon } from '../lib/icons.js';
import { characters } from '../lib/characters.js';
import { sound } from '../lib/sound.js';
import { bindCard, plusIcon } from '../core/sheet.js';

export function mount(el, ctx) {
  const c = ctx.content.us;
  el.classList.add('screen--flush');
  const people = [['bride', 0], ['groom', 1]];
  el.innerHTML = String(html`
    <div class="stage us-stage">
      ${people.map(([k, i]) => cardMarkup(c[k], k, i))}
    </div>`);
  people.forEach(([k, i]) => {
    const card = el.querySelector(`.us-card--${k}`), p = c[k];
    if (!isTouch() && !prefersReducedMotion()) {
      let raf = 0;
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => { card.style.setProperty('--px', x.toFixed(3)); card.style.setProperty('--py', y.toFixed(3)); });
      }, { passive: true });
      card.addEventListener('pointerleave', () => { card.style.setProperty('--px', 0); card.style.setProperty('--py', 0); });
    }
    card.classList.add('is-live');
    bindCard(card, () => {
      const node = document.createElement('div');
      node.className = `us-s us-s--${k}`;
      node.innerHTML = String(buildSheet(p, k, c, i));
      return { title: k === 'bride' ? 'The bride' : 'The groom', size: 'wide', theme: 'dark', node, onOpen: (api) => wire(api, node, p, k) };
    });
  });
}

function cardMarkup(p, k, i) {
  return html`
  <article class="card us-card us-card--${k}" aria-label="${p.name}: open profile">
    <div class="us-portrait">${raw(ph({ label: `${p.name}, portrait`, file: p.photo, ratio: null, initial: p.name[0], className: 'us-ph' }))}</div>
    <i class="us-orb" aria-hidden="true"></i>
    <p class="eyebrow us-role"><span>0${i + 1}</span> ${p.role}</p>
    <div class="us-info">
      <h2 class="us-name"><span class="us-mask"><span>${p.name}</span></span></h2>
      <p class="us-nick">&ldquo;${p.nick}&rdquo;</p>
      <div class="us-bio"><p class="us-desc">${p.descriptor}</p>${raw(seal(p, 'us-seal--card'))}</div>
      </div>
    ${raw(plusIcon())}
  </article>`;
}

/* ---- the wax seal: "written by <partner>", stamped on the card and on the profile ---- */
let sealN = 0;
function seal(p, cls) {
  const id = `us-seal-${++sealN}`, lobes = 26;
  const edge = Array.from({ length: 181 }, (_, i) => { const a = (i / 180) * Math.PI * 2, r = 47 + 2.2 * Math.cos(a * lobes); return `${i ? 'L' : 'M'}${(50 + r * Math.cos(a)).toFixed(2)} ${(50 + r * Math.sin(a)).toFixed(2)}`; }).join('') + 'Z';
  const txt = `WRITTEN BY ${p.bioBy.toUpperCase()} ✦`;
  return `<div class="us-seal ${cls}" role="img" aria-label="${p.bioNote}" title="${p.bioNote}">
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <defs><path id="${id}-p" d="M50 50m-29.5 0a29.5 29.5 0 1 1 59 0a29.5 29.5 0 1 1-59 0"/></defs>
      <path d="${edge}" fill="none" stroke="currentColor" stroke-width="1.2"/>
      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width=".6"/>
      <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" stroke-width=".6"/>
      <text font-size="10" fill="currentColor" font-family="var(--f-ui, sans-serif)" font-weight="600"><textPath href="#${id}-p" textLength="174" lengthAdjust="spacing">${txt}</textPath></text>
    </svg>
    <span class="us-seal__ico">${icon('feather', { size: 16, stroke: 1.5 })}</span>
  </div>`;
}

/* ------------------------------------------------------------ sheet markup */
/* Both sheets are one template: hero · then & now · own words · little-known facts (orbit) · friends (reviews) · frames. */
function buildSheet(p, k, c) {
  const L = c.labels, her = k === 'bride', g = her ? 0 : 1;
  const other = c[her ? 'groom' : 'bride'];
  return html`
  <section class="us-hero">
    <div class="us-hero__pic">${raw(ph({ label: `${p.name}, portrait`, file: p.photo, ratio: null, initial: p.name[0] }))}</div>
    <div class="us-hero__txt">
      <p class="eyebrow rv">${p.role} · ${p.full}</p>
      <h2 class="us-hero__name"><span class="us-line"><span>${p.name}</span></span></h2>
      <p class="us-hero__nick rv" style="--d:.2s">&ldquo;${p.nick}&rdquo;</p>
      <div class="us-hero__bio rv" style="--d:.3s"><p class="us-hero__desc">${p.descriptor}</p>${raw(seal(p, 'us-seal--hero'))}</div>
      ${p.tags?.length ? html`<p class="us-hero__tags rv" style="--d:.35s">${p.tags.join(' · ')}</p>` : ''}
      <dl class="us-hero__facts rv" style="--d:.4s">${p.facts.map(([a, b]) => html`<div><dt>${a}</dt><dd>${b}</dd></div>`)}</dl>
    </div>
  </section>

  ${p.bio?.length ? html`<section class="us-sec us-longbio" aria-label="About ${p.name}">
    <p class="eyebrow rv">${p.bioNote}</p>
    <div class="us-longbio__txt">${p.bio.map((t, i) => html`<p class="rv${i === p.bio.length - 1 ? ' us-longbio__end' : ''}" style="--d:${(i * .06).toFixed(2)}s">${t}</p>`)}${p.bioSign ? raw(`<p class="us-longbio__sign rv" aria-hidden="true"><span>-</span><svg viewBox="0 0 52 48" width="38" height="35" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M26 41.5C17 35 6.5 27.5 5.6 17.5 5 10.5 9.8 5.2 16.2 5.6c3.6.2 6.6 2.4 8 5.8" stroke-width="2.6"/><path d="M23.6 11.2c1.9-4.4 6.3-7 11-6.4 5.9.8 9.6 6.3 8.4 12.6-1.5 8-9.6 15.6-18.6 23.6l-.9 1.4" stroke-width="2.3"/><path d="M10.6 14.6c.5-3.4 2.9-5.4 6-5.4" stroke-width="1.5" opacity=".6"/><path d="M29 41.8c-1.2-.6-2.2-1.6-3-2.8" stroke-width="1.6" opacity=".55"/></svg></p>`) : ''}</div>
  </section>` : ''}

  <section class="us-sec us-sig" aria-labelledby="us-s-${k}">
    ${thenNow(p, k)}
  </section>

  <section class="us-sec us-words" aria-labelledby="us-w-${k}">
    <div class="us-head rv"><p class="eyebrow">02 · ${L.tap}</p><h3 id="us-w-${k}" class="us-h2">${raw(p.askedHead ? `${esc(p.askedHead[0])} <em class="gold">${esc(p.askedHead[1])}</em>` : her ? 'In her <em class="gold">own words</em>' : 'In his <em class="gold">own words</em>')}</h3></div>
    <ul class="us-qa">
      ${p.qa.map((q, i) => html`<li class="us-qa__it rv" style="--d:${i * .06}s">
        <button class="us-qa__q" type="button" aria-expanded="false" aria-controls="us-a-${k}-${i}"><span class="us-qa__n">0${i + 1}</span><span class="us-qa__t">${q.q}</span><span class="us-qa__i">${raw(icon('plus', { size: 18, stroke: 2 }))}</span></button>
        <div class="us-qa__a" id="us-a-${k}-${i}" role="region"><div><p class="us-qa__ans">${q.a}</p>${q.other ? html`<p class="us-qa__oth"><b>${L.otherSays(other.name)}</b> ${q.other}</p>` : ''}</div></div>
      </li>`)}
    </ul>
  </section>

  <section class="us-sec us-facts" aria-labelledby="us-f-${k}">
    <div class="us-head rv"><p class="eyebrow">03 · ${L.facts.eyebrow}</p><h3 id="us-f-${k}" class="us-h2">${raw('Little-known <em class="gold">facts</em>')}</h3><p class="us-head__sub">${L.facts.sub[g]}</p></div>
    ${orbit(p, k, L, g)}
  </section>

  <section class="us-sec us-friends" aria-labelledby="us-fr-${k}">
    <div class="us-head rv"><p class="eyebrow">04 · ${p.review?.eyebrow || L.friends.eyebrow}</p><h3 id="us-fr-${k}" class="us-h2">${raw(p.review ? 'The <em class="gold">review</em>' : 'What friends <em class="gold">say</em>')}</h3></div>
    ${reviews(p, L)}
  </section>

  <section class="us-sec us-strip" aria-label="${L.strip}">
    <div class="us-head rv"><p class="eyebrow">05 · ${L.strip}</p><h3 class="us-h2">${raw(p.stripTitle ? `${esc(p.stripTitle[0])} <em class="gold">${esc(p.stripTitle[1])}</em>` : her ? 'Her <em class="gold">pictures</em>' : 'His <em class="gold">pictures</em>')}</h3></div>
    <div class="us-strip__row">
      ${p.strip.map((s, i) => html`<figure class="us-strip__it rv" style="--d:${i * .06}s"><div>${raw(ph({ label: s, file: `assets/photos/us/${p.name.toLowerCase()}-${i + 1}.jpg`, ratio: null }))}</div><figcaption>${s}</figcaption></figure>`)}
    </div>
  </section>

  <section class="us-end">
    <p class="us-end__t rv">${raw(her ? `That was ${esc(p.name)}. <em class="gold">Now meet ${esc(other.name)}.</em>` : `That was ${esc(p.name)}. <em class="gold">Now go find ${esc(other.name)}.</em>`)}</p>
    <button class="btn btn--ghost rv" type="button" data-close>${L.close}</button>
  </section>`;
}

function thenNow(p, k) {
  const t = p.then;
  return html`
    <div class="us-head rv"><p class="eyebrow">01</p><h3 id="us-s-${k}" class="us-h2">${raw('Then <em class="gold">&amp; now</em>')}</h3></div>
    <div class="us-tn rv" style="--x:50%">
      <div class="us-tn__layer us-tn__now">${raw(ph({ label: t.b.label, file: t.b.file, ratio: null, initial: p.name[0], tone: 'gold' }))}</div>
      <div class="us-tn__layer us-tn__then">${raw(ph({ label: t.a.label, file: t.a.file, ratio: null, initial: p.name[0].toLowerCase(), className: 'us-tn__phthen' }))}</div>
      <span class="us-tn__tag us-tn__tag--l">${t.a.year}</span><span class="us-tn__tag us-tn__tag--r">${t.b.year}</span>
      <div class="us-tn__bar" aria-hidden="true"></div>
      <button class="us-tn__knob" type="button" role="slider" aria-label="Compare then and now" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" aria-valuetext="Showing both equally">${raw(icon('chevron-left', { size: 14, stroke: 2.4 }))}${raw(icon('chevron-right', { size: 14, stroke: 2.4 }))}</button>
    </div>`;
}

/* ---- the orbit: the character in the middle, eight moons around them, a card that explains the one you tap ---- */
function mandala() {
  const rays = Array.from({ length: 48 }, (_, i) => {
    const a = (i / 48) * Math.PI * 2, r1 = 30, r2 = i % 2 ? 40 : 47;
    return `M${(Math.cos(a) * r1).toFixed(2)} ${(Math.sin(a) * r1).toFixed(2)}L${(Math.cos(a) * r2).toFixed(2)} ${(Math.sin(a) * r2).toFixed(2)}`;
  }).join('');
  const petals = Array.from({ length: 16 }, (_, i) => `<ellipse cx="0" cy="-33" rx="2.4" ry="4.4" transform="rotate(${i * 22.5})"/>`).join('');
  return `<svg class="us-orbit__art" viewBox="-50 -50 100 100" aria-hidden="true" focusable="false">
    <g fill="none" stroke="currentColor" stroke-width=".35"><circle r="21"/><circle r="27" stroke-dasharray="1 2"/><circle r="31"/><path d="${rays}" stroke-width=".5" stroke-linecap="round"/>${petals}</g></svg>`;
}
function orbit(p, k, L, g) {
  const fig = k === 'bride' ? characters.bride({ pose: 'stand', mood: 'love', className: 'chr--blink chr--bob chr--lift', title: `${p.name}, illustrated` })
    : characters.groom({ pose: 'stand', mood: 'smile', className: 'chr--blink chr--bob chr--lift', title: `${p.name}, illustrated` });
  const n = p.favs.length;
  return html`
  <div class="us-orbitwrap">
    <div class="us-orbit rv" role="group" aria-label="${p.name}’s favourite things. Drag to spin." style="--n:${n}">
      ${raw(mandala())}
      <i class="us-orbit__ring" aria-hidden="true"></i>
      <div class="us-orbit__chr">${raw(fig)}</div>
      ${p.favs.map((f, i) => html`<button class="us-moon" type="button" data-i="${i}" aria-label="${f.label}" aria-pressed="false" title="${f.label}"><span class="us-moon__in">${raw(icon(f.icon, { size: 26, stroke: 1.5 }))}</span><span class="us-moon__seen" aria-hidden="true">${raw(icon('check', { size: 12, stroke: 3 }))}</span></button>`)}
      <i class="us-orbit__spark us-orbit__spark--a" aria-hidden="true"></i><i class="us-orbit__spark us-orbit__spark--b" aria-hidden="true"></i><i class="us-orbit__spark us-orbit__spark--c" aria-hidden="true"></i>
    </div>
    <article class="us-fcard card rv" style="--d:.15s" aria-live="polite">
      <p class="us-fcard__why">${L.facts.why[g]}</p>
      <div class="us-fcard__body">
        <span class="us-fcard__ico"></span>
        <h4 class="us-fcard__t"></h4>
        <p class="us-fcard__txt"></p>
      </div>
      <div class="us-fcard__nav">
        <span class="us-fcard__n"><b>01</b> / ${String(n).padStart(2, '0')}</span>
        <span class="us-fcard__btns">
          <button type="button" class="us-fcard__b" data-step="-1" aria-label="Previous fact">${raw(icon('chevron-left', { size: 16, stroke: 2 }))}</button>
          <button type="button" class="us-fcard__b" data-step="1" aria-label="Next fact">${raw(icon('chevron-right', { size: 16, stroke: 2 }))}</button>
        </span>
      </div>
    </article>
  </div>`;
}

/* ---- friends as a rated business listing ---- */
const STAR = 'M12 2.6l2.9 6 6.5.9-4.7 4.6 1.1 6.5L12 17.5 6.2 20.6l1.1-6.5L2.6 9.5l6.5-.9z';
const starRow = () => `<svg viewBox="0 0 120 24" width="120" height="24" aria-hidden="true" focusable="false">${[0, 1, 2, 3, 4].map((i) => `<path transform="translate(${i * 24} 0)" d="${STAR}"/>`).join('')}</svg>`;
const stars = (v) => html`<span class="us-stars" style="--v:${v}" role="img" aria-label="${v} out of 5 stars"><span class="us-stars__bg">${raw(starRow())}</span><span class="us-stars__fg">${raw(starRow())}</span></span>`;
function reviews(p, L) {
  const R = p.friends, n = R.length, avg = p.overall ?? R.reduce((a, r) => a + r.stars, 0) / n;
  const count = [5, 4, 3, 2, 1].map((s) => R.filter((r) => Math.floor(r.stars) === s).length);
  const top = Math.max(1, ...count);
  return html`
  <div class="us-rate rv">
    <div class="us-rate__score">
      <p class="us-rate__big">${avg.toFixed(1)}</p>
      ${stars(Math.round(avg * 10) / 10)}
      <p class="us-rate__n">${L.friends.reviews(n)}</p>${p.review?.note ? html`<p class="us-rate__n">${p.review.note}</p>` : ''}
      ${p.mentions?.length ? html`<p class="us-rate__n"><b>${L.friends.mention}</b> · ${p.mentions.join(' · ')}</p>` : ''}
    </div>
    <ul class="us-rate__bars" aria-label="Rating breakdown">
      ${[5, 4, 3, 2, 1].map((s, i) => html`<li><span>${s}</span><i style="--w:${(count[i] / top * 100).toFixed(0)}%"></i><b>${count[i]}</b></li>`)}
    </ul>
  </div>
  <ul class="us-revs">
    ${R.map((r, i) => html`<li class="us-rev card rv" style="--d:${(i % 2) * .08}s;--h:${18 + (i * 19) % 62}">
      <header><span class="us-rev__av" aria-hidden="true">${r.name[0]}</span><div><p class="us-rev__nm">${r.name}</p><p class="us-rev__meta">${r.rel}${r.since ? ' · ' + r.since : ''}</p></div></header>
      <p class="us-rev__rate">${stars(r.stars)}<time>${r.when}</time></p>
      <p class="us-rev__txt">${r.text}</p>
    </li>`)}
  </ul>`;
}

/* ------------------------------------------------------------ sheet behaviour */
function wire(api, root, p, k) {
  const sc = api.scroller, reduce = prefersReducedMotion();
  sc.style.scrollBehavior = 'auto';
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { root: sc, threshold: .1, rootMargin: '0px 0px -5% 0px' });
  root.querySelectorAll('.rv').forEach((n) => io.observe(n));
  setTimeout(() => root.querySelector('.us-hero').classList.add('is-in'), 300);

  // hero parallax
  const pic = root.querySelector('.us-hero__pic');
  if (!reduce) sc.addEventListener('scroll', () => { const y = sc.scrollTop; if (y < innerHeight) pic.style.setProperty('--sy', (y * .12).toFixed(1) + 'px'); }, { passive: true });

  // Q&A
  root.querySelectorAll('.us-qa__q').forEach((b) => b.addEventListener('click', () => {
    const open = b.getAttribute('aria-expanded') === 'true';
    b.setAttribute('aria-expanded', !open); b.closest('.us-qa__it').classList.toggle('is-open', !open); sound.play('tick');
  }));
  root.querySelector('[data-close]').addEventListener('click', () => api.close());

  try { thenNowWire(root, p); } catch (e) { console.error('[us] then & now', e); }
  try { orbitWire(root, p, sc); } catch (e) { console.error('[us] orbit', e); }
}

function orbitWire(root, p, sc) {
  const stage = root.querySelector('.us-orbit'), moons = Array.from(stage.querySelectorAll('.us-moon'));
  const card = root.querySelector('.us-fcard'), body = card.querySelector('.us-fcard__body');
  const ico = card.querySelector('.us-fcard__ico'), ti = card.querySelector('.us-fcard__t'), tx = card.querySelector('.us-fcard__txt'), num = card.querySelector('.us-fcard__n b');
  const reduce = prefersReducedMotion(), n = moons.length, STEP = (Math.PI * 2) / n, FRONT = Math.PI / 2, TAU = Math.PI * 2;
  const CX = 50, CY = 55, RX = 41, RY = 31;           // orbit ellipse, in % of the stage
  let th = FRONT - 0.5 * STEP, vel = 0, target = null, sel = -1, drag = null, moved = false, idle = !reduce, raf = 0, last = 0, visible = false;

  const place = () => {
    moons.forEach((m, i) => {
      const a = th + i * STEP, s = Math.sin(a), depth = (s + 1) / 2;
      const sc2 = 0.7 + 0.36 * depth;
      m.style.left = (CX + RX * Math.cos(a)).toFixed(2) + '%';
      m.style.top = (CY + RY * s).toFixed(2) + '%';
      m.style.transform = `translate(-50%,-50%) scale(${sc2.toFixed(3)})`;
      m.style.zIndex = s > 0.05 ? 10 + Math.round(depth * 10) : 1;
      m.style.opacity = (0.84 + 0.16 * depth).toFixed(2);
    });
  };
  const show = (i, first) => {
    if (i === sel) return; sel = ((i % n) + n) % n; const f = p.favs[sel];
    moons.forEach((m, j) => { m.classList.toggle('is-on', j === sel); m.setAttribute('aria-pressed', j === sel); if (j === sel) { m.classList.add('is-seen'); m.title = `${m.getAttribute('aria-label')} (seen)`; } });
    num.textContent = String(sel + 1).padStart(2, '0');
    const paint = () => { ico.innerHTML = icon(f.icon, { size: 28, stroke: 1.4 }); ti.textContent = f.label; tx.textContent = f.fact; body.classList.add('is-in'); };
    if (first || reduce) { paint(); return; }
    body.classList.remove('is-in'); setTimeout(paint, 140); sound.play('tick');
  };
  const spinTo = (i) => {
    let t = FRONT - i * STEP; t += Math.round((th - t) / TAU) * TAU;
    if (reduce) { th = t; place(); return; } target = t; vel = 0; kick();
  };
  const choose = (i) => { idle = false; show(i); spinTo(((i % n) + n) % n); };

  const frame = (now) => {
    raf = 0; if (!stage.isConnected) return;
    const dt = Math.min(48, now - (last || now)); last = now;
    if (drag) { place(); }
    else if (target !== null) { const d = target - th; th += d * (1 - Math.pow(0.0009, dt / 1000)); if (Math.abs(d) < 0.0008) { th = target; target = null; } place(); }
    else if (Math.abs(vel) > 0.00004) { th += vel * dt; vel *= Math.pow(0.04, dt / 1000); place(); }
    else if (idle && visible) { th += 0.00005 * dt * 6; place(); }
    if (visible && (drag || target !== null || Math.abs(vel) > 0.00004 || idle)) raf = requestAnimationFrame(frame); else last = 0;
  };
  function kick() { if (!raf && visible) raf = requestAnimationFrame(frame); }

  new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) kick(); }, { root: sc, threshold: 0.05 }).observe(stage);

  // drag to spin (a tap never captures the pointer, so the moon's own click still fires)
  const rxPx = () => (stage.clientWidth * RX) / 100;
  stage.addEventListener('pointerdown', (e) => { if (e.button > 0) return; drag = { x: e.clientX, id: e.pointerId, t: performance.now(), v: 0 }; moved = false; });
  stage.addEventListener('pointermove', (e) => {
    if (!drag) return; const dx = e.clientX - drag.x;
    if (!moved) { if (Math.abs(dx) < 6) return; moved = true; idle = false; target = null; try { stage.setPointerCapture(drag.id); } catch { /* ignore */ } stage.classList.add('is-drag'); }
    const now = performance.now(), dth = -dx / rxPx(); th += dth; drag.x = e.clientX;
    drag.v = dth / Math.max(1, now - drag.t) * 0.6 + drag.v * 0.4; drag.t = now; place(); kick();
  });
  const end = () => {
    if (!drag) return; vel = moved ? clamp(drag.v, -0.006, 0.006) : 0; drag = null; stage.classList.remove('is-drag'); kick();
  };
  stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
  moons.forEach((m, i) => m.addEventListener('click', () => { if (moved) { moved = false; return; } choose(i); }));
  card.querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => choose(sel + Number(b.dataset.step))));
  stage.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { e.preventDefault(); choose(sel + 1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); choose(sel - 1); } });

  place(); show(0, true);
}

function thenNowWire(root, p) {
  const box = root.querySelector('.us-tn'), knob = root.querySelector('.us-tn__knob');
  let v = 50, drag = false;
  const set = (n) => {
    v = clamp(n, 0, 100); box.style.setProperty('--x', v + '%');
    knob.setAttribute('aria-valuenow', Math.round(v));
    const then = v > 50; knob.setAttribute('aria-valuetext', then ? `Mostly then, ${p.then.a.year}` : `Mostly now, ${p.then.b.year}`);
  };
  const fromEvent = (e) => { const r = box.getBoundingClientRect(); set(((e.clientX - r.left) / r.width) * 100); };
  box.addEventListener('pointerdown', (e) => { drag = true; box.setPointerCapture(e.pointerId); box.classList.add('is-drag'); fromEvent(e); });
  box.addEventListener('pointermove', (e) => { if (drag) fromEvent(e); });
  const end = () => { drag = false; box.classList.remove('is-drag'); };
  box.addEventListener('pointerup', end); box.addEventListener('pointercancel', end);
  knob.addEventListener('keydown', (e) => {
    const m = { ArrowLeft: -4, ArrowDown: -4, ArrowRight: 4, ArrowUp: 4, PageDown: -15, PageUp: 15 }[e.key];
    if (m) { e.preventDefault(); set(v + m); } else if (e.key === 'Home') { e.preventDefault(); set(0); } else if (e.key === 'End') { e.preventDefault(); set(100); }
  });
  set(50);
  // gentle intro sweep
  if (!prefersReducedMotion()) { let t0 = 0; const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { io.disconnect(); const a = performance.now(); (function f(n) { const k = clamp((n - a) / 1400, 0, 1); if (!drag) set(50 + Math.sin(k * Math.PI * 2) * 18 * (1 - k)); if (k < 1 && !drag) requestAnimationFrame(f); })(a); } }, { root: root.closest('.sheet__scroll'), threshold: .5 }); io.observe(box); void t0; }
}
