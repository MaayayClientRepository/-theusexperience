/**
 * WELCOME TO KARUR (#karur): a one-screen bento that opens into a small editorial guide to the town.
 * Data: content/karur.js (all dummy / hedged, VERIFY) + site.wedding.venue. "Save to my plan" stars live in lib/store.js.
 */
import { html, raw, copyText, clamp } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { openSheet, bindCard, plusIcon } from '../core/sheet.js';
import { store } from '../lib/store.js';
import { toast } from '../core/toast.js';


/* ---------- one grounded scene per tile (inline SVG, decorative) ----------
   Every scene is drawn on a fixed canvas and shown with `meet`, anchored to the bottom of its panel, so the subject is never cropped.
   Sky and ground rectangles run far past the canvas (the panel clips them) so the scene always fills the panel edge to edge,
   and everything that stands (temple, palms, cup, car) is drawn ON a ground line. */
const reduceMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const EX = 3000;                                    // how far backdrops run past the canvas
const wave = (y, amp, per, x0 = -600, w = 3600) => { let d = `M${x0} ${y}`; for (let x = 0; x < w; x += per) d += ` q${per / 4} ${-amp} ${per / 2} 0 t${per / 2} 0`; return `${d} V${y + 400} H${x0}Z`; };
const ridge = (pts, fill, op = 1, floor = 400) => { const f = pts[0], l = pts[pts.length - 1]; return `<path d="M-${EX / 3} ${floor} L-${EX / 3} ${f[1]} ${pts.map(([x, y]) => `L${x} ${y}`).join(' ')} L${EX / 3} ${l[1]} L${EX / 3} ${floor}Z" fill="${fill}" opacity="${op}" stroke-linejoin="round"/>`; };
const backdrop = (id, h, groundY, stops, ground) => `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${h}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient></defs>
  <rect x="-${EX}" y="-${EX}" width="${EX * 2 + 600}" height="${groundY + EX}" fill="url(#${id})"/><rect x="-${EX}" y="${groundY}" width="${EX * 2 + 600}" height="${EX}" fill="${ground}"/>`;
const artSvg = (cls, vb, inner) => `<svg class="kr-art ${cls}" viewBox="${vb}" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">${inner}</svg>`;
const tuft = (x, y, k = 1) => `<path d="M${x} ${y} q${-3 * k} ${-7 * k} ${-5 * k} ${-9 * k} M${x} ${y} q0 ${-9 * k} ${1 * k} ${-12 * k} M${x} ${y} q${3 * k} ${-6 * k} ${6 * k} ${-8 * k}" fill="none" stroke="rgba(126,93,31,.45)" stroke-width="1.6" stroke-linecap="round"/>`;

