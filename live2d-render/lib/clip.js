// Turns a clip script into a per-frame parameter vector.
//
// Clip script shape (all times in clip seconds):
// {
//   size: [w, h], fps: 30, duration: 2.0, warmup: 1.0,
//   transform(t) -> { x, y, scale, rotation },        // canvas placement of the model
//   params(t, ctx) -> { ParamAngleX: 10, ... },        // scripted base values
//   idle: true,                                         // loop VTS idle.motion3 underneath
//   motions: [{ file, at, speed?, fadeIn?, fadeOut?, loop?, hold?, holdAt?, until? }], // hold: freeze on last frame / at holdAt s
//   expressions: [{ file, from, to?, fade?, weight? }],
//   blinks: [t, ...] | { seed, from?, to? },            // explicit blink times or seeded random
//   parts: { PartId: opacity } | (t) -> { ... },        // part opacity overrides (hide desk, show props)
//   outline: 9,                                         // baked white sticker border (px), 0 = none
//   hideDrawables: ['ArtMesh38', ...] | (t) -> [...],   // drawables forced invisible (finer than parts)
// }
import { loadMotion, loadExpression, vtsFades, windowWeight, evalSegments } from './live2d-data.js';

function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function blinkTimes(spec, start, end) {
  if (Array.isArray(spec)) return spec;
  const rnd = mulberry32(spec.seed ?? 1);
  const out = [];
  let t = start + 0.6 + rnd() * 1.5;
  while (t < end) { out.push(t); t += 1.8 + rnd() * 3.2; if (rnd() < 0.15) out.push(t - 1.6); }
  return out.sort((a, b) => a - b);
}

// 0 = closed, 1 = open; ~0.2s blink, fast close / slower open
function blinkValue(times, t) {
  let v = 1;
  for (const b of times) {
    const d = t - b;
    if (d < 0 || d > 0.22) continue;
    v = Math.min(v, d < 0.07 ? 1 - d / 0.07 : (d - 0.07) / 0.15);
  }
  return Math.max(0, v);
}

export function prepare(clip, info) {
  const index = new Map(info.params.map((p, i) => [p.id, i]));
  const partIndex = new Map(info.parts.map((p, i) => [p, i]));
  const fades = vtsFades();
  const idle = clip.idle !== false ? loadMotion('motions/idle.motion3.json') : null;
  const motions = (clip.motions || []).map((m) => ({ ...m, data: loadMotion(m.file) }));
  const exprs = (clip.expressions || []).map((e) => ({
    ...e,
    fade: e.fade ?? fades[e.file] ?? 0.25,
    data: loadExpression(e.file),
  }));
  const warm = clip.warmup ?? 1;
  const blinks = clip.blinks ? blinkTimes(clip.blinks, -warm, clip.duration) : [];

  return (t) => {
    const v = info.params.map((p) => p.def);
    const parts = new Map();
    const set = (id, val, w = 1) => {
      const i = index.get(id);
      if (i === undefined) return;
      v[i] = v[i] * (1 - w) + val * w;
    };

    if (idle) {
      const lt = ((t % idle.duration) + idle.duration) % idle.duration;
      for (const c of idle.curves) if (c.target === 'Parameter') set(c.id, evalSegments(c.segs, lt));
    }

    const base = clip.params ? clip.params(t, { blinks }) : {};
    for (const [id, val] of Object.entries(base)) set(id, val);

    for (const m of motions) {
      const speed = m.speed ?? 1;
      const len = m.data.duration / speed;
      const end = m.loop || m.hold || m.holdAt != null ? (m.until ?? Infinity) : m.at + len;
      const fadeIn = m.fadeIn ?? m.data.fadeIn;
      const fadeOut = m.fadeOut ?? m.data.fadeOut;
      const w = windowWeight(t, m.at, end, fadeIn, fadeOut);
      if (w <= 0) continue;
      let lt = (t - m.at) * speed;
      lt = m.loop ? lt % m.data.duration : Math.min(lt, m.holdAt ?? m.data.duration);
      for (const c of m.data.curves) {
        const val = evalSegments(c.segs, lt);
        if (c.target === 'Parameter') set(c.id, val, w);
        else if (c.target === 'PartOpacity' && partIndex.has(c.id)) parts.set(partIndex.get(c.id), val);
      }
    }

    for (const e of exprs) {
      const w = windowWeight(t, e.from, e.to ?? Infinity, e.fade) * (e.weight ?? 1);
      if (w <= 0) continue;
      for (const p of e.data) {
        const i = index.get(p.id);
        if (i === undefined) continue;
        if (p.blend === 'Add') v[i] += p.value * w;
        else if (p.blend === 'Multiply') v[i] *= 1 + (p.value - 1) * w;
        else v[i] = v[i] * (1 - w) + p.value * w;
      }
    }

    const po = typeof clip.parts === 'function' ? clip.parts(t) : clip.parts;
    if (po) for (const [id, val] of Object.entries(po)) if (partIndex.has(id)) parts.set(partIndex.get(id), val);

    if (blinks.length) {
      const b = blinkValue(blinks, t);
      for (const id of ['ParamEyeLOpen', 'ParamEyeROpen']) v[index.get(id)] *= b;
    }

    info.params.forEach((p, i) => { v[i] = Math.min(p.max, Math.max(p.min, v[i])); });
    return { params: v, parts: [...parts] };
  };
}
