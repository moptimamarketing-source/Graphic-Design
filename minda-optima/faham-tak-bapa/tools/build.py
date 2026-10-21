"""Bina bahan untuk komposisi HyperFrames "Faham Tak? — versi Bapa".

1. Susun suara Luqman (ElevenLabs) ikut timeline + laraskan tempo.
2. Regang (time-warp) klip Seedance supaya mulut ikut suara Luqman, upscale ke 1080x1920 30fps.
3. Kira masa setiap perkataan (untuk caption & animasi) -> hyperframes/timing.js
4. Mix audio: suara + SFX + muzik sitcom (ducking bawah suara) -> hyperframes/assets/mix.wav

Guna: python3 tools/build.py   (dari folder faham-tak-bapa)
"""
import json
import os
import re
import subprocess
import wave

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HF = os.path.join(ROOT, "hyperframes")
ASSETS = os.path.join(HF, "assets")
SR = 44100
FPS = 30
W, H = 1080, 1920
os.makedirs(ASSETS, exist_ok=True)

# ---------------------------------------------------------------- data dialog
# Frasa dalam fail Luqman: (mula, tamat) dalam saat fail asal + perkataan.
# Perkataan bertanda * = kata kunci (diwarnakan dalam caption).
PHRASES = {
    "bapa-1": [
        (0.14, 0.90, "Saya tanya anak,"),
        (0.98, 1.57, "“*Faham *tak?”"),
        (1.73, 3.06, "Dia *angguk *laju..."),
        (4.47, 5.37, "Dia *tak *faham."),
    ],
    "bapa-2": [
        (0.13, 0.75, "Soalan"),
        (0.84, 1.58, "“*faham *tak”"),
        (1.69, 3.43, "memang akan dapat jawapan"),
        (3.52, 3.97, "“*ya”."),
        (4.34, 5.94, "Cuba tanya *soalan *terbuka."),
        (6.25, 7.80, "“*Siapa dalam cerita ni?”"),
        (7.99, 9.60, "“Lepas tu, *apa *jadi?”"),
    ],
    "bapa-3": [
        (0.15, 2.59, "*Isteri saya pun guna teknik ni..."),
        (2.82, 3.45, "pada saya."),
        (4.10, 4.99, "Hasilnya..."),
        (5.41, 5.81, "*sama."),
    ],
}

# Caption: kumpulan perkataan (indeks global dalam fail) yang dipapar serentak.
CHUNKS = {
    "bapa-1": [[0, 1, 2], [3, 4], [5, 6, 7], [8, 9, 10]],
    "bapa-2": [[0, 1, 2], [3, 4, 5], [6, 7], [8, 9], [10, 11], [12, 13, 14, 15], [16, 17, 18, 19]],
    "bapa-3": [[0, 1, 2], [3, 4, 5], [6, 7], [8], [9]],
}

# Potongan suara: (fail, src_mula, src_tamat, tempo, out_mula)
S1, S2, S3 = 1.10, 1.20, 1.10
A0 = 0.0
PIECES = [
    ("bapa-1", 0.06, 3.12, S1, A0 + 0.06),
    ("bapa-1", 4.40, 5.42, S1, A0 + 0.06 + (3.12 - 0.06) / S1 + 0.42),
]
A_END = PIECES[-1][4] + (5.42 - 4.40) / S1 + 0.30
B0 = A_END
PIECES.append(("bapa-2", 0.06, 9.72, S2, B0 + 0.08))
B_END = B0 + 0.08 + (9.72 - 0.06) / S2 + 0.18
C0 = B_END
PIECES.append(("bapa-3", 0.08, 5.95, S3, C0 + 0.05))
SAMA_END = C0 + 0.05 + (5.81 - 0.08) / S3
FREEZE = SAMA_END + 0.06
FREEZE_AT = 6.0  # masa dalam punchline.mp4 untuk freeze frame
D0 = FREEZE + 0.85
TOTAL = round(D0 + 1.6, 3)

# Sauh lip-sync: (masa dalam fail Luqman, masa dalam klip Seedance) bagi frasa yang sama.
ANCHORS = {
    "hook": ("bapa-1", [(0.14, 0.29), (0.90, 0.97), (0.98, 1.20), (1.57, 1.73), (1.73, 2.32),
                        (3.06, 3.15), (4.47, 4.14), (5.37, 4.83)]),
    "tip": ("bapa-2", [(0.13, 0.18), (1.69, 1.12), (3.97, 2.50), (4.34, 2.93), (5.94, 4.45),
                       (6.25, 4.78), (7.80, 5.95), (7.99, 6.32), (9.60, 7.91)]),
    "punchline": ("bapa-3", [(0.15, 0.15), (2.59, 1.92), (2.82, 1.98), (3.45, 2.47), (4.10, 2.90),
                             (4.99, 3.70), (5.41, 4.10), (5.81, 4.56)]),
}
SCENES = {"hook": (0.0, A_END), "tip": (B0, B_END), "punchline": (C0, D0)}


