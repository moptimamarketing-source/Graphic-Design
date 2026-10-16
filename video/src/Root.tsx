import { Composition, Folder, Still } from "remotion";
import { CharacterSheet } from "./CharacterSheet";
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
      <Folder name="Reference">
        <Still id="CharacterSheet" component={CharacterSheet} width={1080} height={1920} />
      </Folder>
    </>
  );
};
