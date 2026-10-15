"""Soundtrack: original music arranged to the edit + synthesized SFX + clean voice, ducked and mastered.

usage: python audio.py build_dir out_wav
reads build_dir/voice.wav (48 kHz mono) and writes the stereo master plus stems.
"""
import subprocess
import sys

import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

import music

SR = 48000
music.SR = SR
rng = np.random.default_rng(11)
TOTAL = 42.5

HOLD = (33.04, 33.90)  # punchline freeze: music drops out
ARRANGEMENT = [("intro", 2), ("verse", 12), ("build", 3), ("drop", 3), ("outro", 1)]


def t_axis(d):
    return np.arange(int(d * SR)) / SR


def flt(x, kind, f):
    return sosfilt(butter(2, f, kind, fs=SR, output="sos"), x)


# ---------- SFX (all synthesized) ----------

def whoosh(d=0.5, up=True):
    t = t_axis(d)
    n = rng.standard_normal(len(t))
    k = t / d
    env = np.sin(np.pi * k) ** 1.5
    lo, hi = flt(n, "low", 1200), flt(n, "high", 2500)
    mix = (k if up else 1 - k)
    return (lo * (1 - mix) + hi * mix) * env * 0.9


def swish(d=0.22):
    t = t_axis(d)
    n = flt(rng.standard_normal(len(t)), "band", [1800, 7000])
    return n * np.sin(np.pi * t / d) ** 2 * 0.8


def pop(pitch=900, d=0.12):
    t = t_axis(d)
    f = pitch * (1 + 1.2 * np.exp(-t * 60))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 35) * 0.8


def click():
    t = t_axis(0.05)
    return (flt(rng.standard_normal(len(t)), "high", 3000) * np.exp(-t * 300) + np.sin(2 * np.pi * 2200 * t) * np.exp(-t * 120) * 0.5) * 0.9


def tick(pitch=2400):
    t = t_axis(0.04)
    return np.sin(2 * np.pi * pitch * t) * np.exp(-t * 150) * 0.6


def ding(m=88):
    t = t_axis(1.0)
    f = music.hz(m)
    x = np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 6)
    return x * np.exp(-t * 4.5) * 0.45


def stamp():
    t = t_axis(0.35)
    body = np.sin(2 * np.pi * np.cumsum(60 + 140 * np.exp(-t * 40)) / SR) * np.exp(-t * 14)
    slap = flt(rng.standard_normal(len(t)), "band", [400, 4000]) * np.exp(-t * 45) * 0.6
    return np.tanh(2 * (body + slap)) * 0.8


def impact(big=True):
    t = t_axis(2.4 if big else 1.0)
    boom = np.sin(2 * np.pi * np.cumsum(32 + 90 * np.exp(-t * 8)) / SR) * np.exp(-t * (1.8 if big else 4))
    crack = flt(rng.standard_normal(len(t)), "high", 2000) * np.exp(-t * (3 if big else 9)) * 0.4
    return np.tanh(2.2 * boom) * 0.9 + crack


def tape_stop(d=0.55):
    t = t_axis(d)
    f = 220 * (1 - t / d) ** 2 + 20
    x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.25 + np.sin(2 * np.pi * np.cumsum(f * 0.5) / SR) * 0.5
    return flt(x, "low", 900) * (1 - t / d) * 0.7


def reverse_swell(d=0.86):
    t = t_axis(d)
    k = t / d
    n = flt(rng.standard_normal(len(t)), "high", 3500)
    tone = np.sin(2 * np.pi * np.cumsum(300 + 900 * k ** 3) / SR) * 0.15
    return (n * 0.6 + tone) * k ** 3


def sparkle():
    out = np.zeros(int(1.2 * SR))
    for i, m in enumerate([96, 100, 103, 108, 103, 108]):
        s = ding(m) * 0.35
        j = int(i * 0.07 * SR)
        out[j:j + len(s)] += s[: len(out) - j]
    return out


def car_pass(d=1.0):
    t = t_axis(d)
    k = t / d
    f = 95 * (1 + 0.25 * (0.5 - k))  # doppler-ish drop
    eng = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.3
    wind = flt(rng.standard_normal(len(t)), "band", [300, 2500]) * 0.5
    return flt(eng + wind, "low", 2200) * np.exp(-((k - 0.5) ** 2) / 0.05) * 0.8


