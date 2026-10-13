# Gaya Poster Awareness Minda Optima (siri "Tanda")

Ini gaya poster awareness yang team Marketing guna sekarang. Bila pengguna minta poster awareness, edukasi, tips, siri "tanda", atau "macam poster awareness biasa", **ikut gaya ni** dengan `templates/awareness.html`.

## Ciri gaya (dari poster sebenar team)

| Elemen | Spesifikasi |
|---|---|
| Saiz | Segi empat 1080x1080 (`--size ig-square`), siri carousel |
| Latar | Kuning cerah `#FEC412`, corak titik halftone di penjuru. Kadang-kadang tukar warna (tema biru/hijau/pink/oren/ungu dalam template) |
| Ilustrasi | Kartun gaya buku kanak-kanak, garis lembut, warna hangat. Watak tetap: **ibu bertudung pink, baju kurung corak bunga** + **anak lelaki ~5 tahun, rambut hitam pacak, baju raglan biru gelap/biru muda**. Latar bilik: tingkap, rak buku, pokok dalam pasu, meja kayu, pensel warna dalam bekas polka dot |
| Belon cakap | Putih krim `#FFF9F0`, garis luar hitam tebal, ekor ke arah watak. Cover guna belon besar |
| Label | Pil biru `#0A3D8F` teks putih: "Tanda 1", "Tanda 2", … |
| Tajuk | Baris 1 **merah** `#CF1F1F` (kata kunci), baris 2 **biru gelap** `#0B1F4D`. Font bulat tebal (Fredoka) |
| Sub-teks | 1 ayat, biru gelap, font Nunito tebal |
| Lencana | Bulat bergerigi biru gelap, garis putus-putus kuning di dalam, teks putih + ♥ kuning. Satu ayat rumusan ("Asas huruf belum kuat.") |
| Cover | Belon besar + label kuning garis putus ("Dari Sudut Membaca") + lencana kiri (sasaran umur) + bulatan putih garis merah ("5 tanda penting") |
| Hiasan | Garis "sinar" biru gelap di penjuru, bintang putih kecil |

## Kenapa teks dibuat dalam HTML, bukan dalam gambar AI

Poster asal ada teks yang dijana sekali oleh AI. Masalah biasa: **ejaan BM salah, huruf herot, susah diubah**. Cara yang lebih baik:
1. Jana **ilustrasi sahaja (tanpa teks)**
2. Teks, belon, label & lencana dibina dalam `awareness.html`, jadi ejaan tepat, tajam, dan senang ditukar
3. Tukar warna tema satu baris sahaja (`data-tema`)

## Aliran kerja

1. **Kandungan dulu.** Tulis tajuk siri + 4–6 tanda + slide penutup (CTA). Setiap tanda: kata kunci (merah) · sambungan (biru) · 1 ayat contoh · 1 ayat rumusan untuk lencana. Kandungan mesti jujur: tanda umum, bukan diagnosis. Jangan sebut keadaan perubatan (disleksia dll.).
2. **Ilustrasi** untuk setiap slide (lihat prompt di bawah):
   - Kalau alat jana gambar tersedia (contoh Higgsfield `generate_image`), **tanya pengguna dulu** sebelum guna, sebab ia guna kredit. Beritahu berapa gambar.
   - Kalau tiada, beri pengguna **prompt siap salin** untuk ChatGPT / Gemini / alat yang mereka guna, dan minta mereka upload hasilnya.
   - Kalau pengguna ada ilustrasi lama (tanpa teks), guna semula.
3. Namakan fail `ilustrasi-0.png` (cover), `ilustrasi-1.png` …, `ilustrasi-cta.png`, letak dalam folder sama dengan HTML.
4. Salin `awareness.html`, ubah teks & bilangan slide, render:
   `python render.py awareness.html tanda.png --size ig-square --slides <bilangan>`
5. Semak setiap gambar: belon tak tutup muka watak, lencana tak tutup tangan/buku penting. Laraskan `top`/`right` lencana atau `object-position` ilustrasi kalau perlu.
6. Sertakan caption carousel (atau cadang skill `content-iklan`).

## Prompt ilustrasi (salin & ubah adegan)

Gunakan prompt asas yang sama untuk SEMUA slide supaya watak konsisten. Tukar bahagian **[ADEGAN]** sahaja.

```
Children's book illustration, warm soft cartoon style, clean outlines, square 1:1.
A Malay mother wearing a pink hijab and a cream floral baju kurung, sitting at a wooden table
next to her 5-year-old son with spiky black hair wearing a navy and light-blue raglan shirt.
Cozy room: yellow wall, window with white curtain on the left, wooden bookshelf with colourful
books and a potted plant on the right, colourful pencils in a blue polka-dot cup on the table.
[ADEGAN]
Characters and table occupy only the BOTTOM 55% of the image. The TOP 45% is plain yellow wall
with nothing in it (empty space reserved for a speech bubble).
NO text, NO letters, NO words anywhere in the image.
```

Contoh **[ADEGAN]**:
- Tanda keliru huruf: *The mother holds up a blank white flash card, the boy holds two blank cards, looking curious.*
- Tanda sukar bunyikan: *They look at an open picture book with an apple and a cat picture; the boy scratches his head, confused.*
- Tanda cepat bosan: *The mother points at an open storybook; the boy rests his chin on his hand, bored, looking at a red toy car.*
- Tanda belum yakin: *The boy holds a storybook, looking shy and worried; the mother gently places a hand on his shoulder, smiling encouragingly.*
- Cover: *Both happily reading a big open picture book together, a navy school backpack with a yellow star beside the table.*
- CTA: *The boy smiling proudly reading a book aloud, the mother clapping happily.*

Nota:
- Minta kad / buku **kosong tanpa huruf**. Kalau perlu huruf (b, d, p), tambah sebagai teks HTML atas kad, bukan dari AI.
- Kalau watak berubah rupa antara slide, guna gambar slide pertama sebagai rujukan (image reference) dalam alat jana gambar.
- Untuk program English (TVR), watak & latar sama, tukar buku/kad sahaja.

## Variasi yang pengguna selalu minta

- **Tukar warna:** `data-tema` pada `<body>` (semua slide) atau pada satu `<section>` (satu slide). **Penting:** tema hanya tukar warna latar HTML. Dinding dalam ilustrasi kekal warna asal. Untuk tukar penuh, jana ilustrasi dengan warna dinding yang sama (tukar "yellow wall" dalam prompt kepada "light blue wall" / "soft green wall" dll.). Kalau tak, gunakan tema yang sepadan dengan dinding ilustrasi.
- **Tukar warna merah tajuk:** `--hot`. Pastikan masih kontras atas krim (`brand_colors.py kontras`).
- **Tukar watak** (contoh ayah, anak perempuan bertudung): ubah prompt ilustrasi, layout kekal.
- **Siri lain** guna struktur sama: "Tips latih anak membaca di rumah", "Mitos vs fakta", "Soalan lazim ibu bapa". Tukar "Tanda N" kepada "Tip N" / "Mitos" / "Soalan".
