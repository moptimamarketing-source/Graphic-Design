import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { Boy } from "../characters/Boy";
import { Mother } from "../characters/Mother";
import { KineticLine, Pill } from "../components/Kinetic";
import { cam, Stage } from "../components/Stage";
import { lipSync, pop, ramp, wave } from "../lib/anim";
import { LivingRoom } from "../props/Backgrounds";
import { LetterTile, Sparkle } from "../props/Items";
import { BEATS, P } from "../timing";
import { colors } from "../theme";
import { useSceneClock } from "./common";

// 0:07.3 – 0:16.6  "Jangan panik dulu. Sebenarnya, persediaan ke Tahun 1
// bukan sekadar kenal ABC tau. Cuba tengok 3 perkara ni."
const TILES = [
  { ch: "A", color: colors.red, x: 320, beat: BEATS.letterA },
  { ch: "B", color: colors.yellow, x: 540, beat: BEATS.letterB },
  { ch: "C", color: colors.skyBlue, x: 760, beat: BEATS.letterC },
];

export const S2Reassure: React.FC = () => {
  const { frame, fps, abs, L } = useSceneClock(2);
  const zoom = interpolate(frame, [0, 291], [1.0, 1.07], { easing: Easing.inOut(Easing.sin) });

  // Mother reaches for his shoulder on "Jangan panik", gestures while explaining.
  const reach = pop(frame, fps, L(BEATS.janganPanik) - 4, { damping: 16, stiffness: 90 });
  const explaining = ramp(frame, L(P(5)), L(P(5)) + 10) * (1 - ramp(frame, L(BEATS.letterA) - 8, L(BEATS.letterA)));
  const pointUp = ramp(frame, L(BEATS.letterA) - 8, L(BEATS.letterA)) * (1 - ramp(frame, L(BEATS.tigaPerkara), L(BEATS.tigaPerkara) + 10));
  const calm = ramp(frame, 40, 70);
  const lookTiles = ramp(frame, L(BEATS.letterA) - 4, L(BEATS.letterA) + 6);

  const strike = ramp(frame, L(BEATS.letterC) + 12, L(BEATS.letterC) + 22);
  const fly = Easing.in(Easing.cubic)(ramp(frame, L(BEATS.tigaPerkara) - 12, L(BEATS.tigaPerkara) + 2));

  return (
    <AbsoluteFill>
      <Stage background="#FFF1D2">
        <g transform={cam(zoom, 560, 1060, 540, 1060)}>
          <LivingRoom warmth={calm} camX={wave(frame, 200, 20)} />
          <Mother
            x={400}
            y={1640}
            scale={1.85}
            lean={6 * reach}
            headTilt={4 + 4 * reach + wave(frame, 60, 2)}
            mouthOpen={lipSync(abs)}
            expression={pointUp > 0.5 ? "joy" : "warm"}
            lookX={0.6 - pointUp * 0.6}
            lookY={-pointUp * 0.8}
            armR={interpolate(reach, [0, 1], [6, 30])}
            elbowR={interpolate(reach, [0, 1], [0, 12])}
            armL={6 + explaining * (34 + wave(frame, 24, 8)) + pointUp * 128}
            elbowL={explaining * (60 + wave(frame, 24, 10)) + pointUp * 10}
            blinkSeed={5}
          />
          <Boy
            x={760}
            y={1640}
            scale={1.7}
            outfit="home"
            expression={lookTiles > 0.5 && frame < L(BEATS.letterC) + 24 ? "surprised" : calm > 0.5 ? "happy" : "worried"}
            headTilt={interpolate(calm, [0, 1], [5, -7]) + wave(frame, 50, 2)}
            lookX={interpolate(calm, [0, 1], [0, -0.8]) * (1 - lookTiles)}
            lookY={interpolate(calm, [0, 1], [0.3, -0.4]) * (1 - lookTiles) - lookTiles * 0.9}
            armL={2}
            armR={4 + lookTiles * 8}
            blinkSeed={7}
          />
          {[0, 1, 2].map((i) => {
            const s = pop(frame, fps, 52 + i * 6, { damping: 10, stiffness: 120 });
            return (
              <Sparkle
                key={i}
                x={700 + i * 90}
                y={960 - i * 40 + wave(frame, 30, 6, i)}
                r={22}
                color={colors.yellow}
                scale={s * (1 - ramp(frame, 120, 135))}
              />
            );
          })}
          {TILES.map((tile) => {
            const s = pop(frame, fps, L(tile.beat), { damping: 9, stiffness: 140, mass: 0.7 });
            if (s < 0.001) return null;
            const baseY = 610 + wave(frame, 40, 8, tile.x);
            return (
              <LetterTile
                key={tile.ch}
                ch={tile.ch}
                color={tile.color}
                x={interpolate(fly, [0, 1], [tile.x, 540])}
                y={interpolate(s, [0, 1], [-200, baseY]) + fly * -320}
                size={150}
                rot={(1 - s) * 30 + wave(frame, 34, 4, tile.x)}
                scale={Math.min(1.1, s) * (1 - fly * 0.85)}
              />
            );
          })}
          {strike > 0 && fly < 1 ? (
            <path
              d="M220 640L860 590"
              stroke={colors.red}
              strokeWidth={22}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={`${strike} 1`}
              opacity={1 - fly}
            />
          ) : null}
        </g>
      </Stage>
      <KineticLine
        words={["JANGAN", { t: "PANIK", c: colors.red }, "DULU!"]}
        top={235}
        size={112}
        start={L(BEATS.janganPanik)}
        stagger={6}
        exitAt={L(P(5)) + 20}
        underline
      />
      <Pill
        text="PERSEDIAAN TAHUN 1"
        top={265}
        start={L(P(6))}
        size={62}
        bg={colors.brandBlue}
        exitAt={L(BEATS.bukanSekadar) - 8}
      />
      <KineticLine
        words={["BUKAN", { t: "SEKADAR", c: colors.brandBlue }]}
        top={245}
        size={110}
        start={L(BEATS.bukanSekadar)}
        stagger={7}
        exitAt={L(BEATS.tigaPerkara) - 16}
      />
    </AbsoluteFill>
  );
};
