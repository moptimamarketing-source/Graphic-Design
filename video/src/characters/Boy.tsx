import React from "react";
import { useCurrentFrame } from "remotion";
import { blinkAt, wave } from "../lib/anim";

// Six-year-old Malay boy. Drawn in a 200×420 box with his feet at (100, 400);
// `x`/`y` place that point on the canvas. Every part pivots at a joint
// (neck, shoulders, elbows, hips) so poses never stretch the face.

const OUT = "#2A1D14";
const SKIN = "#E9B48A";
const SKIN_SHADE = "#D9976B";
const HAIR = "#1A1410";
const MOUTH = "#8A2F2F";

export type BoyExpression = "happy" | "worried" | "proud" | "focus" | "surprised";

export type BoyProps = {
  readonly x: number;
  readonly y: number;
  readonly scale?: number;
  readonly outfit?: "school" | "home";
  readonly bag?: boolean;
  readonly expression?: BoyExpression;
  readonly mouthOpen?: number;
  readonly headTilt?: number;
  readonly lookX?: number;
  readonly lookY?: number;
  // Shoulder and elbow angles in degrees. 0 = arm hanging down;
  // positive raises the arm outward / bends the forearm outward.
  readonly armL?: number;
  readonly elbowL?: number;
  readonly armR?: number;
  readonly elbowR?: number;
  readonly lean?: number;
  readonly walk?: number; // walk-cycle phase in radians; omit when standing
  readonly bob?: number;
  readonly blinkSeed?: number;
  readonly flip?: boolean;
  readonly frontItem?: React.ReactNode; // drawn over the arms, in boy coords
  readonly handItemR?: React.ReactNode; // drawn at the right hand
  readonly opacity?: number;
};

const SHOULDER_L = { x: 64, y: 186 };
const SHOULDER_R = { x: 136, y: 186 };
const UPPER = 46;
const FORE = 42;

type ArmProps = {
  sx: number;
  sy: number;
  a: number;
  e: number;
  pass: "outline" | "fill";
  sleeve: string;
  item?: React.ReactNode;
};

const Arm: React.FC<ArmProps> = ({ sx, sy, a, e, pass, sleeve, item }) => {
  const ex = sx;
  const ey = sy + UPPER;
  const stroke = pass === "outline" ? OUT : SKIN;
  const w = pass === "outline" ? 22 : 14;
  return (
    <g transform={`rotate(${a} ${sx} ${sy})`}>
      <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={stroke} strokeWidth={w} strokeLinecap="round" />
      <g transform={`rotate(${e} ${ex} ${ey})`}>
        <line x1={ex} y1={ey} x2={ex} y2={ey + FORE} stroke={stroke} strokeWidth={w} strokeLinecap="round" />
        {pass === "fill" ? (
          <>
            <circle cx={ex} cy={ey + FORE + 6} r={11} fill={SKIN} stroke={OUT} strokeWidth={4} />
            {item ? <g transform={`translate(${ex} ${ey + FORE + 6})`}>{item}</g> : null}
          </>
        ) : null}
      </g>
      {pass === "fill" ? (
        <rect x={sx - 13} y={sy - 8} width={26} height={30} rx={10} fill={sleeve} stroke={OUT} strokeWidth={4} />
      ) : null}
    </g>
  );
};

const Brows: React.FC<{ expression: BoyExpression }> = ({ expression }) => {
  const d = {
    happy: "M70 80Q80 74 90 79M110 79Q120 74 130 80",
    worried: "M70 82Q80 80 90 73M110 73Q120 80 130 82",
    proud: "M70 75Q80 67 90 73M110 73Q120 67 130 75",
    surprised: "M70 72Q80 63 90 70M110 70Q120 63 130 72",
    focus: "M70 79L91 83M109 83L130 79",
  }[expression];
  return <path d={d} stroke={HAIR} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
};

