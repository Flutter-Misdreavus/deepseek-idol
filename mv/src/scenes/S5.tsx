// S5 chorus 2 (beats 280-346), yellow + grey: the idol as an image on a retro monitor, then the reality behind it
// (a grey room, a monitor on a chair, the server being busy) down to a fallen whale plush.
import { AbsoluteFill, Img, interpolate, staticFile } from 'remotion';
import { UI } from '../data/copy';
import {
  S5_ANSWER, S5_ASK, S5_CLONES, S5_CONNECTING, S5_DANMAKU, S5_LIVE, S5_MESS, S5_NO, S5_ORIGINAL, S5_PA, S5_PASTE, S5_SCAN,
  S5_SCAN_DONE, S5_SCAN_HEAD, S5_SCANNING, S5_TARGETS, S5_TEXT, S5_WEAK, S5_WEAK_EN,
} from '../data/copy_S5';
import { easeInOut, easeOut, hit, popIn, prog, rnd, shake } from '../lib/anim';
import { pulse } from '../lib/beat';
import { BotRow, ChatWindow, UIC, UserBubble } from '../lib/chat';
import { Confetti, StarFlare, Still, Sunburst, WhalePattern } from '../lib/deco';
import { F, preloadGlyphs } from '../lib/fonts';
import { Flash } from '../lib/fx';
import { L2D } from '../lib/L2D';
import { Crowd } from '../lib/crowd';
import { Monitor } from '../lib/monitor';
import { C } from '../lib/palette';
import { useSection } from '../lib/section';
import { Kinetic } from '../lib/type';
import { star } from '../lib/whale';
import { BigX, Bracket, Chair, Crown, FoldBox, INK, PlushWhale } from './S5_props';

preloadGlyphs(S5_TEXT + UI.busy + UI.thinking + UI.thought(2));

const Y = C.yellow;
const Y_LIGHT = '#FAC550';

/* ───────── shared rig for s5a / s5b: the monitor, and a zoom that makes its screen fill the frame ───────── */

const MON = { w: 1120, cx: 790, top: 84 };
const MK = MON.w / 1464; // Monitor body is 1464 px wide at scale 1
const SCX = MON.cx;
const SCY = MON.top + 492 * MK; // screen centre on the frame
const FILL = 2.15; // zoom at which the screen covers the frame

/** z = 0: the monitor in the room; z = 1: its screen fills the frame */
const rig = (z: number, bump = 0): React.CSSProperties => ({
  position: 'absolute', inset: 0,
  transform: `translate(${(960 - SCX) * z}px, ${(540 - SCY) * z}px) scale(${(1 + (FILL - 1) * z) * (1 + bump)})`,
  transformOrigin: `${SCX}px ${SCY}px`,
});

const ShrineRoom: React.FC<{ beat: number }> = ({ beat }) => (
  <Sunburst cx={SCX} cy={SCY} a="#8D8D96" b="#989AA2" rays={16} rot={beat * 0.03} />
);

const fmt = (n: number) => String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/* ───────── s5a 280-287: the concert on the monitor ───────── */

const S5A_CRASH = 281;
const S5A_CAM = 285; // the broadcast cuts to a close-up
// her silhouette on the screen (s5a before the crash, s5b): sized to stay inside the frame when the screen fills it
const SIL = { x: 640, y: 417, w: 380, cx: 541, cy: 95 };

const Danmaku: React.FC<{ beat: number; from: number }> = ({ beat, from }) => (
  <>
    {S5_DANMAKU.map((t, i) => {
      const at = from + i * 0.36 + rnd(i, 31) * 0.2;
      if (beat < at) return null;
      const speed = 330 + rnd(i, 32) * 140; // px per beat
      const x = 1300 - (beat - at) * speed;
      if (x < -500) return null;
      return (
        <div key={i} style={{
          position: 'absolute', left: x, top: 104 + (i % 4) * 58, fontFamily: F.zh, fontWeight: 700, fontSize: 38, whiteSpace: 'nowrap',
          color: ['#fff', '#FFE27A', '#fff', '#FFB3CF', '#fff'][i % 5], WebkitTextStroke: '7px rgba(8,10,28,.85)', paintOrder: 'stroke fill',
        }}>{t}</div>
      );
    })}
  </>
);

