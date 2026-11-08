/**
 * KALYANAM · sound — a tiny WebAudio synthesiser. Zero audio files: every sound is built from oscillators,
 * filtered noise and envelopes, tuned to be soft and warm (temple bells, paper, little chimes).
 *
 *   sound.play('bell')                        sound.play('pop', { volume: 0.6, pitch: 1.2 })
 *   sound.toggle() -> bool                    sound.setEnabled(true)            sound.enabled
 *   sound.unlock()                            // inside a tap/click/key handler (core already does this globally)
 *
 * - Muted by default. The choice is remembered (store 'sound') and announced with emit('sound', { enabled }).
 * - The AudioContext is created lazily, only once the visitor has interacted with the page, so browsers never
 *   log autoplay warnings. It sleeps while the tab is hidden or the sound is off.
 * - play() is a silent no-op while muted, while the tab is hidden, or for unknown names. Rapid repeats of the
 *   same sound are rate-limited (e.g. 'type' every 35 ms) and at most 14 voices overlap.
 * - Everything goes through a gentle lowpass and a soft-knee limiter, so stacked sounds never clip.
 *
 * names:  chime bell pop tick whoosh success sad paper stamp sparkle type drum flip swoosh-up boop fanfare
 * extras: knock (wooden door) · chirp (parrot) · plop (food landing on a leaf) · coin
 * aliases: ding→chime · click→tick · swoosh→whoosh · tweet→chirp · thud→stamp
 */
import { emit, clamp } from './dom.js';
import { store } from './store.js';

const AC = window.AudioContext || window.webkitAudioContext;
const MASTER = 0.85;
const MAX_VOICES = 14;
/** Minimum ms between two plays of the same sound. */
const GAP = { type: 35, tick: 45, pop: 45, paper: 60, flip: 60, plop: 60, coin: 60, boop: 70, drum: 70, knock: 80, sparkle: 90, chirp: 90 };
const DEFAULT_GAP = 70;
/** Per-sound loudness balance (measured offline with renderSound; low thumps can peak higher than airy noise). */
const TRIM = {
  drum: 0.68, bell: 0.84, stamp: 0.83, knock: 0.78, boop: 0.79, pop: 0.76, plop: 0.81, chime: 1.05,
  fanfare: 1.4, success: 1.6, sad: 1.35, tick: 0.67, paper: 1.1, type: 0.62, coin: 1.65, flip: 1.38,
  chirp: 1.68, whoosh: 1.8, sparkle: 1.47, 'swoosh-up': 1.93,
};
const ALIASES = { ding: 'chime', click: 'tick', swoosh: 'whoosh', tweet: 'chirp', thud: 'stamp' };

/* --------------------------------------------------------------------------
   Building blocks — a "kit" per AudioContext (live or offline)
   -------------------------------------------------------------------------- */
