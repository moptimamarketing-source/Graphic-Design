import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { F } from "./fonts";

export const W = 1080;
export const H = 1920;

/** Masa (saat) sejak babak bermula. */
export const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

/** Spring 0→1 yang bermula pada `at` saat. */
export const useSpring = (at: number, config: Parameters<typeof spring>[0]["config"] = {}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - Math.round(at * fps), fps, config: { damping: 12, stiffness: 180, ...config } });
};

export const ramp = (t: number, a: number, b: number, from = 0, to = 1, ease = Easing.out(Easing.cubic)) =>
  interpolate(t, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

export const fill: React.CSSProperties = { position: "absolute", inset: 0 };

/* ------------------------------------------------------------------ */
/* Tekstur & latar                                                     */
/* ------------------------------------------------------------------ */

const Tex: React.FC<{ name: string; blend?: React.CSSProperties["mixBlendMode"]; opacity?: number }> = ({
  name,
  blend = "multiply",
  opacity = 1,
}) => <Img src={staticFile(`tex/${name}.png`)} style={{ ...fill, width: W, height: H, mixBlendMode: blend, opacity }} />;

const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.55 }) => (
  <div
    style={{
      ...fill,
      background: `radial-gradient(ellipse 75% 60% at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,${strength}) 100%)`,
    }}
  />
);

export const Solid: React.FC<{ color: string; vignette?: number; tex?: "mottle" | "felt" }> = ({
  color,
  vignette = 0.6,
  tex = "mottle",
}) => (
  <AbsoluteFill style={{ background: color }}>
    <Tex name={tex} />
    <Vignette strength={vignette} />
  </AbsoluteFill>
);

const gridLines = (color: string, step: number, width: number) =>
  `linear-gradient(${color} ${width}px, transparent ${width}px), linear-gradient(90deg, ${color} ${width}px, transparent ${width}px)`;

export const GridPaper: React.FC = () => (
  <AbsoluteFill style={{ background: "#ecebe5" }}>
    <div
      style={{
        ...fill,
        backgroundImage: `${gridLines("rgba(40,60,90,.16)", 54, 2)}, ${gridLines("rgba(40,60,90,.09)", 18, 1)}`,
        backgroundSize: "54px 54px, 54px 54px, 18px 18px, 18px 18px",
      }}
    />
    <Tex name="mottle" />
    <Vignette strength={0.35} />
  </AbsoluteFill>
);

export const CuttingMat: React.FC = () => (
  <AbsoluteFill style={{ background: "#2f7c45" }}>
    <div
      style={{
        ...fill,
        backgroundImage: `${gridLines("rgba(220,255,220,.38)", 270, 3)}, ${gridLines("rgba(220,255,220,.18)", 54, 2)}`,
        backgroundSize: "270px 270px, 270px 270px, 54px 54px, 54px 54px",
        backgroundPosition: "20px 30px",
      }}
    />
    <Tex name="mottle" />
    <Tex name="mottle" opacity={0.6} />
    <Vignette strength={0.5} />
  </AbsoluteFill>
);

export const Felt: React.FC<{ floor?: boolean }> = ({ floor = true }) => (
  <AbsoluteFill style={{ background: "#3566c4" }}>
    {floor && <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 560, background: "#2449a8" }} />}
    <Tex name="felt" />
    <Vignette strength={0.55} />
  </AbsoluteFill>
);

export const Wood: React.FC = () => (
  <AbsoluteFill>
    <Img src={staticFile("tex/wood.png")} style={{ ...fill, width: W, height: H }} />
    <Tex name="mottle" />
    <Vignette strength={0.6} />
  </AbsoluteFill>
);

