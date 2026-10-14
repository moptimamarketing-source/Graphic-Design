"""Gubah muzik latar ceria (gaya pendidikan kanak-kanak) secara sintesis.

Tiada sampel luar: semua bunyi dijana dengan numpy, jadi bebas hak cipta.
112 BPM, C major, progression C - G - Am - F, kalimba arpeggio + bass + pad + dram ringan.
Bahagian akhir (end card) ada 'hit' penuh dan kord penutup.

Guna: python3 muzik.py OUT.wav TOTAL_SAAT END_CARD_MULA
"""
import sys
import wave
import numpy as np

SR = 48000
OUT, TOTAL, ENDC = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
BPM = 112
BEAT = 60 / BPM
BAR = BEAT * 4
N = int(TOTAL * SR)
L = np.zeros(N)
R = np.zeros(N)
rng = np.random.default_rng(7)  # seed tetap


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def add(sig, t0, pan=0.0, gain=1.0):
    i = int(t0 * SR)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    L[i:i + len(sig)] += sig * np.sqrt(0.5 * (1 - pan))
    R[i:i + len(sig)] += sig * np.sqrt(0.5 * (1 + pan))


def env(n, a=0.003, tau=0.3):
    t = np.arange(n) / SR
    e = np.exp(-t / tau)
    att = np.minimum(1, t / a)
    return e * att


def kalimba(m, dur=0.9):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hz(m)
    s = np.sin(2 * np.pi * f * t) * env(n, 0.002, 0.32)
    s += 0.25 * np.sin(2 * np.pi * f * 2 * t) * env(n, 0.002, 0.12)
    s += 0.12 * np.sin(2 * np.pi * f * 3.9 * t) * env(n, 0.001, 0.04)
    return s


def glock(m, dur=1.4):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hz(m)
    return (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 2.76 * t) * env(n, 0.001, 0.2)) * env(n, 0.001, 0.55)


def bass(m, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.12 * np.sin(2 * np.pi * 3 * f * t)
    e = env(n, 0.004, 0.45)
    e[-int(0.02 * SR):] *= np.linspace(1, 0, int(0.02 * SR))
    return np.tanh(1.4 * s) * e


def lowpass(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.zeros_like(x)
    acc = 0.0
    for i in range(len(x)):  # pendek sahaja (sebatang kord), cukup laju
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


def pad(ms, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for m in ms:
        for det in (-0.08, 0.0, 0.08):
            f = hz(m + det)
            s += 2 * ((t * f) % 1) - 1  # saw
    s = lowpass(lowpass(s, 900), 900) / (len(ms) * 3)
    a = np.minimum(1, t / 0.35)
    r = np.minimum(1, (dur - t) / 0.3)
    return s * a * np.clip(r, 0, 1)


def kick():
    n = int(0.32 * SR)
    t = np.arange(n) / SR
    f = 50 + 110 * np.exp(-t / 0.03)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env(n, 0.001, 0.11)


def noise_hit(dur, tau, fc_hp):
    n = int(dur * SR)
    x = rng.standard_normal(n)
    # high-pass ringkas: beza tolak lowpass
    lp = np.zeros(n)
    a = np.exp(-2 * np.pi * fc_hp / SR)
    acc = 0.0
    for i in range(n):
        acc = (1 - a) * x[i] + a * acc
        lp[i] = acc
    return (x - lp) * env(n, 0.001, tau)


KICK = kick()
CLAP = noise_hit(0.25, 0.06, 900) * 0.8
SHAK = noise_hit(0.08, 0.018, 5000)
CRASH = noise_hit(2.6, 0.7, 3000)

# progression: (akar bass, nota kord)
PROG = [
    (48, [60, 64, 67]),  # C
    (43, [59, 62, 67]),  # G
    (45, [60, 64, 69]),  # Am
    (41, [60, 65, 69]),  # F
]
ARP = [0, 1, 2, 3, 2, 1, 2, 3]  # indeks ke nada kord (+ oktaf untuk 3)
MELO = [  # glock: nada pertama setiap bar
    76, 74, 72, 72,
]

nbars = int(np.ceil(TOTAL / BAR))
for b in range(nbars):
    t0 = b * BAR
    root, ch = PROG[b % 4]
    in_end = t0 >= ENDC - 0.01
    # pad
    add(pad([m - 12 for m in ch], BAR + 0.1), t0, 0.0, 0.32 if not in_end else 0.42)
    # arpeggio kalimba (8th note)
    notes = ch + [ch[0] + 12]
    for k, idx in enumerate(ARP):
        tt = t0 + k * BEAT / 2
        if tt >= TOTAL - 0.4:
            break
        add(kalimba(notes[idx] + 12), tt, -0.35 if k % 2 else 0.35, 0.30)
    # glock aksen
    if b % 2 == 0:
        add(glock(MELO[(b // 2) % 4] + 12), t0, 0.1, 0.13)
    # bass
    for k, (pos, ln) in enumerate([(0, 1.4), (1.5, 0.5), (2, 1.0), (3.5, 0.5)]):
        tt = t0 + pos * BEAT
        if tt < TOTAL - 0.3:
            add(bass(root, ln * BEAT), tt, 0.0, 0.26)
    # dram (bar pertama lebih ringan)
    for beat in range(4):
        tt = t0 + beat * BEAT
        if tt >= TOTAL - 0.5:
            break
        if beat in (0, 2):
            add(KICK, tt, 0.0, 0.32 if b > 0 else 0.18)
        if beat in (1, 3) and b > 0:
            add(CLAP, tt, 0.05, 0.22)
        for h in range(2):
            add(SHAK, tt + h * BEAT / 2, 0.45, 0.10 if h else 0.06)

# hit pada end card + kord penutup
add(CRASH, ENDC, 0.0, 0.25)
add(KICK, ENDC, 0.0, 0.8)
fin = TOTAL - 1.6
for m in (60, 64, 67, 72):
    add(kalimba(m + 12, 1.6), fin, 0.0, 0.3)
add(glock(84, 1.6), fin, 0.0, 0.2)

mix = np.stack([L, R], 1)
# fade masuk/keluar
fi = int(0.05 * SR)
fo = int(0.8 * SR)
mix[:fi] *= np.linspace(0, 1, fi)[:, None]
mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.89
with wave.open(OUT, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
print("ok", OUT, TOTAL)
