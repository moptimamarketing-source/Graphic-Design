"""Synthesise the upbeat background track (101 BPM, G major).

Original music generated from scratch, so there is nothing to license.
The tempo puts the downbeat of bar 23 at 54.65 s, the frame where the logo
lands, so the big hit and the logo arrive together.
Run from the video/ folder:  python scripts/make_beat.py
Output: public/music/music-beat.mp3
"""
import os
import subprocess
import wave

import numpy as np

SR = 44100
BPM = 101
BEAT = 60 / BPM
BAR = 4 * BEAT
DUR = 60.1
rng = np.random.default_rng(8)
mix = np.zeros(int((DUR + 4) * SR))


def tt(sec):
    return np.arange(int(sec * SR)) / SR


def biquad(x, kind, f0, q=0.707):
    w = 2 * np.pi * f0 / SR
    alpha = np.sin(w) / (2 * q)
    c = np.cos(w)
    if kind == "lp":
        b = [(1 - c) / 2, 1 - c, (1 - c) / 2]
    elif kind == "hp":
        b = [(1 + c) / 2, -(1 + c), (1 + c) / 2]
    else:  # band-pass
        b = [alpha, 0, -alpha]
    a = [1 + alpha, -2 * c, 1 - alpha]
    b = [v / a[0] for v in b]
    a = [v / a[0] for v in a]
    y = np.zeros_like(x)
    x1 = x2 = y1 = y2 = 0.0
    for i, xi in enumerate(x):
        yi = b[0] * xi + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2
        x2, x1, y2, y1 = x1, xi, y1, yi
        y[i] = yi
    return y


def place(sample, at, gain=1.0):
    s = int(at * SR)
    if s < 0 or s >= len(mix):
        return
    e = min(len(mix), s + len(sample))
    mix[s:e] += sample[: e - s] * gain


def hz(name):
    names = {"C": -9, "C#": -8, "D": -7, "D#": -6, "E": -5, "F": -4, "F#": -3, "G": -2, "G#": -1, "A": 0, "A#": 1, "B": 2}
    return 440 * 2 ** ((names[name[:-1]] + 12 * (int(name[-1]) - 4)) / 12)


# --- Drum and instrument voices -------------------------------------------
t = tt(0.42)
KICK = np.sin(2 * np.pi * np.cumsum(46 + 90 * np.exp(-t * 32)) / SR) * np.exp(-t * 7.5)
KICK[:90] += rng.standard_normal(90) * 0.25 * np.linspace(1, 0, 90)

t = tt(0.32)
burst = rng.standard_normal(len(t))
env = sum(np.exp(-np.clip(t - d, 0, None) * 60) * (t >= d) for d in (0, 0.011, 0.023)) + 0.6 * np.exp(-t * 14)
CLAP = biquad(burst, "bp", 1500, 0.9) * env * 1.6

t = tt(0.06)
HAT = biquad(rng.standard_normal(len(t)), "hp", 7500) * np.exp(-t * 70)
t = tt(0.3)
OHAT = biquad(rng.standard_normal(len(t)), "hp", 7000) * np.exp(-t * 11)
t = tt(0.08)
SHAKER = biquad(rng.standard_normal(len(t)), "bp", 8000, 1.2) * np.sin(np.pi * t / t[-1]) ** 2
t = tt(2.2)
CRASH = biquad(rng.standard_normal(len(t)), "hp", 4500) * np.exp(-t * 2.2) * 0.9


def bass(freq, dur):
    t = tt(dur)
    x = np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(4 * np.pi * freq * t)
    env = np.minimum(1, t * 300) * np.exp(-t * 3.5)
    return np.tanh(1.6 * x * env) * 0.8


def keys(freqs, dur, bright=1.0):
    # Soft electric-piano chord
    t = tt(dur)
    out = np.zeros(len(t))
    for f in freqs:
        out += np.sin(2 * np.pi * f * t) + 0.45 * bright * np.sin(4 * np.pi * f * t) * np.exp(-t * 6)
    trem = 1 + 0.08 * np.sin(2 * np.pi * 5 * t)
    return out * np.exp(-t * 2.6) * np.minimum(1, t * 250) * trem / len(freqs)


def pad(freqs, dur):
    t = tt(dur)
    out = sum(np.sin(2 * np.pi * f * t) + np.sin(2 * np.pi * f * 1.004 * t) for f in freqs)
    env = np.minimum(1, t / 0.6) * np.minimum(1, (dur - t) / 0.6)
    return out * env / (2 * len(freqs))


def marimba(freq, dur=0.9):
    t = tt(dur)
    return (np.sin(2 * np.pi * freq * t) * np.exp(-t * 6) + 0.3 * np.sin(2 * np.pi * freq * 4 * t) * np.exp(-t * 26)) * np.minimum(1, t * 900)


CHORDS = [
    ("G2", ["G3", "B3", "D4"]),
    ("D2", ["F#3", "A3", "D4"]),
    ("E2", ["G3", "B3", "E4"]),
    ("C2", ["G3", "C4", "E4"]),
]
HOOK = [
    [("D5", 0), ("B4", 0.5), ("G4", 1), ("B4", 1.5), ("D5", 2), ("E5", 2.5), ("D5", 3)],
    [("A4", 0), ("D5", 0.5), ("F#5", 1), ("E5", 2), ("D5", 2.5), ("A4", 3)],
    [("B4", 0), ("E5", 0.5), ("G5", 1), ("F#5", 2), ("E5", 2.5), ("B4", 3)],
    [("C5", 0), ("E5", 0.5), ("G5", 1), ("E5", 2), ("D5", 3), ("B4", 3.5)],
]


