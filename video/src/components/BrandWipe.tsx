import React from "react";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { AbsoluteFill, Easing } from "remotion";
import { colors } from "../theme";

// Scene transition: a slanted reveal led by three brand-colour bars, while
// the outgoing scene pushes away and softens. Direction alternates per cut.

type BrandWipeProps = {
  readonly direction: "ltr" | "rtl";
};

const W = 1080;
const H = 1920;
const SLANT = 520;
const BARS = [
  { color: colors.yellow, width: 70, gap: 0 },
  { color: colors.red, width: 46, gap: 86 },
  { color: colors.brandBlue, width: 130, gap: 150 },
];

const ease = Easing.inOut(Easing.cubic);

const BrandWipeComponent: React.FC<TransitionPresentationComponentProps<BrandWipeProps>> = ({
  children,
  presentationDirection,
  presentationProgress,
  passedProps,
}) => {
  const rtl = passedProps.direction === "rtl";
  const p = ease(presentationProgress);

  if (presentationDirection === "exiting") {
    const push = (rtl ? 1 : -1) * 70 * p;
    return (
      <AbsoluteFill style={{ transform: `translateX(${push}px) scale(${1 + 0.07 * p})`, filter: `blur(${p * 5}px) brightness(${1 - 0.25 * p})` }}>
        {children}
      </AbsoluteFill>
    );
  }

  // The reveal edge travels across the frame (top point leads, bottom trails).
  const edge = -SLANT + p * (W + SLANT * 2);
  const poly = (x: number) => (rtl ? [W - x, W - (x - SLANT)] : [x, x - SLANT]);
  const [top, bottom] = poly(edge);
  const clip = rtl
    ? `polygon(${W}px 0px, ${top}px 0px, ${bottom}px ${H}px, ${W}px ${H}px)`
    : `polygon(0px 0px, ${top}px 0px, ${bottom}px ${H}px, 0px ${H}px)`;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: clip }}>{children}</AbsoluteFill>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {BARS.map((b, i) => {
          const lead = edge + b.gap + b.width;
          const [t0, b0] = poly(edge + b.gap);
          const [t1, b1] = poly(lead);
          return (
            <polygon
              key={i}
              points={`${t0},0 ${t1},0 ${b1},${H} ${b0},${H}`}
              fill={b.color}
              opacity={Math.min(1, presentationProgress * 6) * Math.min(1, (1 - presentationProgress) * 6)}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

export const brandWipe = (props: BrandWipeProps): TransitionPresentation<BrandWipeProps> => ({
  component: BrandWipeComponent,
  props,
});
