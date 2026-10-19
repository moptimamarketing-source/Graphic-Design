import { Video } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { Soundtrack } from "./audio/Soundtrack";
import { Bokeh } from "./components/Bokeh";
import { brandWipe } from "./components/BrandWipe";
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
import { CUTS, ENDING_START, TOTAL_FRAMES } from "./timing";

// Scene cuts sit mid-pause in the voice-over (timing.ts, docs/STORYBOARD.md).
// Each 16-frame brand wipe is centred on its cut, so a scene lasts
// (next cut − previous cut) + 16 frames; the first and last get +8.
//
// cut  frame  pause (s)        next words
//  1    219   7.22 – 7.41      "Jangan panik dulu."
//  2    498   16.38 – 16.80    "Pertama, …"
//  3    584   19.38 – 19.57    "Kedua, …"
//  4    696   22.99 – 23.44    "Ketiga, …"
//  5    855   28.29 – 28.70    "Kalau anak masih belum kuasai …"
//  6   1044   34.65 – 34.97    "Mulakan dengan aktiviti membaca …"
//  7   1291   42.85 – 43.21    "Sebab setiap anak belajar …"
//
// From ENDING_START the HyperFrames ending (hyperframes/index.html, rendered
// to public/hyperframes/ending.mp4) plays over everything; it opens on the
// white flash that scene 8 dives into.
const T = linearTiming({ durationInFrames: 16 });

export const MindaOptimaEp08: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: colors.cream }}>
      <TransitionSeries name="Scenes">
        <TransitionSeries.Sequence name="1 Hook" durationInFrames={227} premountFor={fps}>
          <S1Hook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={brandWipe({ direction: "ltr" })} timing={T} />
        <TransitionSeries.Sequence name="2 Jangan panik" durationInFrames={295} premountFor={fps}>
          <S2Reassure />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={brandWipe({ direction: "rtl" })} timing={T} />
        <TransitionSeries.Sequence name="3 Ikut arahan" durationInFrames={102} premountFor={fps}>
          <S3IkutArahan />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={brandWipe({ direction: "ltr" })} timing={T} />
        <TransitionSeries.Sequence name="4 Boleh fokus" durationInFrames={128} premountFor={fps}>
          <S4Fokus />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={brandWipe({ direction: "rtl" })} timing={T} />
        <TransitionSeries.Sequence name="5 Berani cuba" durationInFrames={175} premountFor={fps}>
          <S5BeraniCuba />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={brandWipe({ direction: "ltr" })} timing={T} />
        <TransitionSeries.Sequence name="6 Jangan bandingkan" durationInFrames={205} premountFor={fps}>
          <S6JanganBanding />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={brandWipe({ direction: "rtl" })} timing={T} />
        <TransitionSeries.Sequence name="7 Tip membaca" durationInFrames={263} premountFor={fps}>
          <S7Tip />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={brandWipe({ direction: "ltr" })} timing={T} />
        <TransitionSeries.Sequence name="8 Penutup" durationInFrames={520} premountFor={fps}>
          <S8Ending />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Bokeh until={ENDING_START - 20} />
      <Checklist />
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 60%, rgba(10,30,60,0.16) 100%)",
        }}
      />
      {/* HyperFrames light sweep over every cut, screen-blended so black drops out */}
      {CUTS.map((cut, i) => (
        <Sequence key={cut} name={`Light sweep ${i + 1}`} from={cut - 12} durationInFrames={24} premountFor={fps}>
          <Video src={staticFile("hyperframes/flare-sweep.mp4")} muted style={{ mixBlendMode: "screen" }} />
        </Sequence>
      ))}
      <Captions />
      <Sequence name="HyperFrames ending" from={ENDING_START} durationInFrames={TOTAL_FRAMES - ENDING_START} premountFor={fps}>
        <Video src={staticFile("hyperframes/ending.mp4")} muted />
      </Sequence>
      <Soundtrack />
    </AbsoluteFill>
  );
};
