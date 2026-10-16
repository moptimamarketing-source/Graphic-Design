import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { Boy } from "../characters/Boy";
import { Mother } from "../characters/Mother";
import { KineticLine } from "../components/Kinetic";
import { Stage } from "../components/Stage";
import { lipSync, pop, ramp, wave } from "../lib/anim";
import { LivingRoom } from "../props/Backgrounds";
import { BalanceScale, Heart, OpenBook, Star } from "../props/Items";
import { BEATS, P } from "../timing";
import { colors } from "../theme";
import { useSceneClock } from "./common";

// 0:28.5 – 0:34.8  "Kalau anak masih belum kuasai semuanya, jangan terus
// bandingkan dengan anak orang lain."
// The "other child" is a plain silhouette, so no second detailed child appears.
export const S6JanganBanding: React.FC = () => {
  const { frame, fps, abs, L } = useSceneClock(6);
  const xAt = L(BEATS.bandingkan);
  const cross = ramp(frame, xAt, xAt + 8);
  const open = Easing.inOut(Easing.cubic)(ramp(frame, xAt + 12, xAt + 32));
  const hug = pop(frame, fps, xAt + 24, { damping: 14, stiffness: 100 });
  const tilt = interpolate(frame, [10, 60], [0, -14], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) + wave(frame, 24, 2);
  const boyX = interpolate(open, [0, 1], [270, 640]);
  const boyS = interpolate(open, [0, 1], [1.4, 1.5]);
  const boyY = interpolate(open, [0, 1], [1560, 1640]);

  return (
    <AbsoluteFill>
      <Stage background="#FFF1D2">
        <defs>
          <filter id="silhouette">
            <feFlood floodColor="#9DB0C4" />
            <feComposite in2="SourceAlpha" operator="in" />
          </filter>
        </defs>
        {/* Behind the split: the warm living room the hug happens in */}
        <LivingRoom variant="sofa" warmth={1} />
        {open > 0 ? (
          <g opacity={open}>
            <Mother
              x={460}
              y={1660}
              scale={1.75}
              expression="joy"
              lean={8 * hug}
              headTilt={10 * hug}
              mouthOpen={lipSync(abs) * 0.6}
              armR={interpolate(hug, [0, 1], [6, 52])}
              elbowR={interpolate(hug, [0, 1], [0, 74])}
              armL={10}
              blinkSeed={6}
            />
          </g>
        ) : null}
        {/* Left panel: our boy, unsure */}
        <g transform={`translate(${-open * 620} 0)`}>
          <rect x={0} y={0} width={540} height={1920} fill="#DCEFFB" />
        </g>
        {/* Right panel: the comparison */}
        <g transform={`translate(${open * 620} 0)`}>
          <rect x={540} y={0} width={540} height={1920} fill="#FFF4D6" />
          <g filter="url(#silhouette)">
            <Boy x={810} y={1560} scale={1.4} expression="proud" armL={150} armR={150} elbowL={10} elbowR={10} blinkSeed={20} />
          </g>
          {[0, 1, 2].map((i) => (
            <Star key={i} x={700 + i * 110} y={930 - (i % 2) * 60 + wave(frame, 30, 8, i)} r={30} rot={frame * 2 + i * 30} opacity={0.8} />
          ))}
        </g>
        <Boy
          x={boyX}
          y={boyY}
          scale={boyS}
          expression={hug > 0.4 ? "happy" : "worried"}
          lookX={hug > 0.4 ? -0.8 : 0.6}
          lookY={hug > 0.4 ? -0.4 : 0.6}
          headTilt={hug > 0.4 ? -10 * hug : 5 + wave(frame, 40, 3)}
          lean={-6 * hug}
          armL={hug > 0.4 ? 4 : -12}
          elbowL={hug > 0.4 ? 0 : -60}
          armR={hug > 0.4 ? 4 : -12}
          elbowR={hug > 0.4 ? 0 : -60}
          frontItem={
            hug > 0.4 ? null : (
              <g opacity={1 - open}>
                <OpenBook x={100} y={244} w={110} rot={180} />
              </g>
            )
          }
          blinkSeed={8}
        />
        {/* Floating question marks over our boy */}
        <g opacity={1 - open}>
          {[0, 1, 2].map((i) => (
            <text
              key={i}
              x={170 + i * 90}
              y={960 - ((frame * 1.2 + i * 40) % 120)}
              fontFamily="'Baloo 2', sans-serif"
              fontWeight={800}
              fontSize={64}
              fill={colors.brandBlue}
              opacity={0.7}
            >
              ?
            </text>
          ))}
        </g>
        <g opacity={1 - open}>
          <circle cx={540} cy={1200} r={58} fill={colors.ink} />
          <text x={540} y={1222} textAnchor="middle" fontFamily="'Baloo 2', sans-serif" fontWeight={800} fontSize={58} fill="#FFFFFF">
            VS
          </text>
          <BalanceScale x={540} y={720} tilt={tilt} s={1.15} />
          {cross > 0 ? (
            <g stroke={colors.red} strokeWidth={34} strokeLinecap="round">
              <path d="M330 600L750 960" pathLength={1} strokeDasharray={`${Math.min(1, cross * 2)} 1`} />
              <path d="M750 600L330 960" pathLength={1} strokeDasharray={`${Math.max(0, cross * 2 - 1)} 1`} />
            </g>
          ) : null}
        </g>
        {[0, 1, 2, 3].map((i) => {
          const s = pop(frame, fps, xAt + 30 + i * 5, { damping: 12, stiffness: 120 });
          return (
            <Heart
              key={i}
              x={460 + i * 70 + wave(frame, 30, 10, i)}
              y={1000 - s * 140 - i * 30 - (frame - xAt) * 0.6}
              s={s * (0.9 + (i % 2) * 0.3)}
              opacity={s}
            />
          );
        })}
      </Stage>
      <KineticLine words={["JANGAN"]} top={230} size={110} start={L(P(13))} />
      <KineticLine words={[{ t: "BANDINGKAN", c: colors.red }, "ANAK"]} top={350} size={104} start={xAt} stagger={8} />
    </AbsoluteFill>
  );
};
