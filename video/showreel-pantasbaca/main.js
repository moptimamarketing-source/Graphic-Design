// Pantas Baca — 15s motion showreel (1080x1920 @ 30fps)
// Every animation is a pure function of time t (seconds), so frames render deterministically.
// Music is 120 BPM: 1 beat = 0.5s = 15 frames. Timeline constants mirror music.py.
import * as THREE from 'three';
import { TTFLoader } from 'three/addons/loaders/TTFLoader.js';
import { Font } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const W = 1080, H = 1920, FPS = 30;
const SUB = +(new URLSearchParams(location.search).get('sub') || 2); // motion-blur subframes
const C = {
  night: '#060A1C', navy: '#0B1640', blue: '#1D4ED8', sky: '#3B82F6',
  yellow: '#FFC83D', orange: '#F59E0B', pink: '#FF3D7F', cyan: '#22D3EE', white: '#F8FAFC',
};

// ---------- timeline (mirrors music.py) ----------
const KICKS = [];
for (let b = 2.0; b < 12.0; b += 0.5) if (b < 7.5 || b >= 8.0) KICKS.push(b);
for (let b = 12.0; b <= 14.0; b += 0.5) KICKS.push(b);
const IMPACTS = [[0.5, 0.35], [2.0, 1], [4.0, 0.5], [6.0, 0.6], [8.0, 0.9], [10.0, 0.7], [12.0, 1.2], [14.5, 0.5]];

// ---------- math ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  outExpo: x => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  inExpo: x => (x <= 0 ? 0 : Math.pow(2, 10 * x - 10)),
  inOutExpo: x => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2),
  outCubic: x => 1 - Math.pow(1 - x, 3),
  inCubic: x => x * x * x,
  inOutCubic: x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  outQuint: x => 1 - Math.pow(1 - x, 5),
  outBack: (x, s = 1.70158) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2),
  outElastic: x => (x <= 0 ? 0 : x >= 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * (2 * Math.PI) / 3) + 1),
};
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const hash = n => { const r = rng(Math.floor(n) * 9973 + 17); return r(); };
const pulse = (t, times, decay) => { let v = 0; for (const tt of times) { const s = Array.isArray(tt) ? tt[0] : tt, a = Array.isArray(tt) ? tt[1] : 1; if (t >= s) v = Math.max(v, a * Math.exp(-(t - s) / decay)); } return v; };
const attack = (t, times, d) => { let v = 0; for (const s of times) v = Math.max(v, t < s ? 0 : Math.min(1, (t - s) / 0.03) * Math.exp(-(t - s) / d)); return v; };
const kickEnv = t => attack(t, KICKS, 0.11);
const impactEnv = t => pulse(t, IMPACTS, 0.18);

// ---------- canvases ----------
const out = document.getElementById('out');
const octx = out.getContext('2d');
const mk = (w = W, h = H) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const buf = mk(), bctx = buf.getContext('2d');
const tmp = mk(), tctx = tmp.getContext('2d');
const chan = [mk(), mk(), mk()];

// ---------- 2D helpers ----------
function font(ctx, size, fam = 'Anton', weight = '') { ctx.font = `${weight} ${size}px ${fam}`.trim(); }
function text(ctx, s, x, y, o = {}) {
  ctx.save();
  font(ctx, o.size || 100, o.fam || 'Anton', o.weight || '');
  ctx.letterSpacing = `${o.ls || 0}px`;
  ctx.textAlign = o.align || 'center';
  ctx.textBaseline = o.base || 'alphabetic';
  ctx.globalAlpha *= o.alpha ?? 1;
  if (o.glow) { ctx.shadowColor = o.glowColor || o.color; ctx.shadowBlur = o.glow; }
  if (o.stroke) { ctx.lineWidth = o.lw || 3; ctx.strokeStyle = o.stroke; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); }
  if (o.color) { ctx.fillStyle = o.color; ctx.fillText(s, x, y); }
  ctx.restore();
}
function layoutChars(ctx, s, size, fam = 'Anton', weight = '', ls = 0) {
  ctx.save(); font(ctx, size, fam, weight); ctx.letterSpacing = '0px';
  const chars = [...s], ws = chars.map(c => ctx.measureText(c).width); ctx.restore();
  const total = ws.reduce((a, b) => a + b, 0) + ls * (chars.length - 1);
  let x = -total / 2;
  return { total, chars: chars.map((ch, i) => { const cx = x + ws[i] / 2; x += ws[i] + ls; return { ch, cx, w: ws[i] }; }) };
}
// Text that slides up out of a mask (classic title reveal). p: 0..1
function reveal(ctx, s, x, y, size, p, o = {}) {
  if (p <= 0) return;
  ctx.save();
  font(ctx, size, o.fam || 'Anton', o.weight || '');
  ctx.letterSpacing = `${o.ls || 0}px`;
  const w = ctx.measureText(s).width;
  const left = o.align === 'left' ? x : o.align === 'right' ? x - w : x - w / 2;
  ctx.beginPath(); ctx.rect(left - 40, y - size * 1.05, w + 80, size * 1.3); ctx.clip();
  const e = E.outExpo(p);
  text(ctx, s, x, y + (1 - e) * size * 1.15, { ...o, size });
  ctx.restore();
}
function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function label(ctx, s, y, p, color = C.white, x = 90) {
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(p * 3);
  const e = E.outExpo(p);
  ctx.fillStyle = color; ctx.fillRect(x, y - 12, 60 * e, 4);
  text(ctx, s, x + 80 + (1 - e) * 40, y, { size: 30, fam: 'Grotesk', weight: 500, ls: 8, color, align: 'left', base: 'middle' });
  ctx.restore();
}
function marquee(ctx, s, y, size, speed, t, angle, o) {
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(angle); ctx.translate(-W / 2, -H / 2);
  font(ctx, size, 'Anton'); ctx.letterSpacing = '0px';
  const w = ctx.measureText(s).width;
  let x0 = -W - (((t * speed) % w) + w) % w;
  for (let x = x0; x < W * 2; x += w) text(ctx, s, x, y, { ...o, size, align: 'left' });
  ctx.restore();
}
function cross(ctx, x, y, r, rot, color, lw = 6) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.moveTo(0, -r); ctx.lineTo(0, r); ctx.stroke(); ctx.restore();
}
function radialBg(ctx, c1, c2, cx = W / 2, cy = H / 2, r = 1300) {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, c1); g.addColorStop(1, c2);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function bottomShade(ctx, y0, a = 0.85, color = '6,10,28') {
  const g = ctx.createLinearGradient(0, y0, 0, H); g.addColorStop(0, `rgba(${color},0)`); g.addColorStop(1, `rgba(${color},${a})`);
  ctx.fillStyle = g; ctx.fillRect(0, y0, W, H - y0);
}

// ---------- post FX ----------
function chroma(ctx, src, amt) {
  const cols = ['#ff0000', '#00ff00', '#0000ff'], offs = [[-amt, 0], [0, 0], [amt, amt * 0.3]];
  chan.forEach((c, i) => {
    const x = c.getContext('2d'); x.globalCompositeOperation = 'source-over';
    x.drawImage(src, offs[i][0], offs[i][1]);
    x.globalCompositeOperation = 'multiply'; x.fillStyle = cols[i]; x.fillRect(0, 0, W, H);
  });
  ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'lighter'; chan.forEach(c => ctx.drawImage(c, 0, 0)); ctx.restore();
}
function slices(ctx, src, amt, t) {
  const r = rng(Math.floor(t * 30) * 31 + 7);
  ctx.drawImage(src, 0, 0);
  const n = 7 + Math.floor(r() * 6);
  for (let i = 0; i < n; i++) {
    const y = r() * H, h = 20 + r() * 160, dx = (r() - 0.5) * 2 * amt;
    ctx.drawImage(src, 0, y, W, h, dx, y, W, h);
  }
}
function zoomBlur(ctx, src, amt, cx = W / 2, cy = H / 2) {
  ctx.drawImage(src, 0, 0);
  const n = 7;
  for (let i = 1; i <= n; i++) {
    const s = 1 + amt * (i / n);
    ctx.save(); ctx.globalAlpha = 1 / (i + 1);
    ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy); ctx.drawImage(src, 0, 0); ctx.restore();
  }
}
const grains = [];
function makeGrain() {
  for (let k = 0; k < 8; k++) {
    const c = mk(540, 960), x = c.getContext('2d'), d = x.createImageData(540, 960), r = rng(k + 101);
    for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (r() - 0.5) * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    x.putImageData(d, 0, 0); grains.push(c);
  }
}
let vignette;
function makeVignette() {
  vignette = mk(); const x = vignette.getContext('2d');
  const g = x.createRadialGradient(W / 2, H / 2, H * 0.32, W / 2, H / 2, H * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.55)');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
}

