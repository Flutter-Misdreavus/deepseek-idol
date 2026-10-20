// S9 outro (beats 541-590): after「我爱你们」the whale plush drops into the water, the monitor lights up yellow
// with the title logo, the camera dives into the screen, the CRT switches off, and quiet end credits close on black.
// The outro is a soft 8th-note figure with few real hits: bars on 545 / 549 / 553 ..., a bass hit on 578, and the
// song's last three thumps on 582.0 / 582.7 / 583.46 (silence from 584). Everything below is placed on those.
import { AbsoluteFill, Easing, interpolate } from 'remotion';
import { S9_COPY, S9_CREDITS, S9_FAN, S9_LICENSE } from '../data/copy_S9';
import { clamp01, easeInOut, easeOut, hit, popIn, prog, rnd, shake } from '../lib/anim';
import { Flash } from '../lib/fx';
import { StarFlare, WhalePattern } from '../lib/deco';
import { F, preloadGlyphs } from '../lib/fonts';
import { Monitor, SCREEN_H, SCREEN_W } from '../lib/monitor';
import { C } from '../lib/palette';
import { useSection } from '../lib/section';
import { heart, Whale } from '../lib/whale';
import { InkLogo, logoStage } from './S0_logo';

preloadGlyphs(S9_COPY);

const NAVY = '#26305C';
const easeIn = Easing.in(Easing.cubic);

/* ───────── the whale plush (code-drawn, faces left) ───────── */

const P_BODY = 'M20 110 C12 52 62 18 120 18 C186 18 222 60 220 108 C218 150 188 170 140 170 L80 170 C40 170 24 146 20 110 Z';
const P_TAIL = 'M196 132 C226 124 244 100 248 70 C236 64 224 52 220 34 C238 38 252 50 258 64 C268 46 284 36 304 36 C296 56 280 70 266 76 C266 112 248 140 214 156 Z';
const P_FIN = 'M110 152 C114 176 132 186 152 184 C144 172 140 160 140 148 Z';

const Plush: React.FC<{ size: number; eye?: 'button' | 'closed'; spout?: number; wet?: boolean; id: string; style?: React.CSSProperties }> = ({
  size, eye = 'button', spout = 0, wet = false, id, style,
}) => {
  const body = wet ? '#7DB5F2' : '#8EC3FF';
  const shade = wet ? '#5E97DC' : '#6FA6EC';
  const top = 18 - 150 * spout;
  return (
    <svg width={size} height={(size * 300) / 360} viewBox="-20 -90 360 300" style={{ overflow: 'visible', ...style }}>
      <defs>
        <clipPath id={`pb${id}`}><path d={P_BODY} /></clipPath>
      </defs>
      {spout > 0.02 && (
        <g stroke={NAVY} strokeWidth={4} strokeLinejoin="round" fill="#E8F6FF">
          <path d={`M106 22 C104 ${top + 30} 98 ${top + 12} 84 ${top} C100 ${top + 2} 110 ${top + 14} 114 ${top + 22} C118 ${top + 14} 128 ${top + 2} 144 ${top} C130 ${top + 12} 124 ${top + 30} 122 22 Z`} />
          <circle cx={78} cy={top - 10} r={7 * spout} />
          <circle cx={150} cy={top - 6} r={6 * spout} />
          <circle cx={114} cy={top - 24} r={5 * spout} />
        </g>
      )}
      <g fill={body} stroke={NAVY} strokeWidth={6} strokeLinejoin="round">
        <path d={P_TAIL} />
        <path d={P_BODY} />
      </g>
      <g clipPath={`url(#pb${id})`}>
        <ellipse cx={196} cy={160} rx={86} ry={56} fill={shade} opacity={0.55} />
        <ellipse cx={100} cy={184} rx={120} ry={54} fill="#FFF6E6" />
        <ellipse cx={100} cy={184} rx={120} ry={54} fill="none" stroke={NAVY} strokeWidth={3} strokeDasharray="9 9" opacity={0.55} />
        <path d="M58 52 C80 34 112 30 134 34 C118 40 92 46 72 64 Z" fill="#fff" opacity={0.75} />
      </g>
      <path d={P_BODY} fill="none" stroke={NAVY} strokeWidth={6} />
      {/* stitch along the tail fluke */}
      <path d="M232 128 C250 112 258 92 258 70" fill="none" stroke={NAVY} strokeWidth={3} strokeDasharray="8 8" opacity={0.5} />
      <path d={P_FIN} fill={body} stroke={NAVY} strokeWidth={6} strokeLinejoin="round" />
      {/* cloth tag with a heart */}
      <g transform="rotate(18 214 150)">
        <rect x={204} y={140} width={30} height={24} rx={3} fill="#fff" stroke={NAVY} strokeWidth={3} />
        <path d={heart(219, 152, 6)} fill={C.hot} />
      </g>
      {eye === 'button' ? (
        <g>
          <circle cx={70} cy={98} r={12} fill={NAVY} />
          <circle cx={66} cy={93} r={4} fill="#fff" />
        </g>
      ) : (
        <path d="M58 100 Q70 110 82 100" fill="none" stroke={NAVY} strokeWidth={5} strokeLinecap="round" />
      )}
      <ellipse cx={92} cy={122} rx={15} ry={8} fill="#FF9EC4" opacity={0.8} />
      <path d="M44 120 Q52 128 60 120" fill="none" stroke={NAVY} strokeWidth={4} strokeLinecap="round" />
      {wet && (
        <g fill="#fff" opacity={0.85}>
          <ellipse cx={150} cy={60} rx={7} ry={4} />
          <ellipse cx={176} cy={84} rx={4} ry={3} />
          <ellipse cx={40} cy={86} rx={4} ry={3} />
        </g>
      )}
    </svg>
  );
};

