# Minda Optima · Episod 08 — Storyboard

**Anak Nak Masuk Tahun 1, Tapi Belum Bersedia?**
1080×1920 · 9:16 · 30 fps · 1803 frames (60.10 s) · MP4 H.264 + AAC

Status: **approved and built.** See the build revision in §1.

---

## 1. Audio inspection (master voice-over)

| Item | Value |
|---|---|
| File | `public/assets/voiceover-fatimah.mp3` (byte-identical copy of the Drive original) |
| MD5 | `e0292b4891d3ecab99e93c3faf264066` |
| Format | MP3, 44.1 kHz, mono, ~128 kbps |
| Duration | **60.0816 s** (matches the brief) |
| Speech starts | 0.19 s (frame 6) |
| Speech ends | 59.80 s (frame 1794) |
| Loudness | speech ≈ -12 dB RMS, peak -0.5 dBFS; pauses ≈ -43 dB RMS |
| Music bed in MP3? | No. Pauses hold steady room tone only, so background music must be added separately |

### Measured phrase blocks

Pauses detected with `ffmpeg silencedetect` (−20 dB, ≥ 0.18 s). Each block is one spoken phrase.

| # | Start (s) | End (s) | Start frame | | # | Start (s) | End (s) | Start frame |
|---|---|---|---|---|---|---|---|---|
| P1 | 0.19 | 0.85 | 6 | | P12 | 28.70 | 31.19 | 861 |
| P2 | 1.11 | 2.26 | 33 | | P13 | 31.54 | 34.65 | 946 |
| P3 | 2.63 | 7.22 | 79 | | P14 | 34.97 | 39.50 | 1049 |
| P4 | 7.41 | 8.53 | 222 | | P15 | 39.95 | 42.85 | 1199 |
| P5 | 8.96 | 9.73 | 269 | | P16 | 43.21 | 44.91 | 1296 |
| P6 | 9.92 | 15.15 | 298 | | P17 | 45.12 | 47.35 | 1354 |
| P7 | 15.38 | 16.38 | 461 | | P18 | 47.76 | 48.68 | 1433 |
| P8 | 16.80 | 19.38 | 504 | | P19 | 49.00 | 51.39 | 1470 |
| P9 | 19.57 | 22.99 | 587 | | P20 | 51.86 | 54.34 | 1556 |
| P10 | 23.44 | 24.19 | 703 | | P21 | 54.66 | 55.87 | 1640 |
| P11 | 24.59 | 28.29 | 738 | | P22 | 56.23 | 59.80 | 1687 |

### Scene cuts checked against the brief

Each cut sits in the middle of a real pause, so no scene change lands mid-word.

| Cut | Brief guideline | Pause in audio | Cut at | Frame | Δ vs brief |
|---|---|---|---|---|---|
| 1→2 | 0:09.0 | 8.53 – 8.96 | 8.74 s | 262 | −0.26 s |
| 2→3 | 0:17.0 | 16.38 – 16.80 | 16.59 s | 498 | −0.41 s |
| 3→4 | 0:23.5 | 22.99 – 23.44 | 23.22 s | 696 | −0.28 s |
| 4→5 | 0:28.7 | 28.29 – 28.70 | 28.50 s | 855 | −0.20 s |
| 5→6 | 0:35.0 | 34.65 – 34.97 | 34.81 s | 1044 | −0.19 s |
| 6→7 | 0:43.2 | 42.85 – 43.21 | 43.03 s | 1291 | −0.17 s |
| 7→8 | 0:52.0 | 51.39 – 51.86 | 51.63 s | 1549 | −0.37 s |
| end | 1:00.10 | speech ends 59.80 | 60.10 s | 1803 | 0 |

Every editorial time in the brief falls within 0.2 s of the next phrase's onset (four of seven within 0.06 s), so the brief's scene ranges hold. I cut slightly earlier, mid-pause, so each new scene is on screen before its first word.

### Voice-over script (transcribed from the MP3)

The brief's script section was still the placeholder, so the words were
transcribed from the master MP3 with Whisper large-v3, one phrase block at a
time. **Please check against the original ElevenLabs script.** One spot is
uncertain: the recording sounds like "anak nak masuk **dan** Tahun 1"; the
subtitles leave that "dan" out.

