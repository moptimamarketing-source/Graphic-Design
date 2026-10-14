"""Generate the HyperFrames composition (project/index.html) for the
Minda Optima 'Sesi Petang' reel from the edit decision list + word timings."""
import json
import math
import random
import sys

ROOT = sys.argv[1]  # scratchpad dir
EDL = json.load(open(f"{ROOT}/edit/edl.json"))
W = json.load(open(f"{ROOT}/edit/words_timeline.json"))
CLIPS = EDL["clips"]
SPEECH_END = EDL["length"]          # 25.705
END_CARD = SPEECH_END               # end card starts when the last clip ends
TOTAL = 28.6
FPS = 30
NAVY = "#0B2A5B"


def q(t):
    return round(round(t * FPS) / FPS, 4)


js = []          # GSAP statements
html_layers = []  # overlay html


def T(stmt):
    js.append(stmt)


# ------------------------------------------------------------------ video clips
ZOOM = {  # clip id -> (start scale, end scale)
    "c01": (1.05, 1.10), "c02": (1.16, 1.20), "c03": (1.00, 1.04), "c04": (1.13, 1.16),
    "c05": (1.00, 1.03), "c06": (1.00, 1.00), "c07": (1.17, 1.20), "c08": (1.02, 1.05),
    "c09": (1.13, 1.16), "c10": (1.00, 1.03), "c11": (1.06, 1.12), "c12": (1.00, 1.03),
    "c13": (1.15, 1.18), "c14": (1.04, 1.08),
}
video_html = []
for ci_, c in enumerate(CLIPS):
    cid = c["id"]
    video_html.append(f'''      <div class="shot"><div class="inner" id="in-{cid}">
        <video id="{cid}" src="source.mp4" data-start="{c['t0']}" data-duration="{c['dur']}" data-media-start="{c.get('media', c['src_in'])}" data-track-index="{ci_ % 2}" data-fade-in="0.012" data-fade-out="0.015" playsinline data-has-audio="true"></video>
      </div></div>''')
    z0, z1 = ZOOM[cid]
    t0, d = c["t0"], c["dur"]
    if cid == "c01":
        # hook: snap zoom-out from a tight punch, then slow push
        T(f'tl.fromTo("#in-c01", {{scale: 1.22}}, {{scale: {z0}, duration: 0.45, ease: "power3.out"}}, 0);')
        T(f'tl.to("#in-c01", {{scale: {z1}, duration: {round(d - 0.45, 3)}, ease: "none"}}, 0.45);')
    elif cid == "c05":
        # build then punch on the 2,700 landing (9.64 = music drop)
        drop = 9.64
        T(f'tl.fromTo("#in-c05", {{scale: {z0}}}, {{scale: {z1}, duration: {round(drop - t0 - 0.01, 3)}, ease: "none"}}, {t0});')
        T(f'tl.to("#in-c05", {{scale: 1.15, duration: 0.14, ease: "power4.out"}}, {drop});')
        T(f'tl.to("#in-c05", {{scale: 1.10, duration: {round(t0 + d - drop - 0.2, 3)}, ease: "power1.out"}}, {round(drop + 0.15, 3)});')
    else:
        T(f'tl.fromTo("#in-{cid}", {{scale: {z0}}}, {{scale: {z1}, duration: {d}, ease: "none"}}, {t0});')

# end-card background: the last 1.65 s of footage, slowed down, blurred via #cam filter
tail_dur = round(TOTAL - END_CARD, 3)
video_html.append(f'''      <div class="shot"><div class="inner" id="in-c15">
        <video id="c15" src="source.mp4" data-start="{END_CARD}" data-duration="{tail_dur}" data-media-start="29.4" data-playback-rate="0.56" data-track-index="0" muted playsinline></video>
      </div></div>''')
T(f'tl.fromTo("#in-c15", {{scale: 1.10}}, {{scale: 1.18, duration: {tail_dur}, ease: "none"}}, {END_CARD});')

# camera grade / mood changes on #cam (same filter function list so GSAP interpolates)
GRADE = "contrast(1.06) saturate(1.14) brightness(1.01) blur(0px)"
DESAT = "contrast(1.02) saturate(0.30) brightness(0.96) blur(0px)"
ENDF = "contrast(1.05) saturate(1.2) brightness(0.62) blur(18px)"
T(f'tl.set("#cam", {{filter: "{GRADE}"}}, 0);')
T(f'tl.to("#cam", {{filter: "{DESAT}", duration: 0.5, ease: "power2.inOut"}}, 19.62);')
T(f'tl.to("#cam", {{filter: "{GRADE}", duration: 0.12, ease: "power2.out"}}, 22.525);')
T(f'tl.to("#cam", {{filter: "{ENDF}", duration: 0.45, ease: "power2.inOut"}}, {END_CARD - 0.05});')

# camera shake helper
def shake(t, amp=14):
    pts = [(-1, 0.6), (0.9, -0.8), (-0.6, 0.5), (0.35, -0.3), (0, 0)]
    kf = ",".join(f'{{x: {round(x * amp, 1)}, y: {round(y * amp, 1)}, duration: 0.045}}' for x, y in pts)
    T(f'tl.to("#cam", {{keyframes: [{kf}], ease: "none"}}, {t});')


shake(0.0, 10)
shake(9.64, 16)
shake(END_CARD, 10)

# white flashes on big beats
FLASH_T = [9.64, 22.525, END_CARD]
for i, t in enumerate(FLASH_T):
    T(f'tl.fromTo("#flash", {{opacity: 0.55}}, {{opacity: 0, duration: 0.28, ease: "power2.out", immediateRender: false}}, {t});')

# ------------------------------------------------------------------ captions
CHUNKS = [
    (["minda", "optima"], {"minda": "blue", "optima": "blue"}),
    (["kini", "dah", "buka"], {}),
    (["jadual", "sesi", "petang"], {"sesi": "orange", "petang": "orange"}),
    (["untuk", "kelas", "fizikal"], {"kelas": "blue", "fizikal": "blue"}),
    (["dengan", "lebih"], {}),
    (["dua", "ribu", "tujuh", "ratus", "orang", "pelajar"], {"2,700": "yellow"}),
    (["yang", "belajar", "membaca"], {"membaca": "green"}),
    (["di", "minda", "optima"], {"minda": "blue", "optima": "blue"}),
    (["kami", "telah", "tambah"], {"tambah": "orange"}),
    (["pilihan", "jadual"], {"pilihan": "orange", "jadual": "orange"}),
    (["supaya", "lebih", "ramai"], {"ramai": "green"}),
    (["pelajar", "boleh", "belajar"], {}),
    (["dalam", "waktu", "yang", "sesuai"], {"sesuai": "green"}),
    (["kalau", "sebelum", "ni"], {}),
    (["ada", "jadual", "yang", "tak", "sesuai"], {"tak": "red", "sesuai": "red"}),
    (["cuba", "semak", "slot"], {"semak": "orange", "slot": "orange"}),
    (["sesi", "kelas", "petang"], {"sesi": "blue", "kelas": "blue", "petang": "blue"}),
    (["yang", "ada", "sekarang"], {"sekarang!": "yellow"}),
]
wi = 3  # skip the hook words (covered by the hook title)
cap_html = []
chunk_objs = []
for ci, (seq, kws) in enumerate(CHUNKS):
    toks = []
    k = 0
    while k < len(seq):
        w = W[wi]
        assert w["text"] == seq[k], (w["text"], seq[k])
        if seq[k] == "dua":  # collapse the spoken number into one token
            w_end = W[wi + 3]
            toks.append(("2,700", w["start"], w_end["end"]))
            wi += 4
            k += 4
            continue
        text = w["text"] + ("!" if w["text"] == "sekarang" else "")
        toks.append((text, w["start"], w["end"]))
        wi += 1
        k += 1
    chunk_objs.append((toks, kws))