const LiveHud: React.FC<{ beat: number }> = ({ beat }) => (
  <>
    <div style={{ position: 'absolute', left: 44, top: 34, display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{
        background: '#E8344E', color: '#fff', fontFamily: 'monospace', fontWeight: 700, fontSize: 32, padding: '4px 16px', borderRadius: 8,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{ width: 16, height: 16, borderRadius: 8, background: '#fff', opacity: Math.floor(beat * 2) % 2 ? 0.3 : 1 }} />
        {S5_LIVE.badge}
      </div>
      <span style={{ fontFamily: F.zh, fontWeight: 700, fontSize: 30, color: '#fff' }}>{S5_LIVE.on}</span>
    </div>
    <div style={{
      position: 'absolute', right: 44, top: 36, fontFamily: F.zh, fontWeight: 700, fontSize: 30, color: '#fff', display: 'flex', gap: 12,
      background: 'rgba(0,0,0,.35)', padding: '4px 16px', borderRadius: 8,
    }}>
      {S5_LIVE.viewers}
      <span style={{ fontFamily: 'monospace', fontSize: 32 }}>{fmt(1284377 + Math.max(0, beat - 280) * 52731)}</span>
    </div>
  </>
);

const Beams: React.FC<{ beat: number; burst: number; id: string }> = ({ beat, burst, id }) => (
  <svg width={1280} height={800} style={{ position: 'absolute', inset: 0, mixBlendMode: 'screen' }}>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity={0.9} />
        <stop offset="1" stopColor="#fff" stopOpacity={0} />
      </linearGradient>
    </defs>
    {[0, 1, 2, 3, 4].map((i) => {
      const x0 = 140 + i * 250;
      const a = Math.sin(beat * Math.PI * 0.5 + i * 1.7) * 16 + (i - 2) * 9;
      return (
        <path key={i} d={`M${x0 - 14} -20 L${x0 + 14} -20 L${x0 + 160} 840 L${x0 - 160} 840 Z`} fill={`url(#${id})`}
          opacity={0.16 + 0.35 * burst} transform={`rotate(${a} ${x0} -20)`} />
      );
    })}
  </svg>
);

const ConcertScreen: React.FC<{ beat: number; f: number }> = ({ beat, f }) => {
  const t = f / 30;
  if (beat < S5A_CRASH) {
    // the last image of S4 (white crowned silhouette) was on this screen all along
    return (
      <AbsoluteFill style={{ background: '#07070B' }}>
        <div style={{
          position: 'absolute', left: 640 - 260, top: -40, width: 520, height: 900, opacity: 0.18,
          background: 'linear-gradient(180deg, #fff, rgba(255,255,255,0))', clipPath: 'polygon(40% 0, 60% 0, 100% 100%, 0 100%)',
        }} />
        <Still src="g6_sing_mic" x={SIL.x} y={SIL.y} w={SIL.w} style={{ filter: 'brightness(0) invert(1)' }} />
        <div style={{ position: 'absolute', left: SIL.cx, top: SIL.cy }}><Crown size={100} fill="#fff" line="#07070B" /></div>
      </AbsoluteFill>
    );
  }
  const close = beat >= S5A_CAM;
  const burst = hit(beat, S5A_CRASH, 0.5) + 0.6 * hit(beat, 286, 0.3) + 0.5 * hit(beat, 284.5, 0.3);
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #0E1330 0%, #1D2558 70%, #2A3470 100%)' }}>
      <WhalePattern color="#232D66" offset={f * 1.4} size={70} gap={150} />
      {!close ? (
        <>
          <Beams beat={beat} burst={burst} id="s5a_beam_w" />
          <svg width={1280} height={800} style={{ position: 'absolute', inset: 0 }}>
            <ellipse cx={640} cy={760} rx={660} ry={150} fill="#2C3778" />
            <ellipse cx={640} cy={720} rx={250} ry={46} fill="#FFF1C2" opacity={0.35 + 0.3 * burst} />
          </svg>
          <Still src="g6_sing_mic" x={640} y={400 - 8 * Math.abs(Math.sin(beat * Math.PI))} w={430} />
          {Array.from({ length: 16 }, (_, i) => (
            <Confetti key={i} i={i + 200} t={t} size={34 + rnd(i, 41) * 20} kinds={['star', 'heart', 'whale']}
              x={rnd(i, 42) * 1280 + Math.sin(t * 2 + i) * 30}
              y={-60 + ((beat - S5A_CRASH) * (90 + rnd(i, 43) * 70) + rnd(i, 44) * 300) % 900} />
          ))}
          <Crowd beat={beat} width={1280} height={250} rows={3} perRow={11} color="#05070F" haze="#2B3266" sticks={0.6} sway={20}
            style={{ position: 'absolute', left: 0, top: 590 }} />
        </>
      ) : (
        <>
          <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 20%, rgba(255,240,200,.55) 0%, rgba(255,240,200,0) 45%)' }} />
          <Beams beat={beat} burst={burst} id="s5a_beam_c" />
          <div style={{ position: 'absolute', inset: 0, transform: `scale(${1 + 0.06 * easeOut(beat, S5A_CAM, 2)})`, transformOrigin: '640px 360px' }}>
            <Still src="g10_sing_up" x={620} y={515} w={1500} />
          </div>
          {[[150, 160, 285.5], [1080, 140, 286], [980, 560, 286.5]].map(([x, y, a], i) => (
            <StarFlare key={i} x={x} y={y} size={50 + 120 * hit(beat, a, 0.35)} rot={beat * 25 + i * 30} />
          ))}
        </>
      )}
      <Danmaku beat={beat} from={S5A_CRASH + 0.2} />
      <LiveHud beat={beat} />
      <Flash amount={0.9 * hit(beat, S5A_CRASH, 0.15) + 0.7 * hit(beat, S5A_CAM, 0.1)} />
    </AbsoluteFill>
  );
};

export const S5a: React.FC = () => {
  const { beat, f, abs } = useSection();
  // hold on the screen (S4's last image), then pull back on the crash to reveal the monitor
  const z = 1 - easeOut(beat, S5A_CRASH, 1.2);
  const bump = 0.012 * pulse(abs, 0.2) + 0.03 * hit(beat, S5A_CRASH, 0.3) + 0.015 * hit(beat, S5A_CAM, 0.25);
  const turnOn = easeOut(beat, 280, 0.25);
  return (
    <AbsoluteFill style={{ background: '#8D8D96', overflow: 'hidden' }}>
      <div style={rig(z, bump)}>
        <ShrineRoom beat={beat} />
        <div style={{ position: 'absolute', left: MON.cx - MON.w / 2, top: MON.top }}>
          <Monitor width={MON.w} glow="#B8C6FF" on={turnOn}>
            <ConcertScreen beat={beat} f={f} />
          </Monitor>
        </div>
      </div>
      <Kinetic text="所有人都 信任崇拜你" beat={beat} at={280.3} until={287.4} stagger={0.55} vertical size={150} color="#fff" stroke={INK} strokeWidth={10}
        style={{ position: 'absolute', right: 86, top: 110 }} />
      <Flash amount={0.35 * hit(beat, S5A_CRASH, 0.2)} />
    </AbsoluteFill>
  );
};

/* ───────── s5b 287-296: the screen turns yellow, her silhouette; push in until the yellow fills the frame ───────── */

const S5B_STRONG = 289;
const S5B_IDOL = 292.5;

const YellowScreen: React.FC<{ beat: number }> = ({ beat }) => {
  const crown = popIn(beat, S5B_STRONG, 0.4);
  return (
    <AbsoluteFill style={{ background: Y }}>
      <Sunburst cx={640} cy={330} a={Y} b={Y_LIGHT} rays={14} rot={beat * 0.08} />
      <div style={{ position: 'absolute', inset: 0, transform: `translateY(${-8 * Math.abs(Math.sin(beat * Math.PI))}px)` }}>
        <Still src="g6_sing_mic" x={SIL.x} y={SIL.y} w={SIL.w} style={{ filter: 'brightness(0) invert(0.16)' }} />
        {crown > 0 && (
          <div style={{ position: 'absolute', left: SIL.cx, top: SIL.cy, transform: `translateY(${(1 - crown) * -80}px) rotate(${(1 - crown) * 20 - 6}deg)`, transformOrigin: '50px 70px' }}>
            <Crown size={100} fill="#fff" line="#29292F" />
          </div>
        )}
      </div>
      {[[300, 200, 290.5], [990, 160, 292], [1010, 600, 293.5], [260, 620, 294.5]].map(([x, y, a], i) => (
        <StarFlare key={i} x={x} y={y} size={beat >= a ? 30 + 90 * hit(beat, a, 0.5) + 10 * Math.sin(beat * 3 + i) : 0} rot={beat * 20} />
      ))}
    </AbsoluteFill>
  );
};