| Block | Time (s) | Words |
|---|---|---|
| P1–P2 | 0.19–2.26 | Parents, anak nak masuk |
| P3 | 2.63–7.22 | Tahun 1 tahun depan, tapi masih belum lancar membaca? |
| P4 | 7.41–8.53 | Jangan panik dulu. |
| P5–P7 | 8.96–16.38 | Sebenarnya, persediaan ke Tahun 1 bukan sekadar kenal ABC tau. Cuba tengok 3 perkara ni. |
| P8 | 16.80–19.38 | Pertama, anak boleh ikut arahan mudah. |
| P9 | 19.57–22.99 | Kedua, anak boleh fokus pada satu aktiviti. |
| P10–P11 | 23.44–28.29 | Ketiga, anak berani cuba membaca walaupun takut salah. |
| P12–P13 | 28.70–34.65 | Kalau anak masih belum kuasai semuanya, jangan terus bandingkan dengan anak orang lain. |
| P14–P15 | 34.97–42.85 | Mulakan dengan aktiviti membaca yang ringkas dan menyeronokkan. Puji setiap usaha kecil mereka. |
| P16–P19 | 43.21–51.39 | Sebab setiap anak belajar mengikut kemampuan masing-masing. Ingat, parents. Kita bukan sekadar nak anak pandai membaca. |
| P20 | 51.86–54.34 | Kita nak mereka yakin untuk belajar. |
| P21–P22 | 54.66–59.80 | Minda Optima, sejak 1995. |

### Build revision: cuts follow the words

The brief's scene ranges were guesses; in the recording the content arrives
earlier (for example "Jangan panik dulu" at 7.41 s and "Kedua" at 19.57 s).
The eight approved scenes are kept, but each cut now sits in the pause where
the spoken topic changes:

| Scene | Time | Frames | Words |
|---|---|---|---|
| 1 Hook | 0:00.00–0:07.30 | 0–219 | P1–P3 |
| 2 Jangan panik | 0:07.30–0:16.59 | 219–498 | P4–P7 |
| 3 Ikut arahan | 0:16.59–0:19.47 | 498–584 | P8 |
| 4 Boleh fokus | 0:19.47–0:23.22 | 584–696 | P9 |
| 5 Berani cuba | 0:23.22–0:28.50 | 696–855 | P10–P11 |
| 6 Jangan bandingkan | 0:28.50–0:34.81 | 855–1044 | P12–P13 |
| 7 Tip membaca + puji | 0:34.81–0:43.03 | 1044–1291 | P14–P15 |
| 8 Penutup + logo | 0:43.03–1:00.10 | 1291–1803 | P16–P22 (logo lands on "Minda Optima", 54.66 s) |

On-screen headlines follow the spoken words (for example "RINGKAS DAN
MENYERONOKKAN" rather than the brief's "LATIHAN RINGKAS + KONSISTEN", which
is not said). The Malaysian flag from the style frame was removed on request.
Scene-by-scene beats below are the original approved plan; `src/timing.ts`
holds the frame-exact beats used in the build.

---

## 2. Scene-by-scene storyboard

Transitions are 12 frames (0.4 s) centred on each cut. Captions appear in the lower band throughout (see §3).

### Scene 1 · HOOK — 0:00.00–0:08.74 · f0–262 · P1–P4
- **Visual**: Opens already moving: camera pushes in on a Malaysian primary-school gate (blue arch, "SEKOLAH KEBANGSAAN" sign, Jalur Gemilang). The boy in his navy bag stands at the gate, looking up, unsure. Head tilt, two blinks, grip on bag straps tightens.
- **Beat at P2 (f33)**: Tight close-up on his face. Small book pops open in his hands; A, B, C letters bounce out and wobble.
- **Beat at P3 (f79)**: Kinetic text slams in, word by word: **NAK MASUK TAHUN 1?** (blue, with a yellow "1").
- **Beat at P4 (f222)**: Second line **BELUM LANCAR MEMBACA?** (red underline swipe). Letters drift and wobble around his head, uncertainty.
- **Transition → 2**: soft whoosh, letters fall into the next scene.
- **SFX**: soft pop on letter bounce, gentle whoosh at cut.

### Scene 2 · REASSURANCE — 0:08.74–0:16.59 · f262–498 · P5–P7
- **Visual**: Warm living room. Mother (light-blue hijab) kneels to his eye level, hand on his shoulder; his worried mouth relaxes into a small smile. Background colour shifts from cool to warm.
- **Beat at P5 (f269)**: **JANGAN PANIK DULU!** springs in with a gentle bounce.
- **Beat at P6 (f298)**: The floating A-B-C letters fly together and snap into a three-row checklist card (empty tick boxes).
- **Beat at P7 (f461)**: Card headline **BUKAN SEKADAR ABC** with the "ABC" struck through by a red marker.
- **Transition → 3**: checklist card slides to the top-right corner and stays as a persistent mini-HUD for scenes 3–5.

