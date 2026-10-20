// Audience silhouettes (official MV's crowd with glowing red eyes), shared by S2 / S3 / S8.
// Users' eyes are blinking text cursors; whale-shaped light sticks wave on the beat.
import { useId } from 'react';
import { rnd } from './anim';
import { Whale } from './whale';

const mix = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
};

export const Crowd: React.FC<{
  /** current fractional beat (drives cursor blink and stick sway) */
  beat: number;
  width?: number;
  height?: number;
  rows?: number;
  /** members in the front row (back rows get more, smaller ones) */
  perRow?: number;
  /** front-row silhouette colour; back rows fade toward `haze` */
  color?: string;
  haze?: string;
  /** 0..1 share of cursor eyes that are lit (members light up in a seeded order) */
  eyes?: number;
  eyeColor?: string;
  /** eyes blink like a text cursor on half beats */
  blink?: boolean;
  /** 0..1 share of members holding a light stick up */
  sticks?: number;
  stickColors?: string[];
  /** stick swing in degrees, left on even beats, right on odd */
  sway?: number;
  seed?: number;
  style?: React.CSSProperties;
}> = ({
  beat, width = 1920, height = 520, rows = 3, perRow = 9, color = '#0E1024', haze = '#3A3F70', eyes = 0, eyeColor = '#FF3B5C',
  blink = true, sticks = 0, stickColors = ['#7FD3FF', '#FF7BAC', '#B48CFF'], sway = 18, seed = 0, style,
}) => {
  const id = useId().replace(/:/g, '');
  const people: React.ReactNode[] = [];
  const glows: React.ReactNode[] = [];
  let n = 0;
  for (let r = rows - 1; r >= 0; r--) {
    const s = 1 - r * 0.2;
    const u = (width / perRow) * 0.5 * s;
    const count = Math.round(perRow / s) + 2;
    const base = height - r * u * 0.9 + u * 0.15;
    const fill = mix(color, haze, r / Math.max(1, rows) * 0.9);
    for (let i = 0; i < count; i++) {
      const k = seed * 1000 + n++;
      const x = ((i + 0.5 + (r % 2 ? 0.5 : 0) + (rnd(k, 1) - 0.5) * 0.5) / count) * width * 1.06 - width * 0.03;
      const hs = 0.9 + rnd(k, 2) * 0.25;
      const y = base - rnd(k, 3) * u * 0.18;
      const hx = x + (rnd(k, 4) - 0.5) * u * 0.1;
      const hy = y - u * 1.05 * hs;
      const hr = u * 0.38 * hs;
      const hair = Math.floor(rnd(k, 5) * 4);
      const holds = rnd(k, 6) < sticks;
      const a = (sway * Math.cos((beat - rnd(k, 7) * 0.15) * Math.PI) + (rnd(k, 8) - 0.5) * 10) * (Math.PI / 180);
      const side = rnd(k, 9) < 0.5 ? -1 : 1;
      const sx = x + side * u * 0.42, sy = y - u * 0.55;
      const hand = [sx + Math.sin(a) * u * 0.9, sy - Math.cos(a) * u * 0.9];
      const tip = [hand[0] + Math.sin(a) * u * 0.75, hand[1] - Math.cos(a) * u * 0.75];
      const sc = stickColors[Math.floor(rnd(k, 10) * stickColors.length)];
      people.push(
        <g key={k} fill={fill}>
          {holds && <path d={`M${sx} ${sy} L${hand[0]} ${hand[1]}`} stroke={fill} strokeWidth={u * 0.2} strokeLinecap="round" />}
          <path d={`M${x - u * 0.95} ${y + u} L${x - u * 0.9} ${y - u * 0.25} C${x - u * 0.85} ${y - u * 0.6} ${x - u * 0.5} ${y - u * 0.66} ${x} ${y - u * 0.66} C${x + u * 0.5} ${y - u * 0.66} ${x + u * 0.85} ${y - u * 0.6} ${x + u * 0.9} ${y - u * 0.25} L${x + u * 0.95} ${y + u} Z`} />
          <circle cx={hx} cy={hy} r={hr} />
          {hair === 1 && <circle cx={hx} cy={hy - hr * 0.95} r={hr * 0.42} />}
          {hair === 2 && <ellipse cx={hx + hr * 0.95} cy={hy + hr * 0.35} rx={hr * 0.32} ry={hr * 0.7} transform={`rotate(-20 ${hx + hr} ${hy})`} />}
          {hair === 3 && <path d={`M${hx - hr * 1.05} ${hy} C${hx - hr * 1.1} ${hy + hr * 1.3} ${hx - hr * 0.5} ${hy + hr * 1.5} ${hx} ${hy + hr * 1.2} C${hx + hr * 0.5} ${hy + hr * 1.5} ${hx + hr * 1.1} ${hy + hr * 1.3} ${hx + hr * 1.05} ${hy} Z`} />}
        </g>,
      );
      if (holds) {
        const stick = (
          <g key={`s${k}`}>
            <path d={`M${hand[0]} ${hand[1]} L${tip[0]} ${tip[1]}`} stroke={sc} strokeWidth={u * 0.12} strokeLinecap="round" />
            <g transform={`translate(${tip[0]} ${tip[1]}) rotate(${(a * 90) / Math.PI})`}>
              <g transform={`translate(${-u * 0.62} ${-u * 0.55})`}>
                <Whale size={u * 1.25} silhouette color={sc} eye="none" flip={side > 0} />
              </g>
            </g>
          </g>
        );
        glows.push(stick);
        people.push(<g key={`h${k}`}>{stick}</g>);
      }
      const lit = rnd(k, 11) < eyes && (!blink || Math.floor(beat * 2 + rnd(k, 12) * 2) % 2 === 0);
      if (lit) {
        const ew = hr * 0.13, eh = hr * 0.5, ey = hy - eh * 0.35 + hr * 0.08;
        const eyesEl = (
          <g key={`e${k}`} fill={eyeColor}>
            <rect x={hx - hr * 0.36 - ew / 2} y={ey} width={ew} height={eh} />
            <rect x={hx + hr * 0.36 - ew / 2} y={ey} width={ew} height={eh} />
          </g>
        );
        glows.push(eyesEl);
        people.push(eyesEl);
      }
    }
  }
  return (
    <svg width={width} height={height} style={{ overflow: 'visible', ...style }}>
      <defs>
        <filter id={`g${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={width / 160} />
        </filter>
      </defs>
      <g filter={`url(#g${id})`} opacity={0.9}>{glows}</g>
      {people}
      <g filter={`url(#g${id})`} opacity={0.55} style={{ mixBlendMode: 'screen' }}>{glows}</g>
    </svg>
  );
};
