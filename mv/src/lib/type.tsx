// Kinetic typography: big lyric text whose characters land on the beat grid.
import { Easing, interpolate } from 'remotion';
import { F } from './fonts';
import { C } from './palette';

const outBack = Easing.out(Easing.back(2.2));

export type KineticProps = {
  text: string;
  /** current fractional absolute beat */
  beat: number;
  /** absolute beat the first character lands on */
  at: number;
  /** absolute beat the text is gone by */
  until: number;
  /** beats between characters (default: spread over 60% of the line, at most half a beat each) */
  stagger?: number;
  size?: number;
  font?: string;
  weight?: number;
  color?: string;
  stroke?: string;
  strokeWidth?: number;
  vertical?: boolean;
  /** 'pop': scale down onto place; 'stamp': bigger hit with a tilt; 'type': plain appearance */
  mode?: 'pop' | 'stamp' | 'type';
  style?: React.CSSProperties;
};

/** Spaces in the text split it into rows (columns when vertical). */
export const Kinetic: React.FC<KineticProps> = ({
  text,
  beat,
  at,
  until,
  stagger,
  size = 130,
  font = F.serif,
  weight = 900,
  color = C.white,
  stroke,
  strokeWidth = 0,
  vertical = false,
  mode = 'pop',
  style,
}) => {
  if (beat < at - 0.01 || beat >= until) return null;
  const rows = text.split(/\s+/).filter(Boolean);
  const count = rows.reduce((n, r) => n + [...r].length, 0);
  const step = stagger ?? Math.min(0.5, ((until - at) * 0.6) / Math.max(1, count - 1));
  const out = interpolate(beat, [until - 0.35, until], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  let k = 0;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: vertical ? 'row-reverse' : 'column',
        alignItems: vertical ? 'flex-start' : 'center',
        gap: size * 0.12,
        opacity: out,
        ...style,
      }}
    >
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: 'flex', flexDirection: vertical ? 'column' : 'row', lineHeight: 1 }}>
          {[...row].map((ch, ci) => {
            const p = interpolate(beat, [at + k * step, at + k * step + (mode === 'type' ? 0.01 : 0.3)], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const seed = k++;
            if (p <= 0) return <span key={ci} style={{ fontSize: size, width: size, visibility: 'hidden' }}>{ch}</span>;
            const e = outBack(p);
            const scale = mode === 'stamp' ? interpolate(e, [0, 1], [2.2, 1]) : mode === 'pop' ? interpolate(e, [0, 1], [1.6, 1]) : 1;
            const rot = mode === 'stamp' ? (seed % 2 ? 1 : -1) * (1 - p) * 12 : 0;
            return (
              <span
                key={ci}
                style={{
                  fontFamily: font,
                  fontWeight: weight,
                  fontSize: size,
                  color,
                  WebkitTextStroke: stroke ? `${strokeWidth}px ${stroke}` : undefined,
                  paintOrder: 'stroke fill',
                  display: 'inline-block',
                  transform: `scale(${scale}) rotate(${rot}deg)`,
                  opacity: Math.min(1, p * 3),
                }}
              >
                {ch}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};
