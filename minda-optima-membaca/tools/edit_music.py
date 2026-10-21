"""Cut the licensed Envato track into a 34 s bed that follows the voiceover.

  video 0.00-8.20   suspense: track's pre-drop bars under a closed low-pass,
                    opening from "Tapi sebenarnya" into the drop, with the
                    synth heartbeat/tick/drone layer (score-synth.wav) on top
  video 8.20        first drop of the track lands on "kemahiran"
  video 21.3-25.1   breakdown: low-passed and softer for "Jangan bandingkan"
  video 25.1-26.4   filter sweeps back open
  video 26.4-27.0   cut into the track's pre-drop silence
  video 27.00       final-section drop lands on the logo, fades out by 34 s

The bed is ducked under the VO and loudness-matched to the old synth score.
The Envato WAV is licensed per project, so it is not committed: download
"Epic Adventure by RVStudio_Main.wav" from the project Drive folder into
assets/music-src/ first.

Usage: python3 tools/edit_music.py assets/music-src/epic-adventure-rvstudio-main.wav \
         assets/score-synth.wav assets/vo.mp3 assets/music.wav
"""

import os
import subprocess
import sys
import tempfile
import wave

import numpy as np
from scipy.signal import butter, sosfilt, sosfilt_zi

SR = 44100
DUR = 34.0
N = int(SR * DUR)

DROP1_SRC, DROP1_VID = 28.28, 8.2  # first drop of the track
DROP2_SRC, DROP2_VID = 110.57, 27.0  # final-section drop, after a short silence
CUT_VID = 26.4  # switch to the second section here (inside its pre-drop silence)
XF = 0.06


def decode(path, ch=2):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", str(ch), "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, ch).T.astype(np.float64)


def lufs(x):
    fd, p = tempfile.mkstemp(suffix=".wav", dir=os.path.dirname(os.path.abspath(sys.argv[4])))
    os.close(fd)
    write(p, x)
    out = subprocess.run(["ffmpeg", "-nostats", "-i", p, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    os.remove(p)
    return float(out.rsplit("I:", 1)[1].split("LUFS")[0])


def write(path, x):
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1).T * 32767).astype(np.int16).tobytes())


def ramp(t, pts):
    """Piecewise-linear automation through (time, value) points."""
    ts, vs = zip(*pts)
    return np.interp(t, ts, vs)


track = decode(sys.argv[1])
synth = decode(sys.argv[2])
t = np.arange(N) / SR

# --- assemble the two sections ---
bed = np.zeros((2, N))
i_cut = int(CUT_VID * SR)
xf = int(XF * SR)
a0 = int((DROP1_SRC - DROP1_VID) * SR)
bed[:, : i_cut + xf] = track[:, a0 : a0 + i_cut + xf]
b0 = int((DROP2_SRC - DROP2_VID + CUT_VID) * SR)
sec_b = track[:, b0 : b0 + N - i_cut]
fade_in = np.linspace(0, 1, xf)
bed[:, i_cut : i_cut + xf] *= 1 - fade_in
sec_b[:, :xf] *= fade_in
bed[:, i_cut:] += sec_b

# --- time-varying low-pass (block-wise, filter state carried across blocks) ---
fc = np.where(
    t < 4.5,
    280.0,
    np.where(t < 8.15, 280.0 * (16000 / 280.0) ** (((t - 4.5) / 3.65).clip(0, 1) ** 1.8), 18000.0),
)
fc = np.minimum(fc, ramp(t, [(0, 18000), (21.3, 18000), (21.6, 700), (25.1, 700), (26.4, 14000), (34, 18000)]))
blk = 512
for c in range(2):
    zi = None
    for s in range(0, N, blk):
        f = min(float(fc[s]), 18000.0)
        sos = butter(2, f, "low", fs=SR, output="sos")
        if zi is None:
            zi = sosfilt_zi(sos) * bed[c, 0]
        bed[c, s : s + blk], zi = sosfilt(sos, bed[c, s : s + blk], zi=zi)

gain = ramp(t, [(0, 0.0), (0.4, 0.9), (4.5, 0.95), (8.15, 1.0), (21.3, 1.0), (21.6, 0.75), (25.1, 0.75), (26.4, 1.0), (32.4, 1.0), (34, 0.0)])
bed *= gain

# --- synth suspense layer (heartbeat, ticks, drone, riser) for the opening ---
layer = np.zeros((2, N))
n_l = int(8.18 * SR)
layer[:, :n_l] = synth[:, :n_l] * ramp(t[:n_l], [(0, 1), (7.9, 1), (8.18, 0)])
bed += 0.8 * layer

# --- duck under the voiceover ---
vo = decode(sys.argv[3], 1)[0][:N]
vo = np.pad(vo, (0, N - len(vo)))
win = int(0.03 * SR)
speech = (np.sqrt(np.convolve(vo**2, np.ones(win) / win, mode="same")) > 0.02).astype(float)
duck = np.zeros(N)
atk, rel = np.exp(-1 / (0.04 * SR)), np.exp(-1 / (0.35 * SR))
g = 0.0
for i in range(N):
    c = atk if speech[i] > g else rel
    g = c * g + (1 - c) * speech[i]
    duck[i] = g
bed *= 1 - 0.5 * duck

# --- match the synth score's loudness so data-volume stays meaningful ---
bed *= 10 ** ((-19.8 - lufs(bed)) / 20)
peak = np.max(np.abs(bed))
if peak > 0.97:
    bed = np.tanh(bed / peak * 1.1) * 0.97
write(sys.argv[4], bed)
print("wrote", sys.argv[4], "LUFS", round(lufs(bed), 1))
