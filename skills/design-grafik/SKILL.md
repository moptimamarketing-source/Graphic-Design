---
name: design-grafik
description: "Hasilkan design grafik siap guna (PNG/JPG/PDF) untuk Minda Optima: poster iklan / ads, poster perayaan (Raya, Merdeka, CNY, Deepavali, dll.), notis & pemberitahuan ibu bapa, notis minggu ke-5, takwim bulanan/tahunan, poster pakej yuran, poster program cuti sekolah, carousel Instagram, dan semakan design. Gunakan bila staf sebut \"poster\", \"buat design\", \"grafik\", \"banner\", \"flyer\", \"iklan poster\", \"ads FB\", \"notis\", \"pemberitahuan\", \"notis cuti\", \"minggu ke-5\", \"takwim\", \"kalendar\", \"jadual cuti\", \"pakej\", \"harga\", \"poster raya\", \"ucapan perayaan\", \"cuti sekolah\", \"carousel\", \"slide IG\", \"story IG\", \"semak design aku\", \"komen poster ni\", atau upload gambar poster minta dibaiki, walaupun tak sebut perkataan 'design'."
---

# Design Grafik — Minda Optima

Skill ni hasilkan **fail design sebenar** (PNG/JPG untuk media sosial, PDF untuk cetak), bukan setakat idea. Caranya: tulis design sebagai HTML/CSS, kemudian render jadi gambar dengan `scripts/render.py`. HTML membolehkan typography, layout dan warna yang kemas, dan senang dibaiki bila pengguna minta ubah.

Pengguna: team Marketing (Aina — grafik & video, Asyikin — content, Syaikhu — marketer) dan admin yang perlu notis. Mereka bukan programmer, jadi jangan tunjuk kod kecuali diminta. Tunjuk **gambar hasil**.

## Fail dalam skill ni

| Fail | Bila baca / guna |
|---|---|
| `references/brand.md` | **Setiap kali.** Warna, font, logo. Ada `[ISI]` yang belum disahkan. |
| `references/business-context.md` | Bila design ada mesej jualan / fakta syarikat |
| `references/prinsip-design.md` | Design dari kosong, ubah besar, atau **semak design pengguna** |
| `references/notis.md` | Notis, pemberitahuan, minggu ke-5, cuti, yuran |
| `references/perayaan.md` | Poster perayaan — tema warna & ucapan yang betul |
| `templates/poster-iklan.html` | Iklan, promosi, program cuti sekolah, pendaftaran |
| `templates/poster-perayaan.html` | Ucapan perayaan |
| `templates/notis.html` | Notis / pemberitahuan (IG, WhatsApp, A4 cetak) |
| `templates/pakej.html` | Pakej / harga yuran |
| `templates/carousel.html` | Carousel beberapa slide (tips, edukasi) |
| `scripts/render.py` | HTML → PNG/JPG/PDF |
| `scripts/takwim.py` | Jana takwim bulanan/tahunan + kira minggu ke-5 |
| `scripts/brand_colors.py` | Ambil warna dari logo, semak kontras, buat logo putih |

## Aliran kerja

### 1. Kumpul bahan (tanya sekali sahaja, dalam satu mesej)
- Jenis design & platform (IG feed? story? WhatsApp? cetak A4?)
- Teks / maklumat wajib: tarikh, lokasi, harga, nombor hubungan
- Logo (`logo.png`, `logo-putih.png`) dan foto, kalau ada

Kalau pengguna dah beri cukup, **terus buat**. Maklumat yang tiada → biarkan `<span class="isi">[ISI …]</span>` (nampak sebagai kotak garis merah dalam render) dan senaraikan apa yang perlu diisi. **Jangan reka** harga, tarikh, nombor telefon, lokasi, testimoni, atau statistik.

### 2. Sediakan folder kerja
```bash
mkdir -p design/nama-projek && cd design/nama-projek
cp <skill>/templates/poster-iklan.html poster.html     # salin, jangan ubah template asal
cp /path/logo.png logo.png                              # gambar mesti dalam folder sama
```

### 3. Tulis / ubah HTML
- Tukar teks, warna `:root` (ikut `brand.md`), dan susun atur ikut keperluan. Template ialah titik mula, bukan had. Ubah layout dengan bebas kalau kandungan memerlukan.
- Semua ukuran guna `calc(var(--u)*N)` (N = piksel atas canvas lebar 1080). Ikut cara ni supaya design kekal betul dalam semua saiz.
- Gambar guna laluan relatif (`src="foto.jpg"`).
- Tiada template sesuai? Tulis HTML baru ikut corak yang sama: `--u`, `html,body{width:100vw;height:100vh;overflow:hidden}`, font Google dengan fallback.