const Mouth: React.FC<{ expression: BoyExpression; open: number }> = ({
  expression,
  open,
}) => {
  if (open > 0.08) {
    const ry = 2.5 + open * 8;
    return (
      <g>
        <ellipse cx={100} cy={125} rx={9 + open * 2} ry={ry} fill={MOUTH} stroke={OUT} strokeWidth={3} />
        <ellipse cx={100} cy={125 + ry * 0.5} rx={5} ry={Math.max(1, ry * 0.35)} fill="#E77B7B" />
      </g>
    );
  }
  switch (expression) {
    case "worried":
      return (
        <path d="M90 128Q95 123 100 127Q105 131 110 126" stroke={OUT} strokeWidth={4} fill="none" strokeLinecap="round" />
      );
    case "proud":
      return (
        <g>
          <path d="M84 119Q100 143 116 119Z" fill={MOUTH} stroke={OUT} strokeWidth={3.5} strokeLinejoin="round" />
          <path d="M88 121H112" stroke="#FFFFFF" strokeWidth={4} />
        </g>
      );
    case "surprised":
      return <ellipse cx={100} cy={126} rx={7} ry={9} fill={MOUTH} stroke={OUT} strokeWidth={3} />;
    case "focus":
      return (
        <g>
          <path d="M91 125Q100 128 109 124" stroke={OUT} strokeWidth={4} fill="none" strokeLinecap="round" />
          <ellipse cx={108} cy={128} rx={4.5} ry={3.5} fill="#E77B7B" stroke={OUT} strokeWidth={2} />
        </g>
      );
    default:
      return <path d="M86 121Q100 136 114 121" stroke={OUT} strokeWidth={4} fill="none" strokeLinecap="round" />;
  }
};

const Eye: React.FC<{ cx: number; open: number; lookX: number; lookY: number }> = ({
  cx,
  open,
  lookX,
  lookY,
}) => (
  <g transform={`translate(${cx} 99) scale(1 ${Math.max(0.1, open)}) translate(${-cx} -99)`}>
    <ellipse cx={cx} cy={99} rx={11} ry={13} fill="#FFFFFF" stroke={OUT} strokeWidth={3} />
    <circle cx={cx + 2 + lookX * 4} cy={101 + lookY * 4} r={6.2} fill={OUT} />
    <circle cx={cx + 4 + lookX * 4} cy={98 + lookY * 4} r={2.1} fill="#FFFFFF" />
  </g>
);