/* glance: the gopuram stands on the Amaravathi bank (land strip), palms rooted beside it, river and gold glints below, sun and birds above */
const artGlance = () => {
  const cx = 190, base = 270, tw = (i) => 128 - i * 15, th = 27;
  const tiers = Array.from({ length: 7 }, (_, i) => {
    const w = tw(i), y = base - (i + 1) * th, n = Math.max(2, 6 - i), gap = (w - 34) / Math.max(1, n - 1);
    const wins = Array.from({ length: n }, (_, j) => `<path d="M${(cx - (w - 34) / 2 + (n === 1 ? 0 : j * gap) - 2.5).toFixed(1)} ${y + 20} v-8 a2.5 2.5 0 0 1 5 0 v8Z" fill="rgba(255,252,236,.85)"/>`).join('');
    return `<path d="M${cx - w / 2} ${y + th} h${w} l-5 ${-th} h${-(w - 10)}Z" fill="url(#kra-g1)" opacity="${(0.96 - i * 0.03).toFixed(2)}"/><path d="M${cx - w / 2 - 3} ${y + th} h${w + 6}" stroke="#8A6420" stroke-width="3" stroke-linecap="round"/>${wins}`;
  }).join('');
  const palm = (x, k, lean) => `<g transform="translate(${x} 296) scale(${k})"><path d="M0 0 q${lean * .3} -50 ${lean} -105" fill="none" stroke="#9C7326" stroke-width="5" stroke-linecap="round"/><g transform="translate(${lean} -105)" fill="#C79B3F">${[-170, -135, -100, -65, -30, 5].map((a) => `<path d="M0 0 q26 -30 64 -2 q-32 -8 -64 2Z" transform="rotate(${a})"/>`).join('')}<circle cx="-3" cy="6" r="3.6" fill="#7E5D1F"/><circle cx="4" cy="7" r="3.6" fill="#7E5D1F"/></g></g>`;
  const lamp = (x) => `<g><rect x="${x - 1.5}" y="252" width="3" height="44" fill="#7E5D1F"/><rect x="${x - 7}" y="290" width="14" height="6" rx="2" fill="#9C7326"/><path d="M${x - 6} 252 h12 l-3 -8 h-6Z" fill="#B68A33"/><ellipse cx="${x}" cy="238" rx="3.4" ry="6.5" fill="#FFE9A6" class="kr-flame"/><circle cx="${x}" cy="240" r="14" fill="rgba(255,226,140,.35)" class="kr-flame"/></g>`;
  const birds = [[430, 74, 1], [474, 56, .75], [512, 86, .65]].map(([x, y, k]) => `<path d="M${x} ${y} q${10 * k} ${-12 * k} ${20 * k} 0 q${10 * k} ${-12 * k} ${20 * k} 0" fill="none" stroke="rgba(126,93,31,.6)" stroke-width="2" stroke-linecap="round" class="kr-bird"/>`).join('');
  return artSvg('kr-art--glance', '30 10 540 350', `
    ${backdrop('kra-sky', 300, 296, [[0, '#FFFBEA'], [1, '#F5E2A6']], '#E6CE86')}
    <defs><linearGradient id="kra-g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EBD18A"/><stop offset="1" stop-color="#B68A33"/></linearGradient>
      <radialGradient id="kra-sun" cx="40%" cy="38%"><stop offset="0" stop-color="#FFFDF0"/><stop offset=".6" stop-color="#F6E3A2"/><stop offset="1" stop-color="#E3C26E"/></radialGradient>
      <radialGradient id="kra-halo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="rgba(255,236,170,.75)"/><stop offset="1" stop-color="rgba(255,236,170,0)"/></radialGradient>
      <linearGradient id="kra-land" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9D49A"/><stop offset="1" stop-color="#D5B669"/></linearGradient>
      <linearGradient id="kra-wat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(227,194,110,.7)"/><stop offset="1" stop-color="rgba(227,194,110,.14)"/></linearGradient></defs>
    <circle cx="448" cy="138" r="104" fill="url(#kra-halo)" class="kr-sunglow"/><circle cx="448" cy="138" r="48" fill="url(#kra-sun)"/>
    ${ridge([[0, 262], [90, 246], [200, 266], [330, 244], [450, 264], [560, 248], [600, 258]], 'rgba(203,162,74,.22)', 1, 300)}
    <g fill="rgba(255,255,255,.85)" class="kr-cloud"><ellipse cx="96" cy="64" rx="34" ry="9"/><ellipse cx="124" cy="56" rx="22" ry="8"/><ellipse cx="300" cy="40" rx="30" ry="8"/><ellipse cx="326" cy="33" rx="18" ry="7"/></g>
    ${birds}
    <rect x="-${EX}" y="296" width="${EX * 2 + 600}" height="18" fill="url(#kra-land)"/><path d="M-${EX} 296 H${EX}" stroke="rgba(126,93,31,.35)" stroke-width="1.5"/>
    ${[30, 72, 250, 318, 372, 560].map((x, i) => tuft(x, 296, .8 + (i % 3) * .15)).join('')}
    <g class="kr-river"><rect x="-${EX}" y="314" width="${EX * 2 + 600}" height="${EX}" fill="url(#kra-wat)"/>
      <path class="kr-w kr-w1" d="${wave(320, 7, 150)}" fill="rgba(227,194,110,.4)"/><path class="kr-w kr-w2" d="${wave(334, 6, 120)}" fill="rgba(203,162,74,.3)"/><path class="kr-w kr-w3" d="${wave(348, 5, 100)}" fill="rgba(182,138,51,.3)"/></g>
    ${[326, 340, 354].map((y, i) => `<path d="M40 ${y} h50 M170 ${y + 3} h70 M330 ${y - 1} h60 M470 ${y + 2} h46" stroke="rgba(255,255,255,.8)" stroke-width="2" stroke-linecap="round" stroke-dasharray="1 8" class="kr-glint" style="--i:${i}"/>`).join('')}
    <ellipse cx="${cx}" cy="296" rx="100" ry="5" fill="rgba(126,93,31,.22)"/>
    ${lamp(92)}${lamp(288)}
    <g>
      <rect x="${cx - 78}" y="272" width="156" height="24" rx="3" fill="#9C7326"/><rect x="${cx - 70}" y="${base - 6}" width="140" height="8" rx="2" fill="#B68A33"/>
      <path d="M${cx - 14} 296 v-16 a14 14 0 0 1 28 0 v16Z" fill="#4A3410"/><circle cx="${cx}" cy="284" r="6" fill="rgba(255,226,140,.65)" class="kr-flame"/>
      ${[-58, -44, 44, 58].map((dx) => `<rect x="${cx + dx - 2.5}" y="278" width="5" height="18" rx="2" fill="rgba(255,243,196,.55)"/>`).join('')}
      ${tiers}
      <path d="M${cx - 24} ${base - 7 * th} q24 -26 48 0 v8 h-48Z" fill="#C79B3F"/><path d="M${cx - 24} ${base - 7 * th + 8} h48" stroke="#8A6420" stroke-width="2.5"/>
      <rect x="${cx - 1}" y="${base - 7 * th - 34}" width="2" height="30" fill="#9C7326"/>${[-13, 0, 13].map((dx, i) => `<ellipse cx="${cx + dx}" cy="${base - 7 * th - (i === 1 ? 6 : 0) - 4}" rx="4" ry="9" fill="#F3DC96" stroke="#9C7326" stroke-width="1.5"/>`).join('')}
    </g>
    ${palm(402, 1.08, 14)}${palm(456, .78, -10)}${palm(518, 1, 12)}`);
};

