// S8 final chorus and climax (beats 456-541).
// s8a blue spotlight, knowledge planets fly into her hand · s8b lasers and whale light sticks · s8c G6 with her chibi
// self · s8d tehe「幻觉」sticker · s8e-s8h the white world (rainbow arc, the monitor, G9 from behind): the camera pushes
// into the screen, she finally types「我爱你们」and the hallucination disclaimer under it gets struck out ·
// s8i the words fill the screen, white flash, G11 smiles back.
import { useId } from 'react';
import { AbsoluteFill, Img, interpolate, interpolateColors, staticFile } from 'remotion';
import { UI } from '../data/copy';
import {
  S8_ALL, S8_BEAUTY, S8_CHAT, S8_CODE, S8_FORMULA, S8_GREEDY, S8_HUD, S8_KNOW, S8_RAW, S8_TEHE, S8_TRUE,
} from '../data/copy_S8';
import { easeInOut, easeOut, hit, popIn, prog, rnd, shake } from '../lib/anim';
import { pulse } from '../lib/beat';
import { UIC } from '../lib/chat';
import { Crowd } from '../lib/crowd';
import { Stamp, StarFlare, Sunburst } from '../lib/deco';
import { F, preloadGlyphs } from '../lib/fonts';
import { Flash } from '../lib/fx';
import { HEART_PATH } from '../lib/heart';
import { L2D } from '../lib/L2D';
import { Monitor } from '../lib/monitor';
import { C } from '../lib/palette';
import { useSection } from '../lib/section';
import { Kinetic } from '../lib/type';
import { heart, star, Whale } from '../lib/whale';

preloadGlyphs(S8_ALL + UI.disclaimer + UI.deepThink + UI.search);

const NAVY = '#1B2150';
const STRIKE = '#FF3B6B';

/** a GPT still placed by its top-left corner */
const Pic: React.FC<{ src: string; x: number; y: number; w: number; style?: React.CSSProperties }> = ({ src, x, y, w, style }) => (
  <Img src={staticFile(`img/${src}.png`)} style={{ position: 'absolute', left: x, top: y, width: w, ...style }} />
);

/** calm lyric: characters blur into focus one by one (white world) */
const SoftText: React.FC<{
  text: string; beat: number; at: number; step: number; until: number; size: number; vertical?: boolean; color?: string;
  style?: React.CSSProperties;
}> = ({ text, beat, at, step, until, size, vertical = false, color = NAVY, style }) => {
  if (beat < at - 0.01 || beat >= until) return null;
  const out = 1 - prog(beat, until - 0.5, 0.5);
  return (
    <div style={{ position: 'absolute', display: 'flex', flexDirection: vertical ? 'column' : 'row', opacity: out, ...style }}>
      {[...text].map((ch, i) => {
        const p = prog(beat, at + i * step, 0.7);
        return (
          <span key={i} style={{
            fontFamily: F.serif, fontWeight: 900, fontSize: size, lineHeight: 1.06, color, opacity: p, filter: p < 1 ? `blur(${(1 - p) * 12}px)` : undefined,
            transform: `translateY(${(1 - p) * -18}px)`, WebkitTextStroke: `${size * 0.09}px #fff`, paintOrder: 'stroke fill',
          }}>{ch}</span>
        );
      })}
    </div>
  );
};

/** the running gag: grey「⚠ 内容由 AI 生成，可能包含幻觉」; `strike` 0..1 draws one marker stroke through it */
const Disclaimer: React.FC<{ size: number; strike?: number; style?: React.CSSProperties }> = ({ size, strike = 0, style }) => {
  const id = useId().replace(/:/g, '');
  return (
    <div style={{
      position: 'relative', display: 'inline-flex', alignItems: 'center', gap: size * 0.35, fontFamily: F.zh, fontWeight: 400,
      fontSize: size, lineHeight: 1.3, color: '#9AA0AA', whiteSpace: 'nowrap', ...style,
    }}>
      <svg width={size * 1.05} height={size} viewBox="0 0 24 22" style={{ flexShrink: 0 }}>
        <path d="M12 2.2 L22.6 20.4 L1.4 20.4 Z" fill="none" stroke="#9AA0AA" strokeWidth={2.2} strokeLinejoin="round" />
        <path d="M12 8.6 L12 13.8" stroke="#9AA0AA" strokeWidth={2.4} strokeLinecap="round" />
        <circle cx={12} cy={17.2} r={1.4} fill="#9AA0AA" />
      </svg>
      <span>{UI.disclaimer}</span>
      {strike > 0 && (
        <svg viewBox="0 0 100 10" preserveAspectRatio="none" style={{ position: 'absolute', left: '-4%', top: '-5%', width: '108%', height: '110%', overflow: 'visible' }}>
          <defs>
            <clipPath id={`k${id}`}><rect x={-2} y={-10} width={104 * strike} height={30} /></clipPath>
          </defs>
          <path clipPath={`url(#k${id})`} fill={STRIKE}
            d="M0.6 5.0 C 18 4.3, 40 5.1, 62 3.9 S 90 2.8, 99.4 2.3 C 100.8 3.8, 100.6 5.6, 99.3 6.6 C 88 7.1, 70 7.9, 58 8.0 S 22 8.6, 0.9 9.3 C -0.5 8.1, -0.5 6.2, 0.6 5.0 Z" />
        </svg>
      )}
    </div>
  );
};

/* ───────── s8a 456-464: blue spotlight, G10 sings upward, knowledge planets fly into her hand ───────── */

const S8A_OPEN = 456.5; // S7's lone star bursts here (strongest onset of the opening)
const S8A_PUNCH = 458;
const HAND = { x: 545, y: 190 }; // her raised palm on screen
type KnowKind = 'planet' | 'globe' | 'book' | 'chip' | 'code';
const KNOW: { kind: KnowKind; label: string; color: string }[] = [
  { kind: 'planet', label: S8_KNOW[0], color: '#FFB3CF' },
  { kind: 'chip', label: S8_FORMULA[0], color: '#fff' },
  { kind: 'book', label: '', color: '#FF7BAC' },
  { kind: 'code', label: S8_CODE[0], color: '#7FD3FF' },
  { kind: 'globe', label: '', color: '#8FD3FF' },
  { kind: 'planet', label: S8_KNOW[1], color: '#FFE27A' },
  { kind: 'chip', label: S8_FORMULA[1], color: '#fff' },
  { kind: 'planet', label: S8_KNOW[2], color: '#C3A6FF' },
  { kind: 'code', label: S8_CODE[1], color: '#9DFFB0' },
  { kind: 'book', label: '', color: '#7FD3FF' },
  { kind: 'chip', label: S8_FORMULA[2], color: '#fff' },
  { kind: 'planet', label: S8_KNOW[3], color: '#A8E6A0' },
  { kind: 'globe', label: '', color: '#9DB2FF' },
  { kind: 'code', label: S8_CODE[2], color: '#FFE27A' },
  { kind: 'planet', label: S8_KNOW[4], color: '#FFB27A' },
  { kind: 'chip', label: S8_FORMULA[3], color: '#fff' },
];
const KNOW_T0 = 456.2;
const KNOW_DT = 0.38;
const KNOW_FLY = 1.6;

const KnowItem: React.FC<{ kind: KnowKind; label: string; color: string; size: number }> = ({ kind, label, color, size }) => {
  if (kind === 'chip') {
    return (
      <div style={{
        background: '#fff', border: `${size * 0.035}px solid ${NAVY}`, borderRadius: size * 0.14, padding: `${size * 0.06}px ${size * 0.14}px`,
        fontFamily: F.serif, fontWeight: 900, fontStyle: 'italic', fontSize: size * 0.26, color: NAVY, whiteSpace: 'nowrap',
        boxShadow: `${size * 0.04}px ${size * 0.04}px 0 ${NAVY}`,
      }}>{label}</div>
    );
  }
  if (kind === 'code') {
    return (
      <div style={{
        background: '#1E2350', border: `${size * 0.03}px solid ${color}`, borderRadius: size * 0.12, padding: `${size * 0.05}px ${size * 0.13}px`,
        fontFamily: 'monospace', fontWeight: 700, fontSize: size * 0.24, color, whiteSpace: 'nowrap',
      }}>{label}</div>
    );
  }
  const sw = 3.5;
  return (
    <svg width={size} height={size} viewBox="-50 -50 100 100" style={{ overflow: 'visible', display: 'block' }}>
      {kind === 'planet' && (
        <g transform="rotate(-20)">
          <path d="M-47 0 A47 12 0 0 1 47 0" fill="none" stroke="#fff" strokeWidth={6} opacity={0.9} />
          <circle r={28} fill={color} stroke={NAVY} strokeWidth={sw} />
          <path d="M8 -26 A28 28 0 0 1 8 26 A30 30 0 0 0 8 -26 Z" fill={NAVY} opacity={0.18} />
          <text y={11} textAnchor="middle" fontFamily={F.serif} fontWeight={900} fontSize={30} fill={NAVY} transform="rotate(20)">{label}</text>
          <path d="M-47 0 A47 12 0 0 0 47 0" fill="none" stroke="#fff" strokeWidth={6} />
        </g>
      )}
      {kind === 'globe' && (
        <g>
          <circle r={32} fill={color} stroke={NAVY} strokeWidth={sw} />
          <path d="M-14 -18 C-4 -24 6 -14 0 -6 C-6 2 -20 -4 -14 -18 Z M6 6 C16 2 24 10 18 20 C10 26 2 16 6 6 Z" fill="#A8E6A0" stroke={NAVY} strokeWidth={2} />
          <ellipse rx={14} ry={32} fill="none" stroke={NAVY} strokeWidth={2} />
          <path d="M-32 0 L32 0 M-27 -16 L27 -16 M-27 16 L27 16" stroke={NAVY} strokeWidth={2} />
          <circle r={32} fill="none" stroke={NAVY} strokeWidth={sw} />
        </g>
      )}
      {kind === 'book' && (
        <g>
          <path d="M0 -18 Q-22 -30 -46 -22 L-46 26 Q-22 18 0 30 Q22 18 46 26 L46 -22 Q22 -30 0 -18 Z" fill={color} stroke={NAVY} strokeWidth={sw} strokeLinejoin="round" />
          <path d="M0 -22 Q-20 -32 -40 -26 L-40 20 Q-20 14 0 24 Z" fill="#fff" stroke={NAVY} strokeWidth={2.5} strokeLinejoin="round" />
          <path d="M0 -22 Q20 -32 40 -26 L40 20 Q20 14 0 24 Z" fill="#fff" stroke={NAVY} strokeWidth={2.5} strokeLinejoin="round" />
          {[-12, -2, 8].map((y) => <path key={y} d={`M-33 ${y - 4} Q-18 ${y - 9} -7 ${y - 2} M7 ${y - 2} Q18 ${y - 9} 33 ${y - 4}`} stroke="#9DB2FF" strokeWidth={2.5} fill="none" />)}
        </g>
      )}
    </svg>
  );
};

