import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { Boy } from "../characters/Boy";
import { Mother } from "../characters/Mother";
import { KineticLine, Pill } from "../components/Kinetic";
import { cam, Stage } from "../components/Stage";
import { lipSync, pop, ramp, wave } from "../lib/anim";
import { Neighbourhood, SchoolGate } from "../props/Backgrounds";
import { ClosedBook, LetterTile } from "../props/Items";
import { BEATS, ENDING_START, P } from "../timing";
import { colors } from "../theme";
import { useSceneClock } from "./common";

// 0:43.0 – 1:00.1
// A  walk to school: "Sebab setiap anak belajar mengikut kemampuan masing-masing.
//    Ingat, parents. Kita bukan sekadar nak anak pandai membaca."
// B  at the sunny gate: "Kita nak mereka yakin untuk belajar." Glowing
//    letters spiral out of his book, then the camera dives into the book
//    and everything flashes white.
// C  the HyperFrames ending takes over from that white (MindaOptimaEp08).

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

// Where the boy's book sits on screen in the gate shot.
const BOOK = { x: 635, y: 1412 };
const VORTEX = "ABCDEFGHIJKLMNOPQRSTU".split("");
const TILE_COLORS = [colors.red, colors.yellow, colors.skyBlue, colors.green, colors.brandBlue, colors.orange];

// Letters spiral up out of the book; as the camera dives they are pulled back in.
const Vortex: React.FC<{ t: number; dive: number }> = ({ t, dive }) => (
  <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
    <defs>
      <filter id="vortexGlow" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="9" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    {VORTEX.map((ch, i) => {
      const age = t - i * 1.3;
      if (age <= 0) return null;
      const grow = Math.min(1, age / 18);
      const ang = i * 2.39996 + age * 0.09;
      const radius = (60 + grow * (230 + (i % 5) * 42)) * (1 - dive);
      const rise = grow * (170 + (i % 4) * 70) * (1 - dive);
      const x = BOOK.x + Math.cos(ang) * radius;
      const y = BOOK.y - rise + Math.sin(ang) * radius * 0.45;
      return (
        <g key={ch} filter="url(#vortexGlow)" opacity={Math.min(1, age / 6)}>
          <LetterTile
            ch={ch}
            color={TILE_COLORS[i % TILE_COLORS.length]}
            x={x}
            y={y}
            size={110}
            rot={Math.sin(age / 8 + i) * 25}
            scale={(0.35 + 0.35 * grow) * (1 - dive * 0.6)}
          />
        </g>
      );
    })}
  </svg>
);

// Radial speed lines converging on the book during the dive.
const SpeedLines: React.FC<{ dive: number }> = ({ dive }) => (
  <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: dive }}>
    {Array.from({ length: 44 }).map((_, i) => {
      const a = (i / 44) * Math.PI * 2 + (i % 3) * 0.05;
      const r0 = 140 + (i % 5) * 40 + (1 - dive) * 300;
      const r1 = r0 + 500 + (i % 4) * 220;
      return (
        <line
          key={i}
          x1={BOOK.x + Math.cos(a) * r0}
          y1={BOOK.y + Math.sin(a) * r0}
          x2={BOOK.x + Math.cos(a) * r1}
          y2={BOOK.y + Math.sin(a) * r1}
          stroke={i % 3 === 0 ? colors.yellow : "#FFFFFF"}
          strokeWidth={3 + (i % 3) * 2}
          strokeLinecap="round"
          opacity={0.75}
        />
      );
    })}
  </svg>
);

export const S8Ending: React.FC = () => {
  const { frame, abs, L } = useSceneClock(8);
  const toGate = L(P(20)) - 14;
  const gateMix = ramp(frame, toGate, toGate + 12);
  const end = L(ENDING_START);
  const vortexStart = L(BEATS.yakin) + 4;
  const diveStart = end - 22;
  const dive = interpolate(frame, [diveStart, end], [0, 1], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const flash = interpolate(frame, [end - 10, end], [0, 1], {
    easing: Easing.in(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // The HyperFrames ending covers the frame from here on.
  if (frame > end + 2) return null;

  return (
    <AbsoluteFill>
      {gateMix < 1 ? <Walk frame={frame} abs={abs} /> : null}
      {gateMix > 0 ? (
        <AbsoluteFill
          style={{
            opacity: gateMix,
            transform: `scale(${1 + 3.6 * dive})`,
            transformOrigin: `${BOOK.x}px ${BOOK.y}px`,
            filter: `blur(${dive * 7}px) brightness(${1 + dive * 0.6})`,
          }}
        >
          <Gate frame={frame - toGate} abs={abs} local={L(BEATS.yakin) - toGate} />
          {frame >= vortexStart ? <Vortex t={frame - vortexStart} dive={dive} /> : null}
        </AbsoluteFill>
      ) : null}
      {dive > 0 ? <SpeedLines dive={dive} /> : null}
      {flash > 0 ? (
        <AbsoluteFill
          style={{
            background: "radial-gradient(circle at 50% 42%, #FFFFFF 0%, #FFFFFF 55%, #EAF6FD 100%)",
            opacity: flash,
          }}
        />
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
        underline
      />
      <Pill text="INGAT, PARENTS!" top={265} start={L(BEATS.ingat)} size={62} bg={colors.yellow} color={colors.ink} exitAt={L(P(19)) - 2} />
      <KineticLine words={["BUKAN", "SEKADAR"]} top={235} size={104} start={L(P(19))} stagger={6} exitAt={toGate} />
      <KineticLine
        words={[{ t: "PANDAI MEMBACA", c: colors.brandBlue }]}
        top={360}
        size={94}
        start={L(BEATS.pandaiMembaca)}
        exitAt={toGate}
        underline
      />
      {/* B: gate */}
      <KineticLine words={["KITA", "NAK", "MEREKA"]} top={235} size={84} start={L(P(20))} stagger={5} exitAt={diveStart} />
      <KineticLine
        words={[{ t: "YAKIN", c: colors.yellow }]}
        top={300}
        size={150}
        start={L(BEATS.yakin)}
        outline={colors.ink}
        exitAt={diveStart}
        underline
      />
      <KineticLine words={["UNTUK", "BELAJAR"]} top={475} size={84} start={L(BEATS.yakin) + 10} stagger={6} exitAt={diveStart} />
    </AbsoluteFill>
  );
};