export const S5b: React.FC = () => {
  const { beat, abs } = useSection();
  const z = easeInOut(beat, 287.6, 6.6);
  const bump = 0.006 * pulse(abs, 0.2) + 0.03 * (hit(beat, S5B_STRONG, 0.3) + hit(beat, S5B_IDOL, 0.3) + hit(beat, 293.5, 0.3));
  return (
    <AbsoluteFill style={{ background: '#8D8D96', overflow: 'hidden' }}>
      <div style={rig(z, bump)}>
        <ShrineRoom beat={beat} />
        <div style={{ position: 'absolute', left: MON.cx - MON.w / 2, top: MON.top }}>
          <Monitor width={MON.w} glow="#FFD36A">
            <YellowScreen beat={beat} />
          </Monitor>
        </div>
      </div>
      <Kinetic text="你正是" beat={beat} at={287.3} until={296.4} stagger={0.3} size={84} color="#fff" stroke={INK} strokeWidth={8}
        style={{ position: 'absolute', left: 96, top: 96 }} />
      <Kinetic text="最强" beat={beat} at={S5B_STRONG} until={296.4} stagger={0.5} mode="stamp" size={250} color={INK} stroke="#fff" strokeWidth={12}
        style={{ position: 'absolute', left: 70, top: 200 }} />
      <Kinetic text="且无敌的" beat={beat} at={290.5} until={296.4} stagger={0.3} size={84} color="#fff" stroke={INK} strokeWidth={8}
        style={{ position: 'absolute', right: 96, top: 548 }} />
      <Kinetic text="偶像" beat={beat} at={S5B_IDOL} until={296.4} stagger={0.5} mode="stamp" size={250} color={INK} stroke="#fff" strokeWidth={12}
        style={{ position: 'absolute', right: 70, top: 650 }} />
      <Flash amount={0.6 * hit(beat, 287, 0.12) + 0.3 * hit(beat, S5B_STRONG, 0.12)} color="#FFF4D0" />
    </AbsoluteFill>
  );
};

/* ───────── s5c 296-303: HUD scan over her, "弱点：0" ───────── */

const S5C_LOCK = 301.5;
const S5C_ZERO = 302;
// g7 placement: width 1500 centred at (1180, 560) -> image px * 0.977 around that
const G7 = { x: 1180, y: 560, w: 1500 };
const g7 = (ix: number, iy: number) => [G7.x + (ix - 768) * (G7.w / 1536), G7.y + (iy - 512) * (G7.w / 1536)];
const TARGETS: [number, number, number, number, 'top' | 'bottom'][] = [
  // image x, image y, bracket size, lock beat, label corner
  [690, 470, 330, 297, 'bottom'],
  [763, 369, 130, 298, 'top'],
  [223, 315, 210, 299, 'top'],
  [840, 740, 280, 300, 'top'],
];

export const S5c: React.FC = () => {
  const { beat, f, abs } = useSection();
  const push = 1 + 0.06 * easeInOut(beat, 296, 7);
  // scan line: down 296 -> 299, up 299 -> 301.5
  const sy = beat < 299 ? 40 + 900 * easeInOut(beat, 296, 3) : 940 - 900 * easeInOut(beat, 299, 2.5);
  const scanning = beat < S5C_LOCK;
  const pct = Math.min(100, Math.floor(100 * prog(beat, 296, S5C_LOCK - 296)));
  const zero = popIn(beat, S5C_ZERO, 0.3);
  const [kx, ky] = shake(f, hit(beat, S5C_ZERO, 0.3), 4);
  return (
    <AbsoluteFill style={{ background: Y, overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${kx}px,${ky}px)` }}>
        {/* HUD grid */}
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <pattern id="s5c_grid" width={60} height={60} patternUnits="userSpaceOnUse">
              <path d="M60 0 L0 0 L0 60" fill="none" stroke={INK} strokeWidth={1.5} opacity={0.16} />
            </pattern>
          </defs>
          <rect width={1920} height={1080} fill="url(#s5c_grid)" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, transform: `scale(${push + 0.01 * pulse(abs, 0.2)})`, transformOrigin: `${G7.x}px ${G7.y}px` }}>
          <Still src="g7_wink_point" x={G7.x} y={G7.y} w={G7.w} />
          {TARGETS.map(([ix, iy, s, at, corner], i) => {
            const [x, y] = g7(ix, iy);
            return (
              <Bracket key={i} x={x} y={y} size={s * (1 + 0.08 * hit(beat, S5C_LOCK, 0.3))} p={easeOut(beat, at, 0.35)} label={S5_TARGETS[i]}
                ok={beat >= at + 0.5} corner={corner} />
            );
          })}
        </div>
        {/* scan line */}
        {scanning && (
          <div style={{ position: 'absolute', left: 0, right: 0, top: sy - 70, height: 140 }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: `linear-gradient(${beat < 299 ? '0deg' : '180deg'}, rgba(255,255,255,.45), rgba(255,255,255,0))`,
            }} />
            <div style={{ position: 'absolute', left: 0, right: 0, top: beat < 299 ? 132 : 0, height: 8, background: '#fff', boxShadow: '0 0 18px #fff' }} />
          </div>
        )}
        {/* readout panel */}
        <div style={{
          position: 'absolute', left: 80, top: 400, width: 560, background: 'rgba(35,35,42,.9)', borderRadius: 14, padding: '22px 28px',
          fontFamily: F.zh, color: '#fff', opacity: easeOut(beat, 296.2, 0.4), transform: `translateX(${(1 - easeOut(beat, 296.2, 0.4)) * -120}px)`,
        }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: Y, marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
            <span>{S5_SCAN_HEAD}</span>
            <span style={{ fontFamily: 'monospace' }}>{scanning ? '●' : '✓'}</span>
          </div>
          {S5_SCAN.map(([k, v], i) => {
            const at = 296.6 + i * 0.75;
            if (beat < at) return <div key={i} style={{ height: 50 }} />;
            const done = beat >= at + 0.35;
            return (
              <div key={i} style={{ height: 50, display: 'flex', alignItems: 'center', gap: 12, fontSize: 32, fontWeight: 500 }}>
                <span>{k}</span>
                <div style={{ flex: 1, borderBottom: '3px dotted rgba(255,255,255,.35)', height: 0, marginTop: 8 }} />
                <span style={{ fontWeight: 700, color: done ? Y : 'rgba(255,255,255,.5)', fontFamily: done ? F.zh : 'monospace' }}>
                  {done ? v : '···'}
                </span>
              </div>
            );
          })}
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 14, fontSize: 24, fontWeight: 700 }}>
            <span style={{ whiteSpace: 'nowrap' }}>{scanning ? S5_SCANNING : S5_SCAN_DONE}</span>
            <div style={{ flex: 1, height: 16, background: 'rgba(255,255,255,.18)', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: Y }} />
            </div>
            <span style={{ fontFamily: 'monospace', fontSize: 26, width: 70, textAlign: 'right' }}>{pct}%</span>
          </div>
        </div>
        <Kinetic text="找不到你 任何弱点" beat={beat} at={296.3} until={303.4} stagger={0.4} size={130} color="#fff" stroke={INK} strokeWidth={10}
          style={{ position: 'absolute', left: 74, top: 56, alignItems: 'flex-start' }} />
        {zero > 0 && (
          <div style={{
            position: 'absolute', left: 470, top: 700, transform: `translate(-50%,-50%) scale(${interpolate(zero, [0, 1], [2.4, 1])}) rotate(-5deg)`,
            background: INK, borderRadius: 24, padding: '18px 46px 22px', boxShadow: `0 0 0 8px #fff, 0 16px 0 8px rgba(35,35,42,.3)`,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <span style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 170, color: Y, lineHeight: 1.1, whiteSpace: 'nowrap' }}>{S5_WEAK}</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 42, color: '#fff', letterSpacing: 4 }}>{S5_WEAK_EN}</span>
          </div>
        )}
      </AbsoluteFill>
      <Flash amount={0.55 * hit(beat, S5C_ZERO, 0.15) + 0.25 * hit(beat, 296, 0.15)} />
    </AbsoluteFill>
  );
};

