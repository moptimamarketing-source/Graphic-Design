# Pantas Baca — Showreel Motion Graphics 15s

Video menegak 9:16 (1080×1920, 30 FPS, H.264 + AAC) gaya showreel studio motion graphics.
Semua visual dan muzik dijana dengan kod. Tiada footage atau muzik stok, jadi tiada isu lesen.

**Fail akhir:** `pantasbaca-showreel-15s-1080x1920.mp4`

## Storyboard (120 BPM: 1 beat = 0.5s = 15 frame)

| Masa | Babak | Teknik |
|---|---|---|
| 0.0–2.0 | Intro: "PANTAS BACA" | Light-slit reveal, huruf 3D extruded jatuh satu per satu ikut not 1/16, grid neon, kamera whip-dolly menembusi teks, flash |
| 2.0–4.0 | "TANPA EJA. TANPA HAFAL." | Kinetic typography, slam/scale, echo stack, wipe diagonal, marquee, iris transition |
| 4.0–6.0 | "FOKUS TEKNIK ARTIKULASI" | Blok huruf 3D (heliks), orbit kamera, waveform, kamera menyelam ke muka blok "O" (match cut) |
| 6.0–8.0 | "1-TO-1 TURN-TAKING" | Infografik cincin HUD, 8 titik bergilir ikut beat, ripple, typewriter, glitch (RGB split + slice) |
| 8.0–10.0 | Dua program | Skrin split diagonal: Pantas Baca (BM) / The Victoria Readers (English), lencana berputar elastic |
| 10.0–12.0 | "SEJAK 1995" | Digit emas 3D flip-in, light shafts, zarah debu, pill "Kelas Fizikal / Online · Zoom" |
| 12.0–15.0 | Lockup akhir | Huruf 3D berkumpul dari letupan, shockwave, particle burst, light sweep, CTA "PANTASBACA.COM" |

Sepanjang video: motion blur (2 subframe, shutter 180°), bloom, camera shake ikut kick, film grain, vignette, HUD timecode.

## Cara render semula

```bash
npm install                                  # three.js
node render.mjs out/video_noaudio.mp4        # ~3s/frame, Chromium headless (Playwright)
python3 music.py out/music.wav               # muzik asal 120 BPM, F minor
ffmpeg -i out/video_noaudio.mp4 -i out/music.wav -c:v copy \
  -af loudnorm=I=-14:TP=-1:LRA=7 -c:a aac -b:a 320k -ar 48000 \
  -movflags +faststart -shortest pantasbaca-showreel-15s-1080x1920.mp4
node render.mjs --stills 100 220 449         # semak frame tertentu -> out/stills/
```

Ubah teks, warna (`const C` dalam `main.js`) dan masa babak dalam `main.js`. Timeline beat (`KICKS`, `IMPACTS`) mesti sama dalam `main.js` dan `music.py`.

## Perlu disahkan

- **Warna brand:** guna biru `#1D4ED8` + kuning `#FFC83D` (warna sementara dalam `brand.md`). Tukar jika warna rasmi berbeza.
- **Logo:** tiada fail logo, jadi wordmark "PANTAS BACA" dibina dengan tipografi 3D. Hantar `logo.png` jika mahu logo sebenar di babak akhir.
- **Fakta yang digunakan:** tanpa eja, tanpa hafal, teknik artikulasi, 1-to-1 turn-taking, Pantas Baca (BM) dan TVR (English), sejak 1995 (lebih 30 tahun), kelas fizikal dan online (Zoom), 4 tahun ke atas. Video tidak menjanjikan hasil bacaan.
