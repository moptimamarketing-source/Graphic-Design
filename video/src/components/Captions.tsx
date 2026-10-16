import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CAPTIONS } from "../captions";
import { pop } from "../lib/anim";
import { colors, fonts, SAFE } from "../theme";

// Bottom subtitles: one page per phrase, max two lines, inside the UI-safe area.
export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const t = frame / fps;
  const page = CAPTIONS.find((c) => t >= c.start - 0.04 && t < c.end);
  if (!page) return null;
  const local = frame - Math.round(page.start * fps);
  const s = pop(local, fps, 0, { damping: 15, stiffness: 220, mass: 0.6 });
  const out = interpolate(t, [page.end - 0.12, page.end], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const hi = new Set(page.hi ?? []);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: SAFE.side,
          right: SAFE.side,
          bottom: height - 1540,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: 900,
            background: "rgba(18, 53, 91, 0.9)",
            borderRadius: 30,
            padding: "16px 32px 20px",
            textAlign: "center",
            fontFamily: fonts.body,
            fontWeight: 900,
            fontSize: 52,
            lineHeight: 1.2,
            color: colors.white,
            boxShadow: "0 10px 30px rgba(10, 30, 60, 0.25)",
            transform: `translateY(${(1 - s) * 24}px) scale(${0.94 + 0.06 * s})`,
            opacity: Math.min(1, s * 1.6) * out,
          }}
        >
          {page.text.split(" ").map((w, i) => (
            <span key={i} style={{ color: hi.has(w) ? colors.yellow : undefined }}>
              {i > 0 ? " " : ""}
              {w}
            </span>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
