import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { pop, ramp } from "../lib/anim";
import { colors, fonts } from "../theme";

type Word = string | { t: string; c?: string; bg?: string };

// A headline line whose words spring in one after another.
export const KineticLine: React.FC<{
  words: Word[];
  top: number;
  size: number;
  start: number;
  color?: string;
  stagger?: number;
  exitAt?: number;
  outline?: string;
  rotate?: number;
}> = ({ words, top, size, start, color = colors.ink, stagger = 4, exitAt, outline = "#FFFFFF", rotate = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exit = exitAt === undefined ? 0 : ramp(frame, exitAt, exitAt + 8);
  if (frame < start) return null;
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 80,
        right: 80,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        columnGap: size * 0.28,
        transform: `rotate(${rotate}deg) translateY(${-exit * 50}px)`,
        opacity: 1 - exit,
      }}
    >
      {words.map((w, i) => {
        const word = typeof w === "string" ? { t: w } : w;
        const s = pop(frame, fps, start + i * stagger, { damping: 11, stiffness: 170, mass: 0.7 });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              fontFamily: fonts.display,
              fontWeight: 800,
              fontSize: size,
              lineHeight: 1.05,
              color: word.c ?? color,
              WebkitTextStroke: `${size * 0.13}px ${outline}`,
              paintOrder: "stroke fill",
              textShadow: `0 ${size * 0.08}px 0 rgba(18,53,91,0.22)`,
              transform: `translateY(${(1 - s) * 70}px) scale(${0.4 + 0.6 * s}) rotate(${(1 - s) * -10}deg)`,
              opacity: Math.min(1, s * 2),
              background: word.bg,
              borderRadius: word.bg ? size * 0.3 : undefined,
              padding: word.bg ? `0 ${size * 0.25}px` : undefined,
            }}
          >
            {word.t}
          </span>
        );
      })}
    </div>
  );
};

// Rounded label that unrolls from the centre.
export const Pill: React.FC<{
  text: string;
  top: number;
  start: number;
  size?: number;
  bg?: string;
  color?: string;
  exitAt?: number;
}> = ({ text, top, start, size = 58, bg = colors.red, color = "#FFFFFF", exitAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < start) return null;
  const s = pop(frame, fps, start, { damping: 12, stiffness: 150 });
  const textIn = ramp(frame, start + 4, start + 12);
  const exit = exitAt === undefined ? 0 : ramp(frame, exitAt, exitAt + 8);
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: 1 - exit }}>
      <div
        style={{
          background: bg,
          color,
          fontFamily: fonts.display,
          fontWeight: 800,
          fontSize: size,
          lineHeight: 1,
          padding: `${size * 0.32}px ${size * 0.6}px ${size * 0.22}px`,
          borderRadius: size,
          border: `5px solid ${colors.ink}`,
          boxShadow: `0 8px 0 ${colors.ink}`,
          transform: `scaleX(${s}) translateY(${-exit * 30}px)`,
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ opacity: textIn }}>{text}</span>
      </div>
    </div>
  );
};
