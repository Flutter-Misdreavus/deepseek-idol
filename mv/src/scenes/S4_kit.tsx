// S4 rap kit: black + red. Liquid smears, hand-drawn red scribbles, mixed-size Ming lyrics, slice glitch,
// noise-text fields, line-art stills, and the props of the jealous old versions (freebie sticker, pixel shades, crown).
import { useId } from 'react';
import { AbsoluteFill, Easing, Img, staticFile } from 'remotion';
import { prog, rnd } from '../lib/anim';
import { F } from '../lib/fonts';
import { star, Whale } from '../lib/whale';

export const INK = '#0B0B0E';
export const RED = '#E0263C';
export const HOT = '#FF3B5C';
export const WINE = '#4A0A18';
/** off-white of the lyric type (the official MV's warm white) */
export const BONE = '#F2ECE4';

const outBack = Easing.out(Easing.back(2.2));
const outQuad = Easing.out(Easing.quad);
const inCubic = Easing.in(Easing.cubic);

/** accelerating 0 -> 1 from `at` over `dur` beats (lib/anim has no ease-in) */
export const easeIn = (beat: number, at: number, dur: number) => inCubic(prog(beat, at, dur));

/* ───────── liquid red smear (blurred drifting blobs + one hot streak) ───────── */

export const Smear: React.FC<{ beat: number; seed?: number; amount?: number; streak?: number; colors?: string[] }> = ({
  beat, seed = 0, amount = 1, streak = 0, colors = [WINE, RED, '#7A0E26', HOT, WINE, '#2A0710', '#9E1232'],
}) => {
  const id = useId().replace(/:/g, '');
  const t = beat * 0.16;
  // streak: a long tapered diagonal band, slowly sliding
  const sx = 120 + 240 * rnd(seed, 40) + 18 * Math.sin(t * 0.7);
  return (
    <AbsoluteFill style={{ opacity: amount, overflow: 'hidden', pointerEvents: 'none' }}>
      <svg width={1920} height={1080} viewBox="0 0 480 270" preserveAspectRatio="none">
        <defs>
          <filter id={`b${id}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation={8} />
          </filter>
          <filter id={`s${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={1.2} />
          </filter>
        </defs>
        <g filter={`url(#b${id})`}>
          {colors.map((c, i) => {
            const s = seed * 17 + i;
            const cx = 480 * rnd(s, 1) + 60 * Math.sin(t + rnd(s, 2) * 6);
            const cy = 270 * rnd(s, 3) + 34 * Math.cos(t * 0.8 + rnd(s, 4) * 6);
            const rx = 50 + 90 * rnd(s, 5), ry = 12 + 30 * rnd(s, 6);
            const rot = rnd(s, 7) * 180 + 25 * Math.sin(t * 0.5 + i);
            return <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill={c} opacity={0.5 + 0.5 * rnd(s, 8)} transform={`rotate(${rot} ${cx} ${cy})`} />;
          })}
        </g>
        {streak > 0 && (
          <path
            d={`M${sx} 300 C${sx + 30} 200 ${sx + 70} 90 ${sx + 150} -30 L${sx + 172} -30 C${sx + 100} 90 ${sx + 62} 200 ${sx + 26} 300 Z`}
            fill={HOT} opacity={streak} filter={`url(#s${id})`}
          />
        )}
      </svg>
    </AbsoluteFill>
  );
};

/* ───────── hand-drawn scribbles: seeded noise polylines drawn on with stroke-dash ───────── */

type Pt = [number, number];
const f1 = (n: number) => n.toFixed(1);

/** smooth path through points (midpoint quadratics) */
const smooth = (pts: Pt[]) => {
  let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i];
    const [nx, ny] = pts[i + 1];
    d += ` Q${f1(x)} ${f1(y)} ${f1((x + nx) / 2)} ${f1((y + ny) / 2)}`;
  }
  const l = pts[pts.length - 1];
  return `${d} L${f1(l[0])} ${f1(l[1])}`;
};