def src_to_out(f, t):
    """Masa dalam fail suara -> masa dalam video akhir."""
    for pf, a, b, s, o in PIECES:
        if pf == f and a - 1e-6 <= t <= b + 1e-6:
            return o + (t - a) / s
    raise ValueError(f"{f}@{t} di luar potongan")


# ---------------------------------------------------------------- audio utils
def load(path, sr=SR, ch=1):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", str(ch), "-ar", str(sr), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
    return x.reshape(-1, ch) if ch > 1 else x


def tempo(path, a, b, s):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(a), "-to", str(b), "-i", path,
                          "-af", f"atempo={s}", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def write_wav(path, x):
    x = np.clip(x, -1, 1)
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype("<i2").tobytes())


def syllables(word):
    return max(1, len(re.findall(r"[aeiou]+", word.lower())))


# ---------------------------------------------------------------- 1. perkataan
def word_timeline():
    out = {}
    for f, phrases in PHRASES.items():
        words = []
        for a, b, text in phrases:
            toks = text.split()
            wts = [syllables(re.sub(r"[^A-Za-z]", "", w)) + 0.4 for w in toks]
            tot = sum(wts)
            t = a
            for tok, wt in zip(toks, wts):
                d = (b - a) * wt / tot
                key = tok.startswith("*") or "*" in tok
                clean = tok.replace("*", "")
                words.append({"w": clean, "key": key, "t0": round(src_to_out(f, t), 3),
                              "t1": round(src_to_out(f, t + d), 3)})
                t += d
        out[f] = words
    return out


# ---------------------------------------------------------------- 2. video warp
def warp(name):
    f, anchors = ANCHORS[name]
    t0, t1 = SCENES[name]
    src = os.path.join(ROOT, "raw", f"{name}.mp4")
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src],
                               capture_output=True, text=True).stdout)
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                         capture_output=True, check=True).stdout
    sw, sh = 480, 854
    frames = np.frombuffer(raw, dtype=np.uint8).reshape(-1, sh, sw, 3)
    nsrc = len(frames)
    src_fps = nsrc / dur
    pts = [(src_to_out(f, a) - t0, c) for a, c in anchors]
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    nout = int(round((t1 - t0) * FPS))
    out_t = np.arange(nout) / FPS
    clip_t = np.interp(out_t, xs, ys)
    # di luar sauh: kadar 1x, dihadkan pada panjang klip (tahan frame terakhir = freeze)
    clip_t = np.where(out_t < xs[0], ys[0] - (xs[0] - out_t), clip_t)
    clip_t = np.where(out_t > xs[-1], ys[-1] + (out_t - xs[-1]), clip_t)
    if name == "punchline":
        # freeze frame: muka paling deadpan (zoom rapat) bermula pada FREEZE
        clip_t = np.where(out_t >= FREEZE - t0, FREEZE_AT, clip_t)
    clip_t = np.clip(clip_t, 0, dur - 1 / src_fps)
    idx = np.clip(np.round(clip_t * src_fps).astype(int), 0, nsrc - 1)
    dst = os.path.join(ASSETS, f"{name}.mp4")
    vf = ("scale=1080:1922:flags=lanczos,crop=1080:1920,hqdn3d=1.5:1.5:3:3,"
          "unsharp=5:5:0.7:5:5:0.0,eq=contrast=1.03:saturation=1.06,format=yuv420p")
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
                          "-s", f"{sw}x{sh}", "-r", str(FPS), "-i", "-", "-vf", vf,
                          "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-g", "15", "-an", dst],
                         stdin=subprocess.PIPE)
    for i in idx:
        p.stdin.write(frames[i].tobytes())
    p.stdin.close()
    p.wait()
    rates = [(ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]) for i in range(len(xs) - 1)]
    print(f"{name}: {nout} frame, kadar video {min(rates):.2f}x–{max(rates):.2f}x")
    return dst