/* ───────── s9a 541-549: from white, the plush falls into the water — crown splash, droplets, ripples ───────── */

const S9A_HIT = 545;
const PX = 960;
const PLUSH_W = 620;
const GRAV = 1500; // px per beat²

const CROWN = Array.from({ length: 18 }, (_, i) => {
  const a = (i / 18) * Math.PI * 2 + rnd(i, 61) * 0.25;
  return { a, h: 140 + rnd(i, 62) * 170, w: 22 + rnd(i, 63) * 16 };
});
const DROPS = Array.from({ length: 24 }, (_, i) => {
  const a = rnd(i, 71) * Math.PI * 2;
  return {
    a, vx: Math.cos(a) * (200 + rnd(i, 72) * 460), vy: -(560 + rnd(i, 73) * 620), r: 8 + rnd(i, 74) * 11, delay: rnd(i, 75) * 0.25,
  };
});
const BOKEH = Array.from({ length: 9 }, (_, i) => ({
  x: rnd(i, 81) * 1920, y: 60 + rnd(i, 82) * 420, r: 50 + rnd(i, 83) * 120, c: ['#FFE1EC', '#E1ECFF', '#FFF1D2'][i % 3],
}));

export const S9a: React.FC = () => {
  const { beat, f } = useSection();
  const t = f / 30;
  const horizon = 600 + 720 * (1 - easeInOut(beat, 541, 3.4));
  const WL = horizon + 190;
  const landed = beat >= S9A_HIT;
  const b = beat - S9A_HIT;
  // the fall: enters from the top, accelerating, slowly turning
  const u = prog(beat, 541, 4);
  const restY = 790 - 118;
  const fallY = interpolate(0.25 * u + 0.75 * u * u, [0, 1], [-420, restY]);
  const sink = landed ? 26 * (1 - Math.exp(-b / 0.25)) + 34 * Math.exp(-b / 0.9) * Math.sin(b * Math.PI * 1.15) + 7 * Math.sin(b * 1.6) : 0;
  const py = landed ? restY + sink : fallY;
  const prot = landed ? 8 + 10 * Math.exp(-b / 0.8) * Math.sin(b * 5) + 2 * Math.sin(b * 1.3) : interpolate(u, [0, 1], [-34, 8]);
  const px = PX + (landed ? 0 : 40 * Math.sin(u * 2.4) * (1 - u));
  const spout = popIn(beat, 548, 0.4) * (1 - easeOut(beat, 548.7, 0.35));
  const [sx, sy] = shake(f, 0.6 * hit(beat, S9A_HIT, 0.2), 9);
  const push = 1 + 0.05 * easeInOut(beat, 541, 8);
  const ripples = [0, 0.5, 1.1].map((d) => b - d).filter((x) => x > 0);
  const lands = landed
    ? DROPS.map((d) => ({ d, tl: d.delay + (2 * -d.vy) / GRAV })).filter(({ tl }) => b > tl && b < tl + 2.2)
    : [];
  const ring = (rx: number, ry: number, op: number, w: number, key: string, cx = PX, cy = WL) => (
    <ellipse key={key} cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="#fff" strokeWidth={w} opacity={op} />
  );
  const rippleEls = (front: boolean) => (
    <g clipPath={front ? 'url(#s9a_front)' : undefined}>
      {ripples.map((x, i) => {
        const rx = 280 + 420 * Math.pow(x, 0.7);
        return ring(rx, rx * 0.17, clamp01(1 - x / 3.2), 7 * clamp01(1 - x / 3.5) + 1, `r${i}`);
      })}
      {lands.map(({ d, tl }, i) => {
        const x = b - tl;
        const lx = PX + Math.cos(d.a) * 250 + d.vx * tl;
        const ly = WL + Math.sin(d.a) * 48;
        const rx = 14 + 70 * Math.pow(x, 0.6);
        return ring(rx, rx * 0.2, clamp01(1 - x / 2.2) * 0.9, 3, `l${i}`, lx, ly);
      })}
      {landed && ring(235 + 8 * Math.sin(b * 3), 36, 0.9, 6, 'meniscus')}
    </g>
  );
  const crown = (back: boolean) =>
    landed && b < 1.6
      ? CROWN.filter((c) => (Math.sin(c.a) < 0) === back).map((c, i) => {
        const env = Math.sin(Math.PI * clamp01(b / 1.4));
        const bx = PX + Math.cos(c.a) * 250, by = WL + Math.sin(c.a) * 48;
        const h = c.h * env;
        const tx = bx + Math.cos(c.a) * h * 0.45, ty = by - h;
        return (
          <g key={i} fill="#fff" stroke="#6CC1E6" strokeWidth={3} strokeLinejoin="round">
            <path d={`M${bx - c.w} ${by} Q${bx - c.w * 0.2} ${by - h * 0.5} ${tx} ${ty} Q${bx + c.w * 0.2} ${by - h * 0.5} ${bx + c.w} ${by} Z`} />
            {env > 0.2 && <circle cx={tx + Math.cos(c.a) * 6} cy={ty - 14 * env} r={c.w * 0.45} />}
          </g>
        );
      })
      : null;
  return (
    <AbsoluteFill style={{ background: '#FBFAF6', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px,${sy}px) scale(${push})`, transformOrigin: '960px 760px' }}>
        {BOKEH.map((k, i) => (
          <div key={i} style={{
            position: 'absolute', left: k.x + Math.sin(t * 0.4 + i) * 30 - k.r, top: k.y + (horizon - 600) * 0.4 - k.r + Math.cos(t * 0.3 + i) * 20,
            width: k.r * 2, height: k.r * 2, borderRadius: '50%', background: k.c, opacity: 0.4,
          }} />
        ))}
        {/* water plane in perspective, with drifting light streaks */}
        <div style={{
          position: 'absolute', left: -40, right: -40, top: horizon, height: 1400,
          background: 'linear-gradient(180deg, #E6F5FB 0px, #C4E8F7 180px, #A6DAF1 520px, #93CFEC 900px)',
        }} />
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <clipPath id="s9a_front"><rect x={-100} y={WL} width={2200} height={800} /></clipPath>
          </defs>
          <line x1={-50} y1={horizon} x2={1970} y2={horizon} stroke="#D3EDF8" strokeWidth={3} />
          {Array.from({ length: 11 }, (_, j) => {
            const d = (j + 1) / 11;
            const y = horizon + 760 * d * d;
            return (
              <line key={j} x1={-50} y1={y} x2={1970} y2={y} stroke="#fff" strokeWidth={2 + 5 * d} opacity={0.55}
                strokeDasharray={`${60 + 260 * d} ${120 + 380 * d}`} strokeDashoffset={-t * (12 + 40 * d) - j * 97} strokeLinecap="round" />
            );
          })}
          {/* shadow on the water while she falls */}
          {!landed && u > 0.2 && <ellipse cx={PX} cy={WL} rx={110 + 180 * u} ry={(110 + 180 * u) * 0.2} fill="#5FA9D3" opacity={0.25 * u} />}
          {rippleEls(false)}
          {crown(true)}
        </svg>
        <div style={{ position: 'absolute', left: px - PLUSH_W / 2, top: py - (PLUSH_W * 300) / 720, transform: `rotate(${prot}deg)` }}>
          <Plush size={PLUSH_W} spout={spout} eye={landed && b > 1.2 ? 'closed' : 'button'} wet={landed} id="s9a" />
        </div>
        {/* the submerged part of her, seen through the water */}
        {landed && (
          <div style={{
            position: 'absolute', left: PX - 420, width: 840, top: WL - 2, height: 300, background: '#ACDDF2', opacity: 0.86,
            WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, #000 22%, #000 78%, transparent 100%)',
          }} />
        )}
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          {rippleEls(true)}
          {crown(false)}
          {landed && DROPS.map((d, i) => {
            const x = b - d.delay;
            if (x <= 0) return null;
            const x0 = PX + Math.cos(d.a) * 250, y0 = WL + Math.sin(d.a) * 48;
            const y = y0 + d.vy * x + 0.5 * GRAV * x * x;
            if (y > y0 + 4) return null;
            const vy = d.vy + GRAV * x;
            const stretch = 1 + Math.min(1.2, Math.abs(vy) / 900);
            const ang = (Math.atan2(vy, d.vx) * 180) / Math.PI;
            const cx = x0 + d.vx * x;
            return <ellipse key={i} cx={cx} cy={y} rx={d.r * stretch} ry={d.r / Math.sqrt(stretch)} transform={`rotate(${ang} ${cx} ${y})`} fill="#fff" stroke="#6CC1E6" strokeWidth={3} />;
          })}
          {/* twinkles once she floats */}
          {[[560, 520, 546.5], [1380, 470, 547], [1240, 300, 547.5], [660, 330, 548]].map(([x, y, at], i) => {
            const s = popIn(beat, at, 0.4) * (1 - prog(beat, at + 0.8, 0.5));
            return s > 0 ? <path key={i} d={sparkle(x, y, 26 * s)} fill="#fff" stroke="#6CC1E6" strokeWidth={3} strokeLinejoin="round" /> : null;
          })}
        </svg>
      </AbsoluteFill>
      <Flash amount={0.25 * hit(beat, S9A_HIT, 0.12) + (1 - prog(beat, 541, 0.35))} />
    </AbsoluteFill>
  );
};

const sparkle = (x: number, y: number, r: number) => {
  const w = r * 0.28;
  return `M${x} ${y - r} Q${x + w * 0.3} ${y - w * 0.3} ${x + r} ${y} Q${x + w * 0.3} ${y + w * 0.3} ${x} ${y + r} Q${x - w * 0.3} ${y + w * 0.3} ${x - r} ${y} Q${x - w * 0.3} ${y - w * 0.3} ${x} ${y - r} Z`;
};

/* ───────── s9b 549-561: the monitor powers on yellow, the logo splashes together, the camera dives into the screen ───────── */

const S9B_HITS = [549.5, 550, 550.5, 551, 552, 552.5];
const S9B_DONE = 553;
const S9B_GLINT = 554;
const DRIPS = [550.5, 552.5, 554.5, 556.5, 558.5];
const MON_W = 980;
const MON_K = MON_W / 1464;
const MON_X = 960 - MON_W / 2;
const MON_Y = 92;
const SCR_CX = 960;
const SCR_CY = MON_Y + (92 + SCREEN_H / 2) * MON_K;
const PUSH_MAX = 2.62;
/** scale of the screen content when the screen fills the frame (end of s9b = start of s9c) */
const FULL = MON_K * PUSH_MAX;

/** the yellow screen with the logo, in SCREEN_W x SCREEN_H px */
const LogoScreen: React.FC<{ beat: number; abs: number }> = ({ beat, abs }) => {
  const stage = logoStage(beat, S9B_HITS, 0.4);
  const bump = 1 + 0.05 * hit(beat, S9B_DONE, 0.25) + 0.025 * hit(beat, S9B_GLINT, 0.25);
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.yellow, overflow: 'hidden' }}>
      <WhalePattern color="#F9C95E" offset={abs * 1.2} size={90} gap={190} />
      <div style={{ position: 'absolute', left: 90, top: 88, transform: `scale(${bump})`, transformOrigin: '550px 312px' }}>
        <InkLogo stage={stage} width={1100} t={abs / 30} shine={prog(beat, S9B_DONE, 1.4)} ink3={C.hot} />
      </div>
      {beat >= S9B_GLINT && <StarFlare x={1144} y={268} size={40 + 170 * hit(beat, S9B_GLINT, 0.35)} rot={beat * 30} />}
      <Flash amount={0.7 * hit(beat, S9B_DONE, 0.15)} />
    </div>
  );
};

/** the monitor's scanlines and glass, for drawing the screen content outside the Monitor (s9c) */
const Glass: React.FC = () => (
  <>
    <div style={{
      position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity: 0.55,
      background: 'repeating-linear-gradient(0deg, rgba(0,0,0,.28) 0 2px, rgba(0,0,0,0) 2px 6px)',
    }} />
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 72% 70% at 50% 48%, rgba(0,0,0,0) 62%, rgba(0,0,10,.42) 100%)' }} />
  </>
);

export const S9b: React.FC = () => {
  const { beat, abs, f } = useSection();
  const power = prog(beat, 549, 0.45);
  const z = 0.15 * easeInOut(beat, 553, 5) + (PUSH_MAX - 1.15) * easeIn(prog(beat, 558.5, 2.5));
  const s = 1 + z;
  const lift = (540 - SCR_CY) * clamp01(z / (PUSH_MAX - 1));
  return (
    <AbsoluteFill style={{ background: '#F6F1E7', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translateY(${lift}px) scale(${s})`, transformOrigin: `${SCR_CX}px ${SCR_CY}px` }}>
        {/* floor */}
        <div style={{ position: 'absolute', left: -200, right: -200, top: 880, height: 600, background: '#E8DFCF' }} />
        <div style={{ position: 'absolute', left: -200, right: -200, top: 876, height: 6, background: '#DDD2BF' }} />
        <div style={{ position: 'absolute', left: 660, width: 600, top: 868, height: 40, borderRadius: '50%', background: 'rgba(60,50,40,.16)' }} />
        <div style={{ position: 'absolute', left: MON_X, top: MON_Y }}>
          <Monitor width={MON_W} on={power} glow={C.yellow}>
            <div style={{ position: 'absolute', inset: 0, transform: `scaleY(${0.015 + 0.985 * easeOut(beat, 549, 0.3)})` }}>
              <LogoScreen beat={beat} abs={abs} />
            </div>
            <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 1 - power }} />
          </Monitor>
        </div>
        {/* fan stickers on the bezel */}
        <div style={{ position: 'absolute', left: MON_X + 40, top: MON_Y + 4, transform: 'rotate(-16deg)' }}>
          <Whale size={120} sticker color="#FFB3CF" eye="heart" />
        </div>
        <svg width={90} height={90} style={{ position: 'absolute', left: MON_X + MON_W - 110, top: MON_Y - 20, transform: 'rotate(12deg)', overflow: 'visible' }}>
          <path d={heart(45, 45, 34)} fill={C.hot} stroke="#fff" strokeWidth={10} strokeLinejoin="round" />
          <path d={heart(45, 45, 34)} fill={C.hot} stroke={NAVY} strokeWidth={3} />
        </svg>
        {/* the plush, fished out of the water, dripping beside the stand */}
        <div style={{ position: 'absolute', left: 250, top: 640, transform: `rotate(-8deg) translateY(${3 * Math.sin(f / 9)}px)` }}>
          <Plush size={330} eye="closed" wet id="s9b" />
        </div>
        <div style={{ position: 'absolute', left: 300, width: 240, top: 878, height: 26, borderRadius: '50%', background: '#BFE3F3', opacity: 0.8 }} />
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          {DRIPS.map((a, i) => {
            const x = beat - a;
            if (x < 0 || x > 1.2) return null;
            const fall = Math.min(1, x / 0.45);
            const dx = 360 + i * 22;
            return (
              <g key={i}>
                {fall < 1 && <path d={`M${dx} ${838 + 52 * fall * fall} q6 10 0 14 q-6 -4 0 -14 Z`} fill="#8FD3FF" stroke={NAVY} strokeWidth={2} />}
                {fall >= 1 && <ellipse cx={dx} cy={890} rx={10 + 40 * (x - 0.45)} ry={(10 + 40 * (x - 0.45)) * 0.25} fill="none" stroke="#fff" strokeWidth={3} opacity={1 - (x - 0.45) / 0.75} />}
              </g>
            );
          })}
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ───────── s9c 561-590: the CRT switches off, then quiet credits on black; the last three thumps type "• • •" ───────── */

