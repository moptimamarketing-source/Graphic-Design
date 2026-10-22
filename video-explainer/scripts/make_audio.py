"""Jana SFX (ikut timing.json) dan beat latar ringkas -> public/sfx.wav, public/music.wav.

Semua bunyi disintesis dengan numpy, jadi tiada isu hak cipta.
"""
import json
import os
import wave

import numpy as np

SR = 44100
ROOT = os.path.join(os.path.dirname(__file__), "..")
timing = json.load(open(os.path.join(ROOT, "src", "timing.json")))
DUR = timing["end"] + 0.5
rng = np.random.default_rng(3)


def t_axis(sec):
    return np.arange(int(sec * SR)) / SR


def env(n, attack=0.005, decay=0.2):
    t = np.arange(n) / SR
    return np.minimum(1, t / attack) * np.exp(-t / decay)


def lowpass(x, alpha):
    """Penapis satu-kutub; alpha boleh jadi tatasusunan (berubah ikut masa)."""
    y = np.empty_like(x)
    acc = 0.0
    a = np.broadcast_to(alpha, x.shape)
    for i in range(len(x)):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y


def whoosh():
    t = t_axis(0.35)
    n = rng.standard_normal(len(t))
    sweep = np.linspace(0.02, 0.35, len(t)) ** 1.5
    body = lowpass(n, sweep)
    shape = np.sin(np.pi * np.clip(t / 0.35, 0, 1)) ** 2
    return 0.9 * body * shape


def pop():
    t = t_axis(0.12)
    f = 900 * np.exp(-t * 30) + 300
    return 0.6 * np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.002, 0.04)


def tick():
    out = np.zeros(int(0.9 * SR))
    for k in range(9):
        s = int(k * 0.1 * SR)
        c = t_axis(0.025)
        out[s : s + len(c)] += 0.35 * np.sin(2 * np.pi * 2200 * c) * env(len(c), 0.001, 0.006)
    return out


def ding():
    t = t_axis(0.9)
    tone = sum(a * np.sin(2 * np.pi * f * t) for f, a in [(1320, 0.5), (2640, 0.2), (1980, 0.15)])
    return 0.45 * tone * env(len(t), 0.003, 0.25)


def thud():
    t = t_axis(0.35)
    f = 140 * np.exp(-t * 12) + 45
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.002, 0.12)
    click = lowpass(rng.standard_normal(len(t)), 0.3) * env(len(t), 0.001, 0.015)
    return 0.95 * body + 0.4 * click


def glitch():
    t = t_axis(0.6)
    sq = np.sign(np.sin(2 * np.pi * 110 * t * (1 + 0.5 * np.sign(np.sin(2 * np.pi * 13 * t)))))
    gate = (np.sin(2 * np.pi * 22 * t) > 0).astype(float)
    return 0.22 * sq * gate * env(len(t), 0.002, 0.3)


def swing():
    t = t_axis(0.6)
    n = lowpass(rng.standard_normal(len(t)), 0.08 + 0.1 * np.sin(np.pi * t / 0.6))
    return 0.8 * n * np.sin(np.pi * t / 0.6) ** 2


def shine():
    t = t_axis(1.0)
    out = np.zeros(len(t))
    for k, f in enumerate([1568, 1976, 2349, 3136]):
        s = int(k * 0.06 * SR)
        c = t_axis(0.8)
        out[s : s + len(c)] += 0.18 * np.sin(2 * np.pi * f * c) * env(len(c), 0.002, 0.25)
    return out


SFX = {"pop": pop, "tick": tick, "ding": ding, "thud": thud, "glitch": glitch, "swing": swing, "shine": shine}


def place(buf, clip, at, gain=1.0):
    s = int(at * SR)
    e = min(len(buf), s + len(clip))
    if s < len(buf):
        buf[s:e] += gain * clip[: e - s]


sfx = np.zeros(int(DUR * SR))
for sc in timing["scenes"][1:]:
    place(sfx, whoosh(), max(0, sc["start"] - 0.12), 0.7)
for at, kind in timing["sfx"]:
    place(sfx, SFX[kind](), at)

# Beat ringkas ~100 BPM: kick, hi-hat, bass, kord pluck.
bpm = 100
beat = 60 / bpm
music = np.zeros_like(sfx)
kick_t = t_axis(0.4)
kick = np.sin(2 * np.pi * np.cumsum(120 * np.exp(-kick_t * 20) + 42) / SR) * env(len(kick_t), 0.001, 0.18)
hat_t = t_axis(0.06)
hat = np.diff(rng.standard_normal(len(hat_t) + 1)) * env(len(hat_t), 0.001, 0.015)
roots = [55.0, 55.0, 43.65, 49.0]  # A, A, F, G
for b in range(int(DUR / beat)):
    at = b * beat
    bar = (b // 4) % 4
    if b % 4 in (0, 2) or b % 8 == 7:
        place(music, kick, at, 0.9)
    place(music, hat, at + beat / 2, 0.25)
    bt = t_axis(beat * 0.9)
    bass = np.sin(2 * np.pi * roots[bar] * 2 * bt) * env(len(bt), 0.01, 0.35)
    place(music, bass, at, 0.5)
    if b % 2 == 0:
        ct = t_axis(0.5)
        chord = sum(np.sin(2 * np.pi * roots[bar] * 4 * r * ct) for r in (1, 1.26, 1.5)) / 3
        place(music, chord * env(len(ct), 0.003, 0.12), at + beat * 0.5, 0.25)
# Fade out hujung
fade = np.ones_like(music)
fe = int(1.2 * SR)
fade[-fe:] = np.linspace(1, 0, fe)
music *= fade


def write(name, x):
    x = x / max(1e-9, np.abs(x).max()) * 0.9
    data = (x * 32767).astype(np.int16)
    with wave.open(os.path.join(ROOT, "public", name), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


write("sfx.wav", sfx)
write("music.wav", music)
print("audio siap", round(DUR, 2), "s")
