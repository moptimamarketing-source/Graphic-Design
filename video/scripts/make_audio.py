"""Synthesise the sound effects and the soft background music bed.

Everything is generated from scratch (no samples), so there is nothing to
license. Run from the video/ folder:  python scripts/make_audio.py
Outputs: public/sfx/*.wav and public/music/music-bed.mp3
"""
import os
import subprocess
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


# --- Music bed: soft plucked arpeggios in G, 92 BPM ------------------------
def pluck(freq, dur, bright=0.5):
    n = int(dur * SR)
    period = int(SR / freq)
    buf = lowpass(rng.uniform(-1, 1, period), 2000 + 4000 * bright)
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % period]
        buf[i % period] = 0.996 * 0.5 * (buf[i % period] + buf[(i + 1) % period])
    return out * np.minimum(1, np.arange(n) / 60)


def note(name):
    names = {"C": -9, "D": -7, "E": -5, "F": -4, "G": -2, "A": 0, "B": 2}
    return 440 * 2 ** ((names[name[0]] + 12 * (int(name[-1]) - 4)) / 12)


DUR = 60.1
BEAT = 60 / 92
mix = np.zeros(int((DUR + 3) * SR))
chords = [
    ("G2", ["G3", "B3", "D4", "G4", "B4", "D4", "G4", "B3"]),
    ("D3", ["D3", "F4", "A3", "D4", "F4", "A3", "D4", "A3"]),
    ("E2", ["E3", "G3", "B3", "E4", "G4", "B3", "E4", "G3"]),
    ("C3", ["C3", "E3", "G3", "C4", "E4", "G3", "C4", "E3"]),
]
# F4 above stands for F#4 in D major.
SHARP = {"F4": 369.99, "F3": 185.0}

END = 54.66  # "Minda Optima" — music settles on the home chord here
pos = 0.0
bar = 0
while pos < END - 4 * BEAT + 0.01:
    bass, arp = chords[bar % 4]
    s = int(pos * SR)
    b = pluck(note(bass), 4 * BEAT, 0.2) * 0.55
    mix[s : s + len(b)] += b
    for k, nm in enumerate(arp):
        fr = SHARP.get(nm, note(nm))
        p = pluck(fr, 1.6, 0.45) * (0.32 if k % 2 == 0 else 0.24)
        ss = int((pos + k * BEAT / 2) * SR)
        mix[ss : ss + len(p)] += p[: len(mix) - ss]
    pos += 4 * BEAT
    bar += 1
# Bridge to the end card, then a slow resolving G arpeggio and pad.
while pos < END - 0.01:
    s = int(pos * SR)
    p = pluck(note("D3"), 1.2, 0.3) * 0.35
    mix[s : s + len(p)] += p
    pos += BEAT
for k, nm in enumerate(["G2", "D3", "G3", "B3", "D4", "G4"]):
    p = pluck(note(nm), 4.5, 0.4) * 0.35
    ss = int((END + k * 0.28) * SR)
    mix[ss : ss + len(p)] += p
pad_t = t(DUR + 3)
pad = sum(np.sin(2 * np.pi * note(n) * pad_t) + np.sin(2 * np.pi * note(n) * 1.003 * pad_t) for n in ["G3", "B3", "D4"])
pad_env = np.clip((pad_t - 0.5) / 4, 0, 1) * 0.05
mix += pad * pad_env
mix = mix[: int(DUR * SR)]
fade = np.ones(len(mix))
fade[: int(1.2 * SR)] = np.linspace(0, 1, int(1.2 * SR))
fade[-int(2.5 * SR) :] = np.linspace(1, 0, int(2.5 * SR))
mix *= fade
save("/tmp/music-bed.wav", lowpass(mix, 5200), 0.7)
subprocess.run(
    ["ffmpeg", "-v", "error", "-y", "-i", "/tmp/music-bed.wav", "-b:a", "128k", "public/music/music-bed.mp3"],
    check=True,
)
os.remove("/tmp/music-bed.wav")
print("done")
