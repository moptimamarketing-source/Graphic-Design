"""Original upbeat background track for the Minda Optima 'Sesi Petang' reel.

Everything is synthesised here (no samples), so the track is royalty-free.
Grid: bar = 2.008 s (119.5 BPM). Bar 0 starts at 1.608 s so that
  - bar 4 (the drop) lands on 9.640 s  -> "2,700" count-up landing
  - bar 12 (final hit) lands on 25.704 s -> end card
The 0 - 1.608 s pickup is a build under "Berita baik, parents!".
"""
import sys
import numpy as np
import scipy.signal as ss
from scipy.io import wavfile

SR = 48000
BAR = 2.008
BEAT = BAR / 4
T0 = 1.608
LENGTH = 30.0
rng = np.random.default_rng(7)

N = int(LENGTH * SR)
bus = {k: np.zeros((N, 2)) for k in ["drums", "bass", "pad", "arp", "lead", "fx"]}


def bt(bar, beat=0.0):
    return T0 + bar * BAR + beat * BEAT


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def place(name, sig, t, gain=1.0, pan=0.0):
    i = int(round(t * SR))
    if i >= N:
        return
    if sig.ndim == 1:
        l = np.cos((pan + 1) * np.pi / 4)
        r = np.sin((pan + 1) * np.pi / 4)
        sig = np.stack([sig * l, sig * r], 1) * np.sqrt(2)
    j = min(N, i + len(sig))
    if i < 0:
        sig = sig[-i:]
        i = 0
    bus[name][i:j] += sig[: j - i] * gain


def sos(kind, f, order=2):
    return ss.butter(order, f, btype=kind, fs=SR, output="sos")


def polyblep_saw(freq, n, phase0=0.0):
    dt = freq / SR
    t = (phase0 + dt * np.arange(n)) % 1.0
    y = 2 * t - 1
    m = t < dt
    x = t[m] / dt
    y[m] -= x + x - x * x - 1
    m = t > 1 - dt
    x = (t[m] - 1) / dt
    y[m] -= x * x + x + x + 1
    return y


def env_adsr(n, a, d, s, r, sustain_len):
    t = np.arange(n) / SR
    e = np.where(t < a, t / max(a, 1e-4), s + (1 - s) * np.exp(-(t - a) / max(d, 1e-4)))
    rel = t > sustain_len
    e[rel] *= np.exp(-(t[rel] - sustain_len) / max(r, 1e-4))
    return e


# ---------------------------------------------------------------- drums
def kick(level=1.0):
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = 46 + 130 * np.exp(-t * 32)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 6.5)
    click = ss.sosfilt(sos("highpass", 2500), rng.standard_normal(n)) * np.exp(-t * 400) * 0.35
    return np.tanh((body + click) * 1.6) * level


def clap():
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    noise = ss.sosfilt(sos("bandpass", [900, 3200]), rng.standard_normal(n))
    e = np.zeros(n)
    for k, off in enumerate([0, 0.009, 0.018]):
        m = t >= off
        e[m] += np.exp(-(t[m] - off) * (180 if k < 2 else 22))
    body = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 40) * 0.25
    return (noise * e * 0.6 + body)


def snare_hit(level=1.0):
    n = int(0.22 * SR)
    t = np.arange(n) / SR
    noise = ss.sosfilt(sos("bandpass", [1200, 7000]), rng.standard_normal(n)) * np.exp(-t * 28)
    tone = np.sin(2 * np.pi * 210 * t) * np.exp(-t * 35)
    return (noise * 0.55 + tone * 0.45) * level


def hat(open_=False):
    n = int((0.28 if open_ else 0.05) * SR)
    t = np.arange(n) / SR
    noise = ss.sosfilt(sos("highpass", 7500, 4), rng.standard_normal(n))
    return noise * np.exp(-t * (14 if open_ else 90))


