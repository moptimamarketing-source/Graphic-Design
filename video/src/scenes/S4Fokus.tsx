import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { Boy } from "../characters/Boy";
import { cam, Stage } from "../components/Stage";
import { pop, ramp, wave } from "../lib/anim";
import { LivingRoom, Table } from "../props/Backgrounds";
import { PuzzlePiece, Sparkle, Stopwatch } from "../props/Items";
import { BEATS } from "../timing";
import { colors } from "../theme";
import { useSceneClock } from "./common";

// 0:19.5 – 0:23.2  "Kedua, anak boleh fokus pada satu aktiviti."
// Seated at the table, he concentrates and fits the puzzle together.
const PIECES = [
  { color: colors.red, from: [240, 1350], to: [480, 1352], rot: -20 },
  { color: colors.skyBlue, from: [860, 1356], to: [600, 1352], rot: 25 },
  { color: colors.yellow, from: [980, 1350], to: [720, 1352], rot: 90 },
];

export const S4Fokus: React.FC = () => {
  const { frame, fps, L } = useSceneClock(4);
  const snap = L(BEATS.fokus) - 6;
  const assemble = ramp(frame, 8, snap);
  const done = pop(frame, fps, snap, { damping: 10, stiffness: 200, mass: 0.5 });
  const happy = frame > snap + 8;
  const ring = ramp(frame, 6, 118);

  return (
    <AbsoluteFill>
      <Stage background="#FFF1D2">
        <g transform={cam(1.18, 540, 1200, 540, 1180)}>
          <LivingRoom camX={-40 + frame * 0.4} />
          {/* Focus bubble around his head */}
          <circle cx={540} cy={1170} r={190 + wave(frame, 30, 6)} fill="#FFFFFF" opacity={0.45} />
          <circle
            cx={540}
            cy={1170}
            r={190 + wave(frame, 30, 6)}
            fill="none"
            stroke={colors.skyBlue}
            strokeWidth={8}
            strokeDasharray="18 18"
            strokeDashoffset={-frame * 2}
            opacity={0.7}
          />
          <Boy
            x={540}
            y={1720}
            scale={1.75}
            outfit="home"
            expression={happy ? "proud" : "focus"}
            lookY={happy ? -0.2 : 0.9}
            lookX={happy ? 0 : interpolate(assemble, [0, 0.5, 1], [-0.6, 0.6, 0])}
            headTilt={happy ? -6 : 6 + wave(frame, 40, 3)}
            armL={happy ? 6 + done * 150 : -14}
            elbowL={happy ? 0 : -66 + wave(frame, 16, 6)}
            armR={happy ? 6 + done * 150 : -14}
            elbowR={happy ? 0 : -66 + wave(frame, 16, 6, 1)}
            blinkSeed={11}
          />
          <Table y={1400} x={40} w={1000} />
          {PIECES.map((p, i) => {
            const k = ramp(frame, 8 + i * 6, snap - (2 - i) * 4);
            const x = interpolate(k, [0, 1], [p.from[0], p.to[0]]);
            const y = interpolate(k, [0, 1], [p.from[1], p.to[1]]) - Math.sin(k * Math.PI) * 40;
            return <PuzzlePiece key={i} x={x} y={y} size={104} color={p.color} rot={p.rot * (1 - k)} />;
          })}
          {[0, 1, 2, 3, 4].map((i) => (
            <Sparkle
              key={i}
              x={400 + i * 70}
              y={1280 - (i % 2) * 50}
              r={20}
              color={i % 2 ? colors.yellow : "#FFFFFF"}
              scale={done * (1 - ramp(frame, snap + 20, snap + 34))}
            />
          ))}
          <Stopwatch x={860} y={1010} r={72} progress={ring} />
        </g>
      </Stage>
    </AbsoluteFill>
  );
};