assert wi == len(W)

for ci, (toks, kws) in enumerate(chunk_objs):
    start = toks[0][1] - 0.06
    nxt = chunk_objs[ci + 1][0][0][1] - 0.06 if ci + 1 < len(chunk_objs) else SPEECH_END - 0.02
    end = min(nxt, toks[-1][2] + 0.9)
    spans = []
    for ti, (text, s, e) in enumerate(toks):
        color = kws.get(text)
        cls = f"w kw kw-{color}" if color else "w"
        sid = f"cap{ci}-{ti}"
        spans.append(f'<span id="{sid}" class="{cls}">{text.upper()}</span>')
        st = q(max(start + 0.01, s - 0.04))
        T(f'tl.fromTo("#{sid}", {{opacity: 0, y: 28, scale: 0.6}}, {{opacity: 1, y: 0, scale: 1, duration: 0.16, ease: "back.out(2.6)"}}, {st});')
        if not color:
            T(f'tl.set("#{sid}", {{color: "#FFD23F"}}, {q(s)});')
            T(f'tl.set("#{sid}", {{color: "#FFFFFF"}}, {q(max(e, s + 0.12))});')
        else:
            T(f'tl.fromTo("#{sid}", {{rotation: -6}}, {{rotation: -2, duration: 0.3, ease: "elastic.out(1, 0.4)", immediateRender: false}}, {st});')
    cap_html.append(f'      <div class="cap clip" id="capc{ci}" data-start="{q(start)}" data-duration="{q(end - start)}" data-track-index="5">{"".join(spans)}</div>')

# ------------------------------------------------------------------ SVG icons
ICON = {
    "bell": f'''<svg viewBox="0 0 120 120" class="ico"><g stroke="{NAVY}" stroke-width="7" stroke-linejoin="round"><path d="M60 14c-20 0-32 16-32 36v22l-10 14h84l-10-14V50c0-20-12-36-32-36z" fill="#FFD23F"/><circle cx="60" cy="96" r="11" fill="#F7941D"/><rect x="53" y="5" width="14" height="12" rx="5" fill="#FFD23F"/></g><path d="M40 46c2-10 8-17 17-19" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/></svg>''',
    "sun": f'''<svg viewBox="0 0 200 200" class="ico"><g id="SUNRAYS" fill="#FFD23F" stroke="{NAVY}" stroke-width="6" stroke-linejoin="round">''' + "".join(
        f'<path d="M100 8 L112 40 L88 40 Z" transform="rotate({a} 100 100)"/>' for a in range(0, 360, 45)) + f'''</g><circle cx="100" cy="100" r="48" fill="#F7941D" stroke="{NAVY}" stroke-width="7"/><path d="M80 92c5-6 12-6 16 0M104 92c5-6 12-6 16 0" stroke="{NAVY}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M82 110c10 12 26 12 36 0" stroke="{NAVY}" stroke-width="6" fill="none" stroke-linecap="round"/></svg>''',
    "pin": '''<svg viewBox="0 0 60 80" class="ico"><path d="M30 4C16 4 6 14 6 28c0 18 24 46 24 46s24-28 24-46C54 14 44 4 30 4z" fill="#fff"/><circle cx="30" cy="28" r="9" fill="#1E6FD9"/></svg>''',
    "book": f'''<svg viewBox="0 0 140 110" class="ico"><g stroke="{NAVY}" stroke-width="6" stroke-linejoin="round"><path d="M70 22C55 10 30 8 10 12v80c20-4 45-2 60 10z" fill="#F7941D"/><path d="M70 22c15-12 40-14 60-10v80c-20-4-45-2-60 10z" fill="#FFB547"/></g><path d="M22 34c12-2 26 0 36 6M22 52c12-2 26 0 36 6M82 40c10-6 24-8 36-6M82 58c10-6 24-8 36-6" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"/></svg>''',
    "cal": f'''<svg viewBox="0 0 120 120" class="ico"><g stroke="{NAVY}" stroke-width="7" stroke-linejoin="round"><rect x="10" y="20" width="100" height="90" rx="16" fill="#fff"/><path d="M10 36c0-9 7-16 16-16h68c9 0 16 7 16 16v12H10z" fill="#E8262D"/><rect x="30" y="8" width="12" height="24" rx="6" fill="#fff"/><rect x="78" y="8" width="12" height="24" rx="6" fill="#fff"/></g><path d="M60 62v32M44 78h32" stroke="#1E6FD9" stroke-width="11" stroke-linecap="round"/></svg>''',
    "clock": f'''<svg viewBox="0 0 120 120" class="ico"><circle cx="60" cy="60" r="50" fill="#fff" stroke="{NAVY}" stroke-width="8"/><g stroke="{NAVY}" stroke-width="5" stroke-linecap="round"><path d="M60 16v8M60 96v8M16 60h8M96 60h8"/></g><path id="CLOCKHAND" d="M60 60V30" stroke="#E8262D" stroke-width="8" stroke-linecap="round"/><path id="CLOCKHAND2" d="M60 60h22" stroke="{NAVY}" stroke-width="8" stroke-linecap="round"/><circle cx="60" cy="60" r="7" fill="{NAVY}"/></svg>''',
    "hand": f'''<svg viewBox="0 0 100 120" class="ico"><path d="M38 8c6 0 10 4 10 10v38l4-2c5-2 10 1 11 6 5-3 11 0 12 5 5-2 11 1 11 7v22c0 14-12 24-26 24H48c-9 0-16-4-21-11L10 82c-3-5-2-11 3-14 4-3 10-2 14 2l1 1V18c0-6 4-10 10-10z" fill="#FFD9B8" stroke="{NAVY}" stroke-width="6" stroke-linejoin="round"/></svg>''',
}


def kid(color, skin="#FFD9B8"):
    return f'''<svg viewBox="0 0 100 120" class="kid"><path d="M14 118c0-26 16-42 36-42s36 16 36 42z" fill="{color}" stroke="{NAVY}" stroke-width="6"/><circle cx="50" cy="44" r="28" fill="{skin}" stroke="{NAVY}" stroke-width="6"/><path d="M24 40c2-18 16-26 30-24 12 2 22 10 22 24-10-6-30-8-52 0z" fill="#2B2B3A"/><circle cx="40" cy="48" r="4" fill="{NAVY}"/><circle cx="60" cy="48" r="4" fill="{NAVY}"/><path d="M41 60c6 6 12 6 18 0" stroke="{NAVY}" stroke-width="4" fill="none" stroke-linecap="round"/></svg>'''