const DamaskMotif: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`} fill="#7a1822">
    <path d="M0 -95 C 28 -60 45 -30 22 0 C 45 30 28 60 0 95 C -28 60 -45 30 -22 0 C -45 -30 -28 -60 0 -95 Z" />
    <circle cx="0" cy="0" r="12" fill="#5c0f17" />
    <path d="M22 0 C 60 -20 80 -55 62 -80 C 50 -50 38 -30 22 0 Z" />
    <path d="M-22 0 C -60 -20 -80 -55 -62 -80 C -50 -50 -38 -30 -22 0 Z" />
    <path d="M22 0 C 60 20 80 55 62 80 C 50 50 38 30 22 0 Z" />
    <path d="M-22 0 C -60 20 -80 55 -62 80 C -50 50 -38 30 -22 0 Z" />
  </g>
);

export const Damask: React.FC = () => {
  const motifs: React.ReactNode[] = [];
  for (let r = -1; r < 10; r++) {
    for (let c = -1; c < 6; c++) {
      motifs.push(<DamaskMotif key={`${r}-${c}`} x={c * 220 + (r % 2 ? 110 : 0)} y={r * 230} />);
    }
  }
  return (
    <AbsoluteFill style={{ background: "#5d0e16" }}>
      <svg width={W} height={H} style={fill}>
        {motifs}
      </svg>
      <Tex name="mottle" />
      <Vignette strength={0.75} />
    </AbsoluteFill>
  );
};

/** Gelang berpusar merah-putih (macam latar "381 billion"). */
export const Swirl: React.FC<{ phase?: number }> = ({ phase = 0 }) => {
  const f = useCurrentFrame();
  const cx = 540;
  const cy = 860;
  const paths: React.ReactNode[] = [];
  for (let k = 16; k >= 1; k--) {
    const base = k * 120;
    let d = "";
    for (let i = 0; i <= 140; i++) {
      const th = (i / 140) * Math.PI * 2;
      const r =
        base *
        (1 + 0.1 * Math.sin(3 * th + f * 0.06 + k * 0.55 + phase) + 0.05 * Math.sin(5 * th - f * 0.045 + k * 1.3));
      d += `${i ? "L" : "M"}${(cx + r * Math.cos(th) * 0.78).toFixed(1)} ${(cy + r * Math.sin(th) * 1.12).toFixed(1)}`;
    }
    paths.push(<path key={k} d={`${d}Z`} fill={k % 2 ? "#c9141f" : "#f2ece2"} />);
  }
  return (
    <AbsoluteFill style={{ background: "#f2ece2" }}>
      <svg width={W} height={H} style={fill}>
        {paths}
      </svg>
      <Tex name="felt" opacity={0.7} />
      <Vignette strength={0.35} />
    </AbsoluteFill>
  );
};

const Cloud: React.FC<{ x: number; y: number; s: number; o?: number }> = ({ x, y, s, o = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `scale(${s})`, transformOrigin: "0 0", opacity: o }}>
    {[
      [0, 60, 150],
      [90, 20, 190],
      [210, 50, 160],
      [300, 80, 120],
      [60, 100, 140],
      [190, 110, 150],
    ].map(([cx, cy, r], i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          left: cx,
          top: cy,
          width: r,
          height: r,
          borderRadius: "50%",
          background: "radial-gradient(circle at 40% 35%, #ffffff 0%, #f4f8ff 55%, #dfe9f6 100%)",
          filter: "blur(6px)",
        }}
      />
    ))}
  </div>
);

export const Sky: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #4b93db 0%, #87bdec 55%, #c4e0f7 100%)" }}>
      <Cloud x={-120 + t * 12} y={180} s={1.4} />
      <Cloud x={620 - t * 10} y={520} s={1.1} o={0.9} />
      <Cloud x={-200 + t * 8} y={1180} s={1.6} />
      <Cloud x={700 - t * 14} y={1500} s={1.3} />
      <Tex name="mottle" opacity={0.5} />
      <Vignette strength={0.3} />
    </AbsoluteFill>
  );
};

/** Grain filem global, ditukar setiap 2 frame. */
export const FilmGrain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Img
      src={staticFile(`tex/grain${Math.floor(f / 2) % 4}.png`)}
      style={{ ...fill, width: W, height: H, mixBlendMode: "overlay", opacity: 0.32, pointerEvents: "none" }}
    />
  );
};

/* ------------------------------------------------------------------ */
/* Kesan / komponen animasi                                            */
/* ------------------------------------------------------------------ */

/** Muncul dengan pop (scale 0 → overshoot → 1). */
export const Pop: React.FC<{
  at: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  from?: number;
  rotate?: number;
}> = ({ at, children, style, from = 0, rotate = 0 }) => {
  const s = useSpring(at, { damping: 10, stiffness: 220 });
  const t = useT();
  if (t < at) return null;
  return (
    <div style={{ position: "absolute", ...style, transform: `${style?.transform ?? ""} scale(${from + (1 - from) * s}) rotate(${rotate}deg)` }}>
      {children}
    </div>
  );
};

/** Cop getah: jatuh dari besar ke saiz asal dengan gegaran. */
export const Stamp: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties; rotate?: number }> = ({
  at,
  children,
  style,
  rotate = -6,
}) => {
  const s = useSpring(at, { damping: 14, stiffness: 420 });
  const t = useT();
  if (t < at) return null;
  const shake = t - at < 0.25 ? (random(`sx${Math.round(t * 30)}`) - 0.5) * 18 * (1 - (t - at) / 0.25) : 0;
  return (
    <div
      style={{
        position: "absolute",
        ...style,
        transform: `${style?.transform ?? ""} translate(${shake}px, ${shake * 0.6}px) scale(${2.4 - 1.4 * s}) rotate(${rotate}deg)`,
        opacity: Math.min(1, s * 3),
      }}
    >
      {children}
    </div>
  );
};

/** Gegaran rawak (untuk "TERSEKAT"). */
export const useShake = (amount: number) => {
  const f = useCurrentFrame();
  return { x: (random(`x${f}`) - 0.5) * amount, y: (random(`y${f}`) - 0.5) * amount };
};

/** Teks tulisan tangan yang "ditulis" dari kiri ke kanan. */
export const Handwrite: React.FC<{
  text: string;
  at: number;
  dur?: number;
  size: number;
  color: string;
  style?: React.CSSProperties;
}> = ({ text, at, dur = 0.8, size, color, style }) => {
  const t = useT();
  const p = ramp(t, at, at + dur, 0, 100, Easing.inOut(Easing.quad));
  return (
    <div
      style={{
        position: "absolute",
        fontFamily: F.hand,
        fontWeight: 700,
        fontSize: size,
        color,
        lineHeight: 0.95,
        whiteSpace: "pre",
        clipPath: `inset(-20% ${100 - p}% -20% -5%)`,
        paddingRight: size * 0.3, // ruang untuk hujung huruf condong
        ...style,
      }}
    >
      {text}
    </div>
  );
};

/** Odometer: digit bergolek dari `from` ke `to`. */
export const Odometer: React.FC<{
  from: number;
  to: number;
  at: number;
  dur: number;
  digits: number;
  size: number;
  cell: (d: number, i: number) => React.CSSProperties;
  font?: string;
  color?: string;
}> = ({ from, to, at, dur, digits, size, cell, font = F.anton, color = "#fff" }) => {
  const t = useT();
  const v = ramp(t, at, at + dur, from, to, Easing.out(Easing.cubic));
  const h = size * 1.15;
  return (
    <div style={{ display: "flex", gap: size * 0.08 }}>
      {Array.from({ length: digits }).map((_, i) => {
        const place = Math.pow(10, digits - 1 - i);
        // Kedudukan berterusan untuk lajur ini (digit bawah berpusing lebih laju).
        let pos = (v / place) % 10;
        if (place > 1) {
          const lower = v % place;
          const carry = Math.max(0, (lower - (place - 1)) / 1);
          pos = Math.floor(v / place) % 10 + Math.min(1, carry);
        }
        return (
          <div key={i} style={{ height: h, overflow: "hidden", position: "relative", ...cell(Math.round(pos) % 10, i) }}>
            <div style={{ transform: `translateY(${-pos * h}px)` }}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, k) => (
                <div
                  key={k}
                  style={{ height: h, lineHeight: `${h}px`, fontSize: size, fontFamily: font, color, textAlign: "center", padding: `0 ${size * 0.08}px` }}
                >
                  {d}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Lajur huruf A→Z bergolek. */
export const LetterRoll: React.FC<{ at: number; dur: number; size: number }> = ({ at, dur, size }) => {
  const t = useT();
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const pos = ramp(t, at, at + dur, 0, 25, Easing.out(Easing.cubic));
  const h = size * 1.2;
  return (
    <div style={{ height: h, overflow: "hidden" }}>
      <div style={{ transform: `translateY(${-pos * h}px)` }}>
        {letters.map((l) => (
          <div key={l} style={{ height: h, lineHeight: `${h}px`, fontSize: size, fontFamily: F.heavy, color: "#fff", textAlign: "center" }}>
            {l}
          </div>
        ))}
      </div>
    </div>
  );
};

/** Jubin huruf ala Scrabble. */
export const Tile: React.FC<{ letter: string; size?: number; style?: React.CSSProperties }> = ({ letter, size = 130, style }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.1,
      background: "linear-gradient(145deg, #f6e7c4, #e2c690)",
      boxShadow: `0 ${size * 0.06}px 0 #b9935a, 0 ${size * 0.14}px ${size * 0.22}px rgba(0,0,0,.45)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: F.heavy,
      fontSize: size * 0.62,
      color: "#2a1d10",
      position: "relative",
      ...style,
    }}
  >
    {letter}
    <span style={{ position: "absolute", right: size * 0.1, bottom: size * 0.04, fontSize: size * 0.17, fontFamily: F.inter }}>1</span>
  </div>
);