/* sights: three hill ridges with a tea-terrace contour, pines, map pins on the peaks, a trail across the meadow in front */
const artSights = () => {
  const pine = (x, y, k) => `<path d="M${x} ${y} l${-9 * k} ${22 * k} h${18 * k}Z M${x} ${y + 12 * k} l${-12 * k} ${24 * k} h${24 * k}Z" fill="rgba(90,65,21,.6)"/><rect x="${x - 1.5 * k}" y="${y + 36 * k}" width="${3 * k}" height="${7 * k}" fill="rgba(90,65,21,.65)"/>`;
  const pin = (x, y, i) => `<g transform="translate(${x} ${y})"><g class="kr-pinbob" style="--i:${i}"><path d="M0 0 c-9 -10 -12 -16 -12 -22 a12 12 0 0 1 24 0 c0 6 -3 12 -12 22Z" fill="#FFF8DC" stroke="#8A6420" stroke-width="2"/><circle cy="-22" r="4.6" fill="#CBA24A"/></g><ellipse cy="1" rx="7" ry="2" fill="rgba(90,65,21,.3)"/></g>`;
  const wp = [[70, 224], [250, 214], [470, 222], [690, 216]];
  return artSvg('kr-art--sights', '0 20 800 220', `
    ${backdrop('kra-sky2', 210, 206, [[0, '#FFF9E4'], [1, '#F6E4AC']], '#C49A43')}
    <defs><linearGradient id="kra-h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E7C970"/><stop offset="1" stop-color="#F6E6B4"/></linearGradient>
      <linearGradient id="kra-med" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9B85E"/><stop offset="1" stop-color="#C9A24C"/></linearGradient>
      <linearGradient id="kra-mead" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9A24C"/><stop offset="1" stop-color="#B68A33"/></linearGradient></defs>
    <circle cx="610" cy="78" r="50" fill="rgba(246,214,120,.5)"/><circle cx="610" cy="78" r="29" fill="#FFF3C4"/>
    <g fill="rgba(255,255,255,.9)" class="kr-cloud"><ellipse cx="150" cy="52" rx="36" ry="9"/><ellipse cx="180" cy="44" rx="22" ry="8"/><ellipse cx="400" cy="36" rx="40" ry="9"/><ellipse cx="432" cy="28" rx="24" ry="8"/></g>
    ${ridge([[0, 150], [90, 112], [180, 146], [280, 84], [370, 140], [480, 98], [590, 150], [700, 104], [800, 146]], 'url(#kra-h)', .75, 220)}
    ${ridge([[0, 176], [120, 140], [220, 172], [330, 126], [440, 170], [560, 134], [680, 176], [800, 148]], '#DDBB62', .85, 220)}
    <g fill="none" stroke="rgba(255,255,255,.6)" stroke-width="1.5">${[0, 1, 2, 3].map((i) => `<path d="M${380 + i * 8} ${150 + i * 9} q54 ${-18 + i * 3} 120 0 t130 0"/>`).join('')}</g>
    ${ridge([[0, 196], [140, 172], [260, 198], [400, 176], [540, 200], [680, 178], [800, 194]], 'url(#kra-med)', 1, 230)}
    ${pin(120, 140, 0)}${pin(330, 126, 1)}${pin(560, 134, 2)}${pin(280, 84, 3)}
    ${pine(130, 160, 1)}${pine(160, 168, .8)}${pine(648, 164, 1)}${pine(680, 172, .75)}${pine(40, 172, .7)}
    <rect x="-${EX}" y="206" width="${EX * 2 + 800}" height="${EX}" fill="url(#kra-mead)"/><path d="M-${EX} 206 H${EX}" stroke="rgba(255,255,255,.4)" stroke-width="1.5"/>
    <path d="M-120 226 C40 214 110 232 250 214 S420 228 470 222 S640 212 690 216 S820 224 920 218" fill="none" stroke="rgba(255,255,255,.95)" stroke-width="2.4" stroke-dasharray="2 9" stroke-linecap="round" class="kr-trail"/>
    ${wp.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5.4" fill="#FFF8DC" stroke="#7E5D1F" stroke-width="1.8"/>`).join('')}
    ${[30, 180, 330, 560, 760].map((x, i) => tuft(x, 236, .9 + (i % 2) * .2)).join('')}`);
};

/* eat: a steel tumbler and dabara beside a plate of laddus, on a banana-leaf placemat laid on a wooden table */
const artEat = () => {
  const ladu = (x, y) => `<circle cx="${x}" cy="${y}" r="10.5" fill="#E7A53A" stroke="#B87B1E" stroke-width="1.4"/><g fill="rgba(255,236,170,.8)">${[[-4, -3], [3, -4], [-1, 3], [5, 2], [-5, 3]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="1"/>`).join('')}</g>`;
  return artSvg('kr-art--eat', '34 14 296 136', `
    ${backdrop('kra-wall', 122, 120, [[0, '#F9EBC0'], [1, '#EBCF86']], '#6B4220')}
    <defs><linearGradient id="kra-steel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E6D9AF"/><stop offset=".42" stop-color="#FFFBEA"/><stop offset="1" stop-color="#C5A95E"/></linearGradient>
      <linearGradient id="kra-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8A5A2A"/><stop offset="1" stop-color="#5A3512"/></linearGradient></defs>
    <rect x="-${EX}" y="120" width="${EX * 2 + 600}" height="${EX}" fill="url(#kra-wood)"/><path d="M-${EX} 120 H${EX}" stroke="rgba(255,236,170,.55)" stroke-width="2"/>
    <g stroke="rgba(255,236,170,.14)" stroke-width="1.2" fill="none"><path d="M-200 132 H700 M-200 141 H700"/></g>
    <g fill="rgba(255,255,255,.35)" opacity=".8">${[40, 90, 150, 215, 280, 330].map((x, i) => `<circle cx="${x}" cy="${26 + (i % 3) * 22}" r="1.6"/>`).join('')}</g>
    <path d="M26 132 C60 116 130 112 190 113 C260 112 320 116 340 130 C300 142 80 144 26 132Z" fill="#5C8A3A"/><path d="M26 132 C60 120 130 116 190 117 C260 116 320 120 340 130" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="1.6"/>
    ${[0, 1, 2, 3, 4].map((i) => `<path d="M${72 + i * 50} 137 l16 -12" stroke="rgba(255,255,255,.22)" stroke-width="1.4"/>`).join('')}
    <ellipse cx="114" cy="126" rx="56" ry="5" fill="rgba(40,24,8,.3)"/><ellipse cx="252" cy="126" rx="48" ry="5" fill="rgba(40,24,8,.3)"/>
    <g class="kr-steam" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="3" stroke-linecap="round">
      <path d="M102 54 q-8 -11 0 -21 q8 -10 0 -21" style="--i:0"/><path d="M116 56 q-8 -11 0 -21 q8 -10 0 -21" style="--i:1"/><path d="M130 54 q-8 -11 0 -21 q8 -10 0 -21" style="--i:2"/></g>
    <path d="M62 112 h104 l-9 10 q-3 4 -9 4 h-68 q-6 0 -9 -4Z" fill="url(#kra-steel)" stroke="#7E5D1F" stroke-width="2"/>
    <ellipse cx="114" cy="112" rx="52" ry="6.5" fill="#4B2E10" stroke="#7E5D1F" stroke-width="2"/><ellipse cx="114" cy="111" rx="44" ry="4" fill="#7A4A1D"/>
    <path d="M92 62 h44 l-5 48 q-.5 4 -4 4 h-26 q-3.5 0 -4 -4Z" fill="url(#kra-steel)" stroke="#7E5D1F" stroke-width="2"/>
    <ellipse cx="114" cy="62" rx="22" ry="4" fill="#F7EBC8" stroke="#7E5D1F" stroke-width="2"/><ellipse cx="114" cy="62.5" rx="17" ry="2.4" fill="#C98C4A"/>
    <path d="M96 76 h36 M97 92 h34" stroke="rgba(126,93,31,.35)" stroke-width="1.6"/><path d="M99 68 l3 38" stroke="rgba(255,255,255,.9)" stroke-width="4" stroke-linecap="round" opacity=".7"/>
    <ellipse cx="252" cy="118" rx="46" ry="7" fill="#FFFBEA" stroke="#B8962E" stroke-width="1.6"/><ellipse cx="252" cy="117" rx="36" ry="4.6" fill="#F3E7BF"/>
    ${ladu(238, 108)}${ladu(263, 108)}${ladu(250.5, 92)}
    <g transform="translate(300 112)"><g fill="#FFFDF3" stroke="rgba(126,93,31,.4)" stroke-width=".8">${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-4.4" rx="2.6" ry="4.4" transform="rotate(${a})"/>`).join('')}</g><circle r="1.8" fill="#E3C26E"/></g>`);
};

/* trips: a night road winding past hills towards a temple town, a car on it, signposts and the lights of villages */
const artTrips = () => {
  const road = 'M-340 134 C-160 134 -40 122 70 126 S230 138 310 122 S470 108 720 120';
  const run = 'M-10 130 C20 130 40 124 70 126 S230 138 310 122 S350 114 380 112';
  const stars = Array.from({ length: 30 }, (_, i) => [-120 + ((i * 97) % 600), 6 + ((i * 53) % 78), 0.8 + (i % 4) * 0.28]).map(([x, y, r], i) => `<circle cx="${x}" cy="${y}" r="${r.toFixed(2)}" fill="#F6E6B4" class="kr-star-tw" style="--i:${i % 9}"/>`).join('');
  const post = (x, y) => `<g transform="translate(${x} ${y})"><rect x="-1" y="-24" width="2" height="26" fill="#B68A33"/><path d="M1 -24 h20 l-5 6 l5 6 h-20Z" fill="#E3C26E"/><rect x="-12" y="-16" width="13" height="8" rx="1" fill="#F6E6B4" opacity=".9"/></g>`;
  const village = [[40, 104], [64, 107], [180, 108], [208, 104], [262, 106], [330, 100]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#FFE9A6" class="kr-star-tw" style="--i:${i}"/>`).join('');
  return artSvg('kr-art--trips', '0 0 360 150', `
    ${backdrop('kra-night', 120, 112, [[0, '#120F0B'], [1, '#2C2217']], '#0F0C08')}
    <defs><radialGradient id="kra-m" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="rgba(246,214,120,.5)"/><stop offset="1" stop-color="rgba(246,214,120,0)"/></radialGradient></defs>
    ${stars}
    <circle cx="292" cy="36" r="40" fill="url(#kra-m)"/><circle cx="292" cy="36" r="17" fill="#F6E6B4"/><circle cx="299" cy="31" r="15" fill="#171209"/>
    ${ridge([[0, 98], [60, 78], [120, 96], [200, 66], [270, 94], [330, 74], [360, 90]], 'rgba(227,194,110,.11)', 1, 130)}
    <g transform="translate(60 80)" fill="rgba(227,194,110,.5)"><path d="M-10 0 h20 l-2 -8 h-16Z M-8 -8 h16 l-2 -7 h-12Z M-6 -15 h12 l-2 -6 h-8Z"/><rect x="-0.8" y="-27" width="1.6" height="6"/></g>
    ${ridge([[0, 110], [90, 96], [170, 112], [260, 98], [360, 108]], 'rgba(227,194,110,.16)', 1, 130)}
    ${village}
    <path d="M-${EX} 112 H${EX}" stroke="rgba(227,194,110,.25)" stroke-width="1"/>
    <path d="${road}" fill="none" stroke="rgba(227,194,110,.3)" stroke-width="26" stroke-linecap="round"/>
    <path d="${road}" fill="none" stroke="#1F1912" stroke-width="21" stroke-linecap="round"/>
    <path d="${road}" fill="none" stroke="#F6E6B4" stroke-width="2" stroke-dasharray="8 10" stroke-linecap="round" class="kr-roaddash"/>
    ${post(120, 117)}${post(254, 120)}
    <g${reduceMotion ? ' transform="translate(150 133)"' : ''}><g transform="translate(0 -7)"><path d="M-30 4 L0 -5 L0 13Z" fill="rgba(255,243,196,.28)" transform="translate(14 0)"/><rect x="-12" y="-3" width="26" height="9" rx="3.5" fill="#F6E6B4"/><path d="M-6 -3 l3 -6 h12 l4 6Z" fill="#E3C26E"/><circle cx="-6" cy="7" r="3.4" fill="#0F0C08" stroke="#CBA24A" stroke-width="1.2"/><circle cx="8" cy="7" r="3.4" fill="#0F0C08" stroke="#CBA24A" stroke-width="1.2"/><circle cx="14" cy="1" r="1.8" fill="#FFF3C4"/></g>${reduceMotion ? '' : `<animateMotion dur="11s" repeatCount="indefinite" path="${run}" rotate="auto"/>`}</g>`);
};

