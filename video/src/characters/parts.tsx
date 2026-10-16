import React from "react";

// Shared drawing pieces for the characters.
export const OUT = "#3A2A20"; // warm dark-brown line, softer than black
export const OUT_W = 3.4;

// Tapered capsule from (x, y1) to (x, y2): width w1 at the top, w2 at the bottom.
export const limb = (x: number, y1: number, y2: number, w1: number, w2: number) => {
  const mid = (y1 + y2) / 2;
  return `M${x - w1} ${y1}Q${x - w1 - 1} ${mid} ${x - w2} ${y2}A${w2} ${w2} 0 0 0 ${x + w2} ${y2}Q${x + w1 + 1} ${mid} ${x + w1} ${y1}A${w1} ${w1} 0 0 0 ${x - w1} ${y1}Z`;
};

// Mitten hand with a thumb; `thumb` picks the side the thumb sits on.
export const Hand: React.FC<{ cx: number; cy: number; skin: string; thumb: 1 | -1; size?: number }> = ({
  cx,
  cy,
  skin,
  thumb,
  size = 1,
}) => (
  <g transform={`translate(${cx} ${cy}) scale(${size})`}>
    <ellipse cx={thumb * 8} cy={-4} rx={5} ry={7.5} transform={`rotate(${thumb * -25} ${thumb * 8} -4)`} fill={skin} stroke={OUT} strokeWidth={OUT_W} />
    <ellipse cx={0} cy={1} rx={10.5} ry={11.5} fill={skin} stroke={OUT} strokeWidth={OUT_W} />
    <path d={`M${-thumb * 4} 4Q0 9 ${thumb * 4} 5`} stroke="#000000" strokeWidth={2} fill="none" opacity={0.15} strokeLinecap="round" />
  </g>
);