def crash(length=2.2):
    n = int(length * SR)
    t = np.arange(n) / SR
    noise = ss.sosfilt(sos("highpass", 4000, 2), rng.standard_normal((n, 2)), axis=0)
    return noise * np.exp(-t * 2.4)[:, None] * 0.5


def impact():
    n = int(2.5 * SR)
    t = np.arange(n) / SR
    f = 30 + 70 * np.exp(-t * 9)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2)
    return np.tanh(boom * 1.4)


K, CL, HC, HO = kick(), clap(), hat(), hat(True)


def groove(bar, kind):
    """kind: 'A' (verse), 'B' (drop), 'half' (breakdown pulse)"""
    for b in range(4):
        if kind in ("A", "B"):
            place("drums", K, bt(bar, b), 1.0)
        if kind in ("A", "B") and b in (1, 3):
            place("drums", CL, bt(bar, b), 0.55, 0.0)
        if kind == "half" and b == 0:
            place("drums", K, bt(bar, b), 0.55)
    if kind in ("A", "B"):
        for e8 in range(8):
            if e8 % 2 == 1:
                place("drums", HO if kind == "B" else HC, bt(bar, e8 / 2), 0.16 if kind == "B" else 0.28, 0.25)
        steps = 16 if kind == "B" else 8
        for s in range(steps):
            if kind == "A" and s % 2 == 1:
                continue
            vel = 0.13 if s % 4 == 0 else 0.08
            place("drums", HC, bt(bar, s / 4), vel, -0.3)
    if kind == "B":
        # ghost snare pickup at the end of every 2nd bar
        if bar % 2 == 1:
            for s in (13, 14, 15):
                place("drums", snare_hit(), bt(bar, s / 4), 0.18 + 0.05 * (s - 13))


def snare_roll(t_start, t_end, start_div=2, end_div=8, lvl0=0.15, lvl1=0.5):
    t = t_start
    while t < t_end - 1e-6:
        p = (t - t_start) / (t_end - t_start)
        div = start_div * (end_div / start_div) ** p
        step = BEAT / div
        place("drums", snare_hit(), t, lvl0 + (lvl1 - lvl0) * p ** 1.5, 0.1)
        t += step