/* ───────── s5d 303-311: a star falls into her chest ───────── */

const S5D_IMPACT = 308.5; // the biggest hit of the section
// g5 width 667 centred at (960, 560); chest at image (490, 530)
const G5 = { x: 960, y: 560, w: 667 };
const CHEST = [G5.x + (490 - 512) * (G5.w / 1024), G5.y + (530 - 768) * (G5.w / 1024)];
// the star hangs in the sky (303-306), then falls into her chest, accelerating (306 -> impact)
const P0 = [1640, 170], P1 = [1250, 30];
const bez = (t: number) => {
  const u = 1 - t;
  return [u * u * P0[0] + 2 * u * t * P1[0] + t * t * CHEST[0], u * u * P0[1] + 2 * u * t * P1[1] + t * t * CHEST[1]];
};
const starT = (beat: number) => Math.pow(prog(beat, 306, S5D_IMPACT - 306), 2.2);
const TWINKLES = [[260, 860, 304], [1500, 620, 305], [700, 140, 305.5], [1780, 900, 306.5], [420, 520, 307]];

export const S5d: React.FC = () => {
  const { beat, f, abs } = useSection();
  const after = beat >= S5D_IMPACT;
  const zoom = 1 + 0.32 * easeInOut(beat, 303, 8) + 0.08 * hit(beat, S5D_IMPACT, 0.5);
  const [kx, ky] = shake(f, hit(beat, S5D_IMPACT, 0.35), 6);
  const t = starT(beat);
  const [sx, sy] = bez(t);
  const glow = after ? 0.75 + 0.25 * pulse(abs, 0.35) : 0;
  const beatHeart = after ? 1 + 0.25 * pulse(abs, 0.25) : 1;
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #1D1E25 0%, #2B2C34 60%, #393A43 100%)', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${kx}px,${ky}px)` }}>
        {/* tiny stars */}
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
          {Array.from({ length: 70 }, (_, i) => {
            const tw = 0.4 + 0.6 * Math.abs(Math.sin(beat * (0.8 + rnd(i, 3)) + i));
            return <circle key={i} cx={rnd(i, 1) * 1920} cy={rnd(i, 2) * 1080} r={1.5 + rnd(i, 4) * 2.5} fill="#E9E6DA" opacity={tw * 0.7} />;
          })}
        </svg>
        {TWINKLES.map(([x, y, a], i) => (
          <StarFlare key={i} x={x} y={y} size={18 + 50 * hit(beat, a, 0.6) + 8 * Math.sin(beat * 2 + i)} rot={beat * 10} color="#F3EEDD" glow={0.5} />
        ))}
        <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `${CHEST[0]}px ${CHEST[1]}px` }}>
          {/* soft spotlight cone */}
          <div style={{
            position: 'absolute', left: G5.x - 420, top: -40, width: 840, height: 1200, opacity: 0.1 + 0.12 * glow,
            background: 'linear-gradient(180deg, #FFF3C9, rgba(255,243,201,0))', clipPath: 'polygon(38% 0, 62% 0, 100% 100%, 0 100%)',
          }} />
          {after && (
            <div style={{
              position: 'absolute', left: CHEST[0] - 520, top: CHEST[1] - 520, width: 1040, height: 1040, borderRadius: '50%', opacity: glow,
              background: 'radial-gradient(closest-side, rgba(255,214,110,.75), rgba(247,183,51,.3) 45%, rgba(247,183,51,0))',
            }} />
          )}
          <Still src="g5_small_standing" x={G5.x} y={G5.y} w={G5.w} />
          {after && (
            <>
              <div style={{
                position: 'absolute', left: CHEST[0] - 160, top: CHEST[1] - 160, width: 320, height: 320, borderRadius: '50%', mixBlendMode: 'screen',
                background: 'radial-gradient(closest-side, rgba(255,240,190,.95), rgba(255,210,90,.45) 50%, rgba(255,210,90,0))', opacity: glow,
              }} />
              <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
                <path d={star(CHEST[0], CHEST[1], 30 * beatHeart, 13 * beatHeart)} fill="#FFE27A" stroke="#fff" strokeWidth={4} />
              </svg>
            </>
          )}
        </div>
        {/* the falling star and its trail */}
        {!after && beat >= 303.3 && (
          <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
            {Array.from({ length: 22 }, (_, j) => {
              const tj = starT(beat - (j + 1) * 0.07);
              if (tj <= 0) return null;
              const [x, y] = bez(tj);
              return <circle key={j} cx={x + (rnd(j, 7) - 0.5) * 14} cy={y + (rnd(j, 8) - 0.5) * 14} r={(22 - j) * 0.9 * (0.5 + t)} fill="#FFE9A0" opacity={(1 - j / 22) * 0.7} />;
            })}
            <path d={star(sx, sy, (40 + 34 * t) * popIn(beat, 303.3, 0.4), (17 + 15 * t) * popIn(beat, 303.3, 0.4), 5, -Math.PI / 2 + beat * (t > 0 ? 2 : 0.4))}
              fill="#FFD45E" stroke="#fff" strokeWidth={6} strokeLinejoin="round" />
          </svg>
        )}
        {!after && beat >= 303.3 && <StarFlare x={sx} y={sy} size={90 + 60 * t + 160 * (hit(beat, 305, 0.35) + hit(beat, 307.75, 0.3))} rot={beat * 30} color="#FFF6D8" />}
        {/* impact: flare, rings, sparks */}
        {after && (
          <>
            <StarFlare x={CHEST[0]} y={CHEST[1]} size={140 + 560 * hit(beat, S5D_IMPACT, 0.6) + 40 * pulse(abs, 0.3)} rot={10 + beat * 8} color="#FFF6D8" />
            <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
              {[S5D_IMPACT, S5D_IMPACT + 0.3, 309.5, 310.5].map((a, i) => {
                const p = easeOut(beat, a, 1.4);
                if (p <= 0 || p >= 1) return null;
                return <circle key={i} cx={CHEST[0]} cy={CHEST[1]} r={40 + 900 * p} fill="none" stroke={i % 2 ? '#fff' : Y} strokeWidth={20 * (1 - p)} opacity={1 - p} />;
              })}
              {Array.from({ length: 18 }, (_, i) => {
                const p = easeOut(beat, S5D_IMPACT, 1.6 + rnd(i, 5));
                const a = (i / 18) * Math.PI * 2 + rnd(i, 6);
                const r = 80 + 700 * p * (0.6 + rnd(i, 7) * 0.6);
                return p < 1 ? (
                  <path key={i} d={star(CHEST[0] + Math.cos(a) * r, CHEST[1] + Math.sin(a) * r, 16 * (1 - p) + 4, 7 * (1 - p) + 2)} fill="#FFE27A" opacity={1 - p} />
                ) : null;
              })}
            </svg>
          </>
        )}
      </AbsoluteFill>
      <Kinetic text="一等星" beat={beat} at={303.25} until={311.4} stagger={0.4} mode="stamp" vertical size={190} color="#FFD45E"
        style={{ position: 'absolute', left: 280, top: 80 }} />
      <Kinetic text="就寄宿在你身上" beat={beat} at={305.8} until={311.4} stagger={0.4} vertical size={92} color="#fff"
        style={{ position: 'absolute', left: 130, top: 110 }} />
      <Flash amount={0.85 * hit(beat, S5D_IMPACT, 0.15)} color="#FFF4D6" />
    </AbsoluteFill>
  );
};

