import React from "react";
import { useCurrentFrame } from "remotion";
import { blinkAt, wave } from "../lib/anim";
import { Hand, limb, OUT, OUT_W } from "./parts";

// Malay mother, about 30, light-blue hijab and brand-blue baju kurung.
// Drawn in a 220×520 box with her feet at (110, 510).

const SKIN = "#E9B28B";
const HIJAB = "#A9DBF5";
const HIJAB_SHADE = "#86C6EA";
const BAJU = "#0E6DB5";
const BAJU_CUFF = "#0A5592";
const KAIN = "#164E86";
const MOUTH = "#8A2F2F";

export type MotherExpression = "warm" | "joy" | "concerned" | "proud";

export type MotherProps = {
  readonly x: number;
  readonly y: number;
  readonly scale?: number;
  readonly expression?: MotherExpression;
  readonly mouthOpen?: number;
  readonly headTilt?: number;
  readonly lookX?: number;
  readonly lookY?: number;
  readonly armL?: number;
  readonly elbowL?: number;
  readonly armR?: number;
  readonly elbowR?: number;
  readonly lean?: number;
  readonly walk?: number;
  readonly bob?: number;
  readonly blinkSeed?: number;
  readonly flip?: boolean;
  readonly handItemR?: React.ReactNode;
  readonly handItemL?: React.ReactNode;
  readonly thumbUpR?: boolean;
  readonly opacity?: number;
};

const UPPER = 64;
const FORE = 58;

type ArmProps = {
  sx: number;
  sy: number;
  a: number;
  e: number;
  pass: "outline" | "fill";
  thumb: 1 | -1;
  item?: React.ReactNode;
  thumbUp?: boolean;
};

const Arm: React.FC<ArmProps> = ({ sx, sy, a, e, pass, thumb, item, thumbUp }) => {
  const ey = sy + UPPER;
  const hy = ey + FORE;
  const upper = limb(sx, sy, ey, 13, 11);
  const fore = limb(sx, ey, hy, 11, 10);
  if (pass === "outline") {
    return (
      <g transform={`rotate(${a} ${sx} ${sy})`}>
        <path d={upper} fill={OUT} stroke={OUT} strokeWidth={OUT_W * 2} strokeLinejoin="round" />
        <g transform={`rotate(${e} ${sx} ${ey})`}>
          <path d={fore} fill={OUT} stroke={OUT} strokeWidth={OUT_W * 2} strokeLinejoin="round" />
        </g>
      </g>
    );
  }
  return (
    <g transform={`rotate(${a} ${sx} ${sy})`}>
      <path d={upper} fill={BAJU} />
      <path d={`M${sx + 4} ${sy + 4}Q${sx + 10} ${sy + 34} ${sx + 6} ${ey}`} stroke="#000000" strokeWidth={6} opacity={0.12} strokeLinecap="round" fill="none" />
      <g transform={`rotate(${e} ${sx} ${ey})`}>
        <path d={fore} fill={BAJU} />
        <path d={`M${sx + 4} ${ey + 4}Q${sx + 8} ${ey + 30} ${sx + 5} ${hy - 6}`} stroke="#000000" strokeWidth={5} opacity={0.12} strokeLinecap="round" fill="none" />
        <rect x={sx - 11} y={hy - 9} width={22} height={9} rx={4} fill={BAJU_CUFF} />
        {thumbUp ? (
          <ellipse cx={sx} cy={hy + 26} rx={5.5} ry={9} fill={SKIN} stroke={OUT} strokeWidth={OUT_W} />
        ) : null}
        <Hand cx={sx} cy={hy + 9} skin={SKIN} thumb={thumb} size={1.15} />
        {item ? <g transform={`translate(${sx} ${hy + 9})`}>{item}</g> : null}
      </g>
    </g>
  );
};

const Eyes: React.FC<{ expression: MotherExpression; open: number; lookX: number; lookY: number }> = ({
  expression,
  open,
  lookX,
  lookY,
}) => {
  if (expression === "joy") {
    return (
      <path d="M89 113Q97 105 104 113M116 113Q123 105 131 113" stroke={OUT} strokeWidth={3.6} fill="none" strokeLinecap="round" />
    );
  }
  return (
    <g>
      {[96, 124].map((cx) => (
        <g key={cx} transform={`translate(${cx} 113) scale(1 ${Math.max(0.1, open)}) translate(${-cx} -113)`}>
          <ellipse cx={cx} cy={113} rx={7.2} ry={8.2} fill="#FFFFFF" stroke={OUT} strokeWidth={2.4} />
          <circle cx={cx + lookX * 2.5} cy={114 + lookY * 2.5} r={4.8} fill="#3A2416" />
          <circle cx={cx + lookX * 2.5} cy={114 + lookY * 2.5} r={2.4} fill="#000000" />
          <circle cx={cx + 1.8 + lookX * 2.5} cy={111.6 + lookY * 2.5} r={1.6} fill="#FFFFFF" />
          <path d={`M${cx - 7} ${108}Q${cx - 10} ${105} ${cx - 12} ${104}`} stroke={OUT} strokeWidth={2.4} strokeLinecap="round" fill="none" />
        </g>
      ))}
    </g>
  );
};