/** Blok kayu kanak-kanak dengan huruf. */
export const Block: React.FC<{ letter: string; color: string; size?: number; rotate?: number; style?: React.CSSProperties }> = ({
  letter,
  color,
  size = 170,
  rotate = 0,
  style,
}) => (
  <div
    style={{
      position: "absolute",
      width: size,
      height: size,
      borderRadius: size * 0.08,
      background: "#f0d9a8",
      boxShadow: `0 ${size * 0.08}px ${size * 0.18}px rgba(0,0,0,.45), inset 0 0 0 ${size * 0.06}px #e3c78d`,
      transform: `rotate(${rotate}deg)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      ...style,
    }}
  >
    <div
      style={{
        width: size * 0.76,
        height: size * 0.76,
        borderRadius: size * 0.06,
        background: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: F.heavy,
        fontSize: size * 0.56,
        color: "#fff",
        textShadow: "0 4px 0 rgba(0,0,0,.25)",
      }}
    >
      {letter}
    </div>
  </div>
);

export const Pencil: React.FC<{ x: number; y: number; rotate: number; length?: number }> = ({ x, y, rotate, length = 700 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: length,
      height: 46,
      transform: `rotate(${rotate}deg)`,
      transformOrigin: "0 50%",
      filter: "drop-shadow(0 14px 12px rgba(0,0,0,.4))",
      display: "flex",
    }}
  >
    <div style={{ width: 60, background: "#e88a9a", borderRadius: "10px 0 0 10px" }} />
    <div style={{ width: 40, background: "linear-gradient(#cfcfcf,#8d8d8d,#cfcfcf)" }} />
    <div style={{ flex: 1, background: "linear-gradient(#ffd23f 0 33%, #f0b90b 33% 66%, #ffd23f 66%)" }} />
    <div
      style={{
        width: 0,
        height: 0,
        borderTop: "23px solid transparent",
        borderBottom: "23px solid transparent",
        borderLeft: "90px solid #e9c49a",
        position: "relative",
      }}
    />
  </div>
);

/** Papan hitam tergantung yang berayun masuk. */
export const HangingBoard: React.FC<{ at: number; children?: React.ReactNode; top?: number }> = ({ at, children, top = 300 }) => {
  const s = useSpring(at, { damping: 5, stiffness: 90, mass: 0.9 });
  const angle = -28 * (1 - s);
  const drop = -900 * (1 - Math.min(1, s * 1.6));
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transform: `translateY(${drop}px)` }}>
      <div style={{ position: "absolute", left: 90, top: top - 230, width: 900, height: 900, transformOrigin: "450px 0px", transform: `rotate(${angle}deg)` }}>
        <svg width={900} height={240} style={{ position: "absolute", left: 0, top: 0 }}>
          <line x1={450} y1={8} x2={110} y2={232} stroke="#1b1b1b" strokeWidth={5} />
          <line x1={450} y1={8} x2={790} y2={232} stroke="#1b1b1b" strokeWidth={5} />
          <circle cx={450} cy={10} r={14} fill="#d12a2a" />
        </svg>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 230,
            width: 900,
            height: 640,
            borderRadius: 10,
            background: "linear-gradient(135deg,#a8743f,#c99559 40%,#8a5a2c)",
            padding: 34,
            boxShadow: "0 40px 60px rgba(0,0,0,.5)",
          }}
        >
          <div style={{ position: "relative", width: "100%", height: "100%", background: "#2c302d", overflow: "hidden", borderRadius: 4 }}>
            <Img src={staticFile("tex/felt.png")} style={{ ...fill, width: "100%", height: "100%", mixBlendMode: "multiply", opacity: 0.9 }} />
            <div style={{ ...fill, background: "radial-gradient(ellipse at 40% 30%, rgba(255,255,255,.08), rgba(0,0,0,.25))" }} />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

/** Mask teropong: dua bulatan bertindih, luar hitam, zoom masuk. */
export const Binocular: React.FC<{ at?: number }> = ({ at = 0 }) => {
  const s = useSpring(at, { damping: 20, stiffness: 120 });
  const r = 760 - 140 * s;
  const id = React.useId().replace(/:/g, "");
  return (
    <svg width={W} height={H} style={{ ...fill }}>
      <defs>
        <filter id={`b${id}`}>
          <feGaussianBlur stdDeviation="16" />
        </filter>
        <mask id={`m${id}`}>
          <rect x={-100} y={-100} width={W + 200} height={H + 200} fill="#fff" />
          <g filter={`url(#b${id})`}>
            <circle cx={540 - r * 0.55} cy={900} r={r} fill="#000" />
            <circle cx={540 + r * 0.55} cy={900} r={r} fill="#000" />
          </g>
        </mask>
      </defs>
      <rect x={-100} y={-100} width={W + 200} height={H + 200} fill="#000" mask={`url(#m${id})`} />
    </svg>
  );
};

/** Jubin huruf yang jatuh dari atas. */
export const FallingTiles: React.FC<{ at: number; count: number; seed: string }> = ({ at, count, seed }) => {
  const t = useT();
  const letters = "ABCDEFGHIJKLMNOPRSTU";
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const start = at + random(`${seed}d${i}`) * 1.6;
        const tt = t - start;
        if (tt < 0) return null;
        const x = random(`${seed}x${i}`) * 920;
        const y = -200 + 900 * tt * tt + 380 * tt;
        if (y > H + 200) return null;
        const rot = (random(`${seed}r${i}`) - 0.5) * 360 * tt + random(`${seed}r0${i}`) * 60;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, transform: `rotate(${rot}deg)` }}>
            <Tile letter={letters[i % letters.length]} size={110} />
          </div>
        );
      })}
    </>
  );
};

