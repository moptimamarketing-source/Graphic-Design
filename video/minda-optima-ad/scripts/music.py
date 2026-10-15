"""Original royalty-free background track, synthesized from scratch.

120 BPM (beat = 0.5 s, bar = 2 s) so cuts and motion can snap to a fixed grid.
Progression per bar: Dm - Bb - F - C (D minor / F major, uplifting pop).

usage: python music.py arrangement.json out.wav
arrangement.json: {"sections": [["intro", 2], ["verse", 8], ...]}  (name, bars)
"""
import json
import sys

import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 44100
BPM = 120
BEAT = 60 / BPM
BAR = 4 * BEAT
rng = np.random.default_rng(7)

CHORDS = [  # midi notes, one chord per bar
    [62, 65, 69],  # Dm
    [58, 62, 65],  # Bb
    [65, 69, 72],  # F
    [60, 64, 67],  # C
]
ROOTS = [38, 34, 41, 36]


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def t_axis(dur):
    return np.arange(int(dur * SR)) / SR


def lp(x, fc, order=2):
    return sosfilt(butter(order, min(fc, SR / 2 - 100), "low", fs=SR, output="sos"), x)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def saw(f, t, phase=0.0):
    return 2 * ((f * t + phase) % 1.0) - 1


def adsr(n, a, d, s, r, sus_len=None):
    a, d, r = int(a * SR), int(d * SR), int(r * SR)
    sus_len = n - a - d - r if sus_len is None else int(sus_len * SR)
    sus_len = max(sus_len, 0)
    env = np.concatenate([
        np.linspace(0, 1, max(a, 1)), np.linspace(1, s, max(d, 1)),
        np.full(sus_len, s), np.linspace(s, 0, max(r, 1))])
    return np.pad(env, (0, max(0, n - len(env))))[:n]


class Track:
    def __init__(self, dur):
        self.n = int(dur * SR) + SR * 3
        self.buf = {}

    def add(self, bus, start, sig, pan=0.0):
        if bus not in self.buf:
            self.buf[bus] = np.zeros((2, self.n))
        i = int(start * SR)
        if i >= self.n:
            return
        sig = sig[: self.n - i]
        l, r = np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))
        self.buf[bus][0, i:i + len(sig)] += sig * l
        self.buf[bus][1, i:i + len(sig)] += sig * r


# ---------- instruments ----------

def kick(vel=1.0):
    t = t_axis(0.45)
    f = 45 + 110 * np.exp(-t * 28)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7.5)
    click = hp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 250) * 0.25
    return np.tanh(1.6 * (body + click)) * vel


def clap(vel=1.0):
    t = t_axis(0.35)
    n = rng.standard_normal(len(t))
    env = np.zeros_like(t)
    for k, off in enumerate([0, 0.011, 0.022]):
        env += (t >= off) * np.exp(-np.clip(t - off, 0, None) * (90 if k < 2 else 16))
    body = bp(n, 900, 5000) * env
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * 0.35
    return (body * 0.8 + tone) * vel


def hat(vel=1.0, open_=False):
    t = t_axis(0.3 if open_ else 0.07)
    x = hp(rng.standard_normal(len(t)), 7500, 4) * np.exp(-t * (14 if open_ else 70))
    return x * vel * 0.5


def shaker(vel=1.0):
    t = t_axis(0.09)
    return bp(rng.standard_normal(len(t)), 5000, 12000) * np.sin(np.pi * t / 0.09) ** 2 * vel * 0.25


def bass(m, dur):
    t = t_axis(dur)
    f = hz(m)
    x = 0.75 * np.sin(2 * np.pi * f * t) + 0.35 * lp(saw(f, t), 420)
    return np.tanh(1.3 * x) * adsr(len(t), 0.005, 0.12, 0.8, 0.04)


def supersaw(notes, dur, cutoff=2600, voices=5, spread=0.18):
    t = t_axis(dur)
    out = np.zeros((2, len(t)))
    for m in notes:
        for v in range(voices):
            det = (v - (voices - 1) / 2) / ((voices - 1) / 2) * spread
            f = hz(m) * 2 ** (det / 12)
            x = saw(f, t, rng.random())
            pan = det / spread * 0.8
            out[0] += x * np.sqrt(0.5 * (1 - pan))
            out[1] += x * np.sqrt(0.5 * (1 + pan))
    env = adsr(len(t), 0.03, 0.3, 0.75, 0.25)
    out = np.stack([lp(out[0], cutoff), lp(out[1], cutoff)]) * env
    return out / (len(notes) * voices) * 1.8


