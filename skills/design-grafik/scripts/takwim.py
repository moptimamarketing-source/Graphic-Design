#!/usr/bin/env python3
"""
takwim.py — jana takwim (kalendar) Minda Optima sebagai HTML, kemudian render dengan render.py.

  # takwim satu bulan (ig-post / a4)
  python takwim.py bulan  --tahun 2026 --bulan 11 --acara acara.json --out nov.html
  # takwim setahun (a4-landscape paling sesuai)
  python takwim.py tahun  --tahun 2027 --acara acara.json --out takwim-2027.html
  # senarai tarikh "minggu ke-5" (hari yang muncul kali ke-5 dalam sebulan)
  python takwim.py minggu5 --tahun 2026 --hari sabtu,ahad

Fail acara.json (senarai):
  [
    {"tarikh": "2026-11-08", "label": "Deepavali", "jenis": "cuti"},
    {"tarikh": "2026-12-05", "hingga": "2026-12-31", "label": "Cuti sekolah", "jenis": "cuti-sekolah"},
    {"tarikh": "2026-11-21", "label": "Hari Terbuka", "jenis": "aktiviti"}
  ]
Jenis: cuti · cuti-sekolah · tiada-kelas · kelas-ganti · aktiviti · penting

PENTING: tarikh cuti umum & cuti sekolah mesti dari sumber rasmi (KPM / kerajaan negeri).
Jangan agak. Cuti Islam bergantung pada pengisytiharan — tandakan "(tertakluk)" kalau belum sah.
"""

import argparse
import calendar
import datetime as dt
import html
import json
import sys

BULAN = ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September",
         "Oktober", "November", "Disember"]
HARI = ["isnin", "selasa", "rabu", "khamis", "jumaat", "sabtu", "ahad"]
HARI_PENDEK = ["Isn", "Sel", "Rab", "Kha", "Jum", "Sab", "Ahd"]

JENIS = {  # warna latar, warna teks, label legenda
    "cuti": ("#FEE2E2", "#B91C1C", "Cuti umum"),
    "cuti-sekolah": ("#FEF3C7", "#92400E", "Cuti sekolah"),
    "tiada-kelas": ("#E5E7EB", "#374151", "Tiada kelas"),
    "kelas-ganti": ("#DCFCE7", "#166534", "Kelas ganti"),
    "aktiviti": ("#DBEAFE", "#1E40AF", "Aktiviti"),
    "penting": ("#F3E8FF", "#6B21A8", "Tarikh penting"),
}
MINGGU5 = ("#FFEDD5", "#C2410C", "Minggu ke-5")


def load_acara(path):
    if not path:
        return []
    with open(path, encoding="utf-8") as f:
        items = json.load(f)
    out = []
    for it in items:
        try:
            a = dt.date.fromisoformat(it["tarikh"])
            b = dt.date.fromisoformat(it.get("hingga", it["tarikh"]))
        except (KeyError, ValueError) as e:
            sys.exit(f"Acara tak sah {it}: {e}. Format tarikh YYYY-MM-DD.")
        j = it.get("jenis", "penting")
        if j not in JENIS:
            sys.exit(f"Jenis '{j}' tak dikenali. Guna: {', '.join(JENIS)}")
        out.append({"a": a, "b": b, "label": it.get("label", ""), "jenis": j})
    return out


def day_map(acara):
    m = {}
    for e in acara:
        d = e["a"]
        while d <= e["b"]:
            m.setdefault(d, []).append(e)
            d += dt.timedelta(days=1)
    return m


def is_minggu5(d):
    return (d.day - 1) // 7 == 4


def weeks(year, month, start):
    cal = calendar.Calendar(firstweekday=0 if start == "isnin" else 6)
    return cal.monthdatescalendar(year, month)


def head_names(start):
    return HARI_PENDEK if start == "isnin" else HARI_PENDEK[-1:] + HARI_PENDEK[:-1]


def fmt_range(e):
    if e["a"] == e["b"]:
        return f"{e['a'].day} {BULAN[e['a'].month - 1][:3]}"
    if e["a"].month == e["b"].month:
        return f"{e['a'].day}–{e['b'].day} {BULAN[e['a'].month - 1][:3]}"
    return f"{e['a'].day} {BULAN[e['a'].month - 1][:3]} – {e['b'].day} {BULAN[e['b'].month - 1][:3]}"


