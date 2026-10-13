#!/usr/bin/env python3
"""
render.py — tukar fail HTML design jadi PNG / JPG / PDF.

  python render.py poster.html poster.png --size ig-post
  python render.py notis.html notis.pdf --size a4
  python render.py poster.html poster.png --size 1200x628 --scale 2

Saiz siap ada:
  ig-post 1080x1350 · ig-square 1080x1080 · story 1080x1920 · fb-post 1200x630
  fb-cover 1640x624 · a4 794x1123 (cetak) · a5 559x794 · banner 1920x1080 · wa 1080x1080

Enjin dicuba ikut turutan:
  1. Python Playwright (pip install playwright && python -m playwright install chromium)
  2. Chrome / Edge / Chromium yang dah ada dalam komputer (mod headless)
Windows 10/11 selalunya dah ada Microsoft Edge, jadi biasanya terus jalan.
"""

import argparse
import glob
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

SIZES = {
    "ig-post": (1080, 1350), "ig-square": (1080, 1080), "story": (1080, 1920),
    "fb-post": (1200, 630), "fb-cover": (1640, 624), "a4": (794, 1123), "a5": (559, 794),
    "banner": (1920, 1080), "wa": (1080, 1080), "a4-landscape": (1123, 794),
}

# PDF ikut saiz kertas sebenar; selain itu saiz piksel
PAPER = {"a4": "A4", "a5": "A5", "a4-landscape": "A4"}


def parse_size(s):
    if s in SIZES:
        return SIZES[s]
    try:
        w, h = s.lower().split("x")
        return int(w), int(h)
    except ValueError:
        sys.exit(f"Saiz tak dikenali: {s}. Guna {', '.join(SIZES)} atau LEBARxTINGGI.")


def find_browser():
    names = ["chromium", "chromium-browser", "google-chrome", "google-chrome-stable", "chrome",
             "msedge", "microsoft-edge", "microsoft-edge-stable"]
    for n in names:
        p = shutil.which(n)
        if p:
            return p
    cands = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"),
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
        "/Applications/Chromium.app/Contents/MacOS/Chromium",
    ]
    pw = os.environ.get("PLAYWRIGHT_BROWSERS_PATH", "")
    if pw:
        cands += glob.glob(os.path.join(pw, "chromium*", "chrome-linux*", "chrome"))
        cands.append(os.path.join(pw, "chromium"))
    cands += glob.glob(os.path.expanduser("~/.cache/ms-playwright/chromium*/chrome-linux*/chrome"))
    for c in cands:
        if c and os.path.isfile(c) and os.access(c, os.X_OK):
            return c
    return None


def render_playwright(html, out, w, h, scale, pdf, paper, wait_ms):
    from playwright.sync_api import sync_playwright  # type: ignore

    with sync_playwright() as p:
        kw = {}
        exe = os.environ.get("PW_CHROMIUM")
        if exe:
            kw["executable_path"] = exe
        try:
            browser = p.chromium.launch(**kw)
        except Exception:
            b = find_browser()
            if not b:
                raise
            browser = p.chromium.launch(executable_path=b)
        page = browser.new_page(viewport={"width": w, "height": h}, device_scale_factor=scale)
        page.goto(Path(html).as_uri())
        page.wait_for_load_state("networkidle")
        page.evaluate("document.fonts.ready")
        page.wait_for_timeout(wait_ms)
        if pdf:
            args = {"path": out, "print_background": True, "prefer_css_page_size": False}
            if paper:
                args["format"] = paper
                args["landscape"] = w > h
            else:
                args.update(width=f"{w}px", height=f"{h}px")
            page.emulate_media(media="screen")
            page.pdf(**args)
        else:
            opts = {"path": out, "clip": {"x": 0, "y": 0, "width": w, "height": h}}
            if out.lower().endswith((".jpg", ".jpeg")):
                opts.update(type="jpeg", quality=92)
            page.screenshot(**opts)
        browser.close()


def render_cli(browser, html, out, w, h, scale, pdf, wait_ms):
    url = Path(html).as_uri()
    with tempfile.TemporaryDirectory() as prof:
        base = [browser, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-sandbox",
                "--no-first-run", "--no-default-browser-check", f"--user-data-dir={prof}",
                f"--virtual-time-budget={max(wait_ms, 1500)}", "--run-all-compositor-stages-before-draw"]
        if pdf:
            cmd = base + ["--no-pdf-header-footer", "--print-to-pdf-no-header",
                          f"--print-to-pdf={out}", url]
        else:
            # tingkap headless kadang-kadang lebih pendek dari saiz diminta — tambah ruang, crop kemudian
            png = os.path.join(prof, "shot.png")
            cmd = base + [f"--window-size={w},{h + 400}", f"--force-device-scale-factor={scale}",
                          f"--screenshot={png}", url]
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
        target = out if pdf else png
        if not os.path.exists(target):
            sys.exit("Browser gagal render:\n" + r.stderr[-2000:])
        if not pdf:
            from PIL import Image  # type: ignore

            img = Image.open(target).crop((0, 0, int(w * scale), int(h * scale)))
            if out.lower().endswith((".jpg", ".jpeg")):
                img.convert("RGB").save(out, quality=92)
            else:
                img.save(out)


