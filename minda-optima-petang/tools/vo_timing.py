#!/usr/bin/env python3
"""Ambil timestamp sebenar setiap section [1]-[7] dari fail VO.

Guna:
    pip install faster-whisper
    python vo_timing.py ../vo/vo_full.mp3            # transcribe + align
    python vo_timing.py --words words.json           # guna word timestamps sedia ada

Output: jadual + timing.json (start/end setiap section, total duration).
Section dikesan ikut perkataan pembuka setiap beat (lihat SECTIONS), jadi
kalau skrip VO berubah, kemas kini SECTIONS juga.
"""
import argparse
import difflib
import json
import re
import subprocess
import sys

SECTIONS = [
    ("1", "HOOK", "anak sekolah pagi"),
    ("2", "EXAGGERATE", "main phone berjam"),
    ("3", "BRIDGE", "haa parents apa"),
    ("4", "USP 1 - Kelas fizikal petang", "sekarang minda optima"),
    ("5", "USP 2 - Tanpa hafal suku kata", "anak belajar membaca"),
    ("6", "USP 3 - Sejak 1995, 1-to-1", "sejak"),  # Whisper mungkin tulis "1995"
    ("7", "CTA", "nak tahu jadual"),
]


def norm(word):
    return re.sub(r"[^a-z0-9]", "", word.lower())


def audio_duration(path):
    out = subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", path], text=True)
    return float(out.strip())


def transcribe(path):
    from faster_whisper import WhisperModel

    model = WhisperModel("small", compute_type="int8")
    segments, _ = model.transcribe(path, language="ms", word_timestamps=True)
    return [{"word": w.word.strip(), "start": w.start, "end": w.end}
            for seg in segments for w in seg.words]


def find_anchor(words, anchor, from_idx):
    """Index perkataan pertama yang paling sepadan dengan anchor, bermula from_idx."""
    target = norm(anchor.replace(" ", ""))
    n = len(anchor.split())
    best_idx, best_score = None, 0.0
    for i in range(from_idx, len(words)):
        # Whisper boleh pecah/gabung perkataan, jadi banding n-1..n+1 perkataan.
        for span in (n - 1, n, n + 1):
            if span < 1 or i + span > len(words):
                continue
            cand = "".join(norm(w["word"]) for w in words[i:i + span])
            score = difflib.SequenceMatcher(None, target, cand).ratio()
            if score > best_score:
                best_idx, best_score = i, score
    return best_idx, best_score


def align(words):
    starts, idx = [], 0
    for num, _, anchor in SECTIONS:
        i, score = find_anchor(words, anchor, idx)
        if i is None or score < 0.6:
            sys.exit(f"Tak jumpa pembuka section [{num}] '{anchor}' (skor {score:.2f}). "
                     "Semak transkrip / kemas kini SECTIONS.")
        starts.append(i)
        idx = i + 1
    rows = []
    for k, (num, name, _) in enumerate(SECTIONS):
        first = starts[k]
        last = (starts[k + 1] - 1) if k + 1 < len(SECTIONS) else len(words) - 1
        rows.append({
            "section": num,
            "name": name,
            "start": round(words[first]["start"], 2),
            "end": round(words[last]["end"], 2),
            "text": " ".join(w["word"] for w in words[first:last + 1]),
        })
    return rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("audio", nargs="?")
    ap.add_argument("--words", help="JSON [{word,start,end}, ...] (skip transcribe)")
    ap.add_argument("--out", default="timing.json")
    args = ap.parse_args()
    if not args.audio and not args.words:
        ap.error("beri fail audio atau --words")

    if args.words:
        with open(args.words) as f:
            words = json.load(f)
    else:
        words = transcribe(args.audio)
    total = audio_duration(args.audio) if args.audio else words[-1]["end"]
    rows = align(words)

    print(f"Total duration: {total:.2f}s\n")
    print(f"{'Sec':<4}{'Start':>7}{'End':>7}{'Dur':>6}  Name")
    for r in rows:
        print(f"[{r['section']}] {r['start']:>7.2f}{r['end']:>7.2f}"
              f"{r['end'] - r['start']:>6.2f}  {r['name']}")

    with open(args.out, "w") as f:
        json.dump({"total_duration": round(total, 2), "sections": rows,
                   "words": words}, f, ensure_ascii=False, indent=2)
    print(f"\nDisimpan: {args.out}")


if __name__ == "__main__":
    main()
