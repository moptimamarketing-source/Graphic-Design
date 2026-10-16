import React from "react";
import { AbsoluteFill } from "remotion";

// Full-frame SVG canvas in video coordinates (1080×1920).
export const Stage: React.FC<{ children: React.ReactNode; background?: string }> = ({
  children,
  background = "#FFFFFF",
}) => (
  <AbsoluteFill style={{ backgroundColor: background }}>
    <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {children}
    </svg>
  </AbsoluteFill>
);

// Camera transform: puts world point (cx, cy) at screen point (sx, sy) with zoom z.
export const cam = (z: number, cx: number, cy: number, sx = 540, sy = 960) =>
  `translate(${sx} ${sy}) scale(${z}) translate(${-cx} ${-cy})`;
