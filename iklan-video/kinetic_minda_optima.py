#!/usr/bin/env python3
"""
Video kinetic typography gaya "got a vision?" untuk Minda Optima.

Latar putih dengan grid titik, teks biru muncul berperingkat (naik + kabur ke jelas),
logo di penjuru kiri atas, logo besar di penutup. Keluaran: MP4 9:16 (1080x1920, 30fps) dengan bunyi
latar yang disintesis sendiri (bebas hak cipta).

  python3 kinetic_minda_optima.py                      # guna logo-minda-optima.png di sebelah skrip
  python3 kinetic_minda_optima.py --logo logo.png      # guna logo sebenar
  python3 kinetic_minda_optima.py --out nama.mp4

Tukar teks / masa dalam senarai SCENES di bawah.
"""

import argparse
import math
import os
import subprocess
import tempfile
import wave

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H, FPS = 1080, 1920, 30

# Warna diambil dari logo Minda Optima
BIRU = (10, 119, 187)       # #0A77BB  huruf "Minda"
BIRU_LEMBUT = (88, 160, 210)
MERAH = (237, 30, 43)       # #ED1E2B  huruf "Optima"
OREN = (236, 153, 33)       # #EC9921  huruf "A"
OREN_LEMBUT = (255, 216, 150)
GELAP = (20, 45, 75)
LATAR = (250, 251, 253)
TITIK = (192, 202, 220)

FONT_DIR = "/usr/share/fonts/opentype/inter"
F_BOLD = os.path.join(FONT_DIR, "InterDisplay-Bold.otf")
F_MED = os.path.join(FONT_DIR, "InterDisplay-Medium.otf")
F_XB = os.path.join(FONT_DIR, "Inter-ExtraBold.otf")


def font(path, size):
    return ImageFont.truetype(path, size)


# Setiap elemen: runs = [(teks, font, saiz, warna)] dalam satu baris.
# anim: "naik" (naik + kabur->jelas), "pop" (membesar), "sapu" (bar highlight).
SCENES = [
    {"start": 0.0, "end": 3.4, "items": [
        {"runs": [("anak ", F_MED, 120, BIRU_LEMBUT), ("lambat", F_BOLD, 120, BIRU)], "y": 860, "t": 0.25},
        {"runs": [("membaca", F_BOLD, 150, BIRU), ("?", F_BOLD, 150, MERAH)], "y": 1020, "t": 0.75},
    ]},
    {"start": 3.4, "end": 6.6, "items": [
        {"runs": [("tak perlu ", F_MED, 104, BIRU_LEMBUT), ("eja.", F_BOLD, 104, BIRU)], "y": 860, "t": 3.6},
        {"runs": [("tak perlu ", F_MED, 104, BIRU_LEMBUT), ("hafal.", F_BOLD, 104, BIRU)], "y": 1000, "t": 4.3},
    ]},
    {"start": 6.6, "end": 9.9, "items": [
        {"runs": [("guru beri giliran", F_MED, 84, BIRU_LEMBUT)], "y": 800, "t": 6.8},
        {"bar": True, "y": 985, "w": 560, "h": 150, "color": OREN_LEMBUT, "t": 7.35},
        {"runs": [("1-to-1", F_XB, 190, BIRU)], "y": 975, "t": 7.25, "anim": "pop"},
        {"runs": [("seorang demi seorang", F_MED, 64, GELAP)], "y": 1150, "t": 7.9},
    ]},
    {"start": 9.9, "end": 12.9, "items": [
        {"runs": [("Pantas Baca", F_BOLD, 112, MERAH)], "y": 830, "t": 10.1},
        {"runs": [("Bahasa Melayu", F_MED, 56, BIRU_LEMBUT)], "y": 930, "t": 10.4},
        {"runs": [("The Victoria Readers", F_BOLD, 92, BIRU)], "y": 1080, "t": 10.9},
        {"runs": [("English", F_MED, 56, BIRU_LEMBUT)], "y": 1170, "t": 11.2},
    ]},
    {"start": 12.9, "end": 16.5, "items": [
        {"logo_besar": 780, "y": 800, "t": 13.1, "anim": "pop"},
        {"runs": [("program membaca sejak 1995", F_MED, 58, GELAP)], "y": 1135, "t": 13.7},
        {"pill": "Daftar sesi penilaian", "y": 1300, "t": 14.2},
    ]},
]
DURATION = 16.5


def ease_out_cubic(x):
    return 1 - (1 - x) ** 3


def ease_out_back(x, s=1.6):
    x -= 1
    return x * x * ((s + 1) * x + s) + 1


def clamp01(x):
    return max(0.0, min(1.0, x))


