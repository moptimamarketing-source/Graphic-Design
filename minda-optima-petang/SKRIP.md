# Minda Optima — "Anak Sekolah Pagi, Petang Buat Apa?"

Video ad AIDA · kelas fizikal sesi petang · 9:16 (FB/IG/TikTok) · CTA: klik link → WhatsApp

**Status:** skrip siap. VO, visual dan assembly belum dibuat.

| Fail | Guna |
|---|---|
| `vo/vo_elevenlabs.txt` | Teks VO **satu take penuh**, siap paste ke ElevenLabs (ada break tag) |
| `vo/skrip.txt` | Teks bersih, satu baris = satu section (untuk subtitle / transcript cut) |
| `tools/vo_timing.py` | Ambil timestamp **sebenar** [1]–[7] dari fail VO → `timing.json` |

---

## 1. Perlu isi / sahkan sebelum produksi

1. **"masih ada slot"** dalam CTA ialah dakwaan kekurangan slot. Guna hanya kalau memang ada slot terhad untuk sesi petang. Kalau tidak, tukar kepada: *"Nak tahu jadual kelas petang? Klik link dan WhatsApp kami sekarang!"*
2. **Lokasi centre** yang buka sesi petang: `[ISI]`. Iklan tak sebut lokasi, tapi team sales mesti sedia jawab bila parent WhatsApp.
3. **Warna brand dan fail logo** (PNG lutsinar) untuk overlay dan end card: `[ISI]`
4. **Link WhatsApp** (wa.me + mesej pra-isi, contoh *"Nak tahu jadual kelas petang"*): `[ISI]`
5. **Suara ElevenLabs:** voice ID Malaysian Malay yang akan dipakai: `[ISI]` (lihat bahagian 3)

Semakan polisi iklan (sudah OK):
- Hook menceritakan situasi umum ("Anak sekolah pagi…"), bukan "anak anda + masalah".
- Tiada janji tempoh atau hasil bacaan. Tiada statistik. Overlay "3 JAM vs 0 MINIT" ialah dramatisasi, bukan data.
- Semua USP ada dalam fakta syarikat: fizikal, tanpa hafal, sejak 1995, 1-to-1 bergilir.
- Talent dan kanak-kanak dijana AI, jadi isu consent PDPA tidak timbul. Semak keperluan label AI di Ads Manager semasa publish.

---

## 2. Skrip produksi (masa = ANGGARAN)

> Masa di bawah ialah anggaran kira dari bilangan perkataan (≈2.65 perkataan/saat + break). **Ganti dengan output `vo_timing.py`** selepas VO siap. Seedance mesti ikut masa sebenar.

| # | Masa (anggaran) | VO | Visual | Overlay / SFX |
|---|---|---|---|---|
| 1 HOOK | 0.0 – 4.1 | Anak sekolah pagi, balik rumah petang… asyik main phone je? | Ibu di pintu ruang tamu tengok anak leka dengan phone. Lighting moody, slow push-in ke muka ibu | "ANAK SEKOLAH PAGI." → "PETANG… BUAT APA?" (3D bold, hentak ikut beat) · low whoosh + tension drone |
| 2 EXAGGERATE | 4.9 – 9.9 | Main phone berjam-jam boleh, tapi ajak membaca lima minit pun… susah! | Jump-cut: anak scroll (fast-motion) ↔ buku berhabuk tak disentuh | Counter "⏱ 3 JAM" (merah) vs "❌ 0 MINIT" (kelabu) · freeze + stab ikut angka; stab besar pada "susah!" |
| 3 BRIDGE | 10.7 – 15.2 | Haa parents! Apa kata selitkan masa petang anak dengan kelas membaca? | Ibu: kecewa → senyum (lightbulb). Light burst transition | Flip-card gelap → warna brand · "ding" chime pada "Haa" |
| 4 USP 1 | 16.0 – 19.8 | Sekarang Minda Optima dah buka kelas fizikal sesi petang, tau! | Kelas fizikal yang ceria, cikgu mengajar kumpulan kecil | "KELAS FIZIKAL SESI PETANG ✅" (pop) |
| 5 USP 2 | 20.6 – 26.5 | Anak belajar membaca dengan teknik yang santai dan fun, tanpa perlu hafal suku kata. | Close-up anak membaca dengan selesa | "TANPA HAFAL SUKU KATA": coret "HAFAL SUKU KATA", tinggal "TANPA" |
| 6 USP 3 | 27.3 – 35.2 | Sejak 1995, kami bantu anak-anak membaca dengan bimbingan cikgu secara satu-ke-satu bergilir, ikut tahap masing-masing. | Split-screen: "1995" besar ↔ cikgu bimbing seorang anak, kemudian beralih ke anak seterusnya | "SEJAK 1995" + "1-TO-1 BERGILIR" (stamp) |
| 7 CTA | 36.0 – 42.0 (+ end card ~4s) | Nak tahu jadual kelas petang yang masih ada slot? Klik link dan WhatsApp kami sekarang! | Ibu senyum direct-to-camera, background branded | "KLIK LINK DI BAWAH 👇" (bounce/pulse) + logo fade in · upbeat closing sting |

