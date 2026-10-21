"""Jana SFX + muzik latar sitcom secara sintesis (bebas hak cipta).

Guna: python3 tools/make_sfx.py <folder-output>
"""
import sys
import os
import wave
import numpy as np

SR = 44100
rng = np.random.default_rng(7)
OUT = sys.argv[1] if len(sys.argv) > 1 else "sfx"
os.makedirs(OUT, exist_ok=True)


def save(name, x, peak=0.9):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    m = np.max(np.abs(x)) or 1.0
    x = x / m * peak
    with wave.open(os.path.join(OUT, name), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype("<i2").tobytes())


def t(d):
    return np.arange(int(SR * d)) / SR


def env(n, a, d_total, curve=4.0):
    tt = np.arange(n) / SR
    e = np.minimum(1, tt / max(a, 1e-4)) * np.exp(-curve * tt / d_total)
    return e


def chirp(f0, f1, d, shape="exp"):
    tt = t(d)
    if shape == "exp":
        f = f0 * (f1 / f0) ** (tt / d)
    else:
        f = f0 + (f1 - f0) * tt / d
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def lowpass(x, a):
    y = np.zeros_like(x)
    a = np.broadcast_to(a, x.shape)
    acc = 0.0
    for i, v in enumerate(x):
        acc += a[i] * (v - acc)
        y[i] = acc
    return y


# pop: bubble pop pendek
def pop():
    d = 0.14
    x = chirp(300, 1400, d) * env(int(SR * d), 0.002, d, 9)
    n = rng.normal(0, 1, int(SR * 0.012)) * np.linspace(1, 0, int(SR * 0.012))
    x[: len(n)] += 0.5 * n
    return x


# boing: spring wobble
def boing():
    d = 0.45
    tt = t(d)
    f = 180 + 120 * np.sin(2 * np.pi * 14 * tt) * np.exp(-5 * tt) + 160 * tt
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    return x * env(len(tt), 0.004, d, 5)


# record scratch: noise lalu bandpass sweep cepat ke depan & belakang
def scratch():
    d = 0.5
    tt = t(d)
    n = rng.normal(0, 1, len(tt))
    rate = 1 + 0.9 * np.sin(2 * np.pi * 5 * tt)
    ph = np.cumsum(rate) / SR
    tone = np.sin(2 * np.pi * 600 * ph * 3) * 0.6
    x = (lowpass(n, 0.25) * 1.2 + tone) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 5 * tt)))
    return x * env(len(tt), 0.005, d, 3)


# ting: bunyi loceng kecil
def ting():
    d = 0.35
    tt = t(d)
    x = sum(a * np.sin(2 * np.pi * f * tt) for f, a in [(2093, 1), (4186, 0.35), (6279, 0.15)])
    return x * env(len(tt), 0.001, d, 8)


# swipe/whoosh
def swipe():
    d = 0.4
    tt = t(d)
    n = rng.normal(0, 1, len(tt))
    hp = n - lowpass(n, 0.02 + 0.5 * tt / d)
    shape = np.sin(np.pi * tt / d) ** 2
    return lowpass(hp, 0.6) * shape


# cengkerik: chirp berulang 4.5kHz
def crickets(d=2.4):
    tt = t(d)
    car = np.sin(2 * np.pi * 4600 * tt)
    pulses = (np.sin(2 * np.pi * 28 * tt) > 0.3).astype(float)
    gate = ((tt % 0.55) < 0.16).astype(float)
    x = car * pulses * gate
    x2 = np.roll(np.sin(2 * np.pi * 4300 * tt) * pulses * ((tt % 0.7) < 0.12), int(SR * 0.27))
    e = np.minimum(1, tt / 0.2) * np.minimum(1, (d - tt) / 0.3)
    return lowpass((x + 0.6 * x2) * e, 0.7)


