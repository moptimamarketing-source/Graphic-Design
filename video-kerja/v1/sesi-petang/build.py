"""Jana index.html untuk video "Sesi Petang Kini Dibuka" (HyperFrames).

Masa sumber (saat dalam asal.mp4) datang dari transkrip. Skrip ni:
1. potong jeda janggal (segmen SEG),
2. tukar masa sumber -> masa output,
3. tulis klip video, grafik, caption dan SFX.
Jalankan: python3 build.py && npx hyperframes check
"""
import json
from pathlib import Path

# (mula, tamat) dalam sumber. Jeda > 0.2s di antara segmen dibuang.
SEG = [
    ("A", 0.00, 3.90),   # Jadual sesi petang kelas Minda Optima kini dibuka
    ("B", 4.12, 7.42),   # Disebabkan permintaan kelas yang semakin meningkat
    ("C", 7.66, 11.04),  # Kami tambah lagi pilihan masa untuk kelas fizikal
    ("D", 11.48, 16.45), # Lebih 2,700 orang pelajar ... di Minda Optima
    ("E", 16.72, 20.74), # Jadi kami nak bagi lebih banyak pilihan jadual kepada parents
    ("F", 20.90, 22.72), # Semak jadual yang tersedia
    ("G", 22.92, 26.00), # Dan pilih waktu jadual yang sesuai untuk anak
]
END_LEN = 3.0

segs, t = [], 0.0
for name, s, e in SEG:
    segs.append(dict(name=name, src=s, end=e, out=round(t, 3), dur=round(e - s, 3)))
    t += e - s
VIDEO_END = round(t, 3)
TOTAL = round(VIDEO_END + END_LEN, 3)
S = {g["name"]: g for g in segs}


def o(src):
    """Masa sumber -> masa output."""
    for g in segs:
        if g["src"] - 0.05 <= src <= g["end"] + 0.05:
            return round(g["out"] + (src - g["src"]), 3)
    raise ValueError(src)


# Caption: (mula, tamat) sumber, teks. *kata* = kata kunci (kuning).
CAP = [
    (0.05, 1.12, "Jadual sesi *petang*"),
    (1.12, 2.72, "kelas *Minda Optima*"),
    (2.85, 3.88, "*kini dibuka!*"),
    (4.12, 5.50, "Disebabkan *permintaan*"),
    (5.50, 7.42, "kelas yang *semakin meningkat*"),
    (7.66, 8.55, "kami *tambah* lagi"),
    (8.55, 9.35, "*pilihan masa*"),
    (9.35, 11.04, "untuk kelas *fizikal*"),
    (11.48, 13.20, "Lebih *2,700*"),
    (13.20, 14.42, "orang *pelajar*"),
    (14.42, 15.40, "yang sedang belajar"),
    (15.40, 16.45, "di *Minda Optima*"),
    (16.72, 17.95, "Jadi, kami nak bagi"),
    (17.95, 19.70, "lebih banyak *pilihan jadual*"),
    (19.70, 20.74, "kepada *parents*"),
    (20.90, 21.75, "*Semak* jadual"),
    (21.75, 22.72, "yang *tersedia*"),
    (22.92, 24.50, "dan *pilih* waktu jadual"),
    (24.50, 26.00, "yang *sesuai* untuk anak"),
]

# Masa output penting untuk animasi grafik
T = {
    "dibuka": o(2.85),
    "meningkat": o(5.55),
    "pilihanMasa": o(8.55),
    "fizikal": o(10.30),
    "count0": o(11.55),
    "count1": o(13.15),
    "pelajar": o(13.30),
    "belajar": o(14.50),
    "pilihanJadual": o(18.00),
    "parents": o(19.75),
    "semak": o(20.95),
    "tersedia": o(21.80),
    "pilih": o(23.40),
    "sesuai": o(24.55),
    "videoEnd": VIDEO_END,
    "total": TOTAL,
}
for g in segs:
    T["seg" + g["name"]] = g["out"]
    T["end" + g["name"]] = round(g["out"] + g["dur"], 3)
    T["d" + g["name"]] = g["dur"]
T["dEnd"] = END_LEN

