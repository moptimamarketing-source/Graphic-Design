#!/usr/bin/env python3
"""
brand_colors.py — alat warna untuk design.

  # ambil palet warna dari logo (keluarkan blok CSS siap tampal ke template)
  python brand_colors.py palet logo.png
  # semak kontras teks atas latar (standard WCAG — senang dibaca atau tidak)
  python brand_colors.py kontras "#FFFFFF" "#1D4ED8"
  # buat logo versi putih (untuk latar gelap)
  python brand_colors.py logo-putih logo.png logo-putih.png

Perlukan Pillow (pip install pillow).
"""

import argparse
import colorsys
import sys


def need_pil():
    try:
        from PIL import Image  # noqa: F401
    except ImportError:
        sys.exit("Pillow belum dipasang: pip install pillow")


def hex_to_rgb(h):
    h = h.strip().lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    if len(h) != 6:
        sys.exit(f"Warna tak sah: {h}")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def rgb_to_hex(rgb):
    return "#{:02X}{:02X}{:02X}".format(*[max(0, min(255, int(round(c)))) for c in rgb])


def lum(rgb):
    def ch(c):
        c = c / 255
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (ch(c) for c in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a, b):
    la, lb = sorted([lum(a), lum(b)], reverse=True)
    return (la + 0.05) / (lb + 0.05)


def shade(rgb, factor):
    """factor < 1 gelapkan, > 1 cerahkan (dalam ruang HLS)."""
    h, l, s = colorsys.rgb_to_hls(*[c / 255 for c in rgb])
    l = max(0, min(1, l * factor if factor < 1 else l + (1 - l) * (factor - 1)))
    return tuple(c * 255 for c in colorsys.hls_to_rgb(h, l, s))


def cmd_palet(a):
    need_pil()
    from PIL import Image

    img = Image.open(a.logo).convert("RGBA")
    img.thumbnail((300, 300))
    data = img.get_flattened_data() if hasattr(img, "get_flattened_data") else img.getdata()
    px = [p[:3] for p in data if p[3] > 200]
    # buang hampir putih / hampir hitam / kelabu — itu bukan warna brand
    keep = []
    for r, g, b in px:
        h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
        if 0.12 < l < 0.92 and s > 0.25:
            keep.append((r, g, b))
    if not keep:
        print("Logo ni tiada warna kuat (hitam/putih/kelabu sahaja). Tanya pengguna warna brand.")
        return
    q = Image.new("RGB", (len(keep), 1))
    q.putdata(keep)
    pal = q.quantize(colors=min(a.n, len(set(keep))), method=Image.Quantize.MEDIANCUT)
    counts = sorted(pal.getcolors(), reverse=True)
    palette = pal.getpalette()
    cols = []
    for c, i in counts:  # gabung warna yang hampir sama
        rgb = tuple(palette[i * 3:i * 3 + 3])
        near = next((k for k, (_, x) in enumerate(cols) if sum(abs(p - q) for p, q in zip(rgb, x)) < 40), None)
        if near is None:
            cols.append((c, rgb))
        else:
            cols[near] = (cols[near][0] + c, cols[near][1])
    total = sum(c for c, _ in cols)
    print("Warna utama dalam logo (paling banyak dahulu):")
    for c, rgb in cols:
        w = contrast(rgb, (255, 255, 255))
        k = contrast(rgb, (15, 23, 42))
        teks = "putih" if w >= k else "gelap"
        print(f"  {rgb_to_hex(rgb)}  {100 * c / total:4.0f}%   teks atasnya: {teks} (kontras {max(w, k):.1f})")
    brand = cols[0][1]
    accent = cols[1][1] if len(cols) > 1 else shade(brand, 1.6)
    print("\nBlok CSS cadangan (tampal dalam :root template):")
    print(f"    --brand: {rgb_to_hex(brand)};")
    print(f"    --brand-dark: {rgb_to_hex(shade(brand, 0.62))};")
    print(f"    --accent: {rgb_to_hex(accent)};")
    print(f"    --soft: {rgb_to_hex(shade(brand, 1.9))};")
    print("\nIni anggaran dari piksel logo. Kalau ada kod warna rasmi brand, guna yang rasmi.")


def cmd_kontras(a):
    t, b = hex_to_rgb(a.teks), hex_to_rgb(a.latar)
    r = contrast(t, b)
    if r >= 7:
        v = "SANGAT BAIK — senang dibaca, walaupun tulisan kecil"
    elif r >= 4.5:
        v = "BAIK — sesuai untuk teks biasa"
    elif r >= 3:
        v = "CUKUP untuk tajuk besar sahaja — jangan guna untuk teks kecil"
    else:
        v = "LEMAH — susah dibaca, tukar warna"
    print(f"Kontras {a.teks} atas {a.latar}: {r:.2f}:1 → {v}")


def cmd_logo_putih(a):
    need_pil()
    from PIL import Image

    img = Image.open(a.logo).convert("RGBA")
    alpha = img.getchannel("A")
    if alpha.getextrema() == (255, 255):
        # tiada lutsinar: anggap latar putih, jadikan lutsinar
        gray = img.convert("L")
        alpha = gray.point(lambda v: 0 if v > 235 else 255)
        print("Logo tiada latar lutsinar — latar putih dibuang secara automatik. Semak hasilnya.")
    white = Image.new("RGBA", img.size, (255, 255, 255, 255))
    white.putalpha(alpha)
    white.save(a.output)
    print(f"SIAP: {a.output}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawTextHelpFormatter)
    sp = ap.add_subparsers(dest="cmd", required=True)
    p = sp.add_parser("palet")
    p.add_argument("logo")
    p.add_argument("--n", type=int, default=5)
    p.set_defaults(fn=cmd_palet)
    p = sp.add_parser("kontras")
    p.add_argument("teks")
    p.add_argument("latar")
    p.set_defaults(fn=cmd_kontras)
    p = sp.add_parser("logo-putih")
    p.add_argument("logo")
    p.add_argument("output")
    p.set_defaults(fn=cmd_logo_putih)
    a = ap.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()
