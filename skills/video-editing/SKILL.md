---
name: video-editing
description: "Edit video marketing Minda Optima guna ffmpeg: potong & sambung klip, tukar ke 9:16 (TikTok/Reels/Shorts), subtitle BM, teks hook, logo, muzik latar, bersihkan suara, buang senyap (jump cut), end card CTA, export ikut platform (TikTok, Reels, WhatsApp, YouTube, feed). Gunakan bila staf sebut \"edit video\", \"iklan video\", \"reels\", \"tiktok\", \"shorts\", \"potong video\", \"trim\", \"sambung video\", \"subtitle\", \"caption video\", \"sari kata\", \"letak logo\", \"watermark\", \"masukkan lagu\", \"muzik latar\", \"suara tak jelas\", \"jump cut\", \"tukar portrait\", \"compress video\", \"video besar nak hantar WhatsApp\", \"thumbnail\", atau upload fail video (.mp4/.mov) dan minta dibaiki, dipendekkan atau disediakan untuk media sosial, walaupun tak sebut 'edit'. Juga guna bila merancang struktur atau skrip iklan video pendek."
---

# Video Editing — Minda Optima

Skill ni buat kerja edit video sebenar (fail .mp4 keluar), bukan setakat bagi tips. Semua kerja dibuat oleh skrip `scripts/vid.py` (dalam folder skill ni) yang memanggil ffmpeg.

Pengguna biasanya team Marketing (Aina — grafik & video, Asyikin — content, Syaikhu — marketer). Mereka bukan programmer. Jadi:
- Jangan tunjuk arahan terminal panjang kecuali diminta. Buat kerja, kemudian terangkan hasil dalam bahasa mudah.
- Cakap BM santai-profesional, ayat pendek.

Baca `references/business-context.md` kalau video melibatkan mesej jualan atau iklan. Baca `references/panduan-iklan.md` bila perlu merancang iklan, menulis teks hook/CTA, atau memilih spesifikasi platform.

---

## Langkah 0 — Pastikan ffmpeg ada

```bash
python <folder-skill>/scripts/vid.py check
```

Kalau tiada: cuba `pip install imageio-ffmpeg` (tak perlu admin) dan jalankan `check` semula. Kalau masih gagal, beritahu pengguna cara pasang ikut OS (mesej `check` dah ada arahannya). Jangan teruskan edit tanpa ffmpeg.

## Langkah 1 — Faham video dulu sebelum edit

Kau tak boleh "tonton" video terus. Jadi:

```bash
python vid.py info  video.mp4            # saiz, durasi, ada audio?
python vid.py sheet video.mp4 sheet.jpg  # grid 12 frame + masa setiap frame
```

Kemudian buka `sheet.jpg` untuk tengok isi video. Guna masa yang dicetak untuk tentukan titik potong. Untuk video panjang (>60s) atau bila perlu titik potong tepat, buat sheet kedua untuk bahagian tertentu sahaja (`trim` dulu ke fail sementara, kemudian `sheet`).

Kalau ada suara orang bercakap dan pengguna nak subtitle, transkripsi dulu (lihat Langkah 3).

## Langkah 2 — Rancang, sahkan ringkas, kemudian buat

Bila permintaan jelas ("tukar jadi reels, letak logo"), terus buat. Bila kabur ("buat video ni jadi iklan best"), cadang pelan pendek 3–6 baris dulu: apa dipotong, teks hook apa, muzik/tiada, platform sasaran. Kemudian teruskan kecuali pengguna nak ubah.

**Peraturan fail:**
- Fail asal jangan diubah. Skrip memang menolak output yang sama dengan input.
- Simpan fail kerja dalam folder `kerja/` (contoh `kerja/01_trim.mp4`, `kerja/02_916.mp4`...) supaya senang patah balik satu langkah.
- Fail akhir beri nama yang jelas: `iklan-cuti-sekolah_reels.mp4`, bukan `output3.mp4`.

