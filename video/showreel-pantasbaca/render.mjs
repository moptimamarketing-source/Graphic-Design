// Render index.html frame-by-frame with headless Chromium and pipe PNGs to ffmpeg.
// Usage: node render.mjs <out.mp4> [startFrame] [endFrame] [--frames-dir dir]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const args = process.argv.slice(2);
const out = args[0] || 'out/video_noaudio.mp4';
const start = +(args[1] ?? 0), end = +(args[2] ?? 450);
const FPS = 30;

const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.ttf': 'font/ttf', '.json': 'application/json', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('console', m => console.log('[page]', m.text()));
page.on('pageerror', e => { console.error('[pageerror]', e); process.exit(1); });
await page.goto(`http://localhost:${port}/index.html`);
await page.waitForFunction(() => window.READY === true, null, { timeout: 120000 });

if (out === '--stills') {
  const dir = path.join(ROOT, 'out/stills'); fs.mkdirSync(dir, { recursive: true });
  for (const f of args.slice(1).map(Number)) {
    const t = Date.now();
    await page.evaluate(fr => window.renderFrame(fr), f);
    await page.screenshot({ path: path.join(dir, `f${String(f).padStart(3, '0')}.png`), clip: { x: 0, y: 0, width: 1080, height: 1920 } });
    console.log('still', f, Date.now() - t, 'ms');
  }
  await browser.close(); server.close(); process.exit(0);
}
fs.mkdirSync(path.dirname(out), { recursive: true });
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '12', '-pix_fmt', 'yuv420p', '-r', String(FPS), out], { stdio: ['pipe', 'inherit', 'inherit'] });

const t0 = Date.now();
for (let f = start; f < end; f++) {
  await page.evaluate(fr => window.renderFrame(fr), f);
  const buf = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1080, height: 1920 } });
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  if (f % 15 === 0) console.log(`frame ${f}/${end}  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}
ff.stdin.end();
await new Promise(r => ff.on('close', r));
await browser.close(); server.close();
console.log('done', out, ((Date.now() - t0) / 1000).toFixed(1) + 's');