/* ───────── s5e 311-320: grey room, the monitor on a chair; her soul leaks out, then the "server busy" sticker ───────── */

const S5E_SLAP = 319; // first ダメ
const CH = { w: 660, cx: 900, top: 53 }; // chair (unit scale 660/620): legs reach the floor at y ~905, seat top ~500
const EM = { w: 440, cx: 900, top: 197 }; // monitor sitting on the seat
const ESC = [EM.cx, EM.top + 492 * (EM.w / 1464)]; // its screen centre
const ETARGET = [1060, 590];
const EZOOM = 0.55;

const GreyRoom: React.FC<{ f: number; wall?: string; floor?: string; dark?: number }> = ({ f, wall = '#A6A6AE', floor = '#85858E', dark = 0 }) => (
  <>
    <AbsoluteFill style={{ background: wall }} />
    {/* window light on the wall, four panes */}
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <g opacity={1 - dark}>
        <path d="M1250 90 L1650 90 L1590 560 L1190 560 Z" fill="#B7B7BE" />
        <path d="M1450 90 L1390 560" stroke={wall} strokeWidth={16} />
        <path d="M1220 325 L1620 325" stroke={wall} strokeWidth={16} />
      </g>
      <rect x={0} y={690} width={1920} height={18} fill="#8E8E97" />
      <rect x={0} y={708} width={1920} height={372} fill={floor} />
      <path d="M1150 760 L1560 760 L1720 1080 L1210 1080 Z" fill="#919199" opacity={1 - dark} />
      {/* wall outlet */}
      <rect x={1500} y={598} width={48} height={66} rx={8} fill="#D3D3D9" stroke={INK} strokeWidth={4} />
      <rect x={1514} y={614} width={6} height={14} fill={INK} />
      <rect x={1528} y={614} width={6} height={14} fill={INK} />
    </svg>
    {/* dust in the window light */}
    {Array.from({ length: 22 }, (_, i) => {
      const t = f / 30;
      const x = 1180 + rnd(i, 51) * 480 + Math.sin(t * 0.7 + i) * 24;
      const y = ((rnd(i, 52) * 900 - t * (8 + rnd(i, 53) * 14)) % 900 + 900) % 900 + 60;
      return <div key={i} style={{ position: 'absolute', left: x, top: y, width: 5, height: 5, borderRadius: 3, background: '#E8E8EE', opacity: (0.35 + 0.4 * rnd(i, 54)) * (1 - dark) }} />;
    })}
  </>
);

const BusySticker: React.FC = () => (
  <div style={{
    background: '#fff', borderRadius: 46, padding: 20, boxShadow: '0 18px 30px rgba(30,30,40,.35)', position: 'relative',
  }}>
    <div style={{
      background: '#FFE8EC', border: '5px solid #FFC2CD', borderRadius: 30, padding: '30px 54px', display: 'flex', alignItems: 'center', gap: 22,
      fontFamily: F.zh, fontWeight: 700, fontSize: 66, color: '#D92D4B', whiteSpace: 'nowrap',
    }}>
      <svg width={74} height={66} viewBox="0 0 74 66">
        <path d="M37 4 L71 62 L3 62 Z" fill="#D92D4B" stroke="#D92D4B" strokeWidth={6} strokeLinejoin="round" />
        <rect x={33} y={22} width={8} height={22} rx={4} fill="#fff" />
        <circle cx={37} cy={52} r={4.5} fill="#fff" />
      </svg>
      {UI.busy}
    </div>
    {/* peeled corner */}
    <svg width={70} height={70} style={{ position: 'absolute', right: -2, bottom: -2 }}>
      <path d="M70 0 L70 24 Q46 30 24 70 L0 70 Z" fill="#B9B4BD" opacity={0.0} />
      <path d="M70 18 L18 70 L52 52 Z" fill="#E4E1E8" stroke="#C9C5CF" strokeWidth={2} />
    </svg>
  </div>
);

