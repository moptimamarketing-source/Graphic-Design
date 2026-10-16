import React from "react";
import { useCurrentFrame } from "remotion";
import { blinkAt, wave } from "../lib/anim";
import { Hand, limb, OUT, OUT_W } from "./parts";

// Six-year-old Malay boy. Drawn in a 200×420 box with his feet at (100, 400);
// `x`/`y` place that point on the canvas. Every part pivots at a joint
// (neck, shoulders, elbows, hips) so poses never stretch the face.

const SKIN = "#EDB78C";
const SKIN_SHADE = "#D9976B";
const HAIR = "#1E1712";
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

const SHOULDER_L = { x: 69, y: 186 };
const SHOULDER_R = { x: 131, y: 186 };
const UPPER = 44;
const FORE = 40;

type ArmProps = {
  sx: number;
  sy: number;
  a: number;
  e: number;
  pass: "outline" | "fill";
  sleeve: string;
  thumb: 1 | -1;
  item?: React.ReactNode;
};

const Arm: React.FC<ArmProps> = ({ sx, sy, a, e, pass, sleeve, thumb, item }) => {
  const ey = sy + UPPER;
  const hy = ey + FORE;
  const upper = limb(sx, sy, ey, 9, 7.5);
  const fore = limb(sx, ey, hy, 7.5, 6.5);
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
      <path d={upper} fill={SKIN} />
      <g transform={`rotate(${e} ${sx} ${ey})`}>
        <path d={fore} fill={SKIN} />
        <path d={`M${sx + 2} ${ey + 2}Q${sx + 7} ${ey + 20} ${sx + 4} ${hy}`} stroke={SKIN_SHADE} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.6} />
        <Hand cx={sx} cy={hy + 7} skin={SKIN} thumb={thumb} size={1} />
        {item ? <g transform={`translate(${sx} ${hy + 7})`}>{item}</g> : null}
      </g>
      {/* Rounded short sleeve that turns with the arm */}
      <path
        d={`M${sx - 12.5} ${sy - 2}Q${sx - 12} ${sy - 13} ${sx} ${sy - 13}Q${sx + 12} ${sy - 13} ${sx + 12.5} ${sy - 2}L${sx + 11.5} ${sy + 19}Q${sx} ${sy + 23} ${sx - 11.5} ${sy + 19}Z`}
        fill={sleeve}
        stroke={OUT}
        strokeWidth={OUT_W}
        strokeLinejoin="round"
      />
      <path d={`M${sx - 9} ${sy + 14}Q${sx} ${sy + 18} ${sx + 9} ${sy + 14}`} stroke="#000000" strokeWidth={3} fill="none" opacity={0.12} />
    </g>
  );
};

const Brows: React.FC<{ expression: BoyExpression }> = ({ expression }) => {
  const d = {
    happy: "M70 80Q80 73 90 78M110 78Q120 73 130 80",
    worried: "M70 82Q80 80 90 73M110 73Q120 80 130 82",
    proud: "M70 75Q80 66 90 72M110 72Q120 66 130 75",
    surprised: "M70 72Q80 62 90 69M110 69Q120 62 130 72",
    focus: "M70 79Q80 80 91 83M109 83Q120 80 130 79",
  }[expression];
  return <path d={d} stroke={HAIR} strokeWidth={5} fill="none" strokeLinecap="round" />;
};

const Mouth: React.FC<{ expression: BoyExpression; open: number }> = ({ expression, open }) => {
  if (open > 0.08) {
    const ry = 3 + open * 8;
    return (
      <g>
        <path
          d={`M${90 - open * 2} 123Q100 ${121 - open} ${110 + open * 2} 123Q${108 + open} ${123 + ry * 2} 100 ${123 + ry * 2}Q${92 - open} ${123 + ry * 2} ${90 - open * 2} 123Z`}
          fill={MOUTH}
          stroke={OUT}
          strokeWidth={2.8}
          strokeLinejoin="round"
        />
        <ellipse cx={100} cy={123 + ry * 1.5} rx={5.5} ry={Math.max(1, ry * 0.4)} fill="#E77B7B" />
      </g>
    );
  }
  switch (expression) {
    case "worried":
      return <path d="M89 128Q94 123 100 126Q106 129 111 125" stroke={OUT} strokeWidth={3.6} fill="none" strokeLinecap="round" />;
    case "proud":
      return (
        <g>
          <path d="M84 119Q100 145 116 119Q100 125 84 119Z" fill={MOUTH} stroke={OUT} strokeWidth={3} strokeLinejoin="round" />
          <path d="M89 121Q100 125 111 121" stroke="#FFFFFF" strokeWidth={3.5} fill="none" strokeLinecap="round" />
        </g>
      );
    case "surprised":
      return <ellipse cx={100} cy={127} rx={6.5} ry={8.5} fill={MOUTH} stroke={OUT} strokeWidth={2.8} />;
    case "focus":
      return (
        <g>
          <path d="M91 125Q100 128 109 124" stroke={OUT} strokeWidth={3.6} fill="none" strokeLinecap="round" />
          <ellipse cx={108} cy={128} rx={4.5} ry={3.5} fill="#E77B7B" stroke={OUT} strokeWidth={2} />
        </g>
      );
    default:
      return <path d="M86 121Q100 137 114 121" stroke={OUT} strokeWidth={3.6} fill="none" strokeLinecap="round" />;
  }
};