/** back-and-forth strike-through along a segment */
export const strike = (x1: number, y1: number, x2: number, y2: number, seed: number, passes = 2, amp = 8) => {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const n = Math.max(4, Math.round(len / 70));
  const nx = -(y2 - y1) / len, ny = (x2 - x1) / len;
  const pts: Pt[] = [];
  for (let p = 0; p < passes; p++) {
    for (let i = 0; i <= n; i++) {
      const u = -0.03 + 1.06 * (p % 2 ? 1 - i / n : i / n);
      const off = (rnd(seed * 31 + p * 7 + i, 3) - 0.5) * 2 * amp + p * amp;
      pts.push([x1 + (x2 - x1) * u + nx * off, y1 + (y2 - y1) * u + ny * off]);
    }
  }
  return smooth(pts);
};

/** a loose loop circling something */
export const loop = (cx: number, cy: number, rx: number, ry: number, seed: number, turns = 1.3, jit = 0.07) => {
  const n = Math.round(26 * turns);
  const a0 = rnd(seed, 1) * Math.PI * 2;
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + (i / n) * turns * Math.PI * 2;
    const k = 1 + (rnd(seed, i + 10) - 0.5) * 2 * jit + 0.08 * (i / n);
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return smooth(pts);
};

/** sharp zigzag hatching over a box (vertical = strokes go left-right while advancing down) */
export const zig = (x: number, y: number, w: number, h: number, seed: number, n = 8, vertical = true) => {
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n + (rnd(seed, i + 50) - 0.5) * (0.4 / n);
    const side = (i % 2) + (rnd(seed, i) - 0.5) * 0.25;
    pts.push(vertical ? `${f1(x + side * w)} ${f1(y + u * h)}` : `${f1(x + u * w)} ${f1(y + side * h)}`);
  }
  return `M${pts.join(' L')}`;
};

/** gently curved arrow with an open head */
export const arrow = (x1: number, y1: number, x2: number, y2: number, seed: number, head = 36) => {
  const bend = (rnd(seed, 1) - 0.5) * 0.5;
  const mx = (x1 + x2) / 2 - (y2 - y1) * bend, my = (y1 + y2) / 2 + (x2 - x1) * bend;
  const a = Math.atan2(y2 - my, x2 - mx);
  const h = (s: number) => `${f1(x2 - head * Math.cos(a + s))} ${f1(y2 - head * Math.sin(a + s))}`;
  return `M${f1(x1)} ${f1(y1)} Q${f1(mx)} ${f1(my)} ${f1(x2)} ${f1(y2)} M${h(0.5)} L${f1(x2)} ${f1(y2)} L${h(-0.5)}`;
};

/** an angry tangle inside a box */
export const chaos = (x: number, y: number, w: number, h: number, seed: number, n = 14) =>
  smooth(Array.from({ length: n }, (_, i): Pt => [x + rnd(seed, i * 2) * w, y + rnd(seed, i * 2 + 1) * h]));

export type Scrib = { d: string; at: number; dur?: number; color?: string; w?: number; until?: number; op?: number };

/** full-frame layer of scribbles, each drawn on from `at` over `dur` beats */
export const Scribbles: React.FC<{ beat: number; items: Scrib[]; style?: React.CSSProperties }> = ({ beat, items, style }) => (
  <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none', ...style }}>
    {items.map((s, i) => {
      if (beat < s.at || (s.until !== undefined && beat >= s.until)) return null;
      const p = outQuad(prog(beat, s.at, s.dur ?? 0.4));
      return (
        <path key={i} d={s.d} pathLength={1} fill="none" stroke={s.color ?? RED} strokeWidth={s.w ?? 6} strokeLinecap="round"
          strokeLinejoin="round" strokeDasharray={`${p} 2`} opacity={s.op ?? 1} />
      );
    })}
  </svg>
);

/* ───────── mixed-size Ming lyric: segments of different sizes, every character on its own beat ───────── */

