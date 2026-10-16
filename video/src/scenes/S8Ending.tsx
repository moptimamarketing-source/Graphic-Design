import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile } from "remotion";
import { Boy } from "../characters/Boy";
import { Mother } from "../characters/Mother";
import { KineticLine, Pill } from "../components/Kinetic";
import { cam, Stage } from "../components/Stage";
import { lipSync, pop, ramp, wave } from "../lib/anim";
import { Neighbourhood, SchoolGate } from "../props/Backgrounds";
import { ClosedBook, Sparkle } from "../props/Items";
import { BEATS, MUSIC_BEAT, P } from "../timing";
import { colors } from "../theme";
import { useSceneClock } from "./common";

// 0:43.0 – 1:00.1
// A  walk to school: "Sebab setiap anak belajar mengikut kemampuan masing-masing.
//    Ingat, parents. Kita bukan sekadar nak anak pandai membaca."
// B  at the sunny gate: "Kita nak mereka yakin untuk belajar."
// C  end card: "Minda Optima, sejak 1995." Logo lands on the spoken name.

const Walk: React.FC<{ frame: number; abs: number }> = ({ frame, abs }) => {
  const phase = frame / 4.2;
  return (
    <Stage>
      <g transform={cam(1.0, 540, 960)}>
        <Neighbourhood scroll={frame * 6} />
        <Mother
          x={420}
          y={1620}
          scale={1.62}
          walk={phase}
          mouthOpen={lipSync(abs)}
          headTilt={6 + wave(frame, 40, 2)}
          lookX={0.8}
          lookY={0.4}
          blinkSeed={3}
        />
        <Boy
          x={670}
          y={1620}
          scale={1.42}
          outfit="school"
          bag
          walk={phase + 0.6}
          expression="happy"
          lookX={-0.6}
          lookY={-0.5}
          headTilt={-5}
          armR={-12}
          elbowR={-60}
          frontItem={<ClosedBook x={112} y={236} w={34} h={84} color={colors.orange} rot={8} />}
          blinkSeed={12}
        />
      </g>
    </Stage>
  );
};

const Gate: React.FC<{ frame: number; abs: number; local: number }> = ({ frame, abs, local }) => {
  const wavey = pop(frame, 30, local, { damping: 12, stiffness: 120 });
  return (
    <Stage>
      <g transform={cam(interpolate(frame, [0, 120], [1.12, 1.2]), 540, 1120, 540, 1100)}>
        <SchoolGate sunny camX={frame * 0.8} />
        <Mother
          x={360}
          y={1640}
          scale={1.62}
          expression="joy"
          mouthOpen={lipSync(abs)}
          headTilt={6}
          lookX={0.8}
          armR={34}
          elbowR={12}
          blinkSeed={3}
        />
        <Boy
          x={640}
          y={1620}
          scale={1.5}
          outfit="school"
          bag
          expression="proud"
          headTilt={-4 + wave(frame, 30, 2)}
          armR={6 + wavey * 146}
          elbowR={wavey * (10 + wave(frame, 8, 22))}
          armL={-12}
          elbowL={-60}
          frontItem={<ClosedBook x={86} y={240} w={36} h={86} color={colors.orange} rot={-6} />}
          blinkSeed={12}
        />
      </g>
    </Stage>
  );
};

// The logo PNG has transparent padding; these place its artwork centre.
const LOGO_W = 1000;
const LOGO_CX = (1175 / 2250) * LOGO_W;
const LOGO_CY = (935 / 2250) * LOGO_W;

