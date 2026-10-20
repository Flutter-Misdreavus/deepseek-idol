// Dev probe: dump the part tree with the drawables under each part (ids only).
// usage: node probe.js [partId ...]   -> prints the subtree of each given part (default: whole tree)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import * as esbuild from 'esbuild';
import puppeteer from 'puppeteer';

const HERE = import.meta.dirname, ROOT = path.resolve(HERE, '..');
const bundle = await esbuild.build({ entryPoints: [path.join(HERE, 'src/page.js')], bundle: true, write: false, format: 'iife' });
const html = `<!doctype html><html><body><script src="/live2d-render/vendor/live2dcubismcore.min.js"></script><script>${bundle.outputFiles[0].text}</script></body></html>`;
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p === '/') { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(html); }
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=metal'] });
try {
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await page.evaluate(() => window.setup({ modelUrl: '/assets/music/DS鲸鱼娘/DS鼠控版/c_0120.model3.json', width: 64, height: 64 }));
  const tree = await page.evaluate(() => {
    const m = window.__core.getModel();
    return {
      parts: [...m.parts.ids], parent: [...m.parts.parentIndices],
      dids: [...m.drawables.ids], dparent: [...m.drawables.parentPartIndices],
    };
  });
  const names = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/music/DS鲸鱼娘/DS鼠控版/c_0120.cdi3.json'), 'utf8')).Parts.map((p) => [p.Id, p.Name]));
  const show = (i, depth) => {
    const kids = tree.parent.map((p, j) => (p === i ? j : -1)).filter((j) => j >= 0);
    const ds = tree.dparent.map((p, j) => (p === i ? tree.dids[j] : null)).filter(Boolean);
    console.log(`${'  '.repeat(depth)}${tree.parts[i]} ${names[tree.parts[i]] ?? ''}${ds.length ? `  [${ds.join(' ')}]` : ''}`);
    kids.forEach((k) => show(k, depth + 1));
  };
  const want = process.argv.slice(2);
  const roots = want.length ? want.map((id) => tree.parts.indexOf(id)) : tree.parent.map((p, i) => (p === -1 ? i : -1)).filter((i) => i >= 0);
  roots.forEach((r) => show(r, 0));
} finally {
  await browser.close();
  server.close();
}
