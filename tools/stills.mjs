// Render several frames of the MV as PNGs with a single bundle (faster than repeated `remotion still`).
// usage: node tools/stills.mjs [--entry mv/src/entries/S3.ts] <outDir> <frame|bBEAT> ...   e.g. b46 b58.3 1200 (bN = frame of beat N)
// --entry bundles a single section; the bundle cache is off so parallel runs can't clash.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const ROOT = path.resolve(import.meta.dirname, '..');
const require = createRequire(path.join(ROOT, 'mv/package.json'));
const { bundle } = require('@remotion/bundler');
const { renderStill, selectComposition } = require('@remotion/renderer');

const args = process.argv.slice(2);
const ei = args.indexOf('--entry');
const entry = ei >= 0 ? path.resolve(args.splice(ei, 2)[1]) : path.join(ROOT, 'mv/src/index.ts');
const [outDir, ...specs] = args;
const beats = JSON.parse(fs.readFileSync(path.join(ROOT, 'mv/src/data/beats.json'), 'utf8'));
const toFrame = (s) => (s.startsWith('b') ? Math.round((beats.firstBeat + Number(s.slice(1)) * beats.period) * 30) : Number(s));
const browserExecutable = `${process.env.HOME}/.cache/puppeteer/chrome-headless-shell/mac_arm-155.0.8059.39/chrome-headless-shell-mac-arm64/chrome-headless-shell`;

fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: entry, publicDir: path.join(ROOT, 'mv/public'), enableCaching: false, symlinkPublicDir: true });
const inputProps = { debug: false };
const composition = await selectComposition({ serveUrl, id: 'MV', inputProps, browserExecutable });
for (const s of specs) {
  const frame = toFrame(s);
  const output = path.join(outDir, `${s}.png`);
  await renderStill({ composition, serveUrl, output, frame, inputProps, browserExecutable, chromiumOptions: { gl: 'angle' } });
  console.log(output, 'frame', frame);
}