export type Seg = {
  t: string;
  size: number;
  /** beat of the first character */
  at: number;
  /** beats between characters (default 0.2) */
  step?: number;
  color?: string;
  weight?: number;
  stamp?: boolean;
  /** Latin run inside a vertical column: rotated sideways, pops as one piece */
  sideways?: boolean;
  stroke?: string;
  /** extra offset along the cross axis (px) */
  shift?: number;
};

/** RGB-split text shadow */
export const rgbSplit = (px: number) => (px < 0.3 ? undefined : `${-px}px 0 rgba(255,40,80,.85), ${px}px 0 rgba(60,210,255,.6)`);

export const Lyric: React.FC<{
  beat: number;
  segs: Seg[];
  vertical?: boolean;
  /** gone from this beat */
  until?: number;
  /** RGB split px */
  rgb?: number;
  /** 0..1 per-character glitch jitter, re-rolled every `tick` */
  jitter?: number;
  tick?: number;
  seed?: number;
  style?: React.CSSProperties;
}> = ({ beat, segs, vertical = false, until, rgb = 0, jitter = 0, tick = 0, seed = 0, style }) => {
  if (until !== undefined && beat >= until) return null;
  let k = 0;
  const glyph = (ch: string, s: Seg, at: number, key: string, sideways = false) => {
    const kk = k++;
    const p = prog(beat, at, s.stamp ? 0.22 : 0.28);
    const box: React.CSSProperties = {
      fontFamily: F.serif, fontWeight: s.weight ?? 700, fontSize: s.size, lineHeight: 1, display: 'inline-block',
      writingMode: sideways ? 'vertical-rl' : undefined, whiteSpace: 'nowrap',
    };
    if (p <= 0) return <span key={key} style={{ ...box, visibility: 'hidden' }}>{ch}</span>;
    const e = outBack(p);
    const sc = s.stamp ? 2.3 - 1.3 * e : 1.5 - 0.5 * e;
    const rot = s.stamp ? (kk % 2 ? 1 : -1) * (1 - p) * 14 : 0;
    const j = jitter > 0 && rnd(seed * 97 + kk, tick) < 0.45 * jitter + 0.1 ? jitter : 0;
    const jx = j ? (rnd(seed * 13 + kk, tick + 3) - 0.5) * s.size * 0.5 * j : 0;
    const jy = j ? (rnd(seed * 17 + kk, tick + 5) - 0.5) * s.size * 0.25 * j : 0;
    return (
      <span key={key} style={{
        ...box, color: s.color ?? BONE, opacity: Math.min(1, p * 3),
        transform: `translate(${jx}px, ${jy}px) scale(${sc}) rotate(${rot}deg)`,
        textShadow: rgbSplit(rgb + j * 10),
        WebkitTextStroke: s.stroke ? `${Math.max(2, s.size * 0.035)}px ${s.stroke}` : undefined, paintOrder: 'stroke fill',
      }}>{ch}</span>
    );
  };
  return (
    <div style={{ display: 'flex', flexDirection: vertical ? 'column' : 'row', alignItems: vertical ? 'center' : 'flex-end', ...style }}>
      {segs.map((s, si) => {
        const step = s.step ?? 0.2;
        const shift = s.shift ? (vertical ? { marginLeft: s.shift * 2 } : { marginBottom: s.shift }) : {};
        if (vertical && s.sideways) return <div key={si} style={shift}>{glyph(s.t, s, s.at, `${si}`, true)}</div>;
        return (
          <div key={si} style={{ display: 'flex', flexDirection: vertical ? 'column' : 'row', alignItems: vertical ? 'center' : 'flex-end', ...shift }}>
            {[...s.t].map((ch, ci) => glyph(ch, s, s.at + ci * step, `${si}_${ci}`))}
          </div>
        );
      })}
    </div>
  );
};

/* ───────── slice glitch: the content repeated in horizontal bands, each shoved sideways ───────── */