/** Budak (ikon) — kepala + badan. */
export const Kid: React.FC<{ color: string; size?: number; active?: number }> = ({ color, size = 120, active = 0 }) => (
  <div style={{ width: size, height: size * 1.3, position: "relative", transform: `scale(${1 + 0.18 * active}) translateY(${-24 * active}px)` }}>
    <div
      style={{
        position: "absolute",
        left: size * 0.27,
        top: 0,
        width: size * 0.46,
        height: size * 0.46,
        borderRadius: "50%",
        background: "#f1c7a0",
        boxShadow: active ? `0 0 0 ${8 * active}px #ffd21f` : undefined,
      }}
    />
    <div
      style={{
        position: "absolute",
        left: size * 0.08,
        top: size * 0.52,
        width: size * 0.84,
        height: size * 0.78,
        borderRadius: `${size * 0.42}px ${size * 0.42}px ${size * 0.12}px ${size * 0.12}px`,
        background: color,
        boxShadow: active ? `0 0 0 ${8 * active}px #ffd21f` : "0 10px 18px rgba(0,0,0,.25)",
      }}
    />
  </div>
);

export const KID_COLORS = ["#e63946", "#2a9d8f", "#f4a261", "#457b9d", "#9b5de5", "#e76f51", "#06d6a0", "#3a86ff"];

