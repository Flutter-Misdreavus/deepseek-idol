// Code-drawn little whale (the MV's stand-in for the official MV's bunnies). Faces left, viewBox 220x150.
import { useId } from 'react';
import { C } from './palette';

export type WhaleEye = 'dot' | 'closed' | 'heart' | 'star' | 'cursor' | 'none';

const BODY =
  'M22 90 C16 46 56 18 98 18 C142 18 166 50 165 84 C164 110 146 124 114 124 L64 124 C36 124 24 110 22 90 Z';
const TAIL =
  'M146 104 C166 96 174 80 176 60 C166 56 156 46 152 32 C166 34 176 42 182 52 C188 40 200 32 214 32 C208 46 196 56 186 60 C186 84 176 104 152 116 Z';
const FIN = 'M84 108 C88 124 100 132 114 132 C108 122 104 114 104 106 Z';

export const Whale: React.FC<{
  size?: number;
  /** body colour; belly, cheeks and line colour follow from the style */
  color?: string;
  belly?: string;
  line?: string;
  /** flat one-colour shape (pattern tiles, crowd rows) */
  silhouette?: boolean;
  /** white die-cut border, sticker look */
  sticker?: boolean;
  eye?: WhaleEye;
  eyeColor?: string;
  blush?: boolean;
  /** 0..1 water spout height */
  spout?: number;
  /** tail wag in degrees */
  wag?: number;
  /** name tag hung around the neck ('V3', 'R1', ...) */
  tag?: string;
  flip?: boolean;
  style?: React.CSSProperties;
}> = ({
  size = 220,
  color = '#9CCBFF',
  belly = '#F4FAFF',
  line = C.navy,
  silhouette = false,
  sticker = false,
  eye = 'dot',
  eyeColor,
  blush = true,
  spout = 0,
  wag = 0,
  tag,
  flip = false,
  style,
}) => {
  const id = useId().replace(/:/g, '');
  const sw = silhouette ? 0 : 4;
  const stroke = silhouette ? 'none' : line;
  const ec = eyeColor ?? (silhouette ? belly : line);
  const tail = <path d={TAIL} transform={`rotate(${wag} 150 100)`} />;
  return (
    <svg
      width={size}
      height={(size * 150) / 220}
      viewBox="-10 -40 240 190"
      style={{ overflow: 'visible', ...style }}
    >
      <g transform={flip ? 'translate(220 0) scale(-1 1)' : undefined}>
      <defs>
        <clipPath id={`b${id}`}>
          <path d={BODY} />
        </clipPath>
      </defs>
      {sticker && (
        <g fill="#fff" stroke="#fff" strokeWidth={26} strokeLinejoin="round" style={{ filter: 'drop-shadow(0 6px 6px rgba(20,26,60,.25))' }}>
          {tail}
          <path d={BODY} />
          <path d={FIN} />
        </g>
      )}
      {spout > 0 && !silhouette && <Spout h={spout} color={color} line={line} />}
      <g fill={color} stroke={stroke} strokeWidth={sw} strokeLinejoin="round">
        {tail}
        <path d={BODY} />
      </g>
      {!silhouette && (
        <>
          <g clipPath={`url(#b${id})`}>
            <ellipse cx={78} cy={134} rx={92} ry={42} fill={belly} />
            {/* one hard cel highlight on the forehead */}
            <path d="M52 40 C68 28 92 25 108 30 C96 35 74 40 60 52 Z" fill="#fff" opacity={0.75} />
          </g>
          <path d={BODY} fill="none" stroke={line} strokeWidth={sw} />
          <path d={FIN} fill={color} stroke={line} strokeWidth={sw} strokeLinejoin="round" />
          {blush && <ellipse cx={74} cy={92} rx={11} ry={6} fill="#FF8FB8" opacity={0.7} />}
          <path d="M40 92 Q46 98 52 92" fill="none" stroke={line} strokeWidth={3.5} strokeLinecap="round" />
        </>
      )}
      {silhouette && <path d={FIN} fill={color} />}
      <Eye kind={eye} color={ec} />
      </g>
      {tag && <Tag text={tag} line={line} x={flip ? 220 - 96 : 96} />}
    </svg>
  );
};

const Eye: React.FC<{ kind: WhaleEye; color: string }> = ({ kind, color }) => {
  const x = 58, y = 76;
  switch (kind) {
    case 'dot':
      return (
        <g>
          <ellipse cx={x} cy={y} rx={6.5} ry={8} fill={color} />
          <circle cx={x - 2} cy={y - 3} r={2.4} fill="#fff" />
        </g>
      );
    case 'closed':
      return <path d={`M${x - 8} ${y} Q${x} ${y + 7} ${x + 8} ${y}`} fill="none" stroke={color} strokeWidth={3.5} strokeLinecap="round" />;
    case 'heart':
      return <path d={heart(x, y, 11)} fill="#FF4F8B" stroke={color === '#FF4F8B' ? 'none' : '#fff'} strokeWidth={1.5} />;
    case 'star':
      return <path d={star(x, y, 11, 4.5, 5)} fill="#FFD45E" stroke="#fff" strokeWidth={1.5} />;
    case 'cursor':
      return <rect x={x - 3} y={y - 10} width={6} height={20} fill={color} />;
    default:
      return null;
  }
};

const Spout: React.FC<{ h: number; color: string; line: string }> = ({ h, color, line }) => {
  const top = 30 - 60 * h;
  return (
    <g stroke={line} strokeWidth={3.5} fill="#E8F6FF" strokeLinejoin="round">
      <path d={`M86 34 C84 ${top + 20} 80 ${top + 8} 70 ${top} C82 ${top + 2} 88 ${top + 10} 90 ${top + 16} C92 ${top + 10} 98 ${top + 2} 110 ${top} C100 ${top + 8} 96 ${top + 20} 94 34 Z`} />
      <circle cx={64} cy={top - 6} r={5 * h} fill={color} />
      <circle cx={116} cy={top - 4} r={4 * h} fill={color} />
    </g>
  );
};

const Tag: React.FC<{ text: string; line: string; x: number }> = ({ text, line, x }) => (
  <g transform={`translate(${x - 96} 0)`}>
    <path d="M70 106 L96 124 L122 106" fill="none" stroke={line} strokeWidth={2.5} />
    <rect x={74} y={118} width={44} height={26} rx={5} fill="#fff" stroke={line} strokeWidth={3} />
    <text x={96} y={137} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={16} fill={line}>
      {text}
    </text>
  </g>
);

/** SVG path of a heart centred at (x, y) with half-width r */
export const heart = (x: number, y: number, r: number) =>
  `M${x} ${y + r * 0.9} C${x - r * 1.6} ${y - r * 0.1} ${x - r * 0.9} ${y - r * 1.3} ${x} ${y - r * 0.45} ` +
  `C${x + r * 0.9} ${y - r * 1.3} ${x + r * 1.6} ${y - r * 0.1} ${x} ${y + r * 0.9} Z`;

/** SVG path of an n-pointed star */
export const star = (x: number, y: number, ro: number, ri: number, n = 5, rot = -Math.PI / 2) => {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? ri : ro;
    const a = rot + (i * Math.PI) / n;
    d += `${i ? 'L' : 'M'}${(x + r * Math.cos(a)).toFixed(2)} ${(y + r * Math.sin(a)).toFixed(2)} `;
  }
  return d + 'Z';
};