**Susunan langkah yang disyorkan** (elak kualiti jatuh dan teks terpotong):
1. `trim` / `join` / `jumpcut` — susun isi dulu
2. `speed` (kalau perlu)
3. `audio-clean` — sebelum muzik masuk
4. `resize` ke nisbah sasaran — **sebelum** teks/subtitle/logo, supaya kedudukan teks betul
5. `subtitle` → `text` → `logo`
6. `music`
7. `endcard`
8. `export` ikut platform

## Langkah 3 — Subtitle

Ramai tonton video media sosial tanpa bunyi. Jadi subtitle hampir selalu berbaloi untuk video yang ada orang bercakap.

**Ada suara → transkripsi automatik:**
```bash
pip install faster-whisper     # sekali sahaja
python transcribe.py video.mp4 sub.srt --lang ms     # en untuk English
```
Kali pertama ia muat turun model (~500 MB). Kalau gagal (tiada internet / disekat), guna cara skrip di bawah.

**Ada skrip teks → anggaran masa:**
```bash
python vid.py srt-from-text skrip.txt sub.srt --video video.mp4
```

**Selepas dapat .srt, baca dan betulkan sendiri** sebelum bakar: ejaan BM, nama program (Minda Optima, Pantas Baca, The Victoria Readers), baris terlalu panjang (≤ 32 aksara sebaris lebih mudah dibaca atas telefon). Kemudian:

```bash
python vid.py subtitle video.mp4 out.mp4 --srt sub.srt --style reels
```
Gaya: `reels` (putih, outline hitam, di atas zon UI TikTok), `kotak` (latar hitam separa lutsinar — paling mudah dibaca atas latar sibuk), `kuning`, `bawah` (untuk video landscape/YouTube). `--upper` untuk huruf besar semua.

## Arahan lain (rujukan pantas)

| Kerja | Arahan |
|---|---|
| Potong | `vid.py trim in.mp4 out.mp4 --start 0:05 --end 0:32` |
| Tukar nisbah | `vid.py resize in.mp4 out.mp4 --ratio 9:16 --mode blur` (`crop` kalau subjek di tengah, `pad` untuk bar hitam) |
| Sambung klip | `vid.py join out.mp4 a.mp4 b.mp4 c.mp4 --ratio 9:16` |
| Buang senyap | `vid.py jumpcut in.mp4 out.mp4` (`--threshold -30dB` lebih agresif) |
| Laju | `vid.py speed in.mp4 out.mp4 --factor 1.2` |
| Teks hook | `vid.py text in.mp4 out.mp4 --text "Anak lambat membaca?" --end 3 --pos atas --color kuning --box` |
| Banyak teks | `vid.py text in.mp4 out.mp4 --spec teks.json` (lihat bawah) |
| Logo | `vid.py logo in.mp4 out.mp4 --logo logo.png --pos kanan-atas --size 0.18` |
| Muzik | `vid.py music in.mp4 out.mp4 --music lagu.mp3 --volume 0.18` (auto perlahan bila ada suara; `--no-duck` untuk matikan) |
| Bersih suara | `vid.py audio-clean in.mp4 out.mp4` (buang dengung/noise, ratakan volume ke -14 LUFS) |
| End card | `vid.py endcard in.mp4 out.mp4 --image cta.png --seconds 3` |
| Thumbnail | `vid.py thumbnail in.mp4 thumb.jpg --at 0:02` |
| Export | `vid.py export in.mp4 out.mp4 --preset reels` (`tiktok`, `shorts`, `whatsapp`, `youtube`, `feed` 4:5, `square`) |