const CREDIT_AT = [563, 567, 574];
const LICENSE_AT = 577;
const FAN_AT = 578;
const CREDITS_OUT = 581.2;
const DOTS = [582.0, 582.7, 583.46];
const DOTS_OUT = 584;

const Reveal: React.FC<{ beat: number; at: number; children: React.ReactNode }> = ({ beat, at, children }) => {
  const p = easeOut(beat, at, 1.4);
  return (
    <div style={{ opacity: p, filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined, transform: `translateY(${(1 - p) * 16}px)` }}>
      {children}
    </div>
  );
};

export const S9c: React.FC = () => {
  const { beat, abs } = useSection();
  const off = prog(beat, 561, 0.45);
  const line = prog(beat, 561.45, 0.7);
  const out = 1 - easeInOut(beat, CREDITS_OUT, 0.8);
  const dotsOut = 1 - easeInOut(beat, DOTS_OUT, 0.6);
  return (
    <AbsoluteFill style={{ background: '#060608', overflow: 'hidden' }}>
      {/* CRT off: the picture collapses to a bright line, the line to a dot */}
      {off < 1 && (
        <div style={{
          position: 'absolute', left: 960 - SCREEN_W / 2, top: 540 - SCREEN_H / 2, width: SCREEN_W, height: SCREEN_H, overflow: 'hidden',
          transform: `scale(${FULL}, ${FULL * (1 - 0.994 * easeIn(off))})`, filter: off > 0 ? `brightness(${1 + 2.5 * off})` : undefined,
        }}>
          <LogoScreen beat={beat} abs={abs} />
          <Glass />
        </div>
      )}
      {off >= 0.9 && line < 1 && (
        <>
          <div style={{
            position: 'absolute', left: 960 - (SCREEN_W * FULL * (1 - easeIn(line))) / 2, top: 537, width: SCREEN_W * FULL * (1 - easeIn(line)) + 8, height: 6,
            background: '#fff', boxShadow: '0 0 24px 6px rgba(255,240,200,.7)', borderRadius: 3,
          }} />
          <div style={{
            position: 'absolute', left: 948, top: 528, width: 24, height: 24, borderRadius: 12, background: '#fff',
            boxShadow: '0 0 30px 10px rgba(255,240,200,.6)', opacity: line,
          }} />
        </>
      )}
      {beat >= 561.9 && beat < 563 && (
        <div style={{
          position: 'absolute', left: 948, top: 528, width: 24, height: 24, borderRadius: 12, background: '#fff',
          boxShadow: '0 0 30px 10px rgba(255,240,200,.6)', opacity: 1 - prog(beat, 562.15, 0.6), transform: `scale(${1 - 0.7 * prog(beat, 562.15, 0.6)})`,
        }} />
      )}
      {/* credits */}
      {beat >= CREDIT_AT[0] && out > 0 && (
        <div style={{
          position: 'absolute', left: 0, right: 0, top: 190, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 58, opacity: out,
          color: '#F3F1EA', textAlign: 'center',
        }}>
          {S9_CREDITS.map((c, i) => (
            <Reveal key={i} beat={beat} at={CREDIT_AT[i]}>
              <div style={{ fontFamily: F.zh, fontWeight: 400, fontSize: 26, letterSpacing: 12, color: '#8C8E98', marginBottom: 14 }}>{c.role}</div>
              <div style={{ display: 'flex', gap: 56, justifyContent: 'center' }}>
                {c.names.map((n) => (
                  <span key={n} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 52, letterSpacing: 4 }}>{n}</span>
                ))}
              </div>
            </Reveal>
          ))}
          <Reveal beat={beat} at={LICENSE_AT}>
            <div style={{ width: 420, height: 1, background: '#3C3D46', margin: '4px auto 30px' }} />
            <div style={{ fontFamily: F.zh, fontWeight: 500, fontSize: 30, letterSpacing: 6, color: '#BDBEC6' }}>{S9_LICENSE}</div>
          </Reveal>
          <div style={{ marginTop: -36 }}>
            <Reveal beat={beat} at={FAN_AT}>
              <div style={{ fontFamily: F.zh, fontWeight: 400, fontSize: 26, letterSpacing: 12, color: '#8C8E98' }}>{S9_FAN}</div>
            </Reveal>
          </div>
        </div>
      )}
      {/* the last three thumps: she is still typing */}
      {beat >= DOTS[0] && dotsOut > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 528, display: 'flex', justifyContent: 'center', gap: 34, opacity: dotsOut }}>
          {DOTS.map((a, i) => {
            const p = popIn(beat, a, 0.3);
            return (
              <div key={i} style={{
                width: 24, height: 24, borderRadius: 12, background: '#F3F1EA', transform: `scale(${p}) translateY(${-10 * hit(beat, a, 0.2)}px)`,
                opacity: Math.min(1, p * 2),
              }} />
            );
          })}
        </div>
      )}
    </AbsoluteFill>
  );
};

export const S9_SCENES: Record<string, React.FC> = { s9a: S9a, s9b: S9b, s9c: S9c };