// ---------- three.js ----------
const glCanvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.9;
const pmrem = new THREE.PMREMGenerator(renderer);
const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
const composer = new EffectComposer(renderer, rt);
composer.setPixelRatio(1); composer.setSize(W, H);
const renderPass = new RenderPass(new THREE.Scene(), new THREE.PerspectiveCamera());
const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.3, 0.4, 0.95);
composer.addPass(renderPass); composer.addPass(bloom); composer.addPass(new OutputPass());
function render3D(scene, camera, strength = 0.8, threshold = 0.82) {
  scene.environmentIntensity = scene.userData.envI ?? 0.45;
  renderPass.scene = scene; renderPass.camera = camera; bloom.strength = strength * 0.35; bloom.threshold = Math.max(threshold, 0.95);
  composer.render();
  return glCanvas;
}
const fonts3 = {};
async function loadFont(name, url) { fonts3[name] = new Font(await new TTFLoader().loadAsync(url)); }

function glyphGeo(ch, f, size, depth) {
  const g = new TextGeometry(ch, { font: f, size, depth, curveSegments: 10, bevelEnabled: true, bevelThickness: size * 0.035, bevelSize: size * 0.022, bevelSegments: 4 });
  g.computeBoundingBox(); return g;
}
// Per-letter meshes, each pivoting on its own centre, whole word centred at origin.
function word3D(str, f, size, depth, mats, tracking = 0) {
  const group = new THREE.Group(), letters = [];
  const scale = size / f.data.resolution;
  let pen = 0;
  for (const ch of str) {
    const glyph = f.data.glyphs[ch] || f.data.glyphs['?'];
    if (ch !== ' ') {
      const g = glyphGeo(ch, f, size, depth), bb = g.boundingBox;
      const cx = (bb.min.x + bb.max.x) / 2, cy = (bb.min.y + bb.max.y) / 2, cz = (bb.min.z + bb.max.z) / 2;
      g.translate(-cx, -cy, -cz);
      const m = new THREE.Mesh(g, typeof mats === 'function' ? mats(letters.length) : mats);
      m.position.set(pen + cx, cy, 0); group.add(m); letters.push(m);
    }
    pen += glyph.ha * scale + tracking;
  }
  const box = new THREE.Box3().setFromObject(group), c = box.getCenter(new THREE.Vector3());
  letters.forEach(m => { m.position.x -= c.x; m.position.y -= c.y; m.userData.base = m.position.clone(); });
  group.userData.width = box.max.x - box.min.x; group.userData.height = box.max.y - box.min.y;
  return { group, letters };
}
const frontMat = (color, o = {}) => new THREE.MeshPhysicalMaterial({ color, metalness: o.metal ?? 0.15, roughness: o.rough ?? 0.22, clearcoat: 1, clearcoatRoughness: 0.08, emissive: o.emissive || 0x000000, emissiveIntensity: o.ei ?? 0.0 });
const sideMat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, metalness: o.metal ?? 0.55, roughness: o.rough ?? 0.3 });
function spriteTex() {
  const c = mk(64, 64), x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.3, 'rgba(255,255,255,0.6)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function dust(n, box, color, size, seed) {
  const r = rng(seed), pos = new Float32Array(n * 3), base = [];
  for (let i = 0; i < n; i++) base.push([(r() - 0.5) * box[0], (r() - 0.5) * box[1], (r() - 0.5) * box[2], 0.2 + r() * 0.8]);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const m = new THREE.PointsMaterial({ color, size, map: SPRITE, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.8 });
  const p = new THREE.Points(g, m); p.frustumCulled = false;
  p.userData.update = t => { base.forEach((b, i) => { pos[i * 3] = b[0] + Math.sin(t * 0.7 + i) * 0.15; pos[i * 3 + 1] = ((b[1] + t * 0.35 * b[3] + box[1] * 1.5) % box[1]) - box[1] / 2; pos[i * 3 + 2] = b[2]; }); g.attributes.position.needsUpdate = true; };
  return p;
}
function bgQuad(colA, colB, rayCol, rays = 0.0, center = [0.5, 0.6]) {
  const m = new THREE.ShaderMaterial({
    uniforms: { uT: { value: 0 }, uA: { value: new THREE.Color(colA) }, uB: { value: new THREE.Color(colB) }, uR: { value: new THREE.Color(rayCol) }, uRays: { value: rays }, uC: { value: new THREE.Vector2(...center) } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }',
    fragmentShader: `varying vec2 vUv; uniform float uT, uRays; uniform vec3 uA, uB, uR; uniform vec2 uC;
      void main(){ vec2 p = (vUv - uC) * vec2(0.5625, 1.0); float r = length(p); float a = atan(p.y, p.x);
        float ray = pow(max(0.0, sin(a * 12.0 + uT * 0.5)), 6.0) * smoothstep(1.1, 0.05, r);
        float ray2 = pow(max(0.0, sin(a * 7.0 - uT * 0.35 + 1.3)), 10.0) * smoothstep(1.0, 0.0, r);
        vec3 col = mix(uA, uB, smoothstep(0.0, 0.85, r)) + uR * (ray * 0.7 + ray2 * 0.5) * uRays;
        gl_FragColor = vec4(col, 1.0); }`,
    depthWrite: false, depthTest: false,
  });
  const q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), m); q.frustumCulled = false; q.renderOrder = -10; return q;
}
let SPRITE;

