# Notis & Pemberitahuan Ibu Bapa

Guna `templates/notis.html`. Notis biasanya perlukan **dua output**:
1. **Gambar notis** (ig-post / wa 1080x1080 untuk WhatsApp, a4 PDF kalau nak cetak/tampal di centre)
2. **Teks caption WhatsApp** untuk hantar bersama gambar (3–6 baris, ringkas)

Bagi kedua-duanya sekali. Jangan tunggu diminta.

## Prinsip

- **Satu notis, satu perkara.** Cuti + yuran + aktiviti dalam satu notis = ibu bapa baca separuh.
- **Jawab 5 soalan dalam 5 saat:** apa berlaku · bila · siapa terlibat (semua centre / centre tertentu) · apa ibu bapa perlu buat · tanya siapa.
- **Tarikh lengkap dengan hari**: "Sabtu, 29 November 2026". Hari dan tarikh MESTI sepadan. Semak dengan `takwim.py` atau kalendar, jangan agak.
- **Nada:** hormat, jelas, tak menyalahkan. "Dimaklumkan…" / "Untuk makluman ibu bapa…"
- **Tone warna** (`--tone` dalam template): biru = info biasa · oren = perubahan jadual · merah = penting/segera (jarang guna).
- Fakta yang tak diberi (tarikh, centre, nombor) → `[ISI]` dan senaraikan di akhir jawapan.

## Rangka ikut jenis

### Cuti umum / cuti perayaan
Tajuk: "Cuti [Nama Perayaan]" · Butiran: tarikh cuti, kelas mula semula bila · Perhatian: kelas ganti (kalau ada) atau "tiada kelas ganti". Cuti Islam bergantung pengisytiharan, jadi tambah "tertakluk kepada pengumuman rasmi" kalau tarikh belum sah.

### Minggu ke-5
Sesetengah bulan ada hari yang muncul kali ke-5 (contoh Sabtu ke-5). Jalankan `takwim.py minggu5 --tahun YYYY --hari sabtu,ahad` untuk dapatkan tarikh tepat.
**Apa yang berlaku pada minggu ke-5 (cuti / kelas ganti / aktiviti) ialah polisi syarikat. Jangan agak. Tanya pengguna** kalau belum diberitahu.
Tajuk: "Makluman Minggu Ke-5" · Butiran: tarikh-tarikh · status kelas · apa ibu bapa perlu buat.

### Kelas ganti
Kelas asal (tarikh/masa) → kelas ganti (tarikh/masa/lokasi) · sebab ringkas (tak perlu panjang, tak salahkan guru) · minta sahkan kehadiran sekali sahaja.

### Peringatan yuran
Jumlah · tarikh akhir · cara bayar · siapa dihubungi. Nada lembut, andaikan terlupa. **Jangan reka jumlah atau akaun bank.**

### Cuti sekolah / program cuti sekolah
Dua mesej berbeza: (a) jadual kelas biasa semasa cuti sekolah, (b) promosi program khas cuti sekolah. Kalau (b), guna `poster-iklan.html` dan skill `content-iklan` untuk caption.

### Perubahan jadual / centre
Apa berubah · berkuat kuasa bila · kesan kepada siapa · apa ibu bapa perlu buat · tempoh peralihan.

## Caption WhatsApp (contoh struktur)

```
Assalamualaikum ibu bapa yang dihormati 🙏
Dimaklumkan [perkara] pada [hari, tarikh].
[Apa yang berlaku kepada kelas].
[Satu tindakan untuk ibu bapa, jika ada].
Sebarang pertanyaan, boleh hubungi admin centre.
Terima kasih.
```
Maksimum satu emoji. Mesej individu kepada ibu bapa (balas aduan, follow-up) → itu kerja skill `parent-comms`.
