"""Generate public/index.html (the HyperFrames composition) from build/edl.json + scripts/template.html."""
import json
import math
import random
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
edl = json.loads((ROOT / "build/edl.json").read_text())
tpl = (ROOT / "scripts/template.html").read_text()

DURATION = 42.5

# visual shots (picture only; all sound comes from the mastered soundtrack)
SHOTS = [
    # id, clip, start, dur, src_in
    ("s1", "0816", 0.00, 7.25, 1.28),
    ("s2", "0817", 7.25, 5.75, 0.90),
    ("s3", "0818", 13.00, 3.00, 1.42),
    ("s4", "0818", 16.00, 1.50, 4.68),
    ("s5", "0818", 17.50, 5.25, 6.20),
    ("s6", "0819", 22.75, 2.30, 4.22),
    ("s7", "0823", 25.05, 3.95, 6.00),   # b-roll: student, close angle
    ("s8", "0820", 29.00, 4.04, 7.74),
    ("s9", "HOLD", 33.04, 0.86, 11.78),  # punchline freeze frame
    ("s10", "0820", 33.90, 1.60, 11.78),
    ("s11", "0821", 35.50, 4.10, 11.40),
]
for sid, clip, st, du, si in SHOTS:  # sanity: picture matches the edit
    if clip not in ("HOLD", "0823"):
        seg = next(g for g in edl["segments"] if g["clip"] == clip and not g.get("hold") and g["src_in"] - 0.01 <= si < g["src_out"])
        assert abs((st - seg["start"]) - (si - seg["src_in"])) < 0.02, (sid, st, seg)

shots_html = []
for sid, clip, st, du, si in SHOTS:
    if clip == "HOLD":
        shots_html.append(
            f'<div id="{sid}-clip" class="shot-clip clip" data-start="{st}" data-duration="{du}" data-track-index="1">'
            f'<div id="{sid}" class="shot"><img id="{sid}-img" src="media/freeze-0820.jpg" alt="" /></div></div>')
    else:
        shots_html.append(
            f'<div id="{sid}" class="shot"><video id="{sid}-v" src="media/clips/{clip}.mp4" data-start="{st}" '
            f'data-duration="{du}" data-media-start="{si}" data-track-index="1" muted playsinline></video></div>')

# captions: split each spoken chunk into screens of <= 3-4 words (TikTok rhythm)
HIDE = {"Besar ni je.", "Serius, besar ni je?", "Tak perlu drive.", "mungkin dalam rumah anda."}  # shown as big type instead
screens = []
for c in edl["captions"]:
    if c["text"] in HIDE:
        continue
    words = c["words"]
    groups, cur = [], []
    for w in words:
        cur.append(w)
        chars = sum(len(x["w"]) for x in cur)
        if len(cur) >= 4 or chars >= 17 or w["w"].endswith(","):
            groups.append(cur); cur = []
    if cur:
        if groups and len(cur) == 1 and len(cur[0]["w"]) <= 4:
            groups[-1] += cur
        else:
            groups.append(cur)
    for i, g in enumerate(groups):
        start = g[0]["s"] - 0.06
        end = groups[i + 1][0]["s"] - 0.06 if i + 1 < len(groups) else c["end"] + 0.18
        screens.append({"start": round(start, 3), "end": round(end, 3), "words": g})

cap_html = []
cap_data = []
for i, s in enumerate(screens):
    spans = "".join(
        f'<span id="c{i}w{j}" class="w{" hl" if w["hl"] else ""}">{w["w"].upper()}</span>' for j, w in enumerate(s["words"]))
    cap_html.append(f'<div id="cap{i}" class="cap clip" data-start="{s["start"]}" data-duration="{round(s["end"] - s["start"], 3)}" data-track-index="5"><div class="cap-inner">{spans}</div></div>')
    cap_data.append({"i": i, "s": s["start"], "e": s["end"], "w": [w["s"] for w in s["words"]], "hl": [w["hl"] for w in s["words"]]})

# seeded particle burst for the punchline drop
rnd = random.Random(20261015)
colors = ["#FFD23F", "#FF5A36", "#FFFFFF", "#2346FF", "#5CE1E6"]
parts, pdata = [], []
for i in range(56):
    ang = rnd.uniform(0, 2 * math.pi)
    dist = rnd.uniform(220, 640)
    size = rnd.uniform(14, 38)
    shape = rnd.choice(["dot", "sq", "plus", "dot", "ring"])
    col = rnd.choice(colors)
    parts.append(f'<div id="p{i}" class="pt pt-{shape}" style="width:{size:.0f}px;height:{size:.0f}px;margin:{-size / 2:.0f}px 0 0 {-size / 2:.0f}px;--c:{col}"></div>')
    pdata.append([round(math.cos(ang) * dist, 1), round(math.sin(ang) * dist * 1.1, 1), round(rnd.uniform(-260, 260)), round(rnd.uniform(0.75, 1.25), 2)])

out = (tpl.replace("<!--SHOTS-->", "\n      ".join(shots_html))
          .replace("<!--CAPTIONS-->", "\n      ".join(cap_html))
          .replace("<!--PARTICLES-->", "".join(parts))
          .replace("/*CAPDATA*/null", json.dumps(cap_data))
          .replace("/*PDATA*/null", json.dumps(pdata))
          .replace("__DURATION__", str(DURATION)))
assert "<!--" not in re.sub(r"<!-- .*? -->", "", out), "unfilled marker"
(ROOT / "public/index.html").write_text(out)
print(f"wrote public/index.html: {len(SHOTS)} shots, {len(screens)} caption screens, {len(parts)} particles")
for s in screens:
    print(f"  {s['start']:6.2f}-{s['end']:6.2f}  {' '.join(w['w'] for w in s['words'])}")
