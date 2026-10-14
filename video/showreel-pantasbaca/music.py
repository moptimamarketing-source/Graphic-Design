"""Original 15s soundtrack for the Pantas Baca showreel (120 BPM, F minor).

Hits line up with the visual timeline in main.js:
  kicks every beat 2.0-7.0 and 8.0-14.0 (glitch stutter break 7.5-8.0),
  impacts at scene cuts, risers into 2.0 and 12.0, letter-drop ticks in the intro.
Usage: python3 music.py out/music.wav
"""
import sys
import wave
import numpy as np

SR = 48000
DUR = 15.0
N = int(SR * DUR)
T = np.arange(N) / SR
rnd = np.random.default_rng(7)

KICKS = [b / 2 for b in range(4, 24) if not (7.5 <= b / 2 < 8.0)] + [12.0, 12.5, 13.0, 13.5, 14.0]
IMPACTS = [(0.5, 0.35), (2.0, 1.0), (4.0, 0.5), (6.0, 0.6), (8.0, 0.9), (10.0, 0.7), (12.0, 1.2), (14.5, 0.6)]
TICKS = [0.5 + i * 0.125 + (0.125 if i >= 6 else 0) for i in range(10)]
WHOOSHES = [(1.62, 2.0), (3.62, 4.0), (5.45, 6.0), (7.7, 8.0), (9.65, 10.0), (11.55, 12.0)]


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def stereo(x, pan=0.0):
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    return np.stack([x * l * 1.414, x * r * 1.414])


def place(bus, sig, t0, gain=1.0):
    i = int(t0 * SR)
    if i >= bus.shape[-1]:
        return
    n = min(sig.shape[-1], bus.shape[-1] - i)
    bus[..., i:i + n] += sig[..., :n] * gain


def stft_filter(x, fn, n=2048, hop=512):
    """Time-varying spectral filter. fn(time, freqs) -> gain per bin."""
    win = np.hanning(n + 1)[:-1]
    pad = np.concatenate([np.zeros(n), x, np.zeros(n)])
    out = np.zeros_like(pad)
    norm = np.zeros_like(pad)
    freqs = np.fft.rfftfreq(n, 1 / SR)
    for s in range(0, len(pad) - n, hop):
        t = (s - n + n / 2) / SR
        spec = np.fft.rfft(pad[s:s + n] * win) * fn(t, freqs)
        out[s:s + n] += np.fft.irfft(spec, n) * win
        norm[s:s + n] += win ** 2
    out /= np.maximum(norm, 1e-6)
    return out[n:n + len(x)]


def lp(fc, q=4):
    return lambda t, f: 1 / np.sqrt(1 + (f / (fc(t) if callable(fc) else fc)) ** (2 * q))


def hp(fc, q=4):
    return lambda t, f: 1 / np.sqrt(1 + ((fc(t) if callable(fc) else fc) / np.maximum(f, 1)) ** (2 * q))


def bp(lo, hi):
    return lambda t, f: lp(hi, 2)(t, f) * hp(lo, 2)(t, f)


def saw(freq, n, detune_phase=0.0):
    ph = (np.cumsum(np.full(n, freq) if np.isscalar(freq) else freq) / SR + detune_phase) % 1.0
    return 2 * ph - 1


def sidechain(t_arr, depth=0.65, rel=0.14):
    g = np.ones_like(t_arr)
    for k in KICKS:
        d = t_arr - k
        m = d >= 0
        g[m] = np.minimum(g[m], 1 - depth * np.exp(-d[m] / rel) * np.minimum(1, d[m] / 0.004))
    return g


def reverb(x, decay=1.4, mix=0.25, seed=1):
    n = int(SR * decay * 1.5)
    r = np.random.default_rng(seed)
    env = np.exp(-np.arange(n) / (SR * decay / 6.9))
    out = []
    for ch in range(2):
        ir = r.standard_normal(n) * env
        ir = stft_filter(ir, lp(6000, 1))
        ir /= np.sqrt(np.sum(ir ** 2))
        L = len(x[ch]) + n
        nfft = 1 << (L - 1).bit_length()
        wet = np.fft.irfft(np.fft.rfft(x[ch], nfft) * np.fft.rfft(ir, nfft), nfft)[:len(x[ch])]
        out.append(x[ch] * (1 - mix) + wet * mix * 3)
    return np.array(out)