`teks.json` untuk beberapa teks:
```json
[
  {"text": "Anak lambat membaca?", "start": 0, "end": 3, "pos": "atas", "color": "kuning", "box": true},
  {"text": "1-to-1 dengan guru", "start": 4, "end": 7, "pos": "tengah"},
  {"text": "Daftar sesi penilaian", "start": 9, "pos": "bawah", "color": "putih", "box": true, "box_color": "1D4ED8"}
]
```
Warna: `putih, hitam, kuning, merah, biru, hijau, oren, pink, ungu` atau hex `#RRGGBB`. `end` kosong = sampai hujung video.

Font default `Arial`. Kalau brand ada font sendiri yang dipasang dalam komputer, guna `--font "Nama Font"`.

## Langkah 4 — Semak hasil sebelum serah

Jangan serah tanpa tengok sendiri:
1. `vid.py sheet final.mp4 semak.jpg` dan buka gambar. Semak: teks tak terpotong, tak bertindih dengan logo, subtitle tak tutup muka, tiada frame hitam pelik.
2. `vid.py info final.mp4`. Semak nisbah dan durasi betul, audio ada, saiz fail munasabah (WhatsApp < 16 MB).
3. Kalau ada masalah, betulkan dari fail kerja langkah sebelumnya. Tak perlu mula dari awal.

## Format serahan

Selepas siap, beritahu pengguna dengan ringkas:
- **Fail siap:** nama fail + platform + durasi + saiz
- **Apa yang dibuat:** 3–5 poin ringkas (contoh "potong 0:00–0:04 yang goyang", "subtitle BM gaya reels")
- **Perlu semak:** perkara yang kau tak pasti (ejaan nama, kesahihan fakta dalam teks, lesen muzik)
- **Cadangan seterusnya** (pilihan, satu baris): contoh versi 15s untuk iklan berbayar

---

## Peraturan kandungan (wajib, sebab ini video awam)

Minda Optima jual kepercayaan ibu bapa, jadi video kena jujur. Video iklan lebih lama hidup dan lebih ramai tengok berbanding mesej WhatsApp.

- **Jangan janji hasil dalam tempoh tertentu** dalam teks/subtitle ("3 bulan confirm boleh baca"). Kalau skrip pengguna ada ayat begini, tegur dengan sopan dan cadang ganti, contohnya "kemajuan yang ibu bapa boleh nampak".
- **Wajah kanak-kanak (PDPA):** video yang tunjuk muka pelajar perlukan kebenaran ibu bapa. Ingatkan sekali dengan ringkas ("pastikan ada consent parent untuk murid dalam video ni") dan jangan letak nama penuh kanak-kanak di skrin.
- **Muzik:** muzik berhak cipta (lagu popular) boleh menyebabkan iklan ditolak atau video dibisukan. Untuk iklan berbayar, guna muzik bebas royalti atau dari library platform. Kalau pengguna beri lagu popular, sebut risiko ni sekali.
- **Jangan reka fakta:** harga, lokasi, tarikh, jumlah pelajar. Kalau perlu dalam teks dan tak diberi, tulis `[ISI]` dan tanya.
- **Nada:** tenangkan, bukan takutkan. "Anak lambat membaca? Kami boleh bantu" lebih baik daripada "Anak anda akan ketinggalan!"
- Minda Optima ialah **program membaca** (Pantas Baca BM, The Victoria Readers English, kaedah 1-to-1 turn-taking), **bukan** taska atau tadika.

## Bila skill ni tak sesuai

- **Video AI dari kosong** (tiada footage): guna tool generate video seperti Higgsfield kalau tersedia, kemudian edit hasilnya di sini.
- **Fail sangat besar** (>~500 MB atau >10 minit 4K): proses mungkin lambat. Cadang potong bahagian yang perlu dulu, atau jalankan di Claude Code dalam PC sendiri.
- **Efek grafik kompleks** (motion graphics, animasi teks bergerak, colour grading teliti): terus terang cakap ini lebih sesuai buat dalam CapCut/Premiere. Skill ni boleh sediakan bahan asas (potong, subtitle .srt, audio bersih) untuk diimport ke sana.
