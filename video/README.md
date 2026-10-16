# Minda Optima · Episod 08 (Remotion)

60-second parenting awareness video, 1080×1920 (9:16), 30 fps, 1803 frames.

- Storyboard and measured audio timings: [`docs/STORYBOARD.md`](docs/STORYBOARD.md)
- Original brief: [`docs/brief.txt`](docs/brief.txt)
- Master voice-over and official logo: `public/assets/` (byte-identical copies of the Drive originals; do not edit)

Current state: timing animatic only. Each scene is a placeholder card, and the real voice-over plays underneath so the cuts can be checked. No video has been rendered.

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
