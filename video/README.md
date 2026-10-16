# Minda Optima · Episod 08 (Remotion)

60-second parenting awareness video, 1080×1920 (9:16), 30 fps, 1803 frames.

- Storyboard and measured audio timings: [`docs/STORYBOARD.md`](docs/STORYBOARD.md)
- Original brief: [`docs/brief.txt`](docs/brief.txt)
- Master voice-over and official logo: `public/assets/` (byte-identical copies of the Drive originals; do not edit)

Current state: all eight scenes built. Output: `out/minda-optima-ep08.mp4` (not committed; re-render with the command below).

## Where things live

- `src/timing.ts`: scene cuts, phrase blocks and key-word beats, measured from the voice-over
- `src/captions.ts`: Malay subtitle pages (edit wording here)
- `src/characters/`: layered SVG mother and son (joints, blinks, expressions, lip-sync, walk)
- `src/props/`: backgrounds (school gate, living room, street) and learning props
- `src/components/`: kinetic headlines, subtitles, checklist, stage/camera
- `src/scenes/`: S1–S8
- `src/audio/Soundtrack.tsx`: voice-over (unchanged), music bed with ducking, SFX
- `scripts/analyse_audio.py`, `scripts/make_audio.py`: regenerate the voice envelope and the synthesised SFX/music (Python + numpy + ffmpeg)

## Commands

```console
npm install        # first time only
npm run dev        # open Remotion Studio, composition "MindaOptimaEp08"
npm run lint       # eslint + tsc
```

Render (only after the storyboard is approved):

```console
npx remotion render MindaOptimaEp08 out/minda-optima-ep08.mp4 --codec=h264 --audio-codec=aac
```

## Agent Skills

The Remotion Agent Skills (`remotion-best-practices`) are installed in `.agents/skills/` and linked from `.claude/skills/`.
