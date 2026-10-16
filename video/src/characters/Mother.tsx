import React from "react";
import { useCurrentFrame } from "remotion";
import { blinkAt, wave } from "../lib/anim";

// Malay mother, about 30, light-blue hijab and brand-blue baju kurung.
// Drawn in a 220×520 box with her feet at (110, 510).

const OUT = "#2A1D14";
const SKIN = "#E7B089";
const HIJAB = "#A9DBF5";
const HIJAB_EDGE = "#7FBFE6";
const BAJU = "#0B6CB4";
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
const FORE = 60;

type ArmProps = {
  sx: number;
  sy: number;
  a: number;
  e: number;
  pass: "outline" | "fill";
  item?: React.ReactNode;
  thumbUp?: boolean;
};

const Arm: React.FC<ArmProps> = ({ sx, sy, a, e, pass, item, thumbUp }) => {
  const ey = sy + UPPER;
  const stroke = pass === "outline" ? OUT : BAJU;
  const w = pass === "outline" ? 30 : 22;
  return (
    <g transform={`rotate(${a} ${sx} ${sy})`}>
      <line x1={sx} y1={sy} x2={sx} y2={ey} stroke={stroke} strokeWidth={w} strokeLinecap="round" />
      <g transform={`rotate(${e} ${sx} ${ey})`}>
        <line x1={sx} y1={ey} x2={sx} y2={ey + FORE} stroke={stroke} strokeWidth={w} strokeLinecap="round" />
        {pass === "fill" ? (
          <g>
            <circle cx={sx} cy={ey + FORE + 10} r={13} fill={SKIN} stroke={OUT} strokeWidth={4} />
            {thumbUp ? (
              <rect x={sx - 6} y={ey + FORE + 14} width={12} height={22} rx={6} fill={SKIN} stroke={OUT} strokeWidth={3.5} />
            ) : null}
            {item ? <g transform={`translate(${sx} ${ey + FORE + 10})`}>{item}</g> : null}
          </g>
        ) : null}
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
      <path d="M89 113Q97 105 104 113M116 113Q123 105 131 113" stroke={OUT} strokeWidth={4} fill="none" strokeLinecap="round" />
    );
  }
  return (
    <g>
      {[96, 124].map((cx) => (
        <g key={cx} transform={`translate(${cx} 113) scale(1 ${Math.max(0.1, open)}) translate(${-cx} -113)`}>
          <ellipse cx={cx} cy={113} rx={7} ry={8} fill="#FFFFFF" stroke={OUT} strokeWidth={2.5} />
          <circle cx={cx + lookX * 2.5} cy={114 + lookY * 2.5} r={4.6} fill={OUT} />
          <circle cx={cx + 1.5 + lookX * 2.5} cy={112 + lookY * 2.5} r={1.5} fill="#FFFFFF" />
          <path d={`M${cx - 8} ${108}L${cx - 11} ${105}`} stroke={OUT} strokeWidth={2.5} strokeLinecap="round" />
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
  const sx = flip ? -scale : scale;

  const brows = {
    warm: "M89 98Q97 93 104 97M116 97Q123 93 131 98",
    joy: "M89 96Q97 90 104 95M116 95Q123 90 131 96",
    concerned: "M89 99Q97 97 104 92M116 92Q123 97 131 99",
    proud: "M89 96Q97 90 104 95M116 95Q123 90 131 96",
  }[expression];

  const arms = (pass: "outline" | "fill") => (
    <>
      <Arm sx={60} sy={206} a={armL - armSwing} e={elbowL} pass={pass} item={handItemL} />
      <Arm sx={160} sy={206} a={-(armR + armSwing)} e={-elbowR} pass={pass} item={handItemR} thumbUp={thumbUpR} />
    </>
  );

  return (
    <g opacity={opacity} transform={`translate(${x} ${y}) scale(${sx} ${scale}) translate(-110 -510)`}>
      <ellipse cx={110} cy={510} rx={78} ry={11} fill="#000000" opacity={0.12} />
      <g transform={`translate(${sway} 0)`}>
        <ellipse cx={90} cy={506} rx={20} ry={9} fill="#6B3A2A" stroke={OUT} strokeWidth={4} />
        <ellipse cx={132} cy={506} rx={20} ry={9} fill="#6B3A2A" stroke={OUT} strokeWidth={4} />
      </g>
      <g transform={`translate(0 ${bob + stepBob}) rotate(${lean} 110 470)`}>
        <path d="M66 300H154L174 500H46Z" fill={KAIN} stroke={OUT} strokeWidth={4} strokeLinejoin="round" />
        <path d="M80 330L70 496M140 330L150 496" stroke="#0F3E6E" strokeWidth={3} opacity={0.5} />
        {arms("outline")}
        <g transform={`translate(0 ${breathe * 0.4})`}>
          <path d="M70 190Q110 176 150 190L168 232L160 384H60L52 232Z" fill={BAJU} stroke={OUT} strokeWidth={4} strokeLinejoin="round" />
          <g fill="#F5B21E">
            <circle cx={82} cy={300} r={4} />
            <circle cx={110} cy={330} r={4} />
            <circle cx={138} cy={296} r={4} />
            <circle cx={96} cy={360} r={4} />
            <circle cx={130} cy={356} r={4} />
            <circle cx={110} cy={270} r={4} />
          </g>
        </g>
        {arms("fill")}
        {/* Head and hijab pivot at the neck */}
        <g transform={`translate(0 ${breathe * 0.6}) rotate(${headTilt} 110 176)`}>
          <path
            d="M110 24C58 24 42 74 44 118C46 160 34 196 44 242Q110 266 176 242C186 196 174 160 176 118C178 74 162 24 110 24Z"
            fill={HIJAB}
            stroke={OUT}
            strokeWidth={4}
          />
          <path d="M66 206Q110 230 154 206" stroke={HIJAB_EDGE} strokeWidth={4} fill="none" />
          <path d="M60 60Q80 34 112 32" stroke="#D6F0FC" strokeWidth={6} fill="none" strokeLinecap="round" />
          <ellipse cx={110} cy={112} rx={40} ry={48} fill={SKIN} stroke={HIJAB_EDGE} strokeWidth={7} />
          <path d={brows} stroke="#3A2418" strokeWidth={3.5} fill="none" strokeLinecap="round" />
          <Eyes expression={expression} open={open} lookX={lookX} lookY={lookY} />
          <path d="M108 120Q110 124 113 121" stroke="#C98C66" strokeWidth={2.5} fill="none" strokeLinecap="round" />
          <circle cx={88} cy={128} r={8} fill="#F28B82" opacity={0.35} />
          <circle cx={132} cy={128} r={8} fill="#F28B82" opacity={0.35} />
          {mouthOpen > 0.08 ? (
            <path
              d={`M99 134Q110 ${131 + mouthOpen * 2} 121 134Q110 ${138 + mouthOpen * 10} 99 134Z`}
              fill={MOUTH}
              stroke={OUT}
              strokeWidth={3}
              strokeLinejoin="round"
            />
          ) : expression === "concerned" ? (
            <path d="M101 137Q110 133 119 137" stroke="#9B3B3B" strokeWidth={4} fill="none" strokeLinecap="round" />
          ) : (
            <path d="M98 133Q110 145 122 133" stroke="#9B3B3B" strokeWidth={4} fill="none" strokeLinecap="round" />
          )}
        </g>
      </g>
    </g>
  );
};
