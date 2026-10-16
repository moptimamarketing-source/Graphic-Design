import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { flip } from "@remotion/transitions/flip";
import { iris } from "@remotion/transitions/iris";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { Soundtrack } from "./audio/Soundtrack";
import { Captions } from "./components/Captions";
import { Checklist } from "./components/Checklist";
import { S1Hook } from "./scenes/S1Hook";
import { S2Reassure } from "./scenes/S2Reassure";
import { S3IkutArahan } from "./scenes/S3IkutArahan";
import { S4Fokus } from "./scenes/S4Fokus";
import { S5BeraniCuba } from "./scenes/S5BeraniCuba";
import { S6JanganBanding } from "./scenes/S6JanganBanding";
import { S7Tip } from "./scenes/S7Tip";
import { S8Ending } from "./scenes/S8Ending";
import { colors } from "./theme";

// Scene cuts sit mid-pause in the voice-over (timing.ts, docs/STORYBOARD.md).
// Each 12-frame transition is centred on its cut, so a scene lasts
// (next cut − previous cut) + 12 frames; the first and last get +6.
//
// cut  frame  pause (s)        next words
//  1    219   7.22 – 7.41      "Jangan panik dulu."
//  2    498   16.38 – 16.80    "Pertama, …"
//  3    584   19.38 – 19.57    "Kedua, …"
//  4    696   22.99 – 23.44    "Ketiga, …"
//  5    855   28.29 – 28.70    "Kalau anak masih belum kuasai …"
//  6   1044   34.65 – 34.97    "Mulakan dengan aktiviti membaca …"
//  7   1291   42.85 – 43.21    "Sebab setiap anak belajar …"
const T = linearTiming({ durationInFrames: 12 });

export const MindaOptimaEp08: React.FC = () => {
  const { fps, width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: colors.cream }}>
      <TransitionSeries name="Scenes">
        <TransitionSeries.Sequence name="1 Hook" durationInFrames={225} premountFor={fps}>
          <S1Hook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={T} />
        <TransitionSeries.Sequence name="2 Jangan panik" durationInFrames={291} premountFor={fps}>
          <S2Reassure />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={T} />
        <TransitionSeries.Sequence name="3 Ikut arahan" durationInFrames={98} premountFor={fps}>
          <S3IkutArahan />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={T} />
        <TransitionSeries.Sequence name="4 Boleh fokus" durationInFrames={124} premountFor={fps}>
          <S4Fokus />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-left" })} timing={T} />
        <TransitionSeries.Sequence name="5 Berani cuba" durationInFrames={171} premountFor={fps}>
          <S5BeraniCuba />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={flip({ direction: "from-right" })} timing={T} />
        <TransitionSeries.Sequence name="6 Jangan bandingkan" durationInFrames={201} premountFor={fps}>
          <S6JanganBanding />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={iris({ width, height })} timing={T} />
        <TransitionSeries.Sequence name="7 Tip membaca" durationInFrames={259} premountFor={fps}>
          <S7Tip />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={T} />
        <TransitionSeries.Sequence name="8 Penutup + logo" durationInFrames={518} premountFor={fps}>
          <S8Ending />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Checklist />
      <Captions />
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 60%, rgba(10,30,60,0.16) 100%)",
        }}
      />
      <Soundtrack />
    </AbsoluteFill>
  );
};