export const Boy: React.FC<BoyProps> = ({
  x,
  y,
  scale = 1,
  outfit = "home",
  bag = false,
  expression = "happy",
  mouthOpen = 0,
  headTilt = 0,
  lookX = 0,
  lookY = 0,
  armL = 4,
  elbowL = 0,
  armR = 4,
  elbowR = 0,
  lean = 0,
  walk,
  bob = 0,
  blinkSeed = 1,
  flip = false,
  frontItem,
  handItemR,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  const shirt = outfit === "school" ? "#FFFFFF" : "#F5B21E";
  const shorts = outfit === "school" ? "#1F3F78" : "#3A6EA5";
  const open = 1 - blinkAt(frame, blinkSeed);
  const breathe = wave(frame, 70, 1.6);

  const walking = walk !== undefined;
  const legSwing = walking ? Math.sin(walk) * 20 : 0;
  const stepBob = walking ? -Math.abs(Math.sin(walk)) * 6 : 0;
  const armSwing = walking ? Math.sin(walk) * 14 : 0;

  const aL = armL - armSwing;
  const aR = armR + armSwing;
  const body = bob + stepBob;
  const sx = flip ? -scale : scale;

  const arms = (pass: "outline" | "fill") => (
    <>
      <Arm sx={SHOULDER_L.x} sy={SHOULDER_L.y} a={aL} e={elbowL} pass={pass} sleeve={shirt} />
      <Arm sx={SHOULDER_R.x} sy={SHOULDER_R.y} a={-aR} e={-elbowR} pass={pass} sleeve={shirt} item={handItemR} />
    </>
  );

  return (
    <g opacity={opacity} transform={`translate(${x} ${y}) scale(${sx} ${scale}) translate(-100 -400)`}>
      <ellipse cx={100} cy={400} rx={62} ry={10} fill="#000000" opacity={0.12} />
      {/* Legs pivot at the hips */}
      {[
        { hx: 84, a: legSwing },
        { hx: 116, a: -legSwing },
      ].map(({ hx, a }) => (
        <g key={hx} transform={`translate(0 ${body * 0.3}) rotate(${a} ${hx} 300)`}>
          <rect x={hx - 10} y={296} width={20} height={88} rx={9} fill={SKIN} stroke={OUT} strokeWidth={4} />
          <ellipse cx={hx + (hx < 100 ? -4 : 4)} cy={390} rx={21} ry={10} fill="#22232E" stroke={OUT} strokeWidth={4} />
          <rect x={hx - 9} y={376} width={18} height={8} fill="#FFFFFF" />
        </g>
      ))}
      <g transform={`translate(0 ${body}) rotate(${lean} 100 300)`}>
        {bag ? <rect x={42} y={176} width={116} height={118} rx={28} fill="#1C2E5A" stroke={OUT} strokeWidth={4} /> : null}
        <path d="M64 262h72l7 60h-34l-9-26-9 26H57z" fill={shorts} stroke={OUT} strokeWidth={4} strokeLinejoin="round" />
        {arms("outline")}
        <rect x={90} y={136} width={20} height={34} fill={SKIN_SHADE} stroke={OUT} strokeWidth={4} />
        <g transform={`translate(0 ${breathe * 0.4})`}>
          <path
            d="M70 168Q100 158 130 168L150 190L141 216L136 214V274H64V214L59 216L50 190Z"
            fill={shirt}
            stroke={OUT}
            strokeWidth={4}
            strokeLinejoin="round"
          />
          <path d="M88 166L100 182L112 166" fill="none" stroke={OUT} strokeWidth={3} strokeLinejoin="round" />
          {outfit === "school" ? (
            <circle cx={100} cy={200} r={3} fill={OUT} />
          ) : (
            <path d="M80 222Q100 232 120 222" stroke="#E09A10" strokeWidth={6} fill="none" strokeLinecap="round" />
          )}
          {bag ? <path d="M76 170V262M124 170V262" stroke="#1C2E5A" strokeWidth={12} strokeLinecap="round" /> : null}
        </g>
        {arms("fill")}
        {frontItem}
        {/* Head pivots at the neck */}
        <g transform={`translate(0 ${breathe * 0.6}) rotate(${headTilt} 100 150)`}>
          <circle cx={44} cy={100} r={12} fill={SKIN} stroke={OUT} strokeWidth={4} />
          <circle cx={156} cy={100} r={12} fill={SKIN} stroke={OUT} strokeWidth={4} />
          <circle cx={100} cy={94} r={56} fill={SKIN} stroke={OUT} strokeWidth={4} />
          <path
            d="M44 96C38 48 72 26 104 28C140 30 162 54 157 96C150 76 136 64 120 61L113 72L104 59L94 70L87 60C68 64 52 76 44 96Z"
            fill={HAIR}
            stroke={HAIR}
            strokeWidth={4}
            strokeLinejoin="round"
          />
          <path d="M70 44Q90 34 108 38" stroke="#4A4038" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7} />
          <circle cx={73} cy={117} r={9} fill="#F28B82" opacity={expression === "proud" ? 0.6 : 0.38} />
          <circle cx={127} cy={117} r={9} fill="#F28B82" opacity={expression === "proud" ? 0.6 : 0.38} />
          <Eye cx={80} open={open} lookX={lookX} lookY={lookY} />
          <Eye cx={120} open={open} lookX={lookX} lookY={lookY} />
          <Brows expression={expression} />
          <path d="M98 108Q100 112 103 109" stroke={SKIN_SHADE} strokeWidth={3} fill="none" strokeLinecap="round" />
          <Mouth expression={expression} open={mouthOpen} />
        </g>
      </g>
    </g>
  );
};
