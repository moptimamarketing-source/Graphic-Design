"""Motion graphic 'Eja B-A BA tapi tak jadi' — Minda Optima. 1080x1920, 30fps.

Usage: python3 render.py <assets_dir> <fonts_dir> <out_dir> [--preview t1,t2,...]
"""
import math, os, subprocess, sys
from functools import lru_cache
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ASSETS, FONTS, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
PREVIEW = None
if "--preview" in sys.argv:
    PREVIEW = [float(x) for x in sys.argv[sys.argv.index("--preview") + 1].split(",")]

W, H, FPS = 1080, 1920, 30
DUR = 18.6

# ---------- brand palette (from logo) ----------
CREAM = (255, 248, 236)
INK = (38, 50, 72)
BLUE = (30, 112, 196)
SKY = (45, 180, 232)
ORANGE = (243, 150, 30)
RED = (229, 57, 53)
GREEN = (108, 192, 74)
WHITE = (255, 255, 255)
GREY = (140, 140, 150)

F_CARD = f"{FONTS}/x_fontsource-fredoka-5.3.0/files/fredoka-latin-700-normal.woff"
F_HEAD = f"{FONTS}/x_fontsource-baloo-2-5.3.0/files/baloo-2-latin-800-normal.woff"
F_BODY = f"{FONTS}/x_fontsource-baloo-2-5.3.0/files/baloo-2-latin-700-normal.woff"
F_EMOJI = "/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf"

# ---------- timeline (seconds) ----------
T_HOOK = 0.0
T_PANEL = 1.9
T_B, T_A, T_BA = 2.1, 2.45, 2.85
T_T, T_U, T_TU = 3.4, 3.75, 4.15
T_MAK1 = 5.1                      # 01_mak_tanya starts
CAP1 = [(T_MAK1 + 0.10, "Okay sayang…"), (T_MAK1 + 1.31, "sambung."), (T_MAK1 + 2.44, "Jadi apa?")]
T_Q = T_MAK1 + 2.44
T_THINK = 8.55
T_BAAA, T_TUUU = 8.75, 9.6
T_BOLA = 10.8
T_MELT = 12.35
T_MAK2 = 12.9                     # 02_mak_keluh starts
CAP2 = [(T_MAK2 + 0.11, "Haaaih…"), (T_MAK2 + 1.79, "Ya Allah…")]
T_END = 15.6


# ---------- helpers ----------
def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))

def prog(t, t0, d):
    return clamp((t - t0) / d)

def ease_out_cubic(p):
    return 1 - (1 - p) ** 3

def ease_in_out(p):
    return 3 * p * p - 2 * p * p * p

def ease_out_back(p, s=1.9):
    p -= 1
    return p * p * ((s + 1) * p + s) + 1

def pop(t, t0, d=0.38):
    return 0.0 if t < t0 else ease_out_back(prog(t, t0, d))

def fade(t, t_in, t_out=None, d=0.25):
    a = prog(t, t_in, d)
    if t_out is not None:
        a = min(a, 1 - prog(t, t_out, d))
    return a

def lerp(a, b, p):
    return a + (b - a) * p

@lru_cache(None)
def font(path, size):
    return ImageFont.truetype(path, size)

