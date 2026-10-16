import React from "react";
import { useCurrentFrame } from "remotion";
import { wave } from "../lib/anim";

const OUT = "#2A1D14";

const Cloud: React.FC<{ x: number; y: number; s: number; o?: number }> = ({ x, y, s, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <path
      d="M0 40C0 18 22 8 40 16C48 -4 84 -6 96 14C116 4 140 18 136 40Z"
      fill="#FFFFFF"
    />
  </g>
);

const Tree: React.FC<{ x: number; y: number; s: number; sway: number }> = ({ x, y, s, sway }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-14} y={-20} width={28} height={140} rx={8} fill="#8A5A34" />
    <g transform={`rotate(${sway} 0 0)`}>
      <circle cx={0} cy={-90} r={90} fill="#5DAE45" />
      <circle cx={-60} cy={-40} r={60} fill="#4E9D3B" />
      <circle cx={60} cy={-40} r={62} fill="#68BA4F" />
      <circle cx={-20} cy={-130} r={40} fill="#7CC85F" opacity={0.8} />
    </g>
  </g>
);

// Malaysian primary-school front: building, field, fence and gate pillars.
// `camX` shifts the layers by different amounts for parallax depth.
export const SchoolGate: React.FC<{ sunny?: boolean; camX?: number }> = ({ sunny = false, camX = 0 }) => {
  const frame = useCurrentFrame();
  const skyTop = sunny ? "#5EC4F2" : "#9CCFEA";
  const skyBottom = sunny ? "#E6F7FF" : "#DCEEF8";
  return (
    <g>
      <defs>
        <linearGradient id="gateSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={skyTop} />
          <stop offset="1" stopColor={skyBottom} />
        </linearGradient>
      </defs>
      <rect x={-400} y={-200} width={1880} height={2400} fill="url(#gateSky)" />
      {sunny ? (
        <g transform={`translate(${860 - camX * 0.1} 300)`}>
          <g transform={`rotate(${frame * 0.6})`}>
            {Array.from({ length: 12 }).map((_, i) => (
              <rect key={i} x={-6} y={-150} width={12} height={46} rx={6} fill="#FFD84A" opacity={0.75} transform={`rotate(${i * 30})`} />
            ))}
          </g>
          <circle r={88} fill="#FFD84A" />
          <circle r={70} fill="#FFE57A" />
        </g>
      ) : null}
      <g transform={`translate(${-camX * 0.15} 0)`}>
        <Cloud x={((frame * 0.5 + 60) % 1500) - 300} y={260} s={1.6} o={0.95} />
        <Cloud x={((frame * 0.35 + 700) % 1500) - 300} y={430} s={1.1} o={0.85} />
        <Cloud x={((frame * 0.25 + 1150) % 1500) - 300} y={170} s={0.9} o={0.7} />
      </g>
      {/* School building */}
      <g transform={`translate(${-camX * 0.35} 0)`}>
        <rect x={-200} y={760} width={1480} height={470} fill="#F6EFDF" stroke={OUT} strokeWidth={4} />
        <path d="M-230 770L-180 690H1260L1310 770Z" fill="#0B6CB4" stroke={OUT} strokeWidth={4} strokeLinejoin="round" />
        <rect x={-200} y={985} width={1480} height={22} fill="#0B6CB4" opacity={0.85} />
        {Array.from({ length: 10 }).map((_, i) =>
          [810, 1040].map((wy) => (
            <g key={`${i}-${wy}`}>
              <rect x={-150 + i * 148} y={wy} width={96} height={120} rx={8} fill="#BFE3F6" stroke={OUT} strokeWidth={4} />
              <path d={`M${-102 + i * 148} ${wy}V${wy + 120}`} stroke={OUT} strokeWidth={3} />
            </g>
          )),
        )}
        <rect x={470} y={1080} width={140} height={150} rx={6} fill="#C97A36" stroke={OUT} strokeWidth={4} />
      </g>
      {/* Field and path */}
      <path d="M-400 1230Q540 1180 1480 1230V2200H-400Z" fill={sunny ? "#A9DC7E" : "#BEDDA1"} />
      <path d="M440 1230H640L1000 2200H80Z" fill="#EFE4CD" />
      <path d="M520 1240L470 2200M560 1240L610 2200" stroke="#E2D3B4" strokeWidth={6} opacity={0.7} />
      <Tree x={-60 - camX * 0.6} y={1240} s={1.3} sway={wave(frame, 90, 2)} />
      <Tree x={1140 - camX * 0.6} y={1250} s={1.4} sway={wave(frame, 100, 2, 1)} />
      {/* Gate: fence leaves, pillars and sign */}
      <g stroke="#0B6CB4" strokeWidth={10} opacity={0.75}>
        <path d="M250 1060H390M250 1210H390M690 1060H830M690 1210H830" />
        <path d="M290 1040V1230M330 1040V1230M370 1040V1230M710 1040V1230M750 1040V1230M790 1040V1230" />
      </g>
      <rect x={150} y={860} width={100} height={450} rx={12} fill="#0B6CB4" stroke={OUT} strokeWidth={5} />
      <rect x={830} y={860} width={100} height={450} rx={12} fill="#0B6CB4" stroke={OUT} strokeWidth={5} />
      <rect x={140} y={840} width={120} height={36} rx={10} fill="#F5B21E" stroke={OUT} strokeWidth={5} />
      <rect x={820} y={840} width={120} height={36} rx={10} fill="#F5B21E" stroke={OUT} strokeWidth={5} />
      <rect x={110} y={700} width={860} height={130} rx={34} fill="#FFFFFF" stroke="#0B6CB4" strokeWidth={10} />
      <text x={540} y={786} textAnchor="middle" fontFamily="'Baloo 2', sans-serif" fontWeight={800} fontSize={60} fill="#0B6CB4">
        SEKOLAH KEBANGSAAN
      </text>
    </g>
  );
};

