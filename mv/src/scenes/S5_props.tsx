// S5 props: plush whale (s5h), chair (s5e/s5h), a think box that can fold shut (s5f), HUD bracket (s5c),
// brush ✕ (s5g) and a crown (s5a/s5b). Code-drawn, flat cel look with navy/ink outlines.
import { useId } from 'react';
import { UI } from '../data/copy';
import { UIC } from '../lib/chat';
import { F } from '../lib/fonts';

export const INK = '#23232A';

/* ───────── plush whale: the Whale silhouette sewn from felt (seams, button eye, soft shading) ───────── */

// same outline as lib/whale.tsx (faces left, viewBox -10 -40 240 190)
const BODY =
  'M22 90 C16 46 56 18 98 18 C142 18 166 50 165 84 C164 110 146 124 114 124 L64 124 C36 124 24 110 22 90 Z';
const TAIL =
  'M146 104 C166 96 174 80 176 60 C166 56 156 46 152 32 C166 34 176 42 182 52 C188 40 200 32 214 32 C208 46 196 56 186 60 C186 84 176 104 152 116 Z';
const FIN = 'M84 108 C88 124 100 132 114 132 C108 122 104 114 104 106 Z';

export const PlushWhale: React.FC<{
  size: number;
  /** 0..1 sheen on the button eye */
  glint?: number;
  /** tag sway in degrees */
  tagSway?: number;
  style?: React.CSSProperties;
}> = ({ size, glint = 0, tagSway = 0, style }) => {
  const id = useId().replace(/:/g, '');
  const line = '#5874AE';
  const seam = { fill: 'none', stroke: '#4E699F', strokeWidth: 2.2, strokeDasharray: '5 4', strokeLinecap: 'round' as const };
  return (
    <svg width={size} height={(size * 190) / 240} viewBox="-10 -40 240 190" style={{ overflow: 'visible', ...style }}>
      <defs>
        <radialGradient id={`fill${id}`} cx={78} cy={46} r={130} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#B4CCF2" />
          <stop offset="0.55" stopColor="#93B2E6" />
          <stop offset="1" stopColor="#7896D2" />
        </radialGradient>
        <clipPath id={`b${id}`}>
          <path d={BODY} />
        </clipPath>
        <clipPath id={`t${id}`}>
          <path d={TAIL} />
        </clipPath>
        <filter id={`soft${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={7} />
        </filter>
        <filter id={`felt${id}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency={0.85} numOctaves={2} seed={4} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.2  0 0 0 0 0.25  0 0 0 0 0.4  0 0 0 0.9 -0.25" />
        </filter>
      </defs>
      {/* tail, sewn on behind the body */}
      <g transform="rotate(8 150 100)">
        <path d={TAIL} fill={`url(#fill${id})`} stroke={line} strokeWidth={4.5} strokeLinejoin="round" />
        <g clipPath={`url(#t${id})`}>
          <ellipse cx={196} cy={70} rx={40} ry={26} fill="#6F8DCA" opacity={0.45} filter={`url(#soft${id})`} />
          <rect x={140} y={20} width={90} height={110} filter={`url(#felt${id})`} opacity={0.35} />
        </g>
        <path d="M152 108 C170 96 178 80 182 56" {...seam} />
        <path d="M182 56 C188 46 198 40 208 37" {...seam} />
      </g>
      {/* body */}
      <path d={BODY} fill={`url(#fill${id})`} stroke={line} strokeWidth={4.5} strokeLinejoin="round" />
      <g clipPath={`url(#b${id})`}>
        {/* soft shade under the belly line and down the back */}
        <ellipse cx={128} cy={118} rx={72} ry={34} fill="#6A88C6" opacity={0.5} filter={`url(#soft${id})`} />
        <ellipse cx={62} cy={40} rx={34} ry={16} fill="#E6F0FF" opacity={0.55} filter={`url(#soft${id})`} />
        {/* cream belly panel */}
        <ellipse cx={78} cy={134} rx={92} ry={42} fill="#F3EEE4" />
        <ellipse cx={92} cy={140} rx={70} ry={26} fill="#DCD3C4" opacity={0.6} filter={`url(#soft${id})`} />
        <ellipse cx={78} cy={134} rx={92} ry={42} fill="none" stroke="#B3A68F" strokeWidth={2.2} strokeDasharray="5 4" />
        {/* felt texture over everything */}
        <rect x={10} y={10} width={170} height={130} filter={`url(#felt${id})`} opacity={0.3} />
      </g>
      <path d={BODY} fill="none" stroke={line} strokeWidth={4.5} strokeLinejoin="round" />
      {/* the seam over the back, from the forehead to the tail */}
      <path d="M34 62 C52 30 94 22 124 30 C146 38 160 56 163 80" {...seam} />
      {/* fin */}
      <path d={FIN} fill="#86A5DD" stroke={line} strokeWidth={4} strokeLinejoin="round" />
      <path d="M90 112 C94 122 102 127 110 128" {...seam} strokeWidth={1.8} />
      {/* felt blush patch and a stitched smile */}
      <ellipse cx={76} cy={94} rx={10} ry={6} fill="#F4A6C2" stroke="#E287AC" strokeWidth={1.4} strokeDasharray="2 2" />
      <path d="M40 94 Q46 100 52 94" fill="none" stroke="#3E527F" strokeWidth={2.4} strokeDasharray="3 2.4" strokeLinecap="round" />
      {/* button eye: four holes, a cross of thread */}
      <g>
        <circle cx={58} cy={74} r={11} fill="#1E2336" />
        <circle cx={58} cy={74} r={8} fill="none" stroke="#3E4766" strokeWidth={1.6} />
        {[[-2.6, -2.6], [2.6, -2.6], [-2.6, 2.6], [2.6, 2.6]].map(([dx, dy], i) => (
          <circle key={i} cx={58 + dx} cy={74 + dy} r={1.4} fill="#56608A" />
        ))}
        <path d="M55.4 71.4 L60.6 76.6 M60.6 71.4 L55.4 76.6" stroke="#E9DEC4" strokeWidth={1.3} strokeLinecap="round" />
        <ellipse cx={53.5} cy={69.5} rx={2.6} ry={1.8} fill="#fff" opacity={0.55 + 0.45 * glint} />
      </g>
      {/* care label sticking out of the belly seam */}
      <g transform={`rotate(${18 + tagSway} 124 120)`}>
        <path d="M118 118 L144 118 L146 150 L120 150 Z" fill="#FBFAF6" stroke="#9A9AA6" strokeWidth={1.6} strokeLinejoin="round" />
        <text x={132.5} y={131} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={5.6} fill="#5A6070">DeepSeek</text>
        <path d="M123 137 L142 137 M123 141 L140 141 M123 145 L136 145" stroke="#C3C3CC" strokeWidth={1.2} />
      </g>
    </svg>
  );
};

/* ───────── wooden chair, front view from slightly above (units: seat 600 wide, backrest top y -100, floor y 690) ───────── */

export const Chair: React.FC<{ width: number; style?: React.CSSProperties }> = ({ width, style }) => {
  const wood = '#8F7D6A', shade = '#6F5F51', top = '#A5927C';
  const lw = 7;
  return (
    <svg width={width} height={(width * 820) / 620} viewBox="-10 -110 620 820" style={{ overflow: 'visible', ...style }}>
      <g stroke={INK} strokeWidth={lw} strokeLinejoin="round">
        {/* back legs + their stretcher */}
        <rect x={56} y={320} width={26} height={300} fill={shade} />
        <rect x={518} y={320} width={26} height={300} fill={shade} />
        <rect x={80} y={520} width={440} height={16} fill={shade} />
        {/* backrest */}
        <rect x={22} y={-100} width={30} height={430} fill={wood} />
        <rect x={548} y={-100} width={30} height={430} fill={wood} />
        <rect x={6} y={-100} width={588} height={64} rx={12} fill={wood} />
        <rect x={6} y={-56} width={588} height={20} rx={6} fill={shade} stroke="none" />
        <rect x={40} y={110} width={520} height={30} fill={wood} />
        {/* seat: top face, front face */}
        <path d="M40 296 L560 296 L600 340 L0 340 Z" fill={top} />
        <rect x={0} y={340} width={600} height={40} fill={wood} />
        <rect x={0} y={366} width={600} height={14} fill={shade} stroke="none" />
        {/* front legs + stretcher */}
        <rect x={14} y={380} width={36} height={310} fill={wood} />
        <rect x={550} y={380} width={36} height={310} fill={wood} />
        <rect x={36} y={380} width={14} height={310} fill={shade} stroke="none" />
        <rect x={572} y={380} width={14} height={310} fill={shade} stroke="none" />
        <rect x={50} y={580} width={500} height={20} fill={wood} />
      </g>
    </svg>
  );
};

/* ───────── think box that folds shut: copy of lib/chat ThinkBox with an `open` amount ───────── */

export const FoldBox: React.FC<{
  /** 0 = folded (only the header), 1 = open */
  open: number;
  seconds: number | null;
  spin?: number;
  lines: React.ReactNode[];
  /** number of line slots to reserve when open */
  slots: number;
  size?: number;
  width?: number;
  headerScale?: number;
}> = ({ open, seconds, spin = 0, lines, slots, size = 40, width = 900, headerScale = 1 }) => {
  const lineH = size * 1.55;
  const full = slots * lineH + size * 0.5;
  return (
    <div style={{ width, fontFamily: F.zh }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 14, background: UIC.panel, borderRadius: 14,
        padding: `${size * 0.32}px ${size * 0.55}px`, fontSize: size * 0.8, fontWeight: 500, color: UIC.ink,
        transform: `scale(${headerScale})`, transformOrigin: '0 50%',
      }}>
        {seconds === null ? (
          <svg width={size * 0.8} height={size * 0.8} viewBox="0 0 24 24" style={{ transform: `rotate(${spin * 360}deg)` }}>
            <circle cx={12} cy={12} r={9} fill="none" stroke={UIC.line} strokeWidth={3} />
            <path d="M12 3 A9 9 0 0 1 21 12" fill="none" stroke={UIC.blue} strokeWidth={3} strokeLinecap="round" />
          </svg>
        ) : (
          <svg width={size * 0.8} height={size * 0.8} viewBox="0 0 24 24">
            <path d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z" fill={UIC.blue} />
          </svg>
        )}
        <span>{seconds === null ? UI.thinking : UI.thought(seconds)}</span>
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" style={{ transform: `rotate(${(1 - open) * -90}deg)` }}>
          <path d="M6 9 L12 15 L18 9" fill="none" stroke={UIC.sub} strokeWidth={2.5} strokeLinecap="round" />
        </svg>
      </div>
      <div style={{ height: Math.max(0, full * open), overflow: 'hidden' }}>
        <div style={{
          marginTop: size * 0.5, borderLeft: `3px solid ${UIC.line}`, paddingLeft: size * 0.6, color: UIC.sub,
          fontSize: size, lineHeight: `${lineH}px`, fontWeight: 400,
        }}>
          {lines.map((l, i) => <div key={i} style={{ height: lineH, whiteSpace: 'nowrap' }}>{l}</div>)}
        </div>
      </div>
    </div>
  );
};

