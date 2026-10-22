"""Jana tekstur latar (kertas, felt, kayu, grain) sebagai PNG dalam public/tex.

Dibuat sekali sahaja; Remotion guna gambar ni supaya render laju
(berbanding SVG feTurbulence setiap frame).
"""
import os

import numpy as np
from PIL import Image, ImageFilter

W, H = 1080, 1920
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "tex")
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)


def smooth(cells_x, cells_y, w=W, h=H):
    """Value noise licin: grid rawak kecil dibesarkan secara bicubic."""
    small = rng.random((cells_y, cells_x)).astype(np.float32)
    img = Image.fromarray((small * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
    return np.asarray(img, dtype=np.float32) / 255.0


def fbm(octaves, w=W, h=H):
    out = np.zeros((h, w), np.float32)
    amp, total = 1.0, 0.0
    for cx, cy in octaves:
        out += amp * smooth(cx, cy, w, h)
        total += amp
        amp *= 0.5
    return out / total


def save_gray(arr, name):
    Image.fromarray(np.clip(arr * 255, 0, 255).astype(np.uint8), "L").save(os.path.join(OUT, name))


def save_rgb(arr, name):
    Image.fromarray(np.clip(arr * 255, 0, 255).astype(np.uint8), "RGB").save(os.path.join(OUT, name))


# Mottle: tompok lembut + bintik halus. Dipakai dengan mix-blend multiply.
fine = rng.random((H, W)).astype(np.float32)
mottle = 0.86 + 0.1 * fbm([(6, 10), (14, 24), (40, 70)]) + 0.06 * fine
save_gray(np.clip(mottle, 0, 1), "mottle.png")

# Felt: serat halus yang lebih kasar.
fib = np.asarray(
    Image.fromarray((rng.random((H, W)) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8)),
    np.float32,
) / 255.0
felt = 0.78 + 0.12 * fbm([(8, 14), (30, 50)]) + 0.22 * (fib - 0.5) + 0.08 * fine
save_gray(np.clip(felt, 0, 1), "felt.png")

# Kayu: papan menegak dengan ira bergelombang.
x = np.arange(W, dtype=np.float32)[None, :]
warp = fbm([(6, 2), (16, 4)]) * 4.0
rings = 0.5 + 0.5 * np.sin(x * 0.06 + warp * 3.2)
streak = smooth(140, 6)  # garis panjang menegak
v = 0.55 * rings + 0.35 * streak + 0.1 * fine
plank_w = 270
plank_id = (np.arange(W) // plank_w)[None, :]
plank_tone = (0.85 + 0.3 * rng.random(plank_id.max() + 1))[plank_id]
seam = (np.arange(W) % plank_w < 4)[None, :]
dark = np.array([0.30, 0.17, 0.08], np.float32)
light = np.array([0.62, 0.40, 0.22], np.float32)
wood = dark + (light - dark) * v[..., None]
wood = wood * plank_tone[..., None]
wood = np.where(seam[..., None], wood * 0.35, wood)
save_rgb(wood, "wood.png")

# Grain filem: 4 variasi, ditukar setiap 2 frame.
for i in range(4):
    g = 0.5 + 0.22 * rng.standard_normal((H // 2, W // 2)).astype(np.float32)
    img = Image.fromarray(np.clip(g * 255, 0, 255).astype(np.uint8), "L").resize((W, H), Image.NEAREST)
    img.save(os.path.join(OUT, f"grain{i}.png"))

print("tekstur siap:", sorted(os.listdir(OUT)))