CSS = """
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  @page { margin: 0; }
  :root { --u: calc(100vw / 1080); --brand: %(brand)s; --brand-dark: %(brand_dark)s; --ink: #0F172A; --muted: #64748B; --line: #E2E8F0;
          --font: "Poppins", "Inter", "Segoe UI", Arial, sans-serif; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100vw; height: 100vh; overflow: hidden; }
  body { font-family: var(--font); color: var(--ink); background: #fff; display: flex; flex-direction: column; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  header { background: var(--brand-dark); color: #fff; padding: calc(var(--u)*48) calc(var(--u)*64) calc(var(--u)*40); display: flex; justify-content: space-between; align-items: flex-end; }
  header .t { font-size: calc(var(--u)*24); letter-spacing: .2em; opacity: .8; font-weight: 600; }
  header h1 { font-size: calc(var(--u)*84); font-weight: 800; line-height: 1; margin-top: calc(var(--u)*10); }
  header .y { font-size: calc(var(--u)*40); font-weight: 600; opacity: .85; }
  header .logo { height: calc(var(--u)*60); }
  .wordmark { font-weight: 800; font-size: calc(var(--u)*26); letter-spacing: .06em; }
  .legend { display: flex; flex-wrap: wrap; gap: calc(var(--u)*14) calc(var(--u)*26); padding: calc(var(--u)*24) calc(var(--u)*64) 0; font-size: calc(var(--u)*20); color: var(--muted); }
  .legend span { display: inline-flex; align-items: center; gap: calc(var(--u)*8); }
  .legend i { width: calc(var(--u)*22); height: calc(var(--u)*22); border-radius: calc(var(--u)*6); display: inline-block; }
  footer { margin-top: auto; padding: calc(var(--u)*20) calc(var(--u)*64) calc(var(--u)*30); font-size: calc(var(--u)*18); color: var(--muted); display: flex; justify-content: space-between; }
</style>
"""

MONTH_CSS = """
<style>
  .grid { margin: calc(var(--u)*24) calc(var(--u)*64) 0; display: grid; grid-template-columns: repeat(7, 1fr); gap: calc(var(--u)*8); }
  .dh { text-align: center; font-weight: 700; font-size: calc(var(--u)*22); color: var(--muted); padding-bottom: calc(var(--u)*6); }
  .dh.we { color: #B91C1C; }
  .c { min-height: calc(var(--u)*118); border-radius: calc(var(--u)*14); background: #F8FAFC; padding: calc(var(--u)*10) calc(var(--u)*10); display: flex; flex-direction: column; gap: calc(var(--u)*4); position: relative; }
  .c.out { background: transparent; }
  .c .n { font-weight: 700; font-size: calc(var(--u)*28); }
  .c.out .n { color: #CBD5E1; font-weight: 500; }
  .c .l { font-size: calc(var(--u)*15); line-height: 1.2; font-weight: 600; }
  .c .m5 { position: absolute; top: calc(var(--u)*10); right: calc(var(--u)*10); font-size: calc(var(--u)*14); font-weight: 800; color: %(m5)s; }
  .list { margin: calc(var(--u)*26) calc(var(--u)*64) 0; display: grid; grid-template-columns: 1fr 1fr; gap: calc(var(--u)*10) calc(var(--u)*30); font-size: calc(var(--u)*22); }
  .list div { display: flex; gap: calc(var(--u)*12); align-items: baseline; }
  .list b { flex: 0 0 calc(var(--u)*170); white-space: nowrap; }
  .list i { width: calc(var(--u)*14); height: calc(var(--u)*14); border-radius: 50%%; display: inline-block; flex: 0 0 auto; }
</style>
"""

