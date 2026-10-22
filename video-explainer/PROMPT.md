# Prompt: Video "Faceless Explainer" Minda Optima (9:16)

Fail ni ialah resipi untuk buat video seterusnya dengan gaya yang sama, iaitu gaya video viral "Warren Buffett $381 billion": potongan pantas, latar flatlay bertekstur, tipografi kinetik, nombor bergolek, sari kata, dan CTA telefon atas awan.

Projek ini (`video-explainer/`) ialah template. Video baru = skrip baru + VO baru + babak baru. Enjin (latar, efek, audio, render) diguna semula.

---

## 1. Prompt ringkas (salin & tampal ke Claude Code)

```
Baca video-explainer/PROMPT.md dan video-explainer/README.md dahulu.

Buat video explainer baru gaya yang sama untuk Minda Optima.
Topik: [ISI — contoh: "kenapa anak cepat bosan membaca"]
Program: [Pantas Baca / The Victoria Readers / kedua-dua]
Durasi sasaran: [~40–50 saat]
CTA: [contoh: "WhatsApp kami — link di bio"]

Langkah:
1. Tulis skrip VO dahulu (ikut peraturan bahagian 3 dalam PROMPT.md), satu baris = satu babak,
   versi biasa + versi Eleven v3 dengan tag emosi. Simpan sebagai skrip-vo.txt. Tunggu saya rakam VO.
2. Bila saya upload MP3 → sync, bina babak, render, semak contact sheet, hantar video.
Salin projek video-explainer/ ke folder baru (contoh video-<topik>/) supaya video lama tak terusik.
```

---

## 2. Aliran kerja (yang terbukti berjaya)

1. **Skrip.** Gunakan skill `content-iklan`. Satu baris = satu babak (1–3 saat), jumlah 18–24 baris.
   - Beri **dua versi**:
     - biasa (Multilingual v2);
     - **Eleven v3** dengan tag emosi `[curious]`, `[serious]`, `[sighs]`, `[excited]`, `[whispers]`, `[warm]`, `[confident]`.
   - Simpan sebagai `skrip-vo.txt`, dengan baris kosong antara ayat.
2. **VO.** Pengguna rakam sendiri di ElevenLabs.
   - Model **Eleven v3**, suara **Luqman**, stability ~45%, similarity ~90%, speed sedikit laju.
   - Uji 3–4 baris dahulu sebelum rakam skrip penuh.
   - Kalau v3 tak stabil, guna v2 dengan stability 30–35% dan style 25–30%.
   - Sebutan pelik (contoh "1-to-1 turn-taking") boleh dieja ikut bunyi dalam skrip VO sahaja.
3. **Sync.** Letak MP3 di `public/vo.mp3`, kemudian jalankan `scripts/align_vo.py` (Whisper small melalui sherpa-onnx).
   - Padankan output dengan baris skrip.
   - Isi `start` setiap babak dan masa setiap frasa sari kata dalam `src/timing.json`.
   - Untuk frasa dalam satu baris, agihkan masa ikut suku kata.
   - Untuk sempadan yang tak jelas, semak envelope tenaga audio.
4. **Babak.** Tulis semula `src/scenes.tsx` (S1…Sn, mesti sama bilangan dengan `timing.json`). Guna semula komponen dalam `src/lib.tsx`.
5. **Audio.** Kemas kini senarai `sfx` dalam `timing.json`, kemudian `npm run sfx`.
6. **Semak.**
   - `npx tsc --noEmit`.
   - Render draf `--scale=0.5`.
   - Contact sheet pada 35% dan 85% setiap babak.
   - Betulkan teks terpotong, overlap, atau teks yang bertindih dengan sari kata.
7. **Render akhir.** `npm run render`, kemudian mampatkan:
   ```bash
   ffmpeg -i out/final.mp4 -c:v libx264 -preset slow -crf 22 -maxrate 7M -bufsize 14M \
     -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart out/<nama>.mp4
   ```
   - Hasilnya ~44MB, sesuai untuk TikTok, Reels dan FB.
   - Untuk WhatsApp (<16MB), guna `-crf 28 -maxrate 2.5M`.
8. Commit kod (bukan mp4) dan push ke branch kerja.

---

## 3. Peraturan skrip & hook

- **Struktur:**
  - Hook fakta mengejut (0–3s)
  - Twist ("tapi…")
  - Masalah yang ibu bapa kenal
  - "Sebab tu, sejak 1995…"
  - Kaedah (1-to-1 turn-taking, tanpa eja tanpa hafal, maks 8 sekelas)
  - Soalan cliffhanger ("atau…?")
  - CTA lembut
- **Hook 3 saat mesti padu:**
  - tajuk hook di atas skrin dari frame 0 (≤ 8 perkataan, dua baris: hitam + kuning);
  - BOOM + kilat + gegaran pada frame 0;
  - hentakan kedua ~1s;
  - nombor dihentak masuk.