# dun dun: dua pukulan brass/piano rendah dramatik
def dundun():
    d1 = 0.55
    out = np.zeros(int(SR * 1.5))

    def hit(f, d):
        tt = t(d)
        x = sum(np.sin(2 * np.pi * f * k * tt) / k ** 1.2 for k in range(1, 9))
        x += 0.5 * np.sin(2 * np.pi * f / 2 * tt)
        return np.tanh(1.8 * x) * env(len(tt), 0.006, d, 3)

    a = hit(110, d1)
    b = hit(103.8, 0.9)
    out[: len(a)] += a
    s = int(SR * 0.5)
    out[s : s + len(b)] += b
    return out


# chime: arpeggio loceng
def chime():
    d = 1.6
    out = np.zeros(int(SR * d))
    for i, f in enumerate([1046.5, 1318.5, 1568, 2093]):
        tt = t(d - i * 0.09)
        x = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * f * 2.76 * tt)) * env(len(tt), 0.002, 1.2, 4)
        s = int(SR * i * 0.09)
        out[s : s + len(x)] += x
    return out


# muzik sitcom: bass berjalan + chord plucked + melodi ukulele-ish, 120bpm
def music(d=17.0, bpm=126):
    n = int(SR * d)
    out = np.zeros((n, 2))
    beat = 60 / bpm
    prog = [("C", [261.63, 329.63, 392.0]), ("A", [220.0, 277.18, 329.63]),
            ("F", [174.61, 220.0, 261.63]), ("G", [196.0, 246.94, 293.66])]
    bassroot = {"C": 65.41, "A": 55.0, "F": 87.31, "G": 98.0}
    mel = [784, 659, 784, 880, 784, 659, 587, 659, 523, 587, 659, 523, 587, 494, 523, 587]

    def pluck(f, d, bright=6):
        tt = t(d)
        x = sum(np.sin(2 * np.pi * f * k * tt) * np.exp(-bright * k * tt) / k for k in range(1, 6))
        return x * np.minimum(1, tt / 0.003)

    i = 0
    tb = 0.0
    while tb < d:
        bar = int(tb / (beat * 4)) % 4
        name, ch = prog[bar]
        bi = i % 4
        s = int(tb * SR)
        # bass walking: root, fifth, root oct, approach
        bf = bassroot[name] * [1, 1.5, 2, 1.335][bi]
        b = pluck(bf, beat * 0.95, 3) * 0.55
        e = min(len(b), n - s)
        out[s : s + e] += b[:e, None]
        # chord pada off-beat (gaya ukulele)
        so = s + int(beat / 2 * SR)
        for f in ch:
            c = pluck(f, beat * 0.45, 9) * 0.16
            e = min(len(c), n - so)
            if e > 0:
                out[so : so + e, 0] += c[:e] * 1.1
                out[so : so + e, 1] += c[:e] * 0.9
        # melodi glockenspiel setiap beat
        mf = mel[i % len(mel)]
        m = pluck(mf, beat * 0.9, 7) * 0.13
        e = min(len(m), n - s)
        out[s : s + e, 0] += m[:e] * 0.85
        out[s : s + e, 1] += m[:e] * 1.15
        # kick ringan + hi-hat shaker
        kk = np.sin(2 * np.pi * np.cumsum(np.linspace(120, 45, int(0.12 * SR))) / SR) * np.exp(-30 * t(0.12))
        if bi in (0, 2):
            e = min(len(kk), n - s)
            out[s : s + e] += 0.35 * kk[:e, None]
        for off in (0.25, 0.75):
            sh = s + int(beat * off * SR)
            hh = rng.normal(0, 1, int(0.04 * SR)) * np.exp(-90 * t(0.04)) * 0.07
            hh = hh - lowpass(hh, 0.3)
            e = min(len(hh), n - sh)
            if e > 0:
                out[sh : sh + e] += hh[:e, None]
        tb += beat
        i += 1
    fade = int(SR * 0.6)
    out[-fade:] *= np.linspace(1, 0, fade)[:, None]
    return np.tanh(out * 1.2)


save("pop.wav", pop())
save("boing.wav", boing())
save("scratch.wav", scratch())
save("ting.wav", ting(), 0.7)
save("swipe.wav", swipe())
save("crickets.wav", crickets(), 0.6)
save("dundun.wav", dundun())
save("chime.wav", chime(), 0.8)
save("music.wav", music(), 0.8)
print("siap:", sorted(os.listdir(OUT)))