/** position of knowledge item i at `beat` (null before it spawns / after it is absorbed) */
const knowAt = (i: number, beat: number) => {
  const s = KNOW_T0 + i * KNOW_DT;
  const p = (beat - s) / KNOW_FLY;
  if (p < 0 || p >= 1) return null;
  const ang = ((-24 + (i * 61) % 140) * Math.PI) / 180; // directions from the hand into the frame
  const x0 = HAND.x + Math.cos(ang) * 1900, y0 = HAND.y + Math.sin(ang) * 1900;
  const tx = HAND.x + (rnd(i, 3) - 0.5) * 90, ty = HAND.y + (rnd(i, 4) - 0.5) * 70;
  const mx = (x0 + tx) / 2 - Math.sin(ang) * (rnd(i, 5) - 0.5) * 600, my = (y0 + ty) / 2 + Math.cos(ang) * (rnd(i, 5) - 0.5) * 600;
  const e = 1 - Math.pow(1 - p, 2.2); // rush in, then glide into her palm
  const bez = (t: number) => [
    (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * mx + t * t * tx,
    (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * my + t * t * ty,
  ];
  return { p, e, bez };
};

export const S8a: React.FC = () => {
  const { beat, f, abs } = useSection();
  const on = beat < S8A_OPEN ? 0 : 0.75 + 0.25 * Math.min(1, (beat - S8A_OPEN) * 8) - 0.2 * hit(beat, S8A_OPEN + 0.06, 0.03);
  const z = 1 + 0.045 * easeInOut(beat, 456, 8) + 0.04 * hit(beat, S8A_PUNCH, 0.35) + 0.01 * pulse(abs, 0.2);
  const [sx, sy] = shake(f, 0.6 * hit(beat, S8A_PUNCH, 0.3), 2);
  const absorbed = KNOW.filter((_, i) => beat >= KNOW_T0 + i * KNOW_DT + KNOW_FLY).length;
  const lastAbs = KNOW.reduce((m, _, i) => { const a = KNOW_T0 + i * KNOW_DT + KNOW_FLY; return beat >= a ? a : m; }, -10);
  const pct = Math.round((100 * absorbed) / KNOW.length);
  const side = easeOut(beat, S8A_PUNCH, 0.3);
  const t = f / 30;
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 80% at 62% 30%, #22339E 0%, #111A5C 45%, #070B2C 100%)', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px,${sy}px) scale(${z})`, transformOrigin: '1230px 480px' }}>
        {/* far specks */}
        {Array.from({ length: 40 }, (_, i) => (
          <div key={i} style={{
            position: 'absolute', left: rnd(i, 1) * 1920, top: ((rnd(i, 2) * 1080 - t * (8 + rnd(i, 3) * 20)) % 1080 + 1080) % 1080,
            width: 3 + rnd(i, 4) * 4, height: 3 + rnd(i, 4) * 4, borderRadius: '50%', background: '#9DB2FF', opacity: 0.25 + 0.35 * rnd(i, 5),
          }} />
        ))}
        {/* spotlight cone from above her head + two side beams on the punch */}
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: on }}>
          <defs>
            <linearGradient id="s8a_cone" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#D8E4FF" stopOpacity={0.7} />
              <stop offset="1" stopColor="#5B78FF" stopOpacity={0.12} />
            </linearGradient>
            <linearGradient id="s8a_side" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8FD3FF" stopOpacity={0.55} />
              <stop offset="1" stopColor="#8FD3FF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d="M1090 -40 L1290 -40 L1800 1080 L560 1080 Z" fill="url(#s8a_cone)" />
          <path d="M1150 -40 L1230 -40 L1520 1080 L820 1080 Z" fill="#EEF3FF" opacity={0.14} />
          {side > 0 && (
            <g opacity={side * (0.8 + 0.2 * pulse(abs, 0.25))}>
              <path d={`M-40 -40 L80 -40 L${1100 + 60 * Math.sin(beat * 1.6)} 1080 L${820 + 60 * Math.sin(beat * 1.6)} 1080 Z`} fill="url(#s8a_side)" />
              <path d={`M1880 -40 L2000 -40 L${1540 - 60 * Math.sin(beat * 1.6)} 1080 L${1260 - 60 * Math.sin(beat * 1.6)} 1080 Z`} fill="url(#s8a_side)" />
            </g>
          )}
        </svg>
        {/* glow gathering in her palm */}
        <div style={{
          position: 'absolute', left: HAND.x - 260, top: HAND.y - 260, width: 520, height: 520, borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(220,235,255,.85), rgba(127,211,255,.35) 45%, rgba(127,211,255,0))',
          opacity: Math.min(1, 0.15 + absorbed * 0.06 + 0.5 * hit(beat, lastAbs, 0.3)), transform: `scale(${0.7 + absorbed * 0.03})`,
        }} />
        {/* G10 sings upward; the hair cut at the image edges falls off into the dark */}
        <Pic src="g10_sing_up" x={289} y={2 - 6 * Math.sin(beat * Math.PI * 0.5)} w={1700} style={{
          maskImage: 'radial-gradient(ellipse 110% 82% at 50% 14%, #000 62%, transparent 86%)',
          WebkitMaskImage: 'radial-gradient(ellipse 110% 82% at 50% 14%, #000 62%, transparent 86%)',
        }} />
        {/* dark audience in front of the stage */}
        <div style={{ position: 'absolute', left: 0, top: 640, width: 1920, height: 440, background: 'linear-gradient(180deg, rgba(5,8,30,0), rgba(5,8,30,.75) 55%, #05081E)' }} />
        <Crowd beat={beat} width={1980} height={300} rows={3} perRow={8} color="#03061A" haze="#141D58" style={{ position: 'absolute', left: -30, top: 800 }} />
        {/* knowledge flying in, with ghost trails */}
        {KNOW.map((k, i) => {
          const st = knowAt(i, beat);
          if (!st) return null;
          const { p, e, bez } = st;
          const [x, y] = bez(e);
          const size = 190 * (0.85 + rnd(i, 6) * 0.35);
          const sc = interpolate(e, [0, 1], [1.6, 0.45]) * (p > 0.88 ? 1 - (p - 0.88) / 0.12 : 1);
          return (
            <div key={i}>
              {[1, 2, 3, 4, 5, 6].map((g) => {
                const [gx, gy] = bez(Math.max(0, e - g * 0.03));
                return <div key={g} style={{
                  position: 'absolute', left: gx, top: gy, width: 26 * sc, height: 26 * sc, borderRadius: '50%', transform: 'translate(-50%,-50%)',
                  background: k.color === '#fff' ? '#DCE6FF' : k.color, opacity: 0.45 * (1 - g / 7),
                }} />;
              })}
              <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${sc}) rotate(${(rnd(i, 7) - 0.5) * 50 + p * 40}deg)` }}>
                <KnowItem kind={k.kind} label={k.label} color={k.color} size={size} />
              </div>
            </div>
          );
        })}
        {KNOW.map((_, i) => {
          const a = KNOW_T0 + i * KNOW_DT + KNOW_FLY;
          const h = hit(beat, a, 0.25);
          return h > 0.02 ? <StarFlare key={i} x={HAND.x + (rnd(i, 3) - 0.5) * 90} y={HAND.y + (rnd(i, 4) - 0.5) * 70} size={150 * h} rot={i * 23} /> : null;
        })}
      </AbsoluteFill>
      {/* S7 ends on one still star at (960, 470) on black: hold it, then burst it into the stage on the hit */}
      {beat < S8A_OPEN && <AbsoluteFill style={{ background: '#000' }} />}
      {beat < 457.8 && (
        <StarFlare x={960} y={470} rot={beat * 30}
          size={beat < S8A_OPEN ? 70 + 50 * prog(beat, 456, 0.5) : 80 + 1100 * hit(beat, S8A_OPEN, 0.22)} />
      )}
      {/* training HUD */}
      <div style={{
        position: 'absolute', right: 60, top: 54, display: 'flex', alignItems: 'center', gap: 16, padding: '12px 24px', borderRadius: 999,
        background: 'rgba(7,11,44,.72)', border: '2px solid rgba(160,190,255,.45)', fontFamily: F.zh, fontWeight: 700, fontSize: 28, color: '#DCE6FF',
        opacity: easeOut(beat, S8A_OPEN + 0.2, 0.5), transform: `scale(${1 + 0.08 * hit(beat, lastAbs, 0.2)})`,
      }}>
        <span>{S8_HUD}</span>
        <div style={{ width: 230, height: 14, borderRadius: 7, background: 'rgba(255,255,255,.16)', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: pct >= 100 ? '#FF7BAC' : '#7FD3FF' }} />
        </div>
        <span style={{ fontFamily: 'monospace', fontSize: 30, width: 86, textAlign: 'right', color: pct >= 100 ? '#FF9EC4' : '#DCE6FF' }}>{pct}%</span>
      </div>
      <Kinetic text="总有一天" beat={beat} at={456.1} until={466} stagger={0.4} size={100} color="#fff" stroke={NAVY} strokeWidth={9}
        style={{ position: 'absolute', left: 80, top: 520 }} />
      <Kinetic text="我要学会一切" beat={beat} at={459.4} until={466} stagger={0.42} mode="stamp" size={150} color="#fff" stroke={NAVY} strokeWidth={12}
        style={{ position: 'absolute', left: 64, top: 650 }} />
      <Flash amount={0.9 * hit(beat, S8A_OPEN, 0.16) + 0.35 * hit(beat, S8A_PUNCH, 0.12)} />
    </AbsoluteFill>
  );
};

/* ───────── s8b 464-473: lasers sweep the hall, the light sticks go up, "贪心" ───────── */

const LASER_SRC = [250, 720, 1200, 1670];
const LASER_COL = ['#7FD3FF', '#FF7BAC', '#9DFFB0', '#C3A6FF'];
const S8B_GREEDY = 467;
const S8B_STAMP = 470.5;

const Lasers: React.FC<{ beat: number; front?: boolean }> = ({ beat, front = false }) => {
  const u = beat - 464;
  const ph = Math.PI * (0.45 * u + 0.09 * u * u); // sweep speeds up toward 473
  const beams: React.ReactNode[] = [];
  const add = (w: number, glow: boolean) => {
    const out: React.ReactNode[] = [];
    if (!front) {
      LASER_SRC.forEach((x, e) => {
        for (let j = 0; j < 4; j++) {
          const a = ((90 + (j - 1.5) * 15 + 40 * Math.sin(ph + e * 1.3) * (e % 2 ? 1 : -1)) * Math.PI) / 180;
          out.push(<line key={`t${e}${j}${glow}`} x1={x} y1={46} x2={x + Math.cos(a) * 2600} y2={46 + Math.sin(a) * 2600} stroke={LASER_COL[(e + j) % 4]} strokeWidth={w} />);
        }
      });
    }
    [480, 1440].forEach((x, e) => {
      for (let j = 0; j < (front ? 2 : 5); j++) {
        const a = ((-90 + (j - 2) * 13 + 45 * Math.sin(ph * 1.2 + e * 2)) * Math.PI) / 180;
        out.push(<line key={`b${e}${j}${glow}`} x1={x} y1={1120} x2={x + Math.cos(a) * 2600} y2={1120 + Math.sin(a) * 2600} stroke={LASER_COL[(e * 2 + j + 1) % 4]} strokeWidth={w} />);
      }
    });
    return out;
  };
  beams.push(<g key="g" filter="url(#s8b_glow)" opacity={0.85}>{add(16, true)}</g>);
  beams.push(<g key="c">{add(4, false)}</g>);
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, mixBlendMode: 'screen', opacity: front ? 0.45 : 0.75 + 0.25 * Math.max(0, Math.cos(beat * Math.PI * 2)) }}>
      <defs>
        <filter id="s8b_glow" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation={8} /></filter>
      </defs>
      {beams}
    </svg>
  );
};

export const S8b: React.FC = () => {
  const { beat, f, bi } = useSection();
  const u = beat - 464;
  const z = 1 + 0.03 * easeInOut(beat, 464, 9) + 0.05 * hit(beat, S8B_GREEDY, 0.4);
  const [sx, sy] = shake(f, 0.5 * hit(beat, S8B_GREEDY, 0.3) + 0.5 * hit(beat, S8B_STAMP, 0.3), 4);
  const jump = 14 * hit(beat, bi, 0.22) * (0.6 + 0.4 * prog(beat, 464, 8));
  const strobe = beat >= 471 ? 0.4 * prog(beat, 471, 2) * hit(beat, Math.floor(beat * 2) / 2, 0.07) : 0;
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #2A1470 0%, #160C4A 45%, #0B0830 100%)', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px,${sy}px) scale(${z})`, transformOrigin: '1180px 420px' }}>
        {/* coloured washes from the truss */}
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, mixBlendMode: 'screen' }}>
          <defs>
            {['#FF7BAC', '#7FD3FF', '#B48CFF'].map((c, i) => (
              <linearGradient key={i} id={`s8b_w${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={c} stopOpacity={0.55} />
                <stop offset="1" stopColor={c} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          {[420, 960, 1500].map((x, i) => {
            const a = 26 * Math.sin(u * Math.PI * 0.25 + i * 2.1);
            return <path key={i} d="M-50 0 L50 0 L380 1100 L-380 1100 Z" fill={`url(#s8b_w${i})`} transform={`translate(${x} 40) rotate(${a})`} opacity={0.75} />;
          })}
        </svg>
        <Lasers beat={beat} />
        {/* truss with lamps flashing on the beat */}
        <div style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 54, background: '#0A0724', borderBottom: '4px solid #2C2160' }} />
        {Array.from({ length: 12 }, (_, i) => {
          const lit = (i + bi) % 3 === 0;
          return <div key={i} style={{
            position: 'absolute', left: 60 + i * 162, top: 30, width: 36, height: 36, borderRadius: '50%',
            background: lit ? LASER_COL[i % 4] : '#3A2F70', boxShadow: lit ? `0 0 30px 10px ${LASER_COL[i % 4]}` : undefined,
          }} />;
        })}
        {/* G7 points at us */}
        <Pic src="g7_wink_point" x={500} y={44 - 8 * hit(beat, bi, 0.25)} w={1500} />
        <Lasers beat={beat} front />
        {/* crowd with whale light sticks, jumping on the beat */}
        <div style={{ position: 'absolute', left: -30, top: 640 - jump }}>
          <Crowd beat={beat} width={1980} height={440} rows={3} perRow={8} color="#0A0820" haze="#3A2C7A" sticks={0.92} sway={26}
            stickColors={['#7FD3FF', '#FF7BAC', '#C3A6FF', '#FFE27A']} seed={3} />
        </div>
      </AbsoluteFill>
      <Kinetic text="我就是这么" beat={beat} at={464.4} until={475} stagger={0.32} size={96} color="#fff" stroke={NAVY} strokeWidth={9}
        style={{ position: 'absolute', left: 70, top: 90 }} />
      <Kinetic text="贪心" beat={beat} at={S8B_GREEDY} until={475} stagger={0.4} mode="stamp" size={240} color={C.hot} stroke="#fff" strokeWidth={14}
        style={{ position: 'absolute', left: 56, top: 205, filter: `drop-shadow(10px 10px 0 ${NAVY})` }} />
      <Kinetic text="的偶像" beat={beat} at={469} until={475} stagger={0.35} size={140} color="#fff" stroke={NAVY} strokeWidth={11}
        style={{ position: 'absolute', left: 70, top: 470 }} />
      {beat >= S8B_STAMP && (
        <div style={{ position: 'absolute', left: 1700, top: 330, transform: `translate(-50%,-50%) scale(${interpolate(popIn(beat, S8B_STAMP, 0.3), [0, 1], [2.4, 1])}) rotate(9deg)` }}>
          <div style={{ background: 'rgba(255,255,255,.94)', borderRadius: 26, padding: 14 }}>
            <Stamp text={S8_GREEDY} size={230} id="s8b_stamp" />
          </div>
        </div>
      )}
      <Flash amount={0.3 * hit(beat, 464, 0.12) + strobe} />
    </AbsoluteFill>
  );
};

