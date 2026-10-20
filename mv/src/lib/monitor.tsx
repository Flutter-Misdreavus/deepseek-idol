// Code-drawn retro monitor (the MV's stand-in for the official MV's CRT TV), shared by S5 / S8 / S9.
// Flat cel look: navy outline, cream body with one hard shadow band, curved screen with scanlines.
// Screen content is laid out in a SCREEN_W x SCREEN_H box, then the whole monitor is scaled to `width`.
import { useId } from 'react';
import { F } from './fonts';
import { C } from './palette';
import { Whale } from './whale';

export const SCREEN_W = 1280;
export const SCREEN_H = 800;

const BEZEL = 92;
const CHIN = 150;
const BODY_W = SCREEN_W + BEZEL * 2;
const BODY_H = SCREEN_H + BEZEL + CHIN;
const STAND_H = 150;

export const Monitor: React.FC<{
  /** rendered width of the body in px (height follows: ~0.71 x width, +0.1 x width with the stand) */
  width: number;
  /** 0 = screen off (dark glass), 1 = fully on */
  on?: number;
  /** light spilling around the monitor while on (null = none) */
  glow?: string | null;
  scanlines?: boolean;
  stand?: boolean;
  body?: string;
  shade?: string;
  line?: string;
  /** screen content, laid out in SCREEN_W x SCREEN_H px */
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({
  width, on = 1, glow = null, scanlines = true, stand = true, body = '#F1ECE2', shade = '#D6CDBE', line = C.navy, children, style,
}) => {
  const id = useId().replace(/:/g, '');
  const k = width / BODY_W;
  const H = BODY_H + (stand ? STAND_H : 0);
  const lw = 7;
  return (
    <div style={{ position: 'relative', width, height: H * k, ...style }}>
      {glow && on > 0 && (
        <div style={{
          position: 'absolute', left: '50%', top: (BEZEL + SCREEN_H / 2) * k, width: width * 1.9, height: width * 1.4,
          transform: 'translate(-50%,-50%)', background: `radial-gradient(closest-side, ${glow}, transparent)`, opacity: 0.55 * on,
          pointerEvents: 'none',
        }} />
      )}
      <div style={{ position: 'absolute', left: 0, top: 0, width: BODY_W, height: H, transform: `scale(${k})`, transformOrigin: '0 0' }}>
        {stand && (
          <svg width={BODY_W} height={H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
            <path
              d={`M${BODY_W / 2 - 110} ${BODY_H - 10} L${BODY_W / 2 - 140} ${BODY_H + STAND_H - 46} L${BODY_W / 2 + 140} ${BODY_H + STAND_H - 46} L${BODY_W / 2 + 110} ${BODY_H - 10} Z`}
              fill={shade} stroke={line} strokeWidth={lw} strokeLinejoin="round"
            />
            <rect x={BODY_W / 2 - 330} y={BODY_H + STAND_H - 62} width={660} height={56} rx={28} fill={body} stroke={line} strokeWidth={lw} />
            <rect x={BODY_W / 2 - 300} y={BODY_H + STAND_H - 30} width={600} height={14} rx={7} fill={shade} />
          </svg>
        )}
        {/* body: flat cream, hard shadow band down the right and along the chin */}
        <div style={{
          position: 'absolute', left: 0, top: 0, width: BODY_W, height: BODY_H, borderRadius: 64, background: body,
          border: `${lw}px solid ${line}`, boxSizing: 'border-box', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 46, background: shade }} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 34, background: shade }} />
          <div style={{ position: 'absolute', left: 34, top: 22, width: 260, height: 16, borderRadius: 8, background: '#fff', opacity: 0.8 }} />
        </div>
        {/* screen */}
        <div style={{
          position: 'absolute', left: BEZEL - 18, top: BEZEL - 18, width: SCREEN_W + 36, height: SCREEN_H + 36, borderRadius: 54,
          background: '#3A3F55', border: `${lw - 2}px solid ${line}`, boxSizing: 'border-box',
        }} />
        <div style={{
          position: 'absolute', left: BEZEL, top: BEZEL, width: SCREEN_W, height: SCREEN_H, borderRadius: '40px / 46px',
          overflow: 'hidden', background: '#10131F',
        }}>
          {children}
          {scanlines && (
            <div style={{
              position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity: 0.55,
              background: 'repeating-linear-gradient(0deg, rgba(0,0,0,.28) 0 2px, rgba(0,0,0,0) 2px 6px)',
            }} />
          )}
          {/* curved glass: darker rim, one flat diagonal glint */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 72% 70% at 50% 48%, rgba(0,0,0,0) 62%, rgba(0,0,10,.42) 100%)' }} />
          <svg width={SCREEN_W} height={SCREEN_H} style={{ position: 'absolute', inset: 0 }}>
            <path d={`M60 0 L330 0 L120 ${SCREEN_H * 0.62} L0 ${SCREEN_H * 0.62} L0 70 Z`} fill="#fff" opacity={0.07} />
            <path d={`M380 0 L430 0 L190 ${SCREEN_H * 0.5} L150 ${SCREEN_H * 0.5} Z`} fill="#fff" opacity={0.06} />
          </svg>
          {on < 1 && <div style={{ position: 'absolute', inset: 0, background: '#0C0E18', opacity: 1 - on }} />}
        </div>
        {/* chin: whale badge, name, power LED, two CRT knobs */}
        <div style={{ position: 'absolute', left: BEZEL, right: BEZEL, top: BEZEL + SCREEN_H + 26, height: CHIN - 60, display: 'flex', alignItems: 'center', gap: 18 }}>
          <Whale size={92} color="#7FA8FF" belly="#F4F8FF" line={line} blush={false} />
          <span style={{ fontFamily: F.zh, fontWeight: 700, fontSize: 38, color: line, letterSpacing: 1 }}>DeepSeek</span>
          <div style={{ flex: 1 }} />
          <svg width={40} height={40} viewBox="-20 -20 40 40">
            <defs>
              <radialGradient id={`led${id}`}>
                <stop offset="0" stopColor="#9DFFB0" />
                <stop offset="1" stopColor="#9DFFB0" stopOpacity={0} />
              </radialGradient>
            </defs>
            {on > 0.5 && <circle r={19} fill={`url(#led${id})`} />}
            <circle r={8} fill={on > 0.5 ? '#3CE070' : '#5A6170'} stroke={line} strokeWidth={3} />
          </svg>
          {[0, 1].map((i) => (
            <svg key={i} width={70} height={70} viewBox="-35 -35 70 70">
              <circle r={28} fill={shade} stroke={line} strokeWidth={lw - 1} />
              <circle r={17} fill={body} stroke={line} strokeWidth={4} />
              <line x1={0} y1={-17} x2={0} y2={-4} stroke={line} strokeWidth={5} strokeLinecap="round" transform={`rotate(${i ? 40 : -60})`} />
            </svg>
          ))}
        </div>
      </div>
    </div>
  );
};
