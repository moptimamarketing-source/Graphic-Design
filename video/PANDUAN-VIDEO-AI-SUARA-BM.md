# Panduan: Video AI (Seedance) → Suara BM Malaysia → Edit Hyperframes

Rujukan projek contoh: `video/mak-anak-baca/`

## 1. Jana video (Seedance)
- Tulis dialog dalam prompt, tapi **anggap suara akan diganti**. Seedance biasanya tetap keluar loghat Indonesia ("coba", "gambai").
- Elak teks yang boleh dibaca (kulit buku, papan tanda). AI akan tulis teks merepek. Tulis "plain cover, no readable text".
- Simpan masa setiap shot (contoh: 0–4s, 4–6s, 6–15s) untuk rujukan edit nanti.

## 2. Semak suara asal
- Transkripsi (whisper) untuk cari perkataan berloghat Indonesia, dan catat **masa setiap perkataan**. Masa ni nanti jadi panduan gerak mulut.

## 3. Jana suara baru (Higgsfield)
- Model: **Qwen Audio TTS** (`qwen_audio_tts`)
- Voice: **Talent Minda Optima - Sesi Petang** (element)
- `language: ms`
- Instruction: "Malaysian Malay accent, not Indonesian, …(emosi)"
- `speech_rate` 1.3–1.35 supaya muat dengan masa video
- Jangan guna klon suara asal (Seed Audio). Loghat Indonesia ikut sekali.
- Kos sangat rendah (~0.4 kredit setiap baris), jadi jana 2 versi dan pilih yang terbaik.

## 4. Selaraskan dengan gerak mulut
- Potong suara **ikut frasa** (contoh: "Rupanya dia bukan membaca" | "Dia hafal" | "Cuba tutup gambar…").
- Letak setiap frasa pada masa mulut asal mula bergerak (dari langkah 2).
- Laraskan kelajuan frasa (0.82–0.92x) supaya panjangnya sama dengan mulut.
- Sasaran: setiap perkataan dalam lingkungan ±0.1s daripada mulut asal.

## 5. Tingkatkan kualiti gambar
- Higgsfield **Upscale Video** → ByteDance, preset `aigc`, 1080p.
- Kecilkan semula ke **720×1280** semasa render. Hasilnya lebih tajam daripada fail asal 480p.

## 6. Edit dalam Hyperframes (`hyperframes/index.html`)
- Satu `<video>` setiap shot, dengan `muted` pada shot yang suaranya diganti.
- Shot tanpa dialog (contoh: anak): kekalkan bunyi asal.
- Gerak kamera pada wrapper `.cam`: slow push-in, **snap zoom** pada punchline, goyang handheld.
- `<audio>` untuk setiap frasa suara, SFX whoosh/punch pada snap zoom, room tone sepanjang video.
- Jalankan `npx hyperframes lint .` dan pastikan 0 error.

## 7. Render & audio
- Render dalam **sandbox Higgsfield**. Sandbox Claude tak boleh muat turun dari CDN Higgsfield.
- `npx hyperframes render --fps 24 --quality delivery` (guna mod background).
- Naikkan kuat bunyi ke **-14 LUFS** (standard TikTok/Reels).

## 8. Semak sebelum post
- Transkripsi video akhir dan bandingkan masa perkataan dengan video asal.
- Tengok frame pada snap zoom.
- Tonton sekali penuh dengan bunyi.

## 9. Caption & objektif
- Video lawak tanpa CTA → objektif **awareness**. CTA caption: "Komen SAMA…" untuk engagement.
- Untuk iklan berbayar: retarget penonton 50% ke atas dengan iklan kedua yang ada CTA (contoh: sesi penilaian).
- Post sekitar 8–10pm (anggaran umum, semak Insights).
