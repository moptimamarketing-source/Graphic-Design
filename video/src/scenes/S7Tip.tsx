import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { Boy } from "../characters/Boy";
import { Mother } from "../characters/Mother";
import { KineticLine, Pill } from "../components/Kinetic";
import { cam, Stage } from "../components/Stage";
import { lipSync, pop, ramp, wave } from "../lib/anim";
import { LivingRoom, SofaFront } from "../props/Backgrounds";
import { OpenBook, Sparkle, Star } from "../props/Items";
import { BEATS, P } from "../timing";
import { colors } from "../theme";
import { useSceneClock } from "./common";

// 0:34.8 – 0:43.0  "Mulakan dengan aktiviti membaca yang ringkas dan
// menyeronokkan. Puji setiap usaha kecil mereka."
export const S7Tip: React.FC = () => {
  const { frame, fps, abs, L } = useSceneClock(7);
  const praise = L(P(15));
  const stamp = L(BEATS.usahaKecil);
  const flip1 = ramp(frame, 40, 56);
  const flip2 = ramp(frame, 128, 144);
  const thumb = pop(frame, fps, praise + 4, { damping: 12, stiffness: 140 });
  const stampS = pop(frame, fps, stamp, { damping: 9, stiffness: 180, mass: 0.6 });
  const reading = frame > 60 && frame < praise ? Math.abs(Math.sin(frame / 3.2)) * 0.6 : 0;
  const z = interpolate(frame, [0, 259], [1.02, 1.12]);

  return (
    <AbsoluteFill>
      <Stage background="#FFF1D2">
        <g transform={cam(z, 540, 1150, 540, 1130)}>
          <LivingRoom variant="sofa" camX={frame * 0.3} />
          <Mother
            x={360}
            y={1530}
            scale={1.7}
            expression={frame > praise ? "joy" : "warm"}
            mouthOpen={lipSync(abs)}
            headTilt={8 + wave(frame, 50, 2)}
            lookX={0.7}
            lookY={0.6}
            armR={frame > praise ? 34 + thumb * 40 : 34}
            elbowR={frame > praise ? 46 + thumb * 40 : 46}
            thumbUpR={thumb > 0.5}
            armL={8}
            blinkSeed={2}
          />
          <Boy
            x={700}
            y={1310}
            scale={1.35}
            outfit="home"
            expression={stampS > 0.5 ? "proud" : "happy"}
            mouthOpen={reading}
            lookX={stampS > 0.5 ? -0.6 : -0.4}
            lookY={stampS > 0.5 ? -0.3 : 0.8}
            headTilt={-6 + wave(frame, 45, 2)}
            armL={-14}
            elbowL={-58}
            armR={4 + (stampS > 0.5 ? stampS * 30 : 0)}
            blinkSeed={10}
          />
          <SofaFront />
          <OpenBook
            x={560}
            y={1190}
            w={380}
            rot={-3}
            flip={flip1 < 1 ? flip1 : flip2}
            left={
              <g>
                <circle cx={0} cy={-20} r={34} fill={colors.yellow} stroke={colors.ink} strokeWidth={4} />
                <path d="M-60 40Q0 10 60 40" stroke={colors.green} strokeWidth={10} fill="none" strokeLinecap="round" />
              </g>
            }
            right={
              <g>
                <text y={10} textAnchor="middle" fontFamily="'Baloo 2', sans-serif" fontWeight={800} fontSize={58} fill={colors.brandBlue}>
                  Aa
                </text>
                {stampS > 0.01 ? <Star x={30} y={40} r={36} scale={interpolate(stampS, [0, 1], [2.6, 1])} rot={(1 - stampS) * 90} /> : null}
              </g>
            }
          />
          {[0, 1, 2, 3, 4].map((i) => (
            <Sparkle
              key={i}
              x={560 + Math.cos(i * 1.3) * 260}
              y={1110 + Math.sin(i * 2.1) * 140}
              r={18}
              color={i % 2 ? colors.yellow : "#FFFFFF"}
              scale={(0.5 + 0.5 * Math.sin(frame / 5 + i * 1.7)) * ramp(frame, 20, 40)}
            />
          ))}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              x={560 + Math.cos(i) * 230 * stampS}
              y={1150 + Math.sin(i) * 180 * stampS}
              r={16}
              opacity={stampS * (1 - ramp(frame, stamp + 20, stamp + 34))}
            />
          ))}
        </g>
      </Stage>
      <Pill text="AKTIVITI MEMBACA" top={262} start={L(P(14)) + 30} size={60} bg={colors.brandBlue} exitAt={L(BEATS.ringkas) - 8} />
      <KineticLine words={[{ t: "RINGKAS", c: colors.brandBlue }]} top={235} size={128} start={L(BEATS.ringkas)} exitAt={praise - 8} />
      <KineticLine words={["DAN", { t: "MENYERONOKKAN", c: colors.red }]} top={380} size={84} start={L(BEATS.menyeronokkan)} stagger={5} exitAt={praise - 8} />
      <KineticLine words={[{ t: "PUJI", c: colors.yellow }]} top={225} size={150} start={praise} outline={colors.ink} />
      <KineticLine words={["USAHA", "KECIL"]} top={405} size={110} start={stamp} stagger={7} />
    </AbsoluteFill>
  );
};
