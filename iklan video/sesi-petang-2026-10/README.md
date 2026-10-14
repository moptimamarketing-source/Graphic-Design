# Iklan Video: Sesi Petang Kini Dibuka (Minda Optima)

Video diedit guna **HyperFrames** (HTML → video) daripada `try 1.mp4` (Google Drive).

## Fail siap

| Fail | Untuk | Spesifikasi |
|---|---|---|
| `MindaOptima_SesiPetang_Reels_1080x1920.mp4` | TikTok, IG/FB Reels, YouTube Shorts | 9:16, 1080×1920, 30 fps, 28.6 s, audio -14 LUFS, ~44 MB |
| `MindaOptima_SesiPetang_WhatsApp_720p.mp4` | WhatsApp / Status | 720×1280, ~4.8 MB |
| `sari-kata-BM.srt` | Upload sebagai caption platform (pilihan) | 19 baris BM |
| `TRANSKRIP.md` | Skrip penuh + senarai bahagian yang dibuang | |

## Apa yang dibuat

1. **Transkripsi dulu** (Whisper large-v3, BM) dengan masa setiap perkataan. Semua animasi, caption dan SFX diletak ikut masa perkataan.
2. **Buang jeda janggal, nafas dan filler "ha"**: 31.1 s jadi 25.7 s. Tiada ayat yang diulang dalam rakaman ni. Setiap potongan ada zoom berselang-seli (1.00× / 1.12–1.17×) supaya jump cut nampak sengaja.
3. **Suara dibersihkan**: AI denoise (DeepFilterNet), high-pass 80 Hz, EQ presence, compression ringan, loudness -14 LUFS. Bunyi latar turun dari 30 dB ke 37 dB di bawah suara. Audio asal pula terlalu kuat (-7.6 LUFS, clipping +2.1 dBTP), dan itu pun dah dibetulkan.
4. **Muzik latar original** (119.5 BPM, D major, upbeat), dicipta khas untuk video ni. Tak guna sampel, jadi **bebas hak cipta** dan selamat untuk iklan berbayar. Struktur ikut cerita:
   - build masa "Berita baik, parents!", groove masuk masa "Minda Optima…"
   - **drop + confetti tepat pada "2,700"**
   - breakdown (warna video jadi pudar) masa "jadual yang tak sesuai"
   - build ke CTA, kemudian hit akhir pada end card
   - muzik di-duck 10 dB di bawah suara supaya cakap kekal jelas, dan naik penuh di end card
5. **Motion graphics** (gaya sticker ikut warna logo Minda Optima):
   - Hook: "BERITA BAIK, PARENTS!" + loceng bergoyang + "TING!" ikut bunyi loceng sebenar
   - "BARU DIBUKA! SESI PETANG" + matahari berputar + chip "KELAS FIZIKAL"
   - Odometer **2,700+** berpusing, kemudian mendarat tepat pada beat drop (rays + confetti + camera shake)
   - Bulatan hand-drawn pada papan tanda Minda Optima sebenar masa disebut "di Minda Optima"
   - Kad "PILIHAN JADUAL" dengan slot baru muncul, kad "LEBIH RAMAI PELAJAR", jam berputar + ✓ "WAKTU YANG SESUAI"
   - "JADUAL TAK SESUAI?" + slot dipangkah ✗ (video jadi kelabu, kemudian warna kembali masa CTA)
   - CTA: butang "SEMAK SLOT SESI PETANG" ditekan + "SEKARANG!"
   - End card: maskot, wordmark MINDA OPTIMA, "SESI PETANG KINI DIBUKA!", "SEMAK SLOT SEKARANG"
6. **Caption BM perkataan demi perkataan**: perkataan aktif jadi kuning, kata kunci dalam pill berwarna. Kedudukan caption di atas zon UI TikTok/Reels.
7. **24 SFX** (whoosh, pop, sparkle, chime, click, impact) dari library HyperFrames (lesen Pixabay: komersial OK, tanpa atribusi).

## Perlu semak sebelum publish

- **Dengar guna headphone**, terutama 0:00–0:02 (hook dengan loceng; denoise dibuat lebih ringan di sini supaya "pareeents" tak terpotong) dan 0:19–0:22 (breakdown).
- **Angka "2,700+ pelajar"** datang dari skrip asal. Pastikan angka ni masih tepat.
- **Ejaan**: perkataan "parents" dikekalkan macam yang disebut. Tukar ke "ibu bapa" kalau nak BM penuh.
- Muka staf dalam video ni tak perlukan consent PDPA kanak-kanak (tiada murid dalam video).
- End card tak letak nombor telefon/link sebab tiada dalam skrip. Kalau nak tambah, beritahu maklumatnya (jangan reka).

## Edit semula (untuk team)

Projek HyperFrames ada dalam `projek-hyperframes/`. Untuk ubah teks/warna/masa, edit `scripts/build.py`, jalankan semula, kemudian render:

```bash
cd projek-hyperframes
# 1. sediakan source.mp4: video asal + suara yang dah dibersihkan, keyframe rapat
ffmpeg -i "try 1.mp4" -i audio/suara-bersih.m4a -map 0:v -map 1:a -c:v libx264 -crf 16 -g 10 -keyint_min 10 \
  -pix_fmt yuv420p -c:a aac -b:a 256k project/source.mp4
# 2. jana index.html (caption, kad, SFX, muzik)
python3 scripts/build.py .
# 3. render
cd project && npx hyperframes lint . && npx hyperframes render . -o ../renders/video.mp4
```

- `scripts/music.py`: penjana muzik latar (tukar tempo/kord/struktur di sini)
- `edit/edl.json`: senarai potongan (frame tepat); `edit/words_timeline.json`: masa setiap perkataan selepas edit
- Studio visual: `npx hyperframes preview` dalam folder `project/`