/** Telefon 3D dengan UI chat WhatsApp. */
export const Phone: React.FC<{ at: number }> = ({ at }) => {
  const t = useT();
  const s = useSpring(at, { damping: 13, stiffness: 90 });
  const bob = Math.sin(t * 2.2) * 14;
  const rotY = -24 + Math.sin(t * 1.4) * 6;
  const bubbles: [string, boolean, number][] = [
    ["Assalamualaikum, anak saya 5 tahun. Boleh daftar kelas membaca?", true, at + 0.5],
    ["Waalaikumussalam! Boleh, kelas untuk 4 tahun ke atas.", false, at + 1.1],
    ["Ada kelas fizikal & online ya.", false, at + 1.6],
  ];
  return (
    <div
      style={{
        position: "absolute",
        left: 380,
        top: 470 + (1 - s) * 1400 + bob,
        width: 520,
        height: 1060,
        perspective: 1600,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `rotateY(${rotY}deg) rotateX(8deg) rotateZ(${6 - 6 * s}deg)`,
          borderRadius: 74,
          background: "#111",
          padding: 20,
          boxShadow: "30px 50px 80px rgba(0,0,40,.45), inset 0 0 0 4px #333",
        }}
      >
        <div style={{ width: "100%", height: "100%", borderRadius: 56, overflow: "hidden", background: "#ece5dd", position: "relative" }}>
          <div style={{ height: 190, background: "#075e54", display: "flex", alignItems: "flex-end", padding: "0 28px 26px", gap: 18 }}>
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: "50%",
                background: "#ffd21f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: F.heavy,
                fontSize: 30,
                color: "#075e54",
              }}
            >
              MO
            </div>
            <div style={{ color: "#fff", fontFamily: F.inter, fontWeight: 800, fontSize: 34 }}>
              Minda Optima
              <div style={{ fontWeight: 600, fontSize: 22, opacity: 0.8 }}>dalam talian</div>
            </div>
          </div>
          <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
            {bubbles.map(([txt, mine, when], i) =>
              t >= when ? (
                <div
                  key={i}
                  style={{
                    alignSelf: mine ? "flex-end" : "flex-start",
                    maxWidth: "82%",
                    background: mine ? "#dcf8c6" : "#fff",
                    borderRadius: 18,
                    padding: "14px 18px",
                    fontFamily: F.inter,
                    fontWeight: 600,
                    fontSize: 25,
                    color: "#222",
                    boxShadow: "0 2px 2px rgba(0,0,0,.12)",
                    transform: `scale(${ramp(t, when, when + 0.18, 0.6, 1)})`,
                    transformOrigin: mine ? "100% 100%" : "0 100%",
                  }}
                >
                  {txt}
                </div>
              ) : null,
            )}
          </div>
          <div
            style={{
              position: "absolute",
              left: 18,
              right: 18,
              bottom: 22,
              height: 76,
              borderRadius: 38,
              background: "#fff",
              display: "flex",
              alignItems: "center",
              padding: "0 26px",
              fontFamily: F.inter,
              fontSize: 24,
              color: "#999",
            }}
          >
            Taip mesej…
          </div>
        </div>
      </div>
    </div>
  );
};

