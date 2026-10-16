import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { AbsoluteFill, staticFile, useVideoConfig } from "remotion";
import { AnimaticCard } from "./components/AnimaticCard";
import { colors } from "./theme";

// Scene cuts sit in the middle of measured pauses in the voice-over
// (see docs/STORYBOARD.md). Each 12-frame transition is centred on its cut,
// so a scene's duration = (next cut - previous cut) + 12, and the first and
// last scenes get +6. Total = 1803 frames.
//
// cut  frame  pause in audio (s)
//  1    262   8.53 – 8.96
//  2    498   16.38 – 16.80
//  3    696   22.99 – 23.44
//  4    855   28.29 – 28.70
//  5   1044   34.65 – 34.97
//  6   1291   42.85 – 43.21
//  7   1549   51.39 – 51.86
const T = 12;

export const MindaOptimaEp08: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: colors.cream }}>
      <TransitionSeries name="Scenes">
        <TransitionSeries.Sequence
          name="1 Hook"
          durationInFrames={268}
          premountFor={fps}
        >
          <AnimaticCard
            scene={1}
            title="Hook – school gate"
            onScreenText={"NAK MASUK TAHUN 1?\nBELUM LANCAR MEMBACA?"}
            background={colors.brandBlue}
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence
          name="2 Reassurance"
          durationInFrames={248}
          premountFor={fps}
        >
          <AnimaticCard
            scene={2}
            title="Reassurance"
            onScreenText={"JANGAN PANIK DULU!\nBUKAN SEKADAR ABC"}
            background={colors.skyBlue}
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence
          name="3 Ikut Arahan"
          durationInFrames={210}
          premountFor={fps}
        >
          <AnimaticCard
            scene={3}
            title="Skill 1"
            onScreenText="IKUT ARAHAN"
            background={colors.brandBlue}
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence
          name="4 Boleh Fokus"
          durationInFrames={171}
          premountFor={fps}
        >
          <AnimaticCard
            scene={4}
            title="Skill 2"
            onScreenText="BOLEH FOKUS"
            background={colors.skyBlue}
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence
          name="5 Berani Cuba"
          durationInFrames={201}
          premountFor={fps}
        >
          <AnimaticCard
            scene={5}
            title="Skill 3"
            onScreenText="BERANI CUBA"
            background={colors.brandBlue}
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence
          name="6 Jangan Bandingkan"
          durationInFrames={259}
          premountFor={fps}
        >
          <AnimaticCard
            scene={6}
            title="Emotional point"
            onScreenText="JANGAN BANDINGKAN ANAK"
            background={colors.red}
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence
          name="7 Practical Tip"
          durationInFrames={270}
          premountFor={fps}
        >
          <AnimaticCard
            scene={7}
            title="Practical tip"
            onScreenText={"LATIHAN RINGKAS + KONSISTEN\nPUJI USAHA ANAK"}
            background={colors.skyBlue}
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence
          name="8 Ending + Logo"
          durationInFrames={260}
          premountFor={fps}
        >
          <AnimaticCard
            scene={8}
            title="Ending + logo"
            onScreenText={"BINA KEYAKINAN ANAK\nSEJAK 1995"}
            background={colors.brandBlue}
          />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Audio
        name="Voice-over (master, unchanged)"
        src={staticFile("assets/voiceover-fatimah.mp3")}
      />
    </AbsoluteFill>
  );
};
