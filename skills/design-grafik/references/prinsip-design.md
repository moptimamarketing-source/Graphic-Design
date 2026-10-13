# Prinsip Design & Semakan

Baca bila membina design dari kosong, mengubah template dengan banyak, atau bila pengguna minta **semak / komen design** yang mereka buat sendiri.

## 1. Hierarki: mata baca ikut turutan

Setiap design perlu **satu** benda paling besar. Turutan biasa:
1. Hook / tajuk (paling besar, 2–6 perkataan)
2. Visual (foto / ilustrasi)
3. Sokongan (2–3 poin pendek)
4. CTA (butang / kotak warna kontras)
5. Logo & maklumat kecil

Ujian 3 saat: kecilkan design jadi saiz thumbnail. Kalau tajuk dan CTA masih boleh dibaca, design dah okay.

## 2. Tipografi

- Maksimum **2 font** (satu tajuk, satu isi). Template guna satu keluarga (Poppins) dengan berat berbeza.
- Saiz minimum atas canvas 1080 lebar: isi ≥ 26px, nota kecil ≥ 20px. Lebih kecil tak terbaca atas telefon.
- Tajuk: line-height 1.0–1.1, letter-spacing sedikit negatif. Isi: line-height 1.4–1.6.
- Elak HURUF BESAR untuk ayat panjang. Okay untuk label/badge pendek.
- Jangan pecah frasa penting merentas baris ("Minggu Ke-\n5"). Guna `white-space: nowrap`.

## 3. Warna

- Kontras teks minimum 4.5:1 untuk teks biasa, 3:1 untuk tajuk besar. Semak: `brand_colors.py kontras "#teks" "#latar"`.
- Peraturan 60-30-10: 60% neutral/latar, 30% brand, 10% aksen (CTA, highlight).
- Teks putih atas kuning/oren cerah hampir selalu gagal kontras. Guna teks gelap.

## 4. Ruang

- Margin tepi ≥ 64px (atas canvas 1080). Teks rapat ke tepi nampak tak profesional dan boleh terpotong.
- Kumpulkan benda yang berkaitan, jarakkan yang tak berkaitan.
- Lebih baik buang satu poin daripada sumbat semua.

## 5. Saiz & zon selamat

| Kegunaan | --size | Nota |
|---|---|---|
| IG/FB feed | ig-post 1080x1350 | Paling banyak ruang dalam feed |
| Square / WhatsApp | ig-square / wa 1080x1080 | |
| Story / Reels cover | story 1080x1920 | Elak teks penting di atas 250px & bawah 350px |
| FB link / iklan landscape | fb-post 1200x630 | Teks kurang, visual lebih |
| Cetak | a4 / a5 → .pdf | Render `--scale 2`, margin dalam ≥ 10mm |
| Takwim setahun | a4-landscape | |

## 6. Senarai semak sebelum serah (semak gambar render, bukan HTML)

- [ ] Tiada `[ISI]` berbaki (kotak garis merah)
- [ ] Ejaan BM betul, nama program betul, hari sepadan dengan tarikh
- [ ] Tiada teks terpotong / terkeluar / bertindih
- [ ] Kontras teks okay
- [ ] Logo jelas, tak herot
- [ ] Satu CTA sahaja, maklumat hubungan betul
- [ ] Tiada janji tempoh hasil bacaan, tiada urgency palsu
- [ ] Foto kanak-kanak ada consent
- [ ] Saiz ikut platform

## 7. Bila pengguna minta semak design mereka (gambar upload)

Beri maklum balas ikut format:
1. **Yang dah bagus** (1–2 perkara, spesifik)
2. **3 perkara paling penting untuk dibaiki**, susun ikut kesan. Untuk setiap satu: apa masalah → kenapa penting → cadangan konkrit (contoh "naikkan tajuk ke 2x saiz sekarang", "tukar teks kuning atas putih ke biru gelap").
3. **Isu wajib** (ejaan salah, tarikh/hari tak sepadan, janji tempoh, maklumat hilang). Senarai penuh, jangan tapis.

Jangan beri 15 komen kecil. Pereka perlukan keutamaan, bukan senarai panjang.
Kalau sesuai, tawarkan untuk bina semula versi yang dibaiki menggunakan template.
