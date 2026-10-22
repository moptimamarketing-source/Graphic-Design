"""Cari masa setiap baris skrip dalam fail VO (public/vo.mp3).

Potong audio pada setiap jeda, transkrip setiap potongan dengan Whisper
(sherpa-onnx, model dari GitHub releases), dan cetak hasilnya. Padankan
output dengan baris skrip, kemudian kemas kini `start` dalam src/timing.json.

Persediaan (sekali):
  pip install sherpa-onnx
  curl -L -o w.tar.bz2 https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-small.tar.bz2
  tar xjf w.tar.bz2

Guna:
  python3 scripts/align_vo.py <folder-model-whisper-small>
"""
import os
import subprocess
import sys

import numpy as np
import sherpa_onnx

SR = 16000
ROOT = os.path.join(os.path.dirname(__file__), "..")
model = sys.argv[1].rstrip("/") + "/small-"

pcm = subprocess.run(
    ["ffmpeg", "-v", "error", "-i", os.path.join(ROOT, "public", "vo.mp3"), "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"],
    capture_output=True,
    check=True,
).stdout
audio = np.frombuffer(pcm, dtype=np.int16).astype(np.float32) / 32768

# Tenaga setiap 10ms; jeda = >=100ms di bawah -30 dB dari puncak.
hop = SR // 100
n = len(audio) // hop
rms = np.sqrt((audio[: n * hop].reshape(n, hop) ** 2).mean(1)) + 1e-9
db = 20 * np.log10(rms / rms.max())
low = db < -30
cuts = [0.0]
i = 0
while i < n:
    if low[i]:
        j = i
        while j < n and low[j]:
            j += 1
        if j - i >= 10 and i > 0:
            cuts.append((i + j) / 200)
        i = j
    else:
        i += 1
cuts.append(len(audio) / SR)

rec = sherpa_onnx.OfflineRecognizer.from_whisper(
    encoder=model + "encoder.int8.onnx",
    decoder=model + "decoder.int8.onnx",
    tokens=model + "tokens.txt",
    language="ms",
    task="transcribe",
    num_threads=4,
)
for s, e in zip(cuts, cuts[1:]):
    if e - s < 0.25:
        continue
    stream = rec.create_stream()
    stream.accept_waveform(SR, audio[int(s * SR) : int(e * SR)])
    rec.decode_stream(stream)
    print(f"{s:6.2f}-{e:6.2f} | {stream.result.text.strip()}")
