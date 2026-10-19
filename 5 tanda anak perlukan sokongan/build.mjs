#!/usr/bin/env node
// =====================================================================
//  5 TANDA ANAK PERLUKAN SOKONGAN MEMBACA — HyperFrames build script
//  node build.mjs            -> tulis index.html + jana audio (SFX & muzik)
//  node build.mjs --no-audio -> tulis index.html sahaja (lebih laju)
//
//  Semua DATA yang boleh diubah ada di bahagian atas fail ini:
//    VIDEO, SCENES, TRANSITIONS, T (masa kata kunci), SUBS, SFX, MIX.
//  Komponen visual ada dalam src/ (scenes.html, styles.css, timeline.js).
// =====================================================================
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------
// 1. VIDEO
// ---------------------------------------------------------------------
export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
  duration: 41.0, // voice over = 40.908 s (+3 frame hold)
  voiceover: "assets/voiceover.mp3",
  voDuration: 40.908,
};

// ---------------------------------------------------------------------
// 2. SCENES — urutan babak. Sempadan babak = masa transition (TRANSITIONS).
// ---------------------------------------------------------------------
export const SCENES = ["hook", "title", "t1", "t2", "t3", "t4", "t5", "reassure", "hope", "cta"];

// Transition antara babak berturutan. `at` = titik tengah transition.
//   whip  : swipe laju dengan motion blur (antara tanda)
//   zoom  : kamera terbang masuk ke tanda soal
//   iris  : bulatan membuka (perubahan emosi)
//   push  : tolak ke atas (harapan)
export const TRANSITIONS = [
  { from: "hook", to: "title", type: "zoom", at: 4.36, dur: 0.44, tail: 0.16, origin: [785, 800] },
  { from: "title", to: "t1", type: "whip", at: 7.9, dur: 0.44 },
  { from: "t1", to: "t2", type: "whip", at: 11.25, dur: 0.44 },
  { from: "t2", to: "t3", type: "whip", at: 15.45, dur: 0.44 },
  { from: "t3", to: "t4", type: "whip", at: 18.75, dur: 0.44 },
  { from: "t4", to: "t5", type: "whip", at: 22.85, dur: 0.44 },
  { from: "t5", to: "reassure", type: "iris", at: 27.35, dur: 0.62, origin: [510, 860], rim: "#FFFFFF" },
  { from: "reassure", to: "hope", type: "push", at: 31.45, dur: 0.5 },
  { from: "hope", to: "cta", type: "iris", at: 37.72, dur: 0.62, origin: [510, 600], rim: "#FFD23F" },
];

// ---------------------------------------------------------------------
// 3. T — masa kata kunci (saat, ikut voice over). Dikesan dengan
//    ffmpeg silencedetect + envelope tenaga + kiraan suku kata.
// ---------------------------------------------------------------------
export const T = {
  // HOOK
  anak: 0.02, dah: 0.42, besar: 0.9,
  tapi: 2.0, masih: 2.22, susah: 2.54, nak: 2.78, membaca: 3.0,
  // TAJUK
  ini: 4.64, lima: 4.98, tanda: 5.36, dia: 5.9, sokongan: 6.55, titleEnd: 7.32,
  // TANDA 1
  n1: 8.1, lari: 9.38, bila: 9.62, buku: 10.22,
  // TANDA 2
  n2: 11.47, meneka: 12.4, perkataan: 13.0, bukan2: 14.07, membaca2: 14.4,
  // TANDA 3
  n3: 15.84, keliru: 16.9, huruf: 17.44, bunyi: 17.78,
  // TANDA 4
  n4: 19.08, bacaSikit: 19.86, sikit: 20.2, penat: 21.75,
  // TANDA 5
  n5: 23.29, yakin5: 24.55, baca5: 25.91, depanOrang: 26.14,
  // REASSURANCE
  makAyah: 27.95, ini2: 29.02, bukan: 29.38, bermakna: 29.74, anakAwak: 30.28, lemah: 30.8,
  // HARAPAN
  setiap: 31.71, rentak: 32.85, dengan: 34.3, sokongan2: 34.6, betul: 35.22, mula: 36.38, yakin: 37.15,
  // CTA
  nakTips: 37.98, tips: 38.25, parenting: 38.48, ringkas: 39.06, follow: 39.68, minda: 40.03, optima: 40.38,
};