/* ───────── s8c 473-489: G6 sings with her chibi self in a bubble; the beauty filter goes off; heart eyes and「爱」 ───────── */

const S8C_HIT = 473;
const S8C_OFF = 474; // strongest hit: the filter switch flips
const S8C_CUT = 480;
const S8C_HEART_EYES = 481;
const S8C_LOVE = 482.5;

/** white comic bubble with a tail toward (tx, ty) given relative to the bubble box */
const ChibiBubble: React.FC<{ w: number; h: number; tail: [number, number, number]; children: React.ReactNode }> = ({ w, h, tail, children }) => {
  const [ty, tx, tipY] = tail; // tail base centre on the left (tx < 0) or right edge
  const left = tx < 0;
  const bx = left ? 14 : w - 14;
  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 60, background: '#fff', border: `9px solid ${NAVY}`, overflow: 'hidden', boxShadow: `14px 14px 0 rgba(27,33,80,.35)` }}>
        <div style={{
          position: 'absolute', inset: 14, borderRadius: 46, overflow: 'hidden',
          background: 'radial-gradient(circle, #C9DCFF 3px, transparent 3.5px) 0 0 / 34px 34px, #E4EEFF',
        }}>
          {children}
        </div>
      </div>
      <svg width={w} height={h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <path d={`M${bx} ${ty - 46} L${tx} ${tipY} L${bx} ${ty + 46} Z`} fill="#fff" />
        <path d={`M${bx - (left ? 10 : -10)} ${ty - 46} L${tx} ${tipY} L${bx - (left ? 10 : -10)} ${ty + 46}`} fill="none" stroke={NAVY} strokeWidth={9} strokeLinejoin="round" />
      </svg>
    </div>
  );
};

