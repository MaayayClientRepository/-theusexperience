/**
 * THE WEDDING (#wedding): one-screen Apple-style bento. Every tile is a glance and opens into a full sheet.
 * Data: content/site.js (events, venue, contacts) + content/wedding.js (extras keyed by event id, travel, tips).
 * Signature interaction: "Chase the sun", a draggable sun orb that scrubs each day's schedule.
 */
import { html, raw, esc, formatDate, formatTime, prefersReducedMotion, whileVisible, clamp, lerp } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { openSheet, bindCard, plusIcon } from '../core/sheet.js';
import { toast } from '../core/toast.js';
import { sound } from '../lib/sound.js';
import orbs from '../core/orbs.js';

const IST = 'Asia/Kolkata';
const pad2 = (n) => String(n).padStart(2, '0');
/** Hours (float) in IST from an ISO string written with +05:30 (read straight from the text, no timezone maths). */
const hoursOf = (iso) => { const m = /T(\d\d):(\d\d)/.exec(iso || ''); return m ? +m[1] + +m[2] / 60 : 0; };
const clock12 = (h) => { const hh = Math.floor(h) % 24, mm = Math.round((h - Math.floor(h)) * 60) % 60; const ap = hh >= 12 ? 'PM' : 'AM'; return `${hh % 12 || 12}:${pad2(mm)} ${ap}`; };
const tel = (p) => `tel:${String(p).replace(/[^\d+]/g, '')}`;
const wa = (p) => `https://wa.me/${String(p).replace(/\D/g, '')}`;

