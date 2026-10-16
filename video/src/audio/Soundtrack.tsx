import React from "react";
import { Audio } from "@remotion/media";
import { Sequence, staticFile } from "remotion";
import { voLevel } from "../lib/anim";
import { BEATS, CUTS, VO_END } from "../timing";

// The voice stops after "…yakin untuk belajar." (P20); the spoken
// "Minda Optima, sejak 1995" is left out and the music carries the end card.
const voVolume = (f: number) => (f < VO_END - 6 ? 1 : Math.max(0, (VO_END - f) / 6));

// Music sits ~14 dB under the voice, lifts in the pauses, and takes over
// for the end card where its big hit lands with the logo.
const musicVolume = (f: number) => {
  let sum = 0;
  for (let k = -6; k <= 6; k++) sum += f + k < VO_END ? voLevel(f + k) : 0;
  const speech = Math.min(1, (sum / 13) * 1.6);
  const fadeIn = Math.min(1, f / 20);
  const endCard = Math.min(1, Math.max(0, (f - VO_END) / 6));
  const base = 0.5 - 0.23 * speech;
  return fadeIn * (base + (1 - base) * endCard);
};

type Sfx = { at: number; file: string; volume: number };

const SFX: Sfx[] = [
  // Scene 1: book pops open, letters bounce out
  { at: 44, file: "pop", volume: 0.28 },
  { at: 52, file: "pop", volume: 0.24 },
  { at: 60, file: "pop", volume: 0.24 },
  { at: 68, file: "pop", volume: 0.24 },
  // Scene 2: A, B, C tiles land as she says them, then fly to the card
  { at: BEATS.letterA, file: "pop", volume: 0.26 },
  { at: BEATS.letterB, file: "pop", volume: 0.26 },
  { at: BEATS.letterC, file: "pop", volume: 0.26 },
  { at: BEATS.tigaPerkara - 6, file: "swish", volume: 0.22 },
  // Scenes 3–5: actions and checklist ticks
  { at: BEATS.ikutArahan - 8, file: "thud", volume: 0.3 },
  { at: BEATS.ikutArahan, file: "ding", volume: 0.24 },
  { at: BEATS.fokus - 6, file: "click", volume: 0.3 },
  { at: BEATS.fokus, file: "ding", volume: 0.24 },
  { at: BEATS.beraniCuba, file: "ding", volume: 0.24 },
  // Scene 6: the comparison is crossed out
  { at: BEATS.bandingkan, file: "swish", volume: 0.24 },
  // Scene 7: page turns and praise
  { at: CUTS[5] + 40, file: "page", volume: 0.26 },
  { at: BEATS.usahaKecil, file: "sparkle", volume: 0.24 },
  // Ending
  { at: BEATS.yakin, file: "sparkle", volume: 0.2 },
  // Soft whoosh on every scene change
  ...CUTS.map((c) => ({ at: c - 6, file: "whoosh", volume: 0.16 })),
];

export const Soundtrack: React.FC = () => (
  <>
    <Audio
      name="Voice-over (smoothed copy, original timing)"
      src={staticFile("assets/voiceover-fatimah-smooth.wav")}
      durationInFrames={VO_END}
      volume={(f) => voVolume(f)}
    />
    <Audio name="Music (beat)" src={staticFile("music/music-beat.mp3")} volume={(f) => musicVolume(f)} />
    {SFX.map((s, i) => (
      <Sequence key={i} from={s.at} durationInFrames={90} name={`SFX ${s.file}`} layout="none">
        <Audio src={staticFile(`sfx/${s.file}.wav`)} volume={s.volume} />
      </Sequence>
    ))}
  </>
);
