# Prompt: Motion Graphic Minda Optima (HyperFrames)

Templat untuk buat video motion graphic seterusnya, dengan gaya dan aliran kerja yang sama macam video **"Setiap Anak Mampu Membaca"** (Oktober 2026).
Contoh siap: `minda-optima-membaca/` dalam repo ni (`index.html`, `tools/`, `renders/`).

---

## 1. Prompt untuk ditampal (isi bahagian [ ... ])

```
Di dalam folder Google Drive ini ada voice over dan logo Minda Optima:
[LINK FOLDER DRIVE]

Video contoh gaya: [LAMPIRKAN VIDEO CONTOH / atau "guna gaya video Minda Optima sebelum ni"]

Buat motion graphic 9:16 ikut gaya contoh. Ikut spesifikasi dalam
prompts/motion-graphic-minda-optima.md (dalam repo Graphic-Design).

- Topik / mesej utama: [CTH: kepentingan membaca 15 minit sehari]
- Skrip VO (untuk rujukan timing):
  [TAMPAL SKRIP VO DI SINI]
- Muzik latar: [lagu Envato dalam Drive: NAMA FAIL] / [jana sendiri: suspen → upbeat]
- Emosi muzik: [CTH: suspen di awal, upbeat lepas ayat "...", klimaks pada logo]
- End card: logo + tagline [TAGLINE]. CTA: [tiada / "Daftar Sekarang" / no. WhatsApp]

Guna HyperFrames, skill scout, dan semua kemahiran yang ada.
Simpan projek dalam folder baru [NAMA-PROJEK]/, render MP4, push ke branch.
```

---

## 2. Spesifikasi gaya (yang dah diluluskan)

**Format**
- 1080×1920 (9:16), 30fps, kualiti `delivery`, MP4 (H.264 + AAC)
- Panjang ikut VO, dan **tahan end card 2–3 saat** selepas VO habis
- Teks utama dalam zon selamat TikTok/Reels: elak ~350px bawah dan ~150px kanan

**Warna jenama (dari logo)**
| Token | Hex | Guna |
|---|---|---|
| blue | `#0976BA` | teks aksen di latar terang, butang |
| sky | `#00AAEB` | blob cahaya, highlight |
| navy / deep | `#062B52` / `#031A33` | latar gelap |
| orange | `#F28C28` | aksen kedua, bar progress |
| red | `#ED1E2A` | perkataan negatif (cth. "lambat", "bandingkan") |
| sun | `#FFC94A` | aksen di latar gelap, kotak highlight |
| ink | `#0B2540` | teks di latar terang |

**Tipografi:** Plus Jakarta Sans 600/700/800 (fail woff2 dalam `assets/fonts/`). Saiz: 150 / 124 / 100 / 78 / 60px.

**Elemen gaya (ikut video contoh rujukan)**
- Latar **terang** (putih dengan blob kabur biru langit dan oren) dan **gelap** (radial biru gelap dengan glow) bersilih ganti setiap babak
- **Perkataan muncul satu-satu ikut VO**: fade + naik + blur → jelas (0.42s, `power3.out`)
- **Kotak highlight** dengan kursor berkelip untuk perkataan kunci (sky / sun / red)
- **Transisi babak:** zoom + blur masuk (1.16 → 1, 0.42s `expo.out`), tolak kamera perlahan, kemudian zoom + blur keluar 0.2s
- Hiasan terapung: pill kabur, tile 3D huruf A-B-C, emoji Twemoji, kad UI putih (progress bar, streak hari, kad guru, carta bar)
- **End card:** logo pop (`back.out`), emoji terapung, tagline dengan highlight

**Babak yang boleh diguna semula** (lihat `minda-optima-membaca/index.html`)
| Babak | Idea visual |
|---|---|
| Soalan pembuka | Pill kabur dengan masalah ibu bapa |
| Petikan ibu bapa | Gelembung chat terapung dan petikan besar |
| Mitos vs fakta | Teks dipotong garisan merah + ❌ |
| Kemahiran boleh dilatih | Kad progress Huruf → Suku kata → Perkataan → Ayat |
| Setiap anak berbeza | Avatar kanak-kanak mengorbit elips |
| Cepat vs perlahan | Dua lorong bar 🐇 / 🐢, dua-dua sampai ⭐ |
| Konsisten | Streak Isn–Jum ✅, kamera skrol ke kad "Dibimbing guru" |
| Jangan bandingkan | Kad "Anak anda" VS "Orang lain" dipangkah ❌ |
| Semalam vs hari ini | Carta bar membesar + 🌟 |

