"""Measure the master voice-over once per video frame (30 fps).

Writes src/data/voEnvelope.json: one loudness value (0-1) per frame, used for
the mother's lip-sync and for ducking the music under speech.
Run from the video/ folder:  python scripts/analyse_audio.py
"""
import json
import subprocess

import numpy as np

SRC = "public/assets/voiceover-fatimah.mp3"
FPS = 30
FRAMES = 1803
SR = 48000

raw = subprocess.run(
    ["ffmpeg", "-v", "error", "-i", SRC, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
    capture_output=True, check=True,
).stdout
pcm = np.frombuffer(raw, dtype=np.float32)
hop = SR // FPS
out = []
for f in range(FRAMES):
    seg = pcm[f * hop:(f + 1) * hop]
    rms = float(np.sqrt(np.mean(seg ** 2))) if len(seg) else 0.0
    db = 20 * np.log10(rms + 1e-9)
    # -42 dB (room tone) -> 0, -6 dB -> 1
    out.append(round(float(np.clip((db + 42) / 36, 0, 1)), 3))

with open("src/data/voEnvelope.json", "w") as fh:
    json.dump(out, fh, separators=(",", ":"))
print(f"{len(out)} frames, speech frames: {sum(v > 0.3 for v in out)}")
