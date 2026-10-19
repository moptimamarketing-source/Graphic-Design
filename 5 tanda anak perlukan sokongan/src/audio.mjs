// Sintesis SFX & muzik latar secara deterministik (tiada fail luar, tiada lesen).
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const SR = 44100;
const TAU = Math.PI * 2;

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const buf = (sec) => new Float32Array(Math.ceil(sec * SR));
const lpCoef = (fc) => 1 - Math.exp((-TAU * fc) / SR);

// ---------------------------------------------------------------- SFX
function noiseSweep(d, lo, hi, seed, gain) {
  const b = buf(d);
  const r = rng(seed);
  let lp = 0, lp2 = 0, hp = 0;
  for (let i = 0; i < b.length; i++) {
    const p = i / b.length;
    const env = Math.pow(Math.sin(Math.PI * Math.min(1, p * 1.15)), 2);
    const fc = lo + (hi - lo) * Math.sin(Math.PI * p);
    const a = lpCoef(fc);
    const n = r() * 2 - 1;
    lp += a * (n - lp);
    lp2 += a * (lp - lp2);
    hp += lpCoef(180) * (lp2 - hp);
    b[i] = (lp2 - hp) * env * gain;
  }
  return b;
}

const SYNTH = {
  whoosh: () => noiseSweep(0.46, 350, 5200, 11, 3.2),
  swish: () => noiseSweep(0.24, 900, 7500, 23, 2.6),
  pop(pitch = 1) {
    const d = 0.16, b = buf(d);
    let ph = 0;
    for (let i = 0; i < b.length; i++) {
      const t = i / SR;
      const f = (260 + 900 * Math.exp(-t * 32)) * pitch;
      ph += (TAU * f) / SR;
      const env = (1 - Math.exp(-t * 3000)) * Math.exp(-t * 34);
      b[i] = Math.sin(ph) * env * 0.9;
    }
    return b;
  },
  thud() {
    const d = 0.5, b = buf(d), r = rng(5);
    let ph = 0, lp = 0;
    for (let i = 0; i < b.length; i++) {
      const t = i / SR;
      const f = 46 + 95 * Math.exp(-t * 22);
      ph += (TAU * f) / SR;
      lp += lpCoef(900) * ((r() * 2 - 1) - lp);
      const body = Math.sin(ph) * Math.exp(-t * 8.5);
      const click = lp * Math.exp(-t * 70) * 1.4;
      b[i] = Math.tanh((body + click) * 1.6) * 0.95;
    }
    return b;
  },
  tick(pitch = 1) {
    const d = 0.06, b = buf(d);
    for (let i = 0; i < b.length; i++) {
      const t = i / SR;
      const env = Math.exp(-t * 110);
      b[i] = (Math.sin(TAU * 2300 * pitch * t) + 0.4 * Math.sin(TAU * 3700 * pitch * t)) * env * 0.6;
    }
    return b;
  },
  click() {
    const d = 0.05, b = buf(d), r = rng(9);
    for (let i = 0; i < b.length; i++) {
      const t = i / SR;
      b[i] = (Math.sin(TAU * 1250 * t) * 0.7 + (r() * 2 - 1) * 0.3) * Math.exp(-t * 140);
    }
    return b;
  },
  buzz() {
    const d = 0.34, b = buf(d);
    let lp = 0;
    for (let i = 0; i < b.length; i++) {
      const t = i / SR;
      let s = 0;
      for (let k = 1; k <= 9; k += 1) s += Math.sin(TAU * 150 * k * t) / k;
      const g1 = t < 0.13 ? Math.min(1, t / 0.006) * Math.min(1, (0.13 - t) / 0.02) : 0;
      const t2 = t - 0.17;
      const g2 = t2 > 0 && t2 < 0.15 ? Math.min(1, t2 / 0.006) * Math.min(1, (0.15 - t2) / 0.03) : 0;
      lp += lpCoef(2200) * (s - lp);
      b[i] = lp * (g1 + g2) * 0.42;
    }
    return b;
  },
  chime() {
    const d = 1.5, b = buf(d);
    const notes = [[1318.5, 0], [1975.5, 0.09], [2637, 0.18]];
    for (const [f, o] of notes) {
      const i0 = Math.round(o * SR);
      for (let i = i0; i < b.length; i++) {
        const t = (i - i0) / SR;
        const env = (1 - Math.exp(-t * 900)) * Math.exp(-t * 3.4);
        b[i] += (Math.sin(TAU * f * t) + 0.25 * Math.sin(TAU * f * 2.01 * t) * Math.exp(-t * 6)) * env * 0.33;
      }
    }
    return b;
  },
  ding(pitch = 1) {
    const d = 0.7, b = buf(d);
    const f = 1046.5 * pitch;
    for (let i = 0; i < b.length; i++) {
      const t = i / SR;
      const env = (1 - Math.exp(-t * 1200)) * Math.exp(-t * 6);
      b[i] = (Math.sin(TAU * f * t) + 0.3 * Math.sin(TAU * f * 2 * t) * Math.exp(-t * 10)) * env * 0.6;
    }
    return b;
  },
  sparkle() {
    const d = 0.8, b = buf(d), r = rng(31);
    for (let k = 0; k < 7; k++) {
      const o = k * 0.055 + r() * 0.02;
      const f = 2600 + r() * 1900;
      const i0 = Math.round(o * SR);
      for (let i = i0; i < b.length; i++) {
        const t = (i - i0) / SR;
        b[i] += Math.sin(TAU * f * t) * Math.exp(-t * 18) * 0.22;
      }
    }
    return b;
  },
};