/* ───────── HUD target bracket ───────── */

export const Bracket: React.FC<{
  x: number;
  y: number;
  size: number;
  /** 0..1 lock-on progress (shrinks from 1.8x onto the target) */
  p: number;
  label: string;
  ok: boolean;
  color?: string;
  bg?: string;
  /** label at the top-right or bottom-right corner */
  corner?: 'top' | 'bottom';
}> = ({ x, y, size, p, label, ok, color = INK, bg = '#F7B733', corner = 'top' }) => {
  if (p <= 0) return null;
  const s = size * (1 + 0.8 * (1 - Math.min(1, p)));
  const c = s * 0.26;
  const h = s / 2;
  const d = `M${-h} ${-h + c} L${-h} ${-h} L${-h + c} ${-h} M${h - c} ${-h} L${h} ${-h} L${h} ${-h + c} ` +
    `M${h} ${h - c} L${h} ${h} L${h - c} ${h} M${-h + c} ${h} L${-h} ${h} L${-h} ${h - c}`;
  return (
    <div style={{ position: 'absolute', left: x, top: y, opacity: Math.min(1, p * 2.5) }}>
      <svg width={1} height={1} style={{ position: 'absolute', overflow: 'visible' }}>
        <path d={d} fill="none" stroke={color} strokeWidth={7} strokeLinecap="square" />
        <path d={`M-14 0 L14 0 M0 -14 L0 14`} stroke={color} strokeWidth={3} opacity={0.7} />
        <circle r={h * 0.5} fill="none" stroke={color} strokeWidth={2} strokeDasharray="6 8" opacity={0.6}
          transform={`rotate(${p * 180})`} />
      </svg>
      <div style={{
        position: 'absolute', top: corner === 'top' ? -h - 4 : h - 40, left: h + 12, whiteSpace: 'nowrap',
        background: color, color: bg, fontFamily: F.zh, fontWeight: 700, fontSize: 30, padding: '4px 14px', borderRadius: 6,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        {label}
        <span style={{ fontFamily: 'monospace', fontSize: 26 }}>{ok ? '✓ OK' : '···'}</span>
      </div>
    </div>
  );
};

/* ───────── brush ✕: two strokes drawn on, p1 / p2 = 0..1 ───────── */

export const BigX: React.FC<{ w: number; h: number; p1: number; p2: number; color?: string }> = ({ w, h, p1, p2, color = '#E0263C' }) => {
  const L = Math.hypot(w, h);
  const stroke = (x1: number, y1: number, x2: number, y2: number, p: number, col: string, sw: number) => (
    <path d={`M${x1} ${y1} L${x2} ${y2}`} stroke={col} strokeWidth={sw} strokeLinecap="round" fill="none"
      strokeDasharray={L} strokeDashoffset={L * (1 - p)} />
  );
  const sw = Math.min(w, h) * 0.17;
  return (
    <svg width={w} height={h} style={{ overflow: 'visible', filter: 'drop-shadow(0 10px 0 rgba(35,35,42,.35))' }}>
      {p1 > 0 && stroke(w * 0.1, h * 0.08, w * 0.9, h * 0.92, p1, '#fff', sw + 22)}
      {p2 > 0 && stroke(w * 0.9, h * 0.08, w * 0.1, h * 0.92, p2, '#fff', sw + 22)}
      {p1 > 0 && stroke(w * 0.1, h * 0.08, w * 0.9, h * 0.92, p1, color, sw)}
      {p2 > 0 && stroke(w * 0.9, h * 0.08, w * 0.1, h * 0.92, p2, color, sw)}
    </svg>
  );
};

/* ───────── crown ───────── */

export const Crown: React.FC<{ size: number; fill?: string; line?: string }> = ({ size, fill = '#fff', line = INK }) => (
  <svg width={size} height={size * 0.75} viewBox="-6 -6 132 102" style={{ overflow: 'visible' }}>
    <path d="M8 84 L0 22 L32 50 L60 6 L88 50 L120 22 L112 84 Z" fill={fill} stroke={line} strokeWidth={7} strokeLinejoin="round" />
    <rect x={8} y={70} width={104} height={14} fill={line} opacity={0.15} />
    {[[0, 22], [60, 6], [120, 22]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={8} fill={fill} stroke={line} strokeWidth={6} />)}
  </svg>
);
