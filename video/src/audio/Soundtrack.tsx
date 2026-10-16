import React from "react";
import { Audio } from "@remotion/media";
import { Sequence, staticFile } from "remotion";
import { voLevel } from "../lib/anim";
import { BEATS, CUTS } from "../timing";

// Music sits ~24 dB under the voice and lifts slightly in the pauses.
const musicVolume = (f: number) => {
  let sum = 0;
  for (let k = -6; k <= 6; k++) sum += voLevel(f + k);
  const speech = Math.min(1, (sum / 13) * 1.6);
  const fadeIn = Math.min(1, f / 30);
  return fadeIn * (0.22 - 0.09 * speech);
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
  { at: BEATS.mindaOptima - 4, file: "chime", volume: 0.16 },
  // Soft whoosh on every scene change
  ...CUTS.map((c) => ({ at: c - 6, file: "whoosh", volume: 0.16 })),
];

export const Soundtrack: React.FC = () => (
  <>
    <Audio name="Voice-over (master, unchanged)" src={staticFile("assets/voiceover-fatimah.mp3")} />
    <Audio name="Music bed" src={staticFile("music/music-bed.mp3")} volume={(f) => musicVolume(f)} />
    {SFX.map((s, i) => (
      <Sequence key={i} from={s.at} durationInFrames={90} name={`SFX ${s.file}`} layout="none">
        <Audio src={staticFile(`sfx/${s.file}.wav`)} volume={s.volume} />
      </Sequence>
    ))}
  </>
);