def make_temp_html(html, w, h):
    """Salin HTML ke fail sementara (folder sama, supaya gambar relatif masih jumpa)
    dan paksa saiz kanvas tepat. Template guna --u = lebar/1080."""
    with open(html, encoding="utf-8") as f:
        src = f.read()
    inject = (f"<style>:root{{--u:{w / 1080:.6f}px !important;--W:{w}px;--H:{h}px}}"
              f"html,body{{width:{w}px !important;height:{h}px !important;overflow:hidden}}</style>")
    low = src.lower()
    i = low.rfind("</head>")
    src = src[:i] + inject + src[i:] if i != -1 else inject + src
    tmp = os.path.join(os.path.dirname(html), f".render-{os.getpid()}-{os.path.basename(html)}")
    with open(tmp, "w", encoding="utf-8") as f:
        f.write(src)
    return tmp


def finish(out, final_out, n, w, h, scale, pdf):
    if n == 1:
        print(f"SIAP: {out}  ({int(w * scale)}x{int(h * scale)}{' PDF' if pdf else ''})")
        return
    from PIL import Image  # type: ignore

    img = Image.open(out)
    sh = img.height // n
    stem, ext = os.path.splitext(final_out)
    for k in range(n):
        part = img.crop((0, k * sh, img.width, (k + 1) * sh))
        p = f"{stem}-{k + 1}{ext}"
        (part.convert("RGB") if ext.lower() in (".jpg", ".jpeg") else part).save(p)
        print(f"SIAP: {p}  ({part.width}x{part.height})")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawTextHelpFormatter)
    ap.add_argument("html")
    ap.add_argument("output", help=".png / .jpg / .pdf")
    ap.add_argument("--size", default="ig-post")
    ap.add_argument("--scale", type=float, default=None,
                    help="ketajaman (default 1 untuk media sosial, 2 untuk A4/A5 supaya tajam bila cetak)")
    ap.add_argument("--wait", type=int, default=800, help="ms tunggu font/gambar dimuat")
    ap.add_argument("--slides", type=int, default=1,
                    help="carousel: HTML ada N slide bertindan menegak; output jadi N fail (-1, -2, ...)")
    ap.add_argument("--engine", choices=["auto", "playwright", "browser"], default="auto")
    a = ap.parse_args()

    html = os.path.abspath(a.html)
    if not os.path.exists(html):
        sys.exit(f"Fail tak jumpa: {html}")
    out = os.path.abspath(a.output)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    w, h = parse_size(a.size)
    pdf = out.lower().endswith(".pdf")
    n = max(1, a.slides)
    if n > 1 and pdf:
        sys.exit("--slides hanya untuk PNG/JPG.")
    final_out = out
    if n > 1:
        out = os.path.join(tempfile.mkdtemp(), "penuh.png")
        h = h * n
    paper = PAPER.get(a.size) if pdf else None
    scale = a.scale or (2 if a.size in PAPER else 1)

    src_html = html
    html = make_temp_html(src_html, w, h)
    try:
        run_engines(a, html, out, final_out, n, w, h, scale, pdf, paper)
    finally:
        os.remove(html)


def run_engines(a, html, out, final_out, n, w, h, scale, pdf, paper):
    err = None
    if a.engine in ("auto", "playwright"):
        try:
            render_playwright(html, out, w, h, scale, pdf, paper, a.wait)
            finish(out, final_out, n, w, h, scale, pdf)
            return
        except ImportError:
            err = "playwright tiada"
        except Exception as e:  # cuba enjin lain
            err = str(e)
            if a.engine == "playwright":
                sys.exit(f"Playwright gagal: {e}")
    b = find_browser()
    if not b:
        sys.exit("Tiada enjin render. Pasang salah satu:\n"
                 "  pip install playwright && python -m playwright install chromium\n"
                 "  atau pasang Google Chrome / Microsoft Edge.\n"
                 f"(butiran: {err})")
    render_cli(b, html, out, w, h, scale, pdf, a.wait)
    finish(out, final_out, n, w, h, scale, pdf)


if __name__ == "__main__":
    main()