const kits = new WeakMap();
function kitFor(ac) {
  let k = kits.get(ac);
  if (k) return k;
  let noiseBuf = null;
  const noiseBuffer = () => {
    if (!noiseBuf) {
      const len = Math.round(ac.sampleRate * 1.5);
      noiseBuf = ac.createBuffer(1, len, ac.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    return noiseBuf;
  };
  k = {
    ac,
    gain(v, dest) { const g = ac.createGain(); g.gain.value = v; if (dest) g.connect(dest); return g; },
    osc(type, f, t0, t1, dest) {
      const o = ac.createOscillator();
      o.type = type;
      o.frequency.setValueAtTime(f, t0);
      if (dest) o.connect(dest);
      o.start(t0);
      o.stop(t1);
      return o;
    },
    noise(t0, dur, dest) {
      const s = ac.createBufferSource();
      s.buffer = noiseBuffer();
      s.connect(dest);
      const room = s.buffer.duration - dur - 0.01;
      s.start(t0, room > 0 ? Math.random() * room : 0, dur);
      return s;
    },
    filter(type, f, q, dest, t) {
      const b = ac.createBiquadFilter();
      b.type = type;
      b.frequency.setValueAtTime(f, t ?? ac.currentTime);
      b.Q.value = q;
      if (dest) b.connect(dest);
      return b;
    },
    /** Stereo panner (or the destination itself where StereoPannerNode is missing). */
    pan(v, dest, t) {
      if (!ac.createStereoPanner) return dest;
      const p = ac.createStereoPanner();
      p.pan.setValueAtTime(v, t ?? ac.currentTime);
      p.connect(dest);
      return p;
    },
  };
  kits.set(ac, k);
  return k;
}

/** Click-free attack/decay envelope on an AudioParam. */
function env(param, t, attack, peak, decay) {
  param.setValueAtTime(0.0001, t);
  param.linearRampToValueAtTime(peak, t + attack);
  param.exponentialRampToValueAtTime(0.0001, t + attack + decay);
}
/** Short burst of filtered noise. */
function hiss(k, t, dur, f, q, peak, dest, type = 'bandpass') {
  const g = k.gain(0, dest);
  env(g.gain, t, Math.min(0.008, dur * 0.25), peak, dur);
  k.noise(t, dur + 0.02, k.filter(type, f, q, g, t));
}
/** FM bell (DX-style): bright inharmonic attack that mellows into a pure tone. */
function fmBell(k, t, dest, f, peak, decay, index = 0.8, ratio = 3.5) {
  const end = t + decay + 0.08;
  const g = k.gain(0, dest);
  env(g.gain, t, 0.004, peak, decay);
  const car = k.osc('sine', f, t, end, g);
  const mod = k.osc('sine', f * ratio, t, end, null);
  const depth = k.gain(0, car.frequency);
  depth.gain.setValueAtTime(f * ratio * index, t);
  depth.gain.exponentialRampToValueAtTime(Math.max(1, f * 0.01), t + decay * 0.5);
  mod.connect(depth);
  const g2 = k.gain(0, dest);                              // airy upper partial
  env(g2.gain, t, 0.003, peak * 0.2, decay * 0.5);
  k.osc('sine', f * 2.005, t, t + decay * 0.55 + 0.05, g2);
}
/** Soft triangle note with an optional glide and vibrato. */
function softNote(k, t, dur, f0, f1, peak, dest, vibrato = 0) {
  const g = k.gain(0, dest);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + 0.035);
  g.gain.setValueAtTime(peak, t + dur * 0.4);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  const o = k.osc('triangle', f0, t, t + dur + 0.02, g);
  if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const s = k.osc('sine', f0 / 2, t, t + dur + 0.02, k.gain(0.35, g));
  if (f1 !== f0) s.frequency.exponentialRampToValueAtTime(f1 / 2, t + dur);
  if (vibrato) {
    const lfo = k.osc('sine', 5.4, t + 0.12, t + dur, null);
    lfo.connect(k.gain(vibrato, o.frequency));
  }
}
/** Warm "brass" note: detuned saws through an opening-then-closing lowpass. */
function brass(k, t, dur, f, peak, dest) {
  const rel = dur > 0.3 ? 0.38 : 0.07;
  const lp = k.filter('lowpass', 480, 1.1, dest, t);
  lp.frequency.linearRampToValueAtTime(2500, t + 0.05);
  lp.frequency.exponentialRampToValueAtTime(1400, t + 0.05 + dur * 0.6);
  lp.frequency.exponentialRampToValueAtTime(520, t + dur + rel);
  const g = k.gain(0, lp);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + 0.028);
  g.gain.setValueAtTime(peak * 0.85, t + dur);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur + rel);
  const end = t + dur + rel + 0.02;
  const saws = [-8, 7].map((cents) => { const o = k.osc('sawtooth', f, t, end, g); o.detune.value = cents; return o; });
  k.osc('triangle', f / 2, t, end, k.gain(0.5, g));
  if (dur > 0.3) {
    const lfo = k.osc('sine', 5.2, t + 0.16, end, null);
    const depth = k.gain(9, null);
    lfo.connect(depth);
    saws.forEach((o) => depth.connect(o.detune));
  }
}