@lru_cache(None)
def emoji(ch, size):
    f = ImageFont.truetype(F_EMOJI, 109)
    im = Image.new("RGBA", (160, 160), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((8, 8), ch, font=f, embedded_color=True)
    im = im.crop(im.getbbox())
    r = size / max(im.size)
    return im.resize((max(1, round(im.width * r)), max(1, round(im.height * r))), Image.LANCZOS)

def shadowed(im, off=(0, 14), blur=18, alpha=70):
    """Return image with soft drop shadow, padded."""
    pad = blur * 2 + max(abs(off[0]), abs(off[1]))
    out = Image.new("RGBA", (im.width + pad * 2, im.height + pad * 2), (0, 0, 0, 0))
    sh = Image.new("RGBA", im.size, (0, 0, 0, 0))
    sh.putalpha(im.getchannel("A").point(lambda a: a * alpha // 255))
    out.alpha_composite(sh, (pad + off[0], pad + off[1]))
    out = out.filter(ImageFilter.GaussianBlur(blur))
    out.alpha_composite(im, (pad, pad))
    return out

@lru_cache(None)
def text_img(txt, path, size, color, stroke=0, stroke_color=WHITE):
    f = font(path, size)
    l, t, r, b = f.getbbox(txt, stroke_width=stroke)
    im = Image.new("RGBA", (r - l + 4, b - t + 4), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((-l + 2, -t + 2), txt, font=f, fill=color,
                            stroke_width=stroke, stroke_fill=stroke_color)
    return im

def row(*parts, gap=14):
    """Compose images horizontally, vertically centred."""
    w = sum(p.width for p in parts) + gap * (len(parts) - 1)
    h = max(p.height for p in parts)
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    x = 0
    for p in parts:
        im.alpha_composite(p, (x, (h - p.height) // 2))
        x += p.width + gap
    return im

def place(frame, im, cx, cy, scale=1.0, rot=0.0, alpha=1.0, sx=1.0, sy=1.0):
    if scale <= 0.01 or alpha <= 0.01:
        return
    w, h = max(1, round(im.width * scale * sx)), max(1, round(im.height * scale * sy))
    m = im if (w, h) == im.size else im.resize((w, h), Image.BICUBIC)
    if rot:
        m = m.rotate(rot, resample=Image.BICUBIC, expand=True)
    if alpha < 1:
        m = m.copy()
        m.putalpha(m.getchannel("A").point(lambda a: int(a * alpha)))
    frame.alpha_composite(m, (round(cx - m.width / 2), round(cy - m.height / 2)))


# ---------- pre-built elements ----------
@lru_cache(None)
def letter_card(ch, color, w=170, h=200):
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, w - 1, h - 1), 36, fill=color)
    d.rounded_rectangle((0, h - 22, w - 1, h - 1), 20, fill=tuple(int(c * 0.8) for c in color))
    d.rounded_rectangle((0, 0, w - 1, h - 16), 36, fill=color)
    t = text_img(ch, F_CARD, 140, WHITE)
    im.alpha_composite(t, ((w - t.width) // 2, (h - 16 - t.height) // 2))
    return shadowed(im, off=(0, 10), blur=12, alpha=60)

@lru_cache(None)
def syl_card(txt, color):
    return letter_card(txt, color, w=230, h=220)

@lru_cache(None)
def arrow():
    im = Image.new("RGBA", (90, 60), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 22, 60, 38), 8, fill=GREY)
    d.polygon([(52, 6), (88, 30), (52, 54)], fill=GREY)
    return im

@lru_cache(None)
def panel():
    w, h = 900, 690
    im = Image.new("RGBA", (w, h + 70), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 70, w - 1, h + 69), 56, fill=WHITE)
    d.polygon([(70, 90), (110, 0), (190, 90)], fill=WHITE)  # tail up to child avatar
    return shadowed(im, off=(0, 16), blur=22, alpha=45)

@lru_cache(None)
def avatar(ch, ring, label, label_color):
    r = 92
    im = Image.new("RGBA", (r * 2 + 20, r * 2 + 90), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.ellipse((10, 0, 10 + r * 2, r * 2), fill=ring)
    d.ellipse((22, 12, r * 2 - 2, r * 2 - 12), fill=WHITE)
    e = emoji(ch, 130)
    im.alpha_composite(e, (10 + r - e.width // 2, r - e.height // 2 + 4))
    lab = text_img(label, F_HEAD, 46, WHITE)
    pw = lab.width + 40
    x0 = (im.width - pw) // 2
    d.rounded_rectangle((x0, r * 2 - 14, x0 + pw, r * 2 + 58), 30, fill=label_color)
    im.alpha_composite(lab, (x0 + 20, r * 2 - 14 + (72 - lab.height) // 2))
    return shadowed(im, off=(0, 8), blur=10, alpha=50)

def wrap(txt, f, maxw):
    words, lines, cur = txt.split(" "), [], ""
    for w_ in words:
        test = (cur + " " + w_).strip()
        if f.getlength(test) <= maxw or not cur:
            cur = test
        else:
            lines.append(cur)
            cur = w_
    lines.append(cur)
    return lines

@lru_cache(None)
def mak_bubble(txt):
    f = font(F_BODY, 58)
    lines = wrap(txt, f, 560)
    lh = 72
    w, h = 640, 60 + lh * len(lines)
    im = Image.new("RGBA", (w + 40, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((40, 0, w + 39, h - 1), 44, fill=WHITE, outline=(255, 214, 160), width=6)
    d.polygon([(0, h // 2), (52, h // 2 - 26), (52, h // 2 + 26)], fill=(255, 214, 160))
    d.polygon([(12, h // 2), (52, h // 2 - 18), (52, h // 2 + 18)], fill=WHITE)
    for i, ln in enumerate(lines):
        d.text((76, 22 + i * lh), ln, font=f, fill=INK)
    return shadowed(im, off=(0, 10), blur=14, alpha=45)

@lru_cache(None)
def ball(size=330):
    s = size * 2
    im = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    cols = [RED, WHITE, BLUE, WHITE, ORANGE, WHITE, GREEN, WHITE]
    for i, c in enumerate(cols):
        d.pieslice((0, 0, s - 1, s - 1), i * 45 - 90, (i + 1) * 45 - 90, fill=c)
    d.ellipse((s * 0.42, s * 0.42, s * 0.58, s * 0.58), fill=WHITE)
    ring = Image.new("L", (s, s), 0)
    ImageDraw.Draw(ring).ellipse((0, 0, s - 1, s - 1), outline=255, width=int(s * 0.03))
    im.paste((60, 60, 80, 255), mask=ring)
    hl = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    ImageDraw.Draw(hl).ellipse((s * 0.18, s * 0.12, s * 0.45, s * 0.33), fill=(255, 255, 255, 120))
    im.alpha_composite(hl.filter(ImageFilter.GaussianBlur(s * 0.02)))
    return im.resize((size, size), Image.LANCZOS)

@lru_cache(None)
def burst(r=330, n=14, color=(255, 214, 64)):
    s = r * 2
    im = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    pts = []
    for i in range(n * 2):
        rr = r if i % 2 == 0 else r * 0.62
        a = math.pi * i / n
        pts.append((r + rr * math.cos(a), r + rr * math.sin(a)))
    ImageDraw.Draw(im).polygon(pts, fill=color)
    return im

@lru_cache(None)
def pill(txt, bg, fg=WHITE, size=56, padx=40, pady=18):
    t = text_img(txt, F_HEAD, size, fg)
    im = Image.new("RGBA", (t.width + padx * 2, t.height + pady * 2), (0, 0, 0, 0))
    ImageDraw.Draw(im).rounded_rectangle((0, 0, im.width - 1, im.height - 1), im.height // 2, fill=bg)
    im.alpha_composite(t, (padx, pady))
    return shadowed(im, off=(0, 8), blur=10, alpha=50)

@lru_cache(None)
def logo(width=600):
    im = Image.open(f"{ASSETS}/logo.png").convert("RGBA")
    im = im.crop(im.getbbox())
    r = width / im.width
    return im.resize((width, round(im.height * r)), Image.LANCZOS)

# background: faint drifting letters
BG_LETTERS = [("B", 120, 300, 110, BLUE), ("A", 900, 210, 130, ORANGE), ("T", 980, 760, 100, RED),
              ("U", 70, 980, 120, GREEN), ("A", 160, 1600, 110, SKY), ("B", 930, 1450, 120, ORANGE),
              ("T", 520, 1760, 100, BLUE), ("U", 610, 120, 90, RED), ("O", 860, 1080, 90, SKY),
              ("L", 300, 1300, 90, ORANGE)]

@lru_cache(None)
def bg_letter(ch, size, color):
    t = text_img(ch, F_CARD, size, color)
    t.putalpha(t.getchannel("A").point(lambda a: a * 34 // 255))
    return t

@lru_cache(None)
def dots_bg():
    im = Image.new("RGBA", (W, H), CREAM + (255,))
    d = ImageDraw.Draw(im)
    for y in range(40, H, 80):
        for x in range(40 + (y // 80 % 2) * 40, W, 80):
            d.ellipse((x - 3, y - 3, x + 3, y + 3), fill=(245, 228, 205))
    return im


# ---------- frame ----------
def render(t):
    fr = dots_bg().copy()
    for i, (ch, x, y, s, c) in enumerate(BG_LETTERS):
        place(fr, bg_letter(ch, s, c), x, y + math.sin(t * 0.9 + i) * 14, rot=math.sin(t * 0.6 + i * 2) * 8)

    # --- scene 1: hook ---
    if t < T_PANEL + 0.2:
        a = 1 - prog(t, T_PANEL - 0.2, 0.3)
        place(fr, text_img("Bila anak eja", F_HEAD, 96, INK), 540, 700, pop(t, 0.05), alpha=a)
        place(fr, text_img("“B-A BA”…", F_HEAD, 170, ORANGE, stroke=10, stroke_color=WHITE),
              540, 880, pop(t, 0.35), rot=math.sin(t * 6) * 2, alpha=a)
        line3 = row(text_img("tapi tak jadi perkataan", F_HEAD, 78, BLUE), emoji("😂", 92))
        place(fr, line3, 540, 1060, pop(t, 0.7), alpha=a)

    # --- child panel + cards (scenes 2–4) ---
    if T_PANEL <= t < T_MELT + 0.3:
        a = 1 - prog(t, T_MELT - 0.1, 0.3)
        ps = pop(t, T_PANEL, 0.4)
        place(fr, panel(), 540, 870, ps, alpha=a)
        place(fr, avatar("👦", SKY, "Anak", BLUE), 175, 390, pop(t, T_PANEL + 0.05), alpha=a)

        # spelling rows — single letters leave when mak speaks
        out = prog(t, T_MAK1 + 0.1, 0.35)
        la = a * (1 - out)
        for (ch, col, tt, x, y) in [("B", BLUE, T_B, 215, 700), ("A", ORANGE, T_A, 405, 700),
                                    ("T", RED, T_T, 215, 960), ("U", GREEN, T_U, 405, 960)]:
            place(fr, letter_card(ch, col), x, y - out * 60, pop(t, tt) * (1 - out * 0.4), alpha=la)
        place(fr, arrow(), 545, 700, pop(t, T_BA - 0.12, 0.25), alpha=la)
        place(fr, arrow(), 545, 960, pop(t, T_TU - 0.12, 0.25), alpha=la)

        # syllable cards: small at right, then move to centre
        mv = ease_out_cubic(prog(t, T_MAK1 + 0.2, 0.6))
        join = ease_out_cubic(prog(t, T_Q, 0.4))
        wob = math.sin((t - T_THINK) * 7) * 6 if T_THINK <= t < T_BOLA else 0
        spin = ease_in_out(prog(t, T_BOLA, 0.45))
        cs = lerp(0.8, 1.0, mv) * (1 - spin)
        bx, by = lerp(745, lerp(395, 430, join), mv), lerp(700, 860, mv)
        tx, ty = lerp(745, lerp(665, 630, join), mv), lerp(960, 860, mv)
        if t < T_BOLA + 0.5:
            place(fr, syl_card("BA", ORANGE), lerp(bx, 540, spin), by, pop(t, T_BA) * cs,
                  rot=wob + spin * 540, alpha=a)
            place(fr, syl_card("TU", BLUE), lerp(tx, 540, spin), ty, pop(t, T_TU) * cs,
                  rot=-wob + spin * 540, alpha=a)

        # "?" then 🤔
        if T_Q <= t < T_THINK + 0.2:
            qa = 1 - prog(t, T_THINK, 0.2)
            place(fr, text_img("?", F_HEAD, 220, RED, stroke=10), 540, 640, pop(t, T_Q),
                  rot=math.sin(t * 5) * 10, alpha=a * qa)
        if T_THINK <= t < T_BOLA:
            place(fr, emoji("🤔", 170), 540, 650, pop(t, T_THINK), rot=math.sin(t * 4) * 8, alpha=a)
            ta = a * (1 - prog(t, T_BOLA - 0.1, 0.15))
            place(fr, text_img("Baaa…", F_HEAD, 92, ORANGE), 395, 1075, pop(t, T_BAAA),
                  rot=math.sin(t * 6) * 3, alpha=ta)
            place(fr, text_img("tuuu…", F_HEAD, 92, BLUE), 670, 1075, pop(t, T_TUUU),
                  rot=-math.sin(t * 6) * 3, alpha=ta)

        # BOLA!
        if t >= T_BOLA:
            bs = pop(t, T_BOLA, 0.35)
            place(fr, burst(), 540, 580, bs * 0.85, rot=t * 40, alpha=a)
            place(fr, text_img("BOLA!", F_HEAD, 190, RED, stroke=12), 540, 590, bs,
                  rot=math.sin(t * 9) * 4, alpha=a)
            # ball grows from the cards, then bounces away to the right
            g = ease_out_back(prog(t, T_BOLA + 0.25, 0.35))
            k = prog(t, T_BOLA + 0.65, 0.9)
            x = lerp(540, 1300, k)
            y = 990 - abs(math.sin(k * math.pi * 2.2)) * 150 * (1 - k * 0.4)
            place(fr, ball(270), x, y, g if k == 0 else 1.0, rot=-(t - T_BOLA) * 400, alpha=a)

    # --- mak bubbles ---
    def mak_say(caps, t_in, t_out):
        if not (t_in <= t < t_out + 0.3):
            return
        a = fade(t, t_in, t_out)
        shown = " ".join(c for (tc, c) in caps if t >= tc)
        place(fr, avatar("👩", ORANGE, "Mak", ORANGE), 175, 1335, pop(t, t_in), alpha=a)
        if shown:
            last = max(tc for (tc, c) in caps if t >= tc)
            bump = 1 + 0.04 * (1 - prog(t, last, 0.2))
            b = mak_bubble(shown)
            place(fr, b, 300 + b.width / 2 - 30, 1310, bump * pop(t, caps[0][0], 0.3), alpha=a)

    mak_say(CAP1, T_MAK1, T_THINK + 0.6)
    mak_say(CAP2, T_MAK2 - 0.2, T_END - 0.2)

    # --- scene 5: mak ayah melt ---
    if T_MELT <= t < T_END + 0.2:
        a = 1 - prog(t, T_END - 0.15, 0.3)
        place(fr, text_img("Mak ayah:", F_HEAD, 110, INK), 540, 470, pop(t, T_MELT), alpha=a)
        m = prog(t, T_MELT + 0.4, 2.6)
        place(fr, emoji("🫠", 400), 540, 850 + m * 40, pop(t, T_MELT + 0.15, 0.45),
              sx=1 + m * 0.08, sy=1 - m * 0.1, alpha=a)
        for i, tk in enumerate([T_MELT + 0.3, T_MELT + 1.2]):
            ka = fade(t, tk, tk + 0.9, 0.2) * a
            place(fr, text_img("krik… krik…", F_BODY, 52, GREY), 250 + i * 560, 1090 - i * 30 - (t - tk) * 30,
                  alpha=ka, rot=6 - i * 12)

    # --- scene 6: end card ---
    if t >= T_END:
        place(fr, burst(560, 18, (255, 236, 196)), 540, 640, pop(t, T_END, 0.5), rot=t * 12)
        place(fr, logo(640), 540, 620, pop(t, T_END + 0.05, 0.45))
        l1 = row(text_img("Siapa pernah?", F_HEAD, 112, BLUE), emoji("😂", 110))
        place(fr, l1, 540, 1010, pop(t, T_END + 0.35))
        l2 = row(text_img("Komen", F_HEAD, 70, INK), emoji("🙋", 78), text_img("di bawah!", F_HEAD, 70, INK))
        place(fr, l2, 540, 1140, pop(t, T_END + 0.6))
        place(fr, pill("Tanpa eja. Terus baca.", ORANGE), 540, 1300, pop(t, T_END + 0.9),
              rot=math.sin(t * 3) * 1.5)
    return fr.convert("RGB")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    if PREVIEW:
        for t in PREVIEW:
            render(t).save(f"{OUT}/prev_{t:05.2f}.jpg", quality=85)
        sys.exit()
    n = int(DUR * FPS)
    p = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
                          "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "medium",
                          "-crf", "18", "-pix_fmt", "yuv420p", f"{OUT}/video_noaudio.mp4"], stdin=subprocess.PIPE)
    for i in range(n):
        p.stdin.write(render(i / FPS).tobytes())
    p.stdin.close()
    p.wait()
    print("frames:", n)