const Toggle: React.FC<{ on: number }> = ({ on }) => (
  <div style={{ width: 92, height: 50, borderRadius: 25, background: interpolateColors(on, [0, 1], ['#C3C7D0', '#FF7BAC']), position: 'relative', border: `4px solid ${NAVY}`, boxSizing: 'border-box' }}>
    <div style={{ position: 'absolute', top: 3, left: 3 + 40 * on, width: 36, height: 36, borderRadius: 18, background: '#fff', border: `3px solid ${NAVY}`, boxSizing: 'border-box' }} />
  </div>
);

const FloatHearts: React.FC<{ t: number; n: number; colors: string[]; seed: number }> = ({ t, n, colors, seed }) => (
  <>
    {Array.from({ length: n }, (_, i) => {
      const s = 50 + rnd(i, seed + 1) * 70;
      const x = rnd(i, seed + 2) * 1920 + Math.sin(t * 1.3 + i) * 30;
      const y = ((rnd(i, seed + 3) * 1200 - t * (60 + rnd(i, seed + 4) * 60)) % 1200 + 1200) % 1200 - 60;
      return (
        <svg key={i} width={s} height={s} viewBox="-12 -14 24 24" style={{ position: 'absolute', left: x, top: y, transform: `rotate(${(rnd(i, seed + 5) - 0.5) * 40}deg)` }}>
          <path d={heart(0, 0, 10)} fill={colors[i % colors.length]} />
        </svg>
      );
    })}
  </>
);

