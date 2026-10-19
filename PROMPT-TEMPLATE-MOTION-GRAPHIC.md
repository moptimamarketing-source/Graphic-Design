# Prompt Template — Motion Graphic Minda Optima (gaya "5 Tanda")

Salin prompt di bawah, isi bahagian dalam [KURUNGAN], lampirkan voice over dan skrip.

---

```
Bina motion graphic TikTok/Reels baharu dengan GAYA YANG SAMA seperti projek
`5 tanda anak perlukan sokongan` dalam repo ini. Guna projek itu sebagai TEMPLATE:
salin strukturnya (build.mjs + src/scenes.html + src/timeline.js + src/styles.css
+ src/audio.mjs) ke folder baharu `[NAMA FOLDER]`, kemudian tukar kandungan.
Jangan ubah fail projek lama.

Baca dahulu skill: /hyperframes, /general-video, /hyperframes-core,
/hyperframes-animation, /hyperframes-creative, /hyperframes-keyframes.

INPUT
- Voice over: [link Google Drive folder / nama fail MP3]
- Logo: guna `5 tanda anak perlukan sokongan/assets/logo.png` (sudah di-crop)
- Topik: [contoh: 4 cara bantu anak suka membaca di rumah]
- Skrip (ejaan muktamad, jangan ubah):
  [tampal skrip penuh]

KEKALKAN DARIPADA TEMPLATE
- 1080×1920, 30fps, H.264 MP4. Tempoh ikut voice over.
- Voice over master timeline, volume 1.0, jangan potong/laju/normalize.
- Brand: latar navy + glow sky #00A9E8 + dot grid + huruf hantu; kuning #FFD23F
  untuk penekanan; merah/oren aksen sahaja. Archivo Black 3D untuk tajuk/nombor,
  Nunito 900 untuk subtitle. Font & GSAP lokal.
- Topbar: logo sticker putih + progress tracker [N] pil (isi bila nombor disebut).
- Subtitle 3–6 perkataan, maks 2 baris, y 1322–1508, kata kunci jadi kuning
  bila disebut. Tiada subtitle di CTA (dan di hook jika teks kinetik = kapsyen).
- Transition: whip 0.44s antara poin, iris untuk perubahan emosi & CTA,
  push ke atas untuk babak harapan.
- SFX & muzik dijana secara sintetik (src/audio.mjs), muzik di-duck bawah suara.
- CTA: logo besar + LIKE / KOMEN / FOLLOW MINDA OPTIMA (press sync suara).
- Grafik vector/SVG/CSS sahaja. Tiada stok footage, tiada muka AI, tiada
  janji hasil atau diagnosis.

YANG MESTI BAHARU
- Setiap poin ada METAFORA VISUAL SENDIRI (jangan ulang ilustrasi template).
  Cadangan saya (boleh tambah baik): [poin 1 → idea], [poin 2 → idea], ...
- Masuk nombor berbeza untuk setiap poin (slam / flip / spin / slide / zoom).

LANGKAH
1. ffprobe tempoh audio. Cuba `npx hyperframes transcribe`; jika model disekat,
   guna ffmpeg silencedetect + envelope tenaga untuk masa ayat & kata kunci.
2. Paparkan plan ringkas TIMECODE | DIALOG/SCENE | EDITING IDEA, kemudian terus
   implement tanpa tunggu approval.
3. Kemas kini data dalam build.mjs (SCENES, TRANSITIONS, T, SUBS, SFX, MIX).
4. `npx hyperframes check` sehingga 0 error; semak snapshot setiap babak DAN
   setiap transition; betulkan teks bertindih, safe zone, orphan subtitle.
5. Semak ebur128: suara jelas, puncak < -1 dBFS.
6. Render MP4 akhir ke `[NAMA FOLDER]/renders/`, semak sync audio, commit & push.
```

---

## Tips
- **Rujukan Pinterest/Drive tidak dapat dibuka oleh server** — lampirkan screenshot terus dalam chat jika mahu gaya ikut contoh.
- **Upload ke Google Drive:** fail video terlalu besar untuk alat Drive; muat turun MP4 dari chat/GitHub dan seret ke Drive sendiri.
- **Video lebih panjang / lebih banyak poin:** sebut bilangan poin supaya tracker diubah (cth. 3, 4, 7 pil).
- **Tukar suasana:** nyatakan jika mahu tanpa muzik (`MIX.music = 0`) atau SFX lebih perlahan.
