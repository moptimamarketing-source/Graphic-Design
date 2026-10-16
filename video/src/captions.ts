// Subtitle pages, transcribed from the master voice-over and timed to the
// measured phrase blocks in timing.ts. `hi` lists words shown in yellow.
// Wording to confirm against the original ElevenLabs script: the recording
// sounds like "anak nak masuk dan Tahun 1"; page 1–2 omit that "dan".

export type CaptionPage = {
  text: string;
  start: number; // seconds
  end: number; // seconds
  hi?: string[];
};

export const CAPTIONS: CaptionPage[] = [
  { text: "Parents, anak nak masuk", start: 0.19, end: 2.4, hi: ["Parents,"] },
  { text: "Tahun 1 tahun depan,", start: 2.63, end: 4.3, hi: ["Tahun", "1"] },
  {
    text: "tapi masih belum lancar membaca?",
    start: 4.35,
    end: 7.25,
    hi: ["belum", "lancar", "membaca?"],
  },
  { text: "Jangan panik dulu.", start: 7.41, end: 8.7, hi: ["Jangan", "panik"] },
  {
    text: "Sebenarnya, persediaan ke Tahun 1",
    start: 8.96,
    end: 11.55,
    hi: ["persediaan"],
  },
  {
    text: "bukan sekadar kenal ABC tau.",
    start: 11.6,
    end: 14.4,
    hi: ["bukan", "sekadar", "ABC"],
  },
  { text: "Cuba tengok 3 perkara ni.", start: 14.45, end: 16.5, hi: ["3", "perkara"] },
  {
    text: "Pertama, anak boleh ikut arahan mudah.",
    start: 16.8,
    end: 19.45,
    hi: ["Pertama,", "ikut", "arahan"],
  },
  {
    text: "Kedua, anak boleh fokus pada satu aktiviti.",
    start: 19.57,
    end: 23.2,
    hi: ["Kedua,", "fokus"],
  },
  {
    text: "Ketiga, anak berani cuba membaca",
    start: 23.44,
    end: 26.6,
    hi: ["Ketiga,", "berani", "cuba"],
  },
  { text: "walaupun takut salah.", start: 26.65, end: 28.45 },
  {
    text: "Kalau anak masih belum kuasai semuanya,",
    start: 28.7,
    end: 31.4,
  },
  {
    text: "jangan terus bandingkan dengan anak orang lain.",
    start: 31.54,
    end: 34.8,
    hi: ["jangan", "bandingkan"],
  },
  {
    text: "Mulakan dengan aktiviti membaca",
    start: 34.97,
    end: 37.55,
    hi: ["aktiviti", "membaca"],
  },
  {
    text: "yang ringkas dan menyeronokkan.",
    start: 37.6,
    end: 39.75,
    hi: ["ringkas", "menyeronokkan."],
  },
  {
    text: "Puji setiap usaha kecil mereka.",
    start: 39.95,
    end: 43.0,
    hi: ["Puji", "usaha", "kecil"],
  },
  { text: "Sebab setiap anak belajar", start: 43.21, end: 45.0 },
  {
    text: "mengikut kemampuan masing-masing.",
    start: 45.12,
    end: 47.6,
    hi: ["kemampuan", "masing-masing."],
  },
  { text: "Ingat, parents.", start: 47.76, end: 48.9, hi: ["Ingat,"] },
  {
    text: "Kita bukan sekadar nak anak pandai membaca.",
    start: 49.0,
    end: 51.7,
    hi: ["pandai", "membaca."],
  },
  {
    text: "Kita nak mereka yakin untuk belajar.",
    start: 51.86,
    end: 54.5,
    hi: ["yakin"],
  },
  { text: "Minda Optima,", start: 54.66, end: 56.1, hi: ["Minda", "Optima,"] },
  { text: "sejak 1995.", start: 56.23, end: 59.95, hi: ["1995."] },
];
