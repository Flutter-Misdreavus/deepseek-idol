// The grey infinite space of S2 (and its call-back in S7a): soft horizon, glossy floor with a reflection,
// floating dust, plus the small hallucination disclaimer used by both sections.
import { AbsoluteFill } from 'remotion';
import { UI } from '../data/copy';
import { rnd } from '../lib/anim';
import { F } from '../lib/fonts';

export type VoidTone = { sky0: string; sky1: string; floor0: string; floor1: string; glow: string; line: string };

/** S2: bright light grey */
export const GREY: VoidTone = { sky0: '#C7C7CF', sky1: '#ECECEF', floor0: '#E2E2E6', floor1: '#B9B9C2', glow: '#FFFFFF', line: '#FFFFFF' };
/** S7a: the same space at dusk, muted */
export const DUSK: VoidTone = { sky0: '#7E7E89', sky1: '#B4B4BC', floor0: '#A9A9B2', floor1: '#6E6E79', glow: '#D6D6DC', line: '#C9C9D0' };

/** sky + floor + horizon glow + faint perspective tiles; drawn oversize so a moving camera never sees its edge */
export const VoidBG: React.FC<{ horizon: number; tone?: VoidTone; tiles?: number; vx?: number }> = ({ horizon, tone = GREY, tiles = 0.22, vx = 960 }) => {
  const W = 1920 * 3, x0 = -1920;
  const rays = Array.from({ length: 25 }, (_, i) => (i - 12) * 420);
  const rows = Array.from({ length: 9 }, (_, i) => horizon + 8 * (i + 1) ** 2.1);
  return (
    <div style={{ position: 'absolute', left: x0, top: -1080, width: W, height: 3240 }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: 1080 + horizon, background: `linear-gradient(180deg, ${tone.sky0} 0%, ${tone.sky0} 30%, ${tone.sky1} 100%)` }} />
      <div style={{ position: 'absolute', left: 0, top: 1080 + horizon, width: W, height: 2160 - horizon, background: `linear-gradient(180deg, ${tone.floor0} 0px, ${tone.floor1} 700px, ${tone.floor1} 100%)` }} />
      <svg width={W} height={3240} style={{ position: 'absolute', left: 0, top: 0 }}>
        <g transform={`translate(${-x0} 1080)`} stroke={tone.line} strokeWidth={2} opacity={tiles} fill="none">
          {rays.map((dx, i) => <line key={i} x1={vx} y1={horizon} x2={vx + dx * 6} y2={horizon + 2400} />)}
          {rows.map((y, i) => <line key={`r${i}`} x1={-1920} y1={y} x2={3840} y2={y} opacity={Math.min(1, (y - horizon) / 200)} />)}
        </g>
      </svg>
      {/* horizon glow */}
      <div style={{
        position: 'absolute', left: 0, top: 1080 + horizon - 70, width: W, height: 140,
        background: `linear-gradient(180deg, transparent, ${tone.glow} 50%, transparent)`, opacity: 0.75,
      }} />
    </div>
  );
};

/** renders `children` (laid out in frame coordinates) plus their reflection mirrored about y = axis */
export const Mirror: React.FC<{ axis: number; opacity?: number; fade?: number; blur?: number; children: React.ReactNode }> = ({
  axis, opacity = 0.32, fade = 380, blur = 2, children,
}) => {
  const mask = `linear-gradient(180deg, transparent ${axis}px, rgba(0,0,0,${opacity}) ${axis}px, transparent ${axis + fade}px)`;
  return (
    <>
      <AbsoluteFill style={{ WebkitMaskImage: mask, maskImage: mask, overflow: 'visible' }}>
        <AbsoluteFill style={{ transform: 'scaleY(-1)', transformOrigin: `50% ${axis}px`, filter: blur ? `blur(${blur}px)` : undefined, overflow: 'visible' }}>
          {children}
        </AbsoluteFill>
      </AbsoluteFill>
      <AbsoluteFill style={{ overflow: 'visible' }}>{children}</AbsoluteFill>
    </>
  );
};

/** soft contact shadow on the floor; `lift` 0 = touching, 1 = high above */
export const FloorShadow: React.FC<{ x: number; y: number; w: number; lift?: number; color?: string }> = ({ x, y, w, lift = 0, color = '30,30,45' }) => {
  const k = 1 - 0.55 * Math.min(1, lift);
  return (
    <div style={{
      position: 'absolute', left: x - (w * k) / 2, top: y - w * k * 0.06, width: w * k, height: w * k * 0.12, borderRadius: '50%',
      background: `radial-gradient(closest-side, rgba(${color},${0.35 * k}), rgba(${color},0))`,
    }} />
  );
};

/** dust motes drifting up through the void */
export const Motes: React.FC<{ t: number; n?: number; color?: string; opacity?: number; seed?: number; fall?: boolean }> = ({
  t, n = 34, color = '#FFFFFF', opacity = 0.7, seed = 0, fall = false,
}) => (
  <>
    {Array.from({ length: n }, (_, i) => {
      const k = i + seed * 100;
      const sp = 14 + rnd(k, 1) * 26;
      const r = 2 + rnd(k, 2) * 5;
      const x = ((rnd(k, 3) * 2100 + Math.sin(t * 0.5 + k) * 30) % 2100) - 90;
      const y0 = rnd(k, 4) * 1240;
      const y = (((fall ? y0 + t * sp : y0 - t * sp) % 1240) + 1240) % 1240 - 80;
      return (
        <div key={i} style={{
          position: 'absolute', left: x, top: y, width: r * 2, height: r * 2, borderRadius: '50%', background: color,
          opacity: opacity * (0.35 + 0.65 * rnd(k, 5)), filter: r > 5 ? 'blur(2px)' : undefined,
        }} />
      );
    })}
  </>
);

/** warning triangle icon (instead of the ⚠ glyph, which falls back to a system font) */
export const WarnIcon: React.FC<{ size: number; color?: string; mark?: string }> = ({ size, color = '#F2B33D', mark = '#2A2A33' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path d="M12 2.5 L23 21.5 L1 21.5 Z" fill={color} stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
    <rect x={10.9} y={8.6} width={2.2} height={7.2} rx={1.1} fill={mark} />
    <circle cx={12} cy={18.4} r={1.35} fill={mark} />
  </svg>
);

/** the running gag: the small grey "内容由 AI 生成，可能包含幻觉" line */
export const Disclaimer: React.FC<{ size?: number; color?: string; style?: React.CSSProperties }> = ({ size = 26, color = '#8A8F98', style }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.35, fontFamily: F.zh, fontWeight: 400, fontSize: size, color, whiteSpace: 'nowrap', ...style }}>
    <WarnIcon size={size * 0.95} color={color} mark="#fff" />
    <span>{UI.disclaimer}</span>
  </div>
);
