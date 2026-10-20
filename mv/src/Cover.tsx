// Video cover (16:9 and 4:3 stills): G10 reaching for the light on the official-MV magenta, the ink logo, and the
// struck-through hallucination disclaimer. Everything except the character is code-drawn.
import { AbsoluteFill, Img, staticFile, useVideoConfig } from 'remotion';
import { UI } from './data/copy';
import { Confetti, StarFlare, Sunburst, WhalePattern } from './lib/deco';
import { F, preloadGlyphs } from './lib/fonts';
import { Grain, Vignette } from './lib/fx';
import { C } from './lib/palette';
import { Whale } from './lib/whale';
import { InkLogo, LOGO_PIECES } from './scenes/S0_logo';

preloadGlyphs(UI.disclaimer);

// Per-aspect layout. g10 (1536 x 1024) is placed by `left/top/k`: face right of centre, open palm top-left,
// the still's cut edges off-frame or under the logo; `fade` hides the bottom-left cut edge when it is in frame.
type Layout = {
  k: number; left: number; top: number; fade: boolean;
  logo: { w: number; left: number; top: number };
  sticker: { x: number; y: number; size: number };
  pill: { right: number; top: number; size: number };
  confetti: number[][];
};
const NAVY = '#1B2150';

const LAYOUTS: Record<'wide' | 'std', Layout> = {
  wide: {
    k: 1.2, left: 148, top: 54, fade: true,
    logo: { w: 900, left: 24, top: 520 },
    sticker: { x: 1690, y: 470, size: 210 },
    pill: { right: 56, top: 40, size: 28 },
    confetti: [[1500, 90, 70], [1830, 380, 60], [80, 560, 64], [700, 70, 54], [1040, 140, 46], [1880, 700, 50], [620, 980, 40]],
  },
  // 4:3: the still's left edge sits just off the frame edge, so no cut shows there
  std: {
    k: 1.05, left: -20, top: 66, fade: false,
    logo: { w: 780, left: 8, top: 600 },
    sticker: { x: 1250, y: 520, size: 170 },
    pill: { right: 34, top: 30, size: 25 },
    confetti: [[1180, 250, 56], [1390, 420, 50], [60, 560, 56], [560, 60, 48], [1380, 760, 44], [520, 1010, 36]],
  },
};
export const Cover: React.FC = () => {
  const { width } = useVideoConfig();
  const L = LAYOUTS[width / 1080 > 1.5 ? 'wide' : 'std'];
  const [PX, PY] = [L.left + 240 * L.k, L.top + 200 * L.k]; // open palm: the light source of the whole frame
  const mask = L.fade ? 'radial-gradient(ellipse 24% 42% at 0% 100%, transparent 35%, black 100%)' : undefined;
  return (
  <AbsoluteFill style={{ background: C.hot, overflow: 'hidden' }}>
    <Sunburst cx={PX} cy={PY} a={C.hot} b="#EF5D9B" rays={22} rot={0.06} />
    <AbsoluteFill style={{ opacity: 0.22 }}>
      <WhalePattern color="#FFD1E4" offset={40} size={100} gap={220} />
    </AbsoluteFill>
    <AbsoluteFill style={{
      background: `radial-gradient(circle at ${PX}px ${PY}px, rgba(255,250,235,1) 0, rgba(255,226,170,.85) 7%, rgba(255,190,220,.45) 20%, rgba(255,160,200,0) 42%)`,
    }} />
    {/* background confetti, kept to the open corners */}
    {L.confetti.map(([x, y, s], i) => (
      <Confetti key={i} i={i + 3} x={x} y={y} size={s} t={0} kinds={['star', 'heart', 'dot']} />
    ))}
    {/* the light she reaches for, bursting through her fingers */}
    <StarFlare x={PX} y={PY} size={430} rot={12} color="#FFFDF2" glow={1.4} />

    {/* G10 with a white sticker rim; the bottom-left cut edge of the still fades out under the logo */}
    <div style={{
      position: 'absolute', inset: 0,
      filter: 'drop-shadow(5px 0 0 #fff) drop-shadow(-5px 0 0 #fff) drop-shadow(0 5px 0 #fff) drop-shadow(0 -5px 0 #fff) drop-shadow(0 0 28px rgba(255,255,255,.55))',
    }}>
      <Img src={staticFile('img/g10_sing_up.png')} style={{
        position: 'absolute', left: L.left, top: L.top, width: 1536 * L.k, WebkitMaskImage: mask, maskImage: mask,
      }} />
    </div>
    <StarFlare x={PX - 150} y={PY - 130} size={90} rot={-10} />
    <StarFlare x={PX + 210} y={PY - 170} size={60} rot={30} />

    {/* whale stickers */}
    <div style={{ position: 'absolute', left: L.sticker.x, top: L.sticker.y, transform: 'rotate(10deg)' }}>
      <Whale size={L.sticker.size} sticker color="#FFB3CF" eye="heart" spout={0.7} flip />
    </div>

    {/* the running gag: the disclaimer, struck through */}
    <div style={{ position: 'absolute', right: L.pill.right, top: L.pill.top, transform: 'rotate(-4deg)' }}>
      <div style={{
        position: 'relative', display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 999, padding: '12px 26px',
        border: `4px solid ${NAVY}`, boxShadow: `6px 7px 0 ${NAVY}`, fontFamily: F.zh, fontWeight: 700, fontSize: L.pill.size, color: '#8A8F98',
        whiteSpace: 'nowrap',
      }}>
        <svg width={L.pill.size + 2} height={L.pill.size + 2} viewBox="0 0 24 24">
          <path d="M12 2.5 L22.5 21 L1.5 21 Z" fill="#F7B733" stroke="#8A8F98" strokeWidth={1.6} strokeLinejoin="round" />
          <rect x={11} y={8.5} width={2} height={7} rx={1} fill="#fff" />
          <circle cx={12} cy={18} r={1.2} fill="#fff" />
        </svg>
        {UI.disclaimer}
        <svg viewBox="0 0 100 10" preserveAspectRatio="none" style={{ position: 'absolute', left: 14, right: 14, top: '50%', width: 'calc(100% - 28px)', height: 22, transform: 'translateY(-40%)', overflow: 'visible' }}>
          <path d="M0 6 C25 3.5 60 5 100 2.5" fill="none" stroke={C.hot} strokeWidth={11} vectorEffect="non-scaling-stroke" strokeLinecap="round" opacity={0.92} />
        </svg>
      </div>
    </div>

    {/* title */}
    <InkLogo stage={LOGO_PIECES} width={L.logo.w} t={0.4} ink3={C.yellow} style={{ position: 'absolute', left: L.logo.left, top: L.logo.top }} />

    <Vignette strength={0.28} />
    <Grain opacity={0.08} />
  </AbsoluteFill>
  );
};
