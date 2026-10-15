"""Colour grade: match exposure + white balance across clips, then apply one shared vibrant look.

usage: python grade.py clips_dir out_dir
Measures each clip over the range used in the edit, then writes <out_dir>/<id>.mp4.
"""
import math
import subprocess
import sys

import numpy as np

USES = {"0816": (1.3, 8.5), "0817": (0.9, 6.6), "0820": (7.8, 13.3), "0821": (11.4, 15.4),
        "0822": (7.2, 12.9), "0823": (6.0, 9.9), "0824": (7.2, 12.6)}
TARGET_Y = 0.70        # common mid exposure
WB_STRENGTH = 0.6      # partial grey-world: walls are genuinely light blue
WARM = (1.02, 1.0, 0.975)

# shared look: soft S-curve, lifted vibrance, a touch of saturation and crispness
LOOK = ("curves=master='0/0 0.06/0.04 0.25/0.22 0.5/0.52 0.75/0.8 0.94/0.95 1/0.985',"
        "vibrance=intensity=0.32,eq=saturation=1.1:contrast=1.03,unsharp=5:5:0.45")


def frames(path, a, b, n=6):
    out = []
    for t in np.linspace(a, b, n):
        raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.2f}", "-i", path, "-frames:v", "1", "-vf", "scale=270:480",
                              "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
        out.append(np.frombuffer(raw, np.uint8).reshape(480, 270, 3).astype(float) / 255)
    return np.stack(out).reshape(-1, 3)


def stats(x):
    mx, mn = x.max(1), x.min(1)
    sat = (mx - mn) / (mx + 1e-6)
    y = x @ np.array([.2126, .7152, .0722])
    neu = x[(sat < 0.12) & (y > 0.35) & (y < 0.92)]
    return y.mean(), neu.mean(0), sat.mean()


def main(src, dst):
    for clip, (a, b) in USES.items():
        ym, neu, sat = stats(frames(f"{src}/{clip}.mp4", a, b))
        m = neu.mean()
        gains = [((m / neu[i]) ** WB_STRENGTH) * WARM[i] for i in range(3)]
        gamma = min(1.4, max(0.85, math.log(ym) / math.log(TARGET_Y)))
        vf = (f"colorchannelmixer=rr={gains[0]:.4f}:gg={gains[1]:.4f}:bb={gains[2]:.4f},"
              f"eq=gamma={gamma:.3f},{LOOK},format=yuv420p")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{src}/{clip}.mp4", "-vf", vf, "-c:v", "libx264",
                        "-preset", "medium", "-crf", "17", "-g", "15", "-an", f"{dst}/{clip}.mp4"], check=True)
        y2, neu2, sat2 = stats(frames(f"{dst}/{clip}.mp4", a, b))
        print(f"{clip}: Y {ym:.3f}->{y2:.3f}  neutral {np.round(neu, 3)}->{np.round(neu2, 3)}  sat {sat:.3f}->{sat2:.3f}  gamma {gamma:.2f}", flush=True)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