def burst(fill, n=12, r1=100, r2=70):
    pts = []
    for i in range(n * 2):
        r = r1 if i % 2 == 0 else r2
        a = math.pi * i / n - math.pi / 2
        pts.append(f"{100 + r * math.cos(a):.1f},{100 + r * math.sin(a):.1f}")
    return f'<svg viewBox="0 0 200 200" class="burst"><polygon points="{" ".join(pts)}" fill="{fill}" stroke="{NAVY}" stroke-width="7" stroke-linejoin="round"/></svg>'


def star(cls):
    return f'<svg viewBox="0 0 100 100" class="{cls}"><path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" fill="#FFF6C2"/></svg>'


# ------------------------------------------------------------------ overlay helpers
def pop_in(sel, t, scale0=0.4, rot0=-8, dur=0.42):
    T(f'tl.fromTo("{sel}", {{opacity: 0, scale: {scale0}, rotation: {rot0}}}, {{opacity: 1, scale: 1, rotation: 0, duration: {dur}, ease: "back.out(1.9)"}}, {q(t)});')


def pop_out(sel, t, dur=0.22):
    T(f'tl.to("{sel}", {{opacity: 0, scale: 0.75, y: -40, duration: {dur}, ease: "power2.in"}}, {q(t)});')


def bob(sel, t0, t1, amp=10, period=1.0):
    reps = max(0, int((t1 - t0) / period) - 1)
    T(f'tl.fromTo("{sel}", {{y: 0}}, {{y: -{amp}, duration: {period / 2}, ease: "sine.inOut", yoyo: true, repeat: {reps * 2 + 1}, immediateRender: false}}, {q(t0)});')


# ---- G1 hook (0 - 2.25)
html_layers.append(f'''      <div id="g1" class="clip ov" data-start="0" data-duration="2.25" data-track-index="6">
        <div class="hook">
          <div class="hook-row"><div class="hook-bell" id="g1-bell">{ICON["bell"]}</div><div class="hook-l1" id="g1-l1">BERITA BAIK,</div></div>
          <div class="hook-l2" id="g1-l2">PARENTS!</div>
        </div>
        <div class="ting" id="ting1" style="left:30px;top:760px;">{burst("#FFD23F")}<span>TING!</span></div>
        <div class="ting" id="ting2" style="left:170px;top:930px;">{burst("#7AC143")}<span>TING!</span></div>
        <div class="ting" id="ting3" style="left:20px;top:1080px;">{burst("#F7941D")}<span>TING!</span></div>
      </div>''')
T('tl.fromTo("#g1-l1", {opacity: 1, scale: 1.3, rotation: -8}, {opacity: 1, scale: 1, rotation: -3, duration: 0.3, ease: "back.out(2)"}, 0);')
T('tl.fromTo("#g1-bell", {opacity: 1, scale: 0.7, rotation: -30}, {opacity: 1, scale: 1, rotation: 0, duration: 0.35, ease: "back.out(2)"}, 0);')
T('tl.fromTo("#g1-bell", {rotation: -18}, {rotation: 18, duration: 0.13, ease: "sine.inOut", yoyo: true, repeat: 11, immediateRender: false}, 0.5);')
T('tl.fromTo("#g1-l2", {opacity: 0, scale: 0.2, rotation: 12}, {opacity: 1, scale: 1, rotation: -4, duration: 0.45, ease: "back.out(2.4)"}, 0.82);')
T('tl.to("#g1-l2", {scale: 1.07, duration: 0.25, ease: "sine.inOut", yoyo: true, repeat: 1}, 1.32);')
for i, t in enumerate([0.28, 0.66, 1.08]):
    T(f'tl.fromTo("#ting{i + 1}", {{opacity: 0, scale: 0.2, rotation: {-25 + i * 20}}}, {{opacity: 1, scale: 1, rotation: {-10 + i * 12}, duration: 0.18, ease: "back.out(3)"}}, {t});')
    T(f'tl.to("#ting{i + 1}", {{opacity: 0, scale: 1.3, duration: 0.2, ease: "power2.in"}}, {round(t + 0.42, 2)});')
T('tl.to("#g1 .hook", {opacity: 0, x: -700, rotation: -6, duration: 0.24, ease: "power3.in"}, 1.98);')

# ---- G2 SESI PETANG (5.0 - 7.42)
html_layers.append(f'''      <div id="g2" class="clip ov" data-start="4.98" data-duration="2.46" data-track-index="6">
        <div class="card-top" id="g2-card">
          <div class="chip chip-red" id="g2-chip">BARU DIBUKA!</div>
          <div class="g2-row"><div class="g2-sun" id="g2-sun">{ICON["sun"]}</div><div class="title-xl" id="g2-title">SESI<br>PETANG</div></div>
          <div class="chip chip-blue chip-lg" id="g2-chip2"><span class="chip-ico">{ICON["pin"]}</span>KELAS FIZIKAL</div>
        </div>
      </div>''')
pop_in("#g2-card", 5.0, 0.5, -6)
pop_in("#g2-chip", 5.12, 0.3, 10, 0.35)
T('tl.fromTo("#g2-sun", {rotation: -90, scale: 0}, {rotation: 0, scale: 1, duration: 0.6, ease: "back.out(1.7)"}, 5.05);')
T('tl.fromTo("#SUNRAYS", {rotation: 0, transformOrigin: "50% 50%"}, {rotation: 90, duration: 2.3, ease: "none", immediateRender: false}, 5.1);')
pop_in("#g2-chip2", 6.32, 0.3, -12, 0.38)
pop_out("#g2-card", 7.18)

# ---- G3 2,700+ (7.42 - 10.5) odometer
DIG_H = 250
def strip(target, loops):
    nums = [str(i % 10) for i in range(10 * loops + target + 1)]
    return "".join(f"<div>{n}</div>" for n in nums), 10 * loops + target


digits = [(2, 1), None, (7, 2), (0, 3), (0, 4)]
cols = []
for i, d in enumerate(digits):
    if d is None:
        cols.append('<div class="odo-comma">,</div>')
        continue
    inner, idx = strip(*d)
    cols.append(f'<div class="odo-col"><div class="odo-strip" id="odo{i}">{inner}</div></div>')
    # spin finishes on the landing (9.64); higher-order digits start later
    st = 8.14 + 0.08 * (4 - i)
    T(f'tl.fromTo("#odo{i}", {{y: 0}}, {{y: {-idx * DIG_H}, duration: {round(9.64 - st, 3)}, ease: "power3.out"}}, {q(st)});')
html_layers.append(f'''      <div id="g3" class="clip ov" data-start="7.42" data-duration="3.08" data-track-index="6">
        <div class="g3-wrap" id="g3-wrap">
          <div class="g3-rays" id="g3-rays"></div>
          <div class="chip chip-yellow" id="g3-kicker">LEBIH DARIPADA</div>
          <div class="odo" id="g3-odo">{"".join(cols)}<div class="odo-plus" id="g3-plus">+</div></div>
          <div class="g3-label" id="g3-label"><span class="g3-book">{ICON["book"]}</span>PELAJAR BELAJAR MEMBACA</div>
        </div>
      </div>''')
