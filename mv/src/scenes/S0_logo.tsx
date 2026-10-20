// Title logo「我推的 DeepSeek」, after the official「アイドル」logo: lettering formed on an ink splash.
// Fully code-drawn (SVG blobs + droplets, heavy lettering, whale accent, star). Shared by s0e and s9b.
// The logo assembles piece by piece on an "assembly clock" `stage` (0 = nothing, LOGO_PIECES = complete):
// piece k pops while stage goes k -> k + 1, so a scene maps its hit beats to stage with `logoStage`.
import { Easing } from 'remotion';
import { clamp01, prog, rnd } from '../lib/anim';
import { StarFlare } from '../lib/deco';
import { F, preloadGlyphs } from '../lib/fonts';
import { C } from '../lib/palette';
import { star, Whale } from '../lib/whale';
import { S0_LOGO_NAME, S0_LOGO_OSHI } from '../data/copy_S0';

preloadGlyphs(S0_LOGO_OSHI + S0_LOGO_NAME);

/** splash, back splashes, 我推的 tag, "Deep", "Seek", whale + star */
export const LOGO_PIECES = 6;

/** stage value for a list of hit beats (one per piece), each piece popping over `dur` beats */
export const logoStage = (beat: number, hits: number[], dur = 0.45) => hits.reduce((s, a) => s + prog(beat, a, dur), 0);

const VW = 1200;
const VH = 680;
const back = Easing.out(Easing.back(2.2));
const cubicOut = Easing.out(Easing.cubic);

type Pt = [number, number];