/* --------------------------------------------------------------------------
   The sounds. Each: (kit, startTime, destination, pitch) -> duration in seconds.
   -------------------------------------------------------------------------- */
const SOUNDS = {
  /** A clear little FM bell. */
  chime(k, t, out, p) {
    fmBell(k, t, out, 1046.5 * p, 0.32, 1.45);
    return 1.55;
  },
  /** Brass temple bell: inharmonic partials (1, 2.76, 5.4, 8.93), a beating twin and a soft strike. */
  bell(k, t, out, p) {
    const f0 = 587.33 * p * (1 + (Math.random() - 0.5) * 0.016);
    const bus = k.gain(0.3, out);
    const partials = [[1, 1, 2.9], [2.76, 0.4, 1.8], [5.4, 0.2, 0.95], [8.93, 0.09, 0.5], [0.5, 0.16, 3.1]];
    for (const [ratio, amp, decay] of partials) {
      const g = k.gain(0, bus);
      env(g.gain, t, 0.003, amp, decay);
      k.osc('sine', f0 * ratio, t, t + decay + 0.06, g);
    }
    const twin = k.gain(0, bus);                           // ~2 Hz beating: the bell's slow "wah-wah"
    env(twin.gain, t, 0.004, 0.42, 2.6);
    k.osc('sine', f0 * 1.0034, t, t + 2.7, twin);
    hiss(k, t, 0.035, 3800, 1.4, 0.3, bus);                // the strike
    return 3.2;
  },
  /** Round bubble pop. */
  pop(k, t, out, p) {
    const g = k.gain(0, out);
    env(g.gain, t, 0.002, 0.42, 0.1);
    k.osc('sine', 820 * p, t, t + 0.14, g).frequency.exponentialRampToValueAtTime(250 * p, t + 0.075);
    hiss(k, t, 0.012, 2200, 0.7, 0.09, out, 'highpass');
    return 0.16;
  },
  /** Soft clock tick. */
  tick(k, t, out, p) {
    const g = k.gain(0, out);
    env(g.gain, t, 0.001, 0.24, 0.03);
    k.osc('triangle', 2350 * p, t, t + 0.05, g);
    hiss(k, t, 0.01, 4200, 0.7, 0.08, out, 'highpass');
    return 0.06;
  },
  /** Airy whoosh: noise through a sweeping bandpass, panned left → right. */
  whoosh(k, t, out, p) {
    const d = 0.5;
    const pn = k.pan(-0.6, out, t);
    if (pn.pan) pn.pan.linearRampToValueAtTime(0.6, t + d);
    const g = k.gain(0, pn);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.32, t + 0.16);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    const bp = k.filter('bandpass', 300 * p, 0.9, g, t);
    bp.frequency.exponentialRampToValueAtTime(2200 * p, t + 0.22);
    bp.frequency.exponentialRampToValueAtTime(620 * p, t + d);
    k.noise(t, d + 0.02, bp);
    return d + 0.03;
  },
  /** Rising chime arpeggio (C E G C). */
  success(k, t, out, p) {
    [1046.5, 1318.5, 1568, 2093].forEach((f, i) => {
      const last = i === 3;
      fmBell(k, t + i * 0.075, out, f * p, last ? 0.16 : 0.12, last ? 1.15 : 0.6, 0.6);
    });
    return 0.225 + 1.25;
  },
  /** Two soft descending notes — an affectionate "aww". */
  sad(k, t, out, p) {
    const lp = k.filter('lowpass', 1500, 0.5, out, t);
    softNote(k, t, 0.28, 392 * p, 386 * p, 0.2, lp);
    softNote(k, t + 0.25, 0.62, 330 * p, 296 * p, 0.2, lp, 3.5);
    return 0.9;
  },
  /** Paper rustle: two short, high bandpassed noise bursts. */
  paper(k, t, out, p) {
    hiss(k, t, 0.05, 4300 * p, 1.3, 0.28, out);
    hiss(k, t + 0.045, 0.07, 5400 * p, 1.1, 0.2, out);
    return 0.14;
  },
  /** Rubber stamp: low thump + papery thud + a tiny "chk". */
  stamp(k, t, out, p) {
    const g = k.gain(0, out);
    env(g.gain, t, 0.002, 0.6, 0.2);
    k.osc('sine', 165 * p, t, t + 0.25, g).frequency.exponentialRampToValueAtTime(48 * p, t + 0.13);
    hiss(k, t, 0.07, 900, 0.7, 0.28, out, 'lowpass');
    hiss(k, t + 0.028, 0.022, 2600, 1.5, 0.08, out);
    return 0.3;
  },
  /** Random high tinkles from a pentatonic scale, scattered across the stereo field. */
  sparkle(k, t, out, p) {
    const scale = [2093, 2349, 2637, 3136, 3520, 4186];
    let end = 0;
    for (let i = 0; i < 6; i++) {
      const tt = t + i * 0.03 + Math.random() * 0.26;
      const d = 0.12 + Math.random() * 0.2;
      const g = k.gain(0, k.pan((Math.random() - 0.5) * 1.2, out, tt));
      env(g.gain, tt, 0.002, 0.095, d);
      k.osc('sine', scale[(Math.random() * scale.length) | 0] * p, tt, tt + d + 0.03, g);
      end = Math.max(end, tt - t + d);
    }
    return end + 0.05;
  },
  /** Tiny typewriter-ish click (slightly different every time). */
  type(k, t, out, p) {
    const v = p * (0.92 + Math.random() * 0.16);
    hiss(k, t, 0.012, 3200 * v, 0.8, 0.14, out, 'highpass');
    const g = k.gain(0, out);
    env(g.gain, t, 0.0008, 0.08, 0.018);
    k.osc('sine', 1800 * v, t, t + 0.03, g);
    return 0.04;
  },
  /** Thavil-like tom: pitch-dropping body + a bright slap. */
  drum(k, t, out, p) {
    const g = k.gain(0, out);
    env(g.gain, t, 0.002, 0.7, 0.36);
    k.osc('sine', 196 * p, t, t + 0.42, g).frequency.exponentialRampToValueAtTime(94 * p, t + 0.17);
    const g2 = k.gain(0, out);
    env(g2.gain, t, 0.002, 0.2, 0.16);
    k.osc('triangle', 310 * p, t, t + 0.2, g2).frequency.exponentialRampToValueAtTime(150 * p, t + 0.12);
    hiss(k, t, 0.035, 1900 * p, 1.1, 0.3, out);
    hiss(k, t, 0.01, 5000, 0.7, 0.08, out, 'highpass');
    return 0.45;
  },
  /** Card flip: a quick papery "fft" and a soft landing tap. */
  flip(k, t, out, p) {
    const g = k.gain(0, out);
    env(g.gain, t, 0.012, 0.26, 0.08);
    const bp = k.filter('bandpass', 1100 * p, 1.3, g, t);
    bp.frequency.exponentialRampToValueAtTime(3200 * p, t + 0.08);
    k.noise(t, 0.11, bp);
    const g2 = k.gain(0, out);
    env(g2.gain, t + 0.07, 0.003, 0.16, 0.06);
    k.osc('sine', 280 * p, t + 0.07, t + 0.15, g2).frequency.exponentialRampToValueAtTime(180 * p, t + 0.13);
    return 0.18;
  },
  /** Rising swoosh (things flying up / opening). */
  'swoosh-up'(k, t, out, p) {
    const d = 0.42;
    const pn = k.pan(-0.3, out, t);
    if (pn.pan) pn.pan.linearRampToValueAtTime(0.3, t + d);
    const g = k.gain(0, pn);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.26, t + 0.26);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    const bp = k.filter('bandpass', 380 * p, 1.1, g, t);
    bp.frequency.exponentialRampToValueAtTime(3600 * p, t + d);
    k.noise(t, d + 0.02, bp);
    const g2 = k.gain(0, pn);
    g2.gain.setValueAtTime(0.0001, t);
    g2.gain.linearRampToValueAtTime(0.035, t + 0.25);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + d);
    k.osc('sine', 320 * p, t, t + d + 0.02, g2).frequency.exponentialRampToValueAtTime(1300 * p, t + d);
    return d + 0.03;
  },
  /** Cartoon boop with a quick upward pitch bend. */
  boop(k, t, out, p) {
    const lp = k.filter('lowpass', 2400, 0.6, out, t);
    const g = k.gain(0, lp);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.36, t + 0.008);
    g.gain.setValueAtTime(0.36, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    for (const [type, amp] of [['sine', 1], ['triangle', 0.3]]) {
      const o = k.osc(type, 380 * p, t, t + 0.22, amp === 1 ? g : k.gain(amp, g));
      o.frequency.exponentialRampToValueAtTime(640 * p, t + 0.045);
      o.frequency.exponentialRampToValueAtTime(540 * p, t + 0.17);
    }
    return 0.22;
  },
  /** Short triumphant "ta-da-daaa" (G C E), warm lowpassed brass. */
  fanfare(k, t, out, p) {
    brass(k, t, 0.12, 392 * p, 0.12, out);
    brass(k, t + 0.14, 0.12, 523.25 * p, 0.12, out);
    brass(k, t + 0.28, 0.62, 659.25 * p, 0.15, out);
    return 0.28 + 0.62 + 0.42;
  },
  /** Knuckles on a wooden door. */
  knock(k, t, out, p) {
    const g = k.gain(0, out);
    env(g.gain, t, 0.001, 0.55, 0.09);
    k.osc('sine', 215 * p, t, t + 0.12, g).frequency.exponentialRampToValueAtTime(150 * p, t + 0.06);
    const g2 = k.gain(0, out);
    env(g2.gain, t, 0.001, 0.13, 0.05);
    k.osc('triangle', 430 * p, t, t + 0.07, g2);
    hiss(k, t, 0.028, 1000 * p, 2.5, 0.3, out);
    return 0.14;
  },
  /** A little two-note bird chirp (Kili the parrot). */
  chirp(k, t, out, p) {
    for (let i = 0; i < 2; i++) {
      const tt = t + i * 0.11;
      const g = k.gain(0, out);
      env(g.gain, tt, 0.004, 0.14, 0.07);
      const o = k.osc('sine', 2300 * p, tt, tt + 0.09, g);
      o.frequency.exponentialRampToValueAtTime(3700 * p, tt + 0.035);
      o.frequency.exponentialRampToValueAtTime(2700 * p, tt + 0.075);
    }
    return 0.24;
  },
  /** Soft "plop" — something landing on a banana leaf. */
  plop(k, t, out, p) {
    const g = k.gain(0, out);
    env(g.gain, t, 0.003, 0.45, 0.13);
    k.osc('sine', 310 * p, t, t + 0.16, g).frequency.exponentialRampToValueAtTime(120 * p, t + 0.09);
    hiss(k, t, 0.03, 700, 0.8, 0.12, out, 'lowpass');
    return 0.17;
  },
  /** Two-step coin ding. */
  coin(k, t, out, p) {
    const lp = k.filter('lowpass', 5000, 0.5, out, t);
    const g = k.gain(0, lp);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.16, t + 0.004);
    g.gain.setValueAtTime(0.16, t + 0.07);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
    const o = k.osc('triangle', 988 * p, t, t + 0.45, g);
    o.frequency.setValueAtTime(1319 * p, t + 0.07);
    return 0.45;
  },
};