pop_in("#g3-kicker", 7.48, 0.3, -10, 0.35)
pop_in("#g3-odo", 7.6, 0.6, 0, 0.4)
T('tl.fromTo("#g3-plus", {opacity: 0, scale: 0, rotation: -90}, {opacity: 1, scale: 1, rotation: 0, duration: 0.35, ease: "back.out(3)"}, 9.64);')
T('tl.fromTo("#g3-odo", {scale: 1}, {scale: 1.12, duration: 0.1, ease: "power2.out", yoyo: true, repeat: 1, immediateRender: false}, 9.64);')
T('tl.fromTo("#g3-rays", {opacity: 0, scale: 0.4, rotation: 0}, {opacity: 1, scale: 1, rotation: 25, duration: 0.5, ease: "power3.out"}, 9.6);')
T('tl.to("#g3-rays", {rotation: 60, duration: 0.85, ease: "none"}, 10.1);')
pop_in("#g3-label", 9.9, 0.4, 6, 0.4)
pop_out("#g3-wrap", 10.26)

# confetti burst at the drop (seeded)
rnd = random.Random(42)
conf = []
COLORS = ["#FFD23F", "#F7941D", "#E8262D", "#1E6FD9", "#7AC143", "#FFFFFF"]
for i in range(34):
    ang = rnd.uniform(-math.pi, 0) if i % 3 else rnd.uniform(-math.pi * 1.1, 0.1)
    sp = rnd.uniform(260, 620)
    vx, vy = math.cos(ang) * sp, math.sin(ang) * sp
    w, h = rnd.choice([(18, 30), (14, 14), (22, 12)])
    col = COLORS[i % len(COLORS)]
    br = "50%" if (w == h) else "4px"
    conf.append(f'<div class="cf" id="cf{i}" style="width:{w}px;height:{h}px;background:{col};border-radius:{br};"></div>')
    rot = rnd.uniform(-540, 540)
    T(f'tl.fromTo("#cf{i}", {{x: 0, y: 0, opacity: 1, rotation: 0, scale: 0.4}}, {{x: {vx:.0f}, y: {vy:.0f}, rotation: {rot:.0f}, scale: 1, duration: 0.7, ease: "power3.out"}}, 9.64);')
    T(f'tl.to("#cf{i}", {{y: {vy + 520:.0f}, x: {vx * 1.25:.0f}, opacity: 0, rotation: {rot * 1.6:.0f}, duration: 0.9, ease: "power1.in"}}, 10.34);')
html_layers.append(f'''      <div id="g3c" class="clip ov" data-start="9.6" data-duration="1.7" data-track-index="7">
        <div class="cf-origin">{"".join(conf)}</div>
      </div>''')

# ---- logo highlight (11.78 - 12.72) — hand-drawn loop around the real wall sign
html_layers.append(f'''      <div id="g3b" class="clip ov" data-start="11.76" data-duration="0.96" data-track-index="6">
        <svg class="logo-loop" viewBox="0 0 1080 1920"><path id="loop-path" d="M150 700 C 160 590, 520 560, 760 585 C 960 605, 985 700, 945 760 C 900 830, 560 845, 330 830 C 170 818, 120 760, 150 700 C 170 650, 300 610, 420 600" fill="none" stroke="#FFD23F" stroke-width="16" stroke-linecap="round"/></svg>
        {star("spark sp1")}{star("spark sp2")}{star("spark sp3")}
      </div>''')
T('(function(){var el=document.querySelector("#loop-path");if(el){var L=el.getTotalLength();tl.fromTo("#loop-path",{strokeDasharray:L,strokeDashoffset:L},{strokeDashoffset:0,duration:0.45,ease:"power2.inOut"},11.8);}})();')
for i, t in enumerate([11.95, 12.08, 12.2]):
    T(f'tl.fromTo("#g3b .sp{i + 1}", {{opacity: 0, scale: 0, rotation: 0}}, {{opacity: 1, scale: 1, rotation: 90, duration: 0.25, ease: "back.out(3)"}}, {t});')
    T(f'tl.to("#g3b .sp{i + 1}", {{opacity: 0, scale: 0.3, duration: 0.25}}, {round(t + 0.32, 2)});')
T('tl.to("#g3b .logo-loop", {opacity: 0, duration: 0.2}, 12.5);')

# ---- G4 PILIHAN JADUAL (12.72 - 15.18)
slots = []
for r in range(2):
    for cidx in range(4):
        new = (r, cidx) in [(0, 3), (1, 1), (1, 3)]
        sid = f"slot{r}{cidx}"
        if new:
            slots.append(f'<div class="slot slot-new" id="{sid}"><span>+</span></div>')
        else:
            slots.append(f'<div class="slot" id="{sid}"></div>')
html_layers.append(f'''      <div id="g4" class="clip ov" data-start="12.72" data-duration="2.48" data-track-index="6">
        <div class="card-top card-white" id="g4-card">
          <div class="g4-head"><div class="g4-cal" id="g4-cal">{ICON["cal"]}</div><div class="g4-title">PILIHAN<br><span class="hl-orange">JADUAL</span></div><div class="chip chip-red g4-badge" id="g4-badge">+ TAMBAH</div></div>
          <div class="slots">{"".join(slots)}</div>
        </div>
      </div>''')
pop_in("#g4-card", 12.75, 0.5, 6)
T('tl.fromTo("#g4-cal", {rotation: -20, scale: 0.4}, {rotation: 0, scale: 1, duration: 0.5, ease: "elastic.out(1, 0.5)"}, 12.85);')
for k, sid in enumerate(["slot03", "slot11", "slot13"]):
    pop_in(f"#{sid}", 13.70 + k * 0.16, 0.1, -30, 0.32)
pop_in("#g4-badge", 14.06, 0.2, 15, 0.35)
T('tl.fromTo("#g4-card .hl-orange", {scale: 1}, {scale: 1.12, duration: 0.14, ease: "power2.out", yoyo: true, repeat: 1, immediateRender: false}, 14.48);')
pop_out("#g4-card", 14.98)

# ---- G5a LEBIH RAMAI PELAJAR (15.22 - 17.28)
KID_COLORS = ["#1E6FD9", "#F7941D", "#7AC143", "#E8262D", "#9B5DE5"]
kids = "".join(f'<div class="kidw" id="kid{i}">{kid(c)}</div>' for i, c in enumerate(KID_COLORS))
html_layers.append(f'''      <div id="g5" class="clip ov" data-start="15.22" data-duration="2.08" data-track-index="6">
        <div class="card-top card-white" id="g5-card">
          <div class="g5-title">LEBIH <span class="hl-green">RAMAI</span> PELAJAR</div>
          <div class="kids">{kids}</div>
        </div>
      </div>''')
pop_in("#g5-card", 15.25, 0.5, -5)
for i in range(5):
    T(f'tl.fromTo("#kid{i}", {{opacity: 0, y: 80, scale: 0.3}}, {{opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "back.out(2.4)"}}, {q(15.95 + i * 0.12)});')
