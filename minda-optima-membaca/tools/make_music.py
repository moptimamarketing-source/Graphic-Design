"""Procedural background score for the Minda Optima reading video.

Arc follows the voiceover:
  0.00-4.50  suspense   (drone, heartbeat, ticking clock, tremolo)
  4.50-8.20  build      (riser + accelerating snare roll, cut, impact)
  8.20-21.36 upbeat     (127.7 BPM four-on-the-floor, I-V-vi-IV in C)
  21.36-25.12 breakdown ("Jangan bandingkan" - no drums, emotional chords)
  25.12-27.00 build     (riser + roll into the logo)
  27.00-34.00 finale    (impact on the logo, full groove, ring out)

The bed is pre-ducked under the voiceover so narration stays on top.

Usage: python3 tools/make_music.py assets/vo.mp3 assets/music.wav
"""

import subprocess
import sys
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 44100
DUR = 34.0
N = int(SR * DUR)
BEAT = 0.47  # 127.66 BPM: 10 bars land exactly from 8.20 to 27.00
BAR = 4 * BEAT
T_UP = 8.2
T_LOGO = 27.0

rng = np.random.default_rng(11)
t_all = np.arange(N) / SR


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def lp(x, fc, order=2):
    return sosfilt(butter(order, fc, "low", fs=SR, output="sos"), x)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


class Bus:
    def __init__(self):
        self.l = np.zeros(N)
        self.r = np.zeros(N)

    def add(self, sig, start, gain=1.0, pan=0.0):
        i = int(round(start * SR))
        if i >= N:
            return
        if i < 0:
            sig = sig[-i:]
            i = 0
        sig = sig[: N - i]
        gl = gain * np.sqrt(0.5 * (1 - pan))
        gr = gain * np.sqrt(0.5 * (1 + pan))
        self.l[i : i + len(sig)] += sig * gl
        self.r[i : i + len(sig)] += sig * gr


def env_adsr(n, a=0.005, d=0.1, s=0.7, r=0.2):
    na, nd, nr = int(a * SR), int(d * SR), int(r * SR)
    ns = max(n - na - nd - nr, 0)
    e = np.concatenate([np.linspace(0, 1, na, endpoint=False), np.linspace(1, s, nd, endpoint=False), np.full(ns, s), np.linspace(s, 0, nr)])
    return e[:n] if len(e) >= n else np.pad(e, (0, n - len(e)))


def saw(freq, n, phase=0.0):
    ph = (phase + freq * np.arange(n) / SR) % 1.0
    return 2 * ph - 1


# ---------------- instruments ----------------


def kick(punch=1.0):
    n = int(0.42 * SR)
    t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / 0.22)
    click = hp(rng.standard_normal(n), 2500) * np.exp(-t / 0.004) * 0.25
    return np.tanh((body + click) * 1.6 * punch)


def heartbeat():
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f = 38 + 40 * np.exp(-t / 0.05)
    return lp(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.12), 160)


def clap():
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    e = np.zeros(n)
    for off in (0.0, 0.011, 0.022):
        k = t - off
        e += np.where(k >= 0, np.exp(-np.clip(k, 0, None) / (0.006 if off < 0.02 else 0.09)), 0)
    return bp(rng.standard_normal(n), 900, 5200) * e * 0.8


def snare():
    n = int(0.22 * SR)
    t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.05) * 0.5
    noise = bp(rng.standard_normal(n), 1500, 8000) * np.exp(-t / 0.07)
    return tone + noise


def hat(open_=False):
    n = int((0.22 if open_ else 0.06) * SR)
    t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 7500) * np.exp(-t / (0.07 if open_ else 0.014))


def tick():
    n = int(0.04 * SR)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * 2600 * t) * np.exp(-t / 0.006)


def pluck(m, length=0.32):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = mtof(m)
    x = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.12 * saw(f, n)) * np.exp(-t / 0.11)
    return lp(x, 5200) * env_adsr(n, 0.002, 0.05, 0.9, 0.05)


def bass_note(m, length, cutoff=700):
    n = int(length * SR)
    f = mtof(m)
    x = 0.6 * saw(f, n) + 0.8 * np.sin(2 * np.pi * f * np.arange(n) / SR)
    return lp(x, cutoff, 3) * env_adsr(n, 0.004, 0.08, 0.75, 0.04)


def supersaw(notes, length, cutoff=2400, a=0.25, r=0.4):
    n = int(length * SR)
    x = np.zeros(n)
    for m in notes:
        for det in (-0.12, -0.05, 0.0, 0.06, 0.13):
            x += saw(mtof(m + det), n, rng.random())
    x = lp(x / (5 * len(notes)), cutoff, 2)
    return x * env_adsr(n, a, 0.2, 0.85, r)