export const Glitch: React.FC<{ amount: number; tick: number; seed?: number; n?: number; bars?: string; children: React.ReactNode }> = ({
  amount, tick, seed = 0, n = 7, bars = HOT, children,
}) => {
  if (amount < 0.03) return <AbsoluteFill>{children}</AbsoluteFill>;
  const cuts = [0, ...Array.from({ length: n - 1 }, (_, i) => rnd(seed * 31 + tick, i + 1)).sort(), 1];
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {cuts.slice(0, -1).map((c0, i) => {
        const c1 = cuts[i + 1];
        const move = rnd(seed * 7 + tick, i + 40) < 0.65 ? 1 : 0;
        const dx = (rnd(seed * 11 + tick, i + 20) - 0.5) * 2 * amount * 220 * move;
        return (
          <AbsoluteFill key={i} style={{ clipPath: `inset(${f1(c0 * 1080)}px 0 ${f1((1 - c1) * 1080)}px 0)`, transform: `translateX(${f1(dx)}px)` }}>
            {children}
          </AbsoluteFill>
        );
      })}
      {Array.from({ length: Math.round(4 * amount) }, (_, i) => (
        <div key={`bar${i}`} style={{
          position: 'absolute', left: 0, right: 0, top: rnd(seed * 3 + tick, i + 70) * 1080, height: 4 + rnd(seed + tick, i + 80) * 26,
          background: i % 2 ? bars : BONE, opacity: 0.5 + 0.5 * rnd(tick, i + 90), mixBlendMode: i % 2 ? 'normal' : 'difference',
        }} />
      ))}
    </AbsoluteFill>
  );
};

/* ───────── noise-text field: a grid of flickering repeated characters ───────── */

export const NoiseField: React.FC<{
  beat: number;
  glyphs: string;
  cell?: number;
  /** 'rows': one glyph per row; 'cols': the phrase read down each column; 'random' */
  mode?: 'rows' | 'cols' | 'random';
  seed?: number;
  /** glyph re-rolls per beat (random mode) and flicker rate */
  rate?: number;
  color?: string;
  accent?: string;
  /** share of cells drawn in the accent colour */
  red?: number;
  /** minimum cell opacity (flicker floor) */
  floor?: number;
  /** scroll (px): rows slide sideways in alternating directions, cols slide vertically */
  scroll?: number;
  weight?: number;
  style?: React.CSSProperties;
}> = ({
  beat, glyphs, cell = 60, mode = 'random', seed = 0, rate = 4, color = BONE, accent = HOT, red = 0.08, floor = 0.35, scroll = 0,
  weight = 700, style,
}) => {
  const chars = [...glyphs];
  const cols = Math.ceil(1920 / cell) + 2, rows = Math.ceil(1080 / cell) + 2;
  const tick = Math.floor(beat * rate);
  const out: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    const rowShift = mode === 'rows' ? ((((r % 2 ? 1 : -1) * scroll) % cell) + cell) % cell - cell : -cell / 2;
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const colShift = mode === 'cols' ? (((((c % 2 ? 1 : -1) * scroll) % cell) + cell) % cell) - cell : 0;
      const ch = mode === 'rows' ? chars[r % chars.length]
        : mode === 'cols' ? chars[(r + c * 3) % chars.length]
          : chars[Math.floor(rnd(i + seed * 1000, Math.floor(tick / (1 + Math.floor(rnd(i, seed + 5) * 3)))) * chars.length)];
      const op = floor + (1 - floor) * rnd(i + seed * 500, tick);
      out.push(
        <span key={i} style={{
          position: 'absolute', left: c * cell + rowShift, top: r * cell + colShift - cell / 2, width: cell, height: cell, fontSize: cell * 0.82,
          lineHeight: `${cell}px`, textAlign: 'center', fontFamily: F.serif, fontWeight: weight,
          color: rnd(i + seed * 300, 7) < red ? accent : color, opacity: op,
        }}>{ch}</span>,
      );
    }
  }
  return <AbsoluteFill style={{ overflow: 'hidden', ...style }}>{out}</AbsoluteFill>;
};