YEAR_CSS = """
<style>
  header { padding: calc(var(--u)*30) calc(var(--u)*48) calc(var(--u)*26); }
  header h1 { font-size: calc(var(--u)*54); }
  .legend { padding: calc(var(--u)*16) calc(var(--u)*48) 0; font-size: calc(var(--u)*16); }
  .legend i { width: calc(var(--u)*16); height: calc(var(--u)*16); }
  footer { padding: calc(var(--u)*12) calc(var(--u)*48) calc(var(--u)*18); font-size: calc(var(--u)*14); }
  .months { margin: calc(var(--u)*20) calc(var(--u)*48) 0; display: grid; grid-template-columns: repeat(%(cols)d, 1fr); gap: calc(var(--u)*20) calc(var(--u)*22); }
  .mo h3 { font-size: calc(var(--u)*19); font-weight: 800; color: var(--brand-dark); margin-bottom: calc(var(--u)*6); }
  .mg { display: grid; grid-template-columns: repeat(7, 1fr); gap: calc(var(--u)*3); }
  .mg div { text-align: center; font-size: calc(var(--u)*12.5); line-height: calc(var(--u)*%(lh)d); border-radius: calc(var(--u)*5); font-weight: 600; }
  .mg .dh { color: var(--muted); font-weight: 700; font-size: calc(var(--u)*11); }
  .mg .o { visibility: hidden; }
  .ev { margin: calc(var(--u)*18) calc(var(--u)*48) 0; columns: %(evcols)d; column-gap: calc(var(--u)*30); font-size: calc(var(--u)*14); line-height: 1.55; }
  .ev div { break-inside: avoid; }
  .ev i { margin-right: calc(var(--u)*8); }
  .ev b { white-space: nowrap; margin-right: calc(var(--u)*6); }
  .ev i { width: calc(var(--u)*11); height: calc(var(--u)*11); border-radius: 50%%; display: inline-block; flex: 0 0 auto; }
</style>
"""


def legend(used, m5):
    items = [JENIS[j] for j in JENIS if j in used]
    if m5:
        items.append(MINGGU5)
    return '<div class="legend">' + "".join(
        f'<span><i style="background:{bg};outline:1px solid {fg}33"></i>{lab}</span>' for bg, fg, lab in items) + "</div>"


def page(title_small, title, year_txt, body, a):
    css = CSS % {"brand": a.brand, "brand_dark": a.brand_dark}
    logo = (f'<img class="logo" src="{html.escape(a.logo)}" alt="" onerror="this.outerHTML=\'<span class=wordmark>MINDA OPTIMA</span>\'">'
            if a.logo else '<span class="wordmark">MINDA OPTIMA</span>')
    note = html.escape(a.nota) if a.nota else "Tarikh tertakluk kepada pengumuman rasmi."
    return (f'<!doctype html><html lang="ms"><head><meta charset="utf-8">{css}{body[0]}</head><body>'
            f'<header><div><div class="t">{html.escape(title_small)}</div><h1>{html.escape(title)}</h1></div>'
            f'<div style="text-align:right">{logo}<div class="y">{year_txt}</div></div></header>'
            f'{body[1]}<footer><span>{note}</span><span>Minda Optima</span></footer></body></html>')


def cmd_bulan(a):
    acara = load_acara(a.acara)
    dm = day_map(acara)
    y, mth = a.tahun, a.bulan
    names = head_names(a.mula)
    cells = "".join(f'<div class="dh{" we" if n in ("Sab", "Ahd") else ""}">{n}</div>' for n in names)
    used, m5_used = set(), False
    for wk in weeks(y, mth, a.mula):
        for d in wk:
            if d.month != mth:
                cells += f'<div class="c out"><span class="n">{d.day}</span></div>'
                continue
            evs = dm.get(d, [])
            style, labels = "", ""
            if evs:
                bg, fg, _ = JENIS[evs[0]["jenis"]]
                style = f' style="background:{bg};color:{fg}"'
                labels = "".join(f'<span class="l">{html.escape(e["label"])}</span>' for e in evs[:2]
                                 if e["a"] == d or d.weekday() == (0 if a.mula == "isnin" else 6))
                used.update(e["jenis"] for e in evs)
            elif a.tanda_minggu5 and is_minggu5(d):
                style = f' style="background:{MINGGU5[0]};color:{MINGGU5[1]}"'
            m5 = ""
            if a.tanda_minggu5 and is_minggu5(d):
                m5 = '<span class="m5">M5</span>'
                m5_used = True
            cells += f'<div class="c"{style}><span class="n">{d.day}</span>{labels}{m5}</div>'
    month_ev = sorted([e for e in acara if e["a"].month == mth and e["a"].year == y
                       or e["b"].month == mth and e["b"].year == y], key=lambda e: e["a"])
    lst = "".join(f'<div><i style="background:{JENIS[e["jenis"]][1]}"></i><b>{fmt_range(e)}</b>'
                  f'<span>{html.escape(e["label"])}</span></div>' for e in month_ev)
    body = (MONTH_CSS % {"m5": MINGGU5[1]},
            legend(used, m5_used) + f'<div class="grid">{cells}</div>' + (f'<div class="list">{lst}</div>' if lst else ""))
    out = page(a.tajuk or "TAKWIM", BULAN[mth - 1], str(y), body, a)
    write(a.out, out)