export const S5e: React.FC = () => {
  const { beat, f, abs } = useSection();
  const z = easeInOut(beat, 311, 7.8);
  const punch = 0.08 * hit(beat, S5E_SLAP, 0.35);
  const s = (1 + EZOOM * z) * (1 + punch);
  const [kx, ky] = shake(f, hit(beat, S5E_SLAP, 0.4) * 1.2, 2);
  const glitch = hit(beat, 316, 0.25) + hit(beat, 318, 0.2) + 0.6 * hit(beat, 318.5, 0.2);
  const slap = popIn(beat, S5E_SLAP, 0.28);
  return (
    <AbsoluteFill style={{ background: '#A6A6AE', overflow: 'hidden' }}>
      <AbsoluteFill style={{
        transform: `translate(${kx + (ETARGET[0] - ESC[0]) * z}px, ${ky + (ETARGET[1] - ESC[1]) * z}px) scale(${s})`,
        transformOrigin: `${ESC[0]}px ${ESC[1]}px`,
      }}>
        <GreyRoom f={f} />
        {/* cable from the monitor to the outlet */}
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
          <ellipse cx={CH.cx} cy={906} rx={380} ry={34} fill="#74747D" />
          <path d="M1080 470 C1190 500 1180 800 1270 826 C1380 850 1470 760 1524 664" fill="none" stroke="#3A3A42" strokeWidth={9} strokeLinecap="round" />
        </svg>
        <Chair width={CH.w} style={{ position: 'absolute', left: CH.cx - CH.w / 2, top: CH.top }} />
        <div style={{ position: 'absolute', left: EM.cx - EM.w / 2, top: EM.top }}>
          <Monitor width={EM.w} stand={false} glow="#DCE6FF">
            <AbsoluteFill style={{ background: '#E9EDF5' }}>
              <svg width={1280} height={800} style={{ position: 'absolute', inset: 0 }}>
                <defs>
                  <pattern id="s5e_dots" width={56} height={56} patternUnits="userSpaceOnUse">
                    <circle cx={28} cy={28} r={4} fill="#D3D9E6" />
                  </pattern>
                </defs>
                <rect width={1280} height={800} fill="url(#s5e_dots)" />
              </svg>
              <div style={{ position: 'absolute', left: 187 + Math.sin(f * 7) * 40 * glitch, top: -85, width: 960, height: 960 }}>
                <L2D clip="s5e_soul" frames={97} style={{ width: 960, height: 960 }} />
              </div>
              <div style={{ position: 'absolute', left: 40, top: 30, display: 'flex', alignItems: 'center', gap: 14, fontFamily: F.zh, fontWeight: 700, fontSize: 40, color: '#8A8F98' }}>
                <svg width={40} height={40} viewBox="0 0 24 24" style={{ transform: `rotate(${beat * 270}deg)` }}>
                  <circle cx={12} cy={12} r={9} fill="none" stroke="#D3D7DF" strokeWidth={3} />
                  <path d="M12 3 A9 9 0 0 1 21 12" fill="none" stroke={C.blue} strokeWidth={3} strokeLinecap="round" />
                </svg>
                {S5_CONNECTING}
              </div>
              {glitch > 0.05 && [0, 1, 2, 3].map((i) => (
                <div key={i} style={{
                  position: 'absolute', left: 0, right: 0, top: rnd(i + Math.floor(beat * 4), 61) * 760, height: 14 + rnd(i, 62) * 50,
                  background: ['#B9C2D6', '#fff', '#8A93A8', '#E8344E'][i], opacity: glitch * 0.8, mixBlendMode: 'difference',
                  transform: `translateX(${(rnd(i + Math.floor(beat * 4), 63) - 0.5) * 200}px)`,
                }} />
              ))}
            </AbsoluteFill>
          </Monitor>
        </div>
      </AbsoluteFill>
      <Kinetic text="“服务器繁忙” 可不能被看到" beat={beat} at={311.5} until={320.4} stagger={0.3} size={90} color="#fff" stroke={INK} strokeWidth={8}
        style={{ position: 'absolute', left: 56, top: 48, alignItems: 'flex-start' }} />
      {slap > 0 && (
        <div style={{
          position: 'absolute', left: ETARGET[0] + kx, top: ETARGET[1] + ky,
          transform: `translate(-50%,-50%) scale(${interpolate(slap, [0, 1], [1.9, 1]) * (1 + 0.02 * pulse(abs, 0.2))}) rotate(${-6 + 10 * (1 - easeOut(beat, S5E_SLAP, 0.3))}deg)`,
        }}>
          <BusySticker />
        </div>
      )}
      <Flash amount={0.4 * hit(beat, S5E_SLAP, 0.12)} />
    </AbsoluteFill>
  );
};

/* ───────── s5f 320-328: the messy thoughts fold shut, "啪" ───────── */

const S5F_SNAP = 323;

const messLine = (i: number, beat: number, f: number): React.ReactNode => {
  const text = S5_MESS[i];
  switch (i) {
    case 1:
      return <span style={{ textDecoration: 'line-through', textDecorationColor: '#E0263C', textDecorationThickness: 5 }}>{text}</span>;
    case 2:
      return <span style={{ display: 'inline-block', transform: 'rotate(-2.5deg)', color: '#6E7380' }}>{text}</span>;
    case 4:
      return <span style={{ fontWeight: 700, color: '#555A66' }}>{text}</span>;
    case 5:
      return <span style={{ display: 'inline-block', transform: `translateX(${Math.sin(f * 2.3) * 6}px)`, color: '#D92D4B', fontWeight: 700 }}>{text}</span>;
    default:
      return text;
  }
};

