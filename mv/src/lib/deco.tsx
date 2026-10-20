// Code-drawn decoration shared by scenes: whale pattern, sunburst, star flares, ink stamp, confetti, stills.
import { useId } from 'react';
import { Img, staticFile } from 'remotion';
import { F } from './fonts';
import { rnd } from './anim';
import { heart, star, Whale } from './whale';

/** Diagonal grid of whale silhouettes (the official MV's bunny wallpaper), scrolling by `offset` px. */
export const WhalePattern: React.FC<{
  color: string;
  offset: number;
  size?: number;
  gap?: number;
  opacity?: number;
}> = ({ color, offset, size = 120, gap = 210, opacity = 1 }) => {
  const cols = Math.ceil(1920 / gap) + 3;
  const rows = Math.ceil(1080 / (gap * 0.75)) + 3;
  const ox = ((offset % gap) + gap) % gap;
  const oy = ((offset * 0.6) % (gap * 1.5) + gap * 1.5) % (gap * 1.5);
  const items: React.ReactNode[] = [];
  for (let r = -1; r < rows; r++) {
    for (let c = -1; c < cols; c++) {
      const x = c * gap + (r % 2 ? gap / 2 : 0) + ox - gap;
      const y = r * gap * 0.75 + oy - gap * 1.5;
      items.push(
        <div key={`${r}_${c}`} style={{ position: 'absolute', left: x, top: y }}>
          <Whale size={size} silhouette color={color} eye="none" flip={((r + c) & 1) === 1} />
        </div>,
      );
    }
  }
  return <div style={{ position: 'absolute', inset: 0, opacity, overflow: 'hidden' }}>{items}</div>;
};

/** Alternating ray wedges around (cx, cy). */
export const Sunburst: React.FC<{ cx: number; cy: number; a: string; b: string; rays?: number; rot?: number }> = ({
  cx, cy, a, b, rays = 18, rot = 0,
}) => {
  const R = 2600;
  const paths = [];
  for (let i = 0; i < rays; i++) {
    const t0 = ((i * 2) / (rays * 2)) * Math.PI * 2 + rot;
    const t1 = ((i * 2 + 1) / (rays * 2)) * Math.PI * 2 + rot;
    paths.push(<path key={i} d={`M${cx} ${cy} L${cx + R * Math.cos(t0)} ${cy + R * Math.sin(t0)} L${cx + R * Math.cos(t1)} ${cy + R * Math.sin(t1)} Z`} fill={b} />);
  }
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <rect width={1920} height={1080} fill={a} />
      {paths}
    </svg>
  );
};

/** The anime eye glint: long thin 4-point flare + shorter diagonal pair, with a soft glow. */
export const StarFlare: React.FC<{ x: number; y: number; size: number; rot?: number; color?: string; glow?: number }> = ({
  x, y, size, rot = 0, color = '#fff', glow = 1,
}) => {
  const id = useId().replace(/:/g, '');
  const ray = (len: number, w: number) => `M0 ${-len} L${w} 0 L0 ${len} L${-w} 0 Z`;
  return (
    <svg
      width={size * 2.4}
      height={size * 2.4}
      viewBox={`${-size * 1.2} ${-size * 1.2} ${size * 2.4} ${size * 2.4}`}
      style={{ position: 'absolute', left: x - size * 1.2, top: y - size * 1.2, overflow: 'visible', pointerEvents: 'none' }}
    >
      <defs>
        <radialGradient id={`g${id}`}>
          <stop offset="0" stopColor={color} stopOpacity={0.9 * glow} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle r={size * 0.45} fill={`url(#g${id})`} />
      <g transform={`rotate(${rot})`} fill={color}>
        <path d={ray(size, size * 0.07)} />
        <path d={ray(size, size * 0.07)} transform="rotate(90)" />
        <path d={ray(size * 0.5, size * 0.05)} transform="rotate(45)" />
        <path d={ray(size * 0.5, size * 0.05)} transform="rotate(-45)" />
      </g>
    </svg>
  );
};

/** Square ink seal stamp with a rough edge (turbulence displacement). */
export const Stamp: React.FC<{ text: string; size: number; color?: string; id: string; style?: React.CSSProperties }> = ({
  text, size, color = '#E0263C', id, style,
}) => {
  const chars = [...text];
  return (
    <div style={{ width: size, height: size, position: 'relative', filter: `url(#${id})`, ...style }}>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency={0.06} numOctaves={2} seed={id.length * 7} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={size * 0.03} />
        </filter>
      </svg>
      <div style={{
        position: 'absolute', inset: 0, border: `${size * 0.06}px solid ${color}`, borderRadius: size * 0.08,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ position: 'absolute', inset: size * 0.05, border: `${size * 0.015}px solid ${color}`, borderRadius: size * 0.04 }} />
        <span style={{
          fontFamily: F.serif, fontWeight: 900, color, fontSize: size * (chars.length > 2 ? 0.27 : 0.36), lineHeight: 1,
          writingMode: chars.length > 2 ? 'vertical-rl' : undefined, letterSpacing: size * 0.02,
        }}>
          {text}
        </span>
      </div>
    </div>
  );
};

export type ConfettiKind = 'token' | 'star' | 'heart' | 'whale' | 'dot';
const PALETTE = ['#FF7BAC', '#4D6BFE', '#7FD3FF', '#FFFFFF', '#FF9F43', '#B48CFF'];

/** One confetti piece; `i` seeds its kind, colour and spin. */
export const Confetti: React.FC<{ i: number; x: number; y: number; size: number; t: number; kinds?: ConfettiKind[] }> = ({
  i, x, y, size, t, kinds = ['token', 'star', 'heart', 'whale', 'dot'],
}) => {
  const kind = kinds[Math.floor(rnd(i, 1) * kinds.length)];
  const col = PALETTE[Math.floor(rnd(i, 2) * PALETTE.length)];
  const rot = (rnd(i, 3) - 0.5) * 60 + Math.sin(t * (0.6 + rnd(i, 4)) + i) * 20;
  let body: React.ReactNode;
  if (kind === 'token') {
    body = (
      <div style={{
        background: col, color: col === '#FFFFFF' ? '#4D6BFE' : '#fff', fontFamily: 'monospace', fontWeight: 700,
        fontSize: size * 0.32, padding: `${size * 0.1}px ${size * 0.2}px`, borderRadius: size * 0.3, whiteSpace: 'nowrap',
      }}>token</div>
    );
  } else if (kind === 'whale') {
    body = <Whale size={size * 1.1} silhouette color={col} eye="none" />;
  } else {
    const d = kind === 'star' ? star(size / 2, size / 2, size * 0.45, size * 0.2) : kind === 'heart' ? heart(size / 2, size / 2, size * 0.4) : '';
    body = (
      <svg width={size} height={size}>
        {kind === 'dot' ? <circle cx={size / 2} cy={size / 2} r={size * 0.2} fill={col} /> : <path d={d} fill={col} />}
      </svg>
    );
  }
  return <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg)` }}>{body}</div>;
};

/** A cut-out GPT still placed by its centre. */
export const Still: React.FC<{
  src: string;
  x: number;
  y: number;
  /** rendered width in px */
  w: number;
  rot?: number;
  flip?: boolean;
  style?: React.CSSProperties;
}> = ({ src, x, y, w, rot = 0, flip = false, style }) => (
  <Img
    src={staticFile(`img/${src}.png`)}
    style={{
      position: 'absolute', left: x, top: y, width: w, transform: `translate(-50%,-50%) rotate(${rot}deg) scaleX(${flip ? -1 : 1})`,
      ...style,
    }}
  />
);
