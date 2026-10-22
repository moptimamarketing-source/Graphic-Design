import React from "react";
import { AbsoluteFill, Easing, random, useCurrentFrame } from "remotion";
import { F } from "./fonts";
import {
  big,
  Binocular,
  Block,
  Book,
  centerX,
  Chip,
  Clipboard,
  CuttingMat,
  Damask,
  FallingTiles,
  Flash,
  Felt,
  GridPaper,
  Handwrite,
  HangingBoard,
  Kid,
  KID_COLORS,
  LetterRoll,
  Odometer,
  Pencil,
  Phone,
  Pop,
  ramp,
  Sky,
  Solid,
  Stamp,
  Swirl,
  Tile,
  TileBurst,
  useImpact,
  useShake,
  useSpring,
  useT,
  Wood,
} from "./lib";

/*
 * Satu komponen = satu babak. Masa dalam setiap babak ialah saat
 * relatif kepada permulaan babak (lihat timing.json untuk masa mutlak).
 */

const shadow = "0 10px 0 rgba(0,0,0,.35), 0 18px 30px rgba(0,0,0,.35)";
const outline = (c: string, w = 6) => `${w}px ${w}px 0 ${c}, -2px -2px 0 ${c}, 2px -2px 0 ${c}, -2px 2px 0 ${c}`;

