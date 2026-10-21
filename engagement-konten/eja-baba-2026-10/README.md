# Engagement: "Eja B-A BA tapi tak jadi" (Okt 2026)

Video motion graphic lucu untuk FB/IG Reels/TikTok. Dibina dengan Claude (Python + ffmpeg). Suara dan bunyi dijana sendiri dalam ElevenLabs (Eleven v3).

## Fail

| Fail | Guna untuk |
|---|---|
| `MindaOptima_EjaBABA_Reels_1080x1920.mp4` | Versi akhir. Reels, TikTok, FB |
| `MindaOptima_EjaBABA_thumbnail.jpg` | Gambar cover |
| `aset/` | Audio ElevenLabs dan logo yang digunakan |
| `render.py` | Lukis animasi frame demi frame |
| `mix.py` | Susun suara mak dan sound effect, ratakan ke -14 LUFS |

Maklumat video: 1080×1920 (9:16), 18.6 saat, 30 fps. Audio -14 LUFS, puncak -1.5 dBTP.

## Babak

| Masa | Apa berlaku |
|---|---|
| 0.0–1.9s | Hook: "Bila anak eja “B-A BA”… tapi tak jadi perkataan 😂" |
| 1.9–5.1s | Anak mengeja: kad B, A, kemudian BA, dan T, U, kemudian TU (bunyi blip dan pop) |
| 5.1–8.5s | Mak: "Okay sayang… sambung. Jadi apa?" Kad bergabung jadi BATU dan tanda ? muncul |
| 8.5–10.8s | Anak fikir: 🤔 "Baaa… tuuu…" |
| 10.8–12.3s | "BOLA!" Kad berpusing jadi bola dan melantun keluar (boing ×3) |
| 12.3–15.6s | "Mak ayah:" 🫠, krik krik, Mak: "Haaaih… Ya Allah…" |
| 15.6–18.6s | End card: logo, "Siapa pernah? 😂 Komen 🙋 di bawah!", "Tanpa eja. Terus baca." |

Dialog anak hanya dipaparkan sebagai teks, kerana ElevenLabs tidak membenarkan suara kanak-kanak.

## Render semula

Fon (Fredoka, Baloo 2) diambil dari npm: `npm pack @fontsource/fredoka @fontsource/baloo-2`, kemudian ekstrak setiap .tgz ke `fonts/x_<nama-pakej>/`.

```bash
python3 render.py aset fonts out                  # video tanpa audio -> out/video_noaudio.mp4
python3 mix.py aset out/video_noaudio.mp4 akhir.mp4
python3 render.py aset fonts prev --preview 1.2,4.6,11.5   # semak frame tertentu
```

Masa setiap babak ada di bahagian atas `render.py` (`T_...`). Masa bunyi ada dalam senarai `ev` di `mix.py`. Kalau ubah satu, ubah kedua-duanya.