T('tl.fromTo(".kidw", {y: 0}, {y: -14, duration: 0.22, ease: "sine.out", yoyo: true, repeat: 1, stagger: 0.07, immediateRender: false}, 16.85);')
pop_out("#g5-card", 17.06)

# ---- G5b WAKTU YANG SESUAI (17.3 - 19.56)
html_layers.append(f'''      <div id="g6" class="clip ov" data-start="17.3" data-duration="2.28" data-track-index="6">
        <div class="card-top card-white g6-card" id="g6-card">
          <div class="g6-clock" id="g6-clock">{ICON["clock"]}</div>
          <div class="g6-text">WAKTU YANG<br><span class="hl-green">SESUAI</span></div>
          <svg class="g6-check" viewBox="0 0 140 140"><circle cx="70" cy="70" r="62" fill="#7AC143" stroke="{NAVY}" stroke-width="8" id="g6-check-bg"/><path id="g6-check" d="M38 72 L60 94 L104 46" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
      </div>''')
pop_in("#g6-card", 17.33, 0.5, 6)
T('tl.fromTo("#CLOCKHAND", {rotation: 0, transformOrigin: "50% 100%"}, {rotation: 720, duration: 1.6, ease: "power2.inOut"}, 17.4);')
T('tl.fromTo("#CLOCKHAND2", {rotation: 0, transformOrigin: "0% 50%"}, {rotation: 120, duration: 1.6, ease: "power2.inOut"}, 17.4);')
T('tl.fromTo("#g6-check-bg", {scale: 0, transformOrigin: "50% 50%"}, {scale: 1, duration: 0.3, ease: "back.out(2.5)"}, 19.05);')
T('(function(){var el=document.querySelector("#g6-check");if(el){var L=el.getTotalLength();tl.fromTo("#g6-check",{strokeDasharray:L,strokeDashoffset:L},{strokeDashoffset:0,duration:0.3,ease:"power2.out"},19.12);}})();')
pop_out("#g6-card", 19.36)

# ---- G6 JADUAL TAK SESUAI? (19.62 - 22.5)
html_layers.append(f'''      <div id="g7" class="clip ov" data-start="19.62" data-duration="2.9" data-track-index="6">
        <div class="card-top card-white g7-card" id="g7-card">
          <div class="g7-q">JADUAL <span class="hl-red">TAK SESUAI?</span></div>
          <div class="g7-slot" id="g7-slot"><span class="g7-ico">{ICON["clock"]}</span><span class="g7-bar"></span><span class="g7-bar short"></span><div class="g7-strike" id="g7-strike"></div></div>
          <div class="g7-x" id="g7-x"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" fill="#E8262D" stroke="{NAVY}" stroke-width="8"/><path d="M38 38 L82 82 M82 38 L38 82" stroke="#fff" stroke-width="15" stroke-linecap="round"/></svg></div>
        </div>
      </div>''')
pop_in("#g7-card", 19.66, 0.6, -4)
T('tl.fromTo("#g7-slot", {x: 0}, {x: 10, duration: 0.06, yoyo: true, repeat: 5, ease: "none", immediateRender: false}, 21.0);')
T('tl.fromTo("#g7-strike", {scaleX: 0, transformOrigin: "0% 50%"}, {scaleX: 1, duration: 0.25, ease: "power2.out"}, 21.69);')
T('tl.fromTo("#g7-x", {opacity: 0, scale: 2.4, rotation: -30}, {opacity: 1, scale: 1, rotation: 0, duration: 0.25, ease: "power4.out"}, 21.69);')
pop_out("#g7-card", 22.3)

# ---- G7 CTA (22.52 - 25.72)
html_layers.append(f'''      <div id="g8" class="clip ov" data-start="22.52" data-duration="3.2" data-track-index="6">
        <div class="cta-wrap" id="g8-wrap">
          <div class="cta-kicker" id="g8-kicker">JOM!</div>
          <div class="cta-btn" id="g8-btn"><span class="cta-shine" id="g8-shine"></span>SEMAK SLOT<br>SESI PETANG</div>
          <div class="ripple" id="g8-ripple"></div>
          <div class="cta-hand" id="g8-hand">{ICON["hand"]}</div>
          <div class="cta-now" id="g8-now">{burst("#FFD23F", 14, 100, 78)}<span>SEKARANG!</span></div>
        </div>
      </div>''')
pop_in("#g8-kicker", 22.56, 0.3, -15, 0.35)
pop_in("#g8-btn", 22.6, 0.4, 4, 0.45)
T('tl.fromTo("#g8-hand", {opacity: 0, x: 220, y: 260}, {opacity: 1, x: 0, y: 0, duration: 0.35, ease: "power3.out"}, 22.95);')
T('tl.to("#g8-hand", {scale: 0.85, y: 14, duration: 0.08, ease: "power2.in", yoyo: true, repeat: 1}, 23.32);')
T('tl.to("#g8-btn", {scale: 0.93, duration: 0.08, ease: "power2.in", yoyo: true, repeat: 1}, 23.36);')
T('tl.fromTo("#g8-ripple", {opacity: 0.9, scale: 0.2}, {opacity: 0, scale: 2.2, duration: 0.55, ease: "power2.out"}, 23.38);')
T('tl.fromTo("#g8-shine", {x: -520, rotation: 18}, {x: 760, rotation: 18, duration: 0.7, ease: "power2.inOut"}, 23.6);')
T('tl.fromTo("#g8-shine", {x: -520, rotation: 18}, {x: 760, rotation: 18, duration: 0.7, ease: "power2.inOut", immediateRender: false}, 24.5);')
bob("#g8-btn", 23.6, 25.0, 8, 0.7)
T('tl.fromTo("#g8-now", {opacity: 0, scale: 0.1, rotation: -30}, {opacity: 1, scale: 1, rotation: 8, duration: 0.35, ease: "back.out(2.6)"}, 25.12);')
T('tl.to("#g8-wrap", {opacity: 0, scale: 0.85, duration: 0.2, ease: "power2.in"}, 25.5);')

# ---- END CARD (25.705 - 28.6)
html_layers.append(f'''      <div id="g9" class="clip ov" data-start="{END_CARD}" data-duration="{tail_dur}" data-track-index="8">
        <div class="end-tint" id="end-tint"></div>
        <div class="end-wrap">
          <div class="end-mascot" id="end-mascot"><img src="assets/mascot.png" alt=""></div>
          <div class="wordmark" id="end-wm"><span class="wb">M</span><span class="wb">I<i class="dot"></i></span><span class="wb">N</span><span class="wb">D</span><span class="wo">A</span><span class="gap"></span><span class="wr">O</span><span class="wr">P</span><span class="wr">T</span><span class="wb">I<i class="dot"></i></span><span class="wb">M</span><span class="wb">A</span></div>
          <div class="end-tag" id="end-tag">Program Membaca Kanak-Kanak</div>
          <div class="end-head" id="end-head">SESI PETANG<br><span>KINI DIBUKA!</span></div>
          <div class="end-cta" id="end-cta">SEMAK SLOT SEKARANG</div>
        </div>
      </div>''')