// ================= SCENE A — intro: 3D letters drop onto a neon grid =================
const A = {};
function buildA() {
  const s = A.scene = new THREE.Scene(); s.background = new THREE.Color(C.night); s.fog = new THREE.FogExp2(C.night, 0.045); s.environment = envTex;
  A.cam = new THREE.PerspectiveCamera(45, W / H, 0.1, 200);
  const grid = A.grid = new THREE.GridHelper(80, 80, C.cyan, C.blue); grid.position.y = -2.6;
  grid.material.transparent = true; grid.material.opacity = 0.9; s.add(grid);
  const w1 = word3D('PANTAS', fonts3.anton, 1.5, 0.55, [frontMat('#e9edf7'), sideMat(C.blue)], 0.06);
  const w2 = word3D('BACA', fonts3.anton, 1.5, 0.55, [frontMat(C.yellow, { emissive: C.orange, ei: 0.08 }), sideMat(C.orange, { metal: 0.7 })], 0.06);
  const fit = 4.4 / w1.group.userData.width;
  w1.group.scale.setScalar(fit); w2.group.scale.setScalar(fit);
  w1.group.position.y = 1.05; w2.group.position.y = -1.05;
  s.add(w1.group, w2.group);
  A.letters = [...w1.letters, ...w2.letters];
  s.add(new THREE.AmbientLight(0xffffff, 0.15));
  const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(3, 6, 8); s.add(key);
  A.p1 = new THREE.PointLight(C.pink, 25, 30); A.p2 = new THREE.PointLight(C.cyan, 25, 30); s.add(A.p1, A.p2);
  // horizon light bar (blooms)
  const bar = new THREE.Mesh(new THREE.PlaneGeometry(60, 0.08), new THREE.MeshBasicMaterial({ color: new THREE.Color(C.cyan).multiplyScalar(4) }));
  bar.position.set(0, -2.4, -30); s.add(bar);
  A.dust = dust(260, [16, 14, 16], C.sky, 0.06, 5); s.add(A.dust);
}
function drawA(ctx, t) {
  // letters drop one by one on 16th notes (0.125s)
  A.letters.forEach((m, i) => {
    const ti = 0.5 + i * 0.125 + (i >= 6 ? 0.125 : 0);
    const p = prog(t, ti, ti + 0.42), b = m.userData.base;
    m.visible = t >= ti;
    const e = E.outBack(p, 2.2);
    m.position.set(b.x, b.y + (1 - E.outCubic(p)) * 7, b.z + (1 - e) * 3);
    m.rotation.set((1 - e) * -2.4, (1 - e) * (i % 2 ? 0.8 : -0.8), 0);
    const sq = 1 + Math.sin(p * Math.PI) * 0.12; m.scale.set(1 / Math.sqrt(sq), sq, 1);
  });
  A.grid.position.z = (t * 3) % 1;
  A.p1.position.set(Math.sin(t * 2.2) * 6, 2, 4 + Math.cos(t * 2.2) * 2);
  A.p2.position.set(-Math.sin(t * 1.7) * 6, -1, 4);
  A.dust.userData.update(t);
  // camera: slow arc, then whip-dolly through the letters into the flash
  const p = prog(t, 0.4, 1.75), w = E.inExpo(prog(t, 1.72, 2.0));
  const cam = A.cam;
  cam.position.set(lerp(3.2, -1.4, E.inOutCubic(p)), lerp(-1.2, 0.5, E.inOutCubic(p)), lerp(15, 11.5, E.outCubic(p)) - w * 10.5);
  cam.fov = 45 + w * 40; cam.updateProjectionMatrix();
  cam.lookAt(0, 0, 0); cam.rotateZ(lerp(-0.06, 0.04, p) + w * 0.3);
  ctx.drawImage(render3D(A.scene, cam, 0.9 + w * 1.5, 0.8), 0, 0);
}
function sceneIntro(ctx, t) {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  if (t >= 0.45) drawA(ctx, t);
  // light-slit reveal
  const open = E.outExpo(prog(t, 0.5, 0.95));
  const gap = open * H;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H / 2 - gap / 2); ctx.fillRect(0, H / 2 + gap / 2, W, H / 2);
  const lineW = E.outExpo(prog(t, 0.0, 0.45)) * W;
  if (open < 1) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const a = 1 - open;
    for (const y of [H / 2 - gap / 2, H / 2 + gap / 2]) {
      ctx.shadowColor = C.cyan; ctx.shadowBlur = 40; ctx.fillStyle = `rgba(200,240,255,${a})`;
      ctx.fillRect(W / 2 - lineW / 2, y - 2, lineW, 4);
      ctx.save(); ctx.translate(W / 2, y); ctx.scale(1.4, 0.18);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 500); g.addColorStop(0, `rgba(80,180,255,${0.55 * a})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(-500, -500, 1000, 1000); ctx.restore();
    }
    ctx.restore();
  }
  // "MINDA OPTIMA — PRESENTS"
  const pa = prog(t, 0.05, 0.3) * (1 - prog(t, 0.45, 0.6));
  if (pa > 0) {
    const L = layoutChars(ctx, 'MINDA OPTIMA  —  PERSEMBAHAN', 30, 'Grotesk', 500, 9);
    L.chars.forEach((c, i) => {
      const a = clamp(pa * 2 - i * 0.03);
      text(ctx, c.ch, W / 2 + c.cx, H / 2 - 40, { size: 30, fam: 'Grotesk', weight: 500, color: C.white, alpha: a });
    });
  }
}

// ================= SCENE B — kinetic type: TANPA EJA. TANPA HAFAL. =================
function sceneB(ctx, t) {
  const u = t - 2;
  // phase 1: yellow
  ctx.fillStyle = C.yellow; ctx.fillRect(0, 0, W, H);
  marquee(ctx, 'PANTAS BACA • PANTAS BACA • ', 520, 260, 420, t, -0.2, { stroke: 'rgba(11,22,64,0.13)', lw: 3 });
  marquee(ctx, 'TANPA EJA • TANPA HAFAL • ', 1560, 260, -380, t, -0.2, { stroke: 'rgba(11,22,64,0.13)', lw: 3 });
  // spinning dashed ring
  ctx.save(); ctx.translate(W / 2, 1040); ctx.rotate(u * 0.8); ctx.setLineDash([18, 22]); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(11,22,64,0.35)';
  ctx.beginPath(); ctx.arc(0, 0, 470 + kickEnv(t) * 30, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  cross(ctx, 150, 380, 26, u * 2 + kickEnv(t), C.navy); cross(ctx, 930, 1720, 26, -u * 2, C.navy);
  label(ctx, '01 — KAEDAH', 250, prog(u, 0, 0.3), C.navy);
  ctx.save(); ctx.translate(W / 2, 1000); ctx.rotate(-0.07); ctx.translate(-W / 2, -1000);
  {
    const p = prog(u, 0, 0.22), s = lerp(2.6, 1, E.outExpo(p));
    ctx.save(); ctx.translate(W / 2, 780); ctx.scale(s, s);
    text(ctx, 'TANPA', 0, 0, { size: 300, color: C.navy, alpha: clamp(p * 6) });
    ctx.restore();
    if (u >= 0.5) {
      const q = prog(u, 0.5, 0.95), e = E.outExpo(q);
      for (let k = 5; k >= 1; k--) text(ctx, 'EJA.', W / 2, 1330 - k * 120 * e, { size: 560, stroke: C.navy, lw: 4, alpha: (1 - k / 6) * 0.6 * e });
      ctx.save(); ctx.translate(W / 2, 1330); const s2 = lerp(0.6, 1, E.outBack(prog(u, 0.5, 0.75), 2.5)); ctx.scale(s2, s2);
      text(ctx, 'EJA.', 0, 0, { size: 560, color: C.navy }); ctx.restore();
    }
  }
  ctx.restore();
  // phase 2: blue diagonal wipe
  if (u >= 1.0) {
    const p = E.outExpo(prog(u, 1.0, 1.25)), x = lerp(-900, W + 900, p);
    ctx.save(); ctx.beginPath(); ctx.moveTo(-200, -200); ctx.lineTo(x + 500, -200); ctx.lineTo(x - 500, H + 200); ctx.lineTo(-200, H + 200); ctx.closePath(); ctx.clip();
    ctx.fillStyle = C.blue; ctx.fillRect(0, 0, W, H);
    radialBg(ctx, 'rgba(59,130,246,0.6)', 'rgba(11,22,64,0.5)', W / 2, 1000, 1200);
    marquee(ctx, 'TANPA HAFAL • TANPA EJA • ', 420, 260, -420, t, -0.2, { stroke: 'rgba(255,255,255,0.10)', lw: 3 });
    marquee(ctx, 'PANTAS BACA • PANTAS BACA • ', 1640, 260, 420, t, -0.2, { stroke: 'rgba(255,255,255,0.10)', lw: 3 });
    label(ctx, '01 — KAEDAH', 250, 1, C.white);
    ctx.save(); ctx.translate(W / 2, 1000); ctx.rotate(-0.07); ctx.translate(-W / 2, -1000);
    const L = layoutChars(ctx, 'TANPA', 300);
    L.chars.forEach((c, i) => {
      const q = prog(u, 1.0 + i * 0.0625, 1.3 + i * 0.0625);
      text(ctx, c.ch, W / 2 + c.cx, 780 - (1 - E.outBack(q, 2)) * 260, { size: 300, color: C.white, alpha: clamp(q * 4) });
    });
    if (u >= 1.5) {
      const bp = E.outExpo(prog(u, 1.5, 1.8));
      ctx.fillStyle = C.pink; ctx.fillRect(70, 1240, (W - 140) * bp, 110);
      const L2 = layoutChars(ctx, 'HAFAL.', 470);
      L2.chars.forEach((c, i) => {
        const q = prog(u, 1.5 + i * 0.0625, 1.75 + i * 0.0625), s = E.outBack(q, 3);
        ctx.save(); ctx.translate(W / 2 + c.cx, 1330); ctx.scale(s, s);
        text(ctx, c.ch, 0, 0, { size: 470, color: C.yellow, alpha: clamp(q * 5) }); ctx.restore();
      });
    }
    ctx.restore(); ctx.restore();
  }
  text(ctx, 'Kaedah membaca Pantas Baca', W / 2, 1745, { size: 40, fam: 'Poppins', weight: 600, color: u < 1.1 ? C.navy : C.white, alpha: prog(u, 0.6, 0.9) });
  // iris into scene C
  if (u >= 1.7) {
    const p = E.inCubic(prog(u, 1.7, 2.0)), r = p * 1250;
    ctx.save(); ctx.beginPath(); ctx.arc(W / 2, 1000, r, 0, Math.PI * 2); ctx.clip(); sceneC(ctx, t, true); ctx.restore();
    ctx.save(); ctx.strokeStyle = C.pink; ctx.lineWidth = 26; ctx.beginPath(); ctx.arc(W / 2, 1000, r + 13, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }
}

// ================= SCENE C — 3D alphabet blocks helix =================
const Cs = {};
function letterTex(ch, bg, fg, ring = false) {
  const c = mk(512, 512), x = c.getContext('2d');
  x.fillStyle = bg; x.fillRect(0, 0, 512, 512);
  x.strokeStyle = fg; x.globalAlpha = 0.35; x.lineWidth = 10; x.strokeRect(34, 34, 444, 444); x.globalAlpha = 1;
  if (ring) { x.strokeStyle = fg; x.lineWidth = 36; x.beginPath(); x.arc(256, 256, 150, 0, Math.PI * 2); x.stroke(); }
  else { x.fillStyle = fg; x.font = '900 330px Poppins'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(ch, 256, 280); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function buildC() {
  const s = Cs.scene = new THREE.Scene(); s.environment = envTex;
  s.add(bgQuad('#1b2f7a', C.night, C.sky, 0.25, [0.5, 0.55]));
  s.fog = new THREE.Fog(C.night, 10, 26);
  Cs.cam = new THREE.PerspectiveCamera(50, W / H, 0.05, 100);
  const letters = 'ABCDEIKMNPRSTUYL'.split('');
  const pal = [[C.yellow, C.navy], [C.blue, C.white], [C.pink, C.white], [C.cyan, C.navy], [C.white, C.blue]];
  const geo = new RoundedBoxGeometry(1, 1, 1, 5, 0.14);
  const r = rng(42);
  Cs.blocks = letters.map((ch, i) => {
    const [bg, fg] = pal[i % pal.length];
    const mat = new THREE.MeshPhysicalMaterial({ map: letterTex(ch, bg, fg), roughness: 0.32, clearcoat: 0.7, clearcoatRoughness: 0.15 });
    const m = new THREE.Mesh(geo, mat);
    m.userData = { a: i * 0.78, y: (i - letters.length / 2) * 0.62, rad: 2.5 + r() * 0.8, rx: r() * 6, ry: r() * 6, sp: 0.4 + r() * 0.8, sc: 0.75 + r() * 0.4 };
    s.add(m); return m;
  });
  const heroMat = new THREE.MeshPhysicalMaterial({ map: letterTex('O', C.navy, C.yellow, true), roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1 });
  Cs.hero = new THREE.Mesh(geo, heroMat); s.add(Cs.hero);
  s.add(new THREE.AmbientLight(0xffffff, 0.2));
  const key = new THREE.DirectionalLight(0xffffff, 1.3); key.position.set(4, 6, 6); s.add(key);
  Cs.rim = new THREE.PointLight(C.pink, 30, 30); s.add(Cs.rim);
  const rim2 = new THREE.PointLight(C.cyan, 20, 30); rim2.position.set(-5, -3, 3); s.add(rim2);
  Cs.dust = dust(300, [14, 18, 14], 0xffffff, 0.05, 9); s.add(Cs.dust);
}
function drawC3D(ctx, t) {
  const u = t - 4, k = kickEnv(t);
  const flyIn = E.outExpo(prog(u, -0.35, 0.35));
  Cs.blocks.forEach((m, i) => {
    const d = m.userData, a = d.a + u * 0.9;
    const rad = d.rad * lerp(3.2, 1, flyIn);
    m.position.set(Math.cos(a) * rad, d.y + Math.sin(u * 1.3 + i) * 0.12, Math.sin(a) * rad);
    m.rotation.set(d.rx + u * d.sp, d.ry + u * d.sp * 0.7, 0);
    m.scale.setScalar(d.sc * (1 + k * 0.12));
  });
  // hero block: spins in place, then squares up to the camera
  const face = E.inOutCubic(prog(u, 1.15, 1.7));
  const spin = new THREE.Euler(0.6 + u * 1.4, u * 2.1, 0.3);
  const q = new THREE.Quaternion().setFromEuler(spin).slerp(new THREE.Quaternion(), face);
  Cs.hero.quaternion.copy(q); Cs.hero.scale.setScalar(1.15 * (1 + k * 0.1));
  Cs.rim.position.set(Math.sin(u * 2) * 5, 3, Math.cos(u * 2) * 5);
  Cs.dust.userData.update(t);
  const cam = Cs.cam;
  const orbit = lerp(-0.6, 0.5, E.inOutCubic(prog(u, -0.3, 1.4)));
  const dive = E.inExpo(prog(u, 1.4, 2.0));
  const dist = lerp(lerp(10.5, 8.2, E.outCubic(prog(u, -0.3, 1.3))), 1.12, dive);
  const ang = orbit * (1 - face);
  cam.position.set(Math.sin(ang) * dist, lerp(lerp(-2.2, 1.0, E.inOutCubic(prog(u, -0.3, 1.4))), 0, face), Math.cos(ang) * dist);
  cam.lookAt(0, lerp(0.3, 0, face), 0); cam.rotateZ(lerp(0.12, 0, face));
  ctx.drawImage(render3D(Cs.scene, cam, 0.55, 0.85), 0, 0);
}
function sceneC(ctx, t, fromIris = false) {
  const u = t - 4;
  drawC3D(ctx, t);
  const fade = 1 - prog(u, 1.3, 1.55);
  if (fade <= 0 || fromIris) return;
  ctx.save(); ctx.globalAlpha = fade;
  bottomShade(ctx, 1000, 0.92);
  label(ctx, '02 — PENDEKATAN', 250, prog(u, 0.05, 0.35));
  // articulation waveform
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = C.cyan; ctx.lineWidth = 5; ctx.shadowColor = C.cyan; ctx.shadowBlur = 24;
  const amp = (40 + kickEnv(t) * 90) * E.outExpo(prog(u, 0, 0.4));
  ctx.beginPath();
  for (let x = 0; x <= W; x += 6) {
    const n = x / W, env = Math.sin(n * Math.PI);
    const y = 1200 + env * amp * (Math.sin(n * 26 + t * 14) * 0.6 + Math.sin(n * 61 - t * 23) * 0.3 + Math.sin(n * 9 + t * 5) * 0.4);
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke(); ctx.restore();
  reveal(ctx, 'FOKUS', 90, 1420, 150, prog(u, 0.0, 0.4), { color: C.white, align: 'left' });
  reveal(ctx, 'TEKNIK', 90, 1580, 150, prog(u, 0.5, 0.9), { color: C.white, align: 'left' });
  reveal(ctx, 'ARTIKULASI', 90, 1770, 182, prog(u, 1.0, 1.35), { color: C.yellow, align: 'left' });
  ctx.restore();
}

// ================= SCENE D — 1-to-1 turn-taking ring =================
function sceneD(ctx, t) {
  const u = t - 6, k = kickEnv(t);
  ctx.fillStyle = C.navy; ctx.fillRect(0, 0, W, H);
  radialBg(ctx, 'rgba(29,78,216,0.55)', 'rgba(6,10,28,0.9)', W / 2, 960, 1300);
  // dot grid parallax
  ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.08)'; const oy = (u * 40) % 60;
  for (let y = -60; y < H + 60; y += 60) for (let x = 30; x < W; x += 60) { ctx.beginPath(); ctx.arc(x, y + oy, 2.2, 0, 7); ctx.fill(); }
  ctx.restore();
  const cx = W / 2, cy = 960;
  const intro = E.outExpo(prog(u, 0, 0.4));
  const R = lerp(605, 330, intro), lw = lerp(141, 14, intro);
  ctx.save(); ctx.translate(cx, cy);
  // HUD rings
  ctx.save(); ctx.rotate(u * 0.6); ctx.globalAlpha = intro; ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 3; ctx.setLineDash([4, 14]);
  ctx.beginPath(); ctx.arc(0, 0, 420, 0, 7); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.rotate(-u * 0.4); ctx.globalAlpha = intro;
  for (let i = 0; i < 72; i++) { const a = (i / 72) * Math.PI * 2, l = i % 6 ? 10 : 26; ctx.strokeStyle = i % 6 ? 'rgba(255,255,255,0.3)' : C.cyan; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 455, Math.sin(a) * 455); ctx.lineTo(Math.cos(a) * (455 + l), Math.sin(a) * (455 + l)); ctx.stroke(); }
  ctx.restore();
  ctx.save(); ctx.rotate(u * 1.4); ctx.globalAlpha = intro; ctx.strokeStyle = C.pink; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, 0, 395, 0, 1.1); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 395, Math.PI, Math.PI + 0.5); ctx.stroke(); ctx.restore();
  // main ring (match-cut from the block's "O")
  ctx.strokeStyle = C.yellow; ctx.lineWidth = lw; ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.stroke();
  // turns: one per 16th note from u=0.5
  const step = 0.125, turnF = (u - 0.5) / step, active = Math.floor(turnF), within = turnF - active;
  const dots = 8;
  for (let i = 0; i < dots; i++) {
    const a = -Math.PI / 2 + (i / dots) * Math.PI * 2, x = Math.cos(a) * R, y = Math.sin(a) * R;
    const ap = E.outElastic(prog(u, 0.2 + i * 0.03, 0.75 + i * 0.03));
    if (ap <= 0) continue;
    const isActive = active >= 0 && active % dots === i;
    const done = active >= 0 && (active >= i + (active >= dots ? dots : 0));
    if (isActive) {
      const lp = E.outExpo(clamp(within * 2.5));
      ctx.save(); ctx.strokeStyle = C.yellow; ctx.lineWidth = 6; ctx.shadowColor = C.yellow; ctx.shadowBlur = 30;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(x * lp, y * lp); ctx.stroke(); ctx.restore();
      for (let w = 0; w < 2; w++) { const rp = clamp(within * 1.3 - w * 0.3); if (rp > 0) { ctx.strokeStyle = `rgba(255,200,61,${(1 - rp) * 0.9})`; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x, y, 34 + rp * 90, 0, 7); ctx.stroke(); } }
    }
    const rr = 30 * ap * (isActive ? 1.45 - within * 0.3 : 1);
    ctx.save(); if (isActive) { ctx.shadowColor = C.yellow; ctx.shadowBlur = 40; }
    ctx.fillStyle = isActive ? C.yellow : done ? C.white : C.navy; ctx.beginPath(); ctx.arc(x, y, rr, 0, 7); ctx.fill();
    ctx.strokeStyle = C.white; ctx.lineWidth = 5; ctx.stroke(); ctx.restore();
  }
  // teacher at the centre
  const tp = E.outBack(prog(u, 0.25, 0.6), 2.5);
  ctx.save(); ctx.scale(tp, tp); ctx.fillStyle = C.yellow; ctx.shadowColor = C.yellow; ctx.shadowBlur = 50 + k * 60;
  ctx.beginPath(); ctx.arc(0, 0, 78 + k * 10, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
  text(ctx, 'GURU', 0, 12, { size: 40, fam: 'Poppins', weight: 900, color: C.navy, ls: 2 }); ctx.restore();
  ctx.restore();
  label(ctx, '03 — KELAS', 200, prog(u, 0.05, 0.35));
  reveal(ctx, '1-TO-1', W / 2, 440, 250, prog(u, 0.0, 0.4), { color: C.white, ls: 6 });
  reveal(ctx, 'TURN-TAKING', W / 2, 1580, 175, prog(u, 0.5, 0.9), { color: C.yellow, ls: 4 });
  const sub = 'Giliran seorang demi seorang';
  const n = Math.floor(prog(u, 1.0, 1.45) * sub.length);
  if (n > 0) text(ctx, sub.slice(0, n) + (n < sub.length && Math.floor(t * 8) % 2 ? '|' : ''), W / 2, 1680, { size: 46, fam: 'Poppins', weight: 600, color: C.white });
  if (active >= 0) text(ctx, `GILIRAN ${String((active % dots) + 1).padStart(2, '0')} / 08`, W / 2, 1775, { size: 30, fam: 'Grotesk', weight: 500, ls: 8, color: C.cyan, alpha: prog(u, 0.5, 0.7) });
}

// ================= SCENE E — two programmes, diagonal split =================
function sceneE(ctx, t) {
  const u = t - 8;
  const slope = Math.tan(0.21);
  const yAt = x => 960 - slope * (x - 540);
  const inP = E.outExpo(prog(u, 0, 0.45)), inP2 = E.outExpo(prog(u, 0.06, 0.5));
  const outP = E.inExpo(prog(u, 1.72, 2.0));
  const bump = attack(t, [8.5, 9.0, 9.5], 0.09) * 22;
  const push = lerp(1, 1.06, E.inOutCubic(prog(u, 0, 2)));
  ctx.fillStyle = C.night; ctx.fillRect(0, 0, W, H);
  if (u >= 1.72) sceneF(ctx, t);
  ctx.save(); ctx.translate(W / 2, 960); ctx.scale(push, push); ctx.translate(-W / 2, -960);
  // top panel — Pantas Baca (BM)
  const dx1 = lerp(-1500, 0, inP) - outP * 1500;
  ctx.save(); ctx.translate(dx1, -bump);
  ctx.beginPath(); ctx.moveTo(-300, -300); ctx.lineTo(W + 300, -300); ctx.lineTo(W + 300, yAt(W + 300)); ctx.lineTo(-300, yAt(-300)); ctx.closePath(); ctx.clip();
  ctx.fillStyle = C.blue; ctx.fillRect(-300, -300, W + 600, H);
  radialBg(ctx, 'rgba(59,130,246,0.7)', 'rgba(11,22,64,0.6)', 300, 300, 1100);
  text(ctx, 'BM', 640 + u * 60, 900, { size: 820, stroke: 'rgba(255,255,255,0.13)', lw: 4 });
  label(ctx, 'PROGRAM BAHASA MELAYU', 250, prog(u, 0.2, 0.5));
  reveal(ctx, 'PANTAS', 86, 560, 270, prog(u, 0.15, 0.5), { color: C.white, align: 'left' });
  reveal(ctx, 'BACA', 86, 820, 270, prog(u, 0.25, 0.6), { color: C.yellow, align: 'left' });
  ctx.restore();
  // bottom panel — The Victoria Readers (English)
  const dx2 = lerp(1500, 0, inP2) + outP * 1500;
  ctx.save(); ctx.translate(dx2, bump);
  ctx.beginPath(); ctx.moveTo(-300, yAt(-300)); ctx.lineTo(W + 300, yAt(W + 300)); ctx.lineTo(W + 300, H + 300); ctx.lineTo(-300, H + 300); ctx.closePath(); ctx.clip();
  ctx.fillStyle = C.yellow; ctx.fillRect(-300, 0, W + 600, H + 300);
  text(ctx, 'EN', 440 - u * 60, 1700, { size: 820, stroke: 'rgba(11,22,64,0.13)', lw: 4 });
  reveal(ctx, 'THE VICTORIA', W - 86, 1330, 150, prog(u, 0.3, 0.65), { color: C.navy, align: 'right' });
  reveal(ctx, 'READERS', W - 86, 1590, 270, prog(u, 0.4, 0.75), { color: C.navy, align: 'right' });
  const lp = prog(u, 0.5, 0.8);
  if (lp > 0) text(ctx, 'PROGRAM ENGLISH  ·  TVR', W - 90, 1690, { size: 30, fam: 'Grotesk', weight: 500, ls: 8, color: C.navy, align: 'right', alpha: lp });
  ctx.restore();
  // glowing divider
  const dl = E.outExpo(prog(u, 0.35, 0.7)) * (1 - outP);
  if (dl > 0) {
    ctx.save(); ctx.strokeStyle = C.white; ctx.lineWidth = 7; ctx.shadowColor = C.white; ctx.shadowBlur = 30;
    const x0 = 540 - 800 * dl, x1 = 540 + 800 * dl; ctx.beginPath(); ctx.moveTo(x0, yAt(x0)); ctx.lineTo(x1, yAt(x1)); ctx.stroke(); ctx.restore();
  }
  // badge with orbiting text
  const bp = E.outElastic(prog(u, 1.0, 1.6)) * (1 - E.inExpo(prog(u, 1.6, 1.8)));
  if (bp > 0) {
    ctx.save(); ctx.translate(800, yAt(800)); ctx.scale(bp, bp); ctx.rotate(-0.21);
    ctx.fillStyle = C.navy; ctx.beginPath(); ctx.arc(0, 0, 215, 0, 7); ctx.fill();
    ctx.fillStyle = C.pink; ctx.shadowColor = C.pink; ctx.shadowBlur = 40; ctx.beginPath(); ctx.arc(0, 0, 150, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
    text(ctx, '2', 0, 40, { size: 150, color: C.white });
    text(ctx, 'PROGRAM', 0, 92, { size: 30, fam: 'Poppins', weight: 800, color: C.white, ls: 3 });
    const ring = 'BAHASA MELAYU • ENGLISH • BAHASA MELAYU • ENGLISH • ';
    font(ctx, 26, 'Grotesk', 500); ctx.fillStyle = C.white; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    [...ring].forEach((ch, i) => { const a = (i / ring.length) * Math.PI * 2 + u * 1.2; ctx.save(); ctx.rotate(a); ctx.translate(0, -183); ctx.fillText(ch, 0, 0); ctx.restore(); });
    ctx.restore();
  }
  ctx.restore();
}

// ================= SCENE F — "SEJAK 1995" in 3D gold =================
const F = {};
function buildF() {
  const s = F.scene = new THREE.Scene(); s.environment = envTex;
  s.add(bgQuad('#14204f', '#03050d', C.yellow, 0.12, [0.5, 0.7]));
  F.cam = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
  const gold = frontMat(C.yellow, { metal: 1.0, rough: 0.18 }); gold.color.set('#FFC83D');
  const goldSide = sideMat('#C98A12', { metal: 1.0, rough: 0.28 });
  const w = word3D('1995', fonts3.poppins, 1.2, 0.5, [gold, goldSide], 0.05);
  w.group.scale.setScalar(3.4 / w.group.userData.width); w.group.position.y = 0.2;
  F.digits = w.letters; s.add(w.group);
  const sj = word3D('SEJAK', fonts3.anton, 0.6, 0.14, [frontMat('#e9edf7'), sideMat(C.blue)], 0.04);
  sj.group.scale.setScalar(1.7 / sj.group.userData.width); sj.group.position.set(0, 1.55, 0.1);
  F.sejak = sj.letters; s.add(sj.group);
  s.add(new THREE.AmbientLight(0xffffff, 0.2));
  F.spot = new THREE.SpotLight(0xffffff, 60, 30, 0.5, 0.6); F.spot.position.set(0, 6, 5); s.add(F.spot, F.spot.target);
  F.p1 = new THREE.PointLight(C.pink, 20, 20); F.p2 = new THREE.PointLight(C.cyan, 20, 20); s.add(F.p1, F.p2);
  // light shafts
  F.beams = [-1.8, 0, 1.8].map((x, i) => {
    const m = new THREE.Mesh(new THREE.ConeGeometry(1.4, 14, 32, 1, true), new THREE.MeshBasicMaterial({ color: i === 1 ? C.yellow : C.sky, transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    m.position.set(x, 5, -3); m.rotation.z = -x * 0.12; s.add(m); return m;
  });
  F.dust = dust(500, [12, 12, 10], 0xffd27a, 0.05, 77); s.add(F.dust);
}
function drawF3D(ctx, t) {
  const u = t - 10;
  F.digits.forEach((m, i) => {
    const ti = i * 0.125, p = prog(u, ti - 0.05, ti + 0.4), b = m.userData.base;
    const e = E.outBack(p, 1.8);
    m.rotation.set((1 - e) * -Math.PI * 0.75, 0, 0);
    m.position.set(b.x, b.y + (1 - E.outCubic(p)) * -1.5, b.z + (1 - e) * 2);
    m.visible = p > 0; m.scale.setScalar(1 + kickEnv(t) * 0.04);
  });
  F.sejak.forEach((m, i) => {
    const p = prog(u, 0.45 + i * 0.0625, 0.8 + i * 0.0625), b = m.userData.base;
    m.visible = p > 0; m.position.set(b.x, b.y - (1 - E.outExpo(p)) * 0.6, b.z); m.rotation.y = (1 - E.outExpo(p)) * 1.6;
  });
  F.spot.position.set(Math.sin(u * 2.2) * 4, 5, 5); F.spot.target.position.set(0, 0.2, 0);
  F.p1.position.set(-4, Math.sin(u * 3) * 2, 3); F.p2.position.set(4, -Math.sin(u * 3) * 2, 3);
  F.beams.forEach((m, i) => { m.material.opacity = 0.04 + 0.03 * Math.sin(t * 3 + i * 2) + kickEnv(t) * 0.03; });
  F.dust.userData.update(t);
  const p = E.inOutCubic(prog(u, -0.3, 1.5)), back = E.inExpo(prog(u, 1.5, 2.0));
  const cam = F.cam;
  cam.position.set(lerp(-3.0, 2.0, p), lerp(-1.6, 0.6, p) + back * 2, lerp(6.4, 8.6, p) + back * 9);
  cam.lookAt(0, lerp(-0.35, -0.55, p), 0); cam.rotateZ(lerp(0.1, -0.05, p));
  ctx.drawImage(render3D(F.scene, cam, 0.7, 0.8), 0, 0);
}
function sceneF(ctx, t) {
  const u = t - 10;
  drawF3D(ctx, t);
  if (u < 0) return;
  bottomShade(ctx, 1150, 0.9, '3,5,13');
  label(ctx, '04 — PENGALAMAN', 200, prog(u, 0.05, 0.35));
  reveal(ctx, 'LEBIH 30 TAHUN', W / 2, 1460, 150, prog(u, 0.5, 0.85), { color: C.white, ls: 2 });
  const pill = (s, y, from, p, fill, fg) => {
    if (p <= 0) return; const e = E.outExpo(p);
    ctx.save(); ctx.translate(lerp(from, W / 2, e), y); font(ctx, 46, 'Poppins', 800); ctx.letterSpacing = '4px';
    const w = ctx.measureText(s).width + 110; roundRect(ctx, -w / 2, -52, w, 104, 52);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); } else { ctx.strokeStyle = C.white; ctx.lineWidth = 4; ctx.stroke(); }
    text(ctx, s, 0, 17, { size: 46, fam: 'Poppins', weight: 800, color: fg, ls: 4 }); ctx.restore();
  };
  pill('KELAS FIZIKAL', 1590, -700, prog(u, 1.0, 1.35), C.yellow, C.navy);
  pill('ONLINE  ·  ZOOM', 1725, W + 700, prog(u, 1.25, 1.6), null, C.white);
}

// ================= SCENE G — finale logo lockup =================
const G = {};
function buildG() {
  const s = G.scene = new THREE.Scene(); s.environment = envTex;
  G.bg = bgQuad('#1f47d6', '#040817', C.yellow, 0.2, [0.5, 0.62]); s.add(G.bg);
  G.cam = new THREE.PerspectiveCamera(40, W / H, 0.1, 100);
  const w1 = word3D('PANTAS', fonts3.anton, 1.25, 0.5, [frontMat('#e9edf7'), sideMat(C.blue, { metal: 0.6 })], 0.05);
  const w2 = word3D('BACA', fonts3.anton, 1.25, 0.5, [frontMat(C.yellow, { emissive: C.orange, ei: 0.1 }), sideMat(C.orange, { metal: 0.7 })], 0.05);
  const sc = 3.5 / w1.group.userData.width; w1.group.scale.setScalar(sc); w2.group.scale.setScalar(sc);
  w1.group.position.y = w1.group.userData.height * sc * 0.56; w2.group.position.y = -w2.group.userData.height * sc * 0.56;
  G.logo = new THREE.Group(); G.logo.add(w1.group, w2.group); G.logo.position.y = 0.78; s.add(G.logo);
  G.letters = [...w1.letters, ...w2.letters];
  const r = rng(3); G.letters.forEach(m => { m.userData.scatter = new THREE.Vector3((r() - 0.5) * 14, (r() - 0.5) * 18, 2 + r() * 8); m.userData.srot = new THREE.Euler((r() - 0.5) * 8, (r() - 0.5) * 8, (r() - 0.5) * 4); });
  s.add(new THREE.AmbientLight(0xffffff, 0.25));
  const key = new THREE.DirectionalLight(0xffffff, 1.2); key.position.set(-3, 5, 7); s.add(key);
  G.sweep = new THREE.PointLight(0xffffff, 0, 12); s.add(G.sweep);
  G.p1 = new THREE.PointLight(C.pink, 25, 20); G.p1.position.set(5, -3, 3); s.add(G.p1);
  G.p2 = new THREE.PointLight(C.cyan, 25, 20); G.p2.position.set(-5, 3, 2); s.add(G.p2);
  // particle burst
  const n = 700, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), dirs = [];
  const pal = [C.yellow, C.white, C.pink, C.cyan].map(c => new THREE.Color(c));
  for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, z = (r() - 0.5) * 1.2, sp = 3 + r() * 9; dirs.push([Math.cos(a) * sp, Math.sin(a) * sp, z * sp]); const c = pal[i % 4]; col.set([c.r * 2, c.g * 2, c.b * 2], i * 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  G.burst = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.09, map: SPRITE, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  G.burst.frustumCulled = false; G.burstDirs = dirs; G.burst.position.y = 0.78; s.add(G.burst);
  G.dust = dust(250, [12, 18, 8], 0xffffff, 0.04, 21); s.add(G.dust);
}
function drawG3D(ctx, t) {
  const u = t - 12;
  G.letters.forEach((m, i) => {
    const p = E.outExpo(prog(u, -0.15 + i * 0.025, 0.55 + i * 0.025)), b = m.userData.base, sc = m.userData.scatter, sr = m.userData.srot;
    m.position.set(lerp(sc.x, b.x, p), lerp(sc.y, b.y, p), lerp(sc.z, b.z, p));
    m.rotation.set(sr.x * (1 - p), sr.y * (1 - p), sr.z * (1 - p));
  });
  G.logo.rotation.set(Math.sin(u * 1.1) * 0.06 - 0.04, Math.sin(u * 0.8) * 0.16, 0);
  G.logo.scale.setScalar(1 + kickEnv(t) * 0.025 + (u > 0 ? 0 : 0));
  const sw = prog(u, 0.7, 1.7);
  G.sweep.intensity = Math.sin(sw * Math.PI) * 45; G.sweep.position.set(lerp(-5, 5, sw), 1.6, 2.2);
  const bp = Math.max(0, u), pos = G.burst.geometry.attributes.position.array, k = 2.6, f = (1 - Math.exp(-k * bp)) / k;
  G.burstDirs.forEach((d, i) => { pos[i * 3] = d[0] * f; pos[i * 3 + 1] = d[1] * f - bp * bp * 0.3; pos[i * 3 + 2] = d[2] * f; });
  G.burst.geometry.attributes.position.needsUpdate = true;
  G.burst.material.opacity = u < 0 ? 0 : 1 - prog(u, 0.3, 2.4);
  G.bg.material.uniforms.uT.value = t; G.bg.material.uniforms.uRays.value = 0.16 + impactEnv(t) * 0.5;
  G.dust.userData.update(t);
  const cam = G.cam, p = E.outCubic(prog(u, -0.2, 3.0));
  cam.position.set(lerp(1.2, -0.3, p), lerp(-0.6, 0.15, p), lerp(13.5, 10.2, p));
  cam.lookAt(0, 0, 0); cam.rotateZ(lerp(-0.05, 0, p));
  ctx.drawImage(render3D(G.scene, cam, 0.65 + impactEnv(t) * 0.6, 0.85), 0, 0);
}
function sceneG(ctx, t) {
  const u = t - 12;
  drawG3D(ctx, t);
  // shockwave rings
  for (const [s0, c] of [[0, C.white], [0.08, C.yellow]]) {
    const p = prog(u, s0, s0 + 0.7); if (p <= 0 || p >= 1) continue;
    ctx.save(); ctx.strokeStyle = c; ctx.globalAlpha = 1 - p; ctx.lineWidth = 40 * (1 - p) + 2;
    ctx.beginPath(); ctx.arc(W / 2, 780, E.outExpo(p) * 1100, 0, 7); ctx.stroke(); ctx.restore();
  }
  const op = prog(u, 0.5, 0.9);
  if (op > 0) {
    const L = layoutChars(ctx, 'oleh MINDA OPTIMA', 34, 'Grotesk', 500, 10);
    L.chars.forEach((c, i) => { const a = clamp(op * 2.2 - i * 0.04); text(ctx, c.ch, W / 2 + c.cx, 1225 + (1 - a) * 20, { size: 34, fam: 'Grotesk', weight: 500, color: C.white, alpha: a }); });
  }
  const lp = E.outExpo(prog(u, 1.0, 1.4));
  if (lp > 0) { ctx.fillStyle = C.yellow; ctx.fillRect(W / 2 - 220 * lp, 1290, 440 * lp, 5); }
  reveal(ctx, 'PROGRAM MEMBACA KANAK-KANAK', W / 2, 1385, 46, prog(u, 1.0, 1.4), { fam: 'Poppins', weight: 800, color: C.white, ls: 2 });
  reveal(ctx, 'BM  •  ENGLISH  •  4 TAHUN KE ATAS', W / 2, 1455, 36, prog(u, 1.2, 1.6), { fam: 'Poppins', weight: 600, color: 'rgba(248,250,252,0.85)', ls: 3 });
  const cp = prog(u, 1.5, 1.95);
  if (cp > 0) {
    const s = E.outBack(cp, 2.4) * (1 + pulse(t, [14.0, 14.5], 0.15) * 0.06);
    ctx.save(); ctx.translate(W / 2, 1610); ctx.scale(s, s);
    ctx.shadowColor = C.yellow; ctx.shadowBlur = 50; ctx.fillStyle = C.yellow; roundRect(ctx, -330, -66, 660, 132, 66); ctx.fill(); ctx.shadowBlur = 0;
    ctx.save(); roundRect(ctx, -330, -66, 660, 132, 66); ctx.clip();
    for (const s0 of [2.1, 2.7]) { const sp = prog(u, s0, s0 + 0.45); if (sp > 0 && sp < 1) { const x = lerp(-600, 600, E.inOutCubic(sp)); const g = ctx.createLinearGradient(x - 120, 0, x + 120, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.75)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(-330, -66, 660, 132); } }
    ctx.restore();
    text(ctx, 'PANTASBACA.COM', 0, 20, { size: 54, fam: 'Poppins', weight: 900, color: C.navy, ls: 2 });
    ctx.restore();
  }
}

// ================= global composition =================
function composeAt(ctx, t) {
  ctx.save();
  if (t < 2) sceneIntro(ctx, t);
  else if (t < 4) sceneB(ctx, t);
  else if (t < 6) sceneC(ctx, t);
  else if (t < 8) sceneD(ctx, t);
  else if (t < 10) sceneE(ctx, t);
  else if (t < 12) sceneF(ctx, t);
  else sceneG(ctx, t);
  ctx.restore();
}
function hud(ctx, t, f) {
  const a = prog(t, 0.6, 1.0);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a * 0.85; ctx.globalCompositeOperation = 'difference';
  const m = 54, L = 34; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
  for (const [x, y, sx, sy] of [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]]) { ctx.beginPath(); ctx.moveTo(x, y + sy * L); ctx.lineTo(x, y); ctx.lineTo(x + sx * L, y); ctx.stroke(); }
  const ss = Math.floor(f / FPS), ff = f % FPS;
  text(ctx, 'PANTAS BACA  /  SHOWREEL ’26', m + 6, m + 70, { size: 24, fam: 'Grotesk', weight: 500, ls: 5, color: '#fff', align: 'left' });
  text(ctx, `00:00:${String(ss).padStart(2, '0')}:${String(ff).padStart(2, '0')}`, W - m - 6, m + 70, { size: 24, fam: 'Grotesk', weight: 500, ls: 5, color: '#fff', align: 'right' });
  if (t < 13.4) {
    const sc = t < 2 ? 1 : t < 4 ? 2 : t < 6 ? 3 : t < 8 ? 4 : t < 10 ? 5 : t < 12 ? 6 : 7;
    text(ctx, `${String(sc).padStart(2, '0')} / 07`, m + 6, H - m - 50, { size: 24, fam: 'Grotesk', weight: 500, ls: 5, color: '#fff', align: 'left' });
    text(ctx, 'PANTASBACA.COM', W - m - 6, H - m - 50, { size: 24, fam: 'Grotesk', weight: 500, ls: 5, color: '#fff', align: 'right' });
  }
  ctx.restore();
}
function shakeAt(t) {
  const amp = kickEnv(t) * 6 + impactEnv(t) * 22;
  const n1 = (Math.sin(t * 61.3) + Math.sin(t * 37.1 + 1.7)) / 2, n2 = (Math.sin(t * 53.9 + 0.4) + Math.sin(t * 29.3 + 2.9)) / 2;
  return [n1 * amp, n2 * amp, Math.sin(t * 23.7) * amp * 0.0012];
}
function flashAt(t) {
  let v = 0;
  for (const [s, a, d] of [[2.0, 1, 0.22], [8.0, 0.5, 0.12], [10.0, 0.35, 0.15], [12.0, 1, 0.35]]) {
    if (t < s) v = Math.max(v, a * Math.pow(prog(t, s - 0.12, s), 3));
    else v = Math.max(v, a * Math.exp(-(t - s) / d));
  }
  return v;
}
function glitchAt(t) { return Math.max(prog(t, 7.62, 7.98) * (t < 8.12 ? 1 : 0), 1 - prog(t, 8.0, 8.14)) * (t > 7.6 && t < 8.14 ? 1 : 0); }

window.renderFrame = function (f) {
  const t0 = f / FPS;
  for (let i = 0; i < SUB; i++) {
    const t = t0 - (i / SUB) * (0.5 / FPS); // 180° shutter
    bctx.setTransform(1, 0, 0, 1, 0, 0); bctx.globalAlpha = 1; bctx.globalCompositeOperation = 'source-over';
    composeAt(bctx, Math.max(0, t));
    const [sx, sy, rot] = shakeAt(t);
    octx.save(); octx.globalAlpha = 1 / (i + 1);
    octx.translate(W / 2 + sx, H / 2 + sy); octx.rotate(rot); const z = 1 + Math.abs(rot) * 2 + (sx || sy ? 0.02 : 0); octx.scale(z, z);
    octx.drawImage(buf, -W / 2, -H / 2); octx.restore();
  }
  // transitions FX on the averaged frame
  const g = glitchAt(t0);
  if (g > 0.01) { tctx.drawImage(out, 0, 0); chroma(octx, tmp, 30 * g); tctx.drawImage(out, 0, 0); slices(octx, tmp, 140 * g, t0); }
  const win = (a, b) => (t0 >= a && t0 < b ? 1 : 0);
  const zb = Math.max(E.inExpo(prog(t0, 1.8, 2.0)) * 0.25 * win(1.8, 2.0), E.inCubic(prog(t0, 11.7, 12.0)) * 0.3 * win(11.7, 12.0));
  if (zb > 0.01) { tctx.drawImage(out, 0, 0); zoomBlur(octx, tmp, zb); }
  const ca = impactEnv(t0) * 10;
  if (ca > 1.5 && g < 0.01) { tctx.drawImage(out, 0, 0); chroma(octx, tmp, ca); }
  octx.drawImage(vignette, 0, 0);
  octx.save(); octx.globalCompositeOperation = 'overlay'; octx.globalAlpha = 0.09; octx.imageSmoothingEnabled = true;
  octx.drawImage(grains[f % grains.length], 0, 0, W, H); octx.restore();
  hud(octx, t0, f);
  const fl = flashAt(t0);
  if (fl > 0.003) { octx.save(); octx.globalAlpha = Math.min(1, fl); octx.fillStyle = '#fff'; octx.fillRect(0, 0, W, H); octx.restore(); }
  return true;
};

// ---------- boot ----------
(async () => {
  await Promise.all(['Anton', '400 1px Poppins', '600 1px Poppins', '800 1px Poppins', '900 1px Poppins', '500 1px Grotesk']
    .map(s => document.fonts.load(s.includes('px') ? s : `1px ${s}`)));
  await loadFont('anton', 'fonts/Anton.ttf');
  await loadFont('poppins', 'fonts/Poppins_wght_900.ttf');
  SPRITE = spriteTex();
  makeGrain(); makeVignette();
  buildA(); buildC(); buildF(); buildG();
  // warm up shaders
  for (const [sc, cam] of [[A.scene, A.cam], [Cs.scene, Cs.cam], [F.scene, F.cam], [G.scene, G.cam]]) { cam.position.set(0, 0, 10); cam.lookAt(0, 0, 0); render3D(sc, cam); }
  console.log('webgl2:', renderer.capabilities.isWebGL2);
  window.READY = true;
})().catch(e => { console.error('boot failed', e.stack || e); });
