import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Boy } from "./characters/Boy";
import { Mother } from "./characters/Mother";
import { colors, fonts } from "./theme";

// Reference sheet for checking the cast stays consistent across poses.
export const CharacterSheet: React.FC = () => {
  const frame = useCurrentFrame();
  const label = (x: number, y: number, t: string) => (
    <text x={x} y={y} textAnchor="middle" fontFamily={fonts.body} fontWeight={900} fontSize={30} fill={colors.ink}>
      {t}
    </text>
  );
  return (
    <AbsoluteFill style={{ backgroundColor: colors.white }}>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%">
        <Mother x={180} y={760} scale={1.1} />
        <Mother x={540} y={760} scale={1.1} expression="joy" mouthOpen={0.7} armR={70} elbowR={40} headTilt={-6} />
        <Mother x={900} y={760} scale={1.1} expression="concerned" armL={30} elbowL={70} thumbUpR armR={20} elbowR={140} />
        {label(180, 820, "warm")}
        {label(540, 820, "joy + talking")}
        {label(900, 820, "concerned / thumbs up")}
        <Boy x={150} y={1340} scale={1.05} outfit="school" bag expression="worried" />
        <Boy x={420} y={1340} scale={1.05} outfit="home" expression="proud" armR={150} elbowR={10} headTilt={6} />
        <Boy x={680} y={1340} scale={1.05} outfit="home" expression="focus" lookY={0.8} armL={-10} elbowL={-60} armR={-10} elbowR={-60} />
        <Boy x={940} y={1340} scale={1.05} outfit="school" bag expression="happy" walk={frame / 4} />
        {label(150, 1400, "worried")}
        {label(420, 1400, "proud / wave")}
        {label(680, 1400, "focus")}
        {label(940, 1400, "walk")}
        <Boy x={300} y={1880} scale={1.05} expression="surprised" lookX={-1} />
        <Boy x={780} y={1880} scale={1.05} expression="happy" mouthOpen={0.8} />
      </svg>
    </AbsoluteFill>
  );
};