export const SOUND_NAMES = Object.keys(SOUNDS);
const resolve = (name) => {
  const key = Object.prototype.hasOwnProperty.call(ALIASES, name) ? ALIASES[name] : name;
  return typeof key === 'string' && Object.prototype.hasOwnProperty.call(SOUNDS, key) ? key : null;
};

/**
 * Soft-knee limiter curve: perfectly linear below 0.6, then a smooth tanh shoulder that approaches (never
 * reaches) 0.98. A stateless WaveShaper is used instead of DynamicsCompressorNode on purpose: Chromium's
 * compressor starts "closed" and opens over its release time, which would swallow the first sound after the
 * context is created (the lamp's bell!). The 0.5 pre-gain lets the curve cover stacks up to ±2 smoothly.
 */
let limiterCurve = null;
function softCurve() {
  if (limiterCurve) return limiterCurve;
  const n = 4096, knee = 0.6, room = 0.38;
  limiterCurve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = ((i / (n - 1)) * 2 - 1) * 2;          // curve input u ∈ [-1, 1] ↔ signal x ∈ [-2, 2]
    const a = Math.abs(x);
    limiterCurve[i] = Math.sign(x) * (a <= knee ? a : knee + room * Math.tanh((a - knee) / room));
  }
  return limiterCurve;
}

