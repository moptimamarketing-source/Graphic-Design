# Skill `video-editing`: Cara Pasang & Guna

Skill ni buat Claude boleh **edit video betul-betul** (keluar fail .mp4 siap), khas untuk kerja marketing Minda Optima.

## Apa dia boleh buat

| Kau cakap… | Claude buat… |
|---|---|
| "Potong 5 saat awal video ni" | Potong klip |
| "Tukar jadi reels / TikTok" | Tukar ke 9:16 (latar blur, tak ada bar hitam) |
| "Sambung 3 klip ni" | Gabung jadi satu video |
| "Letak subtitle BM" | Tukar suara jadi teks, lepas tu bakar subtitle |
| "Letak tulisan 'Anak lambat membaca?' 3 saat awal" | Teks hook |
| "Letak logo kat atas kanan" | Watermark logo |
| "Masukkan lagu ni" | Muzik latar, auto perlahan bila ada orang bercakap |
| "Suara bising / tak jelas" | Buang noise, ratakan volume |
| "Buang bahagian diam-diam tu" | Jump cut, video jadi lebih padat |
| "Letak gambar CTA kat hujung" | End card |
| "Kecilkan nak hantar WhatsApp" | Compress bawah 15 MB |
| "Buatkan iklan video dari footage ni" | Rancang struktur iklan dan edit ikut panduan brand |

Dia juga ikut peraturan Minda Optima: tak janji "3 bulan boleh baca", ingatkan pasal consent muka budak (PDPA), dan tegur kalau muzik berhak cipta.

## Cara pasang (sekali je)

### A. Claude app / claude.ai (paling senang)
1. **Settings → Capabilities** → ON **"Code execution and file creation"**
2. **Customize → Skills** → tekan **+** → **Create skill** → **Upload a skill**
3. Pilih fail **`video-editing.zip`** (dalam folder `skills/` repo ni)
4. Pastikan toggle **ON**

⚠️ Jangan unzip dan zip semula. Upload fail zip yang asal.

### B. Claude Code di PC (untuk video besar / panjang)
1. Pasang ffmpeg:
   - Windows: buka Terminal → `winget install ffmpeg`
   - Mac: `brew install ffmpeg`
2. Salin folder `video-editing` ke:
   - Windows: `C:\Users\<nama-kau>\.claude\skills\`
   - Mac: `~/.claude/skills/`
3. (Pilihan, untuk subtitle automatik) `pip install faster-whisper`

## Cara guna

**Cara 1: cakap biasa.** Upload video, lepas tu tulis apa kau nak:
> "Tukar video ni jadi reels, letak subtitle BM, logo Minda Optima kat atas kanan, dan teks 'Belajar membaca tanpa mengeja' 3 saat pertama."

Claude akan guna skill ni sendiri.

**Cara 2: panggil terus.** Taip `/` dalam kotak chat, pilih **video-editing**.

## Tips supaya hasil cantik

- **Bagi bahan lengkap:** video, logo (PNG lutsinar paling cantik), lagu, gambar CTA, dan cakap untuk platform mana (TikTok? FB feed? WhatsApp?).
- **Semak subtitle** sebelum Claude bakar ke video, terutama nama dan loghat.
- **Video besar** (lebih ~10 minit atau ratusan MB): guna Claude Code di PC (cara B), atau potong dulu bahagian yang perlu.
- **Efek fancy** (animasi teks, transition gempak, colour grading): masih lebih sesuai buat di CapCut atau Premiere. Claude boleh siapkan bahan asas (potong, audio bersih, fail subtitle .srt) untuk kau import ke sana.

## Kalau ada masalah

| Masalah | Buat ni |
|---|---|
| Skill tak keluar | Semak toggle ON, atau panggil terus dengan `/video-editing` |
| "ffmpeg tidak dijumpai" | Pasang ffmpeg (lihat B.1), tutup & buka semula terminal |
| Subtitle automatik gagal | Kali pertama perlukan internet untuk muat turun model. Atau bagi skrip teks, Claude anggarkan masa subtitle |
| Tulisan salah ejaan | Minta Claude tunjuk fail subtitle dulu sebelum bakar |