// Warm home interior. `sofa` swaps the shelf wall for a cosy reading corner.
export const LivingRoom: React.FC<{ variant?: "table" | "sofa"; camX?: number; warmth?: number }> = ({
  variant = "table",
  camX = 0,
  warmth = 1,
}) => {
  const frame = useCurrentFrame();
  return (
    <g>
      <rect x={-400} y={-200} width={1880} height={2400} fill={warmth > 0.5 ? "#FFF1D2" : "#E8F1F8"} />
      <rect x={-400} y={-200} width={1880} height={2400} fill="#FFE7B8" opacity={0.35 * warmth} />
      <g transform={`translate(${-camX * 0.3} 0)`}>
        {/* Window with curtains */}
        <rect x={90} y={640} width={330} height={360} rx={16} fill="#9ED8F5" stroke="#C97A36" strokeWidth={12} />
        <Cloud x={130 + wave(frame, 200, 30)} y={720} s={0.8} />
        <path d="M255 640V1000M90 820H420" stroke="#C97A36" strokeWidth={8} />
        <path d="M70 620Q110 820 80 1030H140Q150 820 120 620Z" fill="#E41824" opacity={0.85} />
        <path d="M440 620Q400 820 430 1030H370Q360 820 390 620Z" fill="#E41824" opacity={0.85} />
        <rect x={50} y={606} width={410} height={20} rx={8} fill="#8A5A34" />
        {variant === "table" ? (
          <g>
            {/* Bookshelf */}
            <rect x={640} y={620} width={340} height={420} rx={12} fill="#C98A4E" stroke={OUT} strokeWidth={5} />
            {[700, 820, 940].map((sy) => (
              <rect key={sy} x={652} y={sy} width={316} height={12} fill="#8A5A34" />
            ))}
            {[
              ["#E41824", 664, 640, 26, 60],
              ["#0B6CB4", 694, 650, 24, 50],
              ["#F5B21E", 722, 636, 30, 64],
              ["#78C03C", 756, 646, 22, 54],
              ["#00A8E4", 664, 760, 34, 60],
              ["#F09024", 702, 770, 24, 50],
              ["#E41824", 730, 756, 28, 64],
              ["#0B6CB4", 860, 880, 30, 60],
              ["#F5B21E", 894, 870, 26, 70],
            ].map(([c, bx, by, w, h], i) => (
              <rect key={i} x={bx as number} y={by as number} width={w as number} height={h as number} rx={4} fill={c as string} stroke={OUT} strokeWidth={3} />
            ))}
            <circle cx={900} cy={780} r={30} fill="#78C03C" stroke={OUT} strokeWidth={4} />
            <rect x={882} y={796} width={36} height={30} rx={6} fill="#F09024" stroke={OUT} strokeWidth={4} />
          </g>
        ) : (
          <g>
            {/* Floor lamp with glow */}
            <circle cx={880} cy={700} r={180} fill="#FFE59A" opacity={0.45 + wave(frame, 60, 0.05)} />
            <path d="M820 640H940L910 720H850Z" fill="#F5B21E" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
            <path d="M880 720V1200" stroke="#5A4636" strokeWidth={10} />
            <rect x={620} y={700} width={150} height={190} rx={10} fill="#FFFFFF" stroke="#C97A36" strokeWidth={10} />
            <text x={695} y={820} textAnchor="middle" fontFamily="'Baloo 2', sans-serif" fontWeight={800} fontSize={64}>
              <tspan fill="#E41824">a</tspan>
              <tspan fill="#0B6CB4">b</tspan>
              <tspan fill="#F5B21E">c</tspan>
            </text>
          </g>
        )}
      </g>
      <rect x={-400} y={1250} width={1880} height={1000} fill="#EBC995" />
      <rect x={-400} y={1250} width={1880} height={14} fill="#C9A06A" />
      <ellipse cx={540 - camX * 0.1} cy={1600} rx={520} ry={130} fill="#00A8E4" opacity={0.3} />
      <ellipse cx={540 - camX * 0.1} cy={1600} rx={440} ry={100} fill="none" stroke="#FFFFFF" strokeWidth={6} opacity={0.5} strokeDasharray="20 16" />
      {variant === "sofa" ? (
        <rect x={60} y={1010} width={960} height={260} rx={70} fill="#E85C4A" stroke={OUT} strokeWidth={6} />
      ) : null}
    </g>
  );
};

