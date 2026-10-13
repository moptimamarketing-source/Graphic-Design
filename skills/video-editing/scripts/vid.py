#!/usr/bin/env python3
"""
vid.py — alat edit video untuk skill video-editing Minda Optima.

Satu fail, Python standard library sahaja. Semua kerja berat dibuat oleh ffmpeg.
Fail asal TIDAK pernah ditimpa — setiap arahan tulis ke fail output baru.

Arahan (jalankan `python vid.py <arahan> -h` untuk butiran):
  check          Semak ffmpeg ada atau tidak
  info           Maklumat video (saiz, durasi, fps, ada audio?)
  sheet          Contact sheet: satu gambar grid frame, untuk "tengok" video
  thumbnail      Ambil satu frame jadi gambar (JPG/PNG)
  trim           Potong ikut masa mula/tamat
  resize         Tukar nisbah (9:16, 1:1, 4:5, 16:9) — blur / crop / pad
  join           Sambung beberapa klip jadi satu
  jumpcut        Buang bahagian senyap (talking head jadi laju & padat)
  speed          Laju/perlahan
  subtitle       Bakar subtitle dari fail .srt (gaya reels / bawah / kotak)
  srt-from-text  Jana .srt dari skrip teks (bila tiada transkripsi)
  text           Letak teks hook / tajuk pada masa tertentu
  logo           Letak logo / watermark
  music          Tambah muzik latar (auto perlahan bila ada suara)
  audio-clean    Bersihkan bunyi suara (buang noise, ratakan volume)
  endcard        Tambah gambar penutup (CTA) di hujung video
  export         Export ikut platform (tiktok, reels, shorts, whatsapp, youtube, feed)
"""

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

# ---------------------------------------------------------------------------
# ffmpeg
# ---------------------------------------------------------------------------

INSTALL_HELP = """\
ffmpeg tidak dijumpai. Pasang salah satu:
  Windows : winget install ffmpeg        (kemudian tutup & buka semula terminal)
  Mac     : brew install ffmpeg
  Linux   : sudo apt install ffmpeg
  Mana-mana (tanpa admin): pip install imageio-ffmpeg
"""


def find_ffmpeg():
    exe = shutil.which("ffmpeg")
    if exe:
        return exe
    try:
        import imageio_ffmpeg  # type: ignore

        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return None


FFMPEG = find_ffmpeg()


def need_ffmpeg():
    if not FFMPEG:
        sys.exit(INSTALL_HELP)


def run(args, cwd=None, quiet=True):
    """Jalankan ffmpeg. Keluar dengan mesej jelas kalau gagal."""
    need_ffmpeg()
    cmd = [FFMPEG, "-hide_banner", "-y"] + [str(a) for a in args]
    if quiet:
        cmd[3:3] = ["-loglevel", "error"]
    proc = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True,
                          encoding="utf-8", errors="replace")
    if proc.returncode != 0:
        sys.stderr.write("ffmpeg gagal:\n" + " ".join(cmd) + "\n\n" + proc.stderr[-3000:] + "\n")
        sys.exit(1)
    return proc


def ab(p):
    return os.path.abspath(os.path.expanduser(p))


def ensure_out(path, src=None):
    path = ab(path)
    if src and os.path.abspath(src) == path:
        sys.exit("Output tak boleh sama dengan input — fail asal kena kekal. Guna nama lain.")
    d = os.path.dirname(path)
    if d:
        os.makedirs(d, exist_ok=True)
    return path


def done(path):
    i = probe(path)
    mb = os.path.getsize(path) / 1024 / 1024
    print(f"SIAP: {path}")
    print(f"  {i['width']}x{i['height']} · {i['duration']:.1f}s · {i['fps']:.0f}fps · "
          f"audio={'ya' if i['has_audio'] else 'tiada'} · {mb:.1f} MB")


# ---------------------------------------------------------------------------
# probe (guna ffprobe kalau ada, kalau tak parse output `ffmpeg -i`)
# ---------------------------------------------------------------------------