E = END_CARD
T(f'tl.fromTo("#end-tint", {{opacity: 0}}, {{opacity: 1, duration: 0.4, ease: "power2.out"}}, {E});')
pop_in("#end-mascot", E + 0.12, 0.2, -20, 0.55)
T(f'tl.fromTo("#end-wm span", {{opacity: 0, y: 60, scale: 0.4}}, {{opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "back.out(2.5)", stagger: 0.035}}, {q(E + 0.35)});')
T(f'tl.fromTo("#end-tag", {{opacity: 0, y: 20}}, {{opacity: 1, y: 0, duration: 0.3, ease: "power2.out"}}, {q(E + 0.8)});')
pop_in("#end-head", E + 0.95, 0.5, -4, 0.45)
pop_in("#end-cta", E + 1.25, 0.4, 3, 0.45)
bob("#end-mascot", E + 0.8, TOTAL, 10, 1.2)
T(f'tl.fromTo("#end-cta", {{scale: 1}}, {{scale: 1.06, duration: 0.35, ease: "sine.inOut", yoyo: true, repeat: 3, immediateRender: false}}, {q(E + 1.75)});')

# ------------------------------------------------------------------ audio: SFX + music
SFX = [  # (file, transient time, onset offset, volume)
    ("impact-bass-1", 0.0, 0.0, 0.42),
    ("pop", 0.84, 0.11, 0.5),
    ("whoosh-short", 2.12, 0.16, 0.32),
    ("whoosh-short", 5.02, 0.16, 0.38),
    ("pop", 6.34, 0.11, 0.45),
    ("whoosh", 7.45, 0.16, 0.32),
    ("sparkle", 9.64, 0.09, 0.38),
    ("sparkle", 11.82, 0.09, 0.32),
    ("whoosh-short", 12.76, 0.16, 0.32),
    ("pop", 13.70, 0.11, 0.34), ("pop", 13.86, 0.11, 0.30), ("pop", 14.02, 0.11, 0.34),
    ("whoosh-short", 15.24, 0.16, 0.3),
    ("pop", 15.95, 0.11, 0.26), ("pop", 16.19, 0.11, 0.26), ("pop", 16.43, 0.11, 0.26),
    ("whoosh-short", 17.32, 0.16, 0.3),
    ("chime", 19.09, 0.41, 0.42),
    ("error", 21.69, 0.60, 0.26),
    ("whoosh", 22.52, 0.16, 0.38),
    ("click", 23.38, 0.04, 0.6),
    ("sparkle", 25.12, 0.09, 0.4),
    ("whoosh", END_CARD, 0.16, 0.42),
    ("chime", END_CARD + 0.95, 0.41, 0.4),
]
SFX_LEN = {"pop": 0.72, "whoosh": 0.57, "whoosh-short": 0.57, "impact-bass-1": 2.11, "sparkle": 1.8,
           "chime": 2.54, "error": 1.62, "click": 0.36}
audio_html = []
for i, (f, t, off, vol) in enumerate(SFX):
    st = max(0.0, round(t - off, 3))
    dur = round(min(SFX_LEN[f], TOTAL - st), 3)
    audio_html.append(f'      <audio id="sfx{i:02d}" src="assets/sfx/{f}.mp3" data-start="{st}" data-duration="{dur}" data-track-index="{20 + i}" data-volume="{vol}"></audio>')

# music ducking lane (clip-local time = composition time; music starts at 0)
UNDER = 0.19
lane = [(0, 0.55), (0.17, UNDER + 0.06), (1.55, UNDER + 0.06), (1.62, UNDER), (9.55, UNDER), (9.64, UNDER + 0.07), (10.1, UNDER + 0.07), (10.4, UNDER), (19.6, UNDER), (19.75, UNDER + 0.05),
        (22.4, UNDER + 0.05), (22.55, UNDER), (END_CARD - 0.12, UNDER), (END_CARD + 0.08, 0.78), (27.9, 0.78), (TOTAL, 0.0)]
lane_json = json.dumps({"version": 1, "lanes": [{"target": "volume", "points": [{"t": round(a, 3), "v": round(b, 3)} for a, b in lane]}]})
audio_html.append(f'''      <audio id="music" src="assets/music.wav" data-start="0" data-duration="{TOTAL}" data-track-index="19" data-volume="1" data-automation='{lane_json}'></audio>''')

# ------------------------------------------------------------------ CSS
def outline(px, color, steps=16):
    sh = []
    for i in range(steps):
        a = 2 * math.pi * i / steps
        sh.append(f"{px * math.cos(a):.1f}px {px * math.sin(a):.1f}px 0 {color}")
    return ", ".join(sh)


CAP_SHADOW = outline(6, NAVY) + f", 0 10px 0 {NAVY}, 0 14px 24px rgba(0,0,0,0.35)"
TITLE_SHADOW = outline(7, NAVY) + f", 0 12px 0 {NAVY}, 0 18px 30px rgba(0,0,0,0.3)"

