import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { F } from "./fonts";
import { FilmGrain } from "./lib";
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
      <Captions />
      <Audio src={staticFile("vo.mp3")} />
      <Audio src={staticFile("sfx.wav")} volume={0.55} />
      <Audio src={staticFile("music.wav")} volume={0.16} />
    </AbsoluteFill>
  );
};
