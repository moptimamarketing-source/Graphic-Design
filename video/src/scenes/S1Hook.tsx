import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { Boy } from "../characters/Boy";
import { KineticLine, Pill } from "../components/Kinetic";
import { cam, Stage } from "../components/Stage";
import { pop, ramp, wave } from "../lib/anim";
import { SchoolGate } from "../props/Backgrounds";
import { LetterTile, OpenBook } from "../props/Items";
import { BEATS, P } from "../timing";
import { colors } from "../theme";
import { useSceneClock } from "./common";

// 0:00 – 0:07.3  "Parents, anak nak masuk Tahun 1 tahun depan,
// tapi masih belum lancar membaca?"
const BOY = { x: 540, y: 1560, s: 1.9 };
const toWorld = (bx: number, by: number) => ({
  x: BOY.x + (bx - 100) * BOY.s,
  y: BOY.y + (by - 400) * BOY.s,
});

const LETTERS = [
  { ch: "A", color: colors.red, dx: -235, dy: -60, at: 44, rot: -14 },
  { ch: "B", color: colors.yellow, dx: 245, dy: -20, at: 52, rot: 12 },
  { ch: "C", color: colors.skyBlue, dx: 200, dy: 175, at: 60, rot: -8 },
  { ch: "?", color: colors.green, dx: -215, dy: 160, at: 68, rot: 10 },
];

export const S1Hook: React.FC = () => {
  const { frame, fps } = useSceneClock(1);

  // Camera: wide push on the gate, then a move into a medium close-up.
  const ease = Easing.inOut(Easing.cubic);
  const zoom = interpolate(frame, [0, 30, 62, 225], [1.0, 1.05, 1.3, 1.36], {
    easing: ease,
    extrapolateRight: "clamp",
  });
  const focusY = interpolate(frame, [0, 30, 62], [960, 972, 979], { easing: ease, extrapolateRight: "clamp" });
  const screenY = interpolate(frame, [30, 62], [960, 900], { easing: ease, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // Depth of field: background softens once we are in the close-up.
  const closeUp = ramp(frame, 30, 62);
  const camX = wave(frame, 160, 14);

  // Acting: looks up at the sign, then down at the camera, unsure.
  const lookUp = 1 - ramp(frame, 22, 34);
  const hold = ramp(frame, 34, 44); // arms come up to hold the book
  const bookPop = pop(frame, fps, 38, { damping: 11, stiffness: 160 });
  const worryTilt = wave(frame, 46, 5) + (frame > BEATS.belumLancar ? -4 : 0);
  const bookWorld = toWorld(100, 246);

  return (
    <AbsoluteFill>
      <Stage background="#DCEEF8">
        <g transform={cam(zoom, 540 + camX, focusY, 540, screenY)}>
          <defs>
            <filter id="s1blur" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation={closeUp * 4} />
            </filter>
          </defs>
          <g filter="url(#s1blur)">
            <SchoolGate camX={camX} />
          </g>
          <Boy
            x={BOY.x}
            y={BOY.y}
            scale={BOY.s}
            outfit="school"
            bag
            expression={frame > 40 && frame < 100 ? "surprised" : "worried"}
            headTilt={worryTilt}
            lookY={-0.9 * lookUp + 0.1}
            lookX={wave(frame, 70, 0.3)}
            armL={interpolate(hold, [0, 1], [-2, -12])}
            elbowL={interpolate(hold, [0, 1], [-8, -62])}
            armR={interpolate(hold, [0, 1], [-2, -12])}
            elbowR={interpolate(hold, [0, 1], [-8, -62])}
            blinkSeed={2}
            frontItem={
              bookPop > 0.01 ? (
                <g transform={`translate(100 246) scale(${bookPop}) rotate(${(1 - bookPop) * 20}) translate(-100 -246)`}>
                  <OpenBook x={100} y={246} w={118} rot={wave(frame, 30, 3)} />
                </g>
              ) : null
            }
          />
          {LETTERS.map((l) => {
            const s = pop(frame, fps, l.at, { damping: 9, stiffness: 120, mass: 0.7 });
            if (s <= 0.001) return null;
            const head = toWorld(100, 94);
            const x = interpolate(s, [0, 1], [bookWorld.x, head.x + l.dx]);
            const y = interpolate(s, [0, 1], [bookWorld.y, head.y + l.dy]) - Math.sin(Math.min(1, s) * Math.PI) * 90;
            return (
              <LetterTile
                key={l.ch}
                ch={l.ch}
                color={l.color}
                x={x + wave(frame, 50, 8, l.at)}
                y={y + wave(frame, 40, 12, l.at * 2)}
                size={104}
                rot={l.rot + wave(frame, 36, 9, l.at)}
                scale={Math.min(1, s)}
              />
            );
          })}
        </g>
      </Stage>
      <AbsoluteFill
        style={{
          height: 780,
          opacity: closeUp,
          background: "linear-gradient(to bottom, rgba(232,246,253,0.9) 0%, rgba(232,246,253,0.7) 70%, rgba(232,246,253,0) 100%)",
        }}
      />
      <Pill text="Parents," top={225} start={P(1)} size={46} bg={colors.yellow} color={colors.ink} />
      <KineticLine words={["NAK", "MASUK"]} top={318} size={124} start={BEATS.nak} stagger={10} />
      <KineticLine
        words={[{ t: "TAHUN", c: colors.brandBlue }, { t: "1?", c: colors.yellow }]}
        top={448}
        size={150}
        start={BEATS.tahun1}
        stagger={8}
        underline
      />
      <Pill text="BELUM LANCAR MEMBACA?" top={640} start={BEATS.belumLancar} size={56} />
    </AbsoluteFill>
  );
};