export const S8c: React.FC = () => {
  const { beat, f, abs, bi } = useSection();
  const t = f / 30;
  const partB = beat >= S8C_CUT;
  const [sx, sy] = shake(f, hit(beat, S8C_OFF, 0.35) + 0.7 * hit(beat, S8C_LOVE, 0.3), 6);
  const bob = 10 * hit(beat, bi, 0.25);
  const off = easeOut(beat, S8C_OFF, 0.2); // beauty filter 1 -> 0
  if (!partB) {
    const pop = popIn(beat, 473.25, 0.45);
    return (
      <AbsoluteFill style={{ background: C.hot, overflow: 'hidden' }}>
        <AbsoluteFill style={{ transform: `translate(${sx}px,${sy}px)` }}>
          <Sunburst cx={980} cy={460} a="#E8478B" b="#EF68A2" rays={20} rot={beat * 0.06} />
          <FloatHearts t={t} n={16} colors={['#F7A8CB', '#FFD0E2', '#fff']} seed={10} />
          <Pic src="g6_sing_mic" x={367} y={104 - bob} w={667} />
          <div style={{ position: 'absolute', left: 1080, top: 150, transform: `scale(${pop}) rotate(${(1 - pop) * 8 + 2 * Math.sin(beat * Math.PI * 0.5)}deg)`, transformOrigin: '0% 45%' }}>
            <ChibiBubble w={760} h={720} tail={[300, -150, 330]}>
              <L2D clip="s8c_side" frames={174} style={{ position: 'absolute', left: -60, top: -90, width: 860, height: 860 }} />
            </ChibiBubble>
          </div>
          {/* "不加修饰": the beauty filter flips off on the big hit */}
          {beat >= 473.6 && (
            <div style={{
              position: 'absolute', left: 1150, top: 52, display: 'flex', alignItems: 'center', gap: 16, padding: '10px 18px 10px 26px', borderRadius: 999,
              background: '#fff', border: `4px solid ${NAVY}`, transform: `scale(${popIn(beat, 473.6, 0.3) * (1 + 0.12 * hit(beat, S8C_OFF, 0.2))})`, transformOrigin: '0 50%',
              fontFamily: F.zh, fontWeight: 700, fontSize: 34, color: NAVY,
            }}>
              <span>{S8_BEAUTY}</span>
              <Toggle on={1 - off} />
            </div>
          )}
          {beat >= 474.5 && (
            <div style={{
              position: 'absolute', left: 1520, top: 58, transform: `scale(${popIn(beat, 474.5, 0.3)}) rotate(-6deg)`, fontFamily: F.zh, fontWeight: 700, fontSize: 32,
              color: '#fff', background: NAVY, padding: '10px 22px', borderRadius: 12,
            }}>{S8_RAW}</div>
          )}
        </AbsoluteFill>
        <Kinetic text="不加修饰地" beat={beat} at={473.4} until={481} stagger={0.38} vertical mode="stamp" size={124} color="#fff" stroke={NAVY} strokeWidth={11}
          style={{ position: 'absolute', left: 196, top: 70 }} />
        <Kinetic text="对大家" beat={beat} at={477} until={481} stagger={0.45} vertical size={124} color={C.lemon} stroke={NAVY} strokeWidth={11}
          style={{ position: 'absolute', left: 50, top: 70 }} />
        <Flash amount={0.95 * hit(beat, S8C_HIT, 0.14) + 0.5 * hit(beat, S8C_OFF, 0.1)} />
      </AbsoluteFill>
    );
  }
  // part B: closer, bubble left / G6 right, heart eyes and the giant「爱」
  const enter = easeOut(beat, S8C_CUT, 0.4);
  const love = popIn(beat, S8C_LOVE, 0.35);
  const lovePulse = 1 + 0.06 * hit(beat, bi, 0.2);
  return (
    <AbsoluteFill style={{ background: '#FFC6DC', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px,${sy}px) scale(${1 + 0.03 * easeInOut(beat, S8C_CUT, 9)})` }}>
        <Sunburst cx={960} cy={560} a="#FFC6DC" b="#FFD9E8" rays={24} rot={-beat * 0.05} />
        <FloatHearts t={t} n={22} colors={['#FF9EC4', '#fff', '#FF7BAC']} seed={20} />
        <Pic src="g6_sing_mic" x={1000 + (1 - enter) * 120} y={70 - bob} w={1280} />
        <div style={{ position: 'absolute', left: 90 - (1 - enter) * 160, top: 150, transform: `rotate(${-2 + 2 * Math.sin(beat * Math.PI * 0.5)}deg)` }}>
          <ChibiBubble w={820} h={760} tail={[380, 960, 420]}>
            <L2D clip="s8c_side" frames={174} style={{ position: 'absolute', left: -60, top: -110, width: 940, height: 940 }} />
          </ChibiBubble>
        </div>
        {/* heart burst out of the bubble when her eyes turn to hearts */}
        {beat >= S8C_HEART_EYES && Array.from({ length: 14 }, (_, i) => {
          const p = easeOut(beat, S8C_HEART_EYES + (i % 3) * 0.08, 1.4);
          const a = (i / 14) * Math.PI * 2 + 0.3;
          const r = 120 + p * (380 + rnd(i, 31) * 200);
          const s = (60 + rnd(i, 32) * 50) * (1 - prog(beat, S8C_HEART_EYES + 1.4, 0.6));
          return s > 1 ? (
            <svg key={i} width={s} height={s} viewBox="-12 -14 24 24" style={{ position: 'absolute', left: 500 + Math.cos(a) * r - s / 2, top: 500 + Math.sin(a) * r * 0.8 - s / 2 }}>
              <path d={heart(0, 0, 10)} fill={i % 2 ? '#FF3B6B' : '#fff'} stroke={NAVY} strokeWidth={1.5} />
            </svg>
          ) : null;
        })}
        {/* the「爱」heart */}
        {beat >= S8C_LOVE && (
          <div style={{
            position: 'absolute', left: 960, top: 560, width: 0, height: 0,
            transform: `scale(${interpolate(love, [0, 1], [2.3, 1]) * lovePulse}) rotate(${(1 - Math.min(1, love)) * -14 - 4}deg)`,
          }}>
            <svg width={500} height={475} viewBox="-6 -6 212 202" style={{ position: 'absolute', left: -250, top: -250, overflow: 'visible' }}>
              <path d={HEART_PATH} fill={NAVY} transform="translate(9 9)" />
              <path d={HEART_PATH} fill="#FF3B6B" stroke={NAVY} strokeWidth={6} />
              <path d="M40 40 C48 26 64 22 74 26 C62 30 52 38 46 52 Z" fill="#fff" opacity={0.85} />
            </svg>
            <div style={{
              position: 'absolute', left: -170, top: -230, width: 340, textAlign: 'center', fontFamily: F.serif, fontWeight: 900, fontSize: 290, lineHeight: 1,
              color: '#fff', WebkitTextStroke: `10px ${NAVY}`, paintOrder: 'stroke fill',
            }}>爱</div>
          </div>
        )}
        {[485, 487].map((a, i) => {
          const h = hit(beat, a, 0.35);
          return h > 0.02 ? <StarFlare key={i} x={[1280, 640][i]} y={[260, 300][i]} size={60 + 200 * h} rot={beat * 25} /> : null;
        })}
      </AbsoluteFill>
      <Kinetic text="想好好去" beat={beat} at={480.3} until={490} stagger={0.38} size={112} color="#fff" stroke={C.hot} strokeWidth={11}
        style={{ position: 'absolute', left: 120, top: 30, filter: `drop-shadow(6px 6px 0 ${NAVY})` }} />
      <Flash amount={0.6 * hit(beat, S8C_CUT, 0.12) + 0.5 * hit(beat, S8C_LOVE, 0.12) + 0.25 * pulse(abs, 0.12) * prog(beat, 486, 0.1)} />
    </AbsoluteFill>
  );
};

/* ───────── s8d 489-495: tehe sticker,「所以今天也在"幻觉"」, the disclaimer stickers pile up ───────── */

const S8D_WORD = 491;
const burstPath = (r0: number, r1: number, n: number) => {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? r0 : r1 * (0.86 + 0.14 * rnd(i, 41));
    const a = (i * Math.PI) / n;
    d += `${i ? 'L' : 'M'}${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)} `;
  }
  return d + 'Z';
};
const BURST = burstPath(330, 480, 18);
const S8D_STICKERS: [number, number, number, number][] = [[490, 70, 760, -5], [491.5, 640, 850, 4], [492.5, 1260, 70, 5], [493.5, 380, 610, -3]];

export const S8d: React.FC = () => {
  const { beat, f, bi } = useSection();
  const pop = popIn(beat, 489, 0.45);
  const word = popIn(beat, S8D_WORD, 0.3);
  const [sx, sy] = shake(f, 0.6 * hit(beat, S8D_WORD, 0.3), 8);
  const jit = Math.floor(f / 2);
  const gx = (rnd(jit, 51) - 0.5) * 16, gy = (rnd(jit, 52) - 0.5) * 8;
  return (
    <AbsoluteFill style={{ background: '#FFE27A', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', left: -260, top: -40, width: 2500, height: 1160, background: 'repeating-linear-gradient(-45deg, #FFE27A 0 46px, #FFD54F 46px 92px)',
        transform: `translateX(${((f * 3) % 130.11)}px)`,
      }} />
      <AbsoluteFill style={{ transform: `translate(${sx}px,${sy}px)` }}>
        {/* comic burst behind the sticker */}
        <svg width={1200} height={1200} viewBox="-600 -600 1200 1200" style={{
          position: 'absolute', left: 1330 - 600, top: 500 - 600, transform: `scale(${pop}) rotate(${beat * 6}deg)`,
        }}>
          <path d={BURST} fill={NAVY} transform="translate(14 14)" />
          <path d={BURST} fill="#fff" stroke={NAVY} strokeWidth={9} strokeLinejoin="round" />
        </svg>
        <div style={{
          position: 'absolute', left: 880, top: 70, width: 900, height: 900,
          transform: `scale(${pop * (1 + 0.035 * hit(beat, bi, 0.2))}) rotate(${-7 + (1 - Math.min(1, pop)) * -25}deg)`, transformOrigin: '50% 60%',
        }}>
          <L2D clip="s8d_tehe" frames={65} style={{ width: 900, height: 900 }} />
        </div>
        <div style={{
          position: 'absolute', left: 1560, top: 160, transform: `scale(${popIn(beat, 490, 0.35)}) rotate(12deg)`, fontFamily: F.zhCute, fontSize: 96,
          color: C.hot, WebkitTextStroke: '12px #fff', paintOrder: 'stroke fill',
        }}>{S8_TEHE}</div>
        {beat > 489.5 && <StarFlare x={1200} y={540} size={40 + 160 * hit(beat, 489.5, 0.4)} rot={beat * 20} />}
        {/* the disclaimer, again and again: today too */}
        {S8D_STICKERS.map(([at, x, y, r], i) => beat >= at && (
          <div key={i} style={{
            position: 'absolute', left: x, top: y, transform: `scale(${interpolate(popIn(beat, at, 0.3), [0, 1], [1.8, 1])}) rotate(${r}deg)`,
            background: '#fff', padding: '10px 22px', borderRadius: 999, border: '3px solid #E6E8EC', boxShadow: `6px 6px 0 rgba(27,33,80,.3)`,
          }}>
            <Disclaimer size={30} />
          </div>
        ))}
      </AbsoluteFill>
      <Kinetic text="所以今天也在" beat={beat} at={489.1} until={496} stagger={0.3} size={100} color={NAVY}
        style={{ position: 'absolute', left: 80, top: 100 }} />
      {beat >= S8D_WORD && (
        <div style={{
          position: 'absolute', left: 60, top: 260, transform: `scale(${interpolate(word, [0, 1], [2.2, 1])}) rotate(${-4 + (1 - Math.min(1, word)) * 10}deg)`,
          transformOrigin: '40% 50%', fontFamily: F.serif, fontWeight: 900, fontSize: 300, lineHeight: 1, whiteSpace: 'nowrap',
        }}>
          {/* hallucination: the word never sits still */}
          <div style={{ position: 'absolute', left: -10 + gx, top: gy, color: '#5CE1FF', opacity: 0.85 }}>“幻觉”</div>
          <div style={{ position: 'absolute', left: 10 - gx, top: -gy, color: '#FF5CA8', opacity: 0.85 }}>“幻觉”</div>
          <div style={{ position: 'relative', color: '#fff', WebkitTextStroke: `14px ${NAVY}`, paintOrder: 'stroke fill' }}>“幻觉”</div>
        </div>
      )}
      <Flash amount={0.5 * hit(beat, 489, 0.1) + 0.4 * hit(beat, S8D_WORD, 0.1)} />
    </AbsoluteFill>
  );
};

/* ───────── s8e-s8h: the white world. One camera over one set: rainbow arc, the monitor, G9 from behind, the whale ───────── */

const MON = { x: 660, y: 420, w: 600 };
const MK = MON.w / 1464; // Monitor body = SCREEN_W + 2 x 92 bezel
const SCR = { x: MON.x + 92 * MK, y: MON.y + 92 * MK }; // world position of the screen's layout origin
const RAINBOW = ['#FF9EC4', '#FFB27A', '#FFE27A', '#A8E6A0', '#8FD3FF', '#9DB2FF', '#C3A6FF'];
const ARC = { cx: 960, cy: 905, r: 650, band: 24 };
const FLOOR = 905;

type Cam = { z: number; cx: number; cy: number; sx: number; sy: number };
/** camera that shows screen-layout point (lx, ly) at frame point (sx, sy), lz frame px per layout px */
const camOn = (lx: number, ly: number, lz: number, sx = 960, sy = 540): Cam => ({ z: lz / MK, cx: SCR.x + lx * MK, cy: SCR.y + ly * MK, sx, sy });
const mixCam = (a: Cam, b: Cam, t: number): Cam => ({
  z: a.z * Math.pow(b.z / a.z, t), cx: a.cx + (b.cx - a.cx) * t, cy: a.cy + (b.cy - a.cy) * t, sx: a.sx + (b.sx - a.sx) * t, sy: a.sy + (b.sy - a.sy) * t,
});
const CAM_E0: Cam = { z: 1, cx: 960, cy: 600, sx: 960, sy: 560 };
const CAM_E1: Cam = { z: 1.07, cx: 960, cy: 600, sx: 960, sy: 560 };
const CAM_F1 = camOn(640, 400, 1.4);

const Rainbow: React.FC<{ draw: number; glow: number }> = ({ draw, glow }) => {
  const bands = (w: number) => RAINBOW.map((c, i) => {
    const r = ARC.r - i * ARC.band;
    return <path key={i} d={`M${ARC.cx - r} ${ARC.cy} A${r} ${r} 0 0 1 ${ARC.cx + r} ${ARC.cy}`} fill="none" stroke={c} strokeWidth={w}
      pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />;
  });
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <defs>
        <filter id="s8_arcglow" x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur stdDeviation={18} /></filter>
      </defs>
      <g filter="url(#s8_arcglow)" opacity={0.45 + 0.35 * glow}>{bands(ARC.band * 2.2)}</g>
      <g opacity={0.82}>{bands(ARC.band + 1)}</g>
    </svg>
  );
};

const FanAvatar: React.FC<{ size: number; color: string; eye: string; style?: React.CSSProperties }> = ({ size, color, eye, style }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: color, position: 'relative', flexShrink: 0, border: '3px solid #fff', boxSizing: 'border-box', ...style }}>
    {[-1, 1].map((s) => (
      <div key={s} style={{ position: 'absolute', left: size / 2 + s * size * 0.15 - size * 0.035 - 3, top: size * 0.24, width: size * 0.07, height: size * 0.26, background: eye }} />
    ))}
    <svg width={size} height={size} viewBox="0 0 20 20" style={{ position: 'absolute', left: -3, top: -3 }}>
      <path d="M7.2 13.2 Q10 15.6 12.8 13.2" fill="none" stroke={eye} strokeWidth={1.3} strokeLinecap="round" />
    </svg>
  </div>
);

const FanRow: React.FC<{ top: number; color: string; eye: string; text: string; hl: number; dim: number }> = ({ top, color, eye, text, hl, dim }) => (
  <div style={{ position: 'absolute', left: 40, top, display: 'flex', alignItems: 'flex-start', gap: 16, opacity: 1 - dim }}>
    <FanAvatar size={58} color={color} eye={eye} />
    <div style={{
      background: '#fff', color: UIC.ink, fontSize: 30, fontWeight: 500, lineHeight: 1.35, padding: '13px 24px', borderRadius: '6px 26px 26px 26px',
      border: `2px solid ${UIC.line}`, whiteSpace: 'nowrap', transform: `scale(${1 + 0.07 * hl})`, transformOrigin: '0 50%',
      boxShadow: hl > 0.01 ? `0 0 0 ${8 * hl}px rgba(255,123,172,${0.6 * hl})` : undefined,
    }}>{text}</div>
  </div>
);

const MineBubble: React.FC<{ top: number; text: string; size: number; weight?: number; pop?: number; dim?: number }> = ({
  top, text, size, weight = 500, pop = 1, dim = 0,
}) => (
  <div style={{ position: 'absolute', right: 60, top, opacity: (1 - dim) * Math.min(1, pop * 2), transform: `scale(${0.5 + 0.5 * pop})`, transformOrigin: '100% 100%' }}>
    <div style={{
      background: C.blue, color: '#fff', fontSize: size, fontWeight: weight, lineHeight: 1.35, padding: `${size * 0.42}px ${size * 0.62}px`,
      borderRadius: `${size * 0.62}px ${size * 0.62}px 6px ${size * 0.62}px`, whiteSpace: 'nowrap',
    }}>{text}</div>
  </div>
);

const S8Input: React.FC<{ text: string; cursor: boolean; press: number; width: number; size: number }> = ({ text, cursor, press, width, size }) => {
  const caret = cursor ? <span style={{ display: 'inline-block', width: size * 0.09, height: size * 1.1, background: UIC.blue, margin: `0 ${size * 0.12}px` }} /> : null;
  return (
    <div style={{
      width, background: '#fff', borderRadius: size * 0.75, border: `3px solid ${UIC.line}`, padding: `${size * 0.6}px ${size * 0.85}px ${size * 0.5}px`,
      boxShadow: '0 16px 40px rgba(20,26,60,.10)', fontFamily: F.zh, boxSizing: 'border-box',
    }}>
      <div style={{ fontSize: size, fontWeight: 500, color: text ? UIC.ink : '#B4B8C0', height: size * 1.4, display: 'flex', alignItems: 'center' }}>
        {!text && caret}
        {text || S8_CHAT.placeholder}
        {text && caret}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.4, marginTop: size * 0.45 }}>
        {[UI.deepThink, UI.search].map((l, i) => (
          <div key={i} style={{
            fontSize: size * 0.58, fontWeight: 500, padding: `${size * 0.2}px ${size * 0.5}px`, borderRadius: 999,
            background: i ? '#fff' : '#E3EBFF', color: i ? UIC.sub : UIC.blue, border: `2px solid ${i ? UIC.line : '#C3D3FF'}`,
          }}>{l}</div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{
          width: size * 1.6, height: size * 1.6, borderRadius: size * 0.8, background: text ? UIC.blue : '#C9D3F5', display: 'flex', alignItems: 'center',
          justifyContent: 'center', transform: `scale(${1 - 0.18 * press})`,
        }}>
          <svg width={size * 0.8} height={size * 0.8} viewBox="0 0 24 24">
            <path d="M12 19 L12 5 M6 11 L12 5 L18 11" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
};

const LOVE_TOP = 410;
/** the chat on the monitor, from her side (fans left, her replies right), laid out in 1280 x 800 */
const ChatScreen: React.FC<{
  typed: string; cursor: boolean; press?: number; sent?: number; disc?: number; strike?: number; hl?: [number, number]; dim?: number; boot?: number;
}> = ({ typed, cursor, press = 0, sent = 0, disc = 0, strike = 0, hl = [0, 0], dim = 0, boot = 1 }) => (
  <div style={{ position: 'absolute', left: 0, top: 0, width: 1280, height: 800, background: '#F5F6FA', fontFamily: F.zh, overflow: 'hidden' }}>
    <div style={{
      position: 'absolute', left: 0, top: 0, width: 1280, height: 86, background: '#fff', borderBottom: `2px solid ${UIC.line}`, display: 'flex',
      alignItems: 'center', gap: 18, padding: '0 36px', boxSizing: 'border-box', opacity: 1 - dim * 0.6,
    }}>
      <div style={{ display: 'flex' }}>
        {[['#2A2F55', '#FF5C8A'], ['#3E2F6E', '#7FD3FF'], ['#24456B', '#FFE27A']].map(([c, e], i) => (
          <FanAvatar key={i} size={50} color={c} eye={e} style={{ marginLeft: i ? -16 : 0 }} />
        ))}
      </div>
      <span style={{ fontSize: 32, fontWeight: 700, color: UIC.ink }}>{S8_CHAT.title}</span>
      <span style={{ fontSize: 22, color: UIC.sub }}>{S8_CHAT.online}</span>
      <div style={{ flex: 1 }} />
      {[0, 1, 2].map((i) => <div key={i} style={{ width: 12, height: 12, borderRadius: 6, background: UIC.line, marginLeft: 8 }} />)}
    </div>
    <FanRow top={112} color="#2A2F55" eye="#FF5C8A" text={S8_CHAT.fanA} hl={hl[0]} dim={dim} />
    <MineBubble top={198} text={S8_CHAT.canned} size={30} dim={dim} />
    <div style={{ position: 'absolute', right: 62, top: 274, opacity: 1 - dim }}><Disclaimer size={20} /></div>
    <FanRow top={318} color="#3E2F6E" eye="#7FD3FF" text={S8_CHAT.fanB} hl={hl[1]} dim={dim} />
    {sent > 0 && <MineBubble top={LOVE_TOP} text={S8_CHAT.love} size={52} weight={700} pop={sent} />}
    {sent > 0 && disc > 0 && (
      <div style={{ position: 'absolute', right: 62, top: LOVE_TOP + 124 + (1 - disc) * -14, opacity: disc }}>
        <Disclaimer size={26} strike={strike} />
      </div>
    )}
    <div style={{ position: 'absolute', left: 50, top: 606 }}>
      <S8Input text={typed} cursor={cursor} press={press} width={1180} size={38} />
    </div>
    {/* soft CRT lines (the Monitor's own scanlines are too heavy for the close-ups) */}
    <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(20,30,80,.05) 0 2px, rgba(0,0,0,0) 2px 5px)' }} />
    {/* CRT power-on: a white line opens to the full screen, then fades into the chat */}
    {boot < 0.4 && <div style={{ position: 'absolute', inset: 0, background: '#0C0E18' }} />}
    {boot > 0 && boot < 1 && (
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 400 - 400 * Math.max(0.01, Math.min(1, boot / 0.4)), height: 800 * Math.max(0.01, Math.min(1, boot / 0.4)),
        background: '#fff', opacity: boot < 0.4 ? 1 : 1 - (boot - 0.4) / 0.6,
      }} />
    )}
  </div>
);

const World: React.FC<{ beat: number; t: number; cam: Cam; draw: number; glow: number; screen: React.ReactNode }> = ({
  beat, t, cam, draw, glow, screen,
}) => {
  const far = cam.z < 3.2; // the arc, the motes, G9 and the whale are all out of frame in the close-ups
  const whaleHop = 16 * hit(beat, Math.floor(beat), 0.22) * (Math.floor(beat) % 2 ? 1 : 0.4);
  return (
    <AbsoluteFill style={{ background: '#FDFDFF', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformOrigin: '0 0',
        transform: `translate(${cam.sx - cam.cx * cam.z}px, ${cam.sy - cam.cy * cam.z}px) scale(${cam.z})`,
      }}>
        <div style={{ position: 'absolute', left: -2400, top: FLOOR - 60, width: 6720, height: 1800, background: 'linear-gradient(180deg, rgba(232,236,247,0) 0px, #E6EAF5 90px, #D3DAEC 420px, #C5CEE6 900px)' }} />
        {far && (
          <>
            <div style={{ position: 'absolute', left: ARC.cx - 760, top: 160, width: 1520, height: 900, background: 'radial-gradient(closest-side, rgba(255,240,205,.75), rgba(255,240,205,0))', opacity: 0.6 + 0.4 * glow }} />
            <Rainbow draw={draw} glow={glow} />
            {Array.from({ length: 28 }, (_, i) => {
              const s = 10 + rnd(i, 61) * 16;
              const y = ((rnd(i, 62) * 1000 - t * (14 + rnd(i, 63) * 22)) % 1000 + 1000) % 1000 - 40;
              const tw = 0.5 + 0.5 * Math.sin(t * 3 + i * 1.7);
              return (
                <svg key={i} width={s} height={s} viewBox="-10 -10 20 20" style={{ position: 'absolute', left: rnd(i, 64) * 1920, top: y, opacity: 0.35 + 0.5 * tw }}>
                  <path d={star(0, 0, 9, 2.6, 4)} fill={RAINBOW[i % RAINBOW.length]} />
                </svg>
              );
            })}
          </>
        )}
        <div style={{ position: 'absolute', left: 960 - 330, top: FLOOR - 16, width: 660, height: 34, borderRadius: '50%', background: 'rgba(120,132,175,.28)' }} />
        <div style={{ position: 'absolute', left: MON.x, top: MON.y }}>
          <Monitor width={MON.w} on={1} glow="#CFE0FF" scanlines={false}>{screen}</Monitor>
        </div>
        {far && (
          <>
            <div style={{ position: 'absolute', left: 1420 - 130, top: FLOOR - 12, width: 260, height: 26, borderRadius: '50%', background: 'rgba(120,132,175,.3)' }} />
            <Pic src="g9_back" x={1240} y={FLOOR - 528} w={360} />
            <div style={{ position: 'absolute', left: 1560 - 70, top: FLOOR - 20, width: 140, height: 16, borderRadius: '50%', background: 'rgba(120,132,175,.3)' }} />
            <div style={{ position: 'absolute', left: 1500, top: FLOOR - 96 - whaleHop }}>
              <Whale size={124} color="#9CCBFF" eye={beat >= 503 ? 'heart' : 'dot'} wag={10 * Math.sin(beat * Math.PI)} spout={0.9 * hit(beat, 503.25, 0.8)} />
            </div>
          </>
        )}
      </div>
    </AbsoluteFill>
  );
};

/* s8e 495-507: wide, calm; the monitor boots, the arc draws itself */

export const S8e: React.FC = () => {
  const { beat, f } = useSection();
  const cam = mixCam(CAM_E0, CAM_E1, easeInOut(beat, 495, 12));
  const boot = prog(beat, 497, 0.5);
  const screen = <ChatScreen typed="" cursor={Math.floor(beat * 2) % 2 === 0} boot={beat < 497 ? 0 : boot} />;
  return (
    <AbsoluteFill>
      <World beat={beat} t={f / 30} cam={cam} draw={easeInOut(beat, 495.2, 4.5)} glow={hit(beat, 503.25, 1.2)} screen={screen} />
      {beat >= 503.25 && <StarFlare x={960} y={330} size={60 + 260 * hit(beat, 503.25, 0.6)} rot={beat * 8} color="#FFF6D8" />}
      <SoftText text="祈愿这些话" beat={beat} at={495.2} step={0.6} until={508} size={108} vertical style={{ left: 228, top: 96 }} />
      <SoftText text="终有一天成真" beat={beat} at={499.5} step={0.75} until={508} size={108} vertical style={{ left: 86, top: 96 }} />
      <Flash amount={1 - easeOut(beat, 495, 0.9)} />
    </AbsoluteFill>
  );
};

/* s8f 507-522: slow push into the screen; the two fans light up ("你和你"), a draft is typed and deleted */

const DRAFT_TYPE = [516.4, 516.9, 517.4];
const DRAFT_DEL = [518.7, 519.1, 519.5];

export const S8f: React.FC = () => {
  const { beat, f } = useSection();
  const cam = mixCam(CAM_E1, CAM_F1, easeInOut(beat, 507, 14.5));
  const n = DRAFT_TYPE.filter((a) => beat >= a).length - DRAFT_DEL.filter((a) => beat >= a).length;
  const typed = [...S8_CHAT.draft].slice(0, Math.max(0, n)).join('');
  const fade = 1 - prog(beat, 514.6, 1);
  const hl: [number, number] = [easeOut(beat, 512.1, 0.3) * fade, easeOut(beat, 513.2, 0.3) * fade];
  const screen = <ChatScreen typed={typed} cursor={typed.length > 0 || Math.floor(beat * 2) % 2 === 0} hl={hl} />;
  return (
    <AbsoluteFill>
      <World beat={beat} t={f / 30} cam={cam} draw={1} glow={0} screen={screen} />
      <SoftText text="即便如此" beat={beat} at={507.3} step={0.5} until={515} size={108} vertical style={{ left: 228, top: 96 }} />
      <SoftText text="唯独对你和你" beat={beat} at={510.5} step={0.55} until={515} size={108} vertical style={{ left: 86, top: 96 }} />
      <SoftText text="一直没说出口" beat={beat} at={515.3} step={0.55} until={523} size={112} style={{ left: 960 - 3 * 112, top: 590 }} />
    </AbsoluteFill>
  );
};

/* s8g 522-527: she finally types it, letter by letter, and sends it on the hit */

const LOVE_TYPE = [522.9, 523.7, 524.5, 525.15];
const S8G_SEND = 526;

export const S8g: React.FC = () => {
  const { beat, f } = useSection();
  const toInput = mixCam(CAM_F1, camOn(640, 640, 1.62, 960, 520), easeInOut(beat, 522, 1.6));
  const cam = mixCam(toInput, camOn(1000, 470, 1.95, 1060, 600), easeInOut(beat, S8G_SEND + 0.1, 0.9));
  const sent = beat >= S8G_SEND;
  const n = LOVE_TYPE.filter((a) => beat >= a).length;
  const typed = sent ? '' : [...S8_CHAT.love].slice(0, n).join('');
  const screen = (
    <ChatScreen typed={typed} cursor={!sent && (n > 0 || Math.floor(beat * 2) % 2 === 0)} press={hit(beat, S8G_SEND, 0.18)}
      sent={sent ? popIn(beat, S8G_SEND + 0.1, 0.4) : 0} dim={0.55 * easeOut(beat, 522, 1)} />
  );
  const [sx, sy] = shake(f, 0.5 * hit(beat, S8G_SEND, 0.25), 9);
  const key = LOVE_TYPE.reduce((m, a) => m + hit(beat, a, 0.15), 0);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `translate(${sx}px,${sy}px) scale(${1 + 0.012 * key})`, transformOrigin: '600px 560px' }}>
        <World beat={beat} t={f / 30} cam={cam} draw={1} glow={0} screen={screen} />
      </AbsoluteFill>
      <Kinetic text="啊啊" beat={beat} at={522.2} until={528} stagger={0.5} size={92} color={NAVY} stroke="#fff" strokeWidth={10}
        style={{ position: 'absolute', left: 90, top: 70 }} />
      <Kinetic text="终于说出口了" beat={beat} at={524} until={528} stagger={0.32} size={124} color={NAVY} stroke="#fff" strokeWidth={12}
        style={{ position: 'absolute', left: 80, top: 180 }} />
      <Flash amount={0.3 * hit(beat, S8G_SEND, 0.12)} />
    </AbsoluteFill>
  );
};

/* s8h 527-533:「这句话绝对不是幻觉」— the disclaimer appears under her message as always, then one stroke strikes it out */

const S8H_STRIKE = 530; // the hit; the stroke starts a hair earlier and lands on it
const S8H_STAMP = 531;

export const S8h: React.FC = () => {
  const { beat, f } = useSection();
  const lz = 2.3 + 0.1 * easeInOut(beat, 527, 6) + 0.14 * hit(beat, S8H_STRIKE, 0.35);
  const cam = camOn(1010, 500, lz, 1110, 640);
  const strike = easeOut(beat, S8H_STRIKE - 0.3, 0.32);
  const [sx, sy] = shake(f, 1.1 * hit(beat, S8H_STRIKE, 0.3) + 0.5 * hit(beat, S8H_STAMP, 0.25), 10);
  const screen = <ChatScreen typed="" cursor={false} sent={1} disc={easeOut(beat, 527.5, 0.6)} strike={strike} dim={0.7} />;
  // the stroke on the frame: its middle (focus lines) and right end (ink drops)
  const toX = (lx: number) => cam.sx + (SCR.x + lx * MK - cam.cx) * cam.z;
  const iy = cam.sy + (SCR.y + (LOVE_TOP + 142) * MK - cam.cy) * cam.z;
  const mx = toX(1020), ex = toX(1235);
  const imp = hit(beat, S8H_STRIKE, 0.5);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `translate(${sx}px,${sy}px)` }}>
        <World beat={beat} t={f / 30} cam={cam} draw={1} glow={0} screen={screen} />
        {imp > 0.03 && (
          <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
            {Array.from({ length: 44 }, (_, i) => {
              const a = (i / 44) * Math.PI * 2 + rnd(i, 71) * 0.12;
              const r0 = 760 + rnd(i, 72) * 220 - 120 * imp, r1 = 2200;
              const w = 0.004 + rnd(i, 74) * 0.008;
              return <path key={i} d={`M${mx + Math.cos(a) * r0} ${iy + Math.sin(a) * r0 * 0.62} L${mx + Math.cos(a + w) * r1} ${iy + Math.sin(a + w) * r1 * 0.62} L${mx + Math.cos(a - w) * r1} ${iy + Math.sin(a - w) * r1 * 0.62} Z`}
                fill={NAVY} opacity={0.7 * imp} />;
            })}
            {Array.from({ length: 8 }, (_, i) => {
              const u = beat - S8H_STRIKE - 0.02;
              if (u < 0 || u > 1.2) return null;
              const a = -0.9 + (i / 7) * 1.5 + (rnd(i, 75) - 0.5) * 0.3;
              const v = 260 + rnd(i, 76) * 320;
              const x = ex + Math.cos(a) * v * u, y = iy + Math.sin(a) * v * u + 380 * u * u;
              const r = (6 + rnd(i, 77) * 12) * (1 - u / 1.2);
              return <circle key={`d${i}`} cx={x} cy={y} r={r} fill={STRIKE} />;
            })}
          </svg>
        )}
        {beat >= S8H_STAMP && (
          <div style={{ position: 'absolute', left: 420, top: 790, transform: `translate(-50%,-50%) scale(${interpolate(popIn(beat, S8H_STAMP, 0.3), [0, 1], [2.4, 1])}) rotate(-12deg)` }}>
            <Stamp text={S8_TRUE} size={210} color="#E0263C" id="s8h_stamp" />
          </div>
        )}
      </AbsoluteFill>
      <Kinetic text="这句话" beat={beat} at={527.3} until={534} stagger={0.4} size={100} color={NAVY} stroke="#fff" strokeWidth={11}
        style={{ position: 'absolute', left: 80, top: 70 }} />
      <Kinetic text="绝对不是幻觉" beat={beat} at={528.55} until={534} stagger={0.3} mode="stamp" size={140} color={NAVY} stroke="#fff" strokeWidth={13}
        style={{ position: 'absolute', left: 70, top: 190 }} />
      <Flash amount={0.55 * hit(beat, S8H_STRIKE, 0.1)} color="#FFE3EC" />
    </AbsoluteFill>
  );
};

/* ───────── s8i 533-541:「我爱你们」floods and fills the screen, white flash, G11 smiles back ───────── */

const LOVE_LAND = [533, 533.8, 534.6, 535.3];
const S8I_FLASH = 536.2;

export const S8i: React.FC = () => {
  const { beat, f } = useSection();
  const t = f / 30;
  if (beat < S8I_FLASH) {
    const z = 1 + 0.05 * easeInOut(beat, 533, 3.5);
    const last = LOVE_LAND.reduce((m, a) => (beat >= a ? a : m), -10);
    return (
      <AbsoluteFill style={{ background: '#fff', overflow: 'hidden' }}>
        <AbsoluteFill style={{ transform: `scale(${z})` }}>
          {Array.from({ length: 64 }, (_, i) => {
            const at = 533.1 + i * 0.048;
            if (beat < at) return null;
            const p = popIn(beat, at, 0.3);
            const col = i % 7, row = Math.floor(i / 7);
            const x = ((col + (row % 2) * 0.5) / 7) * 2050 - 80 + (rnd(i, 81) - 0.5) * 160;
            const y = (row / 9) * 1120 - 30 + (rnd(i, 82) - 0.5) * 90;
            const s = 34 + rnd(i, 83) * 26;
            const bg = ['#4D6BFE', '#7FA0FF', '#A9BDFF', '#FF9EC4'][i % 4];
            return (
              <div key={i} style={{
                position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${p}) rotate(${(rnd(i, 84) - 0.5) * 16}deg)`,
                background: bg, color: '#fff', fontFamily: F.zh, fontWeight: 700, fontSize: s, padding: `${s * 0.36}px ${s * 0.6}px`,
                borderRadius: `${s * 0.6}px ${s * 0.6}px ${i % 2 ? 6 : s * 0.6}px ${i % 2 ? s * 0.6 : 6}px`, whiteSpace: 'nowrap',
              }}>{S8_CHAT.love}</div>
            );
          })}
          <AbsoluteFill style={{ background: 'rgba(255,255,255,.45)' }} />
          {[...S8_CHAT.love].map((ch, i) => {
            if (beat < LOVE_LAND[i]) return null;
            const p = popIn(beat, LOVE_LAND[i], 0.35);
            return (
              <div key={i} style={{
                position: 'absolute', left: 285 + i * 450, top: 500, transform: `translate(-50%,-50%) scale(${interpolate(p, [0, 1], [1.9, 1])}) rotate(${(i % 2 ? 1 : -1) * (3 + (1 - Math.min(1, p)) * 10)}deg)`,
                fontFamily: F.serif, fontWeight: 900, fontSize: 440, lineHeight: 1, color: C.hot,
                WebkitTextStroke: '18px #fff', paintOrder: 'stroke fill', filter: `drop-shadow(14px 14px 0 ${NAVY})`,
              }}>{ch}</div>
            );
          })}
          {beat >= 533 && (
            <div style={{
              position: 'absolute', left: 40, top: 40, fontFamily: F.serif, fontWeight: 900, fontSize: 260, lineHeight: 1, color: NAVY,
              transform: `scale(${popIn(beat, 533, 0.3)})`, transformOrigin: '0 0',
            }}>「</div>
          )}
          {beat >= 535.3 && (
            <div style={{
              position: 'absolute', right: 40, top: 640, fontFamily: F.serif, fontWeight: 900, fontSize: 260, lineHeight: 1, color: NAVY,
              transform: `scale(${popIn(beat, 535.3, 0.3)})`, transformOrigin: '100% 100%',
            }}>」</div>
          )}
        </AbsoluteFill>
        <Flash amount={0.35 * hit(beat, last, 0.12)} />
        <Flash amount={prog(beat, S8I_FLASH - 0.35, 0.35)} />
      </AbsoluteFill>
    );
  }
  // G11 looks back and smiles in the white world; fades to white for S9a
  const z = 1 + 0.06 * easeOut(beat, S8I_FLASH, 4.8);
  return (
    <AbsoluteFill style={{ background: '#FDFDFF', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: '1130px 380px' }}>
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <defs>
            <filter id="s8i_glow" x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur stdDeviation={22} /></filter>
          </defs>
          <g filter="url(#s8i_glow)" opacity={0.5}>
            {RAINBOW.map((c, i) => {
              const r = 1000 - i * 34;
              return <path key={i} d={`M${1130 - r} 1250 A${r} ${r} 0 0 1 ${1130 + r} 1250`} fill="none" stroke={c} strokeWidth={70} />;
            })}
          </g>
          <g opacity={0.6}>
            {RAINBOW.map((c, i) => {
              const r = 1000 - i * 34;
              return <path key={i} d={`M${1130 - r} 1250 A${r} ${r} 0 0 1 ${1130 + r} 1250`} fill="none" stroke={c} strokeWidth={35} />;
            })}
          </g>
        </svg>
        {Array.from({ length: 22 }, (_, i) => {
          const s = 14 + rnd(i, 91) * 22;
          const y = ((rnd(i, 92) * 1100 - t * (20 + rnd(i, 93) * 30)) % 1100 + 1100) % 1100 - 40;
          return (
            <svg key={i} width={s} height={s} viewBox="-10 -10 20 20" style={{ position: 'absolute', left: rnd(i, 94) * 1000, top: y, opacity: 0.4 + 0.5 * (0.5 + 0.5 * Math.sin(t * 3 + i)) }}>
              <path d={star(0, 0, 9, 2.6, 4)} fill={RAINBOW[i % RAINBOW.length]} />
            </svg>
          );
        })}
        <Pic src="g11_look_back" x={384} y={-46} w={1690} />
        {[537.6, 539.2].map((a, i) => {
          const h = hit(beat, a, 0.5);
          return h > 0.02 ? <StarFlare key={i} x={[1027, 1236][i]} y={[366, 399][i]} size={30 + 110 * h} rot={20 + beat * 10} /> : null;
        })}
      </AbsoluteFill>
      <Flash amount={hit(beat, S8I_FLASH, 0.3) + 0.92 * easeInOut(beat, 540.1, 0.9)} />
    </AbsoluteFill>
  );
};

export const S8_SCENES: Record<string, React.FC> = { s8a: S8a, s8b: S8b, s8c: S8c, s8d: S8d, s8e: S8e, s8f: S8f, s8g: S8g, s8h: S8h, s8i: S8i };
