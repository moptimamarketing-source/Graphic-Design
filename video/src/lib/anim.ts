import { Easing, interpolate, spring, SpringConfig } from "remotion";
import voEnvelope from "../data/voEnvelope.json";

export const clamp = (v: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, v));

const SOFT: Partial<SpringConfig> = { damping: 14, stiffness: 120, mass: 0.8 };

// Spring that starts at `delay` frames. Returns 0 before it starts.
export const pop = (
  frame: number,
  fps: number,
  delay = 0,
  config: Partial<SpringConfig> = SOFT,
) => spring({ frame: frame - delay, fps, config });

const SMOOTH = Easing.inOut(Easing.cubic);

// 0 → 1 → 0 over [start, end] with eased edges, for elements that enter and leave.

export const inOut = (frame: number, start: number, end: number, edge = 10) =>
  interpolate(frame, [start, start + edge, end - edge, end], [0, 1, 1, 0], {
    easing: SMOOTH,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// 0 → 1 between two frames, easing in and out so moves start and stop softly.
export const ramp = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    easing: SMOOTH,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const wave = (frame: number, period: number, amp: number, phase = 0) =>
  Math.sin((frame / period) * Math.PI * 2 + phase) * amp;

// How closed the eyes are (0 open, 1 shut). Each character gets its own
// rhythm through `seed` so they never blink in unison.
export const blinkAt = (frame: number, seed = 0) => {
  const period = 78 + ((seed * 37) % 34);
  const t = (frame + seed * 23) % period;
  if (t < 3) return t / 3;
  if (t < 7) return 1 - (t - 3) / 4;
  return 0;
};

// Voice-over loudness (0–1) at an absolute composition frame, measured from
// the master MP3 by scripts/analyse_audio.py.
export const voLevel = (absFrame: number) => {
  const env = voEnvelope as number[];
  const i = Math.max(0, Math.min(env.length - 1, Math.round(absFrame)));
  return env[i];
};

// Mouth opening that follows the voice-over, with a syllable flutter so the
// jaw doesn't hold still on long vowels.
export const lipSync = (absFrame: number) => {
  const level = clamp((voLevel(absFrame) - 0.2) / 0.55);
  return level * (0.55 + 0.45 * Math.abs(Math.sin(absFrame * 1.7)));
};