**Nada kandungan:** Minda Optima ialah program membaca kanak-kanak (BUKAN taska). **Jangan janji hasil bacaan dalam tempoh tertentu.** Jangan reka nama ibu bapa, testimoni atau tawaran harga.

---

## 3. Audio

**Voice over (ElevenLabs)**
- Suara **Luqman** (Professional Voice Clone), model **Eleven v3**, bahasa Malay
- Stability: **Natural**, bukan Robust (Robust abaikan tag emosi)
- Gaya tegas: tag `[serious]`, `[firm]`, `[confident]`, `[authoritative]`. Kurangkan `...` (elipsis buat suara jadi lembut)
- Kalau suara lari daripada Luqman: tukar ke **Multilingual v2**, buang semua tag, guna Stability 60–65%, Similarity 80%, Style 10–15%

**Muzik latar**
- Lagu Envato: upload WAV ke Drive, kemudian guna `tools/edit_music.py` untuk:
  - susun **drop pertama lagu** pada perkataan penting (cth. 8.2s "kemahiran")
  - susun **drop terakhir** pada logo
  - intro suspen: low-pass tertutup + lapisan synth (degupan jantung, detik jam, drone)
  - breakdown: low-pass dan perlahan pada ayat emosi
  - **duck** di bawah VO (lebih kurang 10–13 dB di bawah suara), loudness bed −19.8 LUFS, `data-volume="0.5"`
- Tiada lagu? `tools/make_music.py` menjana skor synth (suspen → build → upbeat → breakdown → klimaks)
- **Lesen Envato:** jangan commit WAV Envato ke repo (dah ada dalam `.gitignore`). Register projek masa download.
- SFX (whoosh / pop / tick / chime) disintesis dengan ffmpeg dan disimpan dalam `assets/sfx/`

---

## 4. Aliran kerja teknikal (untuk Claude)

1. **Aset dari Drive**
   - Fail < 10 MB: `download_file_content` (Google Drive MCP)
   - Fail > 10 MB: `curl -L "https://drive.usercontent.google.com/download?id=<ID>&export=download&confirm=t"` (folder mesti dikongsi "anyone with link")
2. **Scaffold:** `npx hyperframes@<versi> init <nama> --example blank --resolution portrait --audio vo.mp3 --skip-transcribe --non-interactive`
3. **Semua aset mesti lokal.** CDN jsdelivr, huggingface dan envato disekat dalam environment cloud:
   - GSAP: `npm pack gsap@3.14.2` → `assets/vendor/gsap.min.js`
   - Font: `npm pack @fontsource/plus-jakarta-sans` → `assets/fonts/`
   - Emoji: `npm pack @twemoji/svg` → `assets/emoji/<codepoint>.svg`
4. **Timing VO:** `hyperframes transcribe` gagal sebab huggingface disekat. Guna `ffmpeg silencedetect` (−30 dB, d=0.12) untuk sempadan ayat, kemudian agih masa perkataan ikut bilangan suku kata. Letak `data-t` pada setiap `.w` / `.hl`.
5. **Peraturan HyperFrames:** satu timeline GSAP paused di `window.__timelines["main"]`, tiada CSS transform pada elemen yang di-tween, setiap `<audio>` ada `id`, PRNG ber-seed, `repeat` terhingga.
6. **Semak:** `npx hyperframes check` (0 error), kemudian `npx hyperframes snapshot --at <masa-masa> --no-end` dan teliti contact sheet (teks bertindih, teks terbalut, elemen terkeluar).
7. **Render:** `npx hyperframes render -f 30 -q delivery -o renders/<nama>.mp4` (lebih kurang 4 minit untuk 34s)
8. **Sahkan audio:** `ffmpeg ebur128` / `volumedetect` dan bandingkan paras bed dengan paras mix
9. Commit + push. Hantar MP4 kepada pengguna. Fail 17 MB terlalu besar untuk upload melalui Drive MCP, jadi pengguna upload sendiri.
