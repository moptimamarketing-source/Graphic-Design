import React from "react";

const OUT = "#2A1D14";
const DISPLAY = "'Baloo 2', sans-serif";

// Chunky 2.5D alphabet block: a darker side face under a rounded top face.
export const LetterTile: React.FC<{
  ch: string;
  color: string;
  x: number;
  y: number;
  size?: number;
  rot?: number;
  scale?: number;
  glow?: number;
}> = ({ ch, color, x, y, size = 120, rot = 0, scale = 1, glow = 0 }) => {
  const h = size / 2;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
      {glow > 0 ? <circle r={size * 0.95} fill="#FFE57A" opacity={0.55 * glow} /> : null}
      <rect x={-h} y={-h + size * 0.12} width={size} height={size} rx={size * 0.2} fill={OUT} opacity={0.85} />
      <rect x={-h} y={-h} width={size} height={size} rx={size * 0.2} fill={color} stroke={OUT} strokeWidth={size * 0.045} />
      <rect x={-h + size * 0.1} y={-h + size * 0.08} width={size * 0.5} height={size * 0.12} rx={size * 0.06} fill="#FFFFFF" opacity={0.35} />
      <text
        y={size * 0.26}
        textAnchor="middle"
        fontFamily={DISPLAY}
        fontWeight={800}
        fontSize={size * 0.78}
        fill="#FFFFFF"
        stroke={OUT}
        strokeWidth={size * 0.03}
      >
        {ch}
      </text>
    </g>
  );
};

export const ClosedBook: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  color?: string;
  rot?: number;
}> = ({ x, y, w = 150, h = 40, color = "#F09024", rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={6} fill={color} stroke={OUT} strokeWidth={5} />
    <rect x={-w / 2 + 8} y={-h / 2 + 6} width={w - 16} height={h * 0.3} fill="#FFFFFF" />
    <rect x={-w / 2} y={-h / 2} width={14} height={h} rx={4} fill="#C35E14" />
  </g>
);

// Open picture book seen from the front. `flip` (0–1) turns the right page
// over the spine; `right` is content drawn on the right page.
export const OpenBook: React.FC<{
  x: number;
  y: number;
  w?: number;
  rot?: number;
  flip?: number;
  left?: React.ReactNode;
  right?: React.ReactNode;
  cover?: string;
}> = ({ x, y, w = 300, rot = 0, flip = 0, left, right, cover = "#F09024" }) => {
  const pw = w / 2;
  const ph = w * 0.62;
  const turn = Math.cos(Math.PI * Math.min(1, Math.max(0, flip)));
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path
        d={`M${-pw - 14} ${-ph / 2 - 6}H${pw + 14}V${ph / 2 + 16}H${-pw - 14}Z`}
        fill={cover}
        stroke={OUT}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path d={`M${-pw} ${-ph / 2}Q${-pw / 2} ${-ph / 2 - 14} 0 ${-ph / 2}V${ph / 2}Q${-pw / 2} ${ph / 2 - 14} ${-pw} ${ph / 2}Z`} fill="#FFFDF6" stroke={OUT} strokeWidth={4} />
      <path d={`M${pw} ${-ph / 2}Q${pw / 2} ${-ph / 2 - 14} 0 ${-ph / 2}V${ph / 2}Q${pw / 2} ${ph / 2 - 14} ${pw} ${ph / 2}Z`} fill="#FFFDF6" stroke={OUT} strokeWidth={4} />
      <g opacity={0.25} stroke="#5B7590" strokeWidth={4} strokeLinecap="round">
        {left ? null : [-0.25, -0.05, 0.15].map((k) => <path key={k} d={`M${-pw + 24} ${ph * k}H-24`} />)}
      </g>
      {left ? <g transform={`translate(${-pw / 2} 0)`}>{left}</g> : null}
      {right ? <g transform={`translate(${pw / 2} 0)`}>{right}</g> : null}
      {flip > 0 && flip < 1 ? (
        <g transform={`scale(${turn} 1)`}>
          <path
            d={`M${pw} ${-ph / 2}Q${pw / 2} ${-ph / 2 - 24} 0 ${-ph / 2}V${ph / 2}Q${pw / 2} ${ph / 2 - 24} ${pw} ${ph / 2}Z`}
            fill={turn > 0 ? "#FFFDF6" : "#F3EEDF"}
            stroke={OUT}
            strokeWidth={4}
          />
        </g>
      ) : null}
      <path d={`M0 ${-ph / 2}V${ph / 2}`} stroke={OUT} strokeWidth={4} />
    </g>
  );
};

export const PuzzlePiece: React.FC<{
  x: number;
  y: number;
  size?: number;
  color: string;
  rot?: number;
}> = ({ x, y, size = 110, color, rot = 0 }) => {
  const s = size / 100;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path
        d="M-50 -50H-14C-14 -70 14 -70 14 -50H50V-14C70 -14 70 14 50 14V50H14C14 30 -14 30 -14 50H-50Z"
        transform="translate(0 6)"
        fill={OUT}
        opacity={0.8}
      />
      <path
        d="M-50 -50H-14C-14 -70 14 -70 14 -50H50V-14C70 -14 70 14 50 14V50H14C14 30 -14 30 -14 50H-50Z"
        fill={color}
        stroke={OUT}
        strokeWidth={4.5}
        strokeLinejoin="round"
      />
      <circle cx={-26} cy={-28} r={8} fill="#FFFFFF" opacity={0.35} />
    </g>
  );
};