def drone(m, length):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = mtof(m)
    x = 0.7 * saw(f, n) + 0.5 * saw(f * 1.004, n, 0.3) + np.sin(2 * np.pi * f / 2 * t)
    x = lp(x, 260, 3) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.35 * t))
    return x * env_adsr(n, 0.6, 0.1, 1.0, 0.4)


def riser(length, f0=300, f1=9000):
    n = int(length * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    hop = 512
    for s in range(0, n, hop):
        frac = s / n
        fc = f0 * (f1 / f0) ** (frac**1.6)
        out[s : s + hop] = sosfilt(butter(2, min(fc, 18000), "low", fs=SR, output="sos"), noise[max(0, s - 2048) : s + hop])[-len(out[s : s + hop]) :]
    sweep = np.sin(2 * np.pi * np.cumsum(200 + 900 * (t / length) ** 2) / SR) * 0.25
    return (out + sweep) * (t / length) ** 2.2


def boom(crash=True):
    n = int(2.2 * SR)
    t = np.arange(n) / SR
    f = 32 + 60 * np.exp(-t / 0.08)
    low = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.7)
    crash = hp(rng.standard_normal(n), 4000) * np.exp(-t / 0.6) * (0.35 if crash else 0.0)
    return np.tanh(low * 1.4) + crash


# ---------------- arrangement ----------------

drums, music, fx = Bus(), Bus(), Bus()
kick_times = []

C, G, AM, F = ([60, 64, 67], 48), ([59, 62, 67], 43), ([60, 64, 69], 45), ([60, 65, 69], 41)

# --- suspense 0 - 4.5 ---
music.add(drone(33, 8.2), 0.0, 0.32)
music.add(drone(40, 8.2), 0.0, 0.18)
for i in range(int(4.5 / BEAT)):
    t0 = i * BEAT
    fx.add(tick(), t0, 0.10 + 0.04 * (i % 2 == 0), pan=0.3 if i % 2 else -0.3)
for i in range(int(8.0 / (2 * BEAT))):
    t0 = i * 2 * BEAT
    drums.add(heartbeat(), t0, 0.75)
    drums.add(heartbeat(), t0 + 0.17, 0.5)
# tremolo strings, swelling
n_tr = int(8.2 * SR)
tt = np.arange(n_tr) / SR
trem = np.zeros(n_tr)
for m in (57, 60, 64, 69):
    trem += saw(mtof(m), n_tr, rng.random()) + saw(mtof(m + 0.08), n_tr, rng.random())
trem = lp(trem / 8, 1800) * (0.55 + 0.45 * np.sign(np.sin(2 * np.pi * (1 / (BEAT / 4)) * tt)).clip(0, 1))
trem *= np.clip(tt / 8.0, 0, 1) ** 1.3
music.add(trem, 0.0, 0.22)
fx.add(boom(crash=False)[: int(1.6 * SR)], 2.12, 0.45)

# --- build into 8.2 ---
fx.add(riser(8.15 - 4.6), 4.6, 0.45)
roll = []
t0 = 6.32
while t0 < 8.12:
    step = BEAT / 2 if t0 < 7.26 else (BEAT / 4 if t0 < 7.73 else BEAT / 8)
    roll.append(t0)
    t0 += step
for i, tr in enumerate(roll):
    drums.add(snare(), tr, 0.18 + 0.4 * (i / len(roll)), pan=0.1)

# --- impact on 8.2 ---
fx.add(boom(), T_UP, 0.7)


def groove_bar(t0, chord, full=True, pluck_on=True, clap_on=True, hats_on=True):
    notes, root = chord
    for b in range(4):
        tb = t0 + b * BEAT
        drums.add(kick(), tb, 0.68)
        kick_times.append(tb)
        if clap_on and b in (1, 3):
            drums.add(clap(), tb, 0.38)
        if hats_on:
            drums.add(hat(True), tb + BEAT / 2, 0.10, pan=0.25)
            drums.add(hat(), tb + BEAT / 4, 0.05, pan=-0.3)
            drums.add(hat(), tb + 3 * BEAT / 4, 0.05, pan=-0.3)
        music.add(bass_note(root, BEAT / 2 - 0.02), tb + BEAT / 2, 0.42)
    music.add(supersaw(notes, BAR + 0.1, 2600 if full else 1500, a=0.02, r=0.12), t0, 0.27)
    if pluck_on:
        arp = [notes[0] + 12, notes[1] + 12, notes[2] + 12, notes[1] + 12]
        for s in range(16):
            m = arp[s % 4] + (12 if s in (6, 14) else 0)
            music.add(pluck(m), t0 + s * BEAT / 4, 0.21, pan=-0.25 if s % 2 else 0.25)