export function mount(el, ctx) {
  const site = ctx.site || {}, C = ctx.content?.wedding || {};
  const W = site.wedding || {}, V = W.venue || {}, events = site.events || [], days = W.days || [];
  const extras = C.eventExtras || {}, couple = site.couple || {};
  const target = new Date(W.muhurtham || '2026-11-20T08:15:00+05:30');
  const tz = W.timezone || IST;
  const dayOf = (id) => days.find((d) => d.id === id) || {};
  const evTime = (e) => formatTime(e.start, tz);
  const evRange = (e) => `${formatTime(e.start, tz)} – ${formatTime(e.end, tz)}`;
  const cleanups = [];

  /* ---------------- countdown helpers ---------------- */
  const diff = (tgt = target) => {
    let s = Math.max(0, Math.floor((tgt - Date.now()) / 1000));
    const d = Math.floor(s / 86400); s -= d * 86400;
    const h = Math.floor(s / 3600); s -= h * 3600;
    const m = Math.floor(s / 60); s -= m * 60;
    return { d, h, m, s, done: tgt - Date.now() <= 0 };
  };
  const countHTML = (cls = '', tgt = target, label = 'muhurtham', done = 'Just married. Thank you for being here.') => {
    const t = diff(tgt);
    if (t.done) return `<div class="wd-count ${cls}"><span class="wd-count__done">${done}</span></div>`;
    return `<div class="wd-count ${cls}" role="timer" data-t="${+tgt}" aria-label="Countdown to the ${label}">${[['d', 'days'], ['h', 'hrs'], ['m', 'min'], ['s', 'sec']].map(([k, l]) =>
      `<div class="wd-count__u"><b data-u="${k}">${pad2(t[k])}</b><i>${l}</i></div>`).join('')}</div>`;
  };
  const tickCount = (root) => {
    root.querySelectorAll('.wd-count[data-t]').forEach((c) => {
      const t = diff(new Date(+c.dataset.t));
      c.querySelectorAll('[data-u]').forEach((n) => { const v = pad2(t[n.dataset.u]); if (n.textContent !== v) n.textContent = v; });
    });
  };

  /* ---------------- shared bits ---------------- */

  /* =================================================================== */
  /*  THE BENTO                                                          */
  /* =================================================================== */
  const first = events[0] || {}, last = events[events.length - 1] || {};
  const mDay = formatDate(target, { day: 'numeric' }, tz), mMon = formatDate(target, { month: 'short' }, tz).toUpperCase();
  const mWeek = formatDate(target, { weekday: 'long' }, tz);
  const recEv = events.find((e) => e.id === 'reception');
  const recAt = recEv ? new Date(recEv.start) : null;
  const slideOf = (ev, at, name, cls, label, done) => html`
        <div class="wd-hero__slide ${cls}" data-slide>
          <div class="wd-hero__top"><span class="wd-lab">${name}</span><span class="wd-lab">${formatDate(at, { weekday: 'long' }, tz)}</span></div>
          <div class="wd-hero__mid">
            <span class="wd-hero__d gold">${formatDate(at, { day: 'numeric' }, tz)}</span>
            <span class="wd-hero__m"><b>${formatDate(at, { month: 'short' }, tz).toUpperCase()}</b><em>${formatDate(at, { year: 'numeric' }, tz)}</em></span>
          </div>
          <div class="wd-hero__bot">
            <div class="wd-hero__time"><span>${formatTime(at, tz)}</span><i></i><span>${(W.city || '')}</span></div>
            ${raw(countHTML('', at, label, done))}
          </div>
        </div>`;
  const headTitle = C.head?.title || ['The ', 'Wedding'];

  el.innerHTML = String(html`
    <header class="screen__head">
      <div>
        <p class="eyebrow">${C.head?.eyebrow || 'The Wedding'}</p>
        <h2 class="wd-title">${headTitle[0]}<br class="wd-br"> ${headTitle[1]}<em>${headTitle[2]}</em>${headTitle[3]}</h2>
      </div>
      <p class="screen__lead wd-lead">${C.head?.lead || ''}</p>
    </header>
    <div class="stage wd-bento" id="wd-bento">
      <article class="card card--dark wd-card wd-hero" data-k="hero" aria-label="The date and countdown">
        <i class="wd-hero__orb" aria-hidden="true"></i><i class="wd-hero__ring" aria-hidden="true"></i><i class="wd-hero__ring wd-hero__ring--2" aria-hidden="true"></i>
        <div class="wd-hero__slides">
          ${slideOf(null, target, 'The Muhurtham', 'is-on', 'muhurtham', 'Just married. Thank you for being here.')}
          ${recAt ? slideOf(null, recAt, 'The Reception', '', 'reception', 'The party is on. Come celebrate with us.') : ''}
        </div>
        ${recAt ? html`<div class="wd-hero__dots" aria-hidden="true"><i class="is-on"></i><i></i></div>` : ''}
        ${raw(plusIcon())}
      </article>

      <article class="card wd-card wd-events" data-k="events" aria-label="Schedule">
        <span class="wd-lab">The schedule</span>
        <p class="wd-sub">${events.length} events · ${days.length} days</p>
        <ol class="wd-mini">${events.map((e) => html`<li data-day="${e.day}"><time>${evTime(e)}</time><span>${e.name}</span><i>${formatDate(e.start, { day: 'numeric' }, tz)}</i></li>`)}</ol>
        <span class="wd-cta"><i class="orb-dot"></i> Chase the sun</span>
        ${raw(plusIcon())}
      </article>

      <article class="card wd-card wd-loc" data-k="loc" aria-label="Location and directions">
        ${raw(mapMotif())}
        <div class="wd-loc__txt">
          <span class="wd-lab">The venue</span>
          <h3 class="wd-loc__city">${W.city || 'Karur'}</h3>
          <p class="wd-loc__v">${V.name || ''}</p>
        </div>
        <span class="wd-cta"><i class="orb-dot"></i> Travel directions</span>
        ${raw(plusIcon())}
      </article>

    </div>`);

  const q = (k) => el.querySelector(`[data-k="${k}"]`);

  /* live countdown (only while the section is on screen) */
  const heroCount = q('hero');
  let timer = 0;
  const slides = [...heroCount.querySelectorAll('[data-slide]')], dots = [...heroCount.querySelectorAll('.wd-hero__dots i')];
  let turn = 0, turnTimer = 0;
  const showSlide = (n) => { turn = n; slides.forEach((x, i) => x.classList.toggle('is-on', i === n)); dots.forEach((x, i) => x.classList.toggle('is-on', i === n)); };
  const startTurns = () => { if (slides.length > 1 && !turnTimer && !prefersReducedMotion()) turnTimer = setInterval(() => showSlide((turn + 1) % slides.length), 2000); };
  const stopTurns = () => { clearInterval(turnTimer); turnTimer = 0; };
  const startTimer = () => { if (!timer) { tickCount(heroCount); timer = setInterval(() => tickCount(heroCount), 1000); } startTurns(); };
  const stopTimer = () => { clearInterval(timer); timer = 0; stopTurns(); };
  cleanups.push(whileVisible(el, { onEnter: startTimer, onLeave: stopTimer }, { pauseClass: false }), stopTimer);

  /* pointer-follow light on glass (cursor.js sets nothing for us, so do a tiny version) */
  el.querySelectorAll('.wd-card').forEach((c) => {
    c.classList.add('is-live');
    c.addEventListener('pointermove', (e) => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', `${e.clientX - r.left}px`); c.style.setProperty('--my', `${e.clientY - r.top}px`); }, { passive: true });
  });

  /* ---------------- bind cards -> sheets ---------------- */
  bindCard(q('hero'), () => ({ title: 'The date', size: 'default', node: buildHeroSheet(), onOpen: (api) => heroSheetLive(api) , onClose: () => { clearInterval(sheetTimer); } }));
  bindCard(q('events'), () => ({ title: 'Chase the sun', size: 'fill', theme: 'dark', node: buildSunNode(), onOpen: (api) => { sunCleanup = initSun(api); }, onClose: () => { sunCleanup && sunCleanup(); sunCleanup = null; } }));
  bindCard(q('loc'), () => ({ title: 'Getting to Karur', size: 'default', node: buildLocationSheet(), onOpen: (api) => wireLocation(api) }));

  let sheetTimer = 0, sunCleanup = null;

  /* =================================================================== */
  /*  Location motif (static, hairline, abstract)                        */
  /* =================================================================== */
  function mapMotif() {
    const rings = [34, 70, 112, 160, 220].map((r, i) => `<circle cx="300" cy="118" r="${r}" fill="none" stroke="rgba(126,93,31,${.34 - i * .04})" stroke-width="1" ${i % 2 ? 'stroke-dasharray="2 5"' : ''}/>`).join('');
    const gridV = [60, 120, 180, 240, 300, 360].map((x) => `<line x1="${x}" y1="0" x2="${x}" y2="340" stroke="rgba(126,93,31,.09)"/>`).join('');
    const gridH = [60, 120, 180, 240, 300].map((y) => `<line x1="0" y1="${y}" x2="400" y2="${y}" stroke="rgba(126,93,31,.09)"/>`).join('');
    return `<svg class="wd-loc__map" viewBox="0 0 400 340" preserveAspectRatio="xMidYMin slice" aria-hidden="true" focusable="false">
      <defs><radialGradient id="wd-pin" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#FFFDF0"/><stop offset=".3" stop-color="#F6E6B4"/><stop offset=".65" stop-color="#E3C26E"/><stop offset="1" stop-color="#B68A33"/></radialGradient>
      <radialGradient id="wd-halo"><stop offset="0" stop-color="rgba(246,214,120,.75)"/><stop offset="1" stop-color="rgba(246,214,120,0)"/></radialGradient></defs>
      ${gridV}${gridH}${rings}
      <path class="wd-loc__river" d="M-10 250 C 60 210, 120 270, 190 230 S 330 170, 420 215" fill="none" stroke="rgba(126,93,31,.5)" stroke-width="1.2"/>
      <path d="M-10 258 C 60 218, 120 278, 190 238 S 330 178, 420 223" fill="none" stroke="rgba(126,93,31,.22)" stroke-width="1"/>
      <path d="M300 118 L 232 196 L 120 176 L 30 60" fill="none" stroke="rgba(126,93,31,.35)" stroke-width="1" stroke-dasharray="3 5"/>
      <circle cx="232" cy="196" r="3" fill="#CBA24A"/><circle cx="120" cy="176" r="3" fill="#CBA24A"/><circle cx="30" cy="60" r="3" fill="#CBA24A"/>
      <circle cx="300" cy="118" r="62" fill="url(#wd-halo)"/>
      <circle class="wd-loc__pulse" cx="300" cy="118" r="16" fill="none" stroke="#CBA24A" stroke-width="1.2"/>
      <circle cx="300" cy="118" r="11" fill="url(#wd-pin)"/>
    </svg>`;
  }

  /* =================================================================== */
  /*  SHEET 1: the date                                                  */
  /* =================================================================== */
  function buildHeroSheet() {
    const node = document.createElement('div');
    node.className = 'wd-sheet wd-sheet--hero';
    const dayBlocks = days.map((d) => html`
      <section class="wd-day">
        <header><span class="wd-lab">${d.label} · ${d.weekday}</span><h3>${formatDate(d.date + 'T12:00:00+05:30', { day: 'numeric', month: 'long' }, tz)}</h3><p>${d.theme}</p></header>
        <ul class="wd-day__list">${events.filter((e) => e.day === d.id).map((e) => html`
          <li><time>${evTime(e)}</time>
            <div><b>${e.name}${e.subtitle ? html` <em>${e.subtitle}</em>` : ''}</b><span>${evRange(e)} · ${e.place}</span></div>
          </li>`)}
        </ul>
      </section>`);
    node.innerHTML = String(html`
      <div class="wd-sheet__hero">
        <p class="eyebrow">Save the date</p>
        <h2 class="wd-sheet__num"><span class="gold">${mDay}</span> <em>${mMon}</em></h2>
        <p class="wd-sheet__sub">${mWeek}, ${formatTime(target, tz)}. ${(W.dateLabel || '')} in ${(W.city || '')}.</p>
        ${raw(countHTML('wd-count--big'))}
        ${C.dateNote ? html`<p class="wd-datenote">${C.dateNote}</p>` : ''}
      </div>
      <div class="wd-days">${dayBlocks}</div>`);
    return node;
  }
  function heroSheetLive(api) {
    clearInterval(sheetTimer);
    const root = api.body;
    tickCount(root);
    sheetTimer = setInterval(() => tickCount(root), 1000);
  }

  /* =================================================================== */
  /*  SHEET 2: location & travel                                         */
  /* =================================================================== */
  function buildLocationSheet() {
    const T = C.travel || {};
    const node = document.createElement('div');
    node.className = 'wd-sheet wd-sheet--loc';
    const maxKm = Math.max(...(T.from || []).map((f) => f.km), 1);
    node.innerHTML = String(html`
      <div class="wd-loc-head">
        <p class="eyebrow">The venue</p>
        <h2 class="wd-sheet__title">${V.name}<br><em>${V.area}</em></h2>
        <div class="wd-actions wd-actions--lg">
          <a class="btn btn--ghost" href="${V.mapsUrl}" target="_blank" rel="noopener">${raw(icon('navigation', { size: 17 }))} Open in Maps</a>
        </div>
        <p class="wd-approx">${raw(icon('info', { size: 14 }))} ${T.approxNote || 'Approximate figures.'}</p>
      </div>

      <section class="wd-trav">
        <header><span class="wd-lab">By road</span><h3>From the big cities</h3></header>
        <div class="wd-from">${(T.from || []).map((f, i) => html`
          <article class="wd-fromcard rvw" style="--i:${i};--k:${(f.km / maxKm).toFixed(3)}">
            <div class="wd-fromcard__n"><b>${f.km}</b><span>km<i>approx.</i></span></div>
            <h4>${f.city}</h4>
            <div class="wd-bar"><i></i></div>
            <p class="wd-fromcard__t">${raw(icon('clock', { size: 14 }))} ${f.road}</p>
            <p>${f.roadTip}</p>
            <p class="wd-fromcard__tip">${f.tip}</p>
          </article>`)}</div>
      </section>

      <section class="wd-trav wd-trav--two">
        <div>
          <header><span class="wd-lab">By train</span><h3>Karur Junction</h3></header>
          <p class="wd-big">${raw(icon('train-front', { size: 22 }))} ${T.nearestStation?.name || ''}</p>
          <p class="wd-body">${T.nearestStation?.note || ''}</p>
          <ul class="wd-list">${(T.from || []).map((f) => html`<li><b>${f.city}</b><span>${f.train}</span></li>`)}</ul>
        </div>
        <div>
          <header><span class="wd-lab">By bus</span><h3>Karur bus stand</h3></header>
          <p class="wd-big">${raw(icon('bus', { size: 22 }))} ${T.busStand?.name || ''}</p>
          <p class="wd-body">${T.busStand?.note || ''}</p>
          <ul class="wd-list">${(T.from || []).map((f) => html`<li><b>${f.city}</b><span>${f.bus}</span></li>`)}</ul>
        </div>
      </section>
`);
    return node;
  }
  function wireLocation(api) {
    const cards = api.body.querySelectorAll('.rvw');
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { root: api.scroller, threshold: .15 });
    cards.forEach((c) => io.observe(c));
  }

  /* =================================================================== */
  /*  SHEET 4: dress code                                                */
  /* =================================================================== */
  function buildDressSheet() {
    const D = C.dress || {};
    const node = document.createElement('div');
    node.className = 'wd-sheet wd-sheet--dress';
    node.innerHTML = String(html`
      <p class="eyebrow">Dress code</p>
      <h2 class="wd-sheet__title">${D.title || 'What to wear'}</h2>
      <p class="wd-sheet__lead">${D.lead || ''}</p>
      <div class="wd-dresslist">${events.map((e, i) => { const x = extras[e.id] || {}, s = x.swatch || ['#F6E6B4', '#CBA24A']; return html`
        <article style="--a:${s[0]};--b:${s[1]}">
          <i class="wd-dresslist__orb" aria-hidden="true"></i>
          <div><span class="wd-lab">${dayOf(e.day).label} · ${evTime(e)}</span><h3>${e.name}</h3>
            <p class="wd-dresslist__dress">${e.dress}</p><p>${x.palette || ''}</p></div>
        </article>`; })}</div>
      <div class="wd-guide">
        <div><span class="wd-lab">For her</span><ul>${(D.women || []).map((t) => html`<li>${t}</li>`)}</ul></div>
        <div><span class="wd-lab">For him</span><ul>${(D.men || []).map((t) => html`<li>${t}</li>`)}</ul></div>
      </div>
      ${D.avoid ? html`<p class="wd-fine">${D.avoid}</p>` : ''}`);
    return node;
  }

  /* =================================================================== */
  /*  SHEET 5: before you go                                             */
  /* =================================================================== */
  function buildTipsSheet() {
    const B = C.beforeYouGo || {};
    const node = document.createElement('div');
    node.className = 'wd-sheet wd-sheet--tips';
    node.innerHTML = String(html`
      <p class="eyebrow">Before you go</p>
      <h2 class="wd-sheet__title">A few small things, <em>kindly</em>.</h2>
      <div class="wd-weather"><b>${B.temp}</b><div><span class="wd-lab">Karur in November</span><p>${B.weatherNote}</p></div></div>
      <div class="wd-carry"><span class="wd-lab">Carry</span><div>${(B.carry || []).map((c) => html`<span class="chip">${c}</span>`)}</div></div>
      <ul class="wd-tips">${(B.tips || []).map((t) => html`<li><span class="wd-ico">${raw(icon(t.icon, { size: 20 }))}</span><div><h4>${t.title}</h4><p>${t.text}</p></div></li>`)}</ul>
      <p class="wd-joke">${B.joke}</p>`);
    return node;
  }

  /* =================================================================== */
  /*  SHEET 6: contacts                                                  */
  /* =================================================================== */
  function buildContactsSheet() {
    const K = site.contact || {}, T = C.contacts || {};
    const node = document.createElement('div');
    node.className = 'wd-sheet wd-sheet--contacts';
    const person = (name, role, phone, waNum) => html`
      <article class="wd-contact">
        <i class="wd-contact__av" aria-hidden="true">${(name || '?')[0]}</i>
        <div><h3>${name}</h3><p>${role}</p><p class="wd-contact__ph">${phone}</p></div>
        <div class="wd-actions"><a class="btn btn--sm" href="${tel(phone)}">${raw(icon('phone', { size: 15 }))} Call</a>
          <a class="btn btn--sm btn--ghost" href="${wa(waNum || phone)}" target="_blank" rel="noopener">${raw(icon('message-circle', { size: 15 }))} WhatsApp</a></div>
      </article>`;
    node.innerHTML = String(html`
      <p class="eyebrow">${T.title || 'Contacts'}</p>
      <h2 class="wd-sheet__title">Your <em>people</em> on the ground.</h2>
      <p class="wd-sheet__lead">${T.lead || ''}</p>
      <div class="wd-contacts-list">
        ${(K.coordinators || []).map((p) => person(p.name, p.role, p.phone))}
        ${K.phone ? person(T.general || 'General questions', K.email || '', K.phone, K.whatsapp) : ''}
      </div>`);
    return node;
  }

  /* =================================================================== */
  /*  SHEET 3: CHASE THE SUN                                             */
  /* =================================================================== */
  const SKY = [  // [hour, top, mid, bottom, orbCore, orbRim, glow, stars, label]
    [5.5, '#0f1230', '#4a3566', '#d9807a', '#FFD9B0', '#F0987A', '#FF9F7A', .35],
    [6.8, '#3d4c7e', '#e29a7c', '#f9d29a', '#FFF1CC', '#F5C46A', '#FFC86B', 0],
    [9.0, '#4f7099', '#c9b898', '#f6e2b0', '#FFF8DC', '#F6D580', '#FFE6A0', 0],
    [12.5, '#5c88b3', '#a9c6da', '#f3e8c8', '#FFFFFF', '#FFF1B8', '#FFF4C8', 0],
    [15.5, '#5d7595', '#dcb986', '#f5cf8a', '#FFF0C4', '#F2BE5E', '#FFD07A', 0],
    [18.0, '#3a2f5e', '#cf6a73', '#f6a15f', '#FFD2A0', '#F0793F', '#FF9A55', 0],
    [19.3, '#1a1840', '#4a2f6b', '#a85a72', '#F4E6E0', '#C9B6D8', '#B9A8E8', .5],
    [21.0, '#090b1f', '#121638', '#2a2147', '#F2F4FF', '#C7D3F5', '#9FB4F0', 1],
    [23.5, '#06070f', '#0d1030', '#1d1838', '#EEF1FF', '#B9C6EE', '#8FA6E8', 1],
  ];
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mixRGB = (a, b, k) => a.map((v, i) => Math.round(lerp(v, b[i], k)));
  const rgbs = (c) => `rgb(${c[0]} ${c[1]} ${c[2]})`;
  const SKYRGB = SKY.map((r) => r.map((v, i) => (i >= 1 && i <= 6 ? hex(v) : v)));
  function skyAt(t) {
    const x = clamp(t, SKYRGB[0][0], SKYRGB[SKYRGB.length - 1][0]);
    let i = 0; while (i < SKYRGB.length - 2 && x > SKYRGB[i + 1][0]) i++;
    const a = SKYRGB[i], b = SKYRGB[i + 1], k0 = (x - a[0]) / (b[0] - a[0]), k = k0 * k0 * (3 - 2 * k0);
    const o = { stars: lerp(a[7], b[7], k) };
    ['top', 'mid', 'bot', 'core', 'rim', 'glow'].forEach((n, j) => { o[n] = mixRGB(a[j + 1], b[j + 1], k); });
    return o;
  }
  const phaseOf = (t) => (t < 6.2 ? 'First light' : t < 7.6 ? 'Sunrise' : t < 11 ? 'Morning' : t < 14 ? 'High noon' : t < 16.6 ? 'Afternoon' : t < 17.9 ? 'Golden hour' : t < 18.8 ? 'Sunset' : t < 19.8 ? 'Dusk' : 'Night');
  const KIND_ICON = { haldi: 'flower-2', ring: 'gem', music: 'music', mandapam: 'landmark', feast: 'utensils', party: 'sparkles' };

  function buildSunNode() {
    const S = C.sun || {};
    const node = document.createElement('div');
    node.className = 'wd-sun';
    node.innerHTML = String(html`
      <div class="wd-sun__sky" aria-hidden="true"></div>
      <div class="wd-sun__stars" aria-hidden="true">${raw(Array.from({ length: 64 }, (_, i) => { const r = (n) => Math.abs(Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1; return `<i style="left:${(r(1) * 100).toFixed(1)}%;top:${(r(2) * 70).toFixed(1)}%;--s:${(1 + r(3) * 1.8).toFixed(1)}px;--d:${(r(4) * 4).toFixed(1)}s"></i>`; }).join(''))}</div>
      <div class="wd-sun__haze" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="wd-sun__head">
        <div class="wd-sun__tabs" role="group" aria-label="Choose a day">${days.map((d, i) => html`<button class="chip" type="button" data-day="${d.id}" aria-pressed="${i === 0}">${d.label}<span class="wd-sun__tabdate">${formatDate(d.date + 'T12:00:00+05:30', { day: 'numeric', month: 'short' }, tz)}</span></button>`)}</div>
        <div class="wd-sun__clock" aria-hidden="true"><b data-clock>8:15</b><small data-ampm>AM</small><em data-phase>Sunrise</em></div>
        <p class="wd-sun__hint">${S.hint || ''}</p>
      </div>
      <div class="wd-sun__arena" data-arena>
        <svg class="wd-sun__svg" aria-hidden="true" focusable="false"></svg>
        <div class="wd-sun__orb" data-orb aria-hidden="true"><i class="wd-sun__glow"></i><i class="wd-sun__core"></i></div>
        <div class="wd-sun__markers" data-markers></div>
        <svg class="wd-sun__ridge" viewBox="0 0 1200 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <path d="M0 100 L0 58 C 120 30, 220 70, 360 48 S 600 10, 760 46 S 1020 70, 1200 36 L1200 100Z" fill="rgba(11,9,7,.9)"/>
          <path d="M0 58 C 120 30, 220 70, 360 48 S 600 10, 760 46 S 1020 70, 1200 36" fill="none" stroke="rgba(227,194,110,.5)" stroke-width="1"/>
        </svg>
        <div class="wd-sun__ticks" data-ticks aria-hidden="true"></div>
      </div>
      <div class="wd-sun__foot">
        <div class="wd-sun__slide"><label class="sr-only" for="wd-sun-range">Time of day</label>
          <span>${clock12((C.sun?.domain || [5.5, 23.5])[0])}</span><input id="wd-sun-range" type="range" data-range><span>${clock12((C.sun?.domain || [5.5, 23.5])[1])}</span></div>
        <div class="wd-sun__ev" data-ev aria-live="polite"></div>
      </div>`);
    return node;
  }

  function initSun(api) {
    const root = api.body.querySelector('.wd-sun');
    if (!root) return null;
    const [FLO, FHI] = C.sun?.domain || [5.5, 23.5];
    let LO = FLO, HI = FHI;
    const arena = root.querySelector('[data-arena]'), svg = root.querySelector('.wd-sun__svg'), orb = root.querySelector('[data-orb]');
    const markersEl = root.querySelector('[data-markers]'), ticksEl = root.querySelector('[data-ticks]'), evBox = root.querySelector('[data-ev]');
    const range = root.querySelector('[data-range]'), clockEl = root.querySelector('[data-clock]'), apEl = root.querySelector('[data-ampm]'), phaseEl = root.querySelector('[data-phase]');
    const reduce = prefersReducedMotion();
    const NS = 'http://www.w3.org/2000/svg';
    range.min = LO; range.max = HI; range.step = .05;

    let day = days[0]?.id, t = LO, geo = { W: 0, H: 0 }, raf = 0, dragging = false, shownId = '', trailLen = 0;
    const dayEvents = () => events.filter((e) => e.day === day);
    const xOf = (h) => geo.px + ((h - LO) / (HI - LO)) * (geo.W - geo.px * 2);
    const hOf = (h) => { const u = (h - LO) / (HI - LO); return .18 + .82 * Math.pow(Math.sin(Math.PI * u), 1.15); };
    const yOf = (h) => geo.y0 - hOf(h) * (geo.y0 - geo.y1);

    /* trail + arc paths */
    const arc = document.createElementNS(NS, 'path'), trail = document.createElementNS(NS, 'path');
    arc.setAttribute('class', 'wd-sun__arc'); trail.setAttribute('class', 'wd-sun__trail');
    svg.append(arc, trail);

    /* phones: zoom the day to where its events are, so the markers have room instead of sharing a squeezed 18-hour arc */
    const slideEnds = root.querySelectorAll('.wd-sun__slide > span');
    function setDomain() {
      const hs = dayEvents().map((e) => hoursOf(e.start));
      if (arena.getBoundingClientRect().width < 620 && hs.length) {
        LO = Math.max(FLO, Math.floor(Math.min(...hs) - 1.5)); HI = Math.min(FHI, Math.ceil(Math.max(...hs) + 1.5));
        if (HI - LO < 6) { LO = Math.max(FLO, LO - 1); HI = Math.min(FHI, HI + 1); }
      } else { LO = FLO; HI = FHI; }
      range.min = LO; range.max = HI;
      if (slideEnds.length > 1) { slideEnds[0].textContent = clock12(LO); slideEnds[slideEnds.length - 1].textContent = clock12(HI); }
    }

    function layout() {
      setDomain();
      const r = arena.getBoundingClientRect();
      geo = { W: r.width, H: r.height, px: Math.max(40, r.width * .06), y0: r.height * .84, y1: r.height * .1 };
      svg.setAttribute('viewBox', `0 0 ${geo.W} ${geo.H}`);
      let d = '';
      for (let i = 0; i <= 90; i++) { const h = lerp(LO, HI, i / 90); d += `${i ? 'L' : 'M'}${xOf(h).toFixed(1)} ${yOf(h).toFixed(1)}`; }
      arc.setAttribute('d', d); trail.setAttribute('d', d);
      trailLen = trail.getTotalLength();
      trail.style.strokeDasharray = `${trailLen}`;
      // hour ticks
      const tk = HI - LO > 12 ? 3 : 2, tkHours = []; for (let h = Math.ceil(LO / tk) * tk; h <= HI; h += tk) tkHours.push(h);
      ticksEl.innerHTML = tkHours.map((h) => `<span style="left:${xOf(h).toFixed(1)}px">${h % 12 || 12}<small>${h >= 12 ? 'PM' : 'AM'}</small></span>`).join('');
      placeMarkers();
      render(t, true);
    }

    function placeMarkers() {
      markersEl.innerHTML = '';
      dayEvents().forEach((e) => {
        const h = hoursOf(e.start);
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'wd-mk'; b.dataset.id = e.id;
        b.style.transform = `translate(${xOf(h).toFixed(1)}px, ${yOf(h).toFixed(1)}px)`;
        b.setAttribute('aria-label', `${e.name}, ${evTime(e)}`);
        b.innerHTML = `<span class="wd-mk__dot">${icon(KIND_ICON[e.kind] || 'sparkles', { size: 15, stroke: 1.8 })}</span><span class="wd-mk__lab"><i>${evTime(e)}</i><b>${esc(e.name)}</b></span>`;
        b.addEventListener('click', (ev) => { if (ev.detail === 0) tweenTo(h); });   // keyboard activation
        b.dataset.h = h;   // a press on a marker can start a drag; a tap (no movement) glides to it — see the arena handlers
        markersEl.appendChild(b);
      });
    }

    function nearest(h) {
      let best = null, bd = 99;
      dayEvents().forEach((e) => { const d = Math.abs(hoursOf(e.start) - h); if (d < bd) { bd = d; best = e; } });
      return { ev: best, dist: bd };
    }

    function showEvent(e, h) {
      if (!e) return;
      const eh = hoursOf(e.start), delta = (h - eh) * 60;
      const rel = Math.abs(delta) < 8 ? 'Right on time' : delta < 0 ? `${fmtMin(-delta)} until it starts` : `Started ${fmtMin(delta)} ago`;
      const idx = dayEvents().findIndex((x) => x.id === e.id), n = dayEvents().length;
      const x = extras[e.id] || {}, s = x.swatch || ['#F6E6B4', '#CBA24A'];
      evBox.classList.remove('is-swap'); void evBox.offsetWidth; evBox.classList.add('is-swap');
      evBox.innerHTML = String(html`
        <div class="wd-ev__time"><b>${formatTime(e.start, tz).replace(/\s?[AP]M$/, '')}</b><small>${formatTime(e.start, tz).slice(-2)}</small><em data-rel>${rel}</em></div>
        <div class="wd-ev__main">
          <span class="wd-lab">${dayOf(e.day).label} · ${evRange(e)} · ${idx + 1}/${n}</span>
          <h3>${e.name}${e.subtitle ? html` <em>${e.subtitle}</em>` : ''}</h3>
          <p class="wd-ev__meta"><span>${raw(icon('map-pin', { size: 14 }))} ${e.place}, ${W.city || 'Karur'}</span></p>
          <p class="wd-ev__blurb">${e.blurb}</p>
        </div>
        <div class="wd-ev__act">
          <span class="wd-ev__nav"><button type="button" class="wd-ev__arrow" data-step="-1" aria-label="Previous event" ${idx === 0 ? 'disabled' : ''}>${raw(icon('chevron-left', { size: 18, stroke: 2 }))}</button>
          <button type="button" class="wd-ev__arrow" data-step="1" aria-label="Next event" ${idx === n - 1 ? 'disabled' : ''}>${raw(icon('chevron-right', { size: 18, stroke: 2 }))}</button></span>
        </div>`);
      evBox.querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => {
        const list = dayEvents(), i = list.findIndex((x) => x.id === shownId) + (+b.dataset.step);
        if (list[i]) tweenTo(hoursOf(list[i].start));
      }));
    }
    const fmtMin = (m) => { m = Math.round(m); return m >= 60 ? `${Math.floor(m / 60)} hr${m % 60 ? ` ${m % 60} min` : ''}` : `${m} min`; };

    function render(h, force) {
      t = clamp(h, LO, HI);
      const sky = skyAt(t);
      const set = (k, v) => root.style.setProperty(k, v);
      set('--sky-top', rgbs(sky.top)); set('--sky-mid', rgbs(sky.mid)); set('--sky-bot', rgbs(sky.bot));
      set('--o-core', rgbs(sky.core)); set('--o-rim', rgbs(sky.rim)); set('--o-glow', rgbs(sky.glow)); set('--stars', sky.stars.toFixed(2));
      api.panel.style.setProperty('--bg', rgbs(sky.top));
      const x = xOf(t), y = yOf(t), low = 1 - hOf(t);
      orb.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${(1 + low * .22).toFixed(3)})`;
      trail.style.strokeDashoffset = `${trailLen * (1 - (t - LO) / (HI - LO))}`;
      const hh = Math.floor(t), mm = Math.floor((t - hh) * 60 / 5) * 5, ap = hh % 24 >= 12 ? 'PM' : 'AM';
      clockEl.textContent = `${hh % 12 || 12}:${pad2(mm)}`; apEl.textContent = ap; phaseEl.textContent = phaseOf(t);
      range.value = t; range.setAttribute('aria-valuetext', `${clockEl.textContent} ${ap}, ${phaseOf(t)}`);
      const { ev } = nearest(t);
      if (ev && (ev.id !== shownId || force)) {
        const changed = ev.id !== shownId; shownId = ev.id; showEvent(ev, t);
        markersEl.querySelectorAll('.wd-mk').forEach((m) => m.classList.toggle('is-on', m.dataset.id === ev.id));
        if (changed && !force && dragging) { try { sound.play('tick'); } catch { /* ok */ } }
      } else if (ev) {
        const rel = evBox.querySelector('[data-rel]');
        if (rel) { const dm = (t - hoursOf(ev.start)) * 60; rel.textContent = Math.abs(dm) < 8 ? 'Right on time' : dm < 0 ? `${fmtMin(-dm)} until it starts` : `Started ${fmtMin(dm)} ago`; }
      }
    }

    function tweenTo(target2, ms = 900) {
      cancelAnimationFrame(raf);
      target2 = clamp(target2, LO, HI);
      if (reduce) { render(target2); return; }
      const from = t, t0 = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - t0) / ms), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        render(lerp(from, target2, e));
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }

    /* drag the sun (pointer events: mouse + touch + pen) */
    const toHour = (clientX) => { const r = arena.getBoundingClientRect(); return LO + clamp((clientX - r.left - geo.px) / (r.width - geo.px * 2), 0, 1) * (HI - LO); };
    let down = null;
    arena.addEventListener('pointerdown', (e) => {
      if (e.button != null && e.button > 0) return;
      const mk = e.target.closest?.('.wd-mk');
      down = { x: e.clientX, y: e.clientY, mk, moved: !mk };
      dragging = true; cancelAnimationFrame(raf); orb.classList.add('is-drag');
      try { arena.setPointerCapture(e.pointerId); } catch { /* ok */ }
      if (!mk) render(toHour(e.clientX));
    });
    arena.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      if (down && !down.moved && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) down.moved = true;
      if (!down || down.moved) render(toHour(e.clientX));
    });
    const end = (e) => {
      const d = down; down = null; dragging = false; orb.classList.remove('is-drag');
      if (d && d.mk && !d.moved && e.type === 'pointerup') { tweenTo(+d.mk.dataset.h); try { sound.play('tick'); } catch { /* ok */ } }
    };
    arena.addEventListener('pointerup', end); arena.addEventListener('pointercancel', end);
    range.addEventListener('input', () => { cancelAnimationFrame(raf); dragging = true; render(+range.value); dragging = false; });

    /* day tabs */
    root.querySelectorAll('[data-day]').forEach((b) => b.addEventListener('click', () => {
      if (b.dataset.day === day) return;
      day = b.dataset.day; shownId = '';
      root.querySelectorAll('[data-day]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      layout();
      const f = dayEvents()[0];
      if (f) tweenTo(hoursOf(f.start), 1100);
      try { sound.play('whoosh'); } catch { /* ok */ }
    }));

    /* keyboard: arrows nudge the sun when focus is on the arena */
    arena.tabIndex = -1;

    const ro = new ResizeObserver(() => layout());
    ro.observe(arena);
    layout();
    // cinematic opening: start at first light, glide to the first event
    const f0 = dayEvents()[0];
    if (f0) { render(LO, true); setTimeout(() => tweenTo(hoursOf(f0.start), 1700), 650); }
    try { sound.play('whoosh'); } catch { /* ok */ }

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }

  return () => cleanups.forEach((c) => { try { typeof c === 'function' && c(); } catch { /* ok */ } });
}
