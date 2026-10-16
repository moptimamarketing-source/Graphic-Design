import { Composition } from "remotion";
import { MindaOptimaEp08 } from "./MindaOptimaEp08";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MindaOptimaEp08"
        component={MindaOptimaEp08}
        durationInFrames={1803}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