export const Table: React.FC<{ y: number; x?: number; w?: number }> = ({ y, x = 60, w = 960 }) => (
  <g>
    <rect x={x} y={y} width={w} height={50} rx={14} fill="#C97A36" stroke="#6B3A1E" strokeWidth={6} />
    <rect x={x + 10} y={y + 36} width={w - 20} height={14} fill="#A9622A" />
    <rect x={x + 50} y={y + 50} width={40} height={300} fill="#A9622A" stroke="#6B3A1E" strokeWidth={5} />
    <rect x={x + w - 90} y={y + 50} width={40} height={300} fill="#A9622A" stroke="#6B3A1E" strokeWidth={5} />
  </g>
);

// Sofa seat and arms, drawn in front of seated characters.
export const SofaFront: React.FC = () => (
  <g>
    <rect x={20} y={1150} width={1040} height={230} rx={60} fill="#F06B57" stroke={OUT} strokeWidth={6} />
    <path d="M90 1190H990" stroke="#D9503E" strokeWidth={6} strokeLinecap="round" opacity={0.6} />
    <rect x={30} y={1110} width={110} height={300} rx={50} fill="#D9503E" stroke={OUT} strokeWidth={6} />
    <rect x={940} y={1110} width={110} height={300} rx={50} fill="#D9503E" stroke={OUT} strokeWidth={6} />
    <rect x={90} y={1380} width={30} height={60} fill="#5A4636" />
    <rect x={960} y={1380} width={30} height={60} fill="#5A4636" />
  </g>
);

// Street on the way to school. `scroll` moves the layers at different speeds.
export const Neighbourhood: React.FC<{ scroll: number }> = ({ scroll }) => {
  const frame = useCurrentFrame();
  const wrap = (x: number, span: number) => ((x % span) + span) % span;
  const houses = ["#F7D9A8", "#BFE3F6", "#F9C6C0", "#D5EDB8", "#FFF0B3", "#D9D2F2"];
  return (
    <g>
      <defs>
        <linearGradient id="streetSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6FCBF3" />
          <stop offset="1" stopColor="#E6F7FF" />
        </linearGradient>
      </defs>
      <rect x={-400} y={-200} width={1880} height={2400} fill="url(#streetSky)" />
      <g transform="translate(840 320)">
        <circle r={110} fill="#FFE57A" opacity={0.5} />
        <circle r={80} fill="#FFD84A" />
      </g>
      {[0, 1, 2].map((i) => (
        <Cloud key={i} x={wrap(200 + i * 520 - scroll * 0.1 + frame * 0.3, 1560) - 300} y={260 + i * 90} s={1.2 - i * 0.2} o={0.9} />
      ))}
      <path d="M-400 1000Q0 880 400 980Q800 880 1480 990V1300H-400Z" fill="#9FD48A" />
      {Array.from({ length: 8 }).map((_, i) => {
        const x = wrap(i * 300 - scroll * 0.45, 2400) - 500;
        return (
          <g key={i} transform={`translate(${x} 0)`}>
            <rect x={0} y={900} width={280} height={330} fill={houses[i % houses.length]} stroke={OUT} strokeWidth={5} />
            <path d="M-20 910L140 790L300 910Z" fill={i % 2 ? "#C2463A" : "#0B6CB4"} stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
            <rect x={36} y={980} width={80} height={80} rx={6} fill="#FFFFFF" stroke={OUT} strokeWidth={4} />
            <rect x={164} y={1080} width={76} height={150} rx={6} fill="#8A5A34" stroke={OUT} strokeWidth={4} />
            <path d="M76 980V1060M36 1020H116" stroke={OUT} strokeWidth={3} />
          </g>
        );
      })}
      <rect x={-400} y={1230} width={1880} height={70} fill="#7CC85F" />
      <rect x={-400} y={1300} width={1880} height={420} fill="#E9DFC9" />
      {Array.from({ length: 12 }).map((_, i) => (
        <path key={i} d={`M${wrap(i * 180 - scroll, 2160) - 300} 1300V1720`} stroke="#D6C8AA" strokeWidth={5} />
      ))}
      <rect x={-400} y={1720} width={1880} height={500} fill="#8C96A3" />
      {Array.from({ length: 4 }).map((_, i) => {
        const x = wrap(i * 560 - scroll * 1.25, 2240) - 400;
        return (
          <g key={i}>
            <Tree x={x} y={1260} s={1.1} sway={wave(frame, 90, 2, i)} />
          </g>
        );
      })}
    </g>
  );
};