/** Buku terbuka ringkas. */
export const Book: React.FC<{ style?: React.CSSProperties; size?: number }> = ({ style, size = 420 }) => {
  const page = (left: boolean): React.CSSProperties => ({
    width: size / 2,
    height: size * 0.68,
    background: "linear-gradient(90deg, #fffdf6, #f1ead8)",
    transform: `skewY(${left ? 4 : -4}deg)`,
    borderRadius: left ? "8px 0 0 8px" : "0 8px 8px 0",
    padding: size * 0.06,
    display: "flex",
    flexDirection: "column",
    gap: size * 0.035,
    boxShadow: "inset 0 0 20px rgba(0,0,0,.08)",
  });
  const lines = (n: number) =>
    Array.from({ length: n }).map((_, i) => (
      <div key={i} style={{ height: size * 0.018, width: `${70 + ((i * 37) % 30)}%`, background: "#7b7b7b", borderRadius: 4, opacity: 0.55 }} />
    ));
  return (
    <div style={{ position: "absolute", display: "flex", filter: "drop-shadow(0 30px 30px rgba(0,0,0,.45))", ...style }}>
      <div style={page(true)}>{lines(7)}</div>
      <div style={page(false)}>{lines(7)}</div>
    </div>
  );
};

/** Clipboard dengan kertas putih. */
export const Clipboard: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 150, top: 230, width: 780, height: 1060, filter: "drop-shadow(0 40px 40px rgba(0,0,0,.5))" }}>
    <div style={{ ...fill, borderRadius: 30, background: "linear-gradient(135deg,#b8814a,#94612f)" }} />
    <div style={{ position: "absolute", left: 40, top: 110, right: 40, bottom: 40, background: "#fbfaf6", overflow: "hidden" }}>
      <Img src={staticFile("tex/mottle.png")} style={{ ...fill, width: "100%", height: "100%", mixBlendMode: "multiply" }} />
      {children}
    </div>
    <div
      style={{
        position: "absolute",
        left: 250,
        top: 30,
        width: 280,
        height: 130,
        borderRadius: "30px 30px 14px 14px",
        background: "linear-gradient(#e8e8e8,#9c9c9c)",
        boxShadow: "0 8px 12px rgba(0,0,0,.35)",
      }}
    />
  </div>
);