# cue sheet: (time, sound, gain, pan)
CUES = [
    (0.00, whoosh(0.45), 0.55, 0), (0.28, pop(700), 0.7, 0), (0.62, stamp(), 0.55, 0),
    (3.05, whoosh(0.18), 0.5, 0), (3.18, pop(520, 0.18), 0.85, 0),
    (4.90, stamp(), 0.7, 0), (4.92, impact(False), 0.35, 0),
    (6.95, whoosh(0.32), 0.6, -0.3),
    (7.40, pop(1000), 0.55, -0.2),
    (9.25, click(), 0.6, 0), (9.38, click(), 0.5, 0),
    (10.92, ding(88), 0.7, 0.1),
    (12.70, whoosh(0.32), 0.6, 0.3), (13.0, impact(False), 0.3, 0),
    (13.30, pop(900), 0.5, -0.3), (13.62, pop(1100), 0.5, 0.3), (13.94, pop(1300), 0.5, 0),
    (15.30, swish(0.35), 0.6, 0),
    (15.86, swish(0.16), 0.55, 0), (16.05, car_pass(1.1), 0.55, -0.4), (16.85, stamp(), 0.55, 0),
    (17.36, swish(0.16), 0.55, 0), (17.62, pop(800), 0.5, 0),
    (19.25, tick(2600), 0.8, 0), (19.27, pop(1200, 0.08), 0.4, 0),
    (21.12, tick(2600), 0.8, 0), (21.14, pop(1300, 0.08), 0.4, 0),
    (21.93, tick(2600), 0.8, 0), (21.95, pop(1450, 0.08), 0.4, 0),
    (22.45, whoosh(0.32), 0.6, -0.3), (22.86, impact(False), 0.4, 0), (22.88, stamp(), 0.4, 0),
    (25.05, swish(0.16), 0.5, 0), (25.20, tick(1800), 0.7, -0.3), (25.42, tick(2100), 0.7, 0), (25.64, tick(2400), 0.7, 0.3),
    (26.05, pop(950), 0.55, 0), (27.0, swish(0.16), 0.45, 0),
    (28.70, whoosh(0.32), 0.6, 0.3),
    (33.04, tape_stop(), 0.75, 0), (HOLD[0] + 0.04, reverse_swell(HOLD[1] - HOLD[0] + 0.06), 0.6, 0),
    (34.00, impact(True), 0.8, 0), (34.02, whoosh(0.4, up=False), 0.4, 0), (34.08, sparkle(), 0.35, 0),
    (35.20, whoosh(0.32), 0.6, -0.3), (35.62, pop(850), 0.55, 0), (36.02, click(), 0.85, 0),
    (39.00, whoosh(0.4), 0.65, 0), (40.06, sparkle(), 0.35, 0), (40.6, pop(700), 0.4, 0),
]
# rising countdown ticks under "cawangan paling dekat dengan rumah anda..."
for i, tt in enumerate(np.cumsum([0.32] * 3 + [0.26] * 3 + [0.2] * 4) + 30.3):
    if tt < HOLD[0]:
        CUES.append((float(tt), tick(1600 + i * 120), 0.45, 0))


def place(buf, t, sig, gain, pan=0.0):
    i = int(t * SR)
    if i >= buf.shape[1]:
        return
    sig = sig[: buf.shape[1] - i] * gain
    buf[0, i:i + len(sig)] += sig * np.sqrt(0.5 * (1 - pan))
    buf[1, i:i + len(sig)] += sig * np.sqrt(0.5 * (1 + pan))


def envelope(x, attack=0.02, release=0.35):
    a, r = np.exp(-1 / (attack * SR)), np.exp(-1 / (release * SR))
    y = np.zeros_like(x)
    lvl = 0.0
    ax = np.abs(x)
    for i in range(0, len(x), 48):  # 1 ms steps
        v = ax[i:i + 48].max()
        lvl = v + (lvl - v) * (a ** 48 if v > lvl else r ** 48)
        y[i:i + 48] = lvl
    return y


def lufs(path):
    out = subprocess.run(["ffmpeg", "-hide_banner", "-i", path, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    tail = out[out.rfind("Integrated loudness"):]
    return tail.split("I:")[1].split("LUFS")[0].strip()


def main(build, out_wav):
    n = int(TOTAL * SR)
    voice, vsr = sf.read(f"{build}/voice.wav", dtype="float64")
    assert vsr == SR
    voice = np.pad(voice, (0, max(0, n - len(voice))))[:n]

    music.render(ARRANGEMENT, f"{build}/music_raw.wav")
    m, _ = sf.read(f"{build}/music_raw.wav", dtype="float64")
    m = np.pad(m.T, ((0, 0), (0, max(0, n - m.shape[0]))))[:, :n]

    # duck music under the voice: up to -11 dB while she talks, smooth release
    env = envelope(voice)
    env = env / (np.percentile(env[env > 0.01], 90) + 1e-9)
    duck = 1 - 0.72 * np.clip(env, 0, 1)
    # hard drop-out during the punchline freeze, back in on the drop
    t = np.arange(n) / SR
    gate = np.ones(n)
    f0, f1 = HOLD[0], HOLD[1] + 0.08
    gate[(t >= f0 + 0.05) & (t < f1)] = 0.0
    ramp = (t >= f0) & (t < f0 + 0.05)
    gate[ramp] = 1 - (t[ramp] - f0) / 0.05
    music_bed = m * duck * gate * 0.55
    # end fade
    fade = t > TOTAL - 1.0
    music_bed[:, fade] *= np.linspace(1, 0, fade.sum())

    sfx = np.zeros((2, n))
    for tt, sig, g, pan in CUES:
        place(sfx, tt, sig, g * 0.55, pan)

    v2 = np.stack([voice, voice]) * 1.0
    mix = v2 + music_bed + sfx
    sf.write(f"{build}/stem_voice.wav", v2.T, SR, subtype="PCM_24")
    sf.write(f"{build}/stem_music.wav", music_bed.T, SR, subtype="PCM_24")
    sf.write(f"{build}/stem_sfx.wav", sfx.T, SR, subtype="PCM_24")
    pre = f"{build}/mix_pre.wav"
    sf.write(pre, (mix / max(1.0, np.abs(mix).max() / 0.98)).T, SR, subtype="PCM_24")

    # two-pass loudness normalisation to -14 LUFS / -1 dBTP (social platforms)
    meas = subprocess.run(["ffmpeg", "-hide_banner", "-i", pre, "-af", "loudnorm=I=-14:TP=-1.0:LRA=9:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
    import json
    js = json.loads(meas[meas.rfind("{"):meas.rfind("}") + 1])
    af = (f"loudnorm=I=-14:TP=-1.0:LRA=9:measured_I={js['input_i']}:measured_TP={js['input_tp']}:"
          f"measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", pre, "-af", af, "-ar", str(SR), "-c:a", "pcm_s24le", out_wav], check=True)
    print("master", out_wav, "LUFS", lufs(out_wav))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
