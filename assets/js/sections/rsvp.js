/**
 * RSVP (#rsvp): one screen, one question at a time, sealed with gold wax.
 * Left half: oversized type + a luminous orb that brightens as the guest progresses.
 * Right half: a tall glass "stationery" card holding the flow (name, number, coming?, guests, note, review, seal).
 * All copy lives in content/rsvp.js. Drafts persist in lib/store.js ('rsvp:draft'); a finished reply is remembered ('rsvp:done').
 */
import { $, $$, esc, richText, on, emit, wait, prefersReducedMotion, whileVisible } from '../lib/dom.js';
import { store } from '../lib/store.js';
import { icon } from '../lib/icons.js';
import { sound } from '../lib/sound.js';
import { orbs } from '../core/orbs.js';

const DRAFT_KEY = 'rsvp:draft';
const DONE_KEY = 'rsvp:done';

const safe = (label, fn) => { try { return fn(); } catch (err) { console.error(`[rsvp] ${label}`, err); } };
const fill = (str, vars = {}) => String(str ?? '').replace(/\{(\w+)\}/g, (m, k) => (vars[k] ?? m));
const firstName = (n) => String(n || '').trim().split(/\s+/)[0] || '';
const pad2 = (n) => String(n).padStart(2, '0');

/** "Will you\nbe *there?*" -> masked words (each rises on its own). *word* becomes italic gold. */
function maskWords(text, { gold = false } = {}) {
  return String(text).split('\n').map((line) => line.split(/\s+/).filter(Boolean).map((tok) => {
    const m = /^\*(.*)\*$/.exec(tok);
    const word = esc((m ? m[1] : tok).replace(/\*/g, ''));
    return `<span class="rs-w"><span class="rs-w__i${m ? (gold ? ' rs-w__i--em gold' : ' rs-w__i--em') : ''}">${word}</span></span>`;
  }).join(' ')).join('<br>');
}

/* ===========================================================================================================
 *  THE WAX SEAL: gold, glossy, embossed monogram, irregular melted edge. Pure SVG gradients (no filters).
 * =========================================================================================================*/
