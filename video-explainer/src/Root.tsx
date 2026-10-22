import React from "react";
import { Composition } from "remotion";
import { Explainer } from "./Explainer";
import timing from "./timing.json";

export const Root: React.FC = () => (
  <Composition
    id="Explainer"
    component={Explainer}
    durationInFrames={Math.ceil(timing.end * timing.fps)}
    fps={timing.fps}
    width={1080}
    height={1920}
  />
);