// ---------------------------------------------------------------------
// 4. SUBS — subtitle (ejaan skrip asal). kw = kata kunci jadi KUNING pada masa t.
//    Hook (0–3.9s) guna teks kinetik besar sebagai kapsyen; CTA tiada subtitle.
// ---------------------------------------------------------------------
export const SUBS = [
  { start: 4.64, end: 5.9, text: "Ini lima tanda", kw: [["lima", T.lima], ["tanda", T.tanda]] },
  { start: 5.9, end: 7.45, text: "dia perlukan sokongan.", kw: [["sokongan.", T.sokongan]] },
  { start: 8.1, end: 8.8, text: "Satu." },
  { start: 9.09, end: 10.95, text: "Anak lari bila nampak buku.", kw: [["lari", T.lari], ["buku.", T.buku]] },
  { start: 11.47, end: 12.1, text: "Dua." },
  { start: 12.27, end: 13.9, text: "Dia meneka perkataan...", kw: [["meneka", T.meneka]] },
  { start: 13.95, end: 15.15, text: "bukan membaca.", kw: [["membaca.", T.membaca2]] },
  { start: 15.84, end: 16.45, text: "Tiga." },
  { start: 16.59, end: 18.45, text: "Dia keliru huruf dan bunyi.", kw: [["keliru", T.keliru], ["bunyi.", T.bunyi]] },
  { start: 19.08, end: 19.7, text: "Empat." },
  { start: 19.86, end: 21.3, text: "Baca sikit je...", kw: [["sikit", T.sikit]] },
  { start: 21.4, end: 22.5, text: "dah penat.", kw: [["penat.", T.penat]] },
  { start: 23.29, end: 23.95, text: "Lima." },
  { start: 24.18, end: 25.4, text: "Dia tak yakin...", kw: [["yakin...", T.yakin5]] },
  { start: 25.5, end: 27.1, text: "tak nak baca depan orang.", kw: [["depan", T.depanOrang], ["orang.", T.depanOrang + 0.15]] },
  { start: 27.73, end: 28.9, text: "Tapi mak ayah...", kw: [["mak", T.makAyah], ["ayah...", T.makAyah + 0.12]] },
  { start: 29.02, end: 30.2, text: "ini bukan bermakna", kw: [["bukan", T.bukan]] },
  { start: 30.2, end: 31.35, text: "anak awak lemah.", kw: [["lemah.", T.lemah]] },
  { start: 31.71, end: 34.0, text: "Setiap anak ada rentak sendiri.", kw: [["rentak", T.rentak], ["sendiri.", T.rentak + 0.3]] },
  { start: 34.3, end: 35.65, text: "Dengan sokongan yang betul,", kw: [["sokongan", T.sokongan2], ["betul,", T.betul]] },
  { start: 35.78, end: 37.55, text: "dia boleh mula rasa yakin.", kw: [["yakin.", T.yakin]] },
];