// Ring timer that fills with `progress` (0–1).
export const Stopwatch: React.FC<{ x: number; y: number; r?: number; progress: number }> = ({
  x,
  y,
  r = 70,
  progress,
}) => {
  const c = 2 * Math.PI * (r - 10);
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-14} y={-r - 26} width={28} height={22} rx={6} fill="#E41824" stroke={OUT} strokeWidth={4} />
      <circle r={r} fill="#FFFFFF" stroke={OUT} strokeWidth={6} />
      <circle
        r={r - 10}
        fill="none"
        stroke="#00A8E4"
        strokeWidth={14}
        strokeDasharray={`${c * progress} ${c}`}
        transform="rotate(-90)"
        strokeLinecap="round"
      />
      <path d={`M0 0L${Math.sin(progress * Math.PI * 2) * (r - 26)} ${-Math.cos(progress * Math.PI * 2) * (r - 26)}`} stroke={OUT} strokeWidth={6} strokeLinecap="round" />
      <circle r={7} fill={OUT} />
    </g>
  );
};

export const Star: React.FC<{ x: number; y: number; r?: number; color?: string; rot?: number; scale?: number; opacity?: number }> = ({
  x,
  y,
  r = 40,
  color = "#F5B21E",
  rot = 0,
  scale = 1,
  opacity = 1,
}) => {
  const pts = Array.from({ length: 10 })
    .map((_, i) => {
      const a = (Math.PI / 5) * i - Math.PI / 2;
      const rr = i % 2 === 0 ? r : r * 0.48;
      return `${Math.cos(a) * rr},${Math.sin(a) * rr}`;
    })
    .join(" ");
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`} opacity={opacity}>
      <polygon points={pts} fill={color} stroke={OUT} strokeWidth={r * 0.1} strokeLinejoin="round" />
    </g>
  );
};

export const Sparkle: React.FC<{ x: number; y: number; r?: number; color?: string; scale?: number; opacity?: number }> = ({
  x,
  y,
  r = 22,
  color = "#FFFFFF",
  scale = 1,
  opacity = 1,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
    <path d={`M0 ${-r}Q${r * 0.18} ${-r * 0.18} ${r} 0Q${r * 0.18} ${r * 0.18} 0 ${r}Q${-r * 0.18} ${r * 0.18} ${-r} 0Q${-r * 0.18} ${-r * 0.18} 0 ${-r}Z`} fill={color} />
  </g>
);

export const Heart: React.FC<{ x: number; y: number; s?: number; opacity?: number; color?: string }> = ({
  x,
  y,
  s = 1,
  opacity = 1,
  color = "#E41824",
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <path d="M0 30C-40 4 -46 -26 -24 -36C-10 -42 0 -30 0 -22C0 -30 10 -42 24 -36C46 -26 40 4 0 30Z" fill={color} stroke={OUT} strokeWidth={4} />
  </g>
);

export const BalanceScale: React.FC<{ x: number; y: number; tilt: number; s?: number }> = ({ x, y, tilt, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-60 150H60L40 120H-40Z" fill="#8FA4BA" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-8} y={-10} width={16} height={135} fill="#8FA4BA" stroke={OUT} strokeWidth={5} />
    <g transform={`rotate(${tilt})`}>
      <rect x={-170} y={-16} width={340} height={14} rx={7} fill="#5B7590" stroke={OUT} strokeWidth={4} />
      {[-160, 160].map((px) => (
        <g key={px} transform={`translate(${px} -8) rotate(${-tilt})`}>
          <path d="M0 0L-40 70M0 0L40 70" stroke={OUT} strokeWidth={3} />
          <path d="M-56 70H56Q50 104 0 104Q-50 104 -56 70Z" fill="#C7D6E5" stroke={OUT} strokeWidth={4} />
        </g>
      ))}
    </g>
    <circle cx={0} cy={-10} r={14} fill="#F5B21E" stroke={OUT} strokeWidth={4} />
  </g>
);

export const ClockBadge: React.FC<{ x: number; y: number; scale?: number; label: string }> = ({ x, y, scale = 1, label }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={-120} y={-56} width={240} height={112} rx={56} fill="#FFFFFF" stroke={OUT} strokeWidth={5} />
    <circle cx={-62} cy={0} r={34} fill="#E3F3FC" stroke="#0B6CB4" strokeWidth={6} />
    <path d="M-62 -18V0L-48 10" stroke="#0B6CB4" strokeWidth={6} strokeLinecap="round" fill="none" />
    <text x={30} y={18} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={52} fill="#12355B">
      {label}
    </text>
  </g>
);