/** Output chain: voices → bus → gentle lowpass → master gain → soft limiter → speakers. */
function buildChain(ac) {
  const tone = ac.createBiquadFilter();
  tone.type = 'lowpass';
  tone.frequency.value = 10500;
  tone.Q.value = 0.4;
  const master = ac.createGain();
  master.gain.value = MASTER;
  const pre = ac.createGain();
  pre.gain.value = 0.5;
  const limiter = ac.createWaveShaper();
  limiter.curve = softCurve();
  limiter.oversample = '2x';
  const bus = ac.createGain();
  bus.connect(tone);
  tone.connect(master);
  master.connect(pre);
  pre.connect(limiter);
  limiter.connect(ac.destination);
  return { bus, master };
}

/* --------------------------------------------------------------------------
   Engine
   -------------------------------------------------------------------------- */
let ctx = null;
let chain = null;
let enabled = store.get('sound', false) === true;
let inited = false;
let gestureAt = -1e9;                 // last trusted gesture we saw (fallback where navigator.userActivation is missing)
let voices = 0;
let primed = false;
const lastPlayed = new Map();

const ua = () => navigator.userActivation;
/** The page has ever been interacted with (sticky activation). */
const hasActivation = () => (ua() ? ua().hasBeenActive : gestureAt > 0);
/** We're inside (or right after) a user gesture (transient activation). */
const inGesture = () => (ua() ? ua().isActive : performance.now() - gestureAt < 1000);