const Eye: React.FC<{ cx: number; open: number; lookX: number; lookY: number }> = ({ cx, open, lookX, lookY }) => (
  <g transform={`translate(${cx} 99) scale(1 ${Math.max(0.1, open)}) translate(${-cx} -99)`}>
    <ellipse cx={cx} cy={99} rx={11} ry={13} fill="#FFFFFF" stroke={OUT} strokeWidth={2.8} />
    <circle cx={cx + 2 + lookX * 4} cy={101 + lookY * 4} r={6.6} fill="#2B1B12" />
    <circle cx={cx + 2 + lookX * 4} cy={101 + lookY * 4} r={3.2} fill="#000000" />
    <circle cx={cx + 4.5 + lookX * 4} cy={97.5 + lookY * 4} r={2.3} fill="#FFFFFF" />
    <circle cx={cx + 0.5 + lookX * 4} cy={104 + lookY * 4} r={1} fill="#FFFFFF" opacity={0.8} />
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
  const shirt = outfit === "school" ? "#FFFFFF" : "#F7B928";
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
      <Arm sx={SHOULDER_L.x} sy={SHOULDER_L.y} a={aL} e={elbowL} pass={pass} sleeve={shirt} thumb={1} />
      <Arm sx={SHOULDER_R.x} sy={SHOULDER_R.y} a={-aR} e={-elbowR} pass={pass} sleeve={shirt} thumb={-1} item={handItemR} />
    </>
  );

  return (
    <g opacity={opacity} transform={`translate(${x} ${y}) scale(${sx} ${scale}) translate(-100 -400)`}>
      <defs>
        <radialGradient id="boySkin" cx="0.42" cy="0.36" r="0.72">
          <stop offset="0" stopColor="#F6CDA8" />
          <stop offset="0.7" stopColor={SKIN} />
          <stop offset="1" stopColor="#DFA175" />
        </radialGradient>
      </defs>
      <ellipse cx={100} cy={400} rx={60} ry={9} fill="#000000" opacity={0.12} />
      {/* Legs pivot at the hips */}
      {[
        { hx: 84, a: legSwing, dir: -1 },
        { hx: 116, a: -legSwing, dir: 1 },
      ].map(({ hx, a, dir }) => (
        <g key={hx} transform={`translate(0 ${body * 0.3}) rotate(${a} ${hx} 300)`}>
          <path
            d={`M${hx - 11} 296Q${hx - 12.5} 340 ${hx - 8.5} 381H${hx + 8.5}Q${hx + 12.5} 340 ${hx + 11} 296Z`}
            fill={SKIN}
            stroke={OUT}
            strokeWidth={OUT_W}
            strokeLinejoin="round"
          />
          <path d={`M${hx + 4} 310Q${hx + 7} 340 ${hx + 4} 366`} stroke={SKIN_SHADE} strokeWidth={4} strokeLinecap="round" opacity={0.5} />
          <path d={`M${hx - 9} 368Q${hx} 371 ${hx + 9} 368V382H${hx - 9}Z`} fill="#FFFFFF" stroke={OUT} strokeWidth={2.5} strokeLinejoin="round" />
          <path
            d={`M${hx - dir * 14} 394Q${hx - dir * 14} 380 ${hx} 379Q${hx + dir * 20} 379 ${hx + dir * 23} 392Q${hx + dir * 21} 400 ${hx} 400Q${hx - dir * 14} 400 ${hx - dir * 14} 394Z`}
            fill="#24263A"
            stroke={OUT}
            strokeWidth={OUT_W}
            strokeLinejoin="round"
          />
          <ellipse cx={hx + dir * 8} cy={385} rx={6} ry={2.6} fill="#FFFFFF" opacity={0.3} />
        </g>
      ))}
      <g transform={`translate(0 ${body}) rotate(${lean} 100 300)`}>
        {bag ? (
          <g>
            <rect x={42} y={174} width={116} height={120} rx={34} fill="#1C2E5A" stroke={OUT} strokeWidth={OUT_W} />
            <path d="M48 196Q100 186 152 196" stroke="#2C4378" strokeWidth={8} fill="none" />
          </g>
        ) : null}
        <path
          d="M63 262Q100 256 137 262Q141 292 143 318Q127 325 108 321L100 302L92 321Q73 325 57 318Q59 292 63 262Z"
          fill={shorts}
          stroke={OUT}
          strokeWidth={OUT_W}
          strokeLinejoin="round"
        />
        <path d="M120 266Q132 290 132 318Q138 318 141 316Q139 290 136 264Z" fill="#000000" opacity={0.15} />
        {arms("outline")}
        <path d="M89 136H111V166Q100 172 89 166Z" fill={SKIN_SHADE} stroke={OUT} strokeWidth={OUT_W} strokeLinejoin="round" />
        <g transform={`translate(0 ${breathe * 0.4})`}>
          <path
            d="M70 168Q100 158 130 168Q144 174 146 192L141 212Q138 244 137 274Q100 282 63 274Q62 244 59 212L54 192Q56 174 70 168Z"
            fill={shirt}
            stroke={OUT}
            strokeWidth={OUT_W}
            strokeLinejoin="round"
          />
          <path d="M122 170Q140 176 143 194L139 212Q136 244 136 274Q124 277 115 278Q128 236 122 170Z" fill="#000000" opacity={0.08} />
          {outfit === "school" ? (
            <g>
              <path d="M84 164Q90 182 100 186Q110 182 116 164" fill="none" stroke={OUT} strokeWidth={2.8} strokeLinejoin="round" strokeLinecap="round" />
              <circle cx={100} cy={204} r={2.6} fill={OUT} opacity={0.7} />
              <circle cx={100} cy={232} r={2.6} fill={OUT} opacity={0.7} />
            </g>
          ) : (
            <g>
              <path d="M86 166Q100 180 114 166" fill="none" stroke={OUT} strokeWidth={2.8} strokeLinecap="round" />
              <path d="M80 224Q100 234 120 224" stroke="#E0960E" strokeWidth={6} fill="none" strokeLinecap="round" />
            </g>
          )}
          {bag ? (
            <path d="M78 170Q73 214 77 262M122 170Q127 214 123 262" stroke="#1C2E5A" strokeWidth={11} fill="none" strokeLinecap="round" />
          ) : null}
        </g>
        {arms("fill")}
        {frontItem}
        {/* Head pivots at the neck */}
        <g transform={`translate(0 ${breathe * 0.6}) rotate(${headTilt} 100 150)`}>
          <ellipse cx={100} cy={146} rx={30} ry={8} fill="#000000" opacity={0.12} />
          {[44, 156].map((ex) => (
            <g key={ex}>
              <circle cx={ex} cy={100} r={12.5} fill={SKIN} stroke={OUT} strokeWidth={OUT_W} />
              <path d={`M${ex + (ex < 100 ? 3 : -3)} 94Q${ex + (ex < 100 ? -4 : 4)} 100 ${ex + (ex < 100 ? 3 : -3)} 106`} stroke={SKIN_SHADE} strokeWidth={3} fill="none" strokeLinecap="round" />
            </g>
          ))}
          <circle cx={100} cy={94} r={56} fill="url(#boySkin)" stroke={OUT} strokeWidth={OUT_W} />
          <path
            d="M44 98C36 50 70 24 104 26C142 28 166 54 157 98C152 80 140 68 124 62Q122 72 114 74Q112 64 104 60Q100 70 92 72Q92 63 86 61C68 66 52 78 44 98Z"
            fill={HAIR}
            stroke={HAIR}
            strokeWidth={3}
            strokeLinejoin="round"
          />
          <path d="M66 46Q88 32 112 36" stroke="#5A4C42" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.55} />
          <path d="M120 40Q136 46 144 58" stroke="#5A4C42" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.4} />
          <ellipse cx={73} cy={117} rx={10} ry={7} fill="#F28B82" opacity={expression === "proud" ? 0.55 : 0.32} />
          <ellipse cx={127} cy={117} rx={10} ry={7} fill="#F28B82" opacity={expression === "proud" ? 0.55 : 0.32} />
          <Eye cx={80} open={open} lookX={lookX} lookY={lookY} />
          <Eye cx={120} open={open} lookX={lookX} lookY={lookY} />
          <Brows expression={expression} />
          <path d="M97 107Q100 112 104 109" stroke={SKIN_SHADE} strokeWidth={3} fill="none" strokeLinecap="round" />
          <Mouth expression={expression} open={mouthOpen} />
        </g>
      </g>
    </g>
  );
};
