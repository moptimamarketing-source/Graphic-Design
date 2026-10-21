# Mak & Anak "Baca Mata Tertutup" — suntingan 720p

- `sumber/seedance_asal.mp4` — video asal Seedance 2.5 (480×854, suara mak berloghat Indonesia)
- `sumber/suara_mak_ref.mp3` — sampel suara mak (untuk ujian klon suara)
- `hyperframes/` — projek Hyperframes (720×1280, 24fps)

## Apa yang diubah
- Suara mak diganti dengan Qwen Audio TTS (voice "Talent Minda Optima - Sesi Petang", `language: ms`),
  dipotong ikut frasa dan diletak pada gerak mulut asal:
  `vo1` 1.00s, `vo2a` 6.75s, `vo2b` 9.76s, `vo2c` 12.22s, `vo2d` 13.54s.
- Bunyi asal shot budak (4.0–6.33s) dikekalkan.
- Snap zoom pada "dengan mata tertutup" (2.56s) dan "haa, sama la kita" (13.5s), slow push-in, goyang handheld.
- SFX whoosh/punch + room tone, loudness akhir -14 LUFS.

## Render semula
Fail dalam `hyperframes/assets/` tidak disimpan dalam repo (video upscale + wav). Letak semula
`asal.mp4` (upscale ByteDance 1080p → 720×1280) dan fail `vo*.wav`, `whoosh.wav`, `punch.wav`,
`roomtone.wav`, kemudian:

```bash
cd hyperframes
npx hyperframes lint .
npx hyperframes render --fps 24 --quality delivery -o renders/mak-anak-baca_720p.mp4
```