/* ───────── line art from a cel still (Laplacian edge filter): the official MV's sketched ghosts ───────── */

export const LineArt: React.FC<{
  src: string; x: number; y: number; w: number; ink?: string; gain?: number; style?: React.CSSProperties;
}> = ({ src, x, y, w, ink = '#FFFFFF', gain = 5, style }) => {
  const id = `la${useId().replace(/:/g, '')}`;
  const hex = ink.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return (
    <>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <filter id={id} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0 0 0 1 0" />
          <feConvolveMatrix order={3} kernelMatrix="1 1 1 1 -8 1 1 1 1" divisor={1} preserveAlpha />
          <feColorMatrix type="matrix" values={`0 0 0 0 ${r}  0 0 0 0 ${g}  0 0 0 0 ${b}  ${gain} 0 0 0 -0.15`} />
        </filter>
      </svg>
      <Img src={staticFile(`img/${src}.png`)} style={{
        position: 'absolute', left: x, top: y, width: w, transform: 'translate(-50%,-50%)', filter: `url(#${id})`, ...style,
      }} />
    </>
  );
};

/* ───────── props ───────── */

/** red starburst price sticker: 「赠品」 */
export const Freebie: React.FC<{ size: number; text: string; sub: string }> = ({ size, text, sub }) => (
  <svg width={size} height={size} viewBox="-60 -60 120 120" style={{ overflow: 'visible', filter: 'drop-shadow(0 4px 4px rgba(0,0,0,.45))' }}>
    <path d={star(0, 0, 58, 50, 18)} fill="#fff" />
    <path d={star(0, 0, 52, 44, 18)} fill={RED} />
    <circle r={37} fill="none" stroke="#fff" strokeWidth={1.6} strokeDasharray="3 2.4" />
    <text y={6} textAnchor="middle" fontFamily={F.serif} fontWeight={900} fontSize={29} fill="#fff">{text}</text>
    <text y={24} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={10} letterSpacing={2} fill="#FFD9DF">{sub}</text>
  </svg>
);

/** "deal with it" pixel sunglasses, 25 x 6 cells */
const SHADES: string[] = [
  '#########################',
  '##.w.w.####.###.w.w.####.',
  '.#.w.w..###...#.w.w..###.',
  '.##w.w..##.....##w.w..##.',
  '..#######.......#######..',
  '...#####.........#####...',
];
export const PixelShades: React.FC<{ w: number }> = ({ w }) => {
  const u = w / 25;
  return (
    <svg width={w} height={u * 6} viewBox="0 0 25 6" shapeRendering="crispEdges" style={{ overflow: 'visible' }}>
      {SHADES.flatMap((row, y) => [...row].map((c, x) => (c === '.' ? null : (
        <rect key={`${x}_${y}`} x={x} y={y} width={1.02} height={1.02} fill={c === 'w' ? '#fff' : '#000'} />
      ))))}
    </svg>
  );
};

/** code-drawn crown, flat cel look: gold, one hard highlight, red and white jewels */
export const Crown: React.FC<{ w: number; style?: React.CSSProperties }> = ({ w, style }) => (
  <svg width={w} height={w * 0.72} viewBox="0 0 200 144" style={{ overflow: 'visible', ...style }}>
    <g stroke={INK} strokeWidth={7} strokeLinejoin="round">
      <path d="M14 116 L8 34 L58 74 L100 12 L142 74 L192 34 L186 116 Z" fill="#F7B733" />
      <rect x={12} y={108} width={176} height={28} rx={6} fill="#F29A38" />
    </g>
    <path d="M24 98 L20 52 L56 84 Z" fill="#FFE27A" />
    <path d="M100 30 L118 64 L100 92 L84 64 Z" fill="#FFE27A" opacity={0.8} />
    {[[8, 34], [100, 12], [192, 34]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={11} fill="#fff" stroke={INK} strokeWidth={6} />)}
    {[52, 100, 148].map((x, i) => <circle key={i} cx={x} cy={122} r={8} fill={i === 1 ? HOT : '#fff'} stroke={INK} strokeWidth={4} />)}
  </svg>
);