const EndCard: React.FC<{ frame: number; fps: number; L: (a: number) => number }> = ({ frame, fps, L }) => {
  const logoIn = pop(frame, fps, L(BEATS.mindaOptima), { damping: 11, stiffness: 110, mass: 0.9 });
  const settle = 1 - ramp(frame, L(BEATS.mindaOptima) + 30, L(BEATS.mindaOptima) + 90);
  const float = wave(frame, 60, 6) * settle;
  // A small bump on each music beat after the logo lands, easing off.
  const sinceHit = frame - L(BEATS.mindaOptima);
  const beatPhase = (sinceHit % MUSIC_BEAT) / MUSIC_BEAT;
  const beatPulse =
    sinceHit > MUSIC_BEAT && sinceHit < MUSIC_BEAT * 8 ? 0.028 * Math.exp(-beatPhase * 6) * (1 - sinceHit / (MUSIC_BEAT * 8)) : 0;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 42%, #FFFFFF 0%, #EAF6FD 55%, #CDEBFA 100%)" }}>
      <Stage background="transparent">
        {Array.from({ length: 14 }).map((_, i) => {
          const s = pop(frame, fps, L(BEATS.mindaOptima) + i * 2, { damping: 14, stiffness: 90 });
          const ang = (i / 14) * Math.PI * 2;
          const dist = 380 + (i % 3) * 60;
          const tw = 0.75 + 0.25 * Math.sin(frame / 6 + i);
          return (
            <Sparkle
              key={i}
              x={540 + Math.cos(ang) * dist * s}
              y={760 + Math.sin(ang) * dist * 0.58 * s}
              r={14 + (i % 3) * 6}
              color={[colors.yellow, colors.skyBlue, colors.red][i % 3]}
              scale={s * tw}
            />
          );
        })}
      </Stage>
      <Img
        src={staticFile("assets/logo-minda-optima.png")}
        style={{
          position: "absolute",
          width: LOGO_W,
          left: 540 - LOGO_CX,
          top: 820 - LOGO_CY + float,
          transform: `scale(${(0.2 + 0.8 * logoIn) * (1 + beatPulse)}) rotate(${(1 - logoIn) * -10}deg)`,
          transformOrigin: `${LOGO_CX}px ${LOGO_CY}px`,
          opacity: Math.min(1, logoIn * 2),
        }}
      />
      <KineticLine
        words={["BINA", "KEYAKINAN", { t: "ANAK", c: colors.red }]}
        top={1105}
        size={76}
        start={L(BEATS.mindaOptima) + 18}
        stagger={5}
        color={colors.brandBlue}
      />
      <Pill text="SEJAK 1995" top={1215} start={L(BEATS.sejak1995)} size={66} bg={colors.yellow} color={colors.ink} />
    </AbsoluteFill>
  );
};

export const S8Ending: React.FC = () => {
  const { frame, fps, abs, L } = useSceneClock(8);
  const toGate = L(P(20)) - 14;
  const gateMix = ramp(frame, toGate, toGate + 12);
  const toCard = L(BEATS.mindaOptima) - 8;
  const reveal = Easing.inOut(Easing.cubic)(ramp(frame, toCard, toCard + 16));

  return (
    <AbsoluteFill>
      {gateMix < 1 ? <Walk frame={frame} abs={abs} /> : null}
      {gateMix > 0 && reveal < 1 ? (
        <AbsoluteFill style={{ opacity: gateMix }}>
          <Gate frame={frame - toGate} abs={abs} local={L(BEATS.yakin) - toGate} />
        </AbsoluteFill>
      ) : null}
      {reveal > 0 ? (
        <AbsoluteFill style={{ clipPath: `circle(${reveal * 75}% at 50% 45%)` }}>
          <EndCard frame={frame} fps={fps} L={L} />
        </AbsoluteFill>
      ) : null}

      {/* A: walk */}
      <KineticLine words={["SETIAP", "ANAK"]} top={235} size={110} start={L(P(16))} stagger={6} exitAt={L(P(18)) - 10} />
      <KineticLine
        words={[{ t: "IKUT KEMAMPUAN", c: colors.brandBlue }]}
        top={360}
        size={88}
        start={L(P(17))}
        exitAt={L(P(18)) - 10}
      />
      <KineticLine
        words={[{ t: "MASING-MASING", c: colors.red }]}
        top={462}
        size={88}
        start={L(BEATS.kemampuan) + 10}
        exitAt={L(P(18)) - 10}
      />
      <Pill text="INGAT, PARENTS!" top={265} start={L(BEATS.ingat)} size={62} bg={colors.yellow} color={colors.ink} exitAt={L(P(19)) - 2} />
      <KineticLine words={["BUKAN", "SEKADAR"]} top={235} size={104} start={L(P(19))} stagger={6} exitAt={toGate} />
      <KineticLine
        words={[{ t: "PANDAI MEMBACA", c: colors.brandBlue }]}
        top={360}
        size={94}
        start={L(BEATS.pandaiMembaca)}
        exitAt={toGate}
      />
      {/* B: gate */}
      <KineticLine words={["KITA", "NAK", "MEREKA"]} top={235} size={84} start={L(P(20))} stagger={5} exitAt={toCard - 4} />
      <KineticLine
        words={[{ t: "YAKIN", c: colors.yellow }]}
        top={300}
        size={150}
        start={L(BEATS.yakin)}
        outline={colors.ink}
        exitAt={toCard - 4}
      />
      <KineticLine words={["UNTUK", "BELAJAR"]} top={455} size={84} start={L(BEATS.yakin) + 10} stagger={6} exitAt={toCard - 4} />
    </AbsoluteFill>
  );
};