// ---------------------------------------------------------------------
// 5. SFX — [masa, jenis, gain]. Semua dijana secara sintetik (tiada lesen).
//    jenis: whoosh, swish, pop, thud, tick, buzz, chime, ding, sparkle, click
// ---------------------------------------------------------------------
const whips = TRANSITIONS.filter((t) => t.type === "whip").map((t) => [t.at - 0.2, "whoosh", 0.75]);
export const SFX = [
  // HOOK
  [T.anak, "thud", 0.55], [T.dah, "pop", 0.45], [T.besar, "thud", 0.5], [T.besar + 0.05, "tick", 0.3],
  [1.2, "pop", 0.4], [1.55, "pop", 0.35],
  [T.tapi, "tick", 0.25], [T.membaca, "thud", 0.8], [T.membaca + 0.14, "swish", 0.55],
  // ZOOM → TAJUK
  [4.15, "whoosh", 0.8], [T.lima, "thud", 0.9], [T.tanda, "pop", 0.5], [T.dia, "tick", 0.25],
  [T.sokongan, "swish", 0.6],
  [6.85, "tick", 0.35, 1.0], [6.95, "tick", 0.35, 1.12], [7.05, "tick", 0.35, 1.25], [7.15, "tick", 0.35, 1.4], [7.25, "tick", 0.35, 1.55],
  [7.4, "swish", 0.45],
  ...whips,
  // TANDA 1
  [T.n1, "thud", 0.75], [T.lari, "swish", 0.55], [T.bila, "pop", 0.45], [T.buku, "buzz", 0.5],
  // TANDA 2
  [T.n2, "thud", 0.75],
  [T.meneka, "tick", 0.3, 1.0], [T.meneka + 0.08, "tick", 0.3, 1.1], [T.meneka + 0.16, "tick", 0.3, 1.2],
  [T.meneka + 0.24, "tick", 0.3, 1.3], [T.meneka + 0.32, "tick", 0.3, 1.4], [T.meneka + 0.4, "tick", 0.3, 1.5],
  [12.95, "click", 0.35], [13.1, "click", 0.35], [13.25, "click", 0.35], [13.4, "click", 0.35],
  [13.5, "pop", 0.5], [T.bukan2, "buzz", 0.5],
  // TANDA 3
  [T.n3, "thud", 0.75], [T.keliru, "swish", 0.45], [T.keliru + 0.28, "swish", 0.4], [T.huruf, "pop", 0.35],
  [T.bunyi, "pop", 0.5], [T.bunyi + 0.12, "ding", 0.25, 0.8], [T.bunyi + 0.3, "ding", 0.25, 0.6],
  // TANDA 4
  [T.n4, "thud", 0.75], [20.25, "tick", 0.35, 0.95], [20.6, "tick", 0.35, 0.85], [20.95, "tick", 0.35, 0.75], [21.3, "tick", 0.35, 0.65],
  [T.penat, "buzz", 0.45],
  // TANDA 5
  [T.n5, "thud", 0.8], [T.yakin5, "buzz", 0.35], [T.baca5, "pop", 0.4],
  [T.depanOrang, "pop", 0.35, 1.1], [T.depanOrang + 0.16, "pop", 0.35, 1.25], [T.depanOrang + 0.32, "pop", 0.35, 1.4],
  // REASSURANCE
  [27.05, "whoosh", 0.55], [T.makAyah, "pop", 0.4], [T.bukan, "tick", 0.3], [T.anakAwak, "pop", 0.4],
  [T.lemah, "thud", 0.6], [T.lemah + 0.16, "swish", 0.55], [31.12, "chime", 0.4],
  // HARAPAN
  [31.2, "whoosh", 0.65], [32.5, "ding", 0.35, 1.0], [33.1, "ding", 0.35, 1.26], [33.6, "ding", 0.35, 1.5],
  [T.rentak, "pop", 0.35],
  [T.sokongan2, "pop", 0.45], [T.betul, "ding", 0.35, 1.0],
  [35.3, "tick", 0.4, 1.0], [35.65, "tick", 0.4, 1.12], [36.0, "tick", 0.4, 1.26], [36.35, "tick", 0.4, 1.4], [36.7, "tick", 0.4, 1.6],
  [T.yakin, "chime", 0.6], [T.yakin + 0.05, "sparkle", 0.4],
  // CTA
  [37.45, "whoosh", 0.6], [37.85, "pop", 0.55], [T.tips, "tick", 0.3], [38.55, "pop", 0.45], [38.95, "pop", 0.45],
  [T.follow, "pop", 0.55], [T.minda, "click", 0.5], [T.optima, "chime", 0.65], [T.optima + 0.05, "sparkle", 0.35],
];

// ---------------------------------------------------------------------
// 6. MIX — voice over SENTIASA 1.0 (tidak diubah).
// ---------------------------------------------------------------------
export const MIX = {
  voice: 1.0,
  sfx: 0.22, // gain keseluruhan SFX
  music: 0.7, // gain muzik latar (0 = tiada muzik)
  musicDuck: 0.32, // gain muzik semasa suara aktif (sidechain duck)
};

