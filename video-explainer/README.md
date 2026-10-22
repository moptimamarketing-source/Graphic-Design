# Video explainer Minda Optima (9:16)

Video gaya "faceless explainer": potongan pantas, latar flatlay bertekstur, tipografi kinetik dan sari kata. Ia dibina dengan [Remotion](https://www.remotion.dev/).

## Fail penting

| Fail | Isi |
|---|---|
| `skrip-vo.txt` | Skrip voiceover (rakam di ElevenLabs) |
| `public/vo.mp3` | Voiceover sebenar |
| `src/timing.json` | Masa setiap babak, frasa sari kata dan SFX (saat) |
| `src/scenes.tsx` | Visual setiap babak (S1–S21) |
| `src/lib.tsx` | Latar (kertas, felt, kayu, damask, swirl, langit) dan efek (odometer, cop, teropong, papan hitam, telefon) |
| `scripts/make_textures.py` | Jana tekstur PNG dalam `public/tex` |
| `scripts/make_audio.py` | Jana `public/sfx.wav` dan `public/music.wav` daripada `timing.json` |
| `scripts/align_vo.py` | Cari masa setiap baris dalam VO (Whisper) |

## Cara guna

```bash
npm install
npm run textures      # sekali sahaja
npm run sfx           # setiap kali timing.json berubah
npm run studio        # pratonton
npm run render        # -> out/final.mp4
```

Untuk tukar voiceover:
1. Ganti `public/vo.mp3`.
2. Jalankan `scripts/align_vo.py` dan kemas kini `src/timing.json`.
3. Jalankan `npm run sfx`, kemudian `npm run render`.
