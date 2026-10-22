import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Font disimpan dalam public/fonts (Google Fonts, lesen OFL) supaya render tak perlu internet.
const fonts: [string, string, string][] = [
  ["Anton", "Anton.woff2", "400"],
  ["Archivo Black", "ArchivoBlack.woff2", "400"],
  ["Black Ops One", "BlackOpsOne.woff2", "400"],
  ["Caveat", "Caveat.woff2", "400 700"],
  ["Inter", "Inter.woff2", "100 900"],
  ["Playfair Display", "PlayfairDisplay.woff2", "400 900"],
  ["Silkscreen", "Silkscreen-400.woff2", "400"],
  ["Silkscreen", "Silkscreen-700.woff2", "700"],
];

for (const [family, file, weight] of fonts) {
  loadFont({ family, url: staticFile(`fonts/${file}`), weight, format: "woff2" });
}

export const F = {
  anton: "Anton",
  heavy: "Archivo Black",
  stencil: "Black Ops One",
  hand: "Caveat",
  inter: "Inter",
  serif: "Playfair Display",
  pixel: "Silkscreen",
};
