import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts, SAFE } from "../theme";

type Props = {
  readonly scene: number;
  readonly title: string;
  readonly onScreenText: string;
  readonly background: string;
};

// Placeholder used until each scene is built. Shows the scene's own
// frame/time so cuts can be checked against the voice-over in Studio.
export const AnimaticCard: React.FC<Props> = ({
  scene,
  title,
  onScreenText,
  background,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background,
        padding: `${SAFE.top}px ${SAFE.side}px ${SAFE.bottom}px`,
        justifyContent: "center",
        gap: 40,
        color: colors.white,
        fontFamily: fonts.display,
      }}
    >
      <div style={{ fontSize: 48, fontWeight: 600, opacity: 0.8 }}>
        SCENE {scene}
      </div>
      <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1 }}>
        {title}
      </div>
      <div
        style={{
          fontSize: 64,
          fontWeight: 800,
          color: colors.yellow,
          whiteSpace: "pre-line",
        }}
      >
        {onScreenText}
      </div>
      <div style={{ fontFamily: fonts.body, fontSize: 44, opacity: 0.8 }}>
        {frame} / {durationInFrames} f · {(frame / fps).toFixed(2)} s
      </div>
    </AbsoluteFill>
  );
};
