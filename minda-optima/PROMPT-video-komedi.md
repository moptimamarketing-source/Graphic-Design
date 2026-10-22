# Prompt templat — Video awareness komedi Minda Optima (HyperFrames)

> Cara guna: salin bahagian **PROMPT** di bawah, isi semua `[...]`, kemudian tampal ke Claude Code.
> Contoh siap: `minda-optima/faham-tak-bapa/` (video "Faham Tak?" versi Bapa).

---

## PROMPT

```
[LINK FOLDER GOOGLE DRIVE]
Ini fail yang saya dah buat: hook + tip + punchline. Sambungkan, edit, dan buat typography. Guna Opus 5.5 dan HyperFrames.

# Tugasan: Video awareness komedi Minda Optima — "[TAJUK]" versi [WATAK]

Edit video TikTok/Reels 9:16 (±15–20s) untuk Minda Optima, program membaca kanak-kanak di Malaysia.
Konten awareness yang lucu, BUKAN jualan keras. Guna HyperFrames.

## Input (dalam folder Drive di atas)
- `(hook).mp4`, `(tip).mp4`, `(punchline).mp4`: klip Seedance, [WATAK] bercakap ke kamera
- `[watak]-1.wav`, `[watak]-2.wav`, `[watak]-3.wav`: suara ElevenLabs voice "[NAMA SUARA]" (Melayu Malaysia)
- Logo: "MindaOptima logo latest.png" dalam Drive
- Folder kerja: `minda-optima/[nama-projek]/` (subfolder `raw/`, `audio/`, `final/`)

## Dialog
- [watak]-1 (hook): "[AYAT HOOK]"
- [watak]-2 (tip): "[AYAT TIP]"
- [watak]-3 (punchline): "[AYAT PUNCHLINE]"

## Langkah 1 — Semak
Transcribe semua audio untuk timing perkataan. Semak klip: lip-sync, muka konsisten, tiada watermark AI.
Suara mesti dari fail ElevenLabs sahaja (bukan audio Seedance). Kalau lip-sync klip tak padan dengan
fail ElevenLabs, regangkan video ikut frasa (time-warp) supaya mulut ikut suara. Lapor masalah dalam ringkasan.

## Langkah 2 — Susunan & visual

**Babak A — Hook ((hook).mp4):**
- "[FRASA 1]" → [visual, contoh: bubble chat 3D "...", SFX pop]
- "[FRASA 2]" → [visual + SFX]
- "[FRASA 3]" → [teks 3D "...", snap zoom muka, SFX record scratch]

**Babak B — Tip + typography ((tip).mp4 dalam kad, latar brand beranimasi):**
- "[FRASA]" → [kad / teks 3D / ikon / efek spam]
- "[FRASA]" → [...]
- Gaya: laju, snap cut, 3D fonts, gaya creators.hustle TikTok, ikon mesra kanak-kanak

**Babak C — Punchline ((punchline).mp4):**
- "[FRASA]" → [label teks]
- "[FRASA LAWAK AKHIR]" → teks 3D, freeze frame muka paling deadpan + snap zoom
- SFX cengkerik pada jeda, kemudian "dun dun"

**Babak D — End card (~1.5s):** logo Minda Optima + "[TAGLINE]", SFX chime

## Gaya umum
- Caption: subtitle penuh BM, bold, muncul perkataan demi perkataan, kata kunci diwarnakan, ejaan tepat ikut dialog
- Muzik: instrumental ceria gaya sitcom, bebas hak cipta, ducking bawah suara, senyap pada momen lawak
- Safe zone TikTok/Reels: elak teks penting di 15% bawah dan tepi kanan
- Warna brand dari logo: biru #0B6FB8, biru langit #1FB3EA, oren #F5961F, merah #E6202F, kuning #FFD43B

## Output
- MP4 H.264, 1080x1920, 30fps, AAC 48kHz, -14 LUFS
- Upscale klip ke 1080p kalau 720p/480p
- Simpan `final/[nama-projek]-final.mp4`, commit & push
- Hantar fail final + ringkasan pendek apa yang diedit
```

---

## Nota teknikal untuk Claude (dari projek "Faham Tak?")

Bahagian ini supaya projek seterusnya tak ulang masalah yang sama. Ikut kecuali persekitaran dah berubah.

**Guna semula projek lama sebagai titik mula.** Salin `faham-tak-bapa/tools/` dan `faham-tak-bapa/hyperframes/` (fonts, vendor, hyperframes.json, package.json), kemudian ubah:
- `tools/build.py`: `PHRASES`, `CHUNKS`, `PIECES` (tempo), `ANCHORS` (sauh lip-sync), event SFX dalam `mix()`, `FREEZE_AT`
- `tools/index.template.html`: teks overlay dan animasi setiap babak (index.html dijana daripadanya, jangan edit index.html terus)
- `tools/make_sfx.py`: jana semula SFX + muzik sintesis kalau perlu

**Muat turun dari Drive:** fail yang dikongsi boleh dimuat turun terus:
`curl -sSL -o fail "https://drive.usercontent.google.com/download?id=<ID>&export=download&confirm=t"`.
Cari ID dengan Google Drive `search_files` (`parentId = '<id-folder>'`).

**Transkripsi:** HuggingFace disekat oleh proxy, jadi faster-whisper tak boleh muat model. Guna model Whisper ONNX dari GitHub:
- `https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-small.tar.bz2` + `pip install sherpa-onnx`
- Tiada timestamp perkataan, jadi: cari segmen bersuara dengan envelope tenaga, transcribe setiap segmen untuk label frasa, kemudian bahagi masa perkataan ikut suku kata dalam frasa.

**Lip-sync:** klip Seedance biasanya ikut audio Seedance, bukan fail ElevenLabs. Bandingkan segmen frasa kedua-dua fail, kemudian set `ANCHORS` (masa_suara → masa_klip) dan warp video frame demi frame. Kadar 0.7x–1.3x masih nampak semula jadi; laju semasa jeda tak mengapa.

**HyperFrames (npm `hyperframes`, uji pada v0.8.181):**
- Pasang dalam scratchpad: `npm install hyperframes@0.8.181 gsap@3.14.2 @fontsource/lilita-one @fontsource/baloo-2 @fontsource/noto-color-emoji`
- CDN jsdelivr disekat, jadi GSAP dan font disimpan setempat (`vendor/`, `fonts/`)
- Chrome: `export HYPERFRAMES_BROWSER_PATH=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`
- Render: `npx hyperframes render . -o out.mp4 -f 30 -q high` (~2.5 minit untuk 20s), kemudian export semula dengan ffmpeg (`-c:v libx264 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart`)
- Semak: `npx hyperframes lint .` dan `npx hyperframes snapshot . --at 1.0,3.5,... --no-end`
- Perangkap GSAP: `fromTo` render nilai mula serta-merta, jadi elemen yang dianimasi lebih sekali (flash, zoom) guna `tl.set` + `tl.to`. Keadaan tersembunyi awal guna `gsap.set`, bukan `tl.set(..., 0)`.
- Animasi zoom/gerak pada div pembalut, bukan terus pada `<video>`.
- Hanya satu fail HTML dengan `data-composition-id` dalam folder hyperframes (template diletak dalam `tools/`).

**Durasi:** 3 fail suara biasanya ~20s+. Kalau sasaran 15s, minta skrip lebih pendek dari awal; mempercepat suara lebih 1.2x akan bunyi tergesa-gesa.

**Peraturan kandungan:** jangan janji hasil bacaan dalam tempoh tertentu; Minda Optima ialah program membaca (bukan taska); muzik mesti bebas hak cipta.
