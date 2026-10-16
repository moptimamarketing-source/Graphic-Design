"""Synthesise the sound effects.

Everything is generated from scratch (no samples), so there is nothing to
license. Run from the video/ folder:  python scripts/make_audio.py
Outputs: public/sfx/*.wav (the music is made by make_beat.py)
"""
import os
import wave

import numpy as np

SR = 44100
rng = np.random.default_rng(1995)
os.makedirs("public/sfx", exist_ok=True)
os.makedirs("public/music", exist_ok=True)


def save(path, x, peak=0.5):
    x = np.asarray(x, dtype=np.float64)
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    pcm = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def t(sec):
    return np.arange(int(sec * SR)) / SR


def lowpass(x, cutoff):
    # one-pole low-pass, cutoff may be an array (sweeps)
    cutoff = np.broadcast_to(cutoff, x.shape)
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.zeros_like(x)
    prev = 0.0
    for i in range(len(x)):
        prev = (1 - a[i]) * x[i] + a[i] * prev
        y[i] = prev
    return y


# --- Sound effects ---------------------------------------------------------
tt = t(0.42)
noise = rng.standard_normal(len(tt))
sweep = 300 + 2600 * np.sin(np.pi * tt / tt[-1]) ** 2
env = np.sin(np.pi * tt / tt[-1]) ** 1.5
save("public/sfx/whoosh.wav", lowpass(noise, sweep) * env, 0.45)

tt = t(0.14)
f = 520 + 900 * (tt / tt[-1])
save("public/sfx/pop.wav", np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 30), 0.5)

tt = t(1.2)
bell = sum(a * np.sin(2 * np.pi * fr * tt) for fr, a in [(1318.5, 1), (2637, 0.35), (3955, 0.12)])
save("public/sfx/ding.wav", bell * np.exp(-tt * 4.5) * np.minimum(1, tt * 400), 0.42)

tt = t(0.5)
crackle = lowpass(rng.standard_normal(len(tt)), 3500) * (np.exp(-((tt - 0.12) ** 2) / 0.004) + 0.6 * np.exp(-((tt - 0.3) ** 2) / 0.003))
save("public/sfx/page.wav", crackle, 0.4)

tt = t(0.25)
thud = np.sin(2 * np.pi * 110 * tt) * np.exp(-tt * 22) + 0.3 * lowpass(rng.standard_normal(len(tt)), 900) * np.exp(-tt * 40)
save("public/sfx/thud.wav", thud, 0.5)

tt = t(0.08)
save("public/sfx/click.wav", np.sin(2 * np.pi * 1800 * tt) * np.exp(-tt * 90), 0.45)

tt = t(1.4)
spark = np.zeros(len(tt))
for i, fr in enumerate([1568, 2093, 2637, 3136]):
    s = int(i * 0.07 * SR)
    seg = tt[: len(tt) - s]
    spark[s:] += np.sin(2 * np.pi * fr * seg) * np.exp(-seg * 6)
save("public/sfx/sparkle.wav", spark, 0.35)

tt = t(2.6)
chime = np.zeros(len(tt))
for i, fr in enumerate([784, 988, 1175, 1568]):
    s = int(i * 0.11 * SR)
    seg = tt[: len(tt) - s]
    chime[s:] += (np.sin(2 * np.pi * fr * seg) + 0.3 * np.sin(4 * np.pi * fr * seg)) * np.exp(-seg * 2.2)
save("public/sfx/chime.wav", chime, 0.4)

tt = t(0.3)
swish = lowpass(rng.standard_normal(len(tt)), 1200 + 5000 * tt / tt[-1]) * np.sin(np.pi * tt / tt[-1])
save("public/sfx/swish.wav", swish, 0.4)


print("done")
