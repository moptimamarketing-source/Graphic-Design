import sys, json, wave
import numpy as np
import sherpa_onnx as so
M = sys.argv[1]; wav = sys.argv[2]; out = sys.argv[3]
min_sil = float(sys.argv[4]) if len(sys.argv) > 4 else 0.12
with wave.open(wav) as w:
    sr = w.getframerate(); a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
rec = so.OfflineRecognizer.from_whisper(encoder=f"{M}/sherpa-onnx-whisper-large-v3/large-v3-encoder.int8.onnx",
    decoder=f"{M}/sherpa-onnx-whisper-large-v3/large-v3-decoder.int8.onnx",
    tokens=f"{M}/sherpa-onnx-whisper-large-v3/large-v3-tokens.txt", language="ms", task="transcribe", num_threads=4)
cfg = so.VadModelConfig(); cfg.silero_vad.model = f"{M}/silero_vad.onnx"; cfg.silero_vad.min_silence_duration = min_sil
cfg.silero_vad.min_speech_duration = 0.1; cfg.silero_vad.threshold = 0.5; cfg.silero_vad.max_speech_duration = 12; cfg.sample_rate = sr
vad = so.VoiceActivityDetector(cfg, buffer_size_in_seconds=60)
ws = cfg.silero_vad.window_size; i = 0; segs = []
while i < len(a):
    vad.accept_waveform(a[i:i+ws]); i += ws
    while not vad.empty():
        segs.append((vad.front.start / sr, np.array(vad.front.samples))); vad.pop()
vad.flush()
while not vad.empty():
    segs.append((vad.front.start / sr, np.array(vad.front.samples))); vad.pop()
res = []
for st, smp in segs:
    s = rec.create_stream(); s.accept_waveform(sr, smp); rec.decode_stream(s)
    r = s.result; en = st + len(smp) / sr
    res.append({"start": round(st, 2), "end": round(en, 2), "text": r.text.strip(), "tokens": list(r.tokens), "ts": list(r.timestamps)})
    print(f"[{st:6.2f}-{en:6.2f}] {r.text.strip()}  (ts:{len(r.timestamps)})", flush=True)
json.dump(res, open(out, "w"), ensure_ascii=False, indent=1)