- **Fakta yang dibenarkan:**
  - sejak 1995
  - 1-to-1 turn-taking
  - tanpa eja tanpa hafal
  - maksimum 8 pelajar sekelas
  - Pantas Baca & The Victoria Readers
  - fizikal & online
  - 4 tahun ke atas
- **Jangan:**
  - janji hasil dalam tempoh tertentu;
  - reka statistik, harga atau testimoni (guna `[ISI]`);
  - urgency palsu;
  - bandingkan dengan pusat lain;
  - guna ayat menakutkan;
  - sebut taska/tadika.
- Hook "anak + masalah" OK untuk organik. Untuk iklan berbayar, semak polisi Meta dahulu.
- Jangan guna wajah orang sebenar atau tokoh terkenal.

---

## 4. Gaya visual (rujukan video Buffett)

- 1080×1920, 30fps.
- Hard cut setiap babak, push-in 1.0→1.07, dan "punch" 1.09→1 pada 5 frame pertama.
- Grain filem global + vignette.
- **Latar** (`lib.tsx`) bertukar setiap 1–3 babak:
  - `GridPaper`, `CuttingMat`, `Felt`, `Wood`, `Damask`, `Swirl` (gelang merah-putih), `Solid` (merah/hitam/biru), `Sky`.
- **Efek** (`lib.tsx`):
  - `Pop`, `Stamp` (cop + gegaran), `Odometer` (nombor bergolek), `LetterRoll` (A→Z), `Handwrite` (tulisan tangan)
  - `HangingBoard` (papan hitam berayun), `Binocular` (mask teropong), `FallingTiles`, `TileBurst`
  - `Kid` / `TurnRow` (giliran 1-to-1), `Phone` (chat WhatsApp 3D), `Book`, `Block`, `Tile`, `Pencil`, `Clipboard`, `Chip`
  - `useImpact` (gegaran hentakan), `Flash`
- **Font:** gilirkan ikut babak.
  - Anton: tajuk tegak
  - Archivo Black: heavy kuning/merah
  - Silkscreen: pixel
  - Playfair Display: serif + kotak hijau, digit pink
  - Caveat: tulisan tangan
  - Black Ops One: cop stensil
  - Inter: sari kata
- **Warna:** kuning `#ffd21f`, merah `#e11d2e`/`#d3141c`, biru `#1d4ed8`/`#2343c9`, hijau WhatsApp `#25d366`.
- **Sari kata:** frasa 2–5 perkataan, Inter 600 50px, kotak hitam 66%, `top: 1350`.
  - Teks besar babak mesti berada di atas ~1300 atau di bawah ~1480.
- Jangan letak teks besar terlalu dekat dengan tepi: push-in memotong ~4% setiap sisi. Kekalkan margin ≥ 70px.

---

## 5. Kekangan environment cloud (pengajaran)

- **CDN Higgsfield, HuggingFace, Microsoft TTS dan api.elevenlabs.io disekat.**
  - Jadi VO dirakam manual dan diupload.
  - Kalau mahu VO automatik melalui API ElevenLabs:
    - tambah `api.elevenlabs.io` dalam Allowed domains environment;
    - tambah secret `ELEVENLABS_API_KEY`;
    - buka sesi baru;
    - guna endpoint `/v1/text-to-speech/{voice_id}/with-timestamps` (masa setiap aksara, sync tepat).
- **Model Whisper** dimuat turun dari GitHub releases (dibenarkan):
  `https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-small.tar.bz2` dan `pip install sherpa-onnx`.
- **Font mesti lokal** (`public/fonts`, dimuat melalui `@remotion/fonts`).
  - Chromium headless tak percaya sijil proxy, jadi Google Fonts gagal.
  - **Jangan** matikan semakan TLS.
- **Chromium** guna yang sedia ada: `/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell` (dalam `remotion.config.ts`).
- **Tekstur** (`public/tex`) dan audio SFX/muzik dijana melalui skrip dan tidak di-commit. Jalankan `npm run textures` dan `npm run sfx` selepas clone.
- Render penuh mengambil ~6–8 minit (49s video, 4 thread). Jalankan di latar belakang.

---

## 6. Senarai semak sebelum hantar

- [ ] Bilangan babak dalam `scenes.tsx` = bilangan dalam `timing.json`
- [ ] Contact sheet: tiada teks terpotong, overlap atau bertindih dengan sari kata
- [ ] Sari kata ikut ejaan betul (bukan ejaan sebutan VO)
- [ ] Audio: puncak < −1 dB, muzik ~16 dB di bawah VO
- [ ] Teks chat telefon, logo dan CTA sudah disahkan pengguna
- [ ] Kod di-commit dan di-push; mp4 dihantar kepada pengguna