def probe(path):
    need_ffmpeg()
    path = ab(path)
    if not os.path.exists(path):
        sys.exit(f"Fail tak jumpa: {path}")
    ffprobe = shutil.which("ffprobe")
    if ffprobe:
        p = subprocess.run([ffprobe, "-v", "error", "-print_format", "json", "-show_format",
                            "-show_streams", path], capture_output=True, text=True,
                           encoding="utf-8", errors="replace")
        if p.returncode == 0:
            data = json.loads(p.stdout)
            v = next((s for s in data["streams"] if s["codec_type"] == "video"), None)
            a = next((s for s in data["streams"] if s["codec_type"] == "audio"), None)
            fps = 0.0
            if v:
                num, _, den = v.get("avg_frame_rate", "0/1").partition("/")
                try:
                    fps = float(num) / float(den or 1)
                except (ValueError, ZeroDivisionError):
                    fps = 0.0
            w, h = (int(v["width"]), int(v["height"])) if v else (0, 0)
            rot = 0
            if v:
                rot = int(v.get("tags", {}).get("rotate", 0) or 0)
                for sd in v.get("side_data_list", []) or []:
                    if "rotation" in sd:
                        rot = int(sd["rotation"])
            if abs(rot) in (90, 270):
                w, h = h, w
            return {
                "path": path,
                "width": w,
                "height": h,
                "duration": float(data["format"].get("duration", 0) or 0),
                "fps": fps,
                "has_video": v is not None,
                "has_audio": a is not None,
                "vcodec": v["codec_name"] if v else None,
                "acodec": a["codec_name"] if a else None,
            }
    # fallback: parse stderr ffmpeg -i
    p = subprocess.run([FFMPEG, "-hide_banner", "-i", path], capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    err = p.stderr
    dur = 0.0
    m = re.search(r"Duration: (\d+):(\d+):([\d.]+)", err)
    if m:
        dur = int(m.group(1)) * 3600 + int(m.group(2)) * 60 + float(m.group(3))
    w = h = 0
    fps = 0.0
    vm = re.search(r"Video: (\w+).*?, (\d{2,5})x(\d{2,5})", err)
    if vm:
        w, h = int(vm.group(2)), int(vm.group(3))
    fm = re.search(r"([\d.]+) fps", err)
    if fm:
        fps = float(fm.group(1))
    if re.search(r"rotate\s*:\s*-?(90|270)", err) or re.search(r"rotation of -?(90|270)", err):
        w, h = h, w
    am = re.search(r"Audio: (\w+)", err)
    return {"path": path, "width": w, "height": h, "duration": dur, "fps": fps,
            "has_video": vm is not None, "has_audio": am is not None,
            "vcodec": vm.group(1) if vm else None, "acodec": am.group(1) if am else None}


# ---------------------------------------------------------------------------
# encode settings
# ---------------------------------------------------------------------------

def venc(crf=20, preset="medium", extra=None):
    a = ["-c:v", "libx264", "-preset", preset, "-crf", str(crf), "-pix_fmt", "yuv420p",
         "-movflags", "+faststart"]
    return a + (extra or [])


AENC = ["-c:a", "aac", "-b:a", "160k", "-ar", "48000"]

RATIOS = {
    "9:16": (1080, 1920), "1:1": (1080, 1080), "4:5": (1080, 1350), "16:9": (1920, 1080),
}


def even(n):
    n = int(round(n))
    return n - (n % 2)


def fit_filter(W, H, mode):
    """Filter untuk muatkan apa-apa video ke kanvas WxH."""
    if mode == "crop":
        return f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1"
    if mode == "pad":
        return (f"scale={W}:{H}:force_original_aspect_ratio=decrease,"
                f"pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1")
    # blur: latar belakang video sama yang dikabur — paling cantik untuk reels
    return (f"split=2[bg][fg];"
            f"[bg]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},"
            f"boxblur=luma_radius=40:luma_power=2,eq=brightness=-0.06[bgb];"
            f"[fg]scale={W}:{H}:force_original_aspect_ratio=decrease[fgs];"
            f"[bgb][fgs]overlay=(W-w)/2:(H-h)/2,setsar=1")


def parse_time(t):
    """'1:23.5' / '83.5' / '00:01:23' -> saat"""
    if t is None:
        return None
    t = str(t).strip()
    parts = t.split(":")
    s = 0.0
    for p in parts:
        s = s * 60 + float(p)
    return s


# ---------------------------------------------------------------------------
# ASS (subtitle & teks) — semua teks dibakar melalui libass supaya tak perlu
# cari laluan fail font; libass guna font sistem.
# ---------------------------------------------------------------------------

COLORS = {
    "putih": "FFFFFF", "hitam": "000000", "kuning": "FFD60A", "merah": "E63946",
    "biru": "1D4ED8", "hijau": "16A34A", "oren": "F97316", "pink": "EC4899", "ungu": "7C3AED",
}


def ass_color(c, alpha=0):
    c = COLORS.get(str(c).lower(), str(c)).lstrip("#")
    if not re.fullmatch(r"[0-9a-fA-F]{6}", c):
        sys.exit(f"Warna tak dikenali: {c}. Guna nama (putih, kuning, merah...) atau hex #RRGGBB.")
    r, g, b = c[0:2], c[2:4], c[4:6]
    return f"&H{alpha:02X}{b}{g}{r}".upper()


def ass_time(s):
    s = max(0.0, s)
    h = int(s // 3600)
    m = int(s % 3600 // 60)
    sec = s % 60
    return f"{h}:{m:02d}:{sec:05.2f}"


def ass_escape(text):
    text = text.replace("\\", "\\\\").replace("{", "(").replace("}", ")")
    return text.replace("\r", "").replace("\n", "\\N")


def ass_header(W, H, styles):
    out = ["[Script Info]", "ScriptType: v4.00+", f"PlayResX: {W}", f"PlayResY: {H}",
           "WrapStyle: 0", "ScaledBorderAndShadow: yes", "", "[V4+ Styles]",
           "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, "
           "BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, "
           "BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding"]
    out += styles
    out += ["", "[Events]",
            "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
    return out


def ass_style(name, font, size, color, outline_color, box, align, margin_v, margin_lr, bold=True,
              outline=None, box_color="000000", box_alpha=0x40):
    if box:
        border_style, ol, back = 3, (outline if outline is not None else max(6, size // 6)), \
            ass_color(box_color, box_alpha)
        out_col = ass_color(box_color, box_alpha)
    else:
        border_style, ol, back = 1, (outline if outline is not None else max(3, size // 14)), \
            ass_color("000000", 0x80)
        out_col = ass_color(outline_color)
    return (f"Style: {name},{font},{size},{ass_color(color)},{ass_color(color)},{out_col},{back},"
            f"{-1 if bold else 0},0,0,0,100,100,0,0,{border_style},{ol},{1 if not box else 0},"
            f"{align},{margin_lr},{margin_lr},{margin_v},1")


def burn_ass(src, out, ass_lines, extra_vf=None):
    """Bakar fail ASS ke video. Jalankan ffmpeg dalam folder temp supaya laluan
    fail ASS tak perlu di-escape (Windows C:\\ biasanya rosakkan filter)."""
    src, out = ab(src), ab(out)
    info = probe(src)
    with tempfile.TemporaryDirectory() as td:
        with open(os.path.join(td, "t.ass"), "w", encoding="utf-8") as f:
            f.write("\n".join(ass_lines) + "\n")
        vf = "ass=t.ass"
        if extra_vf:
            vf = extra_vf + "," + vf
        args = ["-i", src, "-vf", vf] + venc()
        args += (["-c:a", "copy"] if info["has_audio"] else ["-an"])
        run(args + [out], cwd=td)


SUB_STYLES = {
    # nama: (saiz relatif tinggi, warna, kotak?, alignment, margin bawah relatif)
    "reels": dict(size=0.042, color="putih", box=False, align=2, mv=0.24),
    "bawah": dict(size=0.050, color="putih", box=False, align=2, mv=0.06),
    "kotak": dict(size=0.040, color="putih", box=True, align=2, mv=0.24),
    "kuning": dict(size=0.044, color="kuning", box=False, align=2, mv=0.24),
}


def parse_srt(path):
    with open(path, encoding="utf-8-sig") as f:
        raw = f.read()
    blocks = re.split(r"\n\s*\n", raw.replace("\r\n", "\n").strip())
    cues = []
    tre = re.compile(r"(\d+):(\d+):(\d+)[,.](\d+)\s*-->\s*(\d+):(\d+):(\d+)[,.](\d+)")
    for b in blocks:
        lines = b.strip().split("\n")
        for i, ln in enumerate(lines):
            m = tre.search(ln)
            if m:
                g = [int(x) for x in m.groups()]
                st = g[0] * 3600 + g[1] * 60 + g[2] + g[3] / (10 ** len(m.group(4)))
                en = g[4] * 3600 + g[5] * 60 + g[6] + g[7] / (10 ** len(m.group(8)))
                text = "\n".join(lines[i + 1:]).strip()
                if text:
                    cues.append((st, en, text))
                break
    if not cues:
        sys.exit(f"Tiada subtitle sah dalam {path}. Format SRT: '00:00:01,000 --> 00:00:03,000'.")
    return cues


def srt_time(s):
    ms = int(round(s * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    sec, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{sec:02d},{ms:03d}"


# ---------------------------------------------------------------------------
# arahan
# ---------------------------------------------------------------------------


def cmd_check(a):
    if not FFMPEG:
        print(INSTALL_HELP)
        sys.exit(1)
    v = subprocess.run([FFMPEG, "-hide_banner", "-version"], capture_output=True, text=True)
    print("ffmpeg OK:", FFMPEG)
    print(v.stdout.splitlines()[0])
    f = subprocess.run([FFMPEG, "-hide_banner", "-filters"], capture_output=True, text=True).stdout
    for name in ("ass", "sidechaincompress", "afftdn", "loudnorm", "boxblur"):
        ok = re.search(rf"\s{name}\s", f) is not None
        print(f"  filter {name:18s} {'ada' if ok else 'TIADA'}")


def cmd_info(a):
    for p in a.input:
        i = probe(p)
        mb = os.path.getsize(i["path"]) / 1024 / 1024
        ratio = i["width"] / i["height"] if i["height"] else 0
        guess = min(RATIOS, key=lambda k: abs(RATIOS[k][0] / RATIOS[k][1] - ratio)) if ratio else "?"
        print(json.dumps({**i, "size_mb": round(mb, 2), "ratio_hampir": guess}, ensure_ascii=False))


def cmd_sheet(a):
    i = probe(a.input)
    n = a.cols * a.rows
    dur = max(i["duration"], 0.1)
    out = ensure_out(a.output)
    # ambil frame di tengah setiap selang supaya tak dapat frame hitam di 0s
    step = dur / n
    times = [step * (k + 0.5) for k in range(n)]
    w = 360 if i["height"] >= i["width"] else 480
    with tempfile.TemporaryDirectory() as td:
        for k, t in enumerate(times):
            run(["-ss", f"{t:.3f}", "-i", ab(a.input), "-frames:v", "1",
                 "-vf", f"scale={w}:-2", os.path.join(td, f"f{k:03d}.png")])
        run(["-framerate", "1", "-i", os.path.join(td, "f%03d.png"), "-vf",
             f"tile={a.cols}x{a.rows}:padding=6:margin=6:color=white", "-frames:v", "1", out])
    print(f"SIAP: {out}")
    print("Masa setiap frame (baca kiri->kanan, atas->bawah):")
    print(", ".join(f"{t:.1f}s" for t in times))


def cmd_thumbnail(a):
    out = ensure_out(a.output)
    run(["-ss", str(parse_time(a.at)), "-i", ab(a.input), "-frames:v", "1", "-q:v", "2", out])
    print(f"SIAP: {out}")


def cmd_trim(a):
    out = ensure_out(a.output, a.input)
    args = []
    st = parse_time(a.start) if a.start else 0
    if st:
        args += ["-ss", f"{st:.3f}"]
    args += ["-i", ab(a.input)]
    if a.end:
        args += ["-t", f"{parse_time(a.end) - st:.3f}"]
    run(args + venc() + AENC + [out])
    done(out)


def cmd_resize(a):
    out = ensure_out(a.output, a.input)
    W, H = RATIOS[a.ratio]
    info = probe(a.input)
    args = ["-i", ab(a.input), "-filter_complex", f"[0:v]{fit_filter(W, H, a.mode)}[v]",
            "-map", "[v]"]
    if info["has_audio"]:
        args += ["-map", "0:a:0"] + AENC
    run(args + venc() + [out])
    done(out)


def cmd_join(a):
    out = ensure_out(a.output)
    infos = [probe(p) for p in a.inputs]
    if a.ratio:
        W, H = RATIOS[a.ratio]
    else:
        W, H = even(infos[0]["width"]), even(infos[0]["height"])
    fps = a.fps
    args, fc, labels = [], [], []
    extra_idx = len(infos)
    for k, (p, i) in enumerate(zip(a.inputs, infos)):
        args += ["-i", ab(p)]
    for k, i in enumerate(infos):
        fit = fit_filter(W, H, a.mode)
        if a.mode == "blur":
            fit = fit.replace("[bg]", f"[bg{k}]").replace("[fg]", f"[fg{k}]") \
                .replace("[bgb]", f"[bgb{k}]").replace("[fgs]", f"[fgs{k}]")
        fc.append(f"[{k}:v]{fit},fps={fps},format=yuv420p[v{k}]")
        if i["has_audio"]:
            fc.append(f"[{k}:a]aresample=48000,aformat=channel_layouts=stereo[a{k}]")
            labels.append(f"[v{k}][a{k}]")
        else:
            args += ["-f", "lavfi", "-t", f"{i['duration']:.3f}", "-i",
                     "anullsrc=r=48000:cl=stereo"]
            labels.append(f"[v{k}][{extra_idx}:a]")
            extra_idx += 1
    fc.append("".join(labels) + f"concat=n={len(infos)}:v=1:a=1[v][a]")
    args += ["-filter_complex", ";".join(fc), "-map", "[v]", "-map", "[a]"]
    run(args + venc() + AENC + [out])
    done(out)


def cmd_jumpcut(a):
    info = probe(a.input)
    if not info["has_audio"]:
        sys.exit("Video ni tiada audio — jumpcut perlukan suara untuk kesan bahagian senyap.")
    out = ensure_out(a.output, a.input)
    need_ffmpeg()
    p = subprocess.run([FFMPEG, "-hide_banner", "-i", ab(a.input), "-af",
                        f"silencedetect=noise={a.threshold}:d={a.min_silence}", "-f", "null", "-"],
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    starts = [float(x) for x in re.findall(r"silence_start: (-?[\d.]+)", p.stderr)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", p.stderr)]
    dur = info["duration"]
    if len(ends) < len(starts):
        ends.append(dur)
    silences = [(max(0, s) + a.pad, e - a.pad) for s, e in zip(starts, ends) if e - s > 2 * a.pad]
    keep, cur = [], 0.0
    for s, e in silences:
        if s > cur:
            keep.append((cur, s))
        cur = e
    if cur < dur:
        keep.append((cur, dur))
    keep = [(s, e) for s, e in keep if e - s > 0.05]
    removed = dur - sum(e - s for s, e in keep)
    if removed < 0.2:
        print("Tiada bahagian senyap yang ketara — video tak diubah. Cuba --threshold -30dB.")
        return
    expr = "+".join(f"between(t,{s:.3f},{e:.3f})" for s, e in keep)
    fc = (f"[0:v]select='{expr}',setpts=N/FRAME_RATE/TB[v];"
          f"[0:a]aselect='{expr}',asetpts=N/SR/TB[a]")
    run(["-i", ab(a.input), "-filter_complex", fc, "-map", "[v]", "-map", "[a]"]
        + venc() + AENC + [out])
    print(f"Buang {removed:.1f}s senyap ({len(keep)} bahagian disimpan).")
    done(out)


def atempo_chain(f):
    parts = []
    while f > 2.0:
        parts.append("atempo=2.0")
        f /= 2.0
    while f < 0.5:
        parts.append("atempo=0.5")
        f /= 0.5
    parts.append(f"atempo={f:.4f}")
    return ",".join(parts)


def cmd_speed(a):
    info = probe(a.input)
    out = ensure_out(a.output, a.input)
    f = a.factor
    args = ["-i", ab(a.input), "-filter:v", f"setpts=PTS/{f}"]
    if info["has_audio"]:
        args += ["-filter:a", atempo_chain(f)] + AENC
    run(args + venc() + [out])
    done(out)


def cmd_subtitle(a):
    info = probe(a.input)
    out = ensure_out(a.output, a.input)
    W, H = info["width"], info["height"]
    st = dict(SUB_STYLES[a.style])
    size = a.size or int(H * st["size"]) if H >= W else (a.size or int(H * st["size"] * 1.25))
    mv = int(H * st["mv"]) if H >= W else int(H * 0.07)
    color = a.color or st["color"]
    styles = [ass_style("Sub", a.font, size, color, "000000", st["box"], st["align"], mv,
                        int(W * 0.08))]
    lines = ass_header(W, H, styles)
    for s, e, t in parse_srt(a.srt):
        if a.upper:
            t = t.upper()
        lines.append(f"Dialogue: 0,{ass_time(s)},{ass_time(e)},Sub,,0,0,0,,{ass_escape(t)}")
    burn_ass(a.input, out, lines)
    done(out)


def wrap_words(words, max_chars):
    """Pecah ayat jadi baris yang panjangnya seimbang (elak satu perkataan tergantung)."""
    total = len(" ".join(words))
    n = max(1, -(-total // max_chars))
    target = total / n
    lines, cur = [], ""
    for w in words:
        cand = (cur + " " + w).strip()
        if cur and len(lines) < n - 1 and (len(cand) > max_chars or len(cand) > target * 1.15):
            lines.append(cur)
            cur = w
        else:
            cur = cand
    if cur:
        lines.append(cur)
    return lines


def cmd_srt_from_text(a):
    with open(a.script, encoding="utf-8-sig") as f:
        text = f.read()
    # pecah ikut ayat dulu supaya satu subtitle tak bawa hujung ayat lain
    sentences = [s for s in re.split(r"(?<=[.!?])\s+|\n+", text) if s.strip()]
    chunks = []
    for s in sentences:
        chunks += wrap_words(s.split(), a.max_chars)
    if not chunks:
        sys.exit("Fail skrip kosong.")
    if a.duration:
        total = parse_time(a.duration)
    else:
        total = probe(a.video)["duration"] if a.video else None
    if not total:
        sys.exit("Beri --video atau --duration supaya masa boleh dibahagi.")
    start = parse_time(a.offset) or 0.0
    span = total - start
    weights = [len(c) + 4 for c in chunks]
    tw = sum(weights)
    out = ensure_out(a.output)
    t = start
    with open(out, "w", encoding="utf-8") as f:
        for k, (c, w) in enumerate(zip(chunks, weights), 1):
            d = span * w / tw
            f.write(f"{k}\n{srt_time(t)} --> {srt_time(t + d - 0.05)}\n{c}\n\n")
            t += d
    print(f"SIAP: {out} ({len(chunks)} baris). Masa ialah anggaran — semak & laraskan kalau perlu.")


POS = {  # alignment ASS (numpad) + margin menegak relatif
    "atas": (8, 0.12), "tengah": (5, 0.0), "bawah": (2, 0.24),
}


def cmd_text(a):
    info = probe(a.input)
    out = ensure_out(a.output, a.input)
    W, H = info["width"], info["height"]
    items = []
    if a.spec:
        with open(a.spec, encoding="utf-8") as f:
            items = json.load(f)
    if a.text:
        items.append({"text": a.text, "start": a.start, "end": a.end, "pos": a.pos,
                      "size": a.size, "color": a.color, "box": a.box})
    if not items:
        sys.exit("Beri --text atau --spec fail.json")
    styles, events = [], []
    for k, it in enumerate(items):
        pos = it.get("pos", "atas")
        align, mvr = POS.get(pos, POS["atas"])
        size = int(it.get("size") or H * (0.055 if H >= W else 0.075))
        st_name = f"T{k}"
        styles.append(ass_style(st_name, it.get("font", a.font), size, it.get("color") or "putih",
                                "000000", bool(it.get("box")), align, int(H * mvr), int(W * 0.07),
                                box_color=it.get("box_color", "000000")))
        s = parse_time(it.get("start", 0)) or 0.0
        e = parse_time(it.get("end")) if it.get("end") is not None else info["duration"]
        fade = "{\\fad(200,200)}" if it.get("fade", True) else ""
        events.append(f"Dialogue: 1,{ass_time(s)},{ass_time(e)},{st_name},,0,0,0,,"
                      f"{fade}{ass_escape(str(it['text']))}")
    burn_ass(a.input, out, ass_header(W, H, styles) + events)
    done(out)


LOGO_POS = {
    "kanan-atas": "W-w-{m}:{m}", "kiri-atas": "{m}:{m}",
    "kanan-bawah": "W-w-{m}:H-h-{m}", "kiri-bawah": "{m}:H-h-{m}",
    "tengah": "(W-w)/2:(H-h)/2",
}


def cmd_logo(a):
    info = probe(a.input)
    out = ensure_out(a.output, a.input)
    W, H = info["width"], info["height"]
    lw = even(W * a.size)
    m = int(min(W, H) * 0.04)
    # untuk video menegak, naikkan sedikit dari atas supaya tak kena UI TikTok/Reels
    my = int(H * 0.06) if H > W and "atas" in a.pos else m
    xy = LOGO_POS[a.pos].format(m=m).replace(f":{m}", f":{my}", 1) if "atas" in a.pos \
        else LOGO_POS[a.pos].format(m=m)
    fc = (f"[1:v]scale={lw}:-1,format=rgba,colorchannelmixer=aa={a.opacity}[lg];"
          f"[0:v][lg]overlay={xy}:shortest=0:eof_action=repeat[v]")
    args = ["-i", ab(a.input), "-loop", "1", "-i", ab(a.logo), "-filter_complex", fc,
            "-map", "[v]", "-t", f"{info['duration']:.3f}"]
    args += (["-map", "0:a:0", "-c:a", "copy"] if info["has_audio"] else [])
    run(args + venc() + [out])
    done(out)


def cmd_music(a):
    info = probe(a.input)
    out = ensure_out(a.output, a.input)
    dur = info["duration"]
    fo = min(a.fade_out, dur / 3)
    music = (f"[1:a]aresample=48000,aformat=channel_layouts=stereo,volume={a.volume},"
             f"atrim=0:{dur:.3f},afade=t=in:d=0.5,afade=t=out:st={max(0, dur - fo):.3f}:d={fo:.3f}")
    if info["has_audio"]:
        if a.no_duck:
            fc = (f"{music}[m];[0:a]aresample=48000,aformat=channel_layouts=stereo[vo];"
                  f"[vo][m]amix=inputs=2:duration=first:normalize=0[a]")
        else:
            fc = (f"{music}[m];[0:a]aresample=48000,aformat=channel_layouts=stereo,asplit=2[vo][sc];"
                  f"[m][sc]sidechaincompress=threshold=0.03:ratio=10:attack=15:release=350[md];"
                  f"[vo][md]amix=inputs=2:duration=first:normalize=0[a]")
    else:
        fc = f"{music}[a]"
    run(["-i", ab(a.input), "-stream_loop", "-1", "-i", ab(a.music), "-filter_complex", fc,
         "-map", "0:v:0", "-map", "[a]", "-c:v", "copy", "-t", f"{dur:.3f}"] + AENC + [out])
    done(out)


def cmd_audio_clean(a):
    info = probe(a.input)
    if not info["has_audio"]:
        sys.exit("Video ni tiada audio.")
    out = ensure_out(a.output, a.input)
    chain = ["highpass=f=80", "lowpass=f=12000"]
    if not a.no_denoise:
        chain.append(f"afftdn=nf={a.denoise}")
    chain.append(f"loudnorm=I={a.loudness}:TP=-1.5:LRA=11")
    run(["-i", ab(a.input), "-map", "0:v:0", "-map", "0:a:0", "-c:v", "copy", "-af",
         ",".join(chain)] + AENC + [out])
    done(out)


def cmd_endcard(a):
    info = probe(a.input)
    out = ensure_out(a.output, a.input)
    W, H = even(info["width"]), even(info["height"])
    fps = round(info["fps"]) or 30
    secs = a.seconds
    has_a = info["has_audio"]
    args = ["-i", ab(a.input), "-loop", "1", "-t", f"{secs}", "-framerate", str(fps),
            "-i", ab(a.image), "-f", "lavfi", "-t", f"{secs}", "-i", "anullsrc=r=48000:cl=stereo"]
    fc = [f"[0:v]scale={W}:{H},setsar=1,fps={fps},format=yuv420p[v0]",
          f"[1:v]scale={W}:{H}:force_original_aspect_ratio=decrease,"
          f"pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:color={a.bg},setsar=1,fps={fps},format=yuv420p,"
          f"fade=t=in:d=0.4[v1]"]
    if has_a:
        fc.append("[0:a]aresample=48000,aformat=channel_layouts=stereo[a0]")
        a0 = "[a0]"
    else:
        args += ["-f", "lavfi", "-t", f"{info['duration']:.3f}", "-i", "anullsrc=r=48000:cl=stereo"]
        a0 = "[3:a]"
    fc.append(f"[v0]{a0}[v1][2:a]concat=n=2:v=1:a=1[v][a]")
    run(args + ["-filter_complex", ";".join(fc), "-map", "[v]", "-map", "[a]"]
        + venc() + AENC + [out])
    done(out)


EXPORT = {
    # nama: (W, H, crf, maxrate, sasaran MB atau None)
    "tiktok": (1080, 1920, 20, "10M", None),
    "reels": (1080, 1920, 20, "10M", None),
    "shorts": (1080, 1920, 20, "10M", None),
    "whatsapp": (720, 1280, 26, "3M", 15),
    "youtube": (1920, 1080, 19, "16M", None),
    "feed": (1080, 1350, 20, "10M", None),
    "square": (1080, 1080, 20, "10M", None),
}


def cmd_export(a):
    info = probe(a.input)
    out = ensure_out(a.output, a.input)
    W, H, crf, maxrate, target = EXPORT[a.preset]
    if a.preset == "whatsapp" and info["width"] > info["height"]:
        W, H = H, W  # whatsapp ikut orientasi asal
    if a.target_mb:
        target = a.target_mb
    vf = fit_filter(W, H, a.mode)
    extra = ["-maxrate", maxrate, "-bufsize", maxrate.replace("M", "") + "M"]
    if target:
        kbps = int(target * 8 * 1024 * 0.95 / max(info["duration"], 1)) - 128
        if kbps < 300:
            print(f"AMARAN: video terlalu panjang untuk {target}MB — kualiti akan rendah.")
        kbps = max(kbps, 250)
        extra = ["-maxrate", f"{kbps}k", "-bufsize", f"{kbps * 2}k"]
    args = ["-i", ab(a.input), "-filter_complex", f"[0:v]{vf},fps=30[v]", "-map", "[v]"]
    if info["has_audio"]:
        args += ["-map", "0:a:0", "-c:a", "aac", "-b:a", "128k", "-ar", "48000"]
    run(args + venc(crf=crf, extra=extra) + [out])
    done(out)


# ---------------------------------------------------------------------------


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawTextHelpFormatter)
    sp = ap.add_subparsers(dest="cmd", required=True)

    p = sp.add_parser("check", help="semak ffmpeg")
    p.set_defaults(fn=cmd_check)

    p = sp.add_parser("info", help="maklumat video")
    p.add_argument("input", nargs="+")
    p.set_defaults(fn=cmd_info)

    p = sp.add_parser("sheet", help="contact sheet (grid frame) untuk tengok isi video")
    p.add_argument("input")
    p.add_argument("output", help="contoh: sheet.jpg")
    p.add_argument("--cols", type=int, default=4)
    p.add_argument("--rows", type=int, default=3)
    p.set_defaults(fn=cmd_sheet)

    p = sp.add_parser("thumbnail", help="ambil satu frame")
    p.add_argument("input")
    p.add_argument("output")
    p.add_argument("--at", default="1", help="masa, contoh 3.5 atau 0:12")
    p.set_defaults(fn=cmd_thumbnail)

    p = sp.add_parser("trim", help="potong klip")
    p.add_argument("input")
    p.add_argument("output")
    p.add_argument("--start", help="contoh 0:05 atau 5.2")
    p.add_argument("--end", help="contoh 0:30")
    p.set_defaults(fn=cmd_trim)

    p = sp.add_parser("resize", help="tukar nisbah")
    p.add_argument("input")
    p.add_argument("output")
    p.add_argument("--ratio", choices=list(RATIOS), default="9:16")
    p.add_argument("--mode", choices=["blur", "crop", "pad"], default="blur")
    p.set_defaults(fn=cmd_resize)

    p = sp.add_parser("join", help="sambung klip")
    p.add_argument("output")
    p.add_argument("inputs", nargs="+")
    p.add_argument("--ratio", choices=list(RATIOS), help="default: ikut klip pertama")
    p.add_argument("--mode", choices=["blur", "crop", "pad"], default="blur")
    p.add_argument("--fps", type=int, default=30)
    p.set_defaults(fn=cmd_join)

    p = sp.add_parser("jumpcut", help="buang bahagian senyap")
    p.add_argument("input")
    p.add_argument("output")
    p.add_argument("--threshold", default="-35dB", help="lebih tinggi (cth -30dB) = lebih agresif")
    p.add_argument("--min-silence", type=float, default=0.6, help="saat senyap minimum dibuang")
    p.add_argument("--pad", type=float, default=0.15, help="ruang nafas dikekalkan (saat)")
    p.set_defaults(fn=cmd_jumpcut)

    p = sp.add_parser("speed", help="laju/perlahan")
    p.add_argument("input")
    p.add_argument("output")
    p.add_argument("--factor", type=float, required=True, help="1.25 = 25%% lebih laju")
    p.set_defaults(fn=cmd_speed)

    p = sp.add_parser("subtitle", help="bakar subtitle .srt")
    p.add_argument("input")
    p.add_argument("output")
    p.add_argument("--srt", required=True)
    p.add_argument("--style", choices=list(SUB_STYLES), default="reels")
    p.add_argument("--font", default="Arial")
    p.add_argument("--size", type=int)
    p.add_argument("--color")
    p.add_argument("--upper", action="store_true", help="HURUF BESAR semua")
    p.set_defaults(fn=cmd_subtitle)

    p = sp.add_parser("srt-from-text", help="jana .srt dari skrip")
    p.add_argument("script", help="fail .txt skrip")
    p.add_argument("output", help="fail .srt")
    p.add_argument("--video", help="ambil durasi dari video ni")
    p.add_argument("--duration", help="atau beri durasi terus")
    p.add_argument("--offset", default="0", help="subtitle mula pada saat ke-")
    p.add_argument("--max-chars", type=int, default=32)
    p.set_defaults(fn=cmd_srt_from_text)

    p = sp.add_parser("text", help="teks hook/tajuk")
    p.add_argument("input")
    p.add_argument("output")
    p.add_argument("--text")
    p.add_argument("--start", default="0")
    p.add_argument("--end")
    p.add_argument("--pos", choices=list(POS), default="atas")
    p.add_argument("--size", type=int)
    p.add_argument("--color", default="putih")
    p.add_argument("--box", action="store_true", help="latar kotak di belakang teks")
    p.add_argument("--font", default="Arial")
    p.add_argument("--spec", help="fail JSON senarai teks (lihat SKILL.md)")
    p.set_defaults(fn=cmd_text)

    p = sp.add_parser("logo", help="letak logo/watermark")
    p.add_argument("input")
    p.add_argument("output")
    p.add_argument("--logo", required=True, help="PNG lutsinar paling cantik")
    p.add_argument("--pos", choices=list(LOGO_POS), default="kanan-atas")
    p.add_argument("--size", type=float, default=0.18, help="lebar logo ÷ lebar video")
    p.add_argument("--opacity", type=float, default=0.9)
    p.set_defaults(fn=cmd_logo)

    p = sp.add_parser("music", help="muzik latar")
    p.add_argument("input")
    p.add_argument("output")
    p.add_argument("--music", required=True)
    p.add_argument("--volume", type=float, default=0.18, help="0.1 perlahan · 0.3 kuat")
    p.add_argument("--fade-out", type=float, default=2.0)
    p.add_argument("--no-duck", action="store_true", help="jangan perlahankan muzik bila ada suara")
    p.set_defaults(fn=cmd_music)

    p = sp.add_parser("audio-clean", help="bersihkan suara")
    p.add_argument("input")
    p.add_argument("output")
    p.add_argument("--denoise", type=int, default=-25, help="-20 kuat · -30 lembut")
    p.add_argument("--no-denoise", action="store_true")
    p.add_argument("--loudness", type=float, default=-14, help="LUFS; -14 standard media sosial")
    p.set_defaults(fn=cmd_audio_clean)

    p = sp.add_parser("endcard", help="gambar penutup")
    p.add_argument("input")
    p.add_argument("output")
    p.add_argument("--image", required=True)
    p.add_argument("--seconds", type=float, default=3)
    p.add_argument("--bg", default="white", help="warna latar kalau gambar tak muat penuh")
    p.set_defaults(fn=cmd_endcard)

    p = sp.add_parser("export", help="export ikut platform")
    p.add_argument("input")
    p.add_argument("output")
    p.add_argument("--preset", choices=list(EXPORT), required=True)
    p.add_argument("--mode", choices=["blur", "crop", "pad"], default="blur")
    p.add_argument("--target-mb", type=float, help="paksa saiz fail maksimum (MB)")
    p.set_defaults(fn=cmd_export)

    a = ap.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()