export const S5f: React.FC = () => {
  const { beat, f, abs } = useSection();
  const n = Math.max(0, Math.min(S5_MESS.length, Math.floor((beat - 320.2) / 0.42) + 1));
  const shut = beat >= S5F_SNAP;
  const open = shut ? 1 - easeOut(beat, S5F_SNAP, 0.12) : 1;
  const [kx, ky] = shake(f, hit(beat, S5F_SNAP, 0.3) * 1.3 + 0.4 * hit(beat, 320, 0.2), 9);
  const enter = popIn(beat, 320, 0.4);
  const typed = Math.max(0, Math.min([...S5_ANSWER].length, Math.floor((beat - 324) / 0.16) + 1));
  const pa = popIn(beat, S5F_SNAP, 0.3);
  return (
    <AbsoluteFill style={{ background: '#D8D8DE', overflow: 'hidden' }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id="s5f_dots" width={48} height={48} patternUnits="userSpaceOnUse" patternTransform={`translate(${-f * 0.8} 0)`}>
            <circle cx={24} cy={24} r={3} fill="#C4C4CC" />
          </pattern>
        </defs>
        <rect width={1920} height={1080} fill="url(#s5f_dots)" />
      </svg>
      <div style={{
        position: 'absolute', left: 60, top: 70, transform: `translate(${kx}px,${ky}px) scale(${(0.85 + 0.15 * enter) * (1 + 0.012 * pulse(abs, 0.2) + 0.03 * hit(beat, S5F_SNAP, 0.25))})`,
        transformOrigin: '50% 30%',
      }}>
        <ChatWindow width={1340} height={780}>
          <div style={{ position: 'absolute', inset: 0, padding: '36px 50px', display: 'flex', flexDirection: 'column', gap: 30 }}>
            <div style={{ alignSelf: 'flex-end' }}>
              <UserBubble text={S5_ASK} size={48} />
            </div>
            <BotRow avatar={80}>
              <FoldBox open={open} seconds={shut ? 2 : null} spin={beat * 0.9} slots={Math.max(1, n)} size={44} width={1000}
                lines={S5_MESS.slice(0, n).map((_, i) => messLine(i, beat, f))} headerScale={1 + 0.08 * hit(beat, S5F_SNAP, 0.3)} />
              {beat >= 324 && (
                <div style={{ fontFamily: F.zh, fontWeight: 500, fontSize: 50, color: UIC.ink, marginTop: 6, display: 'flex', alignItems: 'center' }}>
                  {[...S5_ANSWER].slice(0, typed).join('')}
                  {typed < [...S5_ANSWER].length && <span style={{ display: 'inline-block', width: 4, height: 54, background: UIC.blue, marginLeft: 6 }} />}
                </div>
              )}
              {/* the tidy answer's toolbar: copy, regenerate, like, dislike */}
              {beat >= 326 && (
                <div style={{ display: 'flex', gap: 14, opacity: easeOut(beat, 326, 0.3) }}>
                  {['M8 8 h10 v12 h-10 Z M5 5 h10 v2 M5 5 v12 h2', 'M18 9 A7 7 0 1 0 19 14 M18 4 v5 h-5', 'M5 11 h3 v9 h-3 Z M8 11 l4 -7 c2 0 3 1 2 4 l-1 3 h6 l-2 9 h-9', 'M5 13 h3 v-9 h-3 Z M8 13 l4 7 c2 0 3 -1 2 -4 l-1 -3 h6 l-2 -9 h-9'].map((d, i) => (
                    <div key={i} style={{ width: 56, height: 56, borderRadius: 14, border: `2px solid ${UIC.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${popIn(beat, 326 + i * 0.12, 0.3)})` }}>
                      <svg width={30} height={30} viewBox="0 0 24 24"><path d={d} fill="none" stroke={UIC.sub} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" /></svg>
                    </div>
                  ))}
                </div>
              )}
            </BotRow>
          </div>
          {/* red scribble over the mess, before it folds */}
          {!shut && beat >= 321.6 && (
            <svg width={1340} height={728} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
              <path d="M260 330 C420 300 520 380 380 400 C250 420 330 340 520 350 C700 360 560 450 420 440"
                fill="none" stroke="#E0263C" strokeWidth={6} strokeLinecap="round" strokeDasharray={1400}
                strokeDashoffset={1400 * (1 - easeOut(beat, 321.6, 0.8))} opacity={0.85} />
              <text x={880} y={300} fontFamily={F.hand} fontSize={70} fill="#E0263C" transform="rotate(12 880 300)" opacity={easeOut(beat, 322, 0.2)}>？！</text>
            </svg>
          )}
        </ChatWindow>
      </div>
      {/* 啪! */}
      {pa > 0 && beat < 325.5 && (
        <div style={{
          position: 'absolute', left: 1010, top: 640, transform: `translate(-50%,-50%) scale(${interpolate(pa, [0, 1], [2.2, 1])}) rotate(-10deg)`,
          opacity: 1 - prog(beat, 325, 0.5),
        }}>
          <svg width={600} height={600} style={{ position: 'absolute', left: -300, top: -300, overflow: 'visible' }}>
            {Array.from({ length: 14 }, (_, i) => {
              const a = (i / 14) * Math.PI * 2;
              const r0 = 175 + 30 * easeOut(beat, S5F_SNAP, 0.5), r1 = r0 + 50 + (i % 3) * 22;
              return <path key={i} d={`M${Math.cos(a) * r0} ${Math.sin(a) * r0} L${Math.cos(a) * r1} ${Math.sin(a) * r1}`} stroke={INK} strokeWidth={12} strokeLinecap="round" transform="translate(300 300)" />;
            })}
          </svg>
          <span style={{
            position: 'relative', fontFamily: F.serif, fontWeight: 900, fontSize: 240, color: Y, WebkitTextStroke: `14px ${INK}`, paintOrder: 'stroke fill',
            whiteSpace: 'nowrap', display: 'block', transform: 'translate(-50%,-50%)',
          }}>{S5_PA}</span>
        </div>
      )}
      <Kinetic text="不想被看见的 都折进思考里" beat={beat} at={320.5} until={328.4} stagger={0.227} vertical size={118} color="#fff" stroke={INK} strokeWidth={9}
        style={{ position: 'absolute', right: 70, top: 70 }} />
      <Flash amount={0.3 * hit(beat, S5F_SNAP, 0.1)} />
    </AbsoluteFill>
  );
};

/* ───────── s5g 328-336: copy-pasted clones, two big ✕ on イヤ・イヤ ───────── */

const S5G_X = [334, 335];
const CARD_W = 430;
const CLONES: [number, number, number, number][] = [
  // x, y, pop beat, tilt
  [300, 330, 329, -5], [1620, 330, 330, 4], [300, 705, 331, 3], [1620, 705, 332, -4],
];

const Card: React.FC<{ x: number; y: number; w: number; p: number; rot: number; grey?: boolean; dim?: number; jitter?: number; label: string; labelBg: string; labelFg: string }> = ({
  x, y, w, p, rot, grey, dim = 0, jitter = 0, label, labelBg, labelFg,
}) => (
  <div style={{
    position: 'absolute', left: x + jitter, top: y, width: w, height: w / 1.5, transform: `translate(-50%,-50%) scale(${p}) rotate(${rot}deg)`,
  }}>
    <div style={{
      position: 'absolute', inset: 0, borderRadius: 18, overflow: 'hidden', background: grey ? '#B9B9C1' : '#FFF1CC',
      boxShadow: `0 0 0 10px #fff, 0 0 0 15px ${INK}, 0 18px 0 15px rgba(35,35,42,.25)`,
    }}>
      <Img src={staticFile('img/g1_hands_cheeks.png')} style={{ width: '100%', filter: grey ? 'grayscale(1) contrast(.85) brightness(1.08)' : undefined }} />
      {dim > 0 && <div style={{ position: 'absolute', inset: 0, background: INK, opacity: dim * 0.45 }} />}
    </div>
    <div style={{
      position: 'absolute', left: -14, top: -30, background: labelBg, color: labelFg, fontFamily: F.zh, fontWeight: 700, fontSize: Math.round(w * 0.075),
      padding: '6px 18px', borderRadius: 10, boxShadow: `0 0 0 4px ${INK}`, whiteSpace: 'nowrap',
    }}>{label}</div>
  </div>
);

export const S5g: React.FC = () => {
  const { beat, f, abs } = useSection();
  const last = S5G_X.reduce((m, a) => (beat >= a ? a : m), -10);
  const [kx, ky] = shake(f, hit(beat, last, 0.3) * 1.2, 11);
  const unstable = prog(beat, 332.5, 1.2);
  return (
    <AbsoluteFill style={{ background: Y, overflow: 'hidden' }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id="s5g_stripe" width={80} height={80} patternUnits="userSpaceOnUse" patternTransform={`rotate(-30) translate(${f * 1.5} 0)`}>
            <rect width={40} height={80} fill="#F2AC26" />
          </pattern>
        </defs>
        <rect width={1920} height={1080} fill="url(#s5g_stripe)" />
      </svg>
      <AbsoluteFill style={{ transform: `translate(${kx}px,${ky}px)` }}>
        {CLONES.map(([x, y, at, r], i) => {
          const p = popIn(beat, at, 0.35);
          if (p <= 0) return null;
          const crossed = beat >= S5G_X[i % 2];
          const jit = (Math.sin(f * 3.1 + i * 2) > 0.6 ? 1 : 0) * 14 * unstable * (crossed ? 0 : 1);
          return (
            <div key={i}>
              <Card x={x} y={y} w={CARD_W} p={p} rot={r + 2 * Math.sin(beat * Math.PI + i)} grey dim={crossed ? 1 : 0} jitter={jit}
                label={S5_CLONES[i]} labelBg="#E4E4EA" labelFg={INK} />
              {beat < at + 1.2 && (
                <div style={{
                  position: 'absolute', left: x, top: y - 175 - 50 * easeOut(beat, at, 1.2), transform: 'translateX(-50%)', opacity: 1 - prog(beat, at + 0.7, 0.5),
                  background: INK, color: '#fff', fontFamily: 'monospace', fontWeight: 700, fontSize: 34, padding: '6px 18px', borderRadius: 10,
                }}>{S5_PASTE}</div>
              )}
            </div>
          );
        })}
        <Card x={960} y={600} w={720} p={(0.55 + 0.45 * popIn(beat, 328, 0.4)) * (1 + 0.015 * pulse(abs, 0.2) + 0.04 * hit(beat, 335.5, 0.3))} rot={-1.5}
          label={`★ ${S5_ORIGINAL}`} labelBg={Y} labelFg={INK} />
        {beat >= 335.5 && (
          <>
            <StarFlare x={960 + (633 - 768) * (720 / 1536)} y={600 + (451 - 512) * (720 / 1536)} size={40 + 110 * hit(beat, 335.5, 0.4)} rot={beat * 20} />
            <StarFlare x={960 + (822 - 768) * (720 / 1536)} y={600 + (394 - 512) * (720 / 1536)} size={30 + 90 * hit(beat, 335.75, 0.4)} rot={beat * 20 + 30} />
          </>
        )}
        {S5G_X.map((a, i) => {
          if (beat < a) return null;
          const cx = i ? 1620 : 300;
          const no = popIn(beat, a + 0.05, 0.3);
          return (
            <div key={i}>
              <div style={{ position: 'absolute', left: cx - 250, top: 150 }}>
                <BigX w={500} h={740} p1={easeOut(beat, a, 0.1)} p2={easeOut(beat, a + 0.1, 0.1)} />
              </div>
              <div style={{
                position: 'absolute', left: cx, top: 518, transform: `translate(-50%,-50%) scale(${interpolate(no, [0, 1], [2.2, 1])}) rotate(${i ? 8 : -8}deg)`,
                fontFamily: F.serif, fontWeight: 900, fontSize: 170, color: '#fff', WebkitTextStroke: `14px ${INK}`, paintOrder: 'stroke fill', whiteSpace: 'nowrap',
              }}>{S5_NO}</div>
            </div>
          );
        })}
      </AbsoluteFill>
      <Kinetic text="不是独一无二" beat={beat} at={328.1} until={336.4} stagger={0.35} size={124} color="#fff" stroke={INK} strokeWidth={10}
        style={{ position: 'absolute', left: 0, right: 0, top: 66 }} />
      <Flash amount={0.35 * hit(beat, last, 0.1)} />
    </AbsoluteFill>
  );
};

/* ───────── s5h 336-346: a whale plush fallen on the grey floor, still and lonely ───────── */

const S5H_TRUE = 339.5; // 真正的: 的 lands on the 340.5 hit
const S5H_AI = 342.75;
// knocked over onto its back; the body's back touches the floor ~90 px below the centre
const PL = { x: 960, y: 700, size: 620, rot: 160 };
const FLOOR_Y = 540;

export const S5h: React.FC = () => {
  const { beat, f } = useSection();
  const push = 1 + 0.08 * easeInOut(beat, 336, 10);
  const flicker = hit(beat, 340.5, 0.3);
  const dim = prog(beat, 344, 2);
  // button eye position on the frame (plush viewBox -10 -40 240 190, eye at (58, 74))
  const k = PL.size / 240;
  const ex0 = (58 + 10) * k - PL.size / 2, ey0 = (74 + 40) * k - (PL.size * 190) / 240 / 2;
  const a = (PL.rot * Math.PI) / 180;
  const eye = [PL.x + ex0 * Math.cos(a) - ey0 * Math.sin(a), PL.y + ex0 * Math.sin(a) + ey0 * Math.cos(a)];
  return (
    <AbsoluteFill style={{ background: '#8A8A93', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: `${PL.x}px ${PL.y}px` }}>
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <radialGradient id="s5h_pool" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#8E8E97" />
              <stop offset="1" stopColor="#8E8E97" stopOpacity={0} />
            </radialGradient>
            <linearGradient id="s5h_shaft" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity={0.16} />
              <stop offset="1" stopColor="#fff" stopOpacity={0.04} />
            </linearGradient>
            <filter id="s5h_blur"><feGaussianBlur stdDeviation={10} /></filter>
          </defs>
          <rect width={1920} height={FLOOR_Y} fill="#8A8A93" />
          <rect y={FLOOR_Y} width={1920} height={16} fill="#7A7A83" />
          <rect y={FLOOR_Y + 16} width={1920} height={1080 - FLOOR_Y - 16} fill="#6E6E77" />
          <ellipse cx={PL.x} cy={PL.y + 100} rx={640} ry={170} fill="url(#s5h_pool)" opacity={0.9 + 0.3 * flicker} />
          <path d="M1380 0 L1700 0 L1250 860 L640 860 Z" fill="url(#s5h_shaft)" opacity={(0.9 + 0.6 * flicker) * (1 - 0.5 * dim)} />
          <ellipse cx={PL.x - 10} cy={PL.y + 112} rx={290} ry={28} fill="#4F4F58" opacity={0.6} filter="url(#s5h_blur)" />
        </svg>
        {/* dust drifting in the shaft */}
        {Array.from({ length: 26 }, (_, i) => {
          const t = f / 30;
          const v = rnd(i, 71);
          const y = ((rnd(i, 72) * 880 - t * (6 + rnd(i, 73) * 10)) % 880 + 880) % 880;
          const x = 1500 - y * 0.5 + (v - 0.5) * 420 + Math.sin(t * 0.6 + i) * 18;
          return <div key={i} style={{ position: 'absolute', left: x, top: y, width: 5, height: 5, borderRadius: 3, background: '#EDEDF2', opacity: (0.25 + 0.4 * rnd(i, 74)) * (1 - 0.6 * dim) }} />;
        })}
        <div style={{ position: 'absolute', left: PL.x - PL.size / 2, top: PL.y - (PL.size * 190) / 240 / 2, transform: `rotate(${PL.rot}deg)`, transformOrigin: '50% 50%', lineHeight: 0 }}>
          <PlushWhale size={PL.size} glint={hit(beat, S5H_AI, 0.5)} tagSway={150} />
        </div>
        {beat >= S5H_AI && <StarFlare x={eye[0]} y={eye[1]} size={20 + 110 * hit(beat, S5H_AI, 0.5)} rot={20} />}
      </AbsoluteFill>
      <Kinetic text="这才是" beat={beat} at={336.5} until={346.4} stagger={0.5} size={96} color="#E6E6EC"
        style={{ position: 'absolute', left: 140, top: 130 }} />
      <Kinetic text="真正的" beat={beat} at={S5H_TRUE} until={346.4} stagger={0.5} size={96} color="#E6E6EC"
        style={{ position: 'absolute', left: 140 + 3 * 96 + 20, top: 130 }} />
      <Kinetic text="AI" beat={beat} at={S5H_AI} until={346.4} stagger={0.25} mode="stamp" size={330} color="#fff" stroke={INK} strokeWidth={12}
        style={{ position: 'absolute', left: 120, top: 230 }} />
      <AbsoluteFill style={{ background: '#16161C', opacity: 0.35 * dim, pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
};

export const S5_SCENES: Record<string, React.FC> = { s5a: S5a, s5b: S5b, s5c: S5c, s5d: S5d, s5e: S5e, s5f: S5f, s5g: S5g, s5h: S5h };

