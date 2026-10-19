// All timings are measured from public/assets/voiceover-fatimah.mp3
// (see docs/STORYBOARD.md). Frames are at 30 fps.

export const FPS = 30;
export const TOTAL_FRAMES = 1803;
export const TRANSITION = 16;

export const f = (seconds: number) => Math.round(seconds * FPS);

// Scene cuts, each in the middle of a pause between phrases.
export const CUTS = [219, 498, 584, 696, 855, 1044, 1291];

// Absolute frame where each scene's local frame 0 sits. Transitions are
// centred on the cut, so a scene starts TRANSITION/2 frames before it.
export const SCENE_START = [0, 211, 490, 576, 688, 847, 1036, 1283];

// The HyperFrames ending (hyperframes/index.html) starts here, on white.
export const ENDING_START = 1635;

// Spoken phrase blocks: onset and end in seconds.
export const PHRASES = [
  [0.19, 0.85], // P1  Parents,
  [1.11, 2.26], // P2  anak nak masuk
  [2.63, 7.22], // P3  Tahun 1 tahun depan, tapi masih belum lancar membaca?
  [7.41, 8.53], // P4  Jangan panik dulu.
  [8.96, 9.73], // P5  Sebenarnya,
  [9.92, 15.15], // P6  persediaan ke Tahun 1 bukan sekadar kenal ABC tau. Cuba tengok
  [15.38, 16.38], // P7  3 perkara ni.
  [16.8, 19.38], // P8  Pertama, anak boleh ikut arahan mudah.
  [19.57, 22.99], // P9  Kedua, anak boleh fokus pada satu aktiviti.
  [23.44, 24.19], // P10 Ketiga,
  [24.59, 28.29], // P11 anak berani cuba membaca walaupun takut salah.
  [28.7, 31.19], // P12 Kalau anak masih belum kuasai semuanya,
  [31.54, 34.65], // P13 jangan terus bandingkan dengan anak orang lain.
  [34.97, 39.5], // P14 Mulakan dengan aktiviti membaca yang ringkas dan menyeronokkan.
  [39.95, 42.85], // P15 Puji setiap usaha kecil mereka.
  [43.21, 44.91], // P16 Sebab setiap anak belajar
  [45.12, 47.35], // P17 mengikut kemampuan masing-masing.
  [47.76, 48.68], // P18 Ingat, parents.
  [49.0, 51.39], // P19 Kita bukan sekadar nak anak pandai membaca.
  [51.86, 54.34], // P20 Kita nak mereka yakin untuk belajar.
  [54.66, 55.87], // P21 Minda Optima,
  [56.23, 59.8], // P22 sejak 1995.
] as const;

// The voice is cut in the pause after P20; P21–P22 ("Minda Optima, sejak
// 1995") are not used. The end card is carried by the music instead.
export const VO_END = 1636;

// Music: 101 BPM, one beat = 17.82 frames; its big hit is at 54.65 s.
export const MUSIC_BEAT = (60 / 101) * FPS;

// Absolute frame where phrase n (1-based) starts.
export const P = (n: number) => f(PHRASES[n - 1][0]);

// Key words inside phrases, located from loudness dips in the recording.
export const BEATS = {
  nak: f(1.45),
  tahun1: f(2.85),
  belumLancar: f(5.35),
  janganPanik: P(4),
  bukanSekadar: f(11.6),
  letterA: f(13.3),
  letterB: f(13.6),
  letterC: f(13.9),
  tigaPerkara: P(7),
  ikutArahan: f(18.3),
  fokus: f(20.75),
  ketiga: P(10),
  beraniCuba: f(25.0),
  bandingkan: f(32.75),
  ringkas: f(37.9),
  menyeronokkan: f(38.6),
  puji: P(15),
  usahaKecil: f(40.9),
  kemampuan: f(45.6),
  ingat: P(18),
  pandaiMembaca: f(50.4),
  yakin: f(52.95),
  mindaOptima: P(21), // logo lands with the music hit (no longer spoken)
  sejak1995: P(21) + 36, // two music beats later
  speechEnd: f(59.8),
};