def groove(bar, hook=False, shaker=False, light=False):
    b0 = bar * BAR
    root, notes = CHORDS[bar % 4]
    freqs = [hz(n) for n in notes]
    for k in ([0, 1.5, 2] if not light else [0, 2]):
        place(KICK, b0 + k * BEAT, 0.95)
    for k in (1, 3):
        place(CLAP, b0 + k * BEAT, 0.42 if not light else 0.3)
    for k in range(8):
        place(HAT, b0 + k * BEAT / 2 + (0.018 if k % 2 else 0), 0.16 if k % 2 else 0.22)
    place(OHAT, b0 + 3.5 * BEAT, 0.12)
    if shaker:
        for k in range(16):
            place(SHAKER, b0 + k * BEAT / 4, 0.07 if k % 2 else 0.04)
    for k, mult in [(0, 1), (0.75, 1), (1.5, 1), (2, 1.5), (3, 1), (3.5, 2)]:
        place(bass(hz(root) * mult, BEAT * 0.7), b0 + k * BEAT, 0.5)
    for k in (0.5, 1.5, 2.5, 3.5):
        place(keys(freqs, BEAT * 0.45), b0 + k * BEAT, 0.42)
    place(keys(freqs, BEAT * 2), b0, 0.3)
    if hook:
        for name, at in HOOK[bar % 4]:
            place(marimba(hz(name)), b0 + at * BEAT, 0.34)


# --- Arrangement (bar = 2.376 s) -------------------------------------------
# 0-1  intro    2-11 groove (hook from 6)    12-13 breakdown (scene 6)
# 14   build    15-22 full groove + hook      23 big hit on the logo, outro
for bar in range(0, 2):
    groove(bar, light=True)
for bar in range(2, 12):
    groove(bar, hook=bar >= 6)
for bar in (12, 13):
    root, notes = CHORDS[2 if bar == 12 else 3]
    place(pad([hz(n) for n in notes], BAR + 0.3), bar * BAR, 0.55)
    place(keys([hz(n) for n in notes], BAR, 0.6), bar * BAR, 0.35)
    place(bass(hz(root), BAR * 0.9), bar * BAR, 0.4)
    for k in (0, 2):
        place(marimba(hz(HOOK[bar % 4][k][0])), bar * BAR + k * BEAT, 0.22)
b0 = 14 * BAR
root, notes = CHORDS[1]
for k in range(4):
    place(KICK, b0 + k * BEAT, 0.8)
    place(bass(hz(root), BEAT * 0.8), b0 + k * BEAT, 0.45)
for k in range(16):
    place(CLAP, b0 + k * BEAT / 4, 0.08 + 0.3 * k / 15)
t = tt(BAR)
riser = np.zeros(len(t))
noise = rng.standard_normal(len(t))
lp = 0.0
for i in range(len(t)):
    a = np.exp(-2 * np.pi * (400 + 7000 * (i / len(t)) ** 2) / SR)
    lp = (1 - a) * noise[i] + a * lp
    riser[i] = lp
place(riser * np.linspace(0, 1, len(t)) ** 2, b0, 0.5)
place(pad([hz(n) for n in notes], BAR), b0, 0.35)
place(CRASH, 15 * BAR, 0.5)
for bar in range(15, 23):
    groove(bar, hook=True, shaker=True)
# Big hit as the logo lands, then a short outro that rings out.
end = 23 * BAR
place(CRASH, end, 0.7)
place(KICK, end, 1.0)
place(pad([hz(n) for n in ["G3", "B3", "D4", "G4"]], 5.6), end, 0.6)
place(keys([hz(n) for n in ["G3", "B3", "D4", "G4"]], 3.0), end, 0.6)
place(bass(hz("G2"), 2.5), end, 0.6)
for i, n in enumerate(["G4", "B4", "D5", "G5", "B5", "D6"]):
    place(marimba(hz(n), 1.6), end + i * BEAT / 4, 0.3)
for k in range(1, 8):
    place(HAT, end + k * BEAT / 2, 0.1)
for k in (2, 4, 6):
    place(KICK, end + k * BEAT, 0.6)
place(CLAP, end + 1 * BEAT, 0.25)
place(CLAP, end + 3 * BEAT, 0.25)
final = end + 4 * BEAT
for i, n in enumerate(["D5", "G5"]):
    place(marimba(hz(n), 2.0), final + i * BEAT / 2, 0.32)
place(keys([hz(n) for n in ["G3", "B3", "D4"]], 2.5, 0.5), final, 0.5)

mix = mix[: int(DUR * SR)]
fade = np.ones(len(mix))
fade[-int(1.6 * SR) :] = np.linspace(1, 0, int(1.6 * SR)) ** 1.5
mix *= fade
mix = mix / np.max(np.abs(mix)) * 0.89
os.makedirs("public/music", exist_ok=True)
tmp = "/tmp/music-beat.wav"
with wave.open(tmp, "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-b:a", "160k", "public/music/music-beat.mp3"], check=True)
os.remove(tmp)
print("done, logo hit at %.3f s" % end)