/** Kotak teks putih ala "THEN BOUGHT BIG". */
export const Chip: React.FC<{ children: React.ReactNode; size: number; bg?: string; color?: string; font?: string }> = ({
  children,
  size,
  bg = "#f4f4f4",
  color = "#111",
  font = F.pixel,
}) => (
  <span
    style={{
      display: "inline-block",
      background: bg,
      color,
      fontFamily: font,
      fontWeight: 700,
      fontSize: size,
      padding: `${size * 0.08}px ${size * 0.22}px`,
      lineHeight: 1.05,
      boxShadow: "0 10px 18px rgba(0,0,0,.45)",
    }}
  >
    {children}
  </span>
);

/** Gaya teks besar biasa. */
export const big = (size: number, color: string, font = F.anton, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: font,
  fontSize: size,
  color,
  lineHeight: 0.95,
  textAlign: "center",
  textTransform: "uppercase",
  ...extra,
});

export const centerX = (top: number): React.CSSProperties => ({ left: 0, right: 0, top, display: "flex", justifyContent: "center" });

/* ------------------------------------------------------------------ */
/* Kesan hentakan (hook)                                               */
/* ------------------------------------------------------------------ */

/** Gegaran skrin yang meluruh selepas setiap masa hentakan. */
export const useImpact = (times: number[], amount = 34, decay = 0.35) => {
  const t = useT();
  const f = useCurrentFrame();
  let k = 0;
  for (const at of times) {
    if (t >= at && t - at < decay) k = Math.max(k, 1 - (t - at) / decay);
  }
  return {
    x: (random(`ix${f}`) - 0.5) * amount * k,
    y: (random(`iy${f}`) - 0.5) * amount * k,
    rot: (random(`ir${f}`) - 0.5) * 3 * k,
  };
};

/** Kilat putih sekejap. */
export const Flash: React.FC<{ at: number; dur?: number; strength?: number; color?: string }> = ({
  at,
  dur = 0.25,
  strength = 0.9,
  color = "#fff",
}) => {
  const t = useT();
  if (t < at || t > at + dur) return null;
  return <div style={{ ...fill, background: color, opacity: strength * (1 - (t - at) / dur) }} />;
};

/** Jubin huruf meletup keluar dari tengah. */
export const TileBurst: React.FC<{ at: number; cx?: number; cy?: number }> = ({ at, cx = 480, cy = 820 }) => {
  const t = useT();
  const tt = t - at;
  if (tt < 0 || tt > 1.4) return null;
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  return (
    <>
      {letters.map((l, i) => {
        const a = (i / letters.length) * Math.PI * 2 + random(`ba${i}`) * 0.4;
        const dist = (520 + random(`bd${i}`) * 420) * (1 - Math.exp(-tt * 6));
        const fall = 380 * tt * tt;
        const rot = (random(`br${i}`) - 0.5) * 720 * tt;
        return (
          <div
            key={l}
            style={{
              position: "absolute",
              left: cx + Math.cos(a) * dist,
              top: cy + Math.sin(a) * dist * 1.2 + fall,
              transform: `rotate(${rot}deg) scale(${0.6 + 0.6 * Math.min(1, tt * 5)})`,
              opacity: 1 - Math.max(0, (tt - 1) / 0.4),
            }}
          >
            <Tile letter={l} size={100} />
          </div>
        );
      })}
    </>
  );
};