/** the manga anger vein 💢, drawn in four strokes */
export const AngerMark: React.FC<{ size: number; color?: string }> = ({ size, color = HOT }) => (
  <svg width={size} height={size} viewBox="-20 -20 40 40" style={{ overflow: 'visible' }}>
    {[0, 90, 180, 270].map((r) => (
      <path key={r} d="M-3 -16 C-3 -8 -8 -3 -16 -3" fill="none" stroke={color} strokeWidth={4.5} strokeLinecap="round" transform={`rotate(${r})`} />
    ))}
  </svg>
);

/** manga concentration lines around (cx, cy), re-rolled every tick */
export const SpeedLines: React.FC<{ cx: number; cy: number; tick: number; color?: string; n?: number; r0?: number }> = ({
  cx, cy, tick, color = INK, n = 70, r0 = 330,
}) => (
  <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
    {Array.from({ length: n }, (_, i) => {
      const a = ((i + rnd(i, tick) * 0.6) / n) * Math.PI * 2;
      const w = 0.004 + rnd(i, tick + 9) * 0.014;
      const r = r0 * (0.75 + 0.6 * rnd(i, tick + 4));
      const R = 2400;
      return (
        <path key={i} fill={color} d={`M${f1(cx + r * Math.cos(a))} ${f1(cy + r * Math.sin(a))} L${f1(cx + R * Math.cos(a - w))} ${f1(cy + R * Math.sin(a - w))} L${f1(cx + R * Math.cos(a + w))} ${f1(cy + R * Math.sin(a + w))} Z`} />
      );
    })}
  </svg>
);

