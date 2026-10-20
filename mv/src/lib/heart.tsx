// The big glossy heart of the grey-void scenes (official MV's red heart), shared by S2 / S3 / S7.
// Flat cel shading (base, one shadow crescent, hard white glints) so it sits with the anime stills.
// Optional whale swimming inside, a jagged crack, and the two halves splitting apart along it.
import { useId } from 'react';
import { Whale } from './whale';

/** heart outline in a 200 x 190 box; notch at (100, 32), tip at (100, 182) */
export const HEART_PATH =
  'M100 182 C60 150 4 112 4 62 C4 28 30 6 60 6 C80 6 94 18 100 32 C106 18 120 6 140 6 C170 6 196 28 196 62 C196 112 140 150 100 182 Z';
/** zigzag crack from the notch to the tip */
const CRACK = [[100, 32], [91, 54], [108, 76], [93, 99], [111, 121], [95, 145], [105, 165], [100, 182]];
/** short side branches of the crack (drawn after the main crack, for the shattering black heart) */
const BRANCHES = [
  [[108, 76], [132, 70], [150, 82]],
  [[93, 99], [66, 94], [48, 108]],
  [[111, 121], [138, 128], [146, 146]],
  [[95, 145], [74, 140]],
];

const poly = (pts: number[][]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');
const len = (pts: number[][]) => pts.slice(1).reduce((s, [x, y], i) => s + Math.hypot(x - pts[i][0], y - pts[i][1]), 0);

export const BigHeart: React.FC<{
  /** rendered width in px (height = 0.95 x width) */
  size: number;
  color?: string;
  shade?: string;
  /** colour of the hard glints */
  glint?: string;
  outline?: string | null;
  /** whale swimming left-to-right inside: 0 = entering left, 1 = gone right; null = no whale */
  swim?: number | null;
  whaleColor?: string;
  /** 0..1 how much of the crack (and then its branches) is drawn */
  crack?: number;
  crackColor?: string;
  /** 0..1 the halves pull apart and tilt away from each other */
  split?: number;
  style?: React.CSSProperties;
}> = ({
  size, color = '#E8304F', shade = '#B8183A', glint = '#FFFFFF', outline = null, swim = null, whaleColor = 'rgba(255,255,255,.32)',
  crack = 0, crackColor = '#2A0A14', split = 0, style,
}) => {
  const id = useId().replace(/:/g, '');
  const mainLen = len(CRACK);
  const c1 = Math.min(1, crack * 1.6);
  const c2 = Math.max(0, crack * 1.6 - 0.6) / 1;
  const body = (
    <>
      <path d={HEART_PATH} fill={shade} />
      <g clipPath={`url(#h${id})`}>
        {/* base sits up-left of the shadow, leaving a crescent of shade on the lower right */}
        <path d={HEART_PATH} fill={color} transform="translate(-9 -11) scale(0.985)" />
        {swim !== null && (
          <g transform={`translate(${-90 + 300 * swim} ${70 + 10 * Math.sin(swim * Math.PI * 4)}) scale(0.5)`}>
            <Whale size={220} silhouette color={whaleColor} eye="none" flip />
          </g>
        )}
        <ellipse cx={50} cy={44} rx={24} ry={10} fill={glint} transform="rotate(-38 50 44)" />
        <circle cx={78} cy={26} r={4.5} fill={glint} />
        <path d="M166 40 C176 50 180 62 178 74" fill="none" stroke={glint} strokeWidth={5} strokeLinecap="round" opacity={0.75} />
      </g>
      {outline && <path d={HEART_PATH} fill="none" stroke={outline} strokeWidth={4} strokeLinejoin="round" />}
    </>
  );
  const crackPaths = crack > 0 && (
    <g fill="none" stroke={crackColor} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">
      <path d={poly(CRACK)} strokeDasharray={mainLen} strokeDashoffset={mainLen * (1 - c1)} />
      {BRANCHES.map((b, i) => {
        const l = len(b);
        return <path key={i} d={poly(b)} strokeDasharray={l} strokeDashoffset={l * (1 - Math.min(1, c2 * 1.5 - i * 0.1))} strokeWidth={3} />;
      })}
    </g>
  );
  const leftHalf = `${poly(CRACK)} L-20 182 L-20 0 L100 0 Z`;
  const rightHalf = `${poly(CRACK)} L220 182 L220 0 L100 0 Z`;
  return (
    <svg width={size} height={size * 0.95} viewBox="0 0 200 190" style={{ overflow: 'visible', ...style }}>
      <defs>
        <clipPath id={`h${id}`}>
          <path d={HEART_PATH} />
        </clipPath>
        <clipPath id={`l${id}`}>
          <path d={leftHalf} />
        </clipPath>
        <clipPath id={`r${id}`}>
          <path d={rightHalf} />
        </clipPath>
      </defs>
      {split <= 0 ? (
        <>
          {body}
          {crackPaths}
        </>
      ) : (
        <>
          <g transform={`translate(${-34 * split} ${6 * split}) rotate(${-14 * split} 100 182)`}>
            <g clipPath={`url(#l${id})`}>{body}</g>
            <path d={poly(CRACK)} fill="none" stroke={crackColor} strokeWidth={4} strokeLinejoin="round" />
          </g>
          <g transform={`translate(${34 * split} ${6 * split}) rotate(${14 * split} 100 182)`}>
            <g clipPath={`url(#r${id})`}>{body}</g>
            <path d={poly(CRACK)} fill="none" stroke={crackColor} strokeWidth={4} strokeLinejoin="round" />
          </g>
        </>
      )}
    </svg>
  );
};
