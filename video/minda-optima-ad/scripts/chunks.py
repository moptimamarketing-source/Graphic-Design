"""Split chosen takes at micro-pauses (energy dips) and transcribe each piece -> timed caption chunks."""
import json, sys
import numpy as np, soundfile as sf, sherpa_onnx

models, audio_dir, out = sys.argv[1], sys.argv[2], sys.argv[3]
TAKES = [("0816", 1.20, 8.55), ("0817", 0.90, 6.50), ("0818", 1.42, 11.40),
         ("0819", 4.28, 10.45), ("0820", 7.72, 13.35), ("0821", 11.40, 15.05)]
wd = f"{models}/sherpa-onnx-whisper-medium"
rec = sherpa_onnx.OfflineRecognizer.from_whisper(
    encoder=f"{wd}/medium-encoder.onnx", decoder=f"{wd}/medium-decoder.onnx",
    tokens=f"{wd}/medium-tokens.txt", language="ms", task="transcribe", num_threads=4)
res = {}
for clip, a, b in TAKES:
    x, sr = sf.read(f"{audio_dir}/{clip}.wav", dtype="float32")
    hop = int(0.02 * sr)
    seg = x[int(a * sr):int(b * sr)]
    db = np.array([20 * np.log10(np.sqrt(np.mean(seg[i:i + hop] ** 2)) + 1e-9) for i in range(0, len(seg) - hop, hop)])
    voiced = db > -36
    # speech runs separated by >= 0.10 s of low energy
    runs, i, n = [], 0, len(voiced)
    while i < n:
        if voiced[i]:
            j = i
            while j < n and (voiced[j] or (j + 5 < n and voiced[j:j + 5].any())):
                j += 1
            runs.append([i, j]); i = j
        else:
            i += 1
    runs = [r for r in runs if (r[1] - r[0]) * 0.02 >= 0.12]
    pieces = []
    for s, e in runs:
        t0, t1 = a + s * 0.02, a + e * 0.02
        st = rec.create_stream()
        st.accept_waveform(sr, x[max(0, int((t0 - 0.15) * sr)):int((t1 + 0.15) * sr)])
        rec.decode_stream(st)
        pieces.append({"s": round(t0, 2), "e": round(t1, 2), "t": st.result.text.strip()})
        print(f"{clip} {t0:6.2f}-{t1:6.2f} {st.result.text.strip()}", flush=True)
    res[clip] = pieces
json.dump(res, open(out, "w"), ensure_ascii=False, indent=1)