# ---------------- chords ----------------
FM, DB, AB, EB = [53, 56, 60], [49, 53, 56], [56, 60, 63], [51, 55, 58]
def chord_at(t):
    if t < 2:
        return FM
    if t < 12:
        return [FM, DB, AB, EB][int((t - 2) // 2) % 4]
    if t < 13:
        return DB
    if t < 14:
        return EB
    return FM


mix = np.zeros((2, N))
music = np.zeros((2, N))  # musical bus (gets stuttered)
sc = sidechain(T)

# ---------------- pad (supersaw) ----------------
pad = np.zeros((2, N))
for seg_start in np.arange(0, 15, 0.5):
    ch = chord_at(seg_start + 0.01)
    i0, i1 = int(seg_start * SR), int(min(15, seg_start + 0.5) * SR)
    n = i1 - i0
    for note in ch:
        for v, cents in enumerate([-14, -7, -3, 0, 3, 7, 14]):
            f = mtof(note + 12 * (v % 2 == 0) * 0) * 2 ** (cents / 1200)
            ph = (seg_start * f + v * 0.13) % 1
            s = saw(f, n, ph) / 7
            pan = (v - 3) / 4
            pad[:, i0:i1] += stereo(s, pan) * 0.33
pad_cut = lambda t: 300 + 3200 * np.clip(t / 2.0, 0, 1) ** 2 if t < 2 else (2600 if t < 12 else 4200)
pad = np.array([stft_filter(pad[c], lp(pad_cut, 3)) for c in range(2)])
pad *= sc * 0.5
pad[:, :int(2 * SR)] *= np.linspace(0.2, 1.0, int(2 * SR))
music += pad * 1.6

# ---------------- bass ----------------
bass = np.zeros(N)
for k in np.arange(2.0, 14.5, 0.25):
    if 7.5 <= k < 8.0:
        continue
    root = chord_at(k + 0.01)[0] - 24
    n = int(0.24 * SR)
    tt = np.arange(n) / SR
    f = mtof(root + (12 if int(k * 4) % 4 == 3 else 0))
    env = np.exp(-tt / 0.18) * np.minimum(1, tt / 0.003)
    s = (np.sin(2 * np.pi * f * tt) * 0.8 + saw(f, n) * 0.35) * env
    place(bass[None], s[None], k)
bass = stft_filter(bass, lp(700, 3)) * sc
music += stereo(bass, 0) * 0.26

# ---------------- arp (plucks, 16ths) ----------------
arp = np.zeros((2, N))
pattern = [0, 1, 2, 3, 2, 1, 3, 4]
for i, k in enumerate(np.arange(0.5, 14.5, 0.125)):
    if 7.5 <= k < 8.0:
        continue
    ch = chord_at(k + 0.01)
    tones = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[0] + 24, ch[1] + 24]
    note = tones[pattern[i % 8]]
    n = int(0.2 * SR)
    tt = np.arange(n) / SR
    f = mtof(note)
    s = (np.sign(np.sin(2 * np.pi * f * tt)) * 0.4 + np.sin(2 * np.pi * f * 2 * tt) * 0.3) * np.exp(-tt / 0.07)
    place(arp, stereo(s, 0.35 if i % 2 else -0.35), k, 0.22 if k >= 2 else 0.12)
arp = np.array([stft_filter(arp[c], lp(lambda t: 900 + 3000 * np.clip((t - 0.5) / 1.5, 0, 1) if t < 2 else 4500, 2)) for c in range(2)])
# ping-pong 3/16 delay
d = int(0.375 * SR)
dl = np.zeros_like(arp)
dl[0, d:] += arp[1, :-d] * 0.35
dl[1, d:] += arp[0, :-d] * 0.35
music += (arp + dl) * sc * 2.6

# ---------------- finale lead stabs ----------------
for k, ch in [(12.0, DB), (12.75, DB), (13.0, EB), (13.75, EB), (14.0, FM)]:
    n = int(0.6 * SR)
    tt = np.arange(n) / SR
    s = np.zeros(n)
    for note in ch:
        for c in (-10, 0, 10):
            s += saw(mtof(note + 12) * 2 ** (c / 1200), n, rnd.random())
    s = stft_filter(s * np.exp(-tt / 0.25), lp(5000, 2)) / 9
    place(music, stereo(s, 0), k, 1.3)

# ---------------- drums ----------------
def kick():
    n = int(0.45 * SR)
    tt = np.arange(n) / SR
    f = 45 + 120 * np.exp(-tt / 0.03)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.22)
    s[:150] += rnd.standard_normal(150) * np.linspace(0.6, 0, 150)
    return np.tanh(s * 1.6)


def clap():
    n = int(0.35 * SR)
    tt = np.arange(n) / SR
    e = np.zeros(n)
    for o in (0, 0.011, 0.022):
        m = tt >= o
        e[m] = np.maximum(e[m], np.exp(-(tt[m] - o) / (0.012 if o < 0.02 else 0.13)))
    return stft_filter(rnd.standard_normal(n) * e, bp(900, 4000))


def hat(decay):
    n = int(0.25 * SR)
    tt = np.arange(n) / SR
    return stft_filter(rnd.standard_normal(n) * np.exp(-tt / decay), hp(7000, 3))


K, CL, HC, HO = kick(), clap(), hat(0.025), hat(0.11)
drums = np.zeros((2, N))
for k in KICKS:
    place(drums, stereo(K, 0), k, 0.7)
    if (k - 2.0) % 1.0 == 0.5:
        place(drums, stereo(CL, 0.05), k, 1.0)
