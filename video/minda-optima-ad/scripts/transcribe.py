"""Phrase-level Malay transcription: silero VAD splits speech, Whisper (sherpa-onnx) transcribes each phrase."""
import json, sys, glob, os
import numpy as np, soundfile as sf, sherpa_onnx

models, audio_dir, out_path = sys.argv[1], sys.argv[2], sys.argv[3]
wd = os.path.join(models, "sherpa-onnx-whisper-medium")
rec = sherpa_onnx.OfflineRecognizer.from_whisper(
    encoder=f"{wd}/medium-encoder.onnx", decoder=f"{wd}/medium-decoder.onnx",
    tokens=f"{wd}/medium-tokens.txt", language="ms", task="transcribe", num_threads=4)

cfg = sherpa_onnx.VadModelConfig()
cfg.silero_vad.model = f"{models}/silero_vad.onnx"
cfg.silero_vad.min_silence_duration = 0.22
cfg.silero_vad.min_speech_duration = 0.15
cfg.silero_vad.max_speech_duration = 12
cfg.silero_vad.threshold = 0.45
cfg.sample_rate = 16000

out = {}
for f in sorted(glob.glob(f"{audio_dir}/*.wav")):
    x, sr = sf.read(f, dtype="float32")
    vad = sherpa_onnx.VoiceActivityDetector(cfg, buffer_size_in_seconds=60)
    win = cfg.silero_vad.window_size
    for i in range(0, len(x), win):
        vad.accept_waveform(x[i:i + win])
    vad.flush()
    segs = []
    while not vad.empty():
        s = vad.front; vad.pop()
        a = max(0, s.start - int(0.25 * sr)); b = min(len(x), s.start + len(s.samples) + int(0.25 * sr))
        st = rec.create_stream(); st.accept_waveform(sr, x[a:b])
        rec.decode_stream(st)
        segs.append({"s": round(s.start / sr, 2), "e": round((s.start + len(s.samples)) / sr, 2), "t": st.result.text.strip()})
    out[os.path.basename(f)] = segs
    print(os.path.basename(f), flush=True)
    for g in segs: print(f"  {g['s']:6.2f}-{g['e']:6.2f}  {g['t']}", flush=True)
json.dump(out, open(out_path, "w"), ensure_ascii=False, indent=1)