# SFX: (masa output, fail, volume)
SFX = [
    (0.08, "whoosh-short", 0.30),
    (0.32, "pop", 0.35),
    (T["dibuka"] - 0.02, "impact-bass-1", 0.45),
    (T["segB"] + 0.02, "whoosh", 0.28),
    (T["meningkat"] + 0.05, "pop", 0.25),
    (T["meningkat"] + 0.95, "ping", 0.30),
    (T["segC"] + 0.02, "whoosh", 0.28),
    (T["pilihanMasa"], "pop", 0.35),
    (T["fizikal"] - 0.05, "pop", 0.35),
    (T["segD"] + 0.02, "whoosh", 0.28),
    (T["count1"] - 0.05, "sparkle", 0.35),
    (T["count1"] - 0.02, "ping", 0.30),
    (T["pelajar"] + 0.15, "pop", 0.30),
    (T["segE"] + 0.02, "whoosh", 0.28),
    (T["pilihanJadual"], "pop", 0.25),
    (T["parents"] + 0.05, "notification", 0.30),
    (T["segF"] + 0.02, "whoosh-short", 0.30),
    (T["semak"] + 0.35, "click-soft", 0.40),
    (T["semak"] + 0.70, "click-soft", 0.40),
    (T["semak"] + 1.05, "click-soft", 0.40),
    (T["segG"] + 0.02, "whoosh-short", 0.30),
    (T["pilih"], "click", 0.45),
    (T["sesuai"], "chime", 0.30),
    (VIDEO_END - 0.12, "whoosh", 0.35),
    (VIDEO_END + 0.42, "impact-bass-1", 0.40),
    (VIDEO_END + 1.85, "click", 0.40),
    (VIDEO_END + 1.90, "sparkle", 0.30),
]
SFX_DUR = {"whoosh": 0.57, "whoosh-short": 0.57, "pop": 0.72, "click": 0.37, "click-soft": 0.37,
           "ping": 1.32, "sparkle": 1.8, "chime": 2.5, "impact-bass-1": 2.12, "notification": 2.46}


def cap_html(text):
    out, hot = [], False
    for i, part in enumerate(text.split("*")):
        if part:
            out.append(f'<span class="hot">{part}</span>' if hot else part)
        hot = not hot
    return "".join(out)


videos = "\n".join(
    f'''      <div class="cam" id="cam-{g['name']}"><video id="v{g['name']}" src="assets/asal.mp4" data-start="{g['out']}" data-duration="{g['dur']}" data-media-start="{g['src']}" data-has-audio="true" data-fade-in="0.03" data-fade-out="0.04" data-track-index="0" playsinline></video></div>'''
    for g in segs)
# Ekor senyap klip G (tanpa bunyi) supaya wipe end card tak nampak skrin hitam
g = segs[-1]
videos = videos[: videos.rfind("</div>")] + (
    f'<video id="vTail" src="assets/asal.mp4" data-start="{VIDEO_END}" data-duration="0.5" '
    f'data-media-start="{g['end']}" muted data-track-index="1" playsinline></video>') + "</div>"

caps, cap_times = [], []
for i, (s, e, txt) in enumerate(CAP):
    caps.append(f'        <div class="cap" id="cap{i}"><span class="cap-in">{cap_html(txt)}</span></div>')
    cap_times.append([o(s), o(e) if e < 26 else VIDEO_END])

sfx = "\n".join(
    f'    <audio id="sfx{i}" src="assets/sfx/{f}.mp3" data-start="{round(t, 3)}" data-duration="{round(min(SFX_DUR[f], TOTAL - t), 3)}" data-volume="{v}" data-track-index="{10 + i}"></audio>'
    for i, (t, f, v) in enumerate(SFX))

tpl = Path(__file__).parent.joinpath("src", "template.html").read_text()
html = (tpl.replace("%%TOTAL%%", str(TOTAL))
        .replace("%%VIDEOS%%", videos)
        .replace("%%CAPS%%", "\n".join(caps))
        .replace("%%SFX%%", sfx)
        .replace("%%T%%", json.dumps(T))
        .replace("%%CAPT%%", json.dumps(cap_times))
        .replace("%%SEGS%%", json.dumps([{k: g[k] for k in ("name", "out", "dur")} for g in segs])))
for k, v in T.items():
    html = html.replace("%%" + k + "%%", str(v))
Path(__file__).with_name("index.html").write_text(html)
print("total", TOTAL, "video", VIDEO_END)
print(json.dumps(T, indent=0))
