import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { Boy } from "../characters/Boy";
import { Mother } from "../characters/Mother";
import { cam, Stage } from "../components/Stage";
import { lipSync, pop, ramp, wave } from "../lib/anim";
import { LivingRoom, Table } from "../props/Backgrounds";
import { ClosedBook, Sparkle } from "../props/Items";
import { BEATS } from "../timing";
import { colors } from "../theme";
import { useSceneClock } from "./common";

// 0:16.6 – 0:19.5  "Pertama, anak boleh ikut arahan mudah."
// Mother points at the table; he carries the book over and puts it down.
export const S3IkutArahan: React.FC = () => {
  const { frame, fps, abs, L } = useSceneClock(3);
  const place = L(BEATS.ikutArahan) - 8;

  const walkIn = ramp(frame, 0, 38);
  const boyX = interpolate(walkIn, [0, 1], [1010, 770]);
  const walking = frame < 38;
  const nod = frame > 22 && frame < 40 ? Math.max(0, Math.sin(((frame - 22) / 9) * Math.PI)) : 0;
  const reachDown = ramp(frame, place - 8, place);
  const placed = frame >= place;
  const bounce = pop(frame, fps, place, { damping: 8, stiffness: 220, mass: 0.5 });
  const cheer = pop(frame, fps, L(BEATS.ikutArahan) + 4, { damping: 12, stiffness: 140 });

  return (
    <AbsoluteFill>
      <Stage background="#FFF1D2">
        <g transform={cam(1.02 + frame * 0.0006, 540, 1200, 540, 1200)}>
          <LivingRoom camX={frame * 0.6} />
          <Mother
            x={270}
            y={1720}
            scale={1.7}
            mouthOpen={lipSync(abs)}
            expression={cheer > 0.5 ? "joy" : "warm"}
            headTilt={5 + wave(frame, 40, 2)}
            lookX={0.7}
            lookY={0.3}
            armR={interpolate(ramp(frame, 4, 14), [0, 1], [6, 62]) + wave(frame, 18, 3)}
            elbowR={interpolate(ramp(frame, 4, 14), [0, 1], [0, 26])}
            armL={8}
            blinkSeed={4}
          />
          <Boy
            x={boyX}
            y={1640}
            scale={1.5}
            outfit="home"
            expression={cheer > 0.5 ? "proud" : "happy"}
            walk={walking ? frame / 3.2 : undefined}
            lookX={-0.7 + reachDown * 0.3}
            lookY={nod * 0.8 + reachDown * 0.6}
            bob={nod * 4}
            headTilt={-4}
            armL={placed ? 4 + cheer * 6 : interpolate(reachDown, [0, 1], [-12, 10])}
            elbowL={placed ? 0 : interpolate(reachDown, [0, 1], [-62, -40])}
            armR={placed ? 4 + cheer * 140 : interpolate(reachDown, [0, 1], [-12, 10])}
            elbowR={placed ? cheer * 10 : interpolate(reachDown, [0, 1], [-62, -40])}
            frontItem={placed ? null : <ClosedBook x={100} y={250 + reachDown * 30} w={120} h={40} rot={-4} />}
            blinkSeed={9}
          />
          <Table y={1360} />
          {placed ? (
            <g transform={`translate(0 ${(1 - bounce) * -30})`}>
              <ClosedBook x={610} y={1338} w={170} h={44} />
            </g>
          ) : null}
          {[0, 1, 2, 3].map((i) => (
            <Sparkle
              key={i}
              x={560 + i * 40}
              y={1290 - (i % 2) * 40}
              r={18}
              color={colors.yellow}
              scale={cheer * (1 - ramp(frame, L(BEATS.ikutArahan) + 24, L(BEATS.ikutArahan) + 36))}
            />
          ))}
        </g>
      </Stage>
    </AbsoluteFill>
  );
};