**Durasi:** anggaran VO ≈ **42–46s**. Dengan end card, video ≈ **46–50s**, bukan 55s. Untuk iklan, video yang lebih pendek biasanya lebih baik, jadi cadangan saya jangan panjangkan skrip. Kalau tetap mahu ~55s, ada dua cara: (a) set speed ElevenLabs ~0.92, atau (b) panjangkan end card ke ~6s dengan logo + "WhatsApp kami" statik.

---

## 3. STEP 1: VO ElevenLabs

**Teks:** paste `vo/vo_elevenlabs.txt` sebagai satu request sahaja, supaya tone dan energy konsisten.

Perubahan berbanding brief (untuk jaga loghat dan transcript cut):
- **"1995" ditulis "sembilan belas sembilan puluh lima"** supaya tak dibaca dalam English. Overlay dan subtitle kekal "1995".
- **`<break time="0.8s" />` ditambah antara setiap section.** Celah ini jadi titik potong yang bersih untuk HyperFrames dan untuk `vo_timing.py`.

**Setting cadangan:**

| Setting | Nilai |
|---|---|
| Model | **Eleven Multilingual v2**. Model v3 tak sokong tag `<break>`, jadi jangan guna untuk teks ini. |
| Voice | Satu suara wanita Malaysian Malay, mesra (gaya kakak). Dengar preview dan elak yang berbunyi Indonesia (contoh sebutan "sekarang", "petang", "tau"). |
| Stability | 0.45–0.55 (cukup ekspresif untuk "Haa parents!", tapi tak lari loghat) |
| Similarity | 0.75 |
| Style | 0.2–0.3 |
| Speaker boost | On |
| Speed | 1.0 (0.92 kalau mahu ~55s) |
| Output | WAV 44.1kHz atau MP3 192kbps |

**Semak selepas generate:** "phone", "fun", "parents", "WhatsApp" disebut gaya Malaysia · "satu-ke-satu" jelas · tiada sebutan Indonesia. Kalau ada perkataan yang tersasul, generate semula take penuh. Jangan tampal sebahagian.

**Ambil timestamp sebenar:**
```bash
pip install faster-whisper
python tools/vo_timing.py vo/vo_full.mp3 --out vo/timing.json
```
Output: total duration, start/end setiap section [1]–[7], dan word timestamps (untuk transcript-driven cut dan beat overlay di STEP 3).
Alternatif: endpoint ElevenLabs *text-to-speech with timestamps* terus pulangkan alignment per aksara.

---

## 4. STEP 2: Prompt Seedance 2.5 (guna selepas `timing.json` siap)

**Peraturan umum:**
- 9:16, photorealistic, cinematic, latar rumah/kelas Malaysia.
- **Durasi klip = durasi section sebenar + ~0.5s handle.** Section yang lebih panjang dari had model dipecah kepada 2 shot.
- **Talent tak bercakap** (VO ialah narrator). Mulut tertutup atau senyum sahaja, supaya tiada lip-sync yang tak padan.
- **Tiada teks dalam visual.** Semua teks dibuat sebagai overlay di HyperFrames. Muka surat buku dibiar kabur atau bersudut, sebab AI selalu hasilkan tulisan merepek.
- Negative: `text, subtitles, logo, watermark, distorted hands, extra fingers, deformed face`

