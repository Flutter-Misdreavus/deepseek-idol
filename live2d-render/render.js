// Usage: node render.js clips/<name>.js [outDir] [--frames a:b]
// Renders a clip script to a transparent PNG sequence, frame by frame, in order (physics is stateful).
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import * as esbuild from 'esbuild';
import puppeteer from 'puppeteer';
import { prepare } from './lib/clip.js';

const HERE = import.meta.dirname;
const ROOT = path.resolve(HERE, '..');           // deepseek-idol/
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const MODEL_URL = '/assets/music/DS鲸鱼娘/DS鼠控版/c_0120.model3.json';

const [clipPath, outArg, ...rest] = process.argv.slice(2);
if (!clipPath) { console.error('usage: node render.js clips/<name>.js [outDir]'); process.exit(1); }
const clip = (await import(pathToFileURL(path.resolve(clipPath)).href)).default;
const name = path.basename(clipPath, '.js');
const outDir = path.resolve(outArg || path.join(ROOT, 'mv/public/l2d', name));
const range = rest.includes('--frames') ? rest[rest.indexOf('--frames') + 1].split(':').map(Number) : null;

// bundle the page code once per run
const bundle = await esbuild.build({
  entryPoints: [path.join(HERE, 'src/page.js')], bundle: true, write: false, format: 'iife', minify: false,
});
const pageJs = bundle.outputFiles[0].text;
const html = `<!doctype html><html><body style="margin:0;background:transparent">
<script src="/live2d-render/vendor/live2dcubismcore.min.js"></script><script>${pageJs}</script></body></html>`;

const types = { '.json': 'application/json', '.png': 'image/png', '.js': 'text/javascript', '.moc3': 'application/octet-stream' };
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p === '/') { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(html); }
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--enable-webgl'],
});
try {
  const page = await browser.newPage();
  page.on('console', (m) => console.log('[page]', m.text()));
  page.on('pageerror', (e) => console.error('[page error]', e));
  await page.goto(`http://127.0.0.1:${port}/`);
  const [w, h] = clip.size;
  const info = await page.evaluate((o) => window.setup(o), { modelUrl: MODEL_URL, width: w, height: h });
  console.log(`model ${info.modelWidth}x${info.modelHeight}, ${info.params.length} params, canvas ${w}x${h}`);

  const fps = clip.fps ?? 30;
  const dt = 1000 / fps;
  const evalAt = prepare(clip, info);
  const total = Math.round(clip.duration * fps);
  const [a, b] = range || [0, total];
  const warmFrames = Math.round((clip.warmup ?? 1) * fps);
  fs.mkdirSync(outDir, { recursive: true });

  const t0 = Date.now();
  // warmup lets physics settle; frames before `a` are simulated but not written
  for (let f = -warmFrames; f < b; f++) {
    const t = f / fps;
    const { params, parts } = evalAt(t);
    const tr = clip.transform ? clip.transform(t) : { x: w / 2, y: h / 2, scale: 1 };
    const render = f >= a;
    const hideIds = typeof clip.hideDrawables === 'function' ? clip.hideDrawables(t) : clip.hideDrawables;
    const hide = hideIds?.map((id) => info.drawables.indexOf(id)).filter((i) => i >= 0);
    const url = await page.evaluate((o) => window.frame(o), { dt, params, parts, t: tr, render, outline: clip.outline || 0, hide });
    if (render) {
      fs.writeFileSync(path.join(outDir, `${String(f).padStart(5, '0')}.png`), Buffer.from(url.split(',')[1], 'base64'));
      if (f % 30 === 0) process.stdout.write(`\rframe ${f}/${b}`);
    }
  }
  console.log(`\ndone: ${b - a} frames -> ${outDir} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
} finally {
  await browser.close();
  server.close();
}