def riser(t_start, t_end, level=0.5):
    n = int((t_end - t_start) * SR)
    t = np.arange(n) / SR
    p = t / t[-1]
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    blk = 2048
    for i in range(0, n, blk):
        fc = 400 * (12000 / 400) ** p[min(i + blk // 2, n - 1)]
        seg = ss.sosfilt(sos("bandpass", [fc * 0.7, min(fc * 1.4, 20000)]), noise[max(0, i - 4096): i + blk])
        out[i:i + blk] = seg[-len(out[i:i + blk]):]
    f = 220 * 2 ** (2.0 * p)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.15
    sig = (out * 0.8 + tone) * (p ** 2) * level
    place("fx", sig, t_start, 1.0)


def reverse_crash(t_hit, length=1.2, level=0.6):
    c = crash(length)[::-1]
    place("fx", c, t_hit - length, level)


# ---------------------------------------------------------------- harmony
CH = {
    "D": [62, 66, 69, 74], "A": [61, 64, 69, 73], "Bm": [62, 66, 71, 74], "G": [62, 67, 71, 74],
}
ROOT = {"D": 38, "A": 33, "Bm": 35, "G": 31}
# (bar, beat_offset, chord, beats)
PROG = [
    (0, 0, "D", 4), (1, 0, "A", 4), (2, 0, "Bm", 4), (3, 0, "G", 2), (3, 2, "A", 2),
    (4, 0, "D", 4), (5, 0, "A", 4), (6, 0, "Bm", 4), (7, 0, "G", 4), (8, 0, "D", 4),
    (9, 0, "Bm", 4), (10, 0, "G", 2), (10, 2, "A", 2),
    (11, 0, "D", 2), (11, 2, "A", 2), (12, 0, "D", 8),
]
SECTION = {0: "A", 1: "A", 2: "A", 3: "build", 4: "B", 5: "B", 6: "B", 7: "B", 8: "B",
           9: "break", 10: "build", 11: "B", 12: "end"}


def supersaw(freq, n, voices=7, spread=0.16):
    det = np.linspace(-spread, spread, voices)
    out = np.zeros((n, 2))
    for k, d in enumerate(det):
        f = freq * 2 ** (d / 12)
        s = polyblep_saw(f, n, rng.random())
        pan = (k / (voices - 1)) * 2 - 1
        out[:, 0] += s * np.cos((pan + 1) * np.pi / 4)
        out[:, 1] += s * np.sin((pan + 1) * np.pi / 4)
    return out / voices


def pad_chord(chord, t, beats, bright):
    dur = beats * BEAT
    n = int((dur + 0.6) * SR)
    sig = np.zeros((n, 2))
    for m in CH[chord]:
        sig += supersaw(mtof(m), n)
    sig /= 4
    sig = ss.sosfilt(sos("lowpass", bright, 2), sig, axis=0)
    e = env_adsr(n, 0.02, 0.4, 0.75, 0.25, dur)
    place("pad", sig * e[:, None], t, 0.9)


def bass_note(midi, t, dur, level=1.0, release=0.04):
    n = int((dur + max(0.05, release * 4)) * SR)
    f = mtof(midi)
    tt = np.arange(n) / SR
    sub = np.sin(2 * np.pi * f * tt)
    saw = ss.sosfilt(sos("lowpass", 520), polyblep_saw(f, n))
    e = env_adsr(n, 0.004, 0.15, 0.7, release, dur)
    place("bass", np.tanh((sub * 0.8 + saw * 0.5) * 1.3) * e, t, level)


def pluck(midi, t, level=0.3, pan=0.0):
    n = int(0.5 * SR)
    f = mtof(midi)
    tt = np.arange(n) / SR
    s = polyblep_saw(f, n) * 0.6 + polyblep_saw(f * 1.005, n, 0.3) * 0.4
    # decaying low-pass approximated with two filtered layers
    bright = ss.sosfilt(sos("lowpass", 5500), s)
    dark = ss.sosfilt(sos("lowpass", 900), s)
    ed = np.exp(-tt * 18)
    sig = (bright * ed + dark * (1 - ed)) * np.exp(-tt * 7)
    place("arp", sig, t, level, pan)


def bell(midi, t, level=0.25, pan=0.0, length=1.4):
    n = int(length * SR)
    f = mtof(midi)
    tt = np.arange(n) / SR
    idx = 2.2 * np.exp(-tt * 5)
    sig = np.sin(2 * np.pi * f * tt + idx * np.sin(2 * np.pi * f * 3.5 * tt))
    sig += 0.25 * np.sin(2 * np.pi * f * 2 * tt) * np.exp(-tt * 6)
    place("lead", sig * np.exp(-tt * 3.2) * (1 - np.exp(-tt * 400)), t, level, pan)


ARP_PAT = [0, 2, 1, 3, 2, 1, 3, 2, 0, 2, 1, 3, 2, 3, 1, 2]

for bar, off, chord, beats in PROG:
    sec = SECTION[bar]
    t = bt(bar, off)
    bright = {"A": 2600, "B": 5200, "build": 3200, "break": 1300, "end": 4800}[sec]
    pad_chord(chord, t, beats, bright)
    root = ROOT[chord]
    # bass
    if sec in ("A", "B"):
        for e8 in range(int(beats * 2)):
            if sec == "A" and e8 % 2 == 0:
                continue  # offbeat bass in verse
            m = root + (12 if (sec == "B" and e8 % 4 == 3) else 0)
            bass_note(m, t + e8 * BEAT / 2, BEAT / 2 * 0.85, 0.9 if sec == "B" else 0.8)
    elif sec == "build":
        for e8 in range(int(beats * 2)):
            bass_note(root, t + e8 * BEAT / 2, BEAT / 2 * 0.6, 0.55 + 0.1 * e8 / (beats * 2))
    elif sec == "end":
        bass_note(root, t, 1.6, 1.0, release=0.9)
    elif sec == "break":
        bass_note(root, t, beats * BEAT * 0.95, 0.45)
    # arp plucks (16ths) — one octave above the pad voicing
    if sec in ("A", "B", "break", "build"):
        notes = [m + 12 for m in CH[chord]]
        for s in range(int(beats * 4)):
            if sec == "A" and s % 2 == 1:
                continue
            m = notes[ARP_PAT[s % 16]]
            lvl = {"A": 0.22, "B": 0.2, "break": 0.16, "build": 0.18}[sec]
            pluck(m, t + s * BEAT / 4, lvl * (1.0 if s % 4 == 0 else 0.75), pan=0.35 if s % 2 else -0.35)

# drums per bar
for bar in range(13):
    sec = SECTION[bar]
    if sec in ("A", "B"):
        groove(bar, sec)
    elif sec == "break":
        groove(bar, "half")
        for s in range(8):
            place("drums", HC, bt(bar, s / 2), 0.07, 0.3)

# pickup build (0 -> T0): snare roll + riser + reverse crash
snare_roll(0.25, T0, 2, 8, 0.08, 0.42)
riser(0.0, T0, 0.45)
reverse_crash(T0, 1.1, 0.5)
place("fx", crash(), T0, 0.55)
place("fx", impact(), T0, 0.55)

# bar 3 build (into the drop)
place("drums", K, bt(3, 0), 1.0)
place("drums", K, bt(3, 1), 1.0)
snare_roll(bt(3, 1), bt(4, 0) - BEAT / 4, 2, 8, 0.12, 0.55)
riser(bt(3, 0), bt(4, 0), 0.55)
reverse_crash(bt(4, 0), 1.3, 0.6)

# DROP
place("fx", impact(), bt(4, 0), 0.9)
place("fx", crash(), bt(4, 0), 0.75)
place("fx", crash(), bt(8, 0), 0.45)
place("fx", crash(), bt(11, 0), 0.6)

# bar 10 build into CTA
snare_roll(bt(10, 0), bt(11, 0) - BEAT / 4, 1, 8, 0.08, 0.5)
riser(bt(10, 0), bt(11, 0), 0.5)
reverse_crash(bt(11, 0), 1.0, 0.5)
place("drums", K, bt(10, 2), 0.7)
place("drums", K, bt(10, 3), 0.8)

# END hit
place("drums", K, bt(12, 0), 1.0)
place("fx", impact(), bt(12, 0), 1.0)
place("fx", crash(3.0), bt(12, 0), 0.8)
reverse_crash(bt(12, 0), 1.0, 0.55)

# bell lead hook in the drop (D major pentatonic) + end stinger
MEL = [  # (bar, beat, midi, len_beats)
    (4, 0, 81, 1), (4, 1, 78, .5), (4, 1.5, 81, .5), (4, 2, 83, 1), (4, 3, 81, 1),
    (5, 0, 76, 1), (5, 1, 73, .5), (5, 1.5, 76, .5), (5, 2, 81, 1.5),
    (6, 0, 78, 1), (6, 1, 74, .5), (6, 1.5, 78, .5), (6, 2, 83, 1), (6, 3, 81, 1),
    (7, 0, 79, .5), (7, .5, 78, .5), (7, 1, 76, .5), (7, 1.5, 74, .5), (7, 2, 76, 1), (7, 3, 78, 1),
    (8, 0, 81, 1), (8, 1, 78, .5), (8, 1.5, 81, .5), (8, 2, 86, 2),
    (11, 0, 81, 1), (11, 1, 83, 1), (11, 2, 85, 1), (11, 3, 88, 1),
    (12, 0, 86, 4),
]
for bar, beat, m, lb in MEL:
    bell(m, bt(bar, beat), 0.2 if bar < 11 else 0.26, pan=0.1, length=max(0.9, lb * BEAT + 0.6))
    bell(m - 12, bt(bar, beat), 0.08, pan=-0.2, length=max(0.9, lb * BEAT + 0.6))

# ---------------------------------------------------------------- mix
# sidechain pump from the kick grid (only where kicks play)
pump = np.ones(N)
kick_times = []
for bar in range(13):
    sec = SECTION[bar]
    if sec in ("A", "B"):
        kick_times += [bt(bar, b) for b in range(4)]
kick_times += [bt(3, 0), bt(3, 1), bt(10, 2), bt(10, 3), bt(12, 0)]
tt = np.arange(N) / SR
for k in kick_times:
    i = int(k * SR)
    j = min(N, i + int(0.42 * SR))
    x = tt[i:j] - k
    pump[i:j] = np.minimum(pump[i:j], 1 - 0.6 * np.exp(-x / 0.11))
for name in ("pad", "bass", "arp"):
    bus[name] *= pump[:, None]


def reverb(x, decay=1.8, mix=0.25, hp=300, lp=7000):
    n = int(decay * 1.4 * SR)
    t = np.arange(n) / SR
    ir = rng.standard_normal((n, 2)) * np.exp(-t * 6.9 / decay)[:, None]
    ir = ss.sosfilt(sos("bandpass", [hp, lp]), ir, axis=0)
    ir[: int(0.012 * SR)] = 0
    ir /= np.sqrt((ir ** 2).sum(0))
    wet = np.stack([ss.fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], 1)
    return x + wet * mix


def delay_pp(x, time, fb=0.35, mix=0.25):
    d = int(time * SR)
    out = np.zeros_like(x)
    tap = x.copy()
    for k in range(1, 6):
        tap = np.roll(tap, d, axis=0)
        tap[:d] = 0
        tap *= fb
        c = k % 2
        out[:, c] += tap[:, c] + tap[:, 1 - c] * 0.3
    return x + out * mix


bus["arp"] = delay_pp(bus["arp"], BEAT * 0.75, 0.38, 0.35)
bus["lead"] = delay_pp(bus["lead"], BEAT * 0.5, 0.3, 0.3)

gains = {"drums": 0.95, "bass": 0.8, "pad": 0.42, "arp": 0.55, "lead": 0.55, "fx": 0.55}
mix = sum(bus[k] * g for k, g in gains.items())
send = bus["pad"] * 0.5 + bus["arp"] * 0.6 + bus["lead"] * 0.8 + bus["drums"] * 0.12
mix = mix + (reverb(send, 2.0, 1.0) - send) * 0.35

# carve room for the voice: gentle dip around 2.5 kHz, tidy lows
mix = ss.sosfilt(sos("highpass", 28), mix, axis=0)
b, a = ss.iirpeak(2600, 0.9, fs=SR)
peak = np.stack([ss.lfilter(b, a, mix[:, c]) for c in range(2)], 1)
mix = mix - 0.3 * peak

# tail fade after the end hit
fade_start, fade_end = bt(12, 0) + 2.4, LENGTH
f = np.ones(N)
i0, i1 = int(fade_start * SR), int(fade_end * SR)
f[i0:i1] = np.linspace(1, 0, i1 - i0) ** 2
mix *= f[:, None]

# simple bus compression + soft limit
env = np.sqrt(ss.sosfilt(sos("lowpass", 8), (mix ** 2).mean(1)).clip(1e-9))
g = np.minimum(1.0, (0.18 / env) ** 0.35)
mix *= g[:, None]
mix = np.tanh(mix * 1.5) / 1.5
mix /= np.abs(mix).max() / 0.89
wavfile.write(sys.argv[1], SR, mix.astype(np.float32))
print("wrote", sys.argv[1], "len", LENGTH, "s; drop at", bt(4, 0), "end hit at", bt(12, 0))