def cmd_tahun(a):
    acara = load_acara(a.acara)
    dm = day_map(acara)
    y = a.tahun
    names = head_names(a.mula)
    used, m5_used = set(), False
    blocks = ""
    for mth in range(1, 13):
        g = "".join(f'<div class="dh">{n[0]}</div>' for n in names)
        for wk in weeks(y, mth, a.mula):
            for d in wk:
                if d.month != mth:
                    g += '<div class="o">.</div>'
                    continue
                evs = dm.get(d, [])
                st = ""
                if evs:
                    bg, fg, _ = JENIS[evs[0]["jenis"]]
                    st = f' style="background:{bg};color:{fg}"'
                    used.update(e["jenis"] for e in evs)
                elif a.tanda_minggu5 and is_minggu5(d):
                    st = f' style="background:{MINGGU5[0]};color:{MINGGU5[1]}"'
                    m5_used = True
                elif d.weekday() >= 5:
                    st = ' style="color:#B91C1C"'
                g += f"<div{st}>{d.day}</div>"
        blocks += f'<div class="mo"><h3>{BULAN[mth - 1]}</h3><div class="mg">{g}</div></div>'
    evs = sorted([e for e in acara if e["a"].year == y or e["b"].year == y], key=lambda e: e["a"])
    lst = "".join(f'<div><i style="background:{JENIS[e["jenis"]][1]}"></i><b>{fmt_range(e)}</b>'
                  f'<span>{html.escape(e["label"])}</span></div>' for e in evs)
    cols = a.kolum
    body = (YEAR_CSS % {"cols": cols, "evcols": 4 if cols >= 6 else 3, "lh": 18 if cols >= 6 else 21},
            legend(used, m5_used) + f'<div class="months">{blocks}</div>' + (f'<div class="ev">{lst}</div>' if lst else ""))
    out = page(a.tajuk or "TAKWIM TAHUNAN", f"Takwim {y}", "", body, a)
    write(a.out, out)


def cmd_minggu5(a):
    hari = [h.strip().lower() for h in a.hari.split(",")] if a.hari else HARI
    for h in hari:
        if h not in HARI:
            sys.exit(f"Hari '{h}' tak dikenali. Guna: {', '.join(HARI)}")
    print(f"Hari yang muncul kali ke-5 dalam bulan — {a.tahun}")
    for mth in range(1, 13):
        n = calendar.monthrange(a.tahun, mth)[1]
        found = []
        for day in range(29, n + 1):
            d = dt.date(a.tahun, mth, day)
            if HARI[d.weekday()] in hari:
                found.append(f"{HARI[d.weekday()].capitalize()} {day}")
        print(f"  {BULAN[mth - 1]:<10} " + (", ".join(found) if found else "—"))


def write(path, text):
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"SIAP: {path}  (render dengan render.py)")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawTextHelpFormatter)
    sp = ap.add_subparsers(dest="cmd", required=True)
    common = argparse.ArgumentParser(add_help=False)
    common.add_argument("--tahun", type=int, required=True)
    common.add_argument("--acara", help="fail JSON senarai acara")
    common.add_argument("--out", required=True)
    common.add_argument("--mula", choices=["isnin", "ahad"], default="isnin", help="hari pertama minggu")
    common.add_argument("--tanda-minggu5", action="store_true", help="tanda hari minggu ke-5")
    common.add_argument("--tajuk", help="teks kecil atas tajuk, contoh 'TAKWIM KELAS'")
    common.add_argument("--nota", help="nota kaki")
    common.add_argument("--logo", help="fail logo (versi putih paling sesuai)")
    common.add_argument("--brand", default="#1D4ED8")
    common.add_argument("--brand-dark", default="#1E3A8A")

    p = sp.add_parser("bulan", parents=[common])
    p.add_argument("--bulan", type=int, required=True)
    p.set_defaults(fn=cmd_bulan)
    p = sp.add_parser("tahun", parents=[common])
    p.add_argument("--kolum", type=int, default=6, help="6 untuk a4-landscape, 3 atau 4 untuk a4 menegak")
    p.set_defaults(fn=cmd_tahun)
    p = sp.add_parser("minggu5")
    p.add_argument("--tahun", type=int, required=True)
    p.add_argument("--hari", help="contoh: sabtu,ahad (default semua hari)")
    p.set_defaults(fn=cmd_minggu5)
    a = ap.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()
