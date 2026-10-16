import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { pop, ramp } from "../lib/anim";
import { BEATS, CUTS, P } from "../timing";
import { colors, fonts } from "../theme";

// "3 perkara" readiness card. Lives above the scenes from scene 2 to scene 5
// so it carries across the cuts. Uses absolute composition frames.
const ITEMS = [
  { label: "IKUT ARAHAN", reveal: P(8), tick: BEATS.ikutArahan },
  { label: "BOLEH FOKUS", reveal: P(9), tick: BEATS.fokus },
  { label: "BERANI CUBA", reveal: BEATS.ketiga, tick: BEATS.beraniCuba },
];

const appear = BEATS.tigaPerkara;
const leave = CUTS[4] - 10;

export const Checklist: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < appear - 2 || frame > leave + 14) return null;

  const enter = pop(frame, fps, appear, { damping: 13, stiffness: 140 });
  const exit = ramp(frame, leave, leave + 12);
  const scale = 0.6 + 0.4 * enter;
  const top = 210 - exit * 700;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 90,
          width: 900,
          top,
          transform: `scale(${scale})`,
          transformOrigin: "50% 0%",
          opacity: Math.min(1, enter * 2),
          background: "#FFFFFF",
          borderRadius: 40,
          border: `5px solid ${colors.ink}`,
          boxShadow: `0 12px 0 ${colors.ink}, 0 30px 60px rgba(10,30,60,0.25)`,
          padding: "26px 36px 30px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: 38,
              background: colors.red,
              color: "#FFFFFF",
              fontFamily: fonts.display,
              fontWeight: 800,
              fontSize: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `4px solid ${colors.ink}`,
            }}
          >
            3
          </div>
          <div style={{ fontFamily: fonts.display, fontWeight: 800, fontSize: 60, color: colors.ink, lineHeight: 1 }}>
            PERKARA PENTING
          </div>
        </div>
        {ITEMS.map((it, i) => {
          const shown = ramp(frame, it.reveal, it.reveal + 8);
          const t = pop(frame, fps, it.tick, { damping: 10, stiffness: 200, mass: 0.6 });
          const active = frame >= it.reveal && (i === ITEMS.length - 1 || frame < ITEMS[i + 1].reveal);
          const pulse = frame >= it.tick ? 1 + 0.06 * Math.max(0, 1 - (frame - it.tick) / 10) : 1;
          return (
            <div
              key={it.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 26,
                padding: "10px 20px",
                borderRadius: 26,
                background: active ? "#FFF4D6" : "transparent",
                transform: `scale(${pulse})`,
                transformOrigin: "0% 50%",
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 18,
                  border: `6px solid ${frame >= it.tick ? colors.red : "#9DB0C4"}`,
                  background: frame >= it.tick ? colors.red : "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width={52} height={52} viewBox="0 0 52 52" style={{ transform: `scale(${t})` }}>
                  <path d="M10 27L22 39L43 13" stroke="#FFFFFF" strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div
                style={{
                  fontFamily: fonts.display,
                  fontWeight: 800,
                  fontSize: 66,
                  lineHeight: 1,
                  color: frame >= it.tick ? colors.ink : "#8FA4BA",
                  opacity: 0.25 + 0.75 * shown,
                  transform: `translateX(${(1 - shown) * 30}px)`,
                }}
              >
                {shown > 0 ? it.label : "· · ·"}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