def pluck(m, vel=1.0, bright=4000):
    t = t_axis(0.45)
    f = hz(m)
    x = saw(f, t) * 0.6 + saw(f * 2.003, t) * 0.25 + np.sin(2 * np.pi * f * t) * 0.4
    # time-varying lowpass approximation: blend of two static filters
    bright_x, dark_x = lp(x, bright), lp(x, 700)
    mix = np.exp(-t * 18)
    y = bright_x * mix + dark_x * (1 - mix)
    return y * np.exp(-t * 9) * vel * 0.55


def bell(m, vel=1.0):
    t = t_axis(1.2)
    f = hz(m)
    x = np.sin(2 * np.pi * f * t + 1.8 * np.sin(2 * np.pi * f * 3.5 * t) * np.exp(-t * 6))
    return x * np.exp(-t * 4) * vel * 0.35


def riser(dur):
    t = t_axis(dur)
    n = rng.standard_normal(len(t))
    k = t / dur
    lo = bp(n, 300, 1500)
    hi = bp(n, 2000, 9000)
    x = lo * (1 - k) + hi * k
    sweep = np.sin(2 * np.pi * np.cumsum(200 + 1600 * k ** 2) / SR) * 0.15
    return (x * 0.5 + sweep) * k ** 2.2


def impact():
    t = t_axis(2.5)
    boom = np.sin(2 * np.pi * np.cumsum(30 + 70 * np.exp(-t * 9)) / SR) * np.exp(-t * 2.2)
    crash = hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 2.8) * 0.35
    return np.tanh(2 * boom) * 0.9 + crash


def snare_roll(dur):
    out = np.zeros(int(dur * SR) + SR)
    t = 0.0
    while t < dur:
        k = t / dur
        step = BEAT / (2 if k < 0.5 else 4 if k < 0.8 else 8)
        c = clap(0.25 + 0.6 * k)
        i = int(t * SR)
        out[i:i + len(c)] += c[: len(out) - i]
        t += step
    return out[: int(dur * SR) + int(0.3 * SR)]


# ---------- arrangement ----------

def reverb_ir(seconds=2.2, decay=3.2):
    t = t_axis(seconds)
    l = rng.standard_normal(len(t)) * np.exp(-t * decay)
    r = rng.standard_normal(len(t)) * np.exp(-t * decay)
    return lp(l, 6000), lp(r, 6000)


