# Skill Claude untuk Kerja Marketing & Grafik Minda Optima

Ada **3 skill baru** dalam folder ni, dibina ikut senarai kerja dalam `Design.md` (package, takwim, poster perayaan, notis, notis minggu ke-5, notis ibu bapa, pemberitahuan, iklan poster ads, iklan video, program cuti sekolah).

| Skill | Fail upload | Buat apa |
|---|---|---|
| **design-grafik** | `design-grafik.zip` | Poster iklan, poster perayaan, notis, takwim, pakej harga, carousel IG, semak design. Keluar **PNG / PDF siap**. |
| **video-editing** | `video-editing.zip` | Edit video: potong, reels 9:16, subtitle BM, logo, muzik, end card. Keluar **MP4 siap**. |
| **content-iklan** | `content-iklan.zip` | Caption, copy iklan FB/IG/TikTok, skrip video, kalendar content, kit kempen. |

Ditambah 2 skill daripada boss (`parent-comms`, `teacher-ops`), yang dah ON dalam akaun kau.

---

## Pasang (sekali je, ±5 minit)

1. Claude → **Settings → Capabilities** → ON **"Code execution and file creation"**
2. **Customize → Skills** → **+** → **Create skill** → **Upload a skill**
3. Upload satu per satu: `design-grafik.zip`, `video-editing.zip`, `content-iklan.zip`
4. Pastikan setiap toggle **ON**

⚠️ Jangan unzip dan zip semula. Upload fail zip yang asal.

**Turn ON juga (dah ada dalam Claude, ikut arahan boss):** Customize → Skills → Excel, Word, PowerPoint, PDF.
**Plugin (Customize → Plugins → Discover):** **Marketing** dan **Brand Voice** untuk team marketing.

---

## Cara guna: cakap je macam biasa

Claude akan pilih skill sendiri. Contoh:

**Poster iklan**
> "Buat poster IG untuk program cuti sekolah Disember. Umur 4–7 tahun, centre Batu Caves, WhatsApp 01x-xxxx. Ni logo kami." *(upload logo)*

**Notis minggu ke-5**
> "Buat notis minggu ke-5 untuk bulan November 2026. Hari Sabtu dan Ahad minggu ke-5 tiada kelas. Saiz WhatsApp dan A4 untuk tampal kat centre."

**Takwim**
> "Buat takwim 2027 untuk kelas. Ni senarai cuti sekolah dan cuti umum." *(paste senarai)*

**Poster perayaan**
> "Poster Selamat Hari Raya Aidilfitri, saiz IG post dan story."

**Pakej harga**
> "Poster pakej yuran: Pantas Baca RM___, TVR RM___, combo RM___."

**Semak design**
> "Semak poster aku ni, apa boleh baiki?" *(upload gambar)*

**Video**
> "Tukar video ni jadi reels, letak subtitle BM dan logo." *(upload video)*

**Content**
> "Tulis 3 versi copy iklan FB untuk sesi penilaian percuma."
> "Buat kalendar content bulan Disember, 4 post seminggu."
> "Buat kit kempen penuh untuk pendaftaran tahun 2027."

Atau taip `/` dalam chat dan pilih nama skill.

---

## Benda yang Claude akan buat secara automatik

- Maklumat yang kau tak bagi (harga, tarikh, nombor), dia **tak reka**. Dia letak `[ISI]` (kotak garis merah dalam gambar) dan senaraikan apa yang perlu diisi.
- Dia **tak janji** "3 bulan boleh baca", tak buat "tinggal 2 slot" palsu.
- Dia ingatkan pasal **consent** bila ada muka budak.
- Untuk iklan berbayar, dia elak ayat yang selalu buat iklan Meta **ditolak** ("Anak ANDA lemah membaca?").
- Dia semak sendiri gambar yang dihasilkan sebelum bagi kau.

## Supaya hasil lagi gempak

1. **Bagi logo asal** (PNG latar lutsinar). Claude boleh ambil warna brand dari logo secara automatik.
2. **Bagi kod warna & font brand** kalau ada. Lepas tu boleh terus kemas kini fail `design-grafik/references/brand.md`, supaya semua design ikut brand tanpa perlu cakap setiap kali.
3. **Bagi foto kelas sebenar.** Foto sebenar menang lawan gambar stok.
4. **Minta 2–3 variasi**, lepas tu pilih yang terbaik.
5. Simpan design yang kau suka, dan tunjuk kepada Claude sebagai contoh gaya ("buat macam poster ni").

## Kalau ada masalah

| Masalah | Buat ni |
|---|---|
| Skill tak keluar | Semak toggle ON, atau taip `/nama-skill` |
| Poster tak jadi gambar ("tiada enjin render") | Guna Claude Code di PC yang ada Chrome atau Edge, atau minta Claude bagi fail HTML. Buka dalam Chrome, lepas tu Print → Save as PDF. |
| Video: "ffmpeg tidak dijumpai" | PC: `winget install ffmpeg` (Windows) / `brew install ffmpeg` (Mac) |
| Subtitle automatik gagal | Bagi skrip teks, Claude anggarkan masa subtitle |
| Font lain dari yang dijangka | Font perlu internet (Google Fonts) atau dipasang dalam komputer |

## Pasang di Claude Code (PC) — pilihan untuk kerja berat

Salin folder `design-grafik`, `video-editing`, `content-iklan` ke:
- Windows: `C:\Users\<nama-kau>\.claude\skills\`
- Mac: `~/.claude/skills/`

Perlu: Python, Chrome/Edge (untuk poster), ffmpeg (untuk video).