/** closed Catmull-Rom spline through the points, as cubic Bezier SVG path */
const smooth = (p: Pt[]) => {
  const n = p.length;
  const f = (v: number) => v.toFixed(1);
  let d = `M${f(p[0][0])} ${f(p[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
    d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + 'Z';
};

export type Splash = { cx: number; cy: number; parts: string[]; drops: { x: number; y: number; r: number }[] };

/** an ink splat: lobed body, fat tapered streaks that end in round beads, loose droplets beyond them */
export const makeSplash = (cx: number, cy: number, rx: number, ry: number, seed: number, fingers: number, spray: number): Splash => {
  const n = 96;
  const f = (v: number) => v.toFixed(1);
  const sz = (rx + ry) / 2;
  const body = (a: number) =>
    1 + 0.09 * Math.sin(2 * a + seed) + 0.07 * Math.sin(3 * a + seed * 2.1) + 0.045 * Math.sin(5 * a + seed * 1.3) + 0.02 * Math.sin(11 * a + seed * 0.7);
  const pts: Pt[] = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const r = body(a);
    return [cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r];
  });
  const parts = [smooth(pts)];
  const drops: Splash['drops'] = [];
  for (let k = 0; k < fingers; k++) {
    const a = ((k + 0.5 + (rnd(k, seed) - 0.5) * 0.8) / fingers) * Math.PI * 2;
    const ux = Math.cos(a), uy = Math.sin(a);
    const br = body(a) * 0.93;
    const bx = cx + ux * rx * br, by = cy + uy * ry * br;
    // point `dist` px out from the streak base, `off` px sideways
    const Q = (dist: number, off: number): Pt => [bx + ux * dist - uy * off, by + uy * dist + ux * off];
    const len = sz * (0.1 + rnd(k, seed + 1) * 0.3);
    const w = sz * (0.07 + rnd(k, seed + 2) * 0.06);
    const tip = sz * (0.032 + rnd(k, seed + 3) * 0.03);
    const b1 = Q(0, w), b2 = Q(0, -w), t1 = Q(len, tip), t2 = Q(len, -tip);
    const c1 = Q(len * 0.6, tip * 0.55), c2 = Q(len * 0.6, -tip * 0.55);
    parts.push(
      `M${f(b1[0])} ${f(b1[1])} Q${f(c1[0])} ${f(c1[1])} ${f(t1[0])} ${f(t1[1])} A${f(tip + 0.5)} ${f(tip + 0.5)} 0 0 0 ${f(t2[0])} ${f(t2[1])} Q${f(c2[0])} ${f(c2[1])} ${f(b2[0])} ${f(b2[1])} Z`,
    );
    // a separated bead beyond most streaks
    if (rnd(k, seed + 4) > 0.3) {
      const [x, y] = Q(len + tip * 2.2 + sz * rnd(k, seed + 5) * 0.12, 0);
      drops.push({ x, y, r: tip * (0.55 + rnd(k, seed + 6) * 0.4) });
    }
  }
  for (let k = 0; k < spray; k++) {
    const a = rnd(k, seed + 7) * Math.PI * 2;
    const r = 1.22 + rnd(k, seed + 8) * 0.55;
    drops.push({ x: cx + Math.cos(a) * rx * r, y: cy + Math.sin(a) * ry * r, r: sz * (0.01 + rnd(k, seed + 9) * 0.022) });
  }
  return { cx, cy, parts, drops };
};

const MAIN = makeSplash(600, 372, 450, 238, 3, 15, 16);
const BACK = makeSplash(400, 300, 300, 196, 11, 11, 10);
const SIDE = makeSplash(905, 470, 190, 128, 23, 9, 7);

export const SplashLayer: React.FC<{ s: Splash; p: number; color: string; drift: number }> = ({ s, p, color, drift }) => {
  if (p <= 0) return null;
  const body = 0.15 + 0.85 * back(p);
  const fly = cubicOut(p);
  return (
    <g fill={color}>
      <g transform={`translate(${s.cx} ${s.cy}) scale(${body}) translate(${-s.cx} ${-s.cy})`}>{s.parts.map((d, i) => <path key={i} d={d} />)}</g>
      {s.drops.map((d, i) => {
        const x = s.cx + (d.x - s.cx) * fly + Math.sin(drift + i) * 2;
        const y = s.cy + (d.y - s.cy) * fly + Math.cos(drift * 0.8 + i) * 2;
        // droplets stretch along their flight while moving, then settle round
        const ang = (Math.atan2(d.y - s.cy, d.x - s.cx) * 180) / Math.PI;
        const st = 1 + 1.6 * (1 - fly);
        return <ellipse key={i} cx={x} cy={y} rx={d.r * st} ry={d.r / Math.sqrt(st)} transform={`rotate(${ang} ${x} ${y})`} />;
      })}
    </g>
  );
};

export const InkLogo: React.FC<{
  /** assembly clock, 0..LOGO_PIECES */
  stage: number;
  /** rendered width in px (height = 0.567 x width) */
  width: number;
  /** seconds, for the idle wobble */
  t?: number;
  /** 0..1 glint travelling across the lettering (the "complete" hit) */
  shine?: number;
  ink?: string;
  ink2?: string;
  ink3?: string;
  letter?: string;
  outline?: string;
  shadow?: string;
  tagBg?: string;
  tagFg?: string;
  starColor?: string;
  style?: React.CSSProperties;
}> = ({
  stage, width, t = 0, shine = 0, ink = '#1B2150', ink2 = '#FFFFFF', ink3 = C.yellow, letter = '#FFFFFF', outline = '#1B2150',
  shadow = C.hot, tagBg = '#FFFFFF', tagFg = C.hot, starColor = C.yellow, style,
}) => {
  const k = width / VW;
  const p = (i: number) => clamp01(stage - i);
  const pTag = p(2);
  const pWhale = p(5);
  const name = [...S0_LOGO_NAME];
  return (
    <div style={{ position: 'relative', width, height: VH * k, ...style }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: VW, height: VH, transform: `scale(${k})`, transformOrigin: '0 0' }}>
        <svg width={VW} height={VH} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <SplashLayer s={BACK} p={p(1)} color={ink2} drift={t * 1.3} />
          <SplashLayer s={SIDE} p={clamp01((stage - 1.25) * 1.2)} color={ink3} drift={t * 1.7} />
          <SplashLayer s={MAIN} p={p(0)} color={ink} drift={t} />
        </svg>
        {/* 我推的 tag, stamped on */}
        {pTag > 0 && (
          <div style={{
            position: 'absolute', left: 205, top: 128, transform: `scale(${1 + 1.2 * (1 - back(pTag))}) rotate(${-9 - 10 * (1 - pTag)}deg)`,
            opacity: Math.min(1, pTag * 3), background: tagBg, border: `7px solid ${outline}`, borderRadius: 26, padding: '6px 26px 10px',
            boxShadow: `7px 8px 0 ${outline}`,
          }}>
            <span style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 74, color: tagFg, letterSpacing: 4, lineHeight: 1 }}>{S0_LOGO_OSHI}</span>
          </div>
        )}
        {/* DeepSeek lettering: "Deep" is piece 3, "Seek" piece 4 */}
        <div style={{ position: 'absolute', left: 0, width: VW, top: 282, display: 'flex', justifyContent: 'center' }}>
          {name.map((ch, i) => {
            const q = clamp01((stage - (i < 4 ? 3 : 4) - (i % 4) * 0.13) / 0.6);
            const e = back(q);
            const bob = Math.sin(t * 3 + i * 0.8) * 4;
            return (
              <span key={i} style={{
                fontFamily: F.heavy, fontSize: 178, lineHeight: 1, color: letter, display: 'inline-block',
                WebkitTextStroke: `16px ${outline}`, paintOrder: 'stroke fill', textShadow: `9px 11px 0 ${shadow}`,
                transform: `translateY(${(1 - e) * -120 + bob}px) scale(${q > 0 ? 0.4 + 0.6 * e : 0}) rotate(${(1 - q) * (i % 2 ? 14 : -14) + (i % 2 ? 2 : -2)}deg)`,
                opacity: Math.min(1, q * 4), marginLeft: i === 4 ? 26 : -4,
              }}>{ch}</span>
            );
          })}
        </div>
        {/* whale riding on "Seek" + star */}
        {pWhale > 0 && (
          <>
            <div style={{
              position: 'absolute', left: 850, top: 128, transform: `translateY(${(1 - back(pWhale)) * 60 + Math.sin(t * 2.4) * 5}px) scale(${back(pWhale)}) rotate(${-6 + Math.sin(t * 2) * 3}deg)`,
              transformOrigin: '50% 100%',
            }}>
              <Whale size={280} sticker color="#9CCBFF" eye="star" flip spout={0.55 + 0.25 * Math.sin(t * 4)} wag={Math.sin(t * 5) * 8} />
            </div>
            <svg width={VW} height={VH} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
              <g transform={`translate(1150 196) scale(${back(clamp01((stage - 5.2) / 0.8))}) rotate(${12 + Math.sin(t * 1.5) * 8})`}>
                <path d={star(0, 0, 62, 27)} fill={starColor} stroke={outline} strokeWidth={9} strokeLinejoin="round" />
                <path d={star(-6, -8, 26, 11)} fill="#fff" opacity={0.75} />
              </g>
              {[[150, 470, 30], [1110, 560, 24], [480, 92, 20], [160, 250, 18]].map(([x, y, r], i) => {
                const s = back(clamp01((stage - 5.1 - i * 0.12) / 0.6)) * (0.8 + 0.2 * Math.sin(t * 5 + i * 2));
                return <path key={i} d={sparkle(x, y, r * s)} fill="#fff" stroke={outline} strokeWidth={4} strokeLinejoin="round" />;
              })}
            </svg>
          </>
        )}
        {shine > 0 && shine < 1 && (
          <StarFlare x={170 + 860 * Easing.inOut(Easing.cubic)(shine)} y={300} size={110 * Math.sin(Math.PI * shine) + 20} rot={shine * 90} />
        )}
      </div>
    </div>
  );
};

/** 4-point sparkle path */
const sparkle = (x: number, y: number, r: number) => {
  const w = r * 0.28;
  return `M${x} ${y - r} Q${x + w * 0.3} ${y - w * 0.3} ${x + r} ${y} Q${x + w * 0.3} ${y + w * 0.3} ${x} ${y + r} Q${x - w * 0.3} ${y + w * 0.3} ${x - r} ${y} Q${x - w * 0.3} ${y - w * 0.3} ${x} ${y - r} Z`;
};
