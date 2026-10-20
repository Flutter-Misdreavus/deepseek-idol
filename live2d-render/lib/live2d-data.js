// Node-side evaluation of motion3 / exp3 files, so every frame is a pure function of time.
import fs from 'node:fs';
import path from 'node:path';

export const MODEL_DIR = path.resolve(import.meta.dirname, '../../assets/music/DS鲸鱼娘/DS鼠控版');

const cache = new Map();
const readJson = (rel) => {
  const p = path.join(MODEL_DIR, rel);
  if (!cache.has(p)) cache.set(p, JSON.parse(fs.readFileSync(p, 'utf8')));
  return cache.get(p);
};

// ---- motion3 ----
// Decode Segments into [{t0,v0,t1,v1,type,pts}] once per curve.
function decodeCurve(seg) {
  const out = [];
  let i = 2, t0 = seg[0], v0 = seg[1];
  while (i < seg.length) {
    const type = seg[i];
    if (type === 1) {
      const pts = seg.slice(i + 1, i + 7);
      out.push({ type, t0, v0, pts, t1: pts[4], v1: pts[5] });
      t0 = pts[4]; v0 = pts[5]; i += 7;
    } else {
      const t1 = seg[i + 1], v1 = seg[i + 2];
      out.push({ type, t0, v0, t1, v1 });
      t0 = t1; v0 = v1; i += 3;
    }
  }
  return out;
}

function evalSegments(segs, t) {
  if (t <= segs[0].t0) return segs[0].v0;
  for (const s of segs) {
    if (t > s.t1) continue;
    const u = s.t1 === s.t0 ? 1 : (t - s.t0) / (s.t1 - s.t0);
    switch (s.type) {
      case 0: return s.v0 + (s.v1 - s.v0) * u;
      case 1: { // restricted bezier: evaluate in curve parameter = time ratio
        const [, c1, , c2] = s.pts;
        const a = 1 - u;
        return a * a * a * s.v0 + 3 * a * a * u * c1 + 3 * a * u * u * c2 + u * u * u * s.v1;
      }
      case 2: return s.v0;  // stepped
      case 3: return s.v1;  // inverse stepped
    }
  }
  return segs[segs.length - 1].v1;
}

export function loadMotion(rel) {
  const m = readJson(rel);
  return {
    duration: m.Meta.Duration,
    fadeIn: m.Meta.FadeInTime ?? 0,
    fadeOut: m.Meta.FadeOutTime ?? 0,
    curves: m.Curves.map((c) => ({ target: c.Target, id: c.Id, segs: decodeCurve(c.Segments) })),
  };
}

// ---- exp3 ----
export function loadExpression(rel) {
  const e = readJson(rel);
  return (e.Parameters || []).map((p) => ({ id: p.Id, value: p.Value, blend: p.Blend || 'Add' }));
}

// Fade seconds that VTube Studio uses for each expression hotkey.
export function vtsFades() {
  const v = readJson('c_0120.vtube.json');
  const out = {};
  for (const h of v.Hotkeys) if (h.File) out[h.File] = h.FadeSecondsAmount;
  return out;
}

const smooth = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : 0.5 - 0.5 * Math.cos(Math.PI * x));

// Weight of a window [from, to) with symmetric fades; `to` may be Infinity.
export function windowWeight(t, from, to, fadeIn, fadeOut = fadeIn) {
  if (t < from || t >= to + fadeOut) return 0;
  const a = fadeIn > 0 ? smooth((t - from) / fadeIn) : 1;
  const b = t < to ? 1 : fadeOut > 0 ? 1 - smooth((t - to) / fadeOut) : 0;
  return a * b;
}

export { evalSegments };