# ---------------------------------------------------------------- 3. mix audio
def mix(words):
    n = int(SR * TOTAL) + SR
    voice = np.zeros(n)
    for f, a, b, s, o in PIECES:
        seg = tempo(os.path.join(ROOT, "audio", f"{f}.mp3"), a, b, s)
        i = int(o * SR)
        voice[i:i + len(seg)] += seg[: n - i]
    # normalisasi suara ke puncak ~ -3 dBFS
    voice *= 0.7 / np.max(np.abs(voice))

    sfx_dir = os.path.join(ROOT, "audio", "sfx")
    fx = np.zeros((n, 2))

    def put(name, t, gain=1.0):
        x = load(os.path.join(sfx_dir, name), ch=2)
        i = int(t * SR)
        e = min(len(x), n - i)
        fx[i:i + e] += x[:e] * gain

    W1, W2, W3 = words["bapa-1"], words["bapa-2"], words["bapa-3"]
    ev = {}
    # Babak A
    ev["bubble"] = W1[3]["t0"]
    put("pop.wav", ev["bubble"] - 0.02, 0.55)
    ev["nod"] = W1[5]["t0"]
    put("boing.wav", ev["nod"], 0.35)
    put("boing.wav", ev["nod"] + 0.42, 0.3)
    ev["takfaham"] = W1[8]["t0"]
    put("scratch.wav", ev["takfaham"] - 0.08, 0.5)
    # Babak B
    ev["b_in"] = B0
    put("swipe.wav", B0 - 0.12, 0.35)
    ev["card_faham"] = W2[1]["t0"]
    put("pop.wav", ev["card_faham"] - 0.02, 0.5)
    ev["ya_start"] = W2[3]["t0"]
    ev["ya_end"] = W2[7]["t1"]
    ev["ya_times"] = [round(ev["ya_start"] + k * (ev["ya_end"] - ev["ya_start"] + 0.15) / 14, 3) for k in range(14)]
    for k, t in enumerate(ev["ya_times"]):
        put("ting.wav", t, 0.22 + 0.01 * k)
    ev["terbuka"] = W2[8]["t0"]
    put("swipe.wav", ev["terbuka"] - 0.15, 0.55)
    ev["terbuka_txt"] = W2[10]["t0"]
    ev["q1"] = W2[12]["t0"]
    put("pop.wav", ev["q1"] - 0.02, 0.55)
    ev["q2"] = W2[16]["t0"]
    put("pop.wav", ev["q2"] - 0.02, 0.55)
    # Babak C
    ev["c_in"] = C0
    put("swipe.wav", C0 - 0.12, 0.3)
    ev["isteri"] = W3[0]["t0"]
    ev["padasaya"] = W3[6]["t0"]
    ev["crickets"] = W3[7]["t1"] + 0.05
    put("crickets.wav", ev["crickets"], 0.35)
    ev["hasilnya"] = W3[8]["t0"]
    ev["sama"] = W3[9]["t0"]
    ev["freeze"] = FREEZE
    put("dundun.wav", FREEZE, 0.75)
    ev["end"] = D0
    put("chime.wav", D0 + 0.1, 0.45)

    # Muzik: ducking ikut envelope suara, senyap pada momen lawak
    mus = load(os.path.join(sfx_dir, "music.wav"), ch=2)
    mus = np.concatenate([mus, mus])[:n]
    env = np.convolve(np.abs(voice), np.ones(int(0.05 * SR)) / int(0.05 * SR), mode="same")
    duck = 1 - 0.65 * np.clip(env / 0.05, 0, 1)
    k = int(0.08 * SR)
    duck = np.convolve(duck, np.ones(k) / k, mode="same")
    gate = np.ones(n)
    tt = np.arange(n) / SR

    def dip(a, b, fade=0.08, floor=0.0):
        g = np.clip(np.minimum((tt - a) / fade, (b - tt) / fade), 0, 1)
        return 1 - (1 - floor) * g

    gate *= dip(ev["takfaham"] - 0.1, B0 - 0.05)  # record scratch: muzik berhenti
    gate *= dip(ev["crickets"] - 0.05, D0 - 0.02)  # cengkerik + dun dun: sunyi
    music_gain = 0.16
    out = fx + voice[:, None] + mus * (duck * gate * music_gain)[:, None]
    out = out[: int(SR * TOTAL)]
    tmp = os.path.join(ROOT, "kerja", "mix_raw.wav")
    os.makedirs(os.path.dirname(tmp), exist_ok=True)
    write_wav(tmp, out / max(1.0, np.max(np.abs(out))))
    dst = os.path.join(ASSETS, "mix.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11",
                    "-ar", "48000", dst], check=True)
    return ev


def main():
    words = word_timeline()
    for name in ANCHORS:
        warp(name)
    ev = mix(words)
    chunks = {}
    for f, groups in CHUNKS.items():
        chunks[f] = [{"t0": words[f][g[0]]["t0"], "t1": words[f][g[-1]]["t1"],
                      "words": [words[f][i] for i in g]} for g in groups]
    timing = {"total": TOTAL, "scenes": {"A": [0, A_END], "B": [B0, B_END], "C": [C0, D0], "D": [D0, TOTAL]},
              "words": words, "chunks": chunks, "ev": ev}
    with open(os.path.join(HF, "timing.js"), "w") as fh:
        fh.write("window.TIMING = " + json.dumps(timing, ensure_ascii=False, indent=1) + ";\n")
    fill = {"TOTAL": TOTAL, "A_END": A_END, "B0": B0, "B_DUR": B_END - B0, "C0": C0, "C_DUR": D0 - C0}
    with open(os.path.join(ROOT, "tools", "index.template.html")) as fh:
        html = fh.read()
    for k, v in fill.items():
        html = html.replace("{{" + k + "}}", f"{v:.3f}")
    with open(os.path.join(HF, "index.html"), "w") as fh:
        fh.write(html)
    print(f"jumlah {TOTAL:.2f}s | A 0–{A_END:.2f} | B {B0:.2f}–{B_END:.2f} | C {C0:.2f}–{D0:.2f} | D {D0:.2f}–{TOTAL:.2f}")


if __name__ == "__main__":
    main()
