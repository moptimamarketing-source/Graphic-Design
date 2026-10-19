# Minda Optima · Episod 08 (Remotion)

60-second parenting awareness video, 1080×1920 (9:16), 30 fps, 1803 frames.

- Storyboard and measured audio timings: [`docs/STORYBOARD.md`](docs/STORYBOARD.md)
- Original brief: [`docs/brief.txt`](docs/brief.txt)
- Master voice-over and official logo: `public/assets/` (byte-identical copies of the Drive originals; do not edit). `voiceover-fatimah-smooth.wav` is the processed copy used in the video.

Current state: all eight scenes built. Output: `out/minda-optima-ep08.mp4` (not committed; re-render with the command below).

## Where things live

- `src/timing.ts`: scene cuts, phrase blocks and key-word beats, measured from the voice-over
- `src/captions.ts`: Malay subtitle pages (edit wording here)
- `src/characters/`: layered SVG mother and son (joints, blinks, expressions, lip-sync, walk)
- `src/props/`: backgrounds (school gate, living room, street) and learning props
- `src/components/`: kinetic headlines, subtitles, checklist, stage/camera
- `src/scenes/`: S1–S8
- `src/audio/Soundtrack.tsx`: smoothed voice-over (ends after "…yakin untuk belajar"), beat music with ducking, SFX
- `scripts/analyse_audio.py`, `scripts/make_audio.py`, `scripts/make_beat.py`: regenerate the voice envelope, SFX and music (Python + numpy + ffmpeg)
- `src/components/BrandWipe.tsx`: brand-colour scene transitions; `src/components/Bokeh.tsx`: foreground light depth
- `hyperframes/`: HyperFrames (HTML + GSAP) project for the futuristic ending sting (`index.html`) and the light-sweep transition overlay (`compositions/flare-sweep.html`). Their renders live in `public/hyperframes/` and are placed by `src/MindaOptimaEp08.tsx`

## HyperFrames parts

```console
npm run ending:check    # lint + runtime + layout + contrast checks
npm run ending:render   # re-render the ending and copy it into public/hyperframes/
npm run flare:render    # re-render the light-sweep overlay
```

The ending starts on white at 54.50 s (frame 1635), where scene 8 dives into the boy's book, and its logo hit lands on the music's downbeat at 54.65 s. Agent skills for both frameworks are in `.agents/skills/`.

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
