# 5 Tanda Anak Perlukan Sokongan Membaca — Motion Graphic (HyperFrames)

Video awareness 9:16 untuk Minda Optima, dibina dengan HyperFrames (HTML + GSAP).

- **MP4 akhir:** `renders/5-tanda-anak-perlukan-sokongan.mp4` (1080×1920, 30fps, H.264 + AAC)
- **Tempoh:** 41.0 s (voice over 40.91 s, tidak diubah)
- **Plan suntingan:** [`PLAN.md`](PLAN.md)

## Struktur

| Fail | Isi |
|---|---|
| `build.mjs` | **Semua data yang boleh diubah**: masa babak & transition, masa kata kunci (`T`), subtitle (`SUBS`), cue SFX (`SFX`), aras campuran audio (`MIX`). |
| `src/scenes.html` | Markup visual setiap babak (SVG/CSS sahaja, tiada stok footage). |
| `src/timeline.js` | Animasi GSAP (satu timeline `paused` pada `window.__timelines["main"]`). |
| `src/styles.css` | Warna brand, tipografi 3D, layout. |
| `src/audio.mjs` | Sintesis SFX & muzik latar (deterministik, tiada lesen pihak ketiga) + duck di bawah suara. |
| `assets/` | Voice over asal, logo (crop), GSAP lokal, font lokal (Archivo Black, Nunito), audio yang dijana. |
| `index.html` | **Dijana** oleh `build.mjs` — jangan edit terus. |

## Cara edit & render semula

```bash
npm install                 # kali pertama sahaja
node build.mjs              # jana index.html + audio SFX/muzik
npx hyperframes check       # lint + runtime + layout + kontras
npx hyperframes preview     # Studio preview (edit visual)
npx hyperframes render -o renders/5-tanda-anak-perlukan-sokongan.mp4 --fps 30 --crf 18
```

Jika Chrome tiada: `export HYPERFRAMES_BROWSER_PATH=/path/ke/chromium`.

### Contoh perubahan biasa
- **Tukar teks subtitle / masa** → ubah `SUBS` dalam `build.mjs`. Kata kunci kuning = senarai `kw: [["perkataan", masa]]`.
- **Anjak masa satu animasi** → ubah nilai dalam `T` (cth. `T.buku = 10.22`). Semua animasi & SFX yang bergantung padanya ikut berubah.
- **Tukar masa transition** → `TRANSITIONS` (`at` = titik tengah, `dur` = tempoh).
- **Matikan muzik** → `MIX.music = 0`. **SFX lebih perlahan** → kurangkan `MIX.sfx`.

## Nota teknikal
- Voice over dimainkan terus daripada fail asal pada volume 1.0 — tidak dipotong, dilaju atau dinormalkan.
- Masa kata kunci dikesan dengan `ffmpeg silencedetect` + envelope tenaga (model transkripsi tidak dapat dimuat turun dalam persekitaran ini).
- Deterministik: tiada `Math.random`, `Date.now` atau fetch rangkaian semasa render.