/** drifting outline whales and star outlines (the official MV's floating bunnies and stars) */
export const Debris: React.FC<{ beat: number; seed?: number; n?: number; opacity?: number; color?: string }> = ({
  beat, seed = 0, n = 14, opacity = 0.35, color = BONE,
}) => (
  <AbsoluteFill style={{ opacity, pointerEvents: 'none' }}>
    {Array.from({ length: n }, (_, i) => {
      const s = seed * 50 + i;
      const sp = 14 + rnd(s, 1) * 26;
      const x = ((rnd(s, 2) * 2200 - beat * sp) % 2200 + 2200) % 2200 - 140;
      const y = rnd(s, 3) * 1000 + 30 * Math.sin(beat * 0.4 + i);
      const size = 50 + rnd(s, 4) * 110;
      const rot = (rnd(s, 5) - 0.5) * 50 + beat * (rnd(s, 6) - 0.5) * 8;
      const isStar = rnd(s, 7) < 0.45;
      return (
        <div key={i} style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg)` }}>
          {isStar ? (
            <svg width={size * 0.6} height={size * 0.6} viewBox="-12 -12 24 24" style={{ overflow: 'visible' }}>
              <path d={star(0, 0, 11, 4.6, 5)} fill="none" stroke={color} strokeWidth={1.4} strokeLinejoin="round" />
            </svg>
          ) : (
            <Whale size={size} color="rgba(0,0,0,0)" belly="rgba(0,0,0,0)" line={color} blush={false} eye="dot" flip={rnd(s, 8) < 0.5} />
          )}
        </div>
      );
    })}
  </AbsoluteFill>
);

/** darkens the subtitle zone so busy backgrounds never fight the bottom subtitles */
export const SubShade: React.FC<{ color?: string; h?: number }> = ({ color = '11,11,14', h = 240 }) => (
  <div style={{
    position: 'absolute', left: 0, right: 0, bottom: 0, height: h, pointerEvents: 'none',
    background: `linear-gradient(180deg, rgba(${color},0) 0%, rgba(${color},.85) 70%, rgba(${color},.92) 100%)`,
  }} />
);

/** g10_sing_up.png (1536x1024) alpha outline, for clipping noise into her shape */
export const G10_PATH =
  'M1497 1023 L608 1023 L611 978 L617 951 L580 1006 L582 1023 L152 1023 L168 968 L211 895 L198 902 L174 931 L190 906 L165 919 L153 933 L115 960 L88 997 L78 1023 L0 1024 L-0 864 L57 826 L50 804 L50 780 L63 741 L41 763 L28 785 L24 811 L33 832 L26 825 L19 806 L24 766 L47 725 L79 695 L128 669 L184 653 L257 648 L331 617 L263 617 L255 613 L237 599 L228 580 L206 561 L199 546 L199 541 L205 535 L198 520 L186 518 L175 500 L170 477 L172 451 L177 436 L188 433 L190 421 L190 413 L181 401 L183 374 L200 340 L205 338 L213 340 L215 337 L221 324 L217 311 L232 283 L208 276 L196 279 L170 340 L154 355 L141 357 L139 349 L153 318 L166 272 L165 242 L113 274 L86 285 L63 286 L57 281 L56 274 L136 222 L157 201 L160 184 L70 161 L48 149 L38 136 L38 128 L51 123 L109 139 L168 148 L182 146 L196 134 L201 127 L201 118 L150 39 L142 21 L143 -0 L160 0 L204 63 L236 101 L287 135 L305 135 L327 96 L346 82 L359 81 L363 94 L338 148 L331 217 L357 214 L375 221 L455 278 L484 313 L526 384 L549 414 L565 398 L568 363 L582 318 L625 243 L680 178 L713 152 L743 135 L720 124 L708 113 L703 103 L702 89 L716 59 L748 31 L790 13 L822 10 L845 20 L855 37 L855 51 L847 68 L837 76 L818 82 L808 78 L806 69 L810 61 L811 72 L815 76 L823 77 L831 69 L836 54 L827 38 L813 31 L798 30 L765 40 L752 63 L749 89 L755 108 L768 124 L816 111 L845 107 L841 102 L861 92 L871 72 L885 56 L899 48 L921 42 L949 44 L981 59 L997 76 L1014 114 L1025 123 L1039 115 L1029 108 L1018 90 L1015 65 L1019 55 L1043 71 L1054 85 L1068 76 L1093 73 L1095 83 L1086 104 L1075 114 L1058 118 L1046 148 L1016 168 L1058 215 L1080 254 L1095 239 L1104 243 L1142 319 L1216 362 L1250 373 L1284 378 L1270 398 L1238 412 L1225 423 L1164 435 L1179 461 L1225 520 L1338 637 L1351 644 L1452 676 L1535 722 L1535 827 L1501 780 L1455 744 L1465 780 L1471 817 L1467 844 L1455 868 L1496 899 L1522 925 L1535 910 L1535 997 L1516 959 L1490 931 L1501 973 L1497 1023Z M115 802 L169 786 L198 752 L175 783 L185 782 L200 763 L199 752 L211 725 L266 672 L209 693 L157 728 L122 772 L112 799 L112 803 L115 802Z M1303 627 L1297 613 L1269 577 L1196 500 L1156 446 L1179 513 L1205 565 L1247 598 L1303 627Z M217 745 L225 737 L226 727 L237 707 L229 734 L295 691 L361 659 L311 661 L276 669 L226 714 L216 739 L217 745Z M1367 805 L1353 782 L1332 758 L1270 707 L1243 689 L1272 729 L1310 769 L1367 805Z M1452 864 L1460 842 L1462 821 L1457 793 L1437 757 L1403 726 L1422 759 L1432 787 L1437 814 L1434 848 L1452 864Z M1347 749 L1294 699 L1250 670 L1288 717 L1324 741 L1317 739 L1325 747 L1332 749 L1333 744 L1347 749Z M578 385 L593 362 L628 264 L619 270 L581 338 L576 357 L578 385Z M1296 629 L1208 575 L1217 593 L1241 612 L1296 629Z M1394 821 L1374 782 L1356 758 L1348 751 L1344 757 L1333 753 L1360 783 L1370 799 L1370 807 L1394 821Z';
