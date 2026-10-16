import { useCurrentFrame, useVideoConfig } from "remotion";
import { SCENE_START } from "../timing";

// Scene clock: local frame, absolute composition frame, and a converter
// from absolute beat frames (timing.ts) to this scene's local frames.
export const useSceneClock = (scene: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = SCENE_START[scene - 1];
  return {
    frame,
    fps,
    abs: frame + start,
    L: (absFrame: number) => absFrame - start,
  };
};