export const Mother: React.FC<MotherProps> = ({
  x,
  y,
  scale = 1,
  expression = "warm",
  mouthOpen = 0,
  headTilt = 0,
  lookX = 0,
  lookY = 0,
  armL = 6,
  elbowL = 0,
  armR = 6,
  elbowR = 0,
  lean = 0,
  walk,
  bob = 0,
  blinkSeed = 3,
  flip = false,
  handItemR,
  handItemL,
  thumbUpR = false,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  const open = 1 - blinkAt(frame, blinkSeed);
  const breathe = wave(frame, 80, 1.4);
  const walking = walk !== undefined;
  const sway = walking ? Math.sin(walk) * 3 : 0;
  const stepBob = walking ? -Math.abs(Math.sin(walk)) * 5 : 0;
  const armSwing = walking ? Math.sin(walk) * 10 : 0;
  // The hijab drape trails slightly behind head movement.
  const drape = wave(frame, 90, 1.2) - headTilt * 0.25 + (walking ? Math.sin(walk + 0.8) * 1.5 : 0);
  const sx = flip ? -scale : scale;

  const brows = {
    warm: "M89 98Q97 92 104 96M116 96Q123 92 131 98",
    joy: "M89 96Q97 89 104 94M116 94Q123 89 131 96",
    concerned: "M89 99Q97 97 104 92M116 92Q123 97 131 99",
    proud: "M89 96Q97 89 104 94M116 94Q123 89 131 96",
  }[expression];

  const arms = (pass: "outline" | "fill") => (
    <>
      <Arm sx={62} sy={206} a={armL - armSwing} e={elbowL} pass={pass} thumb={1} item={handItemL} />
      <Arm sx={158} sy={206} a={-(armR + armSwing)} e={-elbowR} pass={pass} thumb={-1} item={handItemR} thumbUp={thumbUpR} />
    </>
  );

  return (
    <g opacity={opacity} transform={`translate(${x} ${y}) scale(${sx} ${scale}) translate(-110 -510)`}>
      <defs>
        <radialGradient id="momSkin" cx="0.42" cy="0.38" r="0.75">
          <stop offset="0" stopColor="#F5CBA8" />
          <stop offset="0.7" stopColor={SKIN} />
          <stop offset="1" stopColor="#DCA078" />
        </radialGradient>
        <linearGradient id="momHijab" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#C4E7FA" />
          <stop offset="1" stopColor={HIJAB} />
        </linearGradient>
      </defs>
      <ellipse cx={110} cy={510} rx={76} ry={10} fill="#000000" opacity={0.12} />
      <g transform={`translate(${sway} 0)`}>
        {[
          { cx: 90, d: -1 },
          { cx: 132, d: 1 },
        ].map(({ cx, d }) => (
          <path
            key={cx}
            d={`M${cx - d * 14} 507Q${cx - d * 14} 496 ${cx} 495Q${cx + d * 18} 495 ${cx + d * 21} 505Q${cx + d * 18} 513 ${cx} 513Q${cx - d * 14} 513 ${cx - d * 14} 507Z`}
            fill="#7A4430"
            stroke={OUT}
            strokeWidth={OUT_W}
            strokeLinejoin="round"
          />
        ))}
      </g>
      <g transform={`translate(0 ${bob + stepBob}) rotate(${lean} 110 470)`}>
        {/* Kain: soft flare with a gentle hem */}
        <path
          d="M66 360Q110 368 154 360Q164 432 177 497Q144 506 110 504Q76 506 43 497Q56 432 66 360Z"
          fill={KAIN}
          stroke={OUT}
          strokeWidth={OUT_W}
          strokeLinejoin="round"
        />
        <path d="M134 370Q150 432 162 500Q170 499 177 497Q164 432 154 362Z" fill="#000000" opacity={0.14} />
        <path d="M104 372Q106 440 106 504" stroke="#0F3E6E" strokeWidth={3} opacity={0.55} fill="none" />
        {arms("outline")}
        <g transform={`translate(0 ${breathe * 0.4})`}>
          {/* Baju kurung top: sloped shoulders, long flowing body */}
          <path
            d="M70 190Q110 177 150 190Q166 198 168 234Q166 312 168 392Q110 404 52 392Q54 312 52 234Q54 198 70 190Z"
            fill={BAJU}
            stroke={OUT}
            strokeWidth={OUT_W}
            strokeLinejoin="round"
          />
          <path d="M136 194Q160 204 162 240Q160 312 162 394Q150 397 140 398Q148 300 136 194Z" fill="#000000" opacity={0.12} />
          <path d="M60 300Q64 260 76 226" stroke="#FFFFFF" strokeWidth={6} fill="none" opacity={0.12} strokeLinecap="round" />
          <g fill="#F5B21E">
            {[
              [82, 300],
              [110, 330],
              [138, 296],
              [96, 362],
              [130, 358],
              [110, 270],
              [72, 344],
              [148, 340],
            ].map(([cx, cy]) => (
              <g key={`${cx}-${cy}`} transform={`translate(${cx} ${cy})`}>
                <circle r={3.8} />
                <circle r={1.8} cx={0} cy={-6} opacity={0.8} />
                <circle r={1.8} cx={5.5} cy={3} opacity={0.8} />
                <circle r={1.8} cx={-5.5} cy={3} opacity={0.8} />
              </g>
            ))}
          </g>
        </g>
        {arms("fill")}
        {/* Head and hijab pivot at the neck */}
        <g transform={`translate(0 ${breathe * 0.6}) rotate(${headTilt} 110 176)`}>
          <g transform={`rotate(${drape} 110 120)`}>
            <path
              d="M110 22C56 22 40 74 42 118C44 162 32 198 42 240Q76 258 110 258Q144 258 178 240C188 198 176 162 178 118C180 74 164 22 110 22Z"
              fill="url(#momHijab)"
              stroke={OUT}
              strokeWidth={OUT_W}
            />
            <path d="M150 44Q180 96 176 238Q164 246 152 250Q168 140 150 44Z" fill={HIJAB_SHADE} opacity={0.75} />
            <path d="M58 70Q78 34 112 30" stroke="#E6F6FE" strokeWidth={7} fill="none" strokeLinecap="round" />
            <path d="M64 206Q110 232 156 206" stroke={HIJAB_SHADE} strokeWidth={4} fill="none" strokeLinecap="round" />
            <path d="M74 226Q110 246 146 226" stroke={HIJAB_SHADE} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.7} />
          </g>
          <ellipse cx={110} cy={112} rx={40} ry={48} fill="url(#momSkin)" stroke="#7FBFE6" strokeWidth={7} />
          <ellipse cx={110} cy={112} rx={43.5} ry={51.5} fill="none" stroke={OUT} strokeWidth={1.6} opacity={0.35} />
          <path d={brows} stroke="#3A2418" strokeWidth={3.4} fill="none" strokeLinecap="round" />
          <Eyes expression={expression} open={open} lookX={lookX} lookY={lookY} />
          <path d="M107 119Q110 124 114 121" stroke="#C98C66" strokeWidth={2.5} fill="none" strokeLinecap="round" />
          <ellipse cx={88} cy={128} rx={9} ry={6.5} fill="#F28B82" opacity={0.32} />
          <ellipse cx={132} cy={128} rx={9} ry={6.5} fill="#F28B82" opacity={0.32} />
          {mouthOpen > 0.08 ? (
            <path
              d={`M99 134Q110 ${131 + mouthOpen * 2} 121 134Q110 ${138 + mouthOpen * 10} 99 134Z`}
              fill={MOUTH}
              stroke={OUT}
              strokeWidth={2.6}
              strokeLinejoin="round"
            />
          ) : expression === "concerned" ? (
            <path d="M101 137Q110 133 119 137" stroke="#9B3B3B" strokeWidth={3.6} fill="none" strokeLinecap="round" />
          ) : (
            <path d="M98 133Q110 145 122 133" stroke="#9B3B3B" strokeWidth={3.6} fill="none" strokeLinecap="round" />
          )}
          {/* Kerongsang (brooch) under the chin */}
          <circle cx={110} cy={172} r={6} fill="#F5B21E" stroke={OUT} strokeWidth={2} />
          <circle cx={108.5} cy={170.5} r={2} fill="#FFFFFF" opacity={0.7} />
        </g>
      </g>
    </g>
  );
};