function ensureContext() {
  if (ctx) return ctx.state === 'closed' ? null : ctx;
  if (!AC || !hasActivation()) return null;
  try { ctx = new AC({ latencyHint: 'interactive' }); } catch { try { ctx = new AC(); } catch { return null; } }
  chain = buildChain(ctx);
  return ctx;
}

function wake() {
  const c = ensureContext();
  if (!c) return null;
  if (c.state !== 'running' && inGesture()) c.resume().catch(() => {});
  if (!primed && inGesture()) {
    primed = true;                     // iOS: a silent one-sample buffer inside the gesture fully unlocks output
    try {
      const s = c.createBufferSource();
      s.buffer = c.createBuffer(1, 1, c.sampleRate);
      s.connect(c.destination);
      s.start(0);
    } catch { /* ignore */ }
  }
  return c;
}

function setMasterLevel(level) {
  if (!ctx || !chain) return;
  const g = chain.master.gain;
  g.cancelScheduledValues(ctx.currentTime);
  g.setTargetAtTime(level, ctx.currentTime, level ? 0.01 : 0.025);
}

function init() {
  if (inited) return;
  inited = true;
  enabled = store.get('sound', false) === true;
  const onGesture = (e) => {
    if (e && e.isTrusted === false) return;
    gestureAt = performance.now();
    if (enabled && (!ctx || ctx.state !== 'running')) wake();
  };
  for (const type of ['pointerdown', 'pointerup', 'touchend', 'keydown', 'click']) {
    window.addEventListener(type, onGesture, { capture: true, passive: true });
  }
  document.addEventListener('visibilitychange', () => {
    if (!ctx || ctx.state === 'closed') return;
    if (document.hidden) { if (ctx.state === 'running') ctx.suspend().catch(() => {}); }
    else if (enabled && ctx.state !== 'running') ctx.resume().catch(() => {});
  });
}