def render(sections, out_path):
    total = sum(b for _, b in sections) * BAR
    tr = Track(total)
    side = np.ones(tr.n)  # sidechain gain driven by kicks
    bar0 = 0
    kicks = []
    for name, bars in sections:
        for b in range(bars):
            gb = bar0 + b
            t0 = gb * BAR
            ci = gb % 4
            chord, root = CHORDS[ci], ROOTS[ci]
            last = b == bars - 1
            energy = {"intro": 0.3, "verse": 0.7, "drop": 1.0, "break": 0.35, "build": 0.8, "outro": 0.2}[name]

            # pads
            if name in ("intro", "break"):
                cut = 900 + 1400 * (b + 1) / bars if name == "intro" else 1500
                pad = supersaw(chord, BAR + 0.2, cutoff=cut, spread=0.22)
                tr.add("padL", t0, pad[0], -0.6)
                tr.add("padR", t0, pad[1], 0.6)
            elif name in ("verse", "drop", "build"):
                pad = supersaw(chord + [chord[0] + 12], BAR + 0.1, cutoff=2400 if name == "verse" else 4200)
                tr.add("padL", t0, pad[0] * (0.8 if name == "verse" else 1.0), -0.7)
                tr.add("padR", t0, pad[1] * (0.8 if name == "verse" else 1.0), 0.7)

            # pluck arpeggio (16ths), pattern climbs the chord
            if name != "outro":
                arp = [chord[0], chord[1], chord[2], chord[0] + 12, chord[2], chord[1], chord[0] + 12, chord[2]]
                for s in range(16):
                    if name == "verse" and s % 2:
                        continue
                    m = arp[s % 8] + 12
                    v = (0.9 if s % 4 == 0 else 0.6) * (0.7 if name in ("intro", "break") else 1.0)
                    pan = 0.35 if s % 2 else -0.35
                    tr.add("pluck", t0 + s * BEAT / 4, pluck(m, v, bright=2500 + 3500 * energy), pan)

            # bass
            if name in ("verse", "drop", "build"):
                pattern = [(0, 0.45), (0.75, 0.2), (1.5, 0.45), (2.5, 0.2), (3, 0.45), (3.5, 0.4)] if name != "verse" else [(0, 0.9), (1.5, 0.45), (2.5, 0.3), (3, 0.9)]
                for pos, d in pattern:
                    tr.add("bass", t0 + pos * BEAT, bass(root + (12 if pos == 3.5 else 0), d * 1.6))

            # drums
            if name in ("verse", "drop"):
                kpos = [0, 1.5, 2, 3] if name == "verse" else [0, 1, 2, 3]
                for p in kpos:
                    tr.add("kick", t0 + p * BEAT, kick())
                    kicks.append(t0 + p * BEAT)
                for p in (1, 3):
                    tr.add("clap", t0 + p * BEAT, clap(0.9), 0.05)
                hats = 16 if name == "drop" else 8
                for s in range(hats):
                    p = s * 4 / hats
                    v = 0.9 if (s % (hats // 4)) == hats // 8 else 0.45
                    tr.add("hat", t0 + p * BEAT, hat(v, open_=(name == "drop" and s % 4 == 2)), 0.3)
                for s in range(8):
                    tr.add("perc", t0 + (s + 0.5) * BEAT / 2, shaker(0.5), -0.4)
            if name == "build":
                for p in range(4):
                    tr.add("kick", t0 + p * BEAT, kick(0.8))
                    kicks.append(t0 + p * BEAT)
                if last:
                    pass
            if name == "intro" and b == 0:
                tr.add("fx", t0, bell(chord[2] + 12, 0.6), 0.2)
        # section transitions
        sec_start, sec_end = bar0 * BAR, (bar0 + bars) * BAR
        if name in ("intro", "build", "break"):
            rd = min(BAR * (2 if name == "build" else 1), sec_end - sec_start)
            tr.add("fx", sec_end - rd, riser(rd) * 0.5)
        if name == "build":
            rd = min(2 * BAR, sec_end - sec_start)
            tr.add("fx", sec_end - rd, snare_roll(rd) * 0.55)
        if name in ("drop", "outro") or (name == "verse" and bar0 > 0):
            tr.add("fx", sec_start, impact() * (0.8 if name != "verse" else 0.45))
        if name == "outro":
            tr.add("fx", sec_start, bell(74, 0.7), -0.2)
            tr.add("fx", sec_start + BEAT, bell(77, 0.5), 0.2)
            tr.add("fx", sec_start + 2 * BEAT, bell(81, 0.5), 0.0)
        bar0 += bars

    # sidechain envelope from kicks: dip 0.45 recovering over 0.22 s
    env_t = t_axis(0.25)
    dip = 1 - 0.55 * np.exp(-env_t * 14)
    for k in kicks:
        i = int(k * SR)
        seg = side[i:i + len(dip)]
        side[i:i + len(dip)] = np.minimum(seg, dip[: len(seg)])

    levels = {"kick": 0.95, "clap": 0.45, "hat": 0.3, "perc": 0.35, "bass": 0.55,
              "padL": 0.42, "padR": 0.42, "pluck": 0.32, "fx": 0.6}
    duck = {"bass", "padL", "padR", "pluck"}
    mix = np.zeros((2, tr.n))
    send = np.zeros((2, tr.n))
    for bus, x in tr.buf.items():
        g = levels.get(bus, 0.5)
        y = x * g * (side if bus in duck else 1.0)
        mix += y
        if bus in ("clap", "pluck", "padL", "padR", "fx"):
            send += y * (0.35 if bus != "fx" else 0.5)
    irl, irr = reverb_ir()
    wet = np.stack([fftconvolve(send[0], irl)[: tr.n], fftconvolve(send[1], irr)[: tr.n]]) * 0.09
    mix = mix + wet
    mix[0] = hp(mix[0], 30)
    mix[1] = hp(mix[1], 30)
    # gentle master glue + limiter
    mix = np.tanh(mix * 1.1) / np.tanh(1.1)
    mix = mix / (np.max(np.abs(mix)) + 1e-9) * 0.89
    end = int((total + 2.5) * SR)
    mix = mix[:, :end]
    fade = int(0.8 * SR)
    mix[:, -fade:] *= np.linspace(1, 0, fade)
    import soundfile as sf
    sf.write(out_path, mix.T.astype(np.float32), SR, subtype="PCM_24")
    print(f"wrote {out_path}  {mix.shape[1] / SR:.2f}s")


if __name__ == "__main__":
    arr = json.load(open(sys.argv[1]))
    render([tuple(s) for s in arr["sections"]], sys.argv[2])