let sealUid = 0;
function waxSeal(mono) {
  const id = `rsws${++sealUid}`;
  const N = 180, pts = [];
  const drips = [[0.75, 3.6, 0.025], [2.45, 2.6, 0.04], [3.9, 3.2, 0.03], [5.35, 2.2, 0.05]];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    let r = 46 + 1.3 * Math.sin(3 * a + 0.6) + 1.0 * Math.sin(5 * a + 2.1) + 0.7 * Math.sin(9 * a + 1) + 1.1 * Math.sin(2 * a + 4);
    for (const [a0, h, w] of drips) { let d = Math.abs(a - a0); d = Math.min(d, Math.PI * 2 - d); r += h * Math.exp(-(d * d) / w); }
    pts.push(`${(Math.cos(a) * r).toFixed(2)} ${(Math.sin(a) * r).toFixed(2)}`);
  }
  const edge = `M${pts.join('L')}Z`;
  const monoSafe = esc(mono || 'P·N');
  const txt = (dx, dy, fill_, extra = '') => `<text x="${dx}" y="${dy + 1}" text-anchor="middle" dominant-baseline="middle" font-family="'Lora', Georgia, serif" font-style="italic" font-size="25" letter-spacing="-.5" fill="${fill_}" ${extra}>${monoSafe}</text>`;
  return `<svg class="rs-wax" viewBox="-60 -60 120 120" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id="${id}b" cx=".36" cy=".3" r=".85"><stop offset="0" stop-color="#FBE6A0"/><stop offset=".38" stop-color="#E2B957"/><stop offset=".72" stop-color="#B98A30"/><stop offset="1" stop-color="#7A5416"/></radialGradient>
      <linearGradient id="${id}r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF3C6"/><stop offset=".5" stop-color="#C9993B"/><stop offset="1" stop-color="#5E3F0E"/></linearGradient>
      <linearGradient id="${id}d" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9A6E22"/><stop offset=".55" stop-color="#D3A748"/><stop offset="1" stop-color="#F0D082"/></linearGradient>
      <linearGradient id="${id}dr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6B4812" stop-opacity=".85"/><stop offset=".5" stop-color="#C69A3C" stop-opacity=".3"/><stop offset="1" stop-color="#FFF1BE" stop-opacity=".95"/></linearGradient>
      <linearGradient id="${id}m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6DD92"/><stop offset="1" stop-color="#D4A744"/></linearGradient>
      <linearGradient id="${id}g" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <radialGradient id="${id}s" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
      <radialGradient id="${id}v" cx=".5" cy=".5" r=".5"><stop offset=".7" stop-color="#4A3008" stop-opacity="0"/><stop offset="1" stop-color="#4A3008" stop-opacity=".38"/></radialGradient>
      <clipPath id="${id}c"><path d="${edge}"/></clipPath>
    </defs>
    <path d="${edge}" fill="url(#${id}b)"/>
    <g clip-path="url(#${id}c)">
      <circle r="58" fill="url(#${id}v)"/>
      <ellipse cx="-17" cy="-26" rx="30" ry="13" transform="rotate(-32 -17 -26)" fill="url(#${id}g)" opacity=".7"/>
      <circle cx="-22" cy="-27" r="7" fill="url(#${id}s)"/>
      <path d="M30 31 A 44 44 0 0 0 -2 46" fill="none" stroke="#FFF3C6" stroke-opacity=".28" stroke-width="2.4" stroke-linecap="round"/>
    </g>
    <path d="${edge}" fill="none" stroke="url(#${id}r)" stroke-width="1.3"/>
    <circle r="33" fill="url(#${id}d)"/>
    <circle r="33" fill="none" stroke="url(#${id}dr)" stroke-width="1.8"/>
    <circle r="28.6" fill="none" stroke="#7A5416" stroke-opacity=".28" stroke-width=".6"/>
    ${txt(1, 1.1, 'rgba(255,246,208,.95)')}${txt(-0.9, -1, 'rgba(58,36,4,.9)')}${txt(0, 0, `url(#${id}m)`)}
  </svg>`;
}

/* ===========================================================================================================
 *  MOUNT
 * =========================================================================================================*/
export function mount(root, ctx) {
  const C = ctx?.content?.rsvp;
  const site = ctx?.site;
  if (!C?.steps || !site) { root.innerHTML = '<div class="rs"><p class="rs-lead">The reply desk is closed for now.</p></div>'; return; }
  const gsap = window.gsap;
  const reduced = () => prefersReducedMotion();
  const S = C.steps;
  const bride = site.couple.bride.first, groom = site.couple.groom.first;
  const cityVars = { city: site.wedding.city, date: site.wedding.dateLabel, bride, groom };

  /* ---------------- state ---------------- */
  const blank = () => ({ name: '', phone: '', attending: null, guests: 0, guestNames: [], note: '' });
  const draft = store.get(DRAFT_KEY, null);
  let answers = Object.assign(blank(), draft?.a || {});
  let done = store.get(DONE_KEY, null);
  let cur = draft?.step || 'name';
  let fromReview = false;
  let busy = false;
  let userMoved = false;        // we only move focus after the guest has interacted (never steal it on page load)
  let gen = 0;                  // guards overlapping step transitions
  let sealed = false;

  // ?to=Name prefills the name (also saved by the invitation link)
  safe('to', () => {
    const to = new URLSearchParams(location.search).get('to');
    if (to && !answers.name) answers.name = to.trim().slice(0, 80);
  });

  const pathFor = () => (answers.attending === false
    ? ['name', 'phone', 'coming', 'note', 'review', 'seal']
    : ['name', 'phone', 'coming', 'guests', 'note', 'review', 'seal']);
  const saveDraft = () => store.set(DRAFT_KEY, { a: answers, step: cur });
  const guestList = () => answers.guestNames.slice(0, answers.guests);
  const toName = () => firstName(answers.name);

  /* ---------------- skeleton ---------------- */
  root.innerHTML = `
    <div class="rs" data-mode="ask">
      <input type="text" name="website" id="rs-hp" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">
      <div class="rs-left">
        <div class="rs-copy">
          <span class="eyebrow rs-eyebrow"></span>
          <h2 class="rs-title"></h2>
          <p class="rs-lead"></p>
        </div>
        <div class="rs-deadline"></div>
      </div>
      <div class="rs-right">
        <div class="rs-env" hidden>
          <button type="button" class="rs-env__btn" aria-label="">
            <span class="rs-env__float">
              <span class="rs-env__back"></span>
              <span class="rs-env__paper" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
              <span class="rs-env__front">
                <svg viewBox="0 0 100 66.67" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0L50 36.5L100 0M0 66.67L40 31M100 66.67L60 31" vector-effect="non-scaling-stroke"/></svg>
                <span class="rs-env__to"></span>
              </span>
              <span class="rs-env__flap"><i class="rs-env__flap-out"></i><i class="rs-env__flap-in"></i></span>
              <span class="rs-env__wax" aria-hidden="true"></span>
            </span>
          </button>
          <p class="rs-env__hint"></p>
        </div>
        <div class="rs-card" role="group" aria-label="RSVP"></div>
        <div class="rs-done" hidden></div>
      </div>
    </div>`;

  const rs = $('.rs', root);
  const eyebrowEl = $('.rs-eyebrow', root), titleEl = $('.rs-title', root), leadEl = $('.rs-lead', root);
  const card = $('.rs-card', root), doneEl = $('.rs-done', root);
  const envEl = $('.rs-env', root), envBtn = $('.rs-env__btn', root), envHint = $('.rs-env__hint', root);
  const envFloat = $('.rs-env__float', root), envPaper = $('.rs-env__paper', root), envFlap = $('.rs-env__flap', root), envWax = $('.rs-env__wax', root);
  const E = C.envelope || {};
  envBtn.setAttribute('aria-label', E.aria || 'Open the envelope');
  $('.rs-env__to', root).innerHTML = `<small>${esc(E.from || '')}</small><b>${esc(fill(E.to || 'To {pair}', { pair: (site.couple.pair || [site.couple.bride, site.couple.groom]).map((p) => p.first).join(' & ') }))}</b>`;
  envHint.textContent = E.open || 'Tap to open';
  envWax.innerHTML = waxSeal(site.couple.monogram);

  /* ---------------- left side: deadline + head moods ---------------- */
  const D = C.deadline || {};
  (function paintDeadline() {
    const box = $('.rs-deadline', root);
    let big = '', small = D.past || '';
    if (D.iso) {
      const end = new Date(`${D.iso}T23:59:59+05:30`).getTime();
      const days = Math.ceil((end - Date.now()) / 86400000);
      if (days > 1) { big = String(days); small = D.left; }
      else if (days === 1) { big = '1'; small = D.leftOne || D.left; }
      else if (days === 0 || (days < 0 && end > Date.now() - 86400000)) { big = ''; small = D.today || ''; }
    }
    box.innerHTML = `<span class="rs-deadline__k">${esc(D.label || '')}</span>
      <span class="rs-deadline__d">${esc(D.date || '')}</span>
      <span class="rs-deadline__n">${big ? `<b>${esc(big)}</b>` : ''}<small>${esc(small)}</small></span>`;
  })();

  function setHead(mode, first = false) {
    const H = C.head[mode] || C.head.ask;
    rs.dataset.mode = mode;
    const apply = () => {
      eyebrowEl.textContent = fill(H.eyebrow, cityVars);
      titleEl.setAttribute('aria-label', fill(H.title, cityVars).replace(/\*/g, '').replace(/\n/g, ' '));
      titleEl.innerHTML = maskWords(fill(H.title, cityVars), { gold: true });
      leadEl.textContent = fill(H.lead, cityVars);
      const words = $$('.rs-w__i', titleEl);
      if (gsap && !reduced()) {
        gsap.fromTo(words, { yPercent: 115 }, { yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.07, delay: first ? 0.1 : 0.05 });
        gsap.fromTo([eyebrowEl, leadEl], { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1, delay: first ? 0.35 : 0.25 });
      }
    };
    apply();
  }

  /** The orb brightens as the guest progresses (0..1.15). */
  function setProgress(p) { rs.style.setProperty('--p', String(p)); }

  /* ===========================================================================================================
   *  CARD CHROME
   * =========================================================================================================*/
  function buildCard() {
    const N = S;
    card.innerHTML = `
      <span class="rs-card__frame" aria-hidden="true"></span>
      <header class="rs-top">
        <span class="rs-top__mono" aria-hidden="true">${esc(site.couple.monogram)}</span>
        <span class="rs-top__count" aria-live="polite"></span>
      </header>
      <div class="rs-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Progress"><i class="rs-track__fill"></i><i class="rs-track__head"></i></div>
      <div class="rs-view"><div class="rs-pane"></div></div>
      <footer class="rs-foot">
        <button type="button" class="rs-back" aria-label="${esc(C.nav.back)}">${icon('arrow-left', { size: 18 })}<span>${esc(C.nav.back)}</span></button>
        <span class="rs-hint" aria-hidden="true">${esc(C.nav.hint)} <kbd>↵</kbd></span>
        <button type="button" class="rs-next"><span>${esc(C.nav.next)}</span>${icon('arrow-right', { size: 18 })}</button>
      </footer>`;
    on($('.rs-back', card), 'click', () => go(-1));
    on($('.rs-next', card), 'click', () => (cur === 'seal' ? sealIt() : go(1)));
    on(card, 'keydown', (e) => {
      if (e.key !== 'Enter' || e.isComposing || busy) return;
      const t = e.target;
      if (t.closest('button, a, .rs-seal')) return;
      if (t.tagName === 'TEXTAREA' && !(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      cur === 'seal' ? sealIt() : go(1);
    });
    on(card, 'input', () => { userMoved = true; });
  }

  const pane = () => $('.rs-pane', card);
  const msg = () => $('.rs-msg', card);
  function setMsg(text) {
    const m = msg(); if (!m) return;
    m.textContent = text || '';
    m.classList.toggle('is-on', !!text);
    if (text && gsap && !reduced()) gsap.fromTo(m, { x: -8 }, { x: 0, duration: 0.6, ease: 'elastic.out(1,.35)' });
  }
  function markInvalid(on_ = true) {
    const f = $('.rs-input, .rs-area', pane());
    if (!f) return;
    if (on_) { f.setAttribute('aria-invalid', 'true'); f.setAttribute('aria-describedby', 'rs-msg'); f.focus({ preventScroll: true }); }
    else f.removeAttribute('aria-invalid');
  }

  /* ---------------- stepping ---------------- */
  function go(dir) {
    if (busy) return;
    userMoved = true;
    const path = pathFor();
    const i = path.indexOf(cur);
    if (dir > 0) {
      const err = STEP[cur].collect?.(false);
      if (err) { setMsg(err); markInvalid(); sound.play('tick'); return; }
      setMsg(''); saveDraft();
      if (fromReview && cur !== 'review') { fromReview = false; return renderStep('review', 1); }
      renderStep(path[Math.min(path.length - 1, i + 1)], 1);
    } else {
      STEP[cur].collect?.(true); setMsg(''); saveDraft();
      if (fromReview) { fromReview = false; return renderStep('review', -1); }
      if (i > 0) renderStep(path[i - 1], -1);
    }
  }

  function updateChrome() {
    const path = pathFor();
    const i = Math.max(0, path.indexOf(cur));
    const total = path.length - 1;                    // the seal is the finale, not a "question"
    const p = i / total;
    setProgress(Math.min(1.15, p * 1.0 + (cur === 'seal' ? 0.15 : 0)));
    const tr = $('.rs-track', card);
    tr.style.setProperty('--tp', String(p));
    tr.setAttribute('aria-valuenow', String(Math.round(p * 100)));
    $('.rs-top__count', card).innerHTML = cur === 'seal' ? `<b>${esc(C.nav.seal)}</b>` : `<b>${pad2(i + 1)}</b> / ${pad2(total)}`;
    const back = $('.rs-back', card), next = $('.rs-next', card);
    back.style.visibility = (i === 0 && !fromReview) ? 'hidden' : 'visible';
    const label = cur === 'seal' ? C.nav.seal : cur === 'review' ? C.nav.review : fromReview ? C.nav.done : C.nav.next;
    $('span', next).textContent = label;
    next.classList.toggle('rs-next--seal', cur === 'seal');
    $('.rs-hint', card).hidden = cur === 'seal';
    card.dataset.step = cur;
  }

  function renderStep(id, dir = 1, first = false) {
    if (!STEP[id]) id = 'name';
    const myGen = ++gen;
    const p = pane();
    const build = () => {
      if (myGen !== gen) return;
      cur = id; saveDraft();
      const st = STEP[id];
      p.innerHTML = `<div class="rs-step rs-step--${id}">${st.html()}<p class="rs-msg" id="rs-msg" role="alert"></p></div>`;
      safe('bind', () => st.bind?.(p));
      updateChrome();
      const q = $('.rs-q', p);
      if (q) q.innerHTML = maskWords(q.dataset.q);
      const f = $('.rs-input, .rs-area', p);
      const parts = $$('.rs-step > :not(.rs-q):not(.rs-msg)', p);
      if (gsap && !reduced()) {
        gsap.set(p, { clearProps: 'all' });
        gsap.fromTo($$('.rs-w__i', p), { yPercent: 115 }, { yPercent: 0, duration: 0.85, ease: 'expo.out', stagger: 0.045 });
        gsap.fromTo(parts, { y: 22 * dir, autoAlpha: 0, filter: 'blur(8px)' }, { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out', stagger: 0.07, delay: 0.12, clearProps: 'filter,transform,opacity,visibility' });
      }
      if (userMoved && !first) {
        if (f) f.focus({ preventScroll: true });
        else { const qq = $('.rs-q', p); if (qq) { qq.tabIndex = -1; qq.focus({ preventScroll: true }); } }
      }
      if (f && f.tagName === 'INPUT' && f.value) { try { f.setSelectionRange(f.value.length, f.value.length); } catch { /* tel/number types */ } }
    };
    if (!first && gsap && !reduced() && p.firstChild) {
      busy = true;
      gsap.to(p, { autoAlpha: 0, y: -16 * dir, filter: 'blur(6px)', duration: 0.22, ease: 'power2.in', onComplete: () => { busy = false; build(); } });
    } else build();
  }

  /* ===========================================================================================================
   *  STEPS
   * =========================================================================================================*/
  const head = (s, qOverride, subOverride) => `<h3 class="rs-q" data-q="${esc(qOverride || s.q)}">${esc(String(qOverride || s.q).replace(/\*/g, ''))}</h3>${(subOverride ?? s.sub) ? `<p class="rs-sub">${richText(subOverride ?? s.sub)}</p>` : ''}`;
  const clearInvalid = (b) => { $$('[aria-invalid]', b).forEach((n) => n.removeAttribute('aria-invalid')); setMsg(''); };

  const STEP = {
    name: {
      html() {
        const s = S.name;
        return `${head(s)}<div class="rs-field"><label class="rs-label" for="rs-name">${esc(s.label)}</label>
          <input id="rs-name" class="rs-input" type="text" autocomplete="name" enterkeyhint="next" placeholder="${esc(s.placeholder)}" value="${esc(answers.name)}" maxlength="80"></div>`;
      },
      bind(b) { on($('#rs-name', b), 'input', () => { answers.name = $('#rs-name', b).value; saveDraft(); clearInvalid(b); }); },
      collect(silent) { const el_ = $('#rs-name', card); if (el_) answers.name = el_.value.trim(); return silent || answers.name.length >= 2 ? '' : S.name.error; },
    },
    phone: {
      html() {
        const s = S.phone;
        return `${head(s)}<div class="rs-field"><label class="rs-label" for="rs-phone">${esc(s.label)}</label>
          <input id="rs-phone" class="rs-input" type="tel" inputmode="tel" autocomplete="tel" enterkeyhint="next" placeholder="${esc(s.placeholder)}" value="${esc(answers.phone)}" maxlength="24"></div>`;
      },
      bind(b) { on($('#rs-phone', b), 'input', () => { answers.phone = $('#rs-phone', b).value; saveDraft(); clearInvalid(b); }); },
      collect(silent) {
        const el_ = $('#rs-phone', card); if (el_) answers.phone = el_.value.trim();
        if (silent) return '';
        const d = answers.phone.replace(/\D/g, '');
        return /^[+\d\s().\-]+$/.test(answers.phone) && d.length >= 7 && d.length <= 15 ? '' : S.phone.error;
      },
    },
    coming: {
      html() {
        const s = S.coming;
        const opt = (v, ic, t, sub, on_) => `<button type="button" class="rs-opt rs-opt--${v}" role="radio" data-v="${v}" aria-checked="${on_}">
          <span class="rs-opt__orb">${icon(ic, { size: 22, stroke: 1.6 })}</span><b>${esc(t)}</b><small>${esc(sub)}</small></button>`;
        return `${head(s)}<div class="rs-opts" role="radiogroup" aria-label="${esc(String(s.q).replace(/\*/g, ''))}">
          ${opt('yes', 'sparkles', s.yes, s.yesSub, answers.attending === true)}${opt('no', 'heart', s.no, s.noSub, answers.attending === false)}</div>`;
      },
      bind(b) {
        $$('.rs-opt', b).forEach((btn) => on(btn, 'click', () => {
          userMoved = true;
          answers.attending = btn.dataset.v === 'yes';
          $$('.rs-opt', b).forEach((x) => x.setAttribute('aria-checked', String(x === btn)));
          saveDraft(); setMsg('');
          sound.play(answers.attending ? 'pop' : 'chime');
          const r = btn.getBoundingClientRect();
          if (answers.attending) safe('burst', () => orbs.burst(r.left + r.width / 2, r.top + r.height / 2, { count: 18, power: 0.7 }));
          setTimeout(() => { if (cur === 'coming' && !busy) go(1); }, reduced() ? 120 : 520);
        }));
      },
      collect(silent) { return silent || answers.attending !== null ? '' : S.coming.error; },
    },
    guests: {
      html() {
        const s = S.guests;
        return `${head(s)}
          <div class="rs-stepper">
            <button type="button" class="rs-stepper__btn" data-d="-1" aria-label="One fewer guest">${icon('minus', { size: 22 })}</button>
            <div class="rs-stepper__num" aria-live="polite"><b></b><span></span></div>
            <button type="button" class="rs-stepper__btn" data-d="1" aria-label="One more guest">${icon('plus', { size: 22 })}</button>
          </div>
          <p class="rs-caption"></p>
          <div class="rs-gnames"></div>`;
      },
      bind(b) {
        const max = s_().captions.length - 1;
        const paint = (animate = false) => {
          $('.rs-stepper__num b', b).textContent = answers.guests;
          $('.rs-stepper__num span', b).textContent = answers.guests === 1 ? s_().one : s_().many;
          $('.rs-caption', b).textContent = s_().captions[Math.min(answers.guests, max)];
          $$('.rs-stepper__btn', b).forEach((x) => { x.disabled = (Number(x.dataset.d) < 0 && answers.guests <= 0) || (Number(x.dataset.d) > 0 && answers.guests >= max); });
          while (answers.guestNames.length < answers.guests) answers.guestNames.push({ name: '', kid: false });
          const box = $('.rs-gnames', b);
          const rows = guestList();
          const existing = $$('.rs-gname', box).length;
          if (!rows.length) { box.innerHTML = ''; return; }
          if (!existing) box.innerHTML = `<p class="rs-gnames__t"><b>${esc(s_().namesTitle)}</b> ${esc(s_().namesSub)}</p><div class="rs-gnames__list"></div>`;
          const list = $('.rs-gnames__list', box);
          const have = $$('.rs-gname', list);
          for (let i = have.length; i < rows.length; i++) {
            const g = rows[i];
            const row = document.createElement('div');
            row.className = 'rs-gname';
            row.innerHTML = `<input class="rs-gname__in" type="text" data-i="${i}" aria-label="${esc(fill(s_().nameLabel, { n: i + 1 }))}" placeholder="${esc(fill(s_().namePlaceholder, { n: i + 1 }))}" value="${esc(g.name)}" maxlength="60" autocomplete="off" enterkeyhint="next">
              <button type="button" class="rs-kid" data-i="${i}" aria-pressed="${g.kid}" title="${esc(s_().kidHint)}">${icon('baby', { size: 16 })}<span>${esc(s_().kid)}</span></button>`;
            list.appendChild(row);
            on($('input', row), 'input', (e) => { answers.guestNames[i].name = e.target.value; saveDraft(); });
            on($('.rs-kid', row), 'click', (e) => { const g2 = answers.guestNames[i]; g2.kid = !g2.kid; e.currentTarget.setAttribute('aria-pressed', String(g2.kid)); sound.play('pop'); saveDraft(); });
            if (animate && gsap && !reduced()) gsap.from(row, { y: 14, autoAlpha: 0, duration: 0.5, ease: 'power3.out', clearProps: 'all' });
          }
          for (let i = have.length - 1; i >= rows.length; i--) have[i].remove();   // hidden names stay saved in the draft
        };
        $$('.rs-stepper__btn', b).forEach((btn) => on(btn, 'click', () => {
          const next = Math.max(0, Math.min(max, answers.guests + Number(btn.dataset.d)));
          if (next === answers.guests) return;
          answers.guests = next; paint(true); saveDraft(); sound.play(Number(btn.dataset.d) > 0 ? 'pop' : 'tick');
          const num = $('.rs-stepper__num b', b);
          if (gsap && !reduced()) gsap.fromTo(num, { y: 10 * -Number(btn.dataset.d), autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, ease: 'power3.out' });
        }));
        paint();
      },
      collect() { return ''; },
    },
    note: {
      html() {
        const s = S.note, no = answers.attending === false;
        return `${head(s, no ? s.qNo : s.q, no ? s.subNo : s.sub)}
          <div class="rs-field"><label class="rs-label" for="rs-note">${esc(s.label)} <em>${esc(s.optional)}</em></label>
            <textarea id="rs-note" class="rs-area" rows="4" maxlength="900" placeholder="${esc(s.placeholder)}">${esc(answers.note)}</textarea></div>
          <div class="rs-sugg"><span class="rs-label">${esc(s.suggestionTitle)}</span>
            <div class="rs-chips">${s.suggestions.map((t, i) => `<button type="button" class="rs-chip" data-i="${i}">${esc(t)}</button>`).join('')}</div></div>`;
      },
      bind(b) {
        const ta = $('#rs-note', b);
        on(ta, 'input', () => { answers.note = ta.value; saveDraft(); });
        $$('.rs-chip', b).forEach((c) => on(c, 'click', () => {
          const t = S.note.suggestions[Number(c.dataset.i)];
          ta.value = ta.value.trim() ? `${ta.value.trim()} ${t}` : t;
          answers.note = ta.value; saveDraft(); sound.play('pop'); ta.focus({ preventScroll: true });
        }));
      },
      collect() { const el_ = $('#rs-note', card); if (el_) answers.note = el_.value.trim(); return ''; },
    },
    review: {
      html() {
        const s = S.review, r = s.rows, yes = answers.attending !== false;
        const names = guestList().map((g) => (g.name.trim() || '?') + (g.kid ? ` (${s.kidMark})` : '')).join(', ');
        const row = (label, val, step) => `<li><button type="button" class="rs-row" data-goto="${step}"><span class="rs-row__k">${esc(label)}</span><span class="rs-row__v">${esc(val)}</span><span class="rs-row__ic">${icon('pencil', { size: 15 })}</span></button></li>`;
        const rows = [row(r.name, answers.name, 'name'), row(r.phone, answers.phone, 'phone'), row(r.coming, yes ? s.yes : s.no, 'coming')];
        if (yes) rows.push(row(r.guests, answers.guests ? `${answers.guests} · ${names}` : s.none, 'guests'));
        rows.push(row(r.note, answers.note || s.empty, 'note'));
        return `${head(s)}<ul class="rs-review">${rows.join('')}</ul>`;
      },
      bind(b) { $$('[data-goto]', b).forEach((x) => on(x, 'click', () => { userMoved = true; fromReview = true; sound.play('tick'); renderStep(x.dataset.goto, -1); })); },
      collect: () => '',
    },
    seal: {
      html() {
        const s = S.seal, L = C.letter, yes = answers.attending !== false;
        const glist = guestList();
        const gtxt = glist.map((g) => (g.name.trim() || '·') + (g.kid ? ` (${S.review.kidMark})` : '')).join(', ');
        const lines = [
          `<p class="rs-letter__line">${esc(fill(yes ? L.yes : L.no, { name: answers.name }))}</p>`,
          yes && glist.length ? `<p class="rs-letter__sub">${esc(glist.some((g) => g.name.trim()) ? fill(L.yesGuests, { guests: gtxt }) : fill(L.yesGuestsN, { n: glist.length }).replace('guest(s)', glist.length === 1 ? 'guest' : 'guests'))}</p>` : '',
          answers.note ? `<p class="rs-letter__note">“${esc(answers.note)}”</p>` : '',
        ].join('');
        return `${head(s)}
          <div class="rs-sealstage">
            <div class="rs-letter">
              <span class="rs-letter__crease" aria-hidden="true"></span>
              <p class="rs-letter__to">${esc(fill(L.to, cityVars))}</p>
              <div class="rs-letter__body">${lines}</div>
              <p class="rs-letter__sign">${esc(L.sign)} <em>${esc(firstName(answers.name))}</em></p>
              <div class="rs-spot" aria-hidden="true"><span>${esc(s.spot)}</span></div>
            </div>
            <div class="rs-tray">
              <button type="button" class="rs-seal" aria-label="${esc(s.aria)}">${waxSeal(site.couple.monogram)}</button>
              <p class="rs-tray__hint">${esc(s.hint)}</p>
            </div>
          </div>
          <p class="rs-sending" hidden><i></i>${esc(s.sending)}</p>`;
      },
      bind(b) { bindSeal(b); },
      collect: () => '',
    },
  };
  const s_ = () => S.guests;

  /* ===========================================================================================================
   *  SEALING
   * =========================================================================================================*/
  let sealAPI = null;
  function bindSeal(b) {
    const seal = $('.rs-seal', b), spot = $('.rs-spot', b), tray = $('.rs-tray', b);
    sealed = false;
    let floatTween = null, drag = null;
    if (gsap && !reduced()) floatTween = gsap.to(seal, { y: -5, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    const Draggable = window.Draggable;
    if (gsap && Draggable) {
      drag = Draggable.create(seal, {
        type: 'x,y', zIndexBoost: true, minimumMovement: 5, allowContextMenu: true,
        onPress() { floatTween?.kill(); gsap.to(seal, { scale: 1.1, duration: 0.25, ease: 'power3.out' }); tray.classList.add('is-drag'); },
        onDragStart() { spot.classList.add('is-live'); },
        onDrag() { spot.classList.toggle('is-hot', this.hitTest(spot, '35%')); },
        onRelease() { tray.classList.remove('is-drag'); },
        onDragEnd() {
          spot.classList.remove('is-live', 'is-hot');
          if (this.hitTest(spot, '35%')) sealIt();
          else gsap.to(seal, { x: 0, y: 0, scale: 1, duration: 0.7, ease: 'expo.out' });
        },
        onClick() { sealIt(); },
      })[0];
    }
    on(seal, 'click', (e) => { if (e.detail === 0 || !drag) sealIt(); });   // keyboard Enter/Space, or no Draggable available
    sealAPI = { seal, spot, drag, floatTween };
  }

  function sparks(x, y, count = 16) {
    if (!gsap || reduced()) return;
    for (let i = 0; i < count; i++) {
      const d = document.createElement('i');
      d.className = 'rs-spark';
      d.style.cssText = `left:${x}px;top:${y}px;width:${3 + Math.random() * 4}px;height:${3 + Math.random() * 4}px`;
      document.body.appendChild(d);
      const a = Math.random() * Math.PI * 2, r = 50 + Math.random() * 120;
      gsap.fromTo(d, { x: 0, y: 0, scale: 1, autoAlpha: 1 }, { x: Math.cos(a) * r, y: Math.sin(a) * r - 18, scale: 0, autoAlpha: 0, duration: 0.8 + Math.random() * 0.7, ease: 'power3.out', onComplete: () => d.remove() });
    }
  }
  function flashAt(x, y) {
    const f = document.createElement('i');
    f.className = 'rs-flash';
    f.style.cssText = `left:${x}px;top:${y}px`;
    document.body.appendChild(f);
    if (!gsap || reduced()) { setTimeout(() => f.remove(), 400); return; }
    gsap.fromTo(f, { scale: 0.1, autoAlpha: 0.95 }, { scale: 3.2, autoAlpha: 0, duration: 0.9, ease: 'power2.out', onComplete: () => f.remove() });
  }

  /* ===========================================================================================================
   *  THE ENVELOPE: starts closed; tap -> flap opens, the letter rises, we zoom into the form.
   *  At the end the form zooms back into the envelope, the flap closes, the wax seal lands, the envelope flies off.
   * =========================================================================================================*/
  const useEnvelope = () => !!gsap && !reduced();
  let opened = false;
  function envPose(state) {
    // 'closed': flap shut, paper inside, no seal.   'open': flap back, paper risen.
    const open = state === 'open';
    gsap.set(envFlap, { rotateX: open ? -180 : 0, zIndex: open ? 0 : 5 });
    gsap.set(envPaper, { yPercent: open ? -62 : 0 });
    gsap.set(envWax, { autoAlpha: 0, scale: 1 });
    gsap.set(envFloat, { clearProps: 'rotation,x,y' });
  }
  /** Flap rotation with its z-order flipped halfway (a shut flap sits over the pocket, an open one behind the paper). */
  function flapTween(open, dur) {
    const o = { p: open ? 0 : 1 };
    return gsap.to(o, { p: open ? 1 : 0, duration: dur, ease: open ? 'power2.inOut' : 'power2.inOut', onUpdate: () => {
      gsap.set(envFlap, { rotateX: -180 * o.p, zIndex: o.p > 0.5 ? 0 : 5 });
    } });
  }
  function setSending(on_) {
    envHint.textContent = on_ ? (E.sending || 'Sending…') : (E.open || 'Tap to open');
    envEl.classList.toggle('is-sending', !!on_);
  }

  function lockCard(locked) { card.inert = locked; }

  function bootEnvelope() {
    envEl.hidden = false;
    envEl.classList.remove('is-gone');
    envPose('closed');
    gsap.set(envEl, { autoAlpha: 1, scale: 1, x: 0, y: 0, rotation: 0 });
    gsap.set(card, { autoAlpha: 0, scale: 0.5 });
    lockCard(true);
    opened = false;
    envBtn.disabled = false;
    envHint.textContent = E.open || 'Tap to open';
  }

  async function openEnvelope() {
    if (opened || busy) return;
    opened = true; busy = true; userMoved = true;
    envBtn.disabled = true;
    sound.play('pop');
    envEl.classList.add('is-opening');
    const tl = gsap.timeline();
    tl.to(envHint, { autoAlpha: 0, duration: 0.25 }, 0)
      .add(flapTween(true, 0.75), 0)
      .to(envPaper, { yPercent: -62, duration: 0.8, ease: 'power3.out' }, 0.55)
      .to(envFloat, { rotation: 0, duration: 0.01 }, 0)
      // zoom in: the envelope swells past the viewer while the real form scales up out of the paper
      .set(card, { autoAlpha: 0, scale: 0.46, transformOrigin: '50% 38%' }, 1.2)
      .to(envEl, { scale: 3.1, autoAlpha: 0, transformOrigin: '50% 34%', duration: 0.95, ease: 'power3.in' }, 1.25)
      .to(card, { autoAlpha: 1, scale: 1, duration: 0.95, ease: 'power3.out' }, 1.45);
    await tl;
    envEl.hidden = true;
    envEl.classList.remove('is-opening');
    gsap.set(card, { clearProps: 'transform,opacity,visibility,transformOrigin' });
    lockCard(false);
    busy = false;
    const f = $('.rs-input, .rs-area', pane());
    if (f) f.focus({ preventScroll: true });
  }
  on(envBtn, 'click', () => { if (useEnvelope()) openEnvelope(); });

  /** The finale: form shrinks into the envelope, flap closes, wax seal lands, then the whole thing flies off. */
  async function closeAndSeal(sendFn) {
    envEl.hidden = false;
    envPose('open');
    gsap.set(envHint, { autoAlpha: 0 });
    gsap.set(envEl, { autoAlpha: 0, scale: 3.1, x: 0, y: 0, rotation: 0, transformOrigin: '50% 34%' });
    lockCard(true);
    await new Promise((res) => gsap.timeline({ onComplete: res })
      .to(card, { autoAlpha: 0, scale: 0.46, transformOrigin: '50% 38%', duration: 0.85, ease: 'power3.inOut' }, 0)
      .to(envEl, { autoAlpha: 1, scale: 1, duration: 0.95, ease: 'power3.out' }, 0.05)
      .to(envPaper, { yPercent: 0, duration: 0.6, ease: 'power2.inOut' }, 0.95)
      .add(flapTween(false, 0.7), 1.45));
    // the seal drops onto the flap's tip
    const stamp = (async () => {
      sound.play('stamp');
      gsap.fromTo(envWax, { autoAlpha: 0, scale: 2.6 }, { autoAlpha: 1, scale: 1, duration: 0.38, ease: 'power4.in' });
      await wait(380);
      const r = envWax.getBoundingClientRect();
      const px = r.left + r.width / 2, py = r.top + r.height / 2;
      gsap.fromTo(envWax.firstElementChild, { scale: 0.92 }, { scale: 1, duration: 0.6, ease: 'expo.out' });
      gsap.fromTo(envFloat, { y: 4 }, { y: 0, duration: 0.5, ease: 'expo.out' });
      const rip = document.createElement('i'); rip.className = 'rs-ripple'; envWax.appendChild(rip); setTimeout(() => rip.remove(), 1100);
      flashAt(px, py); sparks(px, py, 20);
      safe('celebrate', () => orbs.celebrate(px, py));
      setProgress(1.15);
    })();
    await stamp;
    setSending(true);
    gsap.set(envHint, { autoAlpha: 1 });
    await wait(450);
    const res = await sendFn();
    return res;
  }

  async function flyOff() {
    setSending(false);
    gsap.to(envHint, { autoAlpha: 0, duration: 0.2 });
    await new Promise((res) => gsap.timeline({ onComplete: res })
      .to(envFloat, { scale: 1.06, y: 8, duration: 0.3, ease: 'power2.out' }, 0)
      .to(envEl, { x: () => innerWidth * 0.55, y: () => -innerHeight * 0.95, rotation: 16, scale: 0.55, duration: 1.05, ease: 'power3.in' }, 0.25)
      .to(envEl, { autoAlpha: 0, duration: 0.3, ease: 'none' }, 1.0));
    envEl.hidden = true;
    gsap.set(envFloat, { clearProps: 'all' });
  }

  async function sealIt() {
    if (sealed || busy || cur !== 'seal' || !sealAPI) return;
    sealed = true; busy = true;
    userMoved = true;
    const { seal, spot, drag, floatTween } = sealAPI;
    floatTween?.kill(); drag?.disable();
    $('.rs-next', card).disabled = true; $('.rs-back', card).style.visibility = 'hidden';
    spot.classList.remove('is-live', 'is-hot');
    $('.rs-tray__hint', card)?.setAttribute('hidden', '');
    const anim = useEnvelope();
    // the loose seal is picked up off the letter; a fresh one is pressed into the envelope below
    if (gsap) gsap.to(seal, { autoAlpha: 0, scale: '+=0.2', duration: 0.3, ease: 'power2.out' });
    let res;
    if (anim) {
      res = await closeAndSeal(submitAnswers);
    } else {
      sound.play('stamp');
      setProgress(1.15);
      await wait(150);
      res = await submitAnswers();
    }
    if (!res.ok) { busy = false; showFailure(); return; }
    await finish(res);
  }

  /* ---------------- sending ---------------- */
  function payload() {
    const yes = answers.attending !== false;
    const gl = yes ? guestList() : [];
    return {
      name: answers.name, phone: answers.phone, attending: yes ? 'Yes' : 'No',
      guestCount: gl.length,
      guestNames: gl.map((g) => (g.name.trim() || '(unnamed)') + (g.kid ? ' [kid]' : '')).join(', '),
      note: answers.note, page: __pageLoc.href.split('#')[0],
      website: root.querySelector('#rs-hp')?.value || '',   // honeypot: real guests never fill it
    };
  }
  const summaryText = () => Object.entries(payload()).filter(([k, v]) => v !== '' && v !== 0 && k !== 'page' && k !== 'website').map(([k, v]) => `${k}: ${v}`).join('\n');

  /** Sends via the configured provider. Resolves { ok } and never throws. */
  async function submitAnswers() {
    const cfg = C.submit || {};
    const data = payload();
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), cfg.timeoutMs || 12000);
    try {
      switch (cfg.provider) {
        case 'googleSheets':
          if (!cfg.googleSheetsUrl) throw new Error('googleSheetsUrl is empty');
          // text/plain keeps it a "simple" request (no CORS preflight); no-cors gives an opaque reply, so "didn't throw" = sent.
          await fetch(cfg.googleSheetsUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(data), signal: ctrl.signal });
          return { ok: true };
        case 'web3forms': {
          if (!cfg.web3formsKey) throw new Error('web3formsKey is empty');
          const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ access_key: cfg.web3formsKey, subject: cfg.subject, from_name: data.name, ...data }), signal: ctrl.signal });
          const j = await res.json().catch(() => ({}));
          if (!res.ok || j.success === false) throw new Error(j.message || `HTTP ${res.status}`);
          return { ok: true };
        }
        case 'formspree': {
          if (!cfg.formspreeId) throw new Error('formspreeId is empty');
          const res = await fetch(`https://formspree.io/f/${encodeURIComponent(cfg.formspreeId)}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ _subject: cfg.subject, ...data }), signal: ctrl.signal });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return { ok: true };
        }
        default:   // 'demo'
          await wait(cfg.demoDelayMs ?? 900);
          if (new URLSearchParams(location.search).get('rsvpfail') === '1') throw new Error('simulated failure (?rsvpfail=1)');
          return { ok: true, demo: true };
      }
    } catch (err) {
      console.warn('[rsvp] send failed', err);
      return { ok: false, error: err };
    } finally { clearTimeout(timer); }
  }

  function showFailure() {
    const f = C.failure, cfg = C.submit || {};
    const text = fill(cfg.fallbackMessage || '{summary}', { summary: summaryText() });
    const wa = `https://wa.me/${String(cfg.whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
    const mail = `mailto:${cfg.email || ''}?subject=${encodeURIComponent(cfg.subject || 'RSVP')}&body=${encodeURIComponent(text)}`;
    setSending(false);
    sound.play('chime');
    const box = document.createElement('div');
    box.className = 'rs-fail'; box.setAttribute('role', 'alert');
    box.innerHTML = `<h4>${maskWords(f.title, { gold: true })}</h4><p>${esc(f.body)}</p>
      <div class="rs-fail__btns">
        <button type="button" class="rs-btn rs-retry">${icon('refresh-cw', { size: 18 })}<span>${esc(f.retry)}</span></button>
        <a class="rs-btn rs-btn--ghost" href="${esc(wa)}" target="_blank" rel="noopener">${icon('message-circle', { size: 18 })}<span>${esc(f.whatsapp)}</span></a>
        <a class="rs-btn rs-btn--ghost" href="${esc(mail)}">${icon('mail', { size: 18 })}<span>${esc(f.email)}</span></a>
      </div>`;
    $('.rs-right', root).appendChild(box);
    if (gsap && !reduced()) { gsap.from(box, { autoAlpha: 0, y: 18, duration: 0.5, ease: 'power3.out' }); gsap.fromTo($$('.rs-w__i', box), { yPercent: 115 }, { yPercent: 0, duration: 0.8, ease: 'expo.out', stagger: 0.05 }); }
    $('.rs-retry', box).focus({ preventScroll: true });
    on($('.rs-retry', box), 'click', async () => {
      if (busy) return;
      busy = true;
      box.remove();
      setSending(true);
      const r2 = await submitAnswers();
      if (!r2.ok) { busy = false; showFailure(); return; }
      await finish(r2);
    });
  }

  /* ---------------- fold away + confirmation ---------------- */
  async function finish(res) {
    const yes = answers.attending !== false;
    store.set(DONE_KEY, { answers: JSON.parse(JSON.stringify(answers)), at: Date.now(), demo: !!res?.demo });
    store.remove(DRAFT_KEY);
    done = store.get(DONE_KEY, null);
    safe('emit', () => emit('rsvp', { attending: yes, name: answers.name }));
    if (useEnvelope() && !envEl.hidden) await flyOff();
    busy = false;
    showDone({ fresh: true, yes });
  }

  /** Confirmation panel. mode: fresh send, or "already replied" on page load. */
  function showDone({ fresh = false, yes } = {}) {
    const d = C.done;
    const a = fresh ? answers : (done?.answers || answers);
    yes = a.attending !== false;
    const name = firstName(a.name) || 'friend';
    const vars = { ...cityVars, name };
    const gl = yes ? (a.guestNames || []).slice(0, a.guests || 0) : [];
    const demo = (C.submit?.provider || 'demo') === 'demo';
    const mode = fresh ? (yes ? 'yes' : 'no') : 'already';
    card.hidden = true; doneEl.hidden = false;
    setHead(mode, !fresh ? true : false);
    setProgress(1.15);
    const ev = (site.events || []).find((e) => e.id === 'muhurtham') || (site.events || [])[0];
    const dateTxt = site.wedding.dateLabel;
    const place = `${site.wedding.venue?.name || ''}${site.wedding.venue?.name ? ', ' : ''}${site.wedding.city}`;
    const title = fresh ? (yes ? d.yesTitle : d.noTitle) : d.alreadyTitle || C.head.already.title;
    const body = fresh ? (yes ? d.yesBody : d.noBody) : (yes ? d.alreadyYesBody : d.alreadyNoBody);
    doneEl.innerHTML = `
      <span class="rs-card__frame" aria-hidden="true"></span>
      <div class="rs-done__seal">${waxSeal(site.couple.monogram)}</div>
      ${fresh ? '' : `<span class="rs-done__chip">${icon('badge-check', { size: 15 })} ${esc(d.alreadyChip)}</span>`}
      <h3 class="rs-done__title">${maskWords(fill(title, vars), { gold: true })}</h3>
      <p class="rs-done__body">${richText(fill(body, vars))}</p>
      <dl class="rs-done__facts">
        ${yes ? `<div><dt>${esc(d.when)}</dt><dd>${esc(dateTxt)}</dd></div><div><dt>${esc(d.where)}</dt><dd>${esc(place)}</dd></div><div><dt>${esc(d.with)}</dt><dd>${gl.length + 1}${gl.length ? '' : ''}</dd></div>` : `<div><dt>${esc(S.review.rows.name)}</dt><dd>${esc(a.name)}</dd></div>`}
      </dl>
      <div class="rs-done__btns">
        <button type="button" class="rs-btn rs-btn--ghost rs-edit">${icon('pen-line', { size: 18 })}<span>${esc(d.edit)}</span></button>
      </div>
      ${fresh && demo ? `<p class="rs-done__demo">${esc(d.demoNote)}</p>` : ''}`;
    on($('.rs-edit', doneEl), 'click', () => reopen());
    if (gsap && !reduced()) {
      gsap.fromTo(doneEl, { autoAlpha: 0, y: 40, scale: 0.97 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.9, ease: 'expo.out', clearProps: 'transform,opacity,visibility' });
      gsap.fromTo($$('.rs-w__i', doneEl), { yPercent: 115 }, { yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.06, delay: 0.25 });
      gsap.fromTo($$('.rs-done__seal, .rs-done__chip, .rs-done__body, .rs-done__facts, .rs-done__btns, .rs-done__demo', doneEl), { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', stagger: 0.08, delay: 0.3, clearProps: 'transform,opacity,visibility' });
    }
    if (fresh) {
      sound.play(yes ? 'success' : 'chime');
      const r = $('.rs-done__seal', doneEl).getBoundingClientRect();
      setTimeout(() => safe('celebrate', () => orbs.celebrate(r.left + r.width / 2, r.top + r.height / 2)), 250);
    }
  }

  /** "Edit & send again": back to the review step with the saved answers. */
  function reopen() {
    answers = Object.assign(blank(), done?.answers || answers);
    cur = 'review'; fromReview = false; sealed = false; busy = false; userMoved = true;
    doneEl.hidden = true; card.hidden = false;
    envEl.hidden = true; lockCard(false);
    if (gsap) gsap.set(card, { clearProps: 'all' });
    buildCard();
    setHead('ask');
    renderStep('review', 1, true);
    if (gsap && !reduced()) gsap.fromTo(card, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'expo.out', clearProps: 'transform,opacity,visibility' });
  }

  /* ===========================================================================================================
   *  BOOT
   * =========================================================================================================*/
  buildCard();
  if (done && !draft?.a?.name) {
    // came back after replying: show the "already replied" panel (edit / send again / add to calendar)
    showDone({ fresh: false });
  } else {
    const path = pathFor();
    if (cur === 'seal' || !path.includes(cur)) cur = cur === 'seal' ? 'review' : 'name';
    setHead('ask', true);
    renderStep(cur, 1, true);
    if (useEnvelope()) bootEnvelope();       // the reply starts as a closed envelope
  }

  // entrance: the card glides in the first time the section is on screen
  if (gsap && !reduced()) {
    gsap.set($('.rs-right', root), { autoAlpha: 0, y: 36 });
    const io = new IntersectionObserver((es) => {
      if (!es.some((e) => e.isIntersecting)) return;
      io.disconnect();
      gsap.to($('.rs-right', root), { autoAlpha: 1, y: 0, duration: 1.1, ease: 'expo.out', clearProps: 'transform,opacity,visibility' });
    }, { threshold: 0.2 });
    io.observe(root);
  }

  whileVisible(rs, {});
}