function writeWav(file, data) {
  const n = data.length;
  const out = Buffer.alloc(44 + n * 2);
  out.write("RIFF", 0);
  out.writeUInt32LE(36 + n * 2, 4);
  out.write("WAVE", 8);
  out.write("fmt ", 12);
  out.writeUInt32LE(16, 16);
  out.writeUInt16LE(1, 20);
  out.writeUInt16LE(1, 22);
  out.writeUInt32LE(SR, 24);
  out.writeUInt32LE(SR * 2, 28);
  out.writeUInt16LE(2, 32);
  out.writeUInt16LE(16, 34);
  out.write("data", 36);
  out.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const v = Math.max(-1, Math.min(1, data[i]));
    out.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  fs.writeFileSync(file, out);
}

export function renderSfxTrack(cues, duration, gain, out) {
  const track = buf(duration);
  const cache = new Map();
  for (const [t, name, g = 1, pitch] of cues) {
    if (!SYNTH[name]) throw new Error("SFX tidak dikenali: " + name);
    const key = name + ":" + (pitch ?? "");
    if (!cache.has(key)) cache.set(key, SYNTH[name](pitch ?? 1));
    const s = cache.get(key);
    const i0 = Math.max(0, Math.round(t * SR));
    for (let i = 0; i < s.length && i0 + i < track.length; i++) track[i0 + i] += s[i] * g * gain;
  }
  // limiter lembut
  for (let i = 0; i < track.length; i++) track[i] = Math.tanh(track[i] * 1.1) / 1.1;
  writeWav(out, track);
}

// ---------------------------------------------------------------- MUZIK
const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

function voiceEnvelope(voicePath, n) {
  const raw = execFileSync("ffmpeg", ["-v", "error", "-i", voicePath, "-ac", "1", "-ar", String(SR), "-f", "f32le", "-"], {
    maxBuffer: 1 << 30,
  });
  const v = new Float32Array(raw.buffer, raw.byteOffset, Math.floor(raw.length / 4));
  const env = new Float32Array(n);
  const win = Math.round(0.02 * SR);
  let acc = 0;
  for (let i = 0; i < n; i++) {
    const x = i < v.length ? v[i] : 0;
    acc += x * x;
    const j = i - win;
    if (j >= 0) {
      const y = j < v.length ? v[j] : 0;
      acc -= y * y;
    }
    env[i] = Math.sqrt(Math.max(0, acc) / win);
  }
  return env;
}