function play(name, opts = {}) {
  if (!enabled || document.hidden) return false;
  const key = resolve(name);
  if (!key) return false;
  const now = performance.now();
  if (now - (lastPlayed.get(key) ?? -1e9) < (GAP[key] ?? DEFAULT_GAP)) return false;
  if (voices >= MAX_VOICES) return false;
  const c = wake();
  if (!c) return false;
  // Never queue a sound behind a suspended context — it would play late and out of context.
  if (c.state !== 'running' && !inGesture()) return false;
  const volume = clamp(Number(opts.volume ?? 1) || 0, 0, 2);
  if (!volume) return false;
  const pitch = clamp(Number(opts.pitch ?? 1) || 1, 0.25, 4);
  lastPlayed.set(key, now);
  const voice = c.createGain();
  voice.gain.value = volume * (TRIM[key] ?? 1);
  voice.connect(chain.bus);
  let dur = 1;
  try {
    dur = SOUNDS[key](kitFor(c), c.currentTime + 0.012, voice, pitch) || 1;
  } catch {
    voice.disconnect();
    return false;
  }
  voices++;
  setTimeout(() => { voices = Math.max(0, voices - 1); try { voice.disconnect(); } catch { /* already gone */ } }, (dur + 0.25) * 1000);
  return true;
}

function setEnabled(on) {
  const next = !!on;
  enabled = next;
  store.set('sound', next);
  if (next) {
    wake();                            // inside the toggle's click this creates/resumes the context
    setMasterLevel(MASTER);
  } else if (ctx && ctx.state === 'running') {
    setMasterLevel(0);                 // fade out quickly, then let the context sleep
    setTimeout(() => { if (!enabled && ctx && ctx.state === 'running') ctx.suspend().catch(() => {}); }, 250);
  }
  emit('sound', { enabled: next });
  return next;
}

export const sound = {
  /** Reads the saved preference and listens for the first gestures. Called once by main.js (idempotent). */
  init,
  /** Play a named sound if enabled. opts: { volume = 1 (0–2), pitch = 1 (0.25–4) }. Returns true if it played. */
  play,
  /** Current preference (false until the visitor turns sound on). */
  get enabled() { return enabled; },
  /** Turn sound on/off, persist it, emit('sound', { enabled }). Call from the toggle's click handler. */
  setEnabled,
  /** Flip the preference. Returns the new state. */
  toggle() { return setEnabled(!enabled); },
  /** Resume the AudioContext — call from a user gesture (the lamp tap, a button…). Safe to call any time. */
  unlock() { gestureAt = performance.now(); if (enabled) wake(); },
  /** Every playable name (excluding aliases). */
  names: SOUND_NAMES,
};
export default sound;

/**
 * Dev/QA helper: render a sound offline and measure it — no speakers, no permission needed.
 * Pass an array of names to render a worst-case stack. Resolves { name, duration, peak, rms } (post-limiter, 0–1).
 */
export async function renderSound(name, { pitch = 1, volume = 1, sampleRate = 44100 } = {}) {
  const keys = (Array.isArray(name) ? name : [name]).map(resolve);
  const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (!keys.length || keys.some((k) => !k) || !OAC) return null;
  const seconds = 3.6;
  const ac = new OAC(2, Math.ceil(sampleRate * seconds), sampleRate);
  const { bus } = buildChain(ac);
  let dur = 0;
  for (const key of keys) {                         // an array renders a worst-case stack, all at once
    const voice = ac.createGain();
    voice.gain.value = volume * (TRIM[key] ?? 1);
    voice.connect(bus);
    dur = Math.max(dur, SOUNDS[key](kitFor(ac), 0.01, voice, pitch));
  }
  const key = keys.join('+');
  const buf = await ac.startRendering();
  let peak = 0, sum = 0, n = 0;
  for (let ch = 0; ch < buf.numberOfChannels; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < d.length; i++) { const v = Math.abs(d[i]); if (v > peak) peak = v; sum += d[i] * d[i]; n++; }
  }
  return { name: key, duration: +dur.toFixed(3), peak: +peak.toFixed(4), rms: +Math.sqrt(sum / n).toFixed(5) };
}
