import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

// Soft out-of-focus light drifting in front of the scenes for depth.
// Positions come from the index, so every frame is reproducible.
const DOTS = Array.from({ length: 16 }, (_, i) => {
  const h = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
  return {
    x: h(1) * 1080,
    y: h(2) * 1920,
    r: 26 + h(3) * 70,
    speed: 0.25 + h(4) * 0.6,
    sway: 20 + h(5) * 40,
    phase: h(6) * Math.PI * 2,
    color: ["#7FD3F7", "#FFE59A", "#FFFFFF", "#F9B6B0"][i % 4],
  };
});

export const Bokeh: React.FC<{ until: number }> = ({ until }) => {
  const frame = useCurrentFrame();
  if (frame >= until) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <defs>
          {DOTS.map((d, i) => (
            <radialGradient key={i} id={`bokeh-${i}`}>
              <stop offset="0" stopColor={d.color} stopOpacity={0.5} />
              <stop offset="0.7" stopColor={d.color} stopOpacity={0.18} />
              <stop offset="1" stopColor={d.color} stopOpacity={0} />
            </radialGradient>
          ))}
        </defs>
        {DOTS.map((d, i) => {
          const y = ((d.y - frame * d.speed) % 2100 + 2100) % 2100 - 90;
          const x = d.x + Math.sin(frame / 60 + d.phase) * d.sway;
          const twinkle = 0.55 + 0.45 * Math.sin(frame / 25 + d.phase);
          return <circle key={i} cx={x} cy={y} r={d.r} fill={`url(#bokeh-${i})`} opacity={0.5 * twinkle} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