// =====================================================================
//  GENERATOR (tidak perlu diubah untuk tukar masa/teks)
// =====================================================================
function sceneWindows() {
  const win = {};
  SCENES.forEach((id, i) => {
    const tin = TRANSITIONS.find((t) => t.to === id);
    const tout = TRANSITIONS.find((t) => t.from === id);
    const start = tin ? tin.at - tin.dur / 2 - 0.02 : 0;
    const end = tout ? tout.at + tout.dur / 2 + (tout.tail || 0) + 0.02 : VIDEO.duration;
    win[id] = { start: +start.toFixed(3), end: +end.toFixed(3), dur: +(end - start).toFixed(3), track: 1 + (i % 2) };
  });
  return win;
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function subsMarkup() {
  return SUBS.map((s, i) => {
    const kw = new Map((s.kw || []).map(([w, t]) => [w.toLowerCase(), t]));
    const words = s.text.split(" ").map((w) => {
      const t = kw.get(w.toLowerCase());
      return t !== undefined
        ? `<span class="sw kw" data-t="${t}">${escapeHtml(w)}</span>`
        : `<span class="sw">${escapeHtml(w)}</span>`;
    });
    return `<div class="sub" id="sub-${i}"><div class="sub-in">${words.join(" ")}</div></div>`;
  }).join("\n      ");
}

function ringShadow(r, color) {
  const out = [];
  for (let a = 0; a < 16; a++) {
    const ang = (a / 16) * Math.PI * 2;
    out.push(`${(Math.cos(ang) * r).toFixed(1)}px ${(Math.sin(ang) * r).toFixed(1)}px 0 ${color}`);
  }
  return out.join(", ");
}

function buildHtml() {
  const win = sceneWindows();
  let scenes = fs.readFileSync(path.join(ROOT, "src/scenes.html"), "utf8");
  scenes = scenes.replace(/\{\{S:(\w+)\}\}/g, (_, id) => {
    const w = win[id];
    if (!w) throw new Error("Unknown scene " + id);
    return `data-start="${w.start}" data-duration="${w.dur}" data-track-index="${w.track}"`;
  });
  scenes = scenes.replace("{{SUBS}}", subsMarkup());
  const ctaStart = win.cta.start;
  scenes = scenes.replace(/\{\{SUBS_WINDOW\}\}/g, `data-start="4.5" data-duration="${(ctaStart - 4.5).toFixed(3)}" data-track-index="4"`);
  scenes = scenes.replace(/\{\{TOPBAR_WINDOW\}\}/g, `data-start="0" data-duration="${(ctaStart + 0.4).toFixed(3)}" data-track-index="5"`);
  scenes = scenes.replace(/\{\{FULL\}\}/g, `data-start="0" data-duration="${VIDEO.duration}"`);

  let css = fs.readFileSync(path.join(ROOT, "src/styles.css"), "utf8");
  css = css.replace("/*SUB_RING*/", ringShadow(6, "#071233"));
  const js = fs.readFileSync(path.join(ROOT, "src/timeline.js"), "utf8");

  const cfg = { VIDEO, T, TRANSITIONS, SUBS: SUBS.map(({ start, end }) => ({ start, end })), WIN: win };
  const hasMusic = MIX.music > 0;

  const html = `<!doctype html>
<!-- DIJANA OLEH build.mjs — jangan edit terus; ubah build.mjs / src/* dan jalankan: node build.mjs -->
<html lang="ms">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${VIDEO.width}, height=${VIDEO.height}" />
    <title>5 Tanda Anak Perlukan Sokongan Membaca — Minda Optima</title>
    <script src="assets/vendor/gsap.min.js"></script>
    <style>
${css}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-width="${VIDEO.width}" data-height="${VIDEO.height}" data-duration="${VIDEO.duration}">
      <audio id="vo" src="${VIDEO.voiceover}" data-start="0" data-duration="${VIDEO.voDuration}" data-track-index="10" data-volume="${MIX.voice}"></audio>
      <audio id="sfx" src="assets/audio/sfx.wav" data-start="0" data-duration="${VIDEO.duration}" data-track-index="11" data-volume="1"></audio>
${hasMusic ? `      <audio id="music" src="assets/audio/music.wav" data-start="0" data-duration="${VIDEO.duration}" data-track-index="12" data-volume="1"></audio>\n` : ""}
${scenes}
    </div>
    <script>
      window.CFG = ${JSON.stringify(cfg)};
    </script>
    <script>
${js}
    </script>
  </body>
</html>
`;
  fs.writeFileSync(path.join(ROOT, "index.html"), html);
  console.log("✓ index.html");
  for (const id of SCENES) console.log(`  ${id.padEnd(9)} ${win[id].start.toFixed(2)} → ${win[id].end.toFixed(2)}`);
}

async function buildAudio() {
  const { renderSfxTrack, renderMusicTrack } = await import("./src/audio.mjs");
  fs.mkdirSync(path.join(ROOT, "assets/audio"), { recursive: true });
  renderSfxTrack(SFX, VIDEO.duration, MIX.sfx, path.join(ROOT, "assets/audio/sfx.wav"));
  console.log("✓ assets/audio/sfx.wav (" + SFX.length + " cue)");
  if (MIX.music > 0) {
    renderMusicTrack({
      duration: VIDEO.duration,
      gain: MIX.music,
      duck: MIX.musicDuck,
      voicePath: path.join(ROOT, VIDEO.voiceover),
      softFrom: TRANSITIONS.find((t) => t.to === "reassure").at,
      softTo: TRANSITIONS.find((t) => t.to === "hope").at,
      out: path.join(ROOT, "assets/audio/music.wav"),
    });
    console.log("✓ assets/audio/music.wav (ducked under voice)");
  }
}

buildHtml();
if (!process.argv.includes("--no-audio")) await buildAudio();
