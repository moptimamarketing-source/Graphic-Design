import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { F } from "./fonts";
import { Chip, FilmGrain } from "./lib";
import { SCENES } from "./scenes";
import timing from "./timing.json";

const sceneEnd = (i: number) => (i + 1 < timing.scenes.length ? timing.scenes[i + 1].start : timing.end);

/** Push-in perlahan + "punch" kecil pada setiap potongan. */
const PushIn: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const f = useCurrentFrame();
  const scale = interpolate(f, [0, dur], [1, 1.07]) * interpolate(f, [0, 5], [1.09, 1], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ transform: `scale(${scale})` }}>{children}</AbsoluteFill>;
};

/** Sari kata frasa demi frasa, kotak gelap di bawah tengah. */
const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const phrases = timing.scenes.flatMap((s, i) =>
    s.phrases.map(([text, start], k) => ({
      text: text as string,
      start: start as number,
      end: k + 1 < s.phrases.length ? (s.phrases[k + 1][1] as number) : sceneEnd(i),
    })),
  );
  const cur = phrases.find((p) => t >= p.start && t < p.end);
  if (!cur) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1350, display: "flex", justifyContent: "center", padding: "0 70px" }}>
      <div
        style={{
          background: "rgba(18,18,18,.66)",
          borderRadius: 10,
          padding: "8px 22px 10px",
          fontFamily: F.inter,
          fontWeight: 600,
          fontSize: 50,
          color: "#fff",
          textAlign: "center",
          letterSpacing: -0.5,
        }}
      >
        {cur.text}
      </div>
    </div>
  );
};

/** Tajuk hook di atas skrin untuk 0–4.5s (penonton tanpa bunyi pun faham). */
const HookTitle: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  if (t >= timing.scenes[2].start) return null;
  const wiggle = Math.sin(t * 9) * 1.2;
  const pulse = 1 + 0.04 * Math.max(0, Math.sin(t * Math.PI * 2.5));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 96, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ transform: `rotate(${-2 + wiggle * 0.3}deg)` }}>
        <Chip size={64} font={F.anton} bg="#111" color="#fff">
          KENAL 26 HURUF...
        </Chip>
      </div>
      <div style={{ transform: `rotate(${1.5 + wiggle * 0.3}deg) scale(${pulse})` }}>
        <Chip size={64} font={F.heavy} bg="#ffd21f" color="#e11d2e">
          TAPI TAK BOLEH BACA?
        </Chip>
      </div>
    </div>
  );
};

export const Explainer: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {timing.scenes.map((s, i) => {
        const from = Math.round(s.start * fps);
        const dur = Math.round(sceneEnd(i) * fps) - from;
        const Scene = SCENES[i];
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <PushIn dur={dur}>
              <Scene />
            </PushIn>
          </Sequence>
        );
      })}
      <FilmGrain />
      <HookTitle />
      <Captions />
      <Audio src={staticFile("vo.mp3")} />
      <Audio src={staticFile("sfx.wav")} volume={0.55} />
      <Audio src={staticFile("music.wav")} volume={0.16} />
    </AbsoluteFill>
  );
};