**Karakter tetap.** Paste blok yang sama dalam setiap shot supaya rupa talent konsisten:
- `IBU` = *Malay woman, early 30s, warm friendly face, wearing a dusty-pink bawal tudung and a cream modern baju kurung*
- `ANAK` = *Malay boy, about 8 years old, short black hair, wearing a plain light-blue t-shirt after school*

| Shot | Section | Prompt |
|---|---|---|
| S1 | 1 | `IBU` standing at the doorway of a Malaysian terrace-house living room in late afternoon, watching `ANAK` slouched on the sofa absorbed in his phone, phone glow on his face. Moody, dim interior, warm orange sunset light through window blinds. Camera starts wide behind the mother, then slow push-in to a close-up of her worried, tired face. |
| S2a | 2 (bahagian 1) | `ANAK` lying on the sofa scrolling his phone continuously, thumb swiping, light outside the window shifting from afternoon to dusk, static locked-off camera, time-passing feel. *(Laju 3–4× di HyperFrames.)* |
| S2b | 2 (bahagian 2) | Macro shot of a closed children's storybook on a wooden side table, thin layer of dust on the cover, dust particles floating in a beam of window light, completely still, slow subtle dolly-in. |
| S3 | 3 | Close-up of `IBU` in the living room: frustrated sigh, then her eyes widen and a bright smile spreads as she gets an idea. The light warms and brightens around her face. Gentle handheld. |
| S4 | 4 | Bright, cheerful reading classroom in the afternoon, warm sunlight, colourful but tidy. A friendly Malay female teacher in a tudung sits at a low table with 5–6 children aged 5–8, the children smiling and engaged, holding small reading books. Slow lateral tracking shot. |
| S5 | 5 | Close-up of a Malay girl about 6 years old, sitting comfortably and reading a picture book, finger tracing the line, relaxed and smiling. Shallow depth of field, book pages soft-focus, warm natural light. |
| S6a | 6 (bahagian 1) | In the same bright classroom, the teacher sits beside one child, pointing at the book and guiding the child to read aloud one-to-one, while the other children at the table read quietly and wait their turn. Medium shot, slow push-in. |
| S6b | 6 (bahagian 2) | The teacher smiles, turns and moves her attention to the next child beside her, taking turns one by one. Same classroom, same light, smooth slow camera arc. *(Kongsi frame split-screen dengan grafik "1995".)* |
| S7 | 7 + end card | `IBU`, medium close-up, looking directly into the camera with a warm confident smile and a small nod. Clean, softly lit studio background in `[ISI warna brand]`, empty space in the lower third for text. Static camera. Generate cukup panjang untuk sambung ke end card. |

---

## 5. STEP 3: Cue assembly HyperFrames (ringkas)

Semua cue dikunci pada **word timestamps** dalam `timing.json`, bukan masa anggaran.

| Section | Cut / cue |
|---|---|
| 1 | Teks "ANAK SEKOLAH PAGI." hentak pada perkataan "pagi". "PETANG… BUAT APA?" hentak pada "phone". Drone bermula di 0.0. |
| 2 | Cut S2a ↔ S2b ikut beat "boleh" / "tapi". Counter naik sepanjang "berjam-jam". Freeze + stab pada "susah!" |
| 3 | Ding + flip-card pada "Haa". Senyum ibu selari dengan "Apa kata". |
| 4 | Pop "✅" pada perkataan "petang". |
| 5 | Garis coret melintasi "HAFAL SUKU KATA" pada perkataan "hafal". |
| 6 | Stamp "SEJAK 1995" pada "Sejak". Stamp "1-TO-1 BERGILIR" pada "satu-ke-satu". |
| 7 | "KLIK LINK DI BAWAH 👇" masuk pada "Klik". Logo fade-in + sting selepas "sekarang!". End card ~4s. |

Muzik latar mesti bebas royalti atau dari library platform. Turunkan muzik (ducking) bawah VO.