prog = [C, G, AM, F]
for k in range(7):  # 8.20 - 21.36
    tk = T_UP + k * BAR
    groove_bar(tk, prog[k % 4], pluck_on=k >= 1, clap_on=k >= 1, hats_on=k >= 1)

# --- breakdown 21.36 - 25.12 ("Jangan bandingkan") ---
for k, ch in enumerate([AM, F]):
    tk = T_UP + (7 + k) * BAR
    notes, root = ch
    music.add(supersaw(notes, BAR + 0.5, 1300, a=0.3, r=0.6), tk, 0.36)
    music.add(bass_note(root, BAR - 0.05, 300), tk, 0.4)
    for s in range(8):
        m = [notes[0] + 12, notes[2] + 12, notes[1] + 12, notes[2] + 12][s % 4]
        music.add(lp(pluck(m, 0.6), 2600), tk + s * BEAT / 2, 0.24, pan=-0.3 if s % 2 else 0.3)

# --- build 25.12 - 27.0 ---
tb2 = T_UP + 9 * BAR
music.add(supersaw(G[0], BAR, 1800, a=0.4, r=0.05), tb2, 0.24)
for s in range(8):
    drums.add(kick(0.8), tb2 + s * BEAT / 2, 0.45 + 0.04 * s)
roll2 = [tb2 + BEAT * 2 + i * BEAT / 4 for i in range(4)] + [tb2 + BEAT * 3 + i * BEAT / 8 for i in range(7)]
for i, tr in enumerate(roll2):
    drums.add(snare(), tr, 0.2 + 0.4 * i / len(roll2))
fx.add(riser(BAR - 0.05, 400, 12000), tb2, 0.4)

# --- finale on the logo ---
fx.add(boom(), T_LOGO, 0.8)
for k, ch in enumerate([C, G, F]):
    groove_bar(T_LOGO + k * BAR, ch)
t_last = T_LOGO + 3 * BAR
drums.add(kick(), t_last, 0.85)
kick_times.append(t_last)
music.add(supersaw(C[0] + [72], DUR - t_last, 3000, a=0.01, r=1.2), t_last, 0.26)
music.add(bass_note(36, DUR - t_last, 500), t_last, 0.4)
fx.add(boom()[: int(1.4 * SR)], t_last, 0.35)

# ---------------- mix ----------------

side = np.ones(N)
for tk in kick_times:
    i = int(tk * SR)
    seg = np.arange(N - i) / SR
    side[i:] = np.minimum(side[i:], 1 - 0.55 * np.exp(-seg / 0.13))


def reverb(x, secs=1.6, wet=0.22):
    n = int(secs * SR)
    t = np.arange(n) / SR
    ir = lp(rng.standard_normal(n), 6500) * np.exp(-t / (secs / 4.5))
    ir /= np.sqrt(np.sum(ir**2))
    return x + wet * fftconvolve(x, ir)[: len(x)]


def delay(x, secs=0.705, fb=0.33, taps=3):
    out = x.copy()
    for k in range(1, taps + 1):
        d = int(secs * k * SR)
        out[d:] += x[:-d] * fb**k
    return out


L = drums.l + reverb(delay(music.l * side), wet=0.25) + reverb(fx.l, wet=0.3)
R = drums.r + reverb(delay(music.r * side, 0.7), wet=0.25) + reverb(fx.r, wet=0.3)
mix = np.stack([L, R])
mix = hp(mix, 30)

# duck under the voiceover
vo = subprocess.run(["ffmpeg", "-v", "error", "-i", sys.argv[1], "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
vo = np.frombuffer(vo, dtype=np.float32)[:N]
vo = np.pad(vo, (0, N - len(vo)))
win = int(0.03 * SR)
rms = np.sqrt(np.convolve(vo**2, np.ones(win) / win, mode="same"))
speech = (rms > 0.02).astype(float)
duck = np.zeros(N)
atk, rel = np.exp(-1 / (0.04 * SR)), np.exp(-1 / (0.35 * SR))
g = 0.0
for i in range(N):
    c = atk if speech[i] > g else rel
    g = c * g + (1 - c) * speech[i]
    duck[i] = g
mix *= 1 - 0.45 * duck

# fade the tail
fade = np.ones(N)
nf = int(1.4 * SR)
fade[-nf:] = np.linspace(1, 0, nf) ** 1.5
mix *= fade

mix = np.tanh(mix / np.max(np.abs(mix)) * 1.15) * 0.89

with wave.open(sys.argv[2], "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix.T * 32767).astype(np.int16).tobytes())
print("wrote", sys.argv[2])
