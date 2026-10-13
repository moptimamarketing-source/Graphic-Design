#!/usr/bin/env python3
"""
transcribe.py — tukar suara dalam video jadi fail subtitle .srt (BM / English).

Guna faster-whisper (jalan dalam komputer sendiri, percuma, tiada API key).
Kali pertama akan muat turun model (~500 MB untuk "small"), lepas tu laju.

  pip install faster-whisper
  python transcribe.py video.mp4 sub.srt --lang ms

Selepas siap, SEMAK ejaan — terutama nama (Minda Optima, Pantas Baca,
The Victoria Readers) dan perkataan loghat.
"""

import argparse
import os
import re
import sys


def srt_time(s):
    ms = int(round(s * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    sec, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{sec:02d},{ms:03d}"


def chunk_words(words, max_chars, max_dur):
    """Kumpul perkataan jadi baris subtitle pendek (sesuai reels)."""
    cues, cur = [], []
    for w in words:
        text = w.word.strip()
        if not text:
            continue
        line = " ".join(x.word.strip() for x in cur + [w])
        too_long = cur and (len(line) > max_chars or w.end - cur[0].start > max_dur)
        if too_long:
            cues.append(cur)
            cur = [w]
        else:
            cur.append(w)
        if text[-1:] in ".?!" and cur:
            cues.append(cur)
            cur = []
    if cur:
        cues.append(cur)
    return [(c[0].start, c[-1].end, " ".join(x.word.strip() for x in c)) for c in cues]


# Pembetulan biasa untuk istilah Minda Optima yang whisper selalu salah eja.
FIXES = [
    (r"\bminda optim(a|um)\b", "Minda Optima"),
    (r"\bpantas baca(an)?\b", "Pantas Baca"),
    (r"\b(the )?victoria readers?\b", "The Victoria Readers"),
]


def fix_terms(text):
    for wrong, right in FIXES:
        text = re.sub(wrong, right, text, flags=re.IGNORECASE)
    return text


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawTextHelpFormatter)
    ap.add_argument("input", help="video atau audio")
    ap.add_argument("output", help="fail .srt")
    ap.add_argument("--lang", default="ms", help="ms = Bahasa Melayu, en = English, auto = kesan sendiri")
    ap.add_argument("--model", default="small",
                    help="tiny/base = laju, kurang tepat · small = seimbang · medium = tepat, perlahan")
    ap.add_argument("--max-chars", type=int, default=32)
    ap.add_argument("--max-dur", type=float, default=3.5)
    a = ap.parse_args()

    try:
        from faster_whisper import WhisperModel  # type: ignore
    except ImportError:
        sys.exit("faster-whisper belum dipasang. Jalankan:  pip install faster-whisper\n"
                 "(Atau beri skrip teks dan guna `vid.py srt-from-text`.)")

    try:
        model = WhisperModel(a.model, device="auto", compute_type="int8")
    except Exception as e:  # selalunya gagal muat turun model
        sys.exit(f"Gagal sediakan model '{a.model}': {e}\n"
                 "Kali pertama perlukan internet (huggingface.co) untuk muat turun model.\n"
                 "Alternatif: beri skrip teks dan guna `vid.py srt-from-text`.")
    segments, info = model.transcribe(
        os.path.abspath(a.input),
        language=None if a.lang == "auto" else a.lang,
        word_timestamps=True,
        vad_filter=True,
        initial_prompt="Minda Optima, Pantas Baca, The Victoria Readers, kelas membaca kanak-kanak.",
    )
    words = [w for seg in segments for w in (seg.words or [])]
    if not words:
        sys.exit("Tiada suara dikesan dalam fail ini.")
    cues = chunk_words(words, a.max_chars, a.max_dur)
    os.makedirs(os.path.dirname(os.path.abspath(a.output)) or ".", exist_ok=True)
    with open(a.output, "w", encoding="utf-8") as f:
        for k, (s, e, t) in enumerate(cues, 1):
            f.write(f"{k}\n{srt_time(s)} --> {srt_time(e)}\n{fix_terms(t)}\n\n")
    print(f"SIAP: {a.output} ({len(cues)} baris, bahasa dikesan: {info.language})")
    print("Semak ejaan sebelum bakar ke video.")


if __name__ == "__main__":
    main()