// 1 — "Anak dah kenal A sampai Z..." (hook: hentakan, huruf mesin slot, letupan jubin)
const SLOT_COLORS = ["#1d4ed8", "#e11d2e", "#111111", "#0f766e"];
const S1: React.FC = () => {
  const t = useT();
  const f = useCurrentFrame();
  const shake = useImpact([0, 1.1], 40);
  const idx = Math.min(25, Math.floor(f / 2));
  const zoom = ramp(t, 0, 0.22, 1.6, 1, Easing.out(Easing.back(1.4)));
  return (
    <AbsoluteFill style={{ transform: `translate(${shake.x}px, ${shake.y}px) rotate(${shake.rot}deg) scale(1.04)` }}>
      <GridPaper />
      <Pencil x={-60} y={1560} rotate={-24} />
      <Block letter="B" color="#e63946" rotate={-12} size={150} style={{ left: 800, top: 1530 }} />
      <Block letter="C" color="#2a9d8f" rotate={9} size={120} style={{ left: 660, top: 1700 }} />
      <Stamp at={0} rotate={-2} style={centerX(400)}>
        <div style={big(128, "#161616", F.anton)}>ANAK DAH KENAL</div>
      </Stamp>
      {t < 1.1 ? (
        <div style={{ position: "absolute", ...centerX(600), transform: `scale(${zoom})` }}>
          <div
            style={{
              width: 560,
              height: 560,
              borderRadius: 48,
              background: SLOT_COLORS[idx % SLOT_COLORS.length],
              boxShadow: shadow,
              transform: `rotate(${(random(`sr${idx}`) - 0.5) * 14}deg)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={big(470, "#fff", F.heavy, { lineHeight: 1 })}>{"ABCDEFGHIJKLMNOPQRSTUVWXYZ"[idx]}</div>
          </div>
        </div>
      ) : (
        <Stamp at={1.1} rotate={0} style={{ ...centerX(660), alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
            <div style={{ background: "#1d4ed8", borderRadius: 26, padding: "0 40px", boxShadow: shadow }}>
              <div style={big(260, "#fff", F.heavy, { lineHeight: "312px" })}>A</div>
            </div>
            <div style={big(150, "#161616", F.anton)}>→</div>
            <div style={{ background: "#e11d2e", borderRadius: 26, padding: "0 30px", boxShadow: shadow }}>
              <LetterRoll at={1.15} dur={1.1} size={260} />
            </div>
          </div>
        </Stamp>
      )}
      <TileBurst at={1.1} cy={760} />
      <Flash at={0} dur={0.28} />
      <Flash at={1.1} dur={0.16} strength={0.7} />
    </AbsoluteFill>
  );
};

// 2 — "semua dua puluh enam huruf." (angka dihentak masuk)
const S2: React.FC = () => {
  const shake = useImpact([0, 1.25], 30);
  return (
    <AbsoluteFill style={{ transform: `translate(${shake.x}px, ${shake.y}px) rotate(${shake.rot}deg) scale(1.04)` }}>
      <Swirl />
      <Handwrite text="semua huruf!" at={0.1} dur={0.7} size={140} color="#ffd21f" style={{ left: 170, top: 380, transform: "rotate(-6deg)", textShadow: "0 6px 10px rgba(0,0,0,.35)" }} />
      <Stamp at={0} rotate={-2} style={centerX(600)}>
        <div style={{ background: "#fff", padding: "20px 40px 10px", boxShadow: shadow }}>
          <Odometer
            from={0}
            to={26}
            at={0.1}
            dur={1.1}
            digits={2}
            size={300}
            font={F.heavy}
            color="#111"
            cell={(_, i) => (i === 1 ? { background: "#e11d2e", color: "#fff" } : {})}
          />
          <div style={big(110, "#111", F.anton, { marginTop: 10 })}>HURUF</div>
        </div>
      </Stamp>
      <Flash at={0} dur={0.18} strength={0.6} />
      <Flash at={1.25} dur={0.14} strength={0.5} color="#ffd21f" />
    </AbsoluteFill>
  );
};

// 3 — "Tapi bila suruh baca..."
const S3: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill>
      <Swirl phase={2} />
      <Book size={640} style={{ left: 220, top: 760 + Math.sin(t * 3) * 8, transform: "rotate(-4deg)" }} />
      <Handwrite text="tapi..." at={0.05} dur={0.6} size={230} color="#ffd21f" style={{ left: 250, top: 300, transform: "rotate(-5deg)", textShadow: "0 8px 12px rgba(0,0,0,.4)" }} />
      <Pop at={0.9} style={centerX(1220)}>
        <Chip size={78} font={F.anton}>BILA SURUH BACA?</Chip>
      </Pop>
    </AbsoluteFill>
  );
};

// 4 — "dia tersekat."
const S4: React.FC = () => {
  const sh = useShake(26);
  const t = useT();
  const glitch = Math.floor(t * 30) % 4 === 0 ? 14 : 4;
  return (
    <AbsoluteFill>
      <Solid color="#141414" vignette={0.7} />
      <Pop at={0} style={centerX(560)}>
        <div style={big(90, "#ddd", F.pixel)}>DIA...</div>
      </Pop>
      <div style={{ position: "absolute", left: 0, right: 0, top: 760, transform: `translate(${sh.x}px, ${sh.y}px)` }}>
        {[
          ["#00e5ff", -glitch],
          ["#ff2a2a", glitch],
          ["#fff", 0],
        ].map(([c, dx], i) => (
          <div key={i} style={{ position: "absolute", left: dx as number, right: 0, mixBlendMode: i < 2 ? "screen" : "normal" }}>
            <div style={big(130, c as string, F.pixel, { fontWeight: 700 })}>TERSEKAT.</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// 5 — "Ramai ibu ayah mula dengan... mengeja."
const S5: React.FC = () => (
  <AbsoluteFill>
    <Felt />
    <HangingBoard at={0}>
      <Handwrite text="B - A  →  BA" at={0.45} dur={0.6} size={130} color="#f3f3f3" style={{ left: 90, top: 90 }} />
      <Handwrite text="J - U  →  JU" at={1.35} dur={0.6} size={130} color="#f3f3f3" style={{ left: 90, top: 300 }} />
    </HangingBoard>
    <Stamp at={2.2} rotate={-4} style={centerX(1130)}>
      <div style={big(150, "#fff", F.heavy, { textShadow: outline("#111", 8) })}>MENGEJA</div>
    </Stamp>
  </AbsoluteFill>
);

// 6 — "Ba... ju... baju."
const S6: React.FC = () => (
  <AbsoluteFill>
    <div style={{ position: "absolute", inset: 0, transform: "scale(1.6) translateY(80px)" }}>
      <Felt />
      <HangingBoard at={-5} />
    </div>
    <Pop at={0.15} style={{ left: 110, top: 600 }}>
      <div style={big(160, "#fff", F.heavy, { textShadow: outline("#111", 7) })}>BA...</div>
    </Pop>
    <Pop at={1.06} style={{ left: 560, top: 600 }}>
      <div style={big(160, "#fff", F.heavy, { textShadow: outline("#111", 7) })}>JU...</div>
    </Pop>
    <Stamp at={1.68} rotate={-3} style={centerX(860)}>
      <div style={big(260, "#e11d2e", F.heavy, { textShadow: outline("#fff", 10) })}>BAJU?</div>
    </Stamp>
    <Binocular at={0} />
  </AbsoluteFill>
);

// 7 — "Anak penat mengeja, sebelum sempat faham."
const S7: React.FC = () => {
  const s = useSpring(0.1, { damping: 7, stiffness: 160 });
  return (
    <AbsoluteFill>
      <Solid color="#d3141c" vignette={0.55} />
      <div style={{ position: "absolute", ...centerX(500), transform: `scaleY(${0.3 + 0.7 * s}) scaleX(${1.3 - 0.3 * s})` }}>
        <div style={big(250, "#ffd21f", F.heavy, { textShadow: "0 12px 0 rgba(0,0,0,.25)" })}>PENAT</div>
      </div>
      <Pop at={1.5} style={centerX(870)}>
        <div style={big(92, "#fff", F.anton)}>SEBELUM SEMPAT FAHAM</div>
      </Pop>
    </AbsoluteFill>
  );
};

// 8 — "Sebab tu,"
const S8: React.FC = () => {
  const t = useT();
  const p = ramp(t, 0.05, 0.6, 0, 100);
  return (
    <AbsoluteFill>
      <Solid color="#151515" vignette={0.7} />
      <div style={{ position: "absolute", ...centerX(720), clipPath: `inset(0 ${100 - p}% 0 0)` }}>
        <div style={big(210, "#e11d2e", F.heavy, { fontStyle: "italic" })}>SEBAB TU,</div>
      </div>
    </AbsoluteFill>
  );
};

// 9 — "sejak 1995,"
const S9: React.FC = () => (
  <AbsoluteFill>
    <Solid color="#2343c9" vignette={0.5} />
    <Pop at={0.05} style={{ left: 120, top: 640 }}>
      <div style={{ fontFamily: F.serif, fontSize: 190, color: "#fff", fontWeight: 500 }}>Sejak</div>
    </Pop>
    <Pop at={0.4} style={{ left: 200, top: 880 }}>
      <div style={{ background: "#0f4d2c", padding: "6px 30px", boxShadow: "0 12px 24px rgba(0,0,0,.35)" }}>
        <Odometer from={1900} to={1995} at={0.45} dur={1.4} digits={4} size={210} font={F.serif} color="#f7a8e0" cell={() => ({})} />
      </div>
    </Pop>
  </AbsoluteFill>
);

// Bingkai emas dengan nama program (babak 10 & 11)
const GoldFrame: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: 540 - 300 * scale,
      top: 520,
      width: 600 * scale,
      height: 760 * scale,
      padding: 46 * scale,
      background: "linear-gradient(135deg,#f6d77a,#b8862b 30%,#f9e3a0 50%,#a87521 75%,#e8c060)",
      boxShadow: "0 40px 60px rgba(0,0,0,.6), inset 0 0 0 10px rgba(120,80,10,.5)",
    }}
  >
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "radial-gradient(circle at 50% 40%, #fdf6e3, #e9dcbc)",
        boxShadow: "inset 0 0 40px rgba(0,0,0,.35)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24 * scale,
      }}
    >
      <div style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 96 * scale, color: "#1d3a8a", textAlign: "center", lineHeight: 1 }}>
        Minda
        <br />
        Optima
      </div>
      <div style={{ width: 200 * scale, height: 4, background: "#b8862b" }} />
      <div style={{ fontFamily: F.inter, fontWeight: 800, fontSize: 30 * scale, color: "#333", textAlign: "center", lineHeight: 1.4 }}>
        PANTAS BACA
        <br />
        THE VICTORIA READERS
      </div>
      <div style={{ fontFamily: F.serif, fontSize: 28 * scale, color: "#7a5a1a" }}>sejak 1995</div>
    </div>
  </div>
);

// 10 — "Minda Optima ajar anak membaca"
const S10: React.FC = () => {
  const s = useSpring(0, { damping: 14, stiffness: 140 });
  return (
    <AbsoluteFill>
      <Damask />
      <div style={{ position: "absolute", inset: 0, transform: `scale(${0.6 + 0.4 * s})` }}>
        <GoldFrame />
      </div>
      <Pop at={1.15} style={centerX(1000)}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <Chip size={76}>AJAR ANAK</Chip>
          <Chip size={110} bg="#111" color="#fff">
            MEMBACA
          </Chip>
        </div>
      </Pop>
    </AbsoluteFill>
  );
};

// 11 — "tanpa eja! Tanpa hafal!"
const S11: React.FC = () => {
  const t = useT();
  const letters = "ABCDEFGHIJKLMNOP".split("");
  return (
    <AbsoluteFill>
      <Damask />
      {letters.map((l, i) => {
        const a = (i / letters.length) * Math.PI * 2 + t * 0.8;
        return (
          <div key={l} style={{ position: "absolute", left: 485 + Math.cos(a) * 470, top: 850 + Math.sin(a) * 640, transform: `rotate(${a * 57 + 90}deg)` }}>
            <Tile letter={l} size={110} />
          </div>
        );
      })}
      <div style={{ position: "absolute", inset: 0, transform: "scale(0.7)", transformOrigin: "50% 48%" }}>
        <GoldFrame />
      </div>
      {[
        ["TANPA EJA", 0.04, 560, -7],
        ["TANPA HAFAL", 1.21, 1000, 5],
      ].map(([txt, at, top, rot]) => (
        <Stamp key={txt as string} at={at as number} rotate={rot as number} style={centerX(top as number)}>
          <div
            style={{
              ...big(130, "#e11d2e", F.stencil),
              border: "12px solid #e11d2e",
              padding: "6px 30px",
              background: "rgba(255,245,235,.92)",
              boxShadow: "0 18px 30px rgba(0,0,0,.45)",
            }}
          >
            {txt as string}
          </div>
        </Stamp>
      ))}
    </AbsoluteFill>
  );
};

// 12 — "Rahsianya?"
const S12: React.FC = () => (
  <AbsoluteFill>
    <div style={{ position: "absolute", inset: 0, transform: "scale(1.25)" }}>
      <CuttingMat />
      <Tile letter="R" size={160} style={{ position: "absolute", left: 180, top: 720, transform: "rotate(-12deg)" }} />
      <Tile letter="A" size={160} style={{ position: "absolute", left: 420, top: 690, transform: "rotate(6deg)" }} />
      <Tile letter="H" size={160} style={{ position: "absolute", left: 660, top: 730, transform: "rotate(-4deg)" }} />
    </div>
    <Binocular at={0} />
    <Stamp at={0.05} rotate={-4} style={centerX(1000)}>
      <div style={{ background: "#e11d2e", border: "10px solid #111", padding: "4px 36px", boxShadow: "0 16px 30px rgba(0,0,0,.5)" }}>
        <div style={big(150, "#ffd21f", F.heavy)}>RAHSIANYA?</div>
      </div>
    </Stamp>
  </AbsoluteFill>
);

/** Barisan 8 budak; seorang demi seorang dapat giliran. */
const TurnRow: React.FC<{ at: number; top: number; size: number; speed?: number }> = ({ at, top, size, speed = 0.32 }) => {
  const t = useT();
  const active = t < at ? -1 : Math.floor((t - at) / speed) % 8;
  const local = t < at ? 0 : ((t - at) % speed) / speed;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", gap: size * 0.12, padding: "0 20px" }}>
      {KID_COLORS.map((c, i) => (
        <Kid key={i} color={c} size={size} active={i === active ? Math.sin(Math.PI * Math.min(1, local * 1.4)) : 0} />
      ))}
    </div>
  );
};

// 13 — "1-to-1 turn-taking."
const S13: React.FC = () => (
  <AbsoluteFill>
    <GridPaper />
    <Pop at={0.08} style={centerX(380)}>
      <div style={big(250, "#161616", F.heavy, { whiteSpace: "nowrap" })}>1-TO-1</div>
    </Pop>
    <Pop at={1.07} style={centerX(760)}>
      <div style={{ background: "#e11d2e", padding: "6px 34px", transform: "rotate(-2deg)", boxShadow: shadow }}>
        <div style={big(120, "#fff", F.anton)}>TURN-TAKING</div>
      </div>
    </Pop>
    <TurnRow at={1.1} top={1500} size={95} speed={0.17} />
  </AbsoluteFill>
);

// 14 — "Setiap anak dapat giliran sendiri dengan guru,"
const S14: React.FC = () => (
  <AbsoluteFill>
    <GridPaper />
    {["SETIAP ANAK", "DAPAT GILIRAN"].map((w, i) => (
      <Pop key={w} at={0.05 + i * 0.75} style={centerX(260 + i * 170)}>
        <div style={big(130, i ? "#e11d2e" : "#161616", F.anton)}>{w}</div>
      </Pop>
    ))}
    {/* Guru */}
    <Pop at={1.7} style={{ left: 440, top: 640 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Kid color="#1d4ed8" size={200} />
        <div style={{ marginTop: 10 }}>
          <Chip size={46} font={F.anton} bg="#ffd21f">
            GURU
          </Chip>
        </div>
      </div>
    </Pop>
    <TurnRow at={0.4} top={1110} size={110} speed={0.3} />
  </AbsoluteFill>
);

// 15 — "maksimum lapan orang sekelas."
const S15: React.FC = () => (
  <AbsoluteFill>
    <CuttingMat />
    <Pop at={0.05} style={centerX(330)}>
      <div style={big(120, "#fff", F.anton, { textShadow: "0 8px 0 rgba(0,0,0,.3)" })}>MAKSIMUM</div>
    </Pop>
    <Pop at={0.1} style={centerX(520)}>
      <Odometer
        from={0}
        to={8}
        at={0.15}
        dur={1}
        digits={1}
        size={420}
        font={F.pixel}
        cell={() => ({ background: "#e11d2e", border: "14px solid #fff", boxShadow: "0 20px 30px rgba(0,0,0,.4)" })}
      />
    </Pop>
    <Pop at={0.9} style={centerX(1100)}>
      <div style={big(130, "#fff", F.heavy, { textShadow: outline("#111", 8) })}>PELAJAR</div>
    </Pop>
    <Stamp at={1.5} rotate={-5} style={centerX(1500)}>
      <Chip size={90} bg="#ffd21f" font={F.anton}>
        SEKELAS
      </Chip>
    </Stamp>
  </AbsoluteFill>
);

// 16 — "Bukan sekadar duduk mendengar,"
const S16: React.FC = () => {
  const t = useT();
  const strike = ramp(t, 1.4, 1.8, 0, 100, Easing.inOut(Easing.quad));
  return (
    <AbsoluteFill>
      <Solid color="#d3141c" />
      <Pop at={0.05} style={centerX(420)}>
        <div style={big(220, "#ffd21f", F.heavy)}>BUKAN</div>
      </Pop>
      <Pop at={0.35} style={centerX(640)}>
        <div style={big(120, "#fff", F.anton)}>SEKADAR</div>
      </Pop>
      <Pop at={1.05} style={{ ...centerX(860) }}>
        <div style={{ position: "relative" }}>
          <div style={big(140, "#fff", F.anton)}>DUDUK DENGAR</div>
          <div style={{ position: "absolute", left: -20, top: "48%", height: 22, width: `calc(${strike}% + 40px)`, background: "#111", transform: "rotate(-3deg)" }} />
        </div>
      </Pop>
    </AbsoluteFill>
  );
};

// 17 — "tapi baca sendiri, langkah demi langkah."
const S17: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill>
      <Felt />
      <Pop at={0.08} style={centerX(360)}>
        <div style={{ background: "#ffd21f", border: "12px solid #111", padding: "20px 40px", boxShadow: "0 24px 40px rgba(0,0,0,.45)" }}>
          <div style={big(84, "#111", F.heavy)}>TAPI</div>
          <div style={big(170, "#111", F.heavy)}>BACA</div>
          <div style={big(170, "#111", F.heavy)}>SENDIRI</div>
        </div>
      </Pop>
      {/* Tangga langkah demi langkah */}
      {[0, 1, 2, 3].map((i) => {
        const at = 1.6 + i * 0.22;
        const h = ramp(t, at, at + 0.25, 0, 110 + i * 110, Easing.out(Easing.back(1.6)));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 150 + i * 200,
              bottom: 380,
              width: 190,
              height: h,
              background: ["#2a9d8f", "#f4a261", "#e76f51", "#e63946"][i],
              boxShadow: "0 14px 24px rgba(0,0,0,.35)",
            }}
          />
        );
      })}
      <Pop at={1.6} style={centerX(1580)}>
        <div style={big(80, "#fff", F.anton, { textShadow: "0 6px 0 rgba(0,0,0,.35)" })}>LANGKAH DEMI LANGKAH</div>
      </Pop>
    </AbsoluteFill>
  );
};

// 18, 19, 20 — meja kayu + clipboard
const Desk: React.FC<{ children?: React.ReactNode; tilesAt?: number }> = ({ children, tilesAt }) => (
  <AbsoluteFill>
    <Wood />
    <Pencil x={720} y={1650} rotate={-60} length={560} />
    <Clipboard>{children}</Clipboard>
    {tilesAt !== undefined && <FallingTiles at={tilesAt} count={6} seed={`t${tilesAt}`} />}
  </AbsoluteFill>
);

const S18: React.FC = () => (
  <Desk tilesAt={0.4}>
    <Handwrite text={"Jadi\nsoalannya..."} at={0.05} dur={1} size={150} color="#1a1a1a" style={{ left: 60, top: 160 }} />
  </Desk>
);

const S19: React.FC = () => (
  <Desk>
    <div style={{ position: "absolute", left: 60, top: 160, fontFamily: F.hand, fontWeight: 700, fontSize: 150, color: "#1a1a1a", lineHeight: 0.95, whiteSpace: "pre" }}>
      {"Jadi\nsoalannya..."}
    </div>
    <Handwrite text={"terus\nmengeja?"} at={0.1} dur={1.2} size={160} color="#c1121f" style={{ left: 90, top: 560, transform: "rotate(-4deg)" }} />
  </Desk>
);

const S20: React.FC = () => (
  <Desk tilesAt={1.4}>
    <div style={{ position: "absolute", left: 60, top: 160, fontFamily: F.hand, fontWeight: 700, fontSize: 150, color: "#1a1a1a", lineHeight: 0.95, whiteSpace: "pre", opacity: 0.35 }}>
      {"Jadi\nsoalannya..."}
    </div>
    <Pop at={0.05} style={{ left: 0, top: 260, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "#ffd21f", border: "12px solid #111", padding: "18px 34px", boxShadow: "0 24px 40px rgba(0,0,0,.45)", transform: "rotate(-2deg)" }}>
        <div style={big(76, "#111", F.heavy)}>ATAU MULA</div>
        <div style={big(104, "#e11d2e", F.heavy)}>MEMBACA</div>
      </div>
    </Pop>
    <Pop at={1.6} style={{ left: 0, right: 0, top: 690, display: "flex", justifyContent: "center" }}>
      <div style={{ ...big(76, "#1a1a1a", F.anton), maxWidth: 640 }}>DENGAN CARA YANG LEBIH MUDAH?</div>
    </Pop>
  </Desk>
);

// 21 — CTA
const S21: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill>
      <Sky />
      <Block letter="A" color="#e63946" size={180} rotate={-14 + Math.sin(t * 2) * 6} style={{ left: 60, top: 160 + Math.sin(t * 1.7) * 18 }} />
      <Book size={380} style={{ left: 640, top: 150 + Math.sin(t * 1.5 + 1) * 16, transform: "rotate(10deg)" }} />
      <Block letter="B" color="#2a9d8f" size={140} rotate={12 + Math.sin(t * 2.4) * 8} style={{ left: 120, top: 1500 + Math.sin(t * 1.9) * 16 }} />
      <Phone at={0.05} />
      <Pop at={0.05} style={{ left: 80, top: 560 }}>
        <div style={big(150, "#e11d2e", F.heavy, { textAlign: "left", textShadow: outline("#fff", 7) })}>
          IBU
          <br />
          AYAH,
        </div>
      </Pop>
      <Pop at={0.92} style={{ left: 70, top: 900 }}>
        <div style={big(120, "#fff", F.heavy, { textAlign: "left", textShadow: outline("#0b3d2e", 7) })}>
          WHATSAPP
          <br />
          KAMI
        </div>
      </Pop>
      <Stamp at={2.08} rotate={-3} style={centerX(1620)}>
        <div style={{ background: "#25d366", border: "10px solid #fff", padding: "6px 40px", boxShadow: "0 20px 30px rgba(0,0,0,.35)" }}>
          <div style={big(120, "#fff", F.heavy, { textShadow: "0 5px 0 rgba(0,0,0,.25)" })}>LINK DI BIO</div>
        </div>
      </Stamp>
      <Pop at={0.4} style={{ ...centerX(70), padding: "0 90px", textAlign: "center" }}>
        <Chip size={34} font={F.inter} bg="rgba(255,255,255,.92)">
          Pantas Baca · The Victoria Readers
          <br />
          Fizikal & Online · 4 tahun ke atas
        </Chip>
      </Pop>
    </AbsoluteFill>
  );
};

export const SCENES: React.FC[] = [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20, S21];
