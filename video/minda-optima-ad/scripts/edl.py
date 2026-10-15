"""Edit decision list: best takes only, pauses and repeats removed, cuts snapped to the 120 BPM grid.

Writes edl.json (segments + timed captions) and the voice track (voice.wav) cut to match.
usage: python edl.py clean_audio_dir out_dir
"""
import json
import math
import sys

import numpy as np
import soundfile as sf

GRID = 0.25  # eighth note at 120 BPM
LEAD = 0.10  # breath kept before first word

# (clip, source_in_speech, source_speech_end, latest_allowed_out)
TAKES = [
    ("0816", 1.38, 8.36, 9.30),
    ("0817", 1.00, 6.36, 7.20),
    ("0818", 1.52, 4.14, 4.72),
    ("0818", 4.78, 5.86, 6.22),
    ("0818", 6.30, 11.28, 12.90),
    ("0819", 4.32, 10.34, 11.70),
    ("0820", 7.84, 11.66, 11.78),
    ("HOLD", 34.0, 11.88, 0),  # freeze until the punchline word lands on bar 17 (t=34.0)
    ("0820", 11.88, 13.20, 15.00),
    ("0821", 11.50, 14.88, 16.10),
]

# caption chunks: (clip, start, end, text, highlight words)
CHUNKS = [
    ("0816", 1.38, 3.88, "Kami baru buka cawangan di Minda Optima.", ["cawangan", "Minda", "Optima."]),
    ("0816", 4.46, 5.44, "Besar ni je.", ["Besar"]),
    ("0816", 6.18, 8.36, "Serius, besar ni je?", ["Serius,"]),
    ("0817", 1.00, 2.70, "Sebab untuk kelas online,", ["online,"]),
    ("0817", 2.88, 6.36, "ruang macam ni je dah cukup untuk mula belajar.", ["cukup"]),
    ("0818", 1.52, 4.14, "Tak perlu fikir cawangan mana paling dekat.", ["paling", "dekat."]),
    ("0818", 4.78, 5.86, "Tak perlu drive.", ["drive."]),
    ("0818", 6.30, 7.24, "Yang penting,", ["penting,"]),
    ("0818", 7.38, 9.56, "anak ada ruang belajar yang sesuai,", ["ruang", "belajar"]),
    ("0818", 9.82, 11.28, "device dan internet.", ["device", "internet."]),
    ("0819", 4.32, 6.54, "Cikgu beri perhatian secara one-to-one,", ["one-to-one,"]),
    ("0819", 6.66, 7.36, "bergilir,", ["bergilir,"]),
    ("0819", 7.50, 10.34, "dan parent pun boleh monitor sesi kelas anak.", ["monitor"]),
    ("0820", 7.84, 9.02, "Jadi sebenarnya,", []),
    ("0820", 9.16, 11.66, "cawangan yang paling dekat dengan rumah anda...", ["paling", "dekat"]),
    ("0820", 11.88, 13.20, "mungkin dalam rumah anda.", ["dalam", "rumah", "anda."]),
    ("0821", 11.50, 14.88, "Klik untuk tanya kelas yang sesuai untuk anak anda.", ["Klik", "tanya"]),
]


def snap_out(t_start, src_in, speech_end, latest):
    """Pick a source out-point so the timeline cut lands on the beat grid when possible."""
    want = speech_end + 0.12
    tl_end = t_start + (want - src_in)
    snapped = math.ceil(tl_end / GRID - 1e-6) * GRID
    out = src_in + (snapped - t_start)
    return min(out, latest) if out <= latest else want


def word_times(text, s, e):
    """Spread words across the chunk by character weight (vowel-ish syllable proxy)."""
    words = text.split()
    w = np.array([max(len(x.strip(".,?!")), 2) + 1.5 for x in words], dtype=float)
    edges = s + (e - s) * np.concatenate([[0], np.cumsum(w) / w.sum()])
    return [[words[i], round(float(edges[i]), 3), round(float(edges[i + 1]), 3)] for i in range(len(words))]


def main(clean_dir, out_dir):
    segs, t = [], 0.0
    for clip, sp_in, sp_end, latest in TAKES:
        if clip == "HOLD":
            prev = segs[-1]
            dur = round(sp_in - LEAD - t, 3)
            segs.append({"clip": prev["clip"], "hold": True, "src_in": prev["src_out"], "src_out": prev["src_out"], "start": round(t, 3), "dur": dur})
            t = round(t + dur, 3)
            continue
        src_in = sp_in - LEAD
        src_out = snap_out(t, src_in, sp_end, latest)
        dur = round(src_out - src_in, 3)
        segs.append({"clip": clip, "src_in": round(src_in, 3), "src_out": round(src_out, 3), "start": round(t, 3), "dur": dur})
        t = round(t + dur, 3)

    caps = []
    for clip, s, e, text, hl in CHUNKS:
        seg = next(g for g in segs if g["clip"] == clip and not g.get("hold") and g["src_in"] <= s < g["src_out"])
        off = seg["start"] - seg["src_in"]
        words = word_times(text, s + off, min(e, seg["src_out"]) + off)
        caps.append({"start": round(s + off, 3), "end": round(min(e, seg["src_out"]) + off, 3), "text": text,
                     "words": [{"w": w, "s": ws, "e": we, "hl": w in hl} for w, ws, we in words]})

    # voice track, cut exactly like the picture (5 ms crossfades at each splice)
    sr = 48000
    total = t
    voice = np.zeros(int((total + 4) * sr))
    fade = int(0.005 * sr)
    for g in segs:
        if g.get("hold"):
            continue
        x, fsr = sf.read(f"{clean_dir}/{g['clip']}.wav", dtype="float32")
        assert fsr == sr, fsr
        if x.ndim > 1:
            x = x.mean(1)
        piece = x[int(g["src_in"] * sr):int(g["src_out"] * sr)].copy()
        piece[:fade] *= np.linspace(0, 1, fade)
        piece[-fade:] *= np.linspace(1, 0, fade)
        i = int(g["start"] * sr)
        voice[i:i + len(piece)] += piece
    sf.write(f"{out_dir}/voice.wav", voice, sr, subtype="PCM_24")

    json.dump({"duration_speech": total, "segments": segs, "captions": caps}, open(f"{out_dir}/edl.json", "w"), indent=1, ensure_ascii=False)
    for g in segs:
        print("HOLD" if g.get("hold") else "    ", end="")
        print(f"{g['start']:6.2f}-{g['start'] + g['dur']:6.2f}  {g['clip']}  src {g['src_in']:.2f}-{g['src_out']:.2f}")
    print("speech total", total)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