CSS = f"""
      @font-face {{ font-family: "Baloo 2"; src: url("assets/fonts/baloo-2-latin-700-normal.woff2") format("woff2"); font-weight: 700; font-display: block; }}
      @font-face {{ font-family: "Inter"; src: url("assets/fonts/inter-latin-800-normal.woff2") format("woff2"); font-weight: 800; font-display: block; }}
      @font-face {{ font-family: "Inter"; src: url("assets/fonts/inter-latin-900-normal.woff2") format("woff2"); font-weight: 900; font-display: block; }}
      * {{ box-sizing: border-box; }}
      html, body {{ margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #000;
        font-family: "Baloo 2", "Inter", sans-serif; }}
      #root {{ position: relative; width: 100%; height: 100%; overflow: hidden; background: #000; }}
      #cam {{ position: absolute; inset: 0; overflow: hidden; }}
      .shot {{ position: absolute; inset: 0; overflow: hidden; }}
      .inner {{ position: absolute; inset: 0; transform-origin: 540px 1000px; }}
      .inner video {{ position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; object-fit: cover; }}
      #vignette {{ position: absolute; inset: 0; pointer-events: none;
        background: radial-gradient(ellipse 75% 60% at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%); }}
      #flash {{ position: absolute; inset: 0; background: #fff; opacity: 0; pointer-events: none; }}
      .ov {{ position: absolute; inset: 0; pointer-events: none; }}

      /* captions */
      .cap {{ position: absolute; left: 50px; right: 50px; top: 1238px; display: flex; flex-wrap: wrap; justify-content: center;
        align-items: center; gap: 4px 20px; font-family: "Baloo 2"; font-weight: 700; font-size: 88px; line-height: 1.04;
        color: #fff; letter-spacing: 1px; }}
      .cap .w {{ display: inline-block; padding: 8px 6px 0; text-shadow: {CAP_SHADOW}; }}
      .cap .kw {{ padding: 10px 22px 2px; border-radius: 22px; border: 6px solid {NAVY}; box-shadow: 0 10px 0 {NAVY};
        text-shadow: 0 5px 0 rgba(11,42,91,0.55); color: #fff; }}
      .kw-blue {{ background: #1E6FD9; }} .kw-orange {{ background: #F7941D; }} .kw-green {{ background: #3FA535; }}
      .kw-red {{ background: #E8262D; }} .kw-yellow {{ background: #FFD23F; color: {NAVY} !important; text-shadow: none !important; }}

      /* shared card bits */
      .card-top {{ position: absolute; left: 70px; right: 70px; top: 205px; display: flex; flex-direction: column; align-items: center; }}
      .card-white {{ background: #fff; border: 8px solid {NAVY}; border-radius: 48px; box-shadow: 0 16px 0 {NAVY}, 0 24px 50px rgba(0,0,0,0.3);
        padding: 34px 40px 40px; }}
      .chip {{ display: inline-flex; align-items: center; gap: 14px; font-family: "Inter"; font-weight: 900; font-size: 46px; letter-spacing: 2px;
        padding: 12px 30px; border-radius: 999px; border: 6px solid {NAVY}; box-shadow: 0 8px 0 {NAVY}; color: #fff; }}
      .chip-red {{ background: #E8262D; }} .chip-blue {{ background: #1E6FD9; }} .chip-yellow {{ background: #FFD23F; color: {NAVY}; }}
      .chip-lg {{ font-size: 56px; padding: 14px 38px; }}
      .chip-ico svg {{ width: 40px; height: 54px; display: block; }}
      .ico {{ width: 100%; height: 100%; display: block; overflow: visible; }}
      .title-xl {{ font-family: "Baloo 2"; font-weight: 700; font-size: 150px; line-height: 0.88; color: #FFD23F; text-shadow: {TITLE_SHADOW};
        text-align: left; padding-top: 18px; }}
      .hl-orange {{ color: #F7941D; display: inline-block; }} .hl-green {{ color: #3FA535; }} .hl-red {{ color: #E8262D; }}

      /* G1 hook */
      .hook {{ position: absolute; left: 0; right: 0; top: 200px; display: flex; flex-direction: column; align-items: center; }}
      .hook-row {{ display: flex; align-items: center; gap: 18px; }}
      .hook-bell {{ width: 120px; height: 120px; transform-origin: 50% 10%; }}
      .hook-l1 {{ font-family: "Baloo 2"; font-weight: 700; font-size: 92px; color: #fff; background: #1E6FD9; padding: 14px 34px 4px;
        border-radius: 28px; border: 7px solid {NAVY}; box-shadow: 0 12px 0 {NAVY}; letter-spacing: 1px; }}
      .hook-l2 {{ margin-top: 18px; font-family: "Baloo 2"; font-weight: 700; font-size: 196px; line-height: 0.95; color: #FFD23F;
        text-shadow: {outline(9, NAVY)}, 0 16px 0 {NAVY}, 0 24px 40px rgba(0,0,0,0.35); letter-spacing: 2px; }}
      .ting {{ position: absolute; width: 250px; height: 250px; display: flex; align-items: center; justify-content: center; opacity: 0; }}
      .ting .burst {{ position: absolute; inset: 0; width: 100%; height: 100%; }}
      .ting span {{ position: relative; font-family: "Baloo 2"; font-weight: 700; font-size: 62px; color: {NAVY}; transform: rotate(-8deg); }}

      /* G2 */
      .g2-row {{ display: flex; align-items: center; gap: 22px; margin: 20px 0 18px; }}
      .g2-sun {{ width: 230px; height: 230px; }}
      #g2-chip2 {{ margin-top: 6px; }}

      /* G3 odometer */
      .g3-wrap {{ position: absolute; left: 0; right: 0; top: 190px; display: flex; flex-direction: column; align-items: center; }}
      .g3-rays {{ position: absolute; top: 40px; left: 50%; width: 1100px; height: 1100px; margin-left: -550px; margin-top: -250px; opacity: 0;
        background: repeating-conic-gradient(from 0deg, rgba(255,210,63,0.55) 0deg 9deg, rgba(255,210,63,0) 9deg 22deg);
        -webkit-mask: radial-gradient(circle, #000 18%, rgba(0,0,0,0) 62%); mask: radial-gradient(circle, #000 18%, rgba(0,0,0,0) 62%); }}
      .odo {{ position: relative; display: flex; align-items: flex-start; margin-top: 18px; font-family: "Baloo 2"; font-weight: 700; font-size: 250px;
        line-height: 250px; color: #fff; text-shadow: {outline(9, NAVY)}, 0 16px 0 #1E6FD9, 0 22px 0 {NAVY}; }}
      .odo-col {{ height: 250px; width: 156px; overflow: hidden; padding: 0; -webkit-mask-image: linear-gradient(180deg, transparent 0%, #000 13%, #000 87%, transparent 100%); mask-image: linear-gradient(180deg, transparent 0%, #000 13%, #000 87%, transparent 100%); }}
      .odo-strip div {{ height: 250px; text-align: center; }}
      .odo-comma {{ width: 56px; text-align: center; }}
      .odo-plus {{ width: 140px; text-align: center; color: #FFD23F; }}
      .g3-label {{ display: flex; align-items: center; gap: 18px; margin-top: 40px; font-family: "Baloo 2"; font-weight: 700; font-size: 66px; color: {NAVY};
        background: #fff; border: 7px solid {NAVY}; border-radius: 999px; padding: 14px 40px 6px 26px; box-shadow: 0 10px 0 {NAVY}; }}
      .g3-book {{ width: 100px; height: 80px; display: block; }}
      .cf-origin {{ position: absolute; left: 540px; top: 520px; width: 0; height: 0; }}
      .cf {{ position: absolute; left: 0; top: 0; opacity: 0; }}

      /* logo loop */
      .logo-loop {{ position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; overflow: visible; }}
      .spark {{ position: absolute; width: 90px; height: 90px; opacity: 0; }}
      .sp1 {{ left: 110px; top: 560px; }} .sp2 {{ left: 900px; top: 540px; width: 70px; height: 70px; }} .sp3 {{ left: 830px; top: 800px; width: 60px; height: 60px; }}

      /* G4 slots */
      .g4-head {{ display: flex; align-items: center; gap: 26px; width: 100%; }}
      .g4-cal {{ width: 150px; height: 150px; flex: none; }}
      .g4-title {{ font-family: "Baloo 2"; font-weight: 700; font-size: 104px; line-height: 0.9; color: {NAVY}; padding-top: 14px; }}
      .g4-badge {{ margin-left: auto; font-size: 38px; padding: 10px 24px; white-space: nowrap; flex: none; transform-origin: 50% 50%; }}
      .slots {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 22px; width: 100%; margin-top: 30px; }}
      .slot {{ height: 96px; border-radius: 24px; background: #E9EEF6; border: 5px solid #C9D3E3; }}
      .slot-new {{ background: #F7941D; border: 6px solid {NAVY}; box-shadow: 0 8px 0 {NAVY}; display: flex; align-items: center; justify-content: center; }}
      .slot-new span {{ font-family: "Inter"; font-weight: 900; font-size: 70px; color: #fff; line-height: 1; }}

      /* G5 kids */
      .g5-title {{ font-family: "Baloo 2"; font-weight: 700; font-size: 92px; line-height: 1; color: {NAVY}; text-align: center; padding-top: 8px; }}
      .kids {{ display: flex; justify-content: center; gap: 14px; margin-top: 22px; }}
      .kidw {{ width: 150px; height: 180px; }}
      .kid {{ width: 100%; height: 100%; display: block; }}

      /* G6 clock + check */
      .g6-card {{ flex-direction: row; justify-content: space-between; align-items: center; gap: 20px; }}
      .g6-clock {{ width: 190px; height: 190px; flex: none; }}
      .g6-text {{ font-family: "Baloo 2"; font-weight: 700; font-size: 96px; line-height: 0.92; color: {NAVY}; padding-top: 16px; flex: 1; text-align: center; }}
      .g6-text .hl-green {{ font-size: 124px; }}
      .g6-check {{ width: 150px; height: 150px; flex: none; overflow: visible; }}

      /* G7 problem */
      .g7-q {{ font-family: "Baloo 2"; font-weight: 700; font-size: 96px; line-height: 1; color: {NAVY}; text-align: center; padding-top: 10px; }}
      .g7-slot {{ position: relative; display: flex; align-items: center; gap: 24px; margin-top: 26px; width: 640px; height: 130px; background: #EEF1F6;
        border: 6px solid #B8C2D3; border-radius: 30px; padding: 0 30px; }}
      .g7-ico {{ width: 84px; height: 84px; flex: none; }}
      .g7-bar {{ display: block; height: 30px; width: 280px; border-radius: 15px; background: #B8C2D3; }}
      .g7-bar.short {{ width: 120px; }}
      .g7-strike {{ position: absolute; left: 20px; right: 20px; top: 56px; height: 14px; border-radius: 7px; background: #E8262D; }}
      .g7-x {{ position: absolute; right: 70px; bottom: 34px; width: 150px; height: 150px; opacity: 0; }}
      .g7-x svg {{ width: 100%; height: 100%; display: block; }}

      /* G8 CTA */
      .cta-wrap {{ position: absolute; left: 0; right: 0; top: 230px; display: flex; flex-direction: column; align-items: center; }}
      .cta-kicker {{ font-family: "Baloo 2"; font-weight: 700; font-size: 110px; color: #FFD23F; text-shadow: {TITLE_SHADOW}; transform-origin: 50% 80%; }}
      .cta-btn {{ position: relative; overflow: hidden; margin-top: 10px; font-family: "Baloo 2"; font-weight: 700; font-size: 104px; line-height: 0.95;
        text-align: center; color: #fff; padding: 40px 70px 26px; border-radius: 60px; border: 9px solid {NAVY};
        background: linear-gradient(180deg, #FFA93A 0%, #F7941D 55%, #E9760C 100%); box-shadow: 0 18px 0 {NAVY}, 0 30px 50px rgba(0,0,0,0.35);
        text-shadow: 0 6px 0 rgba(11,42,91,0.6); }}
      .cta-shine {{ position: absolute; top: -40px; left: 0; width: 120px; height: 400px; background: rgba(255,255,255,0.45); }}
      .ripple {{ position: absolute; left: 850px; top: 420px; width: 220px; height: 220px; margin: -110px 0 0 -110px; border-radius: 50%;
        border: 12px solid #fff; opacity: 0; }}
      .cta-hand {{ position: absolute; left: 820px; top: 400px; width: 170px; height: 200px; opacity: 0; transform-origin: 30% 10%; }}
      .cta-now {{ position: absolute; left: 700px; top: -60px; width: 350px; height: 350px; display: flex; align-items: center;
        justify-content: center; opacity: 0; }}
      .cta-now .burst {{ position: absolute; inset: 0; width: 100%; height: 100%; }}
      .cta-now span {{ position: relative; font-family: "Baloo 2"; font-weight: 700; font-size: 50px; color: #E8262D; transform: rotate(-6deg);
        text-shadow: 0 5px 0 rgba(11,42,91,0.35); }}

      /* END card */
      .end-tint {{ position: absolute; inset: 0; opacity: 0; background: linear-gradient(180deg, rgba(14,52,120,0.82) 0%, rgba(30,111,217,0.55) 45%, rgba(11,42,91,0.88) 100%); }}
      .end-wrap {{ position: absolute; left: 0; right: 0; top: 250px; display: flex; flex-direction: column; align-items: center; }}
      .end-mascot {{ width: 420px; height: 420px; border-radius: 50%; background: #fff; border: 10px solid #FFD23F; overflow: hidden;
        box-shadow: 0 18px 0 {NAVY}, 0 30px 60px rgba(0,0,0,0.4); }}
      .end-mascot img {{ width: 100%; height: 100%; object-fit: cover; object-position: 50% 30%; display: block; }}
      .wordmark {{ display: flex; align-items: flex-end; margin-top: 46px; background: #fff; border: 8px solid {NAVY}; border-radius: 999px;
        padding: 18px 54px 4px; box-shadow: 0 14px 0 {NAVY}; font-family: "Baloo 2"; font-weight: 700; font-size: 124px; line-height: 1; }}
      .wordmark span {{ display: inline-block; position: relative; }}
      .wordmark .gap {{ width: 22px; }}
      .wb {{ color: #1E6FD9; }} .wo {{ color: #F7941D; }} .wr {{ color: #E8262D; }}
      .wordmark .dot {{ position: absolute; left: 50%; top: 12px; width: 22px; height: 22px; margin-left: -11px; border-radius: 50%; background: #E8262D; }}
      .end-tag {{ margin-top: 34px; font-family: "Inter"; font-weight: 800; font-size: 44px; color: #fff; letter-spacing: 1px; opacity: 0.95; }}
      .end-head {{ margin-top: 40px; font-family: "Baloo 2"; font-weight: 700; font-size: 118px; line-height: 0.92; color: #fff; text-align: center;
        text-shadow: {TITLE_SHADOW}; }}
      .end-head span {{ color: #FFD23F; }}
      .end-cta {{ margin-top: 48px; font-family: "Baloo 2"; font-weight: 700; font-size: 72px; color: {NAVY}; background: #FFD23F; padding: 22px 56px 10px;
        border-radius: 999px; border: 8px solid {NAVY}; box-shadow: 0 12px 0 {NAVY}; }}
"""

HTML = f"""<!doctype html>
<html lang="ms">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>Minda Optima - Sesi Petang</title>
    <style>{CSS}    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-width="1080" data-height="1920" data-duration="{TOTAL}" data-fps="{FPS}">
      <div id="cam">
{chr(10).join(video_html)}
      </div>
      <div id="vignette"></div>
{chr(10).join(html_layers)}
{chr(10).join(cap_html)}
      <div id="flash"></div>
{chr(10).join(audio_html)}
    </div>
    <script src="vendor/gsap.min.js"></script>
    <script>
      (function () {{
        const tl = gsap.timeline({{ paused: true }});
        {chr(10).join("        " + s for s in js).strip()}
        window.__timelines = window.__timelines || {{}};
        window.__timelines["main"] = tl;
      }})();
    </script>
  </body>
</html>
"""
open(f"{ROOT}/project/index.html", "w").write(HTML)
print("wrote index.html;", len(js), "tweens;", len(CLIPS), "clips; total", TOTAL)