export function renderMusicTrack({ duration, gain, duck, voicePath, softFrom, softTo, out }) {
  const n = Math.ceil(duration * SR);
  const m = new Float32Array(n);
  const r = rng(77);
  const beat = 0.6; // 100 BPM
  const bar = beat * 4;
  // C – G – Am – F
  const chords = [
    [48, [60, 64, 67]],
    [43, [55, 59, 62]],
    [45, [57, 60, 64]],
    [41, [53, 57, 60]],
  ];
  const arp = [0, 1, 2, 1, 3, 2, 1, 2];

  const add = (i0, len, fn) => {
    for (let i = 0; i < len && i0 + i < n; i++) if (i0 + i >= 0) m[i0 + i] += fn(i / SR);
  };
  const softness = (t) => (t > softFrom - 0.2 && t < softTo - 0.1 ? 1 : 0);

  for (let b = 0; b * bar < duration; b++) {
    const [root, tones] = chords[b % 4];
    const t0 = b * bar;
    // pluck arpeggio (marimba-ish)
    for (let k = 0; k < 8; k++) {
      const t = t0 + k * (beat / 2);
      if (t >= duration) break;
      const note = arp[k] === 3 ? tones[0] + 12 : tones[arp[k]];
      const f = midi(note + 12);
      const soft = softness(t) ? 0.55 : 1;
      const acc = k % 2 === 0 ? 1 : 0.7;
      add(Math.round(t * SR), Math.round(0.9 * SR), (x) => {
        const env = (1 - Math.exp(-x * 500)) * Math.exp(-x * 6.5);
        return (Math.sin(TAU * f * x) + 0.3 * Math.sin(TAU * f * 4 * x) * Math.exp(-x * 25)) * env * 0.16 * soft * acc;
      });
    }
    // bass on beat 1 & 3
    for (const bb of [0, 2]) {
      const t = t0 + bb * beat;
      if (t >= duration || softness(t)) continue;
      const f = midi(root);
      add(Math.round(t * SR), Math.round(0.55 * SR), (x) => {
        const env = (1 - Math.exp(-x * 300)) * Math.exp(-x * 4.2);
        return (Math.sin(TAU * f * x) + 0.25 * Math.sin(TAU * 2 * f * x)) * env * 0.22;
      });
    }
    // pad
    const padLen = Math.round(bar * SR);
    for (const note of tones) {
      const f = midi(note);
      add(Math.round(t0 * SR), padLen, (x) => {
        const env = Math.min(1, x / 0.35) * Math.min(1, (bar - x) / 0.35);
        return (Math.sin(TAU * f * x) + Math.sin(TAU * f * 1.004 * x)) * env * 0.022;
      });
    }
    // shaker on off-beats
    for (let k = 1; k < 8; k += 2) {
      const t = t0 + k * (beat / 2);
      if (t >= duration || softness(t)) continue;
      let hp = 0;
      add(Math.round(t * SR), Math.round(0.08 * SR), (x) => {
        const nz = r() * 2 - 1;
        hp += lpCoef(5000) * (nz - hp);
        return (nz - hp) * Math.exp(-x * 55) * 0.05;
      });
    }
  }

  // normalise peak → 0.5
  let peak = 0;
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(m[i]));
  const norm = 0.5 / (peak || 1);

  // sidechain duck under the voice (attack 40 ms, release 350 ms)
  const env = voiceEnvelope(voicePath, n);
  const thr = 0.012;
  const aA = 1 - Math.exp(-1 / (0.04 * SR));
  const aR = 1 - Math.exp(-1 / (0.35 * SR));
  let g = 1;
  for (let i = 0; i < n; i++) {
    const target = env[i] > thr ? duck : 1;
    g += (target < g ? aA : aR) * (target - g);
    const t = i / SR;
    const fadeIn = Math.min(1, t / 0.25);
    const fadeOut = Math.min(1, Math.max(0, (duration - t) / 1.2));
    m[i] = m[i] * norm * gain * g * fadeIn * fadeOut;
  }
  writeWav(out, m);
}