def render_runs(runs, pad=40):
    """Lukis beberapa 'run' teks dalam satu baris -> imej RGBA."""
    fonts = [font(f, s) for _, f, s, _ in runs]
    widths = [ft.getlength(t) for (t, *_), ft in zip(runs, fonts)]
    asc = max(ft.getmetrics()[0] for ft in fonts)
    desc = max(ft.getmetrics()[1] for ft in fonts)
    img = Image.new("RGBA", (int(sum(widths)) + pad * 2, asc + desc + pad * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    x = pad
    for (t, _, _, c), ft, w in zip(runs, fonts, widths):
        d.text((x, pad + asc), t, font=ft, fill=c + (255,), anchor="ls")
        x += w
    return img


def render_pill(text, pad=40):
    ft = font(F_BOLD, 64)
    tw = ft.getlength(text)
    bw, bh = int(tw + 120), 140
    img = Image.new("RGBA", (bw + pad * 2, bh + pad * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((pad, pad + 10, pad + bw, pad + bh + 10), radius=bh // 2, fill=(120, 10, 20, 50))
    d.rounded_rectangle((pad, pad, pad + bw, pad + bh), radius=bh // 2, fill=MERAH + (255,))
    d.text((pad + bw / 2, pad + bh / 2), text, font=ft, fill=(255, 255, 255, 255), anchor="mm")
    return img


def make_background():
    """Grid titik + vignette putih di tepi, sedikit lebih besar untuk gerakan pan."""
    bw, bh = W + 120, H + 120
    bg = Image.new("RGB", (bw, bh), LATAR)
    d = ImageDraw.Draw(bg)
    step = 54
    for y in range(0, bh, step):
        for x in range(0, bw, step):
            d.ellipse((x - 3, y - 3, x + 3, y + 3), fill=TITIK)
    # garisan grid halus setiap 4 titik
    for y in range(0, bh, step * 4):
        d.line((0, y, bw, y), fill=(236, 240, 247), width=2)
    for x in range(0, bw, step * 4):
        d.line((x, 0, x, bh), fill=(236, 240, 247), width=2)
    # vignette: tengah nampak grid, tepi pudar ke putih
    yy, xx = np.mgrid[0:bh, 0:bw]
    r = np.sqrt(((xx - bw / 2) / (bw * 0.55)) ** 2 + ((yy - bh / 2) / (bh * 0.42)) ** 2)
    m = np.clip((r - 0.55) / 0.6, 0, 1)[..., None]
    arr = np.asarray(bg).astype(np.float32)
    arr = arr * (1 - m) + np.array(LATAR, np.float32) * m
    return Image.fromarray(arr.astype(np.uint8))


def make_text_logo():
    ft1, ft2 = font(F_XB, 46), font(F_MED, 22)
    img = Image.new("RGBA", (420, 110), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((0, 8, 70, 78), radius=18, fill=BIRU + (255,))
    d.text((35, 43), "M", font=font(F_XB, 44), fill=(255, 255, 255, 255), anchor="mm")
    d.rounded_rectangle((52, 60, 76, 84), radius=8, fill=OREN + (255,))
    d.text((92, 46), "Minda Optima", font=ft1, fill=GELAP + (255,), anchor="lm")
    d.text((94, 86), "PROGRAM MEMBACA", font=ft2, fill=BIRU_LEMBUT + (255,), anchor="lm")
    return img


def load_logo(path, width):
    lg = Image.open(path).convert("RGBA")
    lg = lg.crop(lg.getchannel("A").getbbox())
    return lg.resize((width, int(lg.height * width / lg.width)), Image.LANCZOS)


def build_items(logo_path):
    items = []
    for sc in SCENES:
        for it in sc["items"]:
            e = dict(it, end=sc["end"])
            if it.get("bar"):
                e["img"] = None
            elif it.get("logo_besar"):
                e["img"] = load_logo(logo_path, it["logo_besar"]) if logo_path else render_runs(
                    [("Minda ", F_MED, 132, BIRU), ("Optima", F_XB, 132, MERAH)])
            elif it.get("pill"):
                e["img"] = render_pill(it["pill"])
                e.setdefault("anim", "pop")
            else:
                e["img"] = render_runs(it["runs"])
            e.setdefault("anim", "naik")
            items.append(e)
    return items


def draw_frame(t, bg, logo, items):
    # pan perlahan pada latar supaya tak kaku
    ox = int(60 + 40 * math.sin(t * 0.35))
    oy = int(60 + 50 * math.cos(t * 0.27))
    frame = bg.crop((ox, oy, ox + W, oy + H)).convert("RGBA")

    for e in items:
        if t < e["t"] or t > e["end"]:
            continue
        p = clamp01((t - e["t"]) / 0.6)
        out = clamp01((e["end"] - t) / 0.35)  # keluar: pudar + naik sedikit
        alpha = min(ease_out_cubic(p), out)
        if alpha <= 0.01:
            continue
        dy_out = (1 - out) * -40

        if e.get("bar"):
            wp = ease_out_cubic(clamp01((t - e["t"]) / 0.45))
            bw = int(e["w"] * wp)
            if bw < 2:
                continue
            layer = Image.new("RGBA", (bw, e["h"]), e["color"] + (int(255 * alpha),))
            frame.alpha_composite(layer, (W // 2 - e["w"] // 2, int(e["y"] - e["h"] / 2 + dy_out)))
            continue

        img = e["img"]
        if e["anim"] == "pop":
            s = 0.8 + 0.2 * ease_out_back(clamp01((t - e["t"]) / 0.55))
            if abs(s - 1) > 0.002:
                img = img.resize((max(1, int(img.width * s)), max(1, int(img.height * s))), Image.BICUBIC)
            dy = 0
            blur = 0
        else:
            dy = (1 - ease_out_cubic(p)) * 70
            blur = (1 - ease_out_cubic(clamp01((t - e["t"]) / 0.45))) * 14
        if blur > 0.5:
            img = img.filter(ImageFilter.GaussianBlur(blur))
        if alpha < 0.999:
            a = img.getchannel("A").point(lambda v: int(v * alpha))
            img = img.copy()
            img.putalpha(a)
        x = W // 2 - img.width // 2
        y = int(e["y"] - img.height / 2 + dy + dy_out)
        frame.alpha_composite(img, (x, y))

    # logo kiri atas: muncul awal, hilang bila logo besar keluar di scene akhir
    la = min(ease_out_cubic(clamp01(t / 0.6)), clamp01((SCENES[-1]["start"] - t) / 0.35))
    if la <= 0.01:
        return frame.convert("RGB")
    lg = logo
    if la < 0.999:
        lg = logo.copy()
        lg.putalpha(logo.getchannel("A").point(lambda v: int(v * la)))
    frame.alpha_composite(lg, (56, 70))
    return frame.convert("RGB")


def synth_audio(path, sr=44100):
    """Pad lembut + bunyi 'whoosh' & 'pop' pada setiap teks masuk. Bebas hak cipta."""
    n = int(DURATION * sr)
    t = np.arange(n) / sr
    audio = np.zeros(n, np.float32)
    # pad akord (Cmaj9) dengan tremolo perlahan
    for f, a in [(130.81, 0.05), (196.0, 0.04), (246.94, 0.03), (293.66, 0.03), (329.63, 0.025)]:
        audio += a * np.sin(2 * np.pi * f * t) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.2 * t + f))
    env = np.minimum(1, t / 1.5) * np.minimum(1, (DURATION - t) / 1.2)
    audio *= env
    rng = np.random.default_rng(7)
    for sc in SCENES:
        # whoosh: hingar ditapis, naik-turun 0.4s sebelum scene
        st = int(max(0, sc["start"] - 0.05) * sr)
        ln = int(0.45 * sr)
        if st + ln < n:
            nz = rng.standard_normal(ln).astype(np.float32)
            nz = np.convolve(nz, np.ones(40) / 40, mode="same")
            e = np.sin(np.linspace(0, np.pi, ln)) ** 2
            audio[st:st + ln] += 0.35 * nz * e
        for it in sc["items"]:
            st = int(it["t"] * sr)
            ln = int(0.12 * sr)
            if st + ln < n:
                tt = np.arange(ln) / sr
                audio[st:st + ln] += 0.18 * np.sin(2 * np.pi * (880 - 2500 * tt) * tt) * np.exp(-tt * 40)
    audio = audio / max(1e-6, np.abs(audio).max()) * 0.6
    pcm = (audio * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(pcm.tobytes())


def main():
    ap = argparse.ArgumentParser()
    here = os.path.dirname(os.path.abspath(__file__))
    default_logo = os.path.join(here, "logo-minda-optima.png")
    ap.add_argument("--logo", default=default_logo if os.path.exists(default_logo) else None,
                    help="PNG logo (latar lutsinar). Tiada fail = logo teks sementara")
    ap.add_argument("--out", default=os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                                  "minda-optima_kinetic_reels.mp4"))
    args = ap.parse_args()

    bg = make_background()
    logo = load_logo(args.logo, 300) if args.logo else make_text_logo()
    items = build_items(args.logo)

    with tempfile.TemporaryDirectory() as tmp:
        wav = os.path.join(tmp, "audio.wav")
        synth_audio(wav)
        cmd = ["ffmpeg", "-y", "-loglevel", "error",
               "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
               "-i", wav,
               "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
               "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", args.out]
        proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
        for i in range(int(DURATION * FPS)):
            proc.stdin.write(draw_frame(i / FPS, bg, logo, items).tobytes())
        proc.stdin.close()
        if proc.wait() != 0:
            raise SystemExit("ffmpeg gagal")
    print("Siap:", args.out)


if __name__ == "__main__":
    main()