for k in np.arange(2.0, 14.5, 0.125):
    if 7.5 <= k < 8.0:
        continue
    sub = round((k % 0.5) / 0.125)
    if sub == 2:
        place(drums, stereo(HO, 0.25), k, 0.3)
    else:
        place(drums, stereo(HC, -0.2 if sub % 2 else 0.2), k, 0.22 if sub % 2 else 0.13)
music += drums

# ---------------- glitch stutter 7.5 - 8.0 ----------------
src = music[:, int(7.0 * SR):int(7.0625 * SR)].copy()
seg = src.shape[1]
for j, k in enumerate(np.arange(7.5, 8.0, 0.0625)):
    rate = 1 + j * 0.12  # pitch rising stutter
    idx = np.clip((np.arange(int(seg / rate)) * rate).astype(int), 0, seg - 1)
    piece = src[:, idx] * np.hanning(len(idx) + 2)[1:-1] ** 0.3
    piece = np.round(piece * 24) / 24  # bitcrush
    place(music, piece, k, 1.0)

mix += music

# ---------------- intro ticks (letter drops) ----------------
scale = [65, 67, 68, 70, 72, 75, 77, 79, 80, 82]
for i, k in enumerate(TICKS):
    n = int(0.25 * SR)
    tt = np.arange(n) / SR
    f = mtof(scale[i])
    s = (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * f * 3 * tt)) * np.exp(-tt / 0.06)
    th = np.sin(2 * np.pi * (90 * np.exp(-tt / 0.05) + 50) * tt) * np.exp(-tt / 0.08)
    place(mix, stereo(s * 0.35 + th * 0.6, (i % 3 - 1) * 0.4), k, 0.55)

# ---------------- risers ----------------
for a, b, g in [(0.0, 2.0, 0.5), (10.6, 12.0, 0.55)]:
    n = int((b - a) * SR)
    tt = np.arange(n) / SR
    p = tt / (b - a)
    noise = rnd.standard_normal(n)
    nb = stft_filter(np.concatenate([np.zeros(int(a * SR)), noise]), lambda t, f: hp(200 + 6000 * np.clip((t - a) / (b - a), 0, 1) ** 2, 2)(t, f))[int(a * SR):]
    f = 150 * 2 ** (p * 3)
    tone = saw(f, n) * 0.25 + saw(f * 1.5, n) * 0.15
    s = (nb * 0.5 + tone * 0.6) * p ** 2.2
    place(mix, np.stack([s, np.roll(s, 240)]), a, g)

# ---------------- whooshes ----------------
for a, b in WHOOSHES:
    n = int((b - a) * SR)
    tt = np.arange(n) / SR
    p = tt / (b - a)
    s = rnd.standard_normal(n) * np.sin(np.pi * p) ** 2 * p
    s = stft_filter(np.concatenate([np.zeros(int(a * SR)), s]), lambda t, f: bp(400 + 3000 * np.clip((t - a) / (b - a), 0, 1), 2500 + 6000 * np.clip((t - a) / (b - a), 0, 1))(t, f))[int(a * SR):]
    pan = np.linspace(-0.8, 0.8, n)
    place(mix, np.stack([s * np.cos((pan + 1) * np.pi / 4), s * np.sin((pan + 1) * np.pi / 4)]) * 1.4, a, 0.35)

# ---------------- impacts ----------------
fx = np.zeros((2, N))
for k, a in IMPACTS:
    n = int(1.6 * SR)
    tt = np.arange(n) / SR
    boom = np.sin(2 * np.pi * np.cumsum(30 + 50 * np.exp(-tt / 0.12)) / SR) * np.exp(-tt / 0.55)
    crash = stft_filter(rnd.standard_normal(n) * np.exp(-tt / (0.25 + 0.6 * (a >= 1))), hp(3500, 2))
    snap = stft_filter(rnd.standard_normal(n) * np.exp(-tt / 0.05), bp(500, 5000))
    s = boom * 0.55 + crash * 0.5 + snap * 0.5
    place(fx, np.stack([s, np.roll(s, 90)]), k, 0.55 * a)
mix += reverb(fx, 2.2, 0.35, seed=3)

# ---------------- master ----------------
mix = reverb(mix, 1.1, 0.12, seed=9)
mix = np.array([stft_filter(mix[c], hp(28, 2)) for c in range(2)])
mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix * 1.4) / np.tanh(1.4)
fade = np.clip((DUR - T) / 0.35, 0, 1)
mix *= fade
mix[:, :int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))
mix = mix / np.max(np.abs(mix)) * 10 ** (-1 / 20)

out = sys.argv[1] if len(sys.argv) > 1 else 'out/music.wav'
pcm = (mix.T * 32767).astype(np.int16)
with wave.open(out, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('wrote', out, pcm.shape)