### 4. Render
```bash
python <skill>/scripts/render.py poster.html poster.png --size ig-post
python <skill>/scripts/render.py notis.html notis.pdf --size a4          # cetak
python <skill>/scripts/render.py carousel.html slide.png --size ig-post --slides 5
```
Saiz: `ig-post` 1080x1350 · `ig-square`/`wa` 1080x1080 · `story` 1080x1920 · `fb-post` 1200x630 · `fb-cover` · `banner` 1920x1080 · `a4` · `a5` · `a4-landscape` · atau `LEBARxTINGGI`.

Kalau render gagal sebab tiada browser: `pip install playwright && python -m playwright install chromium`. Kalau itu pun gagal (tiada internet), terangkan kepada pengguna dan tawarkan alternatif: bina design terus dengan Pillow (Python) untuk layout ringkas, atau serahkan fail HTML untuk dibuka dalam Chrome lalu "Print → Save as PDF".

### 5. Semak hasil render — WAJIB
Buka PNG yang dihasilkan dan tengok sendiri. Gunakan senarai semak dalam `prinsip-design.md` §6. Masalah biasa: teks terpotong, baris pecah di tempat pelik, `[ISI]` berbaki, foto tak muncul (nama fail salah), kontras lemah. Betulkan dan render semula. Pengguna tak sepatutnya jumpa masalah yang kau boleh nampak sendiri.

### 6. Serah
- Fail akhir dengan nama jelas: `poster-cuti-sekolah-dis2026_ig.png`
- Kalau berguna, beri **2–3 variasi** (contoh: warna berbeza, hook berbeza) supaya pengguna boleh pilih. Lebih berguna daripada satu versi yang perlu diulang-ulang.
- Senarai ringkas: apa dibuat · apa perlu diisi/disahkan (`[ISI]`) · cadangan saiz lain (contoh versi story).
- Untuk notis: sertakan **caption WhatsApp** sekali (lihat `notis.md`).
- Untuk poster iklan: cadang caption ringkas, atau sebut skill `content-iklan` boleh tulis copy penuh.

## Takwim

```bash
python takwim.py minggu5 --tahun 2027 --hari sabtu,ahad                    # senarai tarikh minggu ke-5
python takwim.py bulan --tahun 2026 --bulan 12 --acara acara.json --out dis.html --tanda-minggu5
python takwim.py tahun --tahun 2027 --acara acara.json --out takwim2027.html     # render --size a4-landscape
python takwim.py tahun --tahun 2027 --acara acara.json --out t.html --kolum 3    # render --size a4
```
Format `acara.json` ada dalam `takwim.py --help`. Jenis: `cuti`, `cuti-sekolah`, `tiada-kelas`, `kelas-ganti`, `aktiviti`, `penting`.

**Tarikh cuti umum & cuti sekolah mesti dari sumber rasmi** (KPM, kerajaan negeri). Kalau ada alat carian web, cari dan sebut sumbernya. Kalau tiada, minta pengguna beri senarai. Cuti Islam bergantung pengisytiharan, jadi tandakan "(tertakluk)". Cuti negeri berbeza ikut negeri: tanya centre di negeri mana (HQ di Selangor).

## Peraturan kandungan

- **Jangan janji hasil bacaan dalam tempoh tertentu**, jangan buat urgency palsu ("tinggal 2 slot!") kecuali benar.
- **Foto kanak-kanak perlukan consent ibu bapa.** Ingatkan sekali dengan ringkas bila pengguna beri foto pelajar. Jangan letak nama penuh kanak-kanak.
- Minda Optima ialah **program membaca** (Pantas Baca, The Victoria Readers, 1-to-1 turn-taking), **bukan taska/tadika**.
- Iklan berbayar Meta/TikTok: elak ayat yang "menuduh" penonton ada masalah ("Anak ANDA lemah membaca?"). Rujuk skill `content-iklan` untuk polisi iklan.

## Bila skill lain lebih sesuai

- Video → skill `video-editing`
- Caption, copy iklan, kalendar content → skill `content-iklan`
- Mesej WhatsApp individu kepada ibu bapa → skill `parent-comms`
- Slide pembentangan → skill PowerPoint