const PLAN_KEY = 'karurPlan';
const dirUrl = (V, q) => `https://www.google.com/maps/dir/?api=1&origin=${V.lat},${V.lng}&destination=${encodeURIComponent(q)}`;
const mapUrl = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

export function mount(el, ctx) {
  const site = ctx.site || {}, C = ctx.content?.karur || {};
  const V = site.wedding?.venue || {};
  const G = C.glance || {}, sights = C.sights || [], trips = C.trips || [], eat = C.eat?.items || [];

  /* ---------- the places that can be saved ---------- */
  const places = new Map();
  sights.forEach((s) => places.set(s.id, { id: s.id, name: s.name, kind: s.kind, far: `~${s.km} km`, q: s.q }));
  trips.forEach((s) => places.set(s.id, { id: s.id, name: s.name, kind: 'Day trip', far: `~${s.km} km · ${s.time}`, q: s.q }));
  eat.forEach((s) => places.set(s.id, { id: s.id, name: s.name, kind: 'Eat & shop', far: 'In town', q: `${s.name}, Karur` }));

  let plan = (store.get(PLAN_KEY, []) || []).filter((id) => places.has(id));
  const subs = new Set();
  const savePlan = () => { store.set(PLAN_KEY, plan); subs.forEach((f) => f()); };
  const toggle = (id) => { plan = plan.includes(id) ? plan.filter((x) => x !== id) : [...plan, id]; savePlan(); return plan.includes(id); };

  const starBtn = (id, name) => `<button class="kr-star" type="button" data-star="${id}" aria-pressed="${plan.includes(id)}" aria-label="Save ${String(name).replace(/"/g, '&quot;')} to my plan">${icon('star', { size: 18, stroke: 1.8 })}<span>${plan.includes(id) ? 'Saved' : 'Save'}</span></button>`;
  const wireStars = (root) => {
    const sync = () => root.querySelectorAll('[data-star]').forEach((b) => { const on = plan.includes(b.dataset.star); b.setAttribute('aria-pressed', String(on)); b.lastElementChild.textContent = on ? 'Saved' : 'Save'; });
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-star]'); if (!b) return;
      e.stopPropagation();
      const on = toggle(b.dataset.star);
      toast(on ? 'Saved to your Karur plan' : 'Removed from your plan');
    });
    subs.add(sync); sync();
    return () => subs.delete(sync);
  };
  const reveal = (api) => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { root: api.scroller, threshold: .12 });
    api.body.querySelectorAll('.kr-rv').forEach((n) => io.observe(n));
    return () => io.disconnect();
  };
  const sheetOpts = (title, build, extra = {}) => () => {
    const node = document.createElement('div'); node.className = `kr-sheet ${extra.cls || ''}`; node.innerHTML = String(build());
    let offs = [];
    return { title, size: extra.size || 'default', node, onOpen: (api) => { offs = [wireStars(node), reveal(api)]; extra.after && extra.after(api, node); }, onClose: () => offs.forEach((f) => f && f()) };
  };

  /* ---------- the condensed face of every tile: header, scene panel, footer with detail chips ---------- */
  const H = C.head || {}, T = C.tiles || {};
  const chips = (items) => `<ul class="kr-chips">${items.map(([b, t]) => `<li>${b ? `<b>${b}</b>` : ''}${t}</li>`).join('')}</ul>`;
  const range = (a) => { const n = a.map((x) => x.km); return `${Math.min(...n)}–${Math.max(...n)}`; };
  const hills = sights.filter((s) => /hill/i.test(s.kind)).length;
  const tile = (k, no, title, sub, art, foot) => html`
      <article class="card kr-card kr-${k}" data-k="${k}" aria-label="${title}">
        <header class="kr-card__head"><span class="kr-no">${no}</span><h3 class="kr-card__title">${title}</h3><p class="kr-sub">${sub}</p></header>
        <div class="kr-scene">${raw(art)}</div>
        <footer class="kr-foot">${raw(chips(foot))}${raw(plusIcon())}</footer>
      </article>`;

  el.innerHTML = String(html`
    <header class="screen__head">
      <div><p class="eyebrow">${H.eyebrow}</p><h2 class="kr-title">${H.title?.[0]}<em class="gold">${H.title?.[1]}</em></h2></div>
      <div class="kr-headr"><p class="screen__lead kr-lead">${H.lead}</p>
        <button class="chip kr-planchip" type="button" data-plan aria-label="My Karur plan">${raw(icon('star', { size: 16, stroke: 1.8 }))} <span>${C.plan?.title || 'My Karur plan'}</span><b data-count>0</b></button></div>
    </header>
    <div class="stage kr-bento">
      ${tile('glance', '01', G.label, T.glance, artGlance(), [])}
      ${tile('sights', '02', 'Sights & getaways', T.sights, artSights(), [[sights.length, 'places'], [range(sights), 'km out'], [hills, 'hill stations']])}
      ${tile('eat', '03', 'Eat & shop', T.eat, artEat(), [[eat.length, 'to try'], ['', eat.find((e) => e.id === 'coffee')?.short || 'Coffee']])}
      ${tile('trips', '04', 'Day trips', T.trips, artTrips(), [[trips.length, 'trips'], [range(trips), 'km']])}
    </div>`);

  const q = (k) => el.querySelector(`[data-k="${k}"]`);
  const chip = el.querySelector('[data-plan]');
  const syncChip = () => { const n = el.querySelector('[data-count]'); n.textContent = plan.length; chip.classList.toggle('has', plan.length > 0); };
  subs.add(syncChip); syncChip();

  el.querySelectorAll('.kr-card').forEach((c) => {
    c.classList.add('is-live');
    c.addEventListener('pointermove', (e) => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', `${e.clientX - r.left}px`); c.style.setProperty('--my', `${e.clientY - r.top}px`); }, { passive: true });
  });

  /* ================= (a) glance ================= */
  bindCard(q('glance'), sheetOpts(G.label || 'Karur', () => html`
    <p class="eyebrow">Karur at a glance</p>
    <h2 class="kr-h1">A river town with <em class="gold">good taste</em>.</h2>
    <p class="kr-lede">${G.paragraph}</p>
    <div class="kr-story">${(G.story || []).map((s, i) => html`<article class="kr-rv" style="--i:${i}"><span class="kr-lab">0${i + 1}</span><h3>${s.h}</h3><p>${s.p}</p></article>`)}</div>
    <dl class="kr-facts">${(G.facts || []).map(([k, v]) => html`<div class="kr-rv"><dt>${k}</dt><dd>${v}</dd></div>`)}</dl>`));

  /* ================= (b) sights ================= */
  const R0 = 78, RMAX = 252, KMAX = Math.max(...sights.map((s) => s.km), 1);
  const rOf = (km) => R0 + (RMAX - R0) * Math.sqrt(km / KMAX);
  const pos = (s) => { const a = ((s.bearing - 90) * Math.PI) / 180, r = rOf(s.km); return [300 + Math.cos(a) * r, 300 + Math.sin(a) * r]; };
  const radial = () => `<svg class="kr-radial" viewBox="-70 0 740 600" role="img" aria-label="Diagram of sights around the venue, by approximate distance">
    <defs><radialGradient id="kr-pin" cx="34%" cy="28%" r="78%"><stop offset="0" stop-color="#FFFDF0"/><stop offset=".35" stop-color="#F6E6B4"/><stop offset=".7" stop-color="#E3C26E"/><stop offset="1" stop-color="#B68A33"/></radialGradient>
    <radialGradient id="kr-halo"><stop offset="0" stop-color="rgba(246,214,120,.8)"/><stop offset="1" stop-color="rgba(246,214,120,0)"/></radialGradient></defs>
    ${[5, 50, 150].map((km) => `<circle cx="300" cy="300" r="${rOf(km).toFixed(1)}" fill="none" stroke="rgba(126,93,31,.3)" stroke-dasharray="2 6"/><text x="300" y="${(300 - rOf(km) - 6).toFixed(1)}" class="kr-rt" text-anchor="middle">${km} km</text>`).join('')}
    <line x1="300" y1="20" x2="300" y2="580" stroke="rgba(126,93,31,.14)"/><line x1="20" y1="300" x2="580" y2="300" stroke="rgba(126,93,31,.14)"/>
    ${sights.map((s, i) => { const [x, y] = pos(s); const left = x < 300; return `
      <line class="kr-ray" pathLength="1" x1="300" y1="300" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" style="--i:${i}"/>
      <a class="kr-node" href="#kr-s-${s.id}" data-go="kr-s-${s.id}" style="--i:${i}" aria-label="${s.name}, about ${s.km} kilometres">
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="34" fill="url(#kr-halo)"/>
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="11" fill="url(#kr-pin)" stroke="rgba(255,255,255,.7)"/>
        <text x="${(x + (left ? -20 : 20)).toFixed(1)}" y="${(y - 2).toFixed(1)}" text-anchor="${left ? 'end' : 'start'}" class="kr-nt">${s.short}</text>
        <text x="${(x + (left ? -20 : 20)).toFixed(1)}" y="${(y + 15).toFixed(1)}" text-anchor="${left ? 'end' : 'start'}" class="kr-nk">${s.km} km</text></a>`; }).join('')}
    <circle cx="300" cy="300" r="64" fill="url(#kr-halo)"/><circle cx="300" cy="300" r="18" fill="url(#kr-pin)" stroke="#fff"/>
    <text x="300" y="344" text-anchor="middle" class="kr-nt">${V.name || 'The venue'}</text></svg>`;
  bindCard(q('sights'), sheetOpts('Sights & getaways', () => html`
    <div class="kr-sights-sheet">
      <div class="kr-sights-sheet__map"><p class="eyebrow">From the venue</p><h2 class="kr-h1">Sights <em class="gold">&amp;</em> getaways</h2>${raw(radial())}</div>
      <ol class="kr-places">${sights.map((s, i) => html`
        <li id="kr-s-${s.id}" class="kr-place kr-rv" style="--i:${i}">
          <div class="kr-place__n"><b>${s.km}</b><span>km<i>approx.</i></span></div>
          <div class="kr-place__t"><span class="kr-lab">${s.kind}</span><h3>${s.name}</h3><p>${s.why}</p>
            <div class="kr-place__act"><a class="btn btn--sm" href="${dirUrl(V, s.q)}" target="_blank" rel="noopener">${raw(icon('navigation', { size: 15 }))} Directions</a>
              <a class="btn btn--sm btn--ghost" href="${mapUrl(s.q)}" target="_blank" rel="noopener">${raw(icon('map-pin', { size: 15 }))} Maps</a>${raw(starBtn(s.id, s.name))}</div></div>
        </li>`)}</ol>
    </div>`, { size: 'wide', cls: 'kr-sheet--sights', after: (api, node) => {
    node.querySelectorAll('[data-go]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); const t = node.querySelector('#' + a.dataset.go); t && api.scroller.scrollTo({ top: t.offsetTop + node.offsetTop - 90, behavior: 'smooth' }); }));
    requestAnimationFrame(() => node.querySelector('.kr-radial')?.classList.add('is-in'));
  } }));

  /* ================= (c) eat & shop ================= */
  bindCard(q('eat'), sheetOpts('Eat & shop', () => html`
    <p class="eyebrow">Eat &amp; shop</p><h2 class="kr-h1">Come hungry. <em class="gold">Leave with a bag.</em></h2>
    <ol class="kr-eatlist">${eat.map((e, i) => html`
      <li class="kr-rv" style="--i:${i}"><span class="kr-eatlist__n">0${i + 1}</span>
        <div class="kr-eatlist__t"><h3>${e.name}</h3><p>${e.text}</p><p class="kr-tip">${e.tip}</p>${raw(starBtn(e.id, e.name))}</div>
        <span class="kr-orb">${raw(icon(e.icon, { size: 26, stroke: 1.6 }))}</span></li>`)}</ol>`, { size: 'narrow' }));

  /* ================= (d) day trips ================= */
  const TMAX = Math.max(...trips.map((t) => t.km), 1);
  bindCard(q('trips'), sheetOpts('Day trips', () => html`
    <p class="eyebrow">Further afield</p>
    <p class="kr-lede">Karur is well placed for day trips. Distances are by road from the venue, approximately.</p>
    <ol class="kr-route">
      <li class="kr-route__start"><i class="kr-pin kr-pin--lg"></i><div><span class="kr-lab">Start</span><h3>${V.name} · Karur</h3></div></li>
      ${trips.slice().sort((a, b) => a.km - b.km).map((t, i) => html`
        <li class="kr-rv kr-stop" style="--i:${i};--k:${(t.km / TMAX).toFixed(3)}"><i class="kr-pin"></i>
          <div class="kr-stop__c">
            <div class="kr-stop__n"><b>${t.km}</b><span>km<i>${t.time}</i></span></div>
            <div class="kr-stop__t"><span class="kr-lab">${t.sub}</span><h3>${t.name}</h3><p>${t.why}</p>
              <div class="kr-bar"><i></i></div>
              <div class="kr-place__act"><a class="btn btn--sm" href="${dirUrl(V, t.q)}" target="_blank" rel="noopener">${raw(icon('navigation', { size: 15 }))} Directions</a>${raw(starBtn(t.id, t.name))}</div></div>
          </div></li>`)}
    </ol>`, { size: 'default', cls: 'kr-sheet--trips' }));

  /* ================= my plan ================= */
  const planText = () => {
    const lines = plan.map((id, i) => { const p = places.get(id); return `${i + 1}. ${p.name} (${p.far})`; });
    return `${C.plan?.shareIntro || 'My Karur plan:'}\n${lines.join('\n')}\n\nWedding venue: ${V.address || ''}`;
  };
  bindCard(chip, () => {
    const node = document.createElement('div'); node.className = 'kr-sheet kr-sheet--plan';
    const render = () => {
      node.innerHTML = String(html`
        <p class="eyebrow">Saved places</p><h2 class="kr-h1">${C.plan?.title || 'My Karur plan'}</h2>
        ${plan.length ? html`
          <ol class="kr-planlist">${plan.map((id) => { const p = places.get(id); return html`<li><div><span class="kr-lab">${p.kind} · ${p.far}</span><h3>${p.name}</h3></div>
            <div class="kr-place__act"><a class="btn btn--sm btn--ghost" href="${mapUrl(p.q)}" target="_blank" rel="noopener">${raw(icon('map-pin', { size: 15 }))} Maps</a>${raw(starBtn(id, p.name))}</div></li>`; })}</ol>
          <div class="kr-place__act kr-place__act--lg"><button class="btn" type="button" data-copy>${raw(icon('copy', { size: 16 }))} Copy list</button>
            <a class="btn btn--ghost" data-wa href="https://wa.me/?text=${encodeURIComponent(planText())}" target="_blank" rel="noopener">${raw(icon('message-circle', { size: 16 }))} Share on WhatsApp</a></div>`
          : html`<p class="kr-empty">${C.plan?.empty}</p>`}`);
      node.querySelector('[data-copy]')?.addEventListener('click', async () => toast((await copyText(planText())) ? 'Plan copied' : 'Could not copy'));
    };
    render();
    return { title: 'My Karur plan', size: 'narrow', node, onOpen: () => { const f = () => render(); subs.add(f); node.addEventListener('click', (e) => { const b = e.target.closest('[data-star]'); if (b) { e.stopPropagation(); toggle(b.dataset.star); } }); node._off = () => subs.delete(f); }, onClose: () => node._off && node._off() };
  });

  return () => subs.clear();
}
