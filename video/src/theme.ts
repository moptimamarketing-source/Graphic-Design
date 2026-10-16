import "@fontsource/baloo-2/600.css";
import "@fontsource/baloo-2/800.css";
import "@fontsource/nunito/700.css";
import "@fontsource/nunito/900.css";

// Sampled from public/assets/logo-minda-optima.png
export const colors = {
  brandBlue: "#0B6CB4", // "MINDA OPTIMA" letters
  skyBlue: "#00A8E4", // logo circle
  red: "#E41824", // "OPTIMA" letters / dots
  yellow: "#F5B21E", // warm accent (logo "A" / book)
  orange: "#F09024", // logo book
  green: "#78C03C", // logo shirt (sparingly)
  cream: "#FFF8EC", // warm paper background
  white: "#FFFFFF",
  ink: "#163A5F", // dark navy for outlines and captions
};

export const fonts = {
  display: "'Baloo 2', sans-serif", // headlines, checklist
  body: "'Nunito', sans-serif", // subtitles
};

export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
  // Voice-over is 60.0816 s; 1803 frames (60.10 s) keeps the last syllable.
  durationInFrames: 1803,
};

// UI-safe area for TikTok / Reels / Shorts overlays.
export const SAFE = {
  side: 90,
  top: 220,
  bottom: 380,
};
