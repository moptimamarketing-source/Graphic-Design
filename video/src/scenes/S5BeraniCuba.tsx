import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { Boy } from "../characters/Boy";
import { cam, Stage } from "../components/Stage";
import { pop, ramp, wave } from "../lib/anim";
import { ClosedBook, OpenBook, Sparkle, Star } from "../props/Items";
import { P } from "../timing";
import { colors } from "../theme";
import { useSceneClock } from "./common";

// 0:23.2 – 0:28.5  "Ketiga, anak berani cuba membaca walaupun takut salah."
// He points at one new word and sounds it out letter by letter. One word,
// slowly: trying, not fluent reading.
const WORD = ["B", "U", "K", "U"];

const Pointer: React.FC = () => (
  <g>
    <line x1={0} y1={0} x2={0} y2={150} stroke="#8A5A34" strokeWidth={9} strokeLinecap="round" />
    <Star x={0} y={156} r={20} />
  </g>
);

export const S5BeraniCuba: React.FC = () => {
  const { frame, fps, L } = useSceneClock(5);
  const first = L(P(11)) + 2;
  const step = 11;
  const litAt = WORD.map((_, i) => first + i * step);
  const lit = (i: number) => ramp(frame, litAt[i], litAt[i] + 4);
  const sounding = litAt.reduce((m, t) => Math.max(m, frame >= t && frame < t + 8 ? Math.sin(((frame - t) / 8) * Math.PI) : 0), 0);
  const sweep = ramp(frame, first - 6, litAt[3] + 4);
  const unsure = frame > L(P(11)) + 62 && frame < L(P(11)) + 96;
  const proud = pop(frame, fps, L(P(11)) + 98, { damping: 11, stiffness: 140 });
  const z = interpolate(frame, [0, 171], [1.0, 1.08]);

  return (
    <AbsoluteFill>
      <Stage background="#FDF6E8">
        <defs>
          <radialGradient id="s5bg" cx="0.45" cy="0.55" r="0.75">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#CDEBFA" />
          </radialGradient>
        </defs>
        <rect width={1080} height={1920} fill="url(#s5bg)" />
        {/* Faint letters drifting up behind */}
        {"ABCDEFGHIJKLM".split("").map((ch, i) => (
          <text
            key={ch}
            x={(i * 173) % 1040 + 20}
            y={1800 - ((frame * (1 + (i % 3) * 0.4) + i * 140) % 1700)}
            fontFamily="'Baloo 2', sans-serif"
            fontWeight={800}
            fontSize={70 + (i % 3) * 20}
            fill={[colors.skyBlue, colors.yellow, colors.red][i % 3]}
            opacity={0.16}
          >
            {ch}
          </text>
        ))}
        <g transform={cam(z, 560, 1150, 540, 1150)}>
          {/* Easel */}
          <path d="M300 1250L230 1640M560 1250L630 1640M430 1250V1660" stroke="#8A5A34" strokeWidth={16} strokeLinecap="round" />
          <OpenBook
            x={420}
            y={1110}
            w={640}
            left={
              <g>
                <ClosedBook x={0} y={-30} w={150} h={110} color={colors.brandBlue} rot={-8} />
                <Star x={70} y={-110} r={26} rot={frame * 2} />
                <text y={100} textAnchor="middle" fontFamily="'Baloo 2', sans-serif" fontWeight={800} fontSize={44} fill="#8FA4BA">
                  bu · ku
                </text>
              </g>
            }
            right={
              <g>
                {WORD.map((ch, i) => {
                  const k = lit(i);
                  const x = -105 + i * 70;
                  return (
                    <g key={i}>
                      <rect x={x - 31} y={-62} width={62} height={92} rx={14} fill={colors.yellow} opacity={k} />
                      <text
                        x={x}
                        y={10}
                        textAnchor="middle"
                        fontFamily="'Baloo 2', sans-serif"
                        fontWeight={800}
                        fontSize={86}
                        fill={k > 0.5 ? colors.ink : "#B8C6D4"}
                        transform={`translate(${x} -16) scale(${1 + 0.25 * Math.max(0, 1 - Math.abs(frame - litAt[i] - 2) / 5)}) translate(${-x} 16)`}
                      >
                        {ch}
                      </text>
                    </g>
                  );
                })}
              </g>
            }
          />
          <Boy
            x={850}
            y={1730}
            scale={1.55}
            flip
            outfit="home"
            expression={proud > 0.5 ? "proud" : unsure ? "worried" : "focus"}
            mouthOpen={sounding * 0.8}
            lookX={proud > 0.5 ? -0.2 : 0.8}
            lookY={proud > 0.5 ? 0 : -0.5}
            headTilt={proud > 0.5 ? -4 : 6 + wave(frame, 30, 2)}
            armR={interpolate(sweep, [0, 1], [128, 150]) * (1 - proud) + proud * 160}
            elbowR={wave(frame, 12, 2) * (1 - proud)}
            handItemR={proud > 0.5 ? null : <Pointer />}
            armL={4 + proud * 20}
            elbowL={proud * 30}
            blinkSeed={13}
          />
          {unsure ? (
            <g transform={`translate(${940 + wave(frame, 10, 4)} 1060)`}>
              <circle r={40} fill="#FFFFFF" stroke={colors.ink} strokeWidth={5} />
              <text y={22} textAnchor="middle" fontFamily="'Baloo 2', sans-serif" fontWeight={800} fontSize={60} fill={colors.red}>
                ?
              </text>
            </g>
          ) : null}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Sparkle
              key={i}
              x={780 + Math.cos(i) * 170}
              y={1080 + Math.sin(i * 1.7) * 120}
              r={22}
              color={i % 2 ? colors.yellow : colors.skyBlue}
              scale={proud * (0.7 + 0.3 * Math.sin(frame / 4 + i))}
            />
          ))}
        </g>
      </Stage>
    </AbsoluteFill>
  );
};