### Scene 3 · SKILL 1 — 0:16.59–0:23.22 · f498–696 · P8–P9
- **Visual**: Home table. Mother points ("letak buku atas meja" gesture). Boy nods, walks over, places the book on the table (arm arc + small bounce on landing).
- **Beat at P9 (f587)**: Checklist item 1 ticks with a red check mark: **IKUT ARAHAN**. The item enlarges briefly to centre then returns to the HUD.
- **Transition → 4**: camera slides down to the puzzle on the same table (one continuous space).

### Scene 4 · SKILL 2 — 0:23.22–0:28.50 · f696–855 · P10–P11
- **Visual**: Boy concentrates on chunky puzzle blocks; tongue tip out, eyes track pieces. A small stopwatch ring fills around a concentration bubble (short span only, a few seconds, not a long timer).
- **Beat at P11 (f738)**: Pieces click together; item 2 ticks: **BOLEH FOKUS**.
- **Transition → 5**: parallax push into the open book.

### Scene 5 · SKILL 3 — 0:28.50–0:34.81 · f855–1044 · P12–P13
- **Visual**: Big book page. His finger points at a simple word (e.g. **B-U-K-U**). Letters light up yellow one at a time as he sounds them out; mouth moves on each.
- **Beat at P13 (f946)**: He looks up, proud of *trying*. Item 3 ticks: **BERANI CUBA**. No "fluent reading" depiction: one word, sounded out slowly.
- **Transition → 6**: page flips into a split screen.

### Scene 6 · EMOTIONAL POINT — 0:34.81–0:43.03 · f1044–1291 · P14–P15
- **Visual**: Split screen. Left: our boy, worried, small. Right: a confident classmate silhouette (stylised, not a second detailed child, honouring "no extra children"). A balance-scale icon tilts between them.
- **Beat at P15 (f1199)**: A red X wipes across the scale and the split collapses. Mother hugs the boy in centre frame; warm glow, small hearts.
- **Text**: **JANGAN BANDINGKAN ANAK**, "BANDINGKAN" in red.
- **Transition → 7**: soft iris wipe into a cosy reading corner.

### Scene 7 · PRACTICAL TIP — 0:43.03–0:51.63 · f1291–1549 · P16–P19
- **Visual**: Mother and son on the sofa, book between them. Page flips, tiny stars twinkle, mother points, boy reads, mother gives a thumbs-up. A small "10 min" clock badge suggests a short session.
- **Beat at P16 (f1296)**: **LATIHAN RINGKAS + KONSISTEN** with a 7-dot weekly streak filling in.
- **Beat at P18–P19 (f1433–1470)**: **PUJI USAHA ANAK**, star sticker stamps onto the page and the boy beams.
- **Transition → 8**: camera pulls out and turns toward the school gate.

### Scene 8 · HEARTFELT ENDING — 0:51.63–1:00.10 · f1549–1803 · P20–P22
- **Visual (f1549–1687)**: Same school gate as Scene 1, now sunny. The boy walks toward it holding the book confidently, mother beside him. He turns and waves. Mirrors the opening shot so the story closes.
- **Logo (P22, f1687)**: scene softens to white/cream. The **original** logo PNG scales in with a gentle spring (no redraw or recolour), settles by f1710.
- **Text under logo**: **BINA KEYAKINAN ANAK** then **SEJAK 1995** in a yellow pill.
- **Hold**: logo fully static from f1730 until the audio ends (f1794) plus a 9-frame tail. The voice-over is not shortened.

---

## 3. Caption plan
- Source: the exact ElevenLabs script (pending). No invented words.
- One caption page per phrase block (P1–P22); long blocks (P3, P6, P14, P22) split at natural breaks, max two lines.
- Nunito 900, 58 px, white with a navy rounded box at 85% opacity; key words highlighted yellow.
- Placement: centred, bottom edge at y = 1540 (380 px clear of the bottom UI), side margins 90 px. Headline text stays in the upper-middle band (y 220–900) so it never collides with captions.
- Built with `@remotion/captions` (`createTikTokStyleCaptions`) from a `captions.json` timed to the phrase blocks.

## 4. Sound plan
- Voice-over: master MP3 at full volume, unchanged.
- Music: **needs a licensed track from you** (soft, warm, acoustic/ukulele or light piano, ~90–100 BPM). Mixed about −24 dB under speech, rising slightly in pauses and on the end card.
- SFX: Remotion's free library (`whoosh`, `page-turn`, `ding`, `switch`), downloaded into `public/sfx/` at build time, kept quiet (−18 dB) and never on top of a spoken word.
