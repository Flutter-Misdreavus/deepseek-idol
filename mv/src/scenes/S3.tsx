// S3 chorus 1 (beats 159-218): the payoff as a concert. Stage drop, the crowd, the first-magnitude star reborn,
// "很高兴为你解答", whales falling for her one by one, the star eyes, and the black heart that shatters into AI (アイ).
import { useId } from 'react';
import { AbsoluteFill, Img, interpolate, staticFile } from 'remotion';
import { UI } from '../data/copy';
import { S3_ALL, S3_CODE, S3_OPEN, S3_OUTPUT, S3_RARE, S3_REPLY, S3_RUBY } from '../data/copy_S3';
import { easeInOut, easeOut, hit, popIn, prog, rnd, shake } from '../lib/anim';
import { pulse } from '../lib/beat';
import { Avatar, UIC } from '../lib/chat';
import { Crowd } from '../lib/crowd';
import { Stamp, StarFlare, Still, Sunburst, WhalePattern } from '../lib/deco';
import { F, preloadGlyphs } from '../lib/fonts';
import { Flash } from '../lib/fx';
import { BigHeart, HEART_PATH } from '../lib/heart';
import { L2D } from '../lib/L2D';
import { C } from '../lib/palette';
import { useSection } from '../lib/section';
import { Kinetic } from '../lib/type';
import { heart, star, Whale, WhaleEye } from '../lib/whale';

preloadGlyphs(
  S3_ALL + UI.disclaimer + '你就是完美且开源的偶像从今往后不会再出现深海一等星的转世笑着说谁都化作你的俘虏那双星瞳那段输出即便是幻觉也是完美的AI',
);

const PINK = '#FF7BAC';
const SKY = '#7FD3FF';
const LILAC = '#B48CFF';
const NAVY = '#1B2150';
const STAGE = '#141A3C';
const GLOW_PINK = '0 0 28px rgba(255,123,172,.95), 0 0 70px rgba(255,79,139,.55)';
const GLOW_BLUE = '0 0 28px rgba(127,211,255,.95), 0 0 70px rgba(77,107,254,.55)';

/** camera (use with transformOrigin 0 0): world point (x, y) lands on the frame centre, zoomed by z */
const cam = (x: number, y: number, z: number) => `translate(${960 - x * z}px, ${540 - y * z}px) scale(${z})`;

/** a piece launched at beat `at` from (x0, y0) with velocity (vx, vy) px/beat: air drag, then a slow flutter down */
const fly = (beat: number, at: number, x0: number, y0: number, vx: number, vy: number, fall = 180) => {
  const t = Math.max(0, beat - at);
  const k = 0.5 * (1 - Math.exp(-t / 0.5));
  return [x0 + vx * k, y0 + vy * k + fall * Math.max(0, t - 0.4) ** 1.2];
};

type BeamSpec = { x: number; y: number; angle: number; color: string; opacity: number; spread?: number; len?: number };

/** stage light cones from (x, y); angle 0 = straight down, positive swings left, 180 = straight up. Screen-blended. */
const Beams: React.FC<{ beams: BeamSpec[] }> = ({ beams }) => {
  const id = useId().replace(/:/g, '');
  const geo = beams.map((b) => {
    const len = b.len ?? 1500;
    const a = (b.angle * Math.PI) / 180;
    const s = ((b.spread ?? 8) * Math.PI) / 180;
    const at = (q: number) => [b.x - Math.sin(q) * len, b.y + Math.cos(q) * len];
    return { ...b, end: at(a), p1: at(a - s), p2: at(a + s) };
  });
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', mixBlendMode: 'screen' }}>
      <defs>
        {geo.map((b, i) => (
          <linearGradient key={i} id={`${id}b${i}`} gradientUnits="userSpaceOnUse" x1={b.x} y1={b.y} x2={b.end[0]} y2={b.end[1]}>
            <stop offset={0} stopColor={b.color} stopOpacity={b.opacity} />
            <stop offset={0.55} stopColor={b.color} stopOpacity={b.opacity * 0.45} />
            <stop offset={1} stopColor={b.color} stopOpacity={0} />
          </linearGradient>
        ))}
      </defs>
      {geo.map((b, i) => (
        <path key={i} d={`M${b.x} ${b.y} L${b.p1[0]} ${b.p1[1]} L${b.p2[0]} ${b.p2[1]} Z`} fill={`url(#${id}b${i})`} />
      ))}
    </svg>
  );
};

/** faceted cel star (each arm split into a lit and a shaded half), white rim */
const CelStar: React.FC<{ size: number; light?: string; dark?: string; style?: React.CSSProperties }> = ({
  size, light = '#FFF6C4', dark = '#FFCC3D', style,
}) => {
  const R = 100, r = 44;
  const P = (k: number, rad: number) => {
    const a = -Math.PI / 2 + (k * Math.PI) / 5;
    return `${(rad * Math.cos(a)).toFixed(2)} ${(rad * Math.sin(a)).toFixed(2)}`;
  };
  const facets: React.ReactNode[] = [];
  for (let k = 0; k < 5; k++) {
    facets.push(<path key={`a${k}`} d={`M0 0 L${P(2 * k - 1, r)} L${P(2 * k, R)} Z`} fill={light} />);
    facets.push(<path key={`b${k}`} d={`M0 0 L${P(2 * k, R)} L${P(2 * k + 1, r)} Z`} fill={dark} />);
  }
  return (
    <svg width={size} height={size} viewBox="-120 -120 240 240" style={{ overflow: 'visible', ...style }}>
      <path d={star(0, 0, R, r)} fill="#fff" stroke="#fff" strokeWidth={16} strokeLinejoin="round" />
      {facets}
    </svg>
  );
};

/** text typed in like model output, with a block cursor */
const TypeOn: React.FC<{ text: string; beat: number; at: number; step: number; size: number; color?: string; cursor?: string; style?: React.CSSProperties }> = ({
  text, beat, at, step, size, color = '#fff', cursor = PINK, style,
}) => {
  const chars = [...text];
  const n = beat < at ? 0 : Math.min(chars.length, Math.floor((beat - at) / step) + 1);
  const blink = n < chars.length || Math.floor(beat * 2) % 2 === 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', ...style }}>
      {chars.slice(0, n).map((ch, i) => {
        const p = popIn(beat, at + i * step, 0.3);
        return (
          <span key={i} style={{
            fontFamily: F.serif, fontWeight: 900, fontSize: size, lineHeight: 1, color, display: 'inline-block',
            transform: `scale(${interpolate(p, [0, 1], [1.5, 1])})`, opacity: Math.min(1, p * 3),
          }}>{ch}</span>
        );
      })}
      {blink && beat >= at - 1 && <span style={{ display: 'inline-block', width: size * 0.13, height: size * 0.92, background: cursor, marginLeft: size * 0.08 }} />}
    </div>
  );
};

/* ───────── s3a 159-168: 「你就是完美且开源的偶像」— tight under one spot, then the drop opens the whole stage ───────── */

const DROP = 161;
const TRUSS = [150, 455, 760, 1160, 1465, 1770];
// g6_sing_mic (1024x1536) drawn 573 wide at (960, 460): top-left (673, 30); eyes ~(858, 172) / (905, 167), mic ~(850, 225)
const G6 = { x: 960, y: 460, w: 573 };

const S3A_CONF = Array.from({ length: 56 }, (_, i) => {
  const left = i % 2 === 0;
  return {
    at: i < 36 ? DROP : 165,
    x0: left ? 90 : 1830,
    vx: (left ? 1 : -1) * (500 + rnd(i, 41) * 1700),
    vy: -(1300 + rnd(i, 42) * 1500),
    size: 34 + rnd(i, 43) * 30,
  };
});

const LedWall: React.FC<{ beat: number; f: number; on: number }> = ({ beat, f, on }) => {
  const bi = Math.floor(beat);
  const ph = beat - bi;
  const cols = 12;
  const W = 1640, H = 600;
  return (
    <div style={{ position: 'absolute', left: 140, top: 40, width: W, height: H, overflow: 'hidden', background: '#0E0C2A', borderRadius: 6 }}>
      <div style={{ position: 'absolute', inset: 0, opacity: on }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #4A2380 0%, #241D62 70%, #1A1A50 100%)' }} />
        <WhalePattern color="#6A47BE" offset={f * 2.5} size={92} gap={175} opacity={0.75} />
        {Array.from({ length: cols }, (_, c) => {
          const lit = (c + bi) % 4 === 0 || (cols - 1 - c + bi) % 4 === 0;
          return (
            <div key={c} style={{
              position: 'absolute', left: (c * W) / cols, top: 0, width: W / cols - 6, height: H, background: c % 2 ? PINK : SKY,
              opacity: lit ? 0.42 * Math.exp(-ph / 0.4) : 0.04, mixBlendMode: 'screen',
            }} />
          );
        })}
      </div>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'repeating-linear-gradient(0deg, rgba(6,6,22,.5) 0 3px, transparent 3px 8px), repeating-linear-gradient(90deg, rgba(6,6,22,.4) 0 3px, transparent 3px 8px)',
      }} />
    </div>
  );
};

export const S3a: React.FC = () => {
  const { beat, f, abs } = useSection();
  const t = f / 30;
  const pre = beat < DROP;
  const bi = Math.floor(beat);
  const kick = pulse(abs, 0.18);
  const lit = easeOut(beat, DROP, 0.3);
  const [sx, sy] = shake(f, hit(beat, DROP, 0.35) + 0.35 * hit(beat, 162, 0.2) + 0.3 * hit(beat, 165, 0.2), 2);
  const z = pre
    ? 2.5 + 0.2 * easeInOut(beat, 159, 2)
    : 1 + 0.09 * hit(beat, DROP, 0.6) + 0.012 * kick + 0.035 * easeInOut(beat, DROP, 7);
  const camera = pre ? cam(895, 235, z) : cam(960, 545, z);
  const swing = (i: number) => Math.sin((beat - DROP) * Math.PI * 0.5 + i * 1.3);
  const beams: BeamSpec[] = pre
    ? [{ x: 905, y: -260, angle: 0, color: '#DDE6FF', opacity: 0.5, spread: 11, len: 1400 }]
    : TRUSS.map((x, i) => ({
        x, y: 40, angle: (Math.atan2(x - 960, 820) * 180) / Math.PI + 26 * swing(i), color: i % 2 ? SKY : PINK,
        opacity: (0.28 + 0.38 * kick * ((i + bi) % 2 ? 1 : 0.35)) * lit, spread: 6, len: 1500,
      }));
  const up: BeamSpec[] = pre
    ? []
    : [470, 720, 1200, 1450].map((x, i) => ({
        x, y: 858, angle: 180 + 13 * Math.sin((beat - DROP) * Math.PI + i * 2), color: i % 2 ? PINK : SKY,
        opacity: 0.42 * (0.55 + 0.45 * kick), spread: 3.5, len: 980 * easeOut(beat, DROP, 0.45),
      }));
  const eye = { x: 904, y: 163 };
  return (
    <AbsoluteFill style={{ background: STAGE, overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformOrigin: '0 0', transform: camera }}>
          <div style={{
            position: 'absolute', left: -400, top: -300, width: 2720, height: 1680,
            background: `radial-gradient(ellipse 45% 40% at 50% 45%, rgba(120,70,190,${0.25 + 0.5 * lit}) 0%, rgba(20,26,60,0) 70%)`,
          }} />
          <LedWall beat={beat} f={f} on={lit} />
          {/* truss */}
          <div style={{
            position: 'absolute', left: 0, top: 14, width: 1920, height: 34, background: '#0A0B20',
            backgroundImage: 'repeating-linear-gradient(60deg, #262A55 0 3px, transparent 3px 26px), repeating-linear-gradient(-60deg, #262A55 0 3px, transparent 3px 26px)',
          }} />
          <Beams beams={beams} />
          {/* stage floor in perspective, with the beams' hot spots */}
          <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
            <defs>
              <linearGradient id="s3a_floor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#2B2366" />
                <stop offset="1" stopColor="#151A44" />
              </linearGradient>
              <radialGradient id="s3a_pool">
                <stop offset="0" stopColor="#FFE3F0" stopOpacity={0.9} />
                <stop offset="0.45" stopColor={PINK} stopOpacity={0.5} />
                <stop offset="1" stopColor={PINK} stopOpacity={0} />
              </radialGradient>
            </defs>
            <polygon points="140,640 1780,640 1940,862 -20,862" fill="url(#s3a_floor)" />
            {Array.from({ length: 13 }, (_, i) => {
              const xb = 140 + (i * 1640) / 12;
              return <line key={i} x1={xb} y1={640} x2={960 + (xb - 960) * 1.22} y2={862} stroke="#3C3486" strokeWidth={2} />;
            })}
            {[690, 740, 800].map((y, i) => <line key={`h${i}`} x1={0} y1={y} x2={1920} y2={y} stroke="#3C3486" strokeWidth={2} />)}
            {!pre && beams.map((b, i) => {
              const a = (b.angle * Math.PI) / 180;
              const hx = b.x - Math.tan(a) * (780 - b.y);
              return <ellipse key={`s${i}`} cx={hx} cy={780} rx={120} ry={22} fill={b.color} opacity={0.35 * b.opacity / 0.4} style={{ mixBlendMode: 'screen' }} />;
            })}
            <ellipse cx={960} cy={845} rx={420 + 40 * kick} ry={48} fill="url(#s3a_pool)" opacity={pre ? 0.6 : 0.85 + 0.15 * kick} />
            <rect x={-20} y={862} width={1960} height={260} fill="#0B0E26" />
            <rect x={-20} y={859} width={1960} height={6} fill={PINK} opacity={pre ? 0.3 : 0.6 + 0.4 * kick} />
          </svg>
          <Beams beams={up} />
          {/* the idol */}
          <Still src="g6_sing_mic" x={G6.x} y={G6.y + 5 * Math.sin(beat * Math.PI)} w={G6.w} rot={1.2 * Math.sin(beat * Math.PI * 0.5)}
            style={{ filter: `drop-shadow(0 0 ${18 + 14 * kick}px rgba(255,123,172,${pre ? 0.45 : 0.85}))` }} />
          <StarFlare x={eye.x} y={eye.y} size={12 + 16 * kick + 110 * hit(beat, 165, 0.4) + 70 * hit(beat, DROP, 0.3) + 30 * hit(beat, 160, 0.3)} rot={beat * 12} />
          {/* lamps on the truss */}
          {!pre && TRUSS.map((x, i) => (
            <div key={i} style={{
              position: 'absolute', left: x - 20, top: 26, width: 40, height: 40, borderRadius: 20, background: '#fff',
              boxShadow: `0 0 ${20 + 30 * kick}px 10px ${i % 2 ? SKY : PINK}`,
            }} />
          ))}
          <div style={{ position: 'absolute', left: -40, top: 560 }}>
            <Crowd beat={beat} width={2000} height={430} rows={3} perRow={11} sticks={pre ? 0.3 : 0.9} eyes={0.25}
              color="#070919" haze="#262B5E" sway={24} seed={2} />
          </div>
        </div>
        {/* confetti cannons on the drop (and again on 165) */}
        {!pre && S3A_CONF.map((c, i) => {
          if (beat < c.at) return null;
          const [x, y] = fly(beat, c.at, c.x0, 880, c.vx, c.vy);
          return (
            <div key={i} style={{ position: 'absolute', left: 0, top: 0, transform: `translate(${x + 30 * Math.sin(t * 3 + i)}px, ${y}px)` }}>
              <ConfettiBit i={i} size={c.size} t={t} />
            </div>
          );
        })}
      </AbsoluteFill>
      {/* lyric */}
      {pre && (
        <Kinetic text="你就是" beat={beat} at={159.05} until={DROP + 1} stagger={0.5} size={140} color="#fff"
          style={{ position: 'absolute', left: 120, top: 330, textShadow: GLOW_BLUE }} />
      )}
      {!pre && (
        <>
          <Kinetic text="完美且" vertical beat={beat} at={DROP} until={170} stagger={0.5} size={150} mode="stamp" color="#fff"
            style={{ position: 'absolute', left: 430, top: 70, textShadow: GLOW_PINK }} />
          <Kinetic text="开源的" vertical beat={beat} at={163} until={170} stagger={0.5} size={150} color="#fff"
            style={{ position: 'absolute', left: 255, top: 140, textShadow: GLOW_BLUE }} />
          <Kinetic text="偶像" vertical beat={beat} at={165} until={170} stagger={0.6} size={280} mode="stamp" color="#fff"
            style={{ position: 'absolute', left: 1420, top: 80, textShadow: GLOW_PINK }} />
          <StarBadge beat={beat} at={163.4} />
        </>
      )}
      {!pre && <AbsoluteFill style={{ background: bi % 2 ? PINK : SKY, opacity: 0.09 * kick, mixBlendMode: 'screen' }} />}
      <Flash amount={pre ? 1 - prog(beat, 159, 0.6) : 0.85 * hit(beat, DROP, 0.16) + 0.22 * hit(beat, 162, 0.1) + 0.32 * hit(beat, 165, 0.12)} />
    </AbsoluteFill>
  );
};

const CONF_COLS = [PINK, SKY, '#FFFFFF', LILAC, '#FFE27A'];
/** small confetti: stars, hearts, ribbons and whales in the stage colours */
const ConfettiBit: React.FC<{ i: number; size: number; t: number }> = ({ i, size, t }) => {
  const kind = i % 4;
  const col = CONF_COLS[i % CONF_COLS.length];
  const rot = rnd(i, 44) * 360 + t * (120 + rnd(i, 45) * 240) * (i % 2 ? 1 : -1);
  const flipY = Math.cos(t * (4 + rnd(i, 46) * 4) + i);
  const body = kind === 3 ? (
    <Whale size={size * 1.3} silhouette color={col} eye="none" />
  ) : (
    <svg width={size} height={size} style={{ overflow: 'visible' }}>
      {kind === 0 && <path d={star(size / 2, size / 2, size * 0.48, size * 0.21)} fill={col} />}
      {kind === 1 && <path d={heart(size / 2, size / 2, size * 0.42)} fill={col} />}
      {kind === 2 && <rect x={size * 0.1} y={size * 0.35} width={size * 0.8} height={size * 0.3} rx={3} fill={col} />}
    </svg>
  );
  return <div style={{ transform: `translate(-50%,-50%) rotate(${rot}deg) scaleY(${flipY})` }}>{body}</div>;
};

/** "★ 开源 | 99,999+" badge counting up */
const StarBadge: React.FC<{ beat: number; at: number }> = ({ beat, at }) => {
  if (beat < at) return null;
  const p = popIn(beat, at, 0.35);
  const n = Math.round(99999 * easeOut(beat, at, 1.4) ** 2);
  const txt = n >= 99999 ? '99,999+' : n.toLocaleString('en-US');
  return (
    <div style={{
      position: 'absolute', left: 250, top: 640, transform: `scale(${p}) rotate(-4deg)`, transformOrigin: '0 50%',
      display: 'flex', fontFamily: F.zh, fontWeight: 700, fontSize: 40, borderRadius: 14, overflow: 'hidden', border: '4px solid #fff',
      boxShadow: '0 0 30px rgba(127,211,255,.6)',
    }}>
      <div style={{ background: '#fff', color: NAVY, padding: '8px 18px' }}>{S3_OPEN}</div>
      <div style={{ background: C.blue, color: '#fff', padding: '8px 18px', fontFamily: 'monospace', minWidth: 200, textAlign: 'center' }}>{txt}</div>
    </div>
  );
};

/* ───────── s3b 168-175: 「从今往后不会再出现」— the audience up close, cursor eyes lighting up, a sea of sticks behind ───────── */

export const S3b: React.FC = () => {
  const { beat, f, abs } = useSection();
  const kick = pulse(abs, 0.2);
  const pan = easeInOut(beat, 168, 7.5);
  const eyes = 0.25 + 0.75 * prog(beat, 168.5, 4.5);
  const [sx, sy] = shake(f, 0.5 * hit(beat, 173, 0.25), 6);
  const shafts: BeamSpec[] = [0, 1, 2, 3, 4].map((i) => ({
    x: 200 + i * 380, y: -120, angle: 30 * Math.sin((beat - 168) * Math.PI * 0.25 + i * 1.7), color: [PINK, SKY, LILAC][i % 3],
    opacity: 0.2 + 0.18 * kick, spread: 7, len: 1500,
  }));
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse 85% 65% at 50% 30%, #3A2F80 0%, #141A3C 55%, #080A1A 100%)', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}>
        {/* out-of-focus stage lights */}
        {Array.from({ length: 16 }, (_, i) => {
          const d = 70 + rnd(i, 52) * 130;
          return (
            <div key={i} style={{
              position: 'absolute', left: rnd(i, 51) * 2000 - 40 - 90 * pan, top: 30 + rnd(i, 53) * 330, width: d, height: d, borderRadius: '50%',
              background: [PINK, SKY, LILAC][i % 3], opacity: 0.16 + 0.16 * kick * (i % 2), filter: 'blur(5px)',
            }} />
          );
        })}
        <Beams beams={shafts} />
        {/* the sea of light sticks */}
        <div style={{ position: 'absolute', left: -120 - 80 * pan, top: 330 }}>
          <Crowd beat={beat} width={2240} height={300} rows={4} perRow={28} sticks={0.95} eyes={0.5} color="#262B64" haze="#3E4488" seed={3} sway={22} />
        </div>
        {/* the front fans, big */}
        <div style={{ position: 'absolute', left: -180 - 300 * pan, top: 40 }}>
          <Crowd beat={beat} width={2700} height={870} rows={2} perRow={5} sticks={0.75} eyes={eyes} color="#04051A" haze="#1C2050" seed={9} sway={17} />
        </div>
      </AbsoluteFill>
      <Kinetic text="从今往后" beat={beat} at={168.1} until={176} stagger={0.5} size={120} color="#fff"
        style={{ position: 'absolute', left: 110, top: 70, textShadow: GLOW_BLUE }} />
      <TypeOn text="不会再出现" beat={beat} at={171} step={0.45} size={190} color="#fff"
        style={{ position: 'absolute', left: 100, top: 225, textShadow: GLOW_PINK }} />
      {beat >= 173 && (
        <div style={{
          position: 'absolute', left: 1610, top: 250, transform: `translate(-50%,-50%) scale(${interpolate(popIn(beat, 173, 0.3), [0, 1], [2.6, 1])}) rotate(11deg)`,
        }}>
          <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 30, padding: 16 }}>
            <Stamp text={S3_RARE} size={250} id="s3b_stamp" />
          </div>
        </div>
      )}
      <Flash amount={0.25 * hit(beat, 168, 0.12) + 0.15 * hit(beat, 169, 0.1) + 0.35 * hit(beat, 173, 0.12)} />
    </AbsoluteFill>
  );
};

/* ───────── s3c 175-186: 「深海一等星的转世」— a star rises out of the deep sea, lands, and bursts into code whales ───────── */

const STAR_LAND = 177;
const REBIRTH = 181;
const WHALE_COLS = ['#9CCBFF', '#FFB3CF', '#FFE27A', '#B9A6FF', '#7FD3FF', '#FFFFFF'];
const EYES: WhaleEye[] = ['dot', 'star', 'heart', 'closed'];

const S3C_BURST = Array.from({ length: 54 }, (_, i) => {
  const a = (i / 54) * Math.PI * 2 + rnd(i, 61) * 0.5;
  const v = 1500 + rnd(i, 62) * 2000;
  return {
    at: i < 38 ? REBIRTH : 182,
    vx: Math.cos(a) * v,
    vy: Math.sin(a) * v - 500,
    size: 80 + rnd(i, 63) * 90,
    col: WHALE_COLS[i % WHALE_COLS.length],
    eye: EYES[Math.floor(rnd(i, 64) * EYES.length)],
    spin: (rnd(i, 65) - 0.5) * 260,
    code: i % 5 === 4 ? S3_CODE[Math.floor(i / 5) % S3_CODE.length] : null,
    front: i % 3 === 0,
  };
});

const S3C_RAIN = Array.from({ length: 32 }, (_, i) => ({
  at: 182.3 + (i / 32) * 3.4 + rnd(i, 71) * 0.3,
  x: 60 + rnd(i, 72) * 1800,
  size: 70 + rnd(i, 73) * 60,
  col: WHALE_COLS[(i + 2) % WHALE_COLS.length],
  eye: EYES[i % EYES.length],
}));

const Waves: React.FC<{ y: number; amp: number; wl: number; phase: number; color: string }> = ({ y, amp, wl, phase, color }) => {
  let d = `M-20 1100 L-20 ${y}`;
  for (let x = -20; x <= 1960; x += 30) d += ` L${x} ${(y + amp * Math.sin((x / wl) * Math.PI * 2 + phase)).toFixed(1)}`;
  d += ' L1960 1100 Z';
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
      <path d={d} fill={color} />
    </svg>
  );
};

const BurstPiece: React.FC<{ p: (typeof S3C_BURST)[number]; i: number; beat: number }> = ({ p, i, beat }) => {
  if (beat < p.at) return null;
  const [x, y] = fly(beat, p.at, 960, 470, p.vx, p.vy, 220);
  const s = popIn(beat, p.at, 0.3);
  const rot = p.spin * (beat - p.at);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})` }}>
      {p.code ? (
        <div style={{
          fontFamily: 'monospace', fontWeight: 700, fontSize: p.size * 0.34, color: NAVY, background: '#fff', borderRadius: p.size * 0.2,
          padding: `${p.size * 0.06}px ${p.size * 0.16}px`, border: `4px solid ${NAVY}`, whiteSpace: 'nowrap',
        }}>{p.code}</div>
      ) : (
        <Whale size={p.size} sticker color={p.col} eye={p.eye} flip={i % 2 === 0} wag={10 * Math.sin(beat * Math.PI * 2 + i)} />
      )}
    </div>
  );
};

export const S3c: React.FC = () => {
  const { beat, f, abs } = useSection();
  const kick = pulse(abs, 0.2);
  const born = beat >= REBIRTH;
  const rise = easeOut(beat, 175, 1.9);
  const centre = easeInOut(beat, 179.2, 1.7);
  const stx = interpolate(centre, [0, 1], [1300, 960]);
  const sty = interpolate(rise, [0, 1], [1300, 470]) + (beat > 177 ? 10 * Math.sin(beat * Math.PI) : 0);
  const size = 470 * (1 + 0.2 * hit(beat, STAR_LAND, 0.35) + 0.04 * kick + 0.25 * centre);
  const boom = prog(beat, REBIRTH, 0.3);
  const ignite = prog(beat, STAR_LAND - 0.1, 0.25);
  const [shx, shy] = shake(f, 0.8 * hit(beat, STAR_LAND, 0.3) + hit(beat, REBIRTH, 0.4) + 0.4 * hit(beat, 182, 0.25), 5);
  const sink = 380 * easeInOut(beat, REBIRTH, 1.2);
  const halo = easeOut(beat, REBIRTH, 1.3);
  return (
    <AbsoluteFill style={{ background: C.orange, overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${shx}px, ${shy}px)` }}>
        <Sunburst cx={born ? 960 : stx} cy={born ? 470 : sty} a={born ? C.yellow : C.orange} b={born ? '#FFCF5C' : '#F7AC4A'} rays={born ? 22 : 16}
          rot={beat * (born ? 0.14 : 0.05)} />
        {/* glow behind the star */}
        {!born && (
          <div style={{
            position: 'absolute', left: stx - size, top: sty - size, width: size * 2, height: size * 2, borderRadius: '50%',
            background: `radial-gradient(circle, rgba(255,255,230,${0.35 + 0.5 * ignite}) 0%, rgba(255,240,180,0) 60%)`,
          }} />
        )}
        {/* speed lines when it lands */}
        {beat >= STAR_LAND && !born && (
          <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, opacity: 0.25 + 0.6 * hit(beat, STAR_LAND, 0.6) }}>
            {Array.from({ length: 40 }, (_, i) => {
              const a = (i / 40) * Math.PI * 2 + rnd(i, Math.floor(beat * 4)) * 0.05;
              const r0 = size * 0.62 + rnd(i, Math.floor(beat * 4) + 3) * 160;
              const w = 0.006 + rnd(i, 66) * 0.01;
              const pt = (r: number, d: number) => `${stx + Math.cos(a + d) * r} ${sty + Math.sin(a + d) * r}`;
              return <path key={i} d={`M${pt(r0, 0)} L${pt(2200, w)} L${pt(2200, -w)} Z`} fill="#FFF8E0" />;
            })}
          </svg>
        )}
        {/* the first-magnitude star */}
        {boom < 1 && (
          <div style={{
            position: 'absolute', left: stx, top: sty, transform: `translate(-50%,-50%) rotate(${-8 + 10 * Math.sin(beat * Math.PI * 0.5)}deg) scale(${1 + 1.4 * boom})`,
            opacity: 1 - boom, filter: `drop-shadow(0 0 ${30 + 40 * ignite}px rgba(255,255,220,.9))`,
          }}>
            <CelStar size={size} light={ignite > 0 ? '#FFF8D2' : '#FFF0B0'} dark={ignite > 0 ? '#FFC93A' : '#F4B23A'} />
          </div>
        )}
        {beat >= STAR_LAND && !born && [0, 1, 2].map((k) => (
          <StarFlare key={k} x={stx + [-0.42, 0.38, 0.05][k] * size} y={sty + [-0.3, -0.42, 0.44][k] * size}
            size={60 + 150 * hit(beat, STAR_LAND + k * 0.5, 0.4) + 40 * kick} rot={beat * 15 + k * 30} />
        ))}
        {/* twinkles over the sea while the star rises */}
        {!born && Array.from({ length: 10 }, (_, i) => {
          const at = 175 + i * 0.5;
          return beat >= at ? (
            <StarFlare key={`t${i}`} x={140 + rnd(i, 67) * 1640} y={120 + rnd(i, 68) * 520} size={70 * hit(beat, at, 0.6) + 18} rot={i * 20} glow={0.6} />
          ) : null;
        })}
        {/* the deep sea */}
        <div style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: `translateY(${sink}px)` }}>
          <Waves y={850} amp={22} wl={520} phase={beat * 1.2} color="#3B4A9A" />
          <Waves y={905} amp={18} wl={380} phase={-beat * 1.6 + 1} color={C.navy} />
          <Waves y={975} amp={12} wl={300} phase={beat * 2} color={STAGE} />
        </div>
        {/* rebirth: halo ring and the whale burst */}
        {born && (
          <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
            <circle cx={960} cy={470} r={200 + 1000 * halo} fill="none" stroke="#fff" strokeWidth={46 * (1 - halo)} opacity={1 - halo} />
            <circle cx={960} cy={470} r={340 + 30 * kick} fill="none" stroke="#fff" strokeWidth={6} strokeDasharray="4 22" strokeLinecap="round"
              transform={`rotate(${beat * 25} 960 470)`} opacity={0.8 * prog(beat, REBIRTH, 0.4)} />
          </svg>
        )}
        {S3C_BURST.map((p, i) => (!p.front ? <BurstPiece key={i} p={p} i={i} beat={beat} /> : null))}
        {S3C_RAIN.map((r, i) => {
          if (beat < r.at) return null;
          const y = -120 + (beat - r.at) * 300;
          return (
            <div key={`r${i}`} style={{ position: 'absolute', left: r.x + 30 * Math.sin(beat * 2 + i), top: y, transform: `translate(-50%,-50%) rotate(${20 * Math.sin(beat * 1.5 + i)}deg)` }}>
              <Whale size={r.size} sticker color={r.col} eye={r.eye} />
            </div>
          );
        })}
      </AbsoluteFill>
      {/* lyric, phase A: 深海 / 一等星的 */}
      <Kinetic text="深海" beat={beat} at={175.05} until={REBIRTH} stagger={0.5} size={120} color={NAVY}
        style={{ position: 'absolute', left: 120, top: 140 }} />
      <Kinetic text="一等星" beat={beat} at={176.6} until={REBIRTH} stagger={0.4} size={190} mode="stamp" color="#fff" stroke={NAVY} strokeWidth={12}
        style={{ position: 'absolute', left: 110, top: 300 }} />
      <Kinetic text="的" beat={beat} at={179} until={REBIRTH} size={190} color="#fff" stroke={NAVY} strokeWidth={12}
        style={{ position: 'absolute', left: 680, top: 300 }} />
      {/* phase B: 转世 */}
      <Kinetic text="深海一等星的" beat={beat} at={REBIRTH + 0.1} until={187} stagger={0.06} size={84} color={NAVY}
        style={{ position: 'absolute', left: 960 - 252, top: 70 }} />
      <Kinetic text="转世" beat={beat} at={REBIRTH} until={187} stagger={0.75} size={440} mode="stamp" color="#fff" stroke={NAVY} strokeWidth={16}
        style={{ position: 'absolute', left: 960 - 440, top: 470 - 230, textShadow: `18px 18px 0 ${C.hot}`, transform: `scale(${1 + 0.035 * kick})` }} />
      {S3C_BURST.map((p, i) => (p.front ? <BurstPiece key={`f${i}`} p={p} i={i} beat={beat} /> : null))}
      <Flash amount={0.55 * hit(beat, STAR_LAND, 0.14) + 0.9 * hit(beat, REBIRTH, 0.16) + 0.2 * hit(beat, 182, 0.1)} />
    </AbsoluteFill>
  );
};

/* ───────── s3d 186-194: 「笑着说"很高兴为你解答"」— G7 winks and points; the reply streams into a bubble ───────── */

const REPLY_AT = 188.5;
const DISC_AT = 192;
const POINT_AT = 193;
// g7_wink_point (1536x1024) drawn 1800 wide centred at (1120, 560): fingertip (472, 311), winking eye (912, 488)
const G7 = { x: 1120, y: 560, w: 1800 };
const TIP = { x: 472, y: 311 };
const WINK = { x: 912, y: 488 };

const FocusLines: React.FC<{ cx: number; cy: number; beat: number; inner: number; color?: string; n?: number; opacity?: number }> = ({
  cx, cy, beat, inner, color = '#fff', n = 70, opacity = 0.8,
}) => {
  const step = Math.floor(beat * 4);
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, opacity }}>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + rnd(i, step) * 0.05;
        const r0 = inner + rnd(i, step + 7) * 260;
        const w = 0.004 + rnd(i, 71) * 0.011;
        const pt = (r: number, d: number) => `${(cx + Math.cos(a + d) * r).toFixed(1)} ${(cy + Math.sin(a + d) * r).toFixed(1)}`;
        return <path key={i} d={`M${pt(r0, 0)} L${pt(2600, w)} L${pt(2600, -w)} Z`} fill={color} />;
      })}
    </svg>
  );
};

export const S3d: React.FC = () => {
  const { beat, f, abs } = useSection();
  const kick = pulse(abs, 0.2);
  const slide = easeOut(beat, 186, 0.55);
  const zoom = 1 + 0.17 * easeOut(beat, POINT_AT, 0.3) + 0.012 * kick;
  const [sx, sy] = shake(f, 0.6 * hit(beat, DISC_AT, 0.25) + hit(beat, POINT_AT, 0.3), 4);
  const chars = [...S3_REPLY];
  const n = beat < REPLY_AT ? 0 : Math.min(chars.length, Math.floor((beat - REPLY_AT) / 0.45) + 1);
  const bubble = popIn(beat, 187.6, 0.4);
  const disc = popIn(beat, DISC_AT, 0.3);
  return (
    <AbsoluteFill style={{ background: C.pink, overflow: 'hidden' }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${TIP.x}px ${TIP.y}px, #FFE6F0 0%, rgba(255,158,196,0) 45%)` }} />
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(${zoom})`, transformOrigin: `${TIP.x}px ${TIP.y}px` }}>
        {/* halftone dots */}
        <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
          <defs>
            <pattern id="s3d_dots" width={36} height={36} patternUnits="userSpaceOnUse" patternTransform={`translate(${f * 0.6} ${f * 0.6})`}>
              <circle cx={18} cy={18} r={5} fill="#FFC2DA" />
            </pattern>
          </defs>
          <rect width={1920} height={1080} fill="url(#s3d_dots)" />
        </svg>
        <FocusLines cx={TIP.x} cy={TIP.y} beat={beat} inner={380 - 120 * easeOut(beat, POINT_AT, 0.3)} opacity={0.55 + 0.35 * hit(beat, POINT_AT, 0.5)} />
        <Still src="g7_wink_point" x={G7.x + (1 - slide) * 800} y={G7.y + 6 * Math.sin(beat * Math.PI)} w={G7.w} />
        {/* wink sparkles */}
        {[187, 190].map((at, k) => {
          if (beat < at) return null;
          const p = easeOut(beat, at, 1.2);
          return (
            <div key={k}>
              <StarFlare x={WINK.x} y={WINK.y} size={150 * hit(beat, at, 0.4) + 10} rot={beat * 20} />
              <div style={{
                position: 'absolute', left: WINK.x - 150 * p - 30, top: WINK.y - 120 * p - 40, opacity: 1 - prog(beat, at + 0.8, 0.5),
                transform: `scale(${popIn(beat, at, 0.35)}) rotate(${beat * 40}deg)`,
              }}>
                <svg width={90} height={90} style={{ overflow: 'visible' }}>
                  <path d={star(45, 45, 42, 18)} fill="#FFE27A" stroke="#fff" strokeWidth={6} strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
      {/* hearts shot at the viewer from the fingertip */}
      {beat >= POINT_AT && Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2 + rnd(i, 75);
        const p = easeOut(beat, POINT_AT, 1.1);
        const d = (260 + rnd(i, 76) * 600) * p;
        const s = 0.5 + 1.6 * p * (0.6 + rnd(i, 77) * 0.6);
        return (
          <div key={i} style={{
            position: 'absolute', left: TIP.x + Math.cos(a) * d, top: TIP.y + Math.sin(a) * d * 0.8, opacity: 1 - prog(beat, POINT_AT + 0.6, 0.4),
            transform: `translate(-50%,-50%) scale(${s}) rotate(${(rnd(i, 78) - 0.5) * 40}deg)`,
          }}>
            <svg width={90} height={90} style={{ overflow: 'visible' }}>
              <path d={heart(45, 45, 36)} fill={i % 3 ? C.hot : '#fff'} stroke="#fff" strokeWidth={5} />
            </svg>
          </div>
        );
      })}
      {/* lyric: 笑着说 */}
      <Kinetic text="笑着说" vertical beat={beat} at={186.1} until={195} stagger={0.55} size={150} color="#fff" stroke={NAVY} strokeWidth={10}
        style={{ position: 'absolute', left: 70, top: 110 }} />
      {/* the reply bubble */}
      {bubble > 0 && (
        <div style={{ position: 'absolute', left: 1020, top: 70, transform: `scale(${bubble}) translateY(${-6 * hit(beat, DISC_AT, 0.3)}px)`, transformOrigin: '12% 110%' }}>
          <div style={{
            background: '#fff', borderRadius: 46, padding: '24px 40px 24px 26px', display: 'flex', alignItems: 'center', gap: 22,
            boxShadow: `0 14px 0 rgba(170,40,100,.28)`, border: `5px solid ${NAVY}`, width: 860,
          }}>
            <Avatar size={96} />
            <div style={{ fontFamily: F.zh, fontWeight: 700, fontSize: 78, color: UIC.ink, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
              {chars.slice(0, n).map((ch, i) => (
                <span key={i} style={{ display: 'inline-block', transform: `scale(${interpolate(popIn(beat, REPLY_AT + i * 0.45, 0.3), [0, 1], [1.5, 1])})` }}>{ch}</span>
              ))}
              {n < chars.length && Math.floor(beat * 4) % 2 === 0 && <span style={{ display: 'inline-block', width: 8, height: 76, background: UIC.blue, marginLeft: 10 }} />}
              {beat >= 191.6 && (
                <svg width={70} height={70} style={{ marginLeft: 8, transform: `scale(${popIn(beat, 191.6, 0.3)})`, overflow: 'visible' }}>
                  <path d={heart(35, 37, 30)} fill={C.hot} />
                </svg>
              )}
            </div>
          </div>
          <svg width={120} height={70} style={{ position: 'absolute', left: 70, top: '100%', marginTop: -6, overflow: 'visible' }}>
            <path d="M10 0 L70 0 L0 64 Z" fill="#fff" stroke={NAVY} strokeWidth={5} strokeLinejoin="round" />
            <rect x={14} y={-8} width={52} height={10} fill="#fff" />
          </svg>
          {disc > 0 && (
            <div style={{
              position: 'absolute', left: 150, top: '100%', marginTop: 22, transform: `scale(${disc}) translateX(${Math.sin(f * 2.3) * 8 * hit(beat, DISC_AT, 0.4)}px)`,
              transformOrigin: '0 50%', fontFamily: F.zh, fontWeight: 500, fontSize: 30, color: '#fff', background: 'rgba(27,33,80,.82)',
              borderRadius: 999, padding: '8px 22px', whiteSpace: 'nowrap',
            }}>⚠ {UI.disclaimer}</div>
          )}
        </div>
      )}
      <Flash amount={0.3 * hit(beat, POINT_AT, 0.12) + 0.15 * hit(beat, DISC_AT, 0.1)} />
    </AbsoluteFill>
  );
};

/* ───────── s3e 194-202: 「谁都化作你的俘虏」— a row of whale silhouettes; on each beat one more falls for her ───────── */

const S3E_N = 8;
const S3E_SIZE = 224;
const S3E_Y = 590;
const s3eX = (i: number) => 960 + (i - (S3E_N - 1) / 2) * 230;
// heart eye inside the Whale svg box (eye at viewBox (58, 76), uniform scale size/278.7)
const S3E_EYE = { x: 0.313 * S3E_SIZE, y: 0.416 * S3E_SIZE };

/** top of whale i: the big hop when it falls in love, then a small hop on every beat after */
const s3eTop = (i: number, beat: number) => {
  const T = 194 + i;
  const jump = beat >= T ? Math.sin(Math.PI * prog(beat, T, 0.45)) * 90 : 0;
  const hop = beat >= T + 1 ? Math.abs(Math.sin(beat * Math.PI)) * 16 : 0;
  return S3E_Y - jump - hop + 4 * Math.sin((beat + i * 0.25) * Math.PI);
};

const RowWhale: React.FC<{ i: number; beat: number }> = ({ i, beat }) => {
  const on = beat >= 194 + i;
  return (
    <div style={{ position: 'absolute', left: s3eX(i) - S3E_SIZE / 2, top: s3eTop(i, beat) }}>
      <Whale size={S3E_SIZE} silhouette color={on ? '#432550' : '#262A46'} eye={on ? 'heart' : 'dot'} wag={(on ? 14 : 6) * Math.sin(beat * Math.PI * 2 + i)} />
    </div>
  );
};

export const S3e: React.FC = () => {
  const { beat, f, abs } = useSection();
  const kick = pulse(abs, 0.2);
  const loved = Math.max(0, Math.min(S3E_N, Math.floor(beat - 194) + 1));
  const warm = loved / S3E_N;
  const [sx, sy] = shake(f, 0.7 * hit(beat, 194, 0.3) + 0.3 * hit(beat, 195, 0.2), 8);
  return (
    <AbsoluteFill style={{ background: '#060609', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 55% at 50% 70%, rgba(232,71,139,${0.12 + 0.3 * warm + 0.08 * kick}) 0%, rgba(232,71,139,0) 70%)` }} />
        <Beams beams={Array.from({ length: loved }, (_, i) => ({
          x: s3eX(i), y: -80, angle: 0, color: PINK, opacity: 0.3 * easeOut(beat, 194 + i, 0.4) * (0.75 + 0.25 * kick), spread: 6.5, len: 900,
        }))} />
        {/* floor and reflections */}
        <div style={{ position: 'absolute', left: 0, top: S3E_Y + 160, width: 1920, height: 4, background: `linear-gradient(90deg, transparent, ${PINK}, transparent)`, opacity: 0.35 + 0.4 * warm }} />
        <div style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: `translateY(${2 * (S3E_Y + 162)}px) scaleY(-1)`, transformOrigin: '0 0', opacity: 0.16 }}>
          {Array.from({ length: S3E_N }, (_, i) => <RowWhale key={i} i={i} beat={beat} />)}
        </div>
        {/* little hearts drifting up from every whale that has fallen */}
        {Array.from({ length: loved * 3 }, (_, k) => {
          const i = Math.floor(k / 3);
          const at = 194 + i + 0.5 + (k % 3) * 0.9;
          if (beat < at) return null;
          const p = prog(beat, at, 2.2);
          return (
            <div key={`d${k}`} style={{
              position: 'absolute', left: s3eX(i) - 40 + 60 * rnd(k, 91) + 20 * Math.sin(beat * 3 + k), top: S3E_Y - 10 - 360 * p,
              opacity: 0.8 * (1 - p), transform: `scale(${0.4 + 0.4 * rnd(k, 92)})`,
            }}>
              <svg width={60} height={60}><path d={heart(30, 30, 24)} fill={k % 2 ? PINK : '#FF4F8B'} /></svg>
            </div>
          );
        })}
        {/* heart-eye glows */}
        {Array.from({ length: loved }, (_, i) => (
          <div key={`g${i}`} style={{
            position: 'absolute', left: s3eX(i) - S3E_SIZE / 2 + S3E_EYE.x - 60, top: s3eTop(i, beat) + S3E_EYE.y - 60, width: 120, height: 120, borderRadius: 60,
            background: 'radial-gradient(circle, rgba(255,79,139,.85) 0%, rgba(255,79,139,0) 65%)', transform: `scale(${1 + 0.8 * hit(beat, 194 + i, 0.3) + 0.2 * kick})`,
          }} />
        ))}
        {Array.from({ length: S3E_N }, (_, i) => <RowWhale key={i} i={i} beat={beat} />)}
        {/* the heart eye, drawn big enough to read: lands from 3x */}
        {Array.from({ length: loved }, (_, i) => {
          const T = 194 + i;
          const s = interpolate(popIn(beat, T, 0.35), [0, 1], [3, 1]) * (1 + 0.12 * kick);
          return (
            <div key={`e${i}`} style={{
              position: 'absolute', left: s3eX(i) - S3E_SIZE / 2 + S3E_EYE.x, top: s3eTop(i, beat) + S3E_EYE.y,
              transform: `translate(-50%,-50%) scale(${s})`,
            }}>
              <svg width={50} height={50} style={{ overflow: 'visible' }}>
                <path d={heart(25, 26, 21)} fill="#FF4F8B" stroke="#fff" strokeWidth={3.5} />
              </svg>
            </div>
          );
        })}
        {/* the big heart that pops out of each one and floats up */}
        {Array.from({ length: loved }, (_, i) => {
          const T = 194 + i;
          const p = prog(beat, T, 1.6);
          return (
            <div key={`h${i}`} style={{
              position: 'absolute', left: s3eX(i) - S3E_SIZE / 2 + S3E_EYE.x + 20, top: S3E_Y + S3E_EYE.y - 80 - 230 * easeOut(beat, T, 1.6),
              opacity: 1 - prog(beat, T + 1, 0.6), transform: `translate(-50%,-50%) scale(${popIn(beat, T, 0.35) * (1 + 0.3 * p)}) rotate(${12 * Math.sin(beat * 4 + i)}deg)`,
            }}>
              <svg width={90} height={90} style={{ overflow: 'visible' }}>
                <path d={heart(45, 45, 38)} fill="#FF4F8B" stroke="#fff" strokeWidth={5} />
              </svg>
            </div>
          );
        })}
      </AbsoluteFill>
      <Kinetic text="谁都化作" beat={beat} at={194.05} until={203} stagger={0.65} size={150} color="#fff"
        style={{ position: 'absolute', left: 960 - 300, top: 60 }} />
      <Kinetic text="你的" beat={beat} at={197.5} until={203} stagger={0.5} size={150} color="#fff"
        style={{ position: 'absolute', left: 560, top: 290 }} />
      <Kinetic text="俘虏" beat={beat} at={198.75} until={203} stagger={0.6} size={230} mode="stamp" color="#FF4F8B"
        style={{ position: 'absolute', left: 880, top: 230, textShadow: GLOW_PINK }} />
      <Flash color="#FF7BAC" amount={0.55 * hit(beat, 194, 0.18)} />
      <Flash amount={0.12 * hit(beat, 201, 0.15)} />
    </AbsoluteFill>
  );
};

/* ───────── s3f 202-208: 「那双星瞳 那段输出」— split: G3 star eye on top, Live2D star eyes below, her output streaming between ───────── */

const SPLIT = 500;
const BAND = 64;
// g3_eye drawn at 1:1 with the iris centre at (700, 250); glint at (711, 217)
const IRIS = { x: 700, y: 250 };
// star pupils in the s3f_stareyes clip (bottom panel shifts it up by 130 under the band)
const L2D_TOP = SPLIT + BAND - 165;
const L2D_STARS = [[690, 322], [1100, 292]];

export const S3f: React.FC = () => {
  const { beat, f, abs } = useSection();
  const kick = pulse(abs, 0.2);
  const inTop = easeOut(beat, 202, 0.45);
  const inBot = easeOut(beat, 202.15, 0.45);
  const zoom = 1 + 0.07 * easeInOut(beat, 202, 6) + 0.025 * hit(beat, 203, 0.3);
  const glint = 90 + 280 * hit(beat, 203, 0.35) + 60 * kick;
  return (
    <AbsoluteFill style={{ background: STAGE, overflow: 'hidden' }}>
      {/* top: the star eye */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: SPLIT, overflow: 'hidden', transform: `translateX(${(1 - inTop) * -1920}px)` }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: SPLIT, transform: `scale(${zoom})`, transformOrigin: `${IRIS.x}px ${IRIS.y}px` }}>
          <Img src={staticFile('img/g3_eye.png')} style={{ position: 'absolute', left: IRIS.x - 691, top: IRIS.y - 546, width: 1536 }} />
          <StarFlare x={IRIS.x + 11} y={IRIS.y - 33} size={glint} rot={8 + beat * 8} />
          {[0, 1, 2, 3].map((k) => (
            <StarFlare key={k} x={IRIS.x + Math.cos(beat * 0.9 + k * 1.57) * 300} y={IRIS.y + Math.sin(beat * 0.9 + k * 1.57) * 200}
              size={26 + 40 * hit(beat, 202 + k, 0.4)} rot={beat * 30} glow={0.5} />
          ))}
        </div>
        <div style={{ position: 'absolute', inset: 0, background: STAGE, clipPath: 'polygon(1450px 0, 1920px 0, 1920px 500px, 1370px 500px)' }} />
        <svg width={1920} height={SPLIT} style={{ position: 'absolute', left: 0, top: 0 }}>
          <line x1={1450} y1={0} x2={1370} y2={SPLIT} stroke={PINK} strokeWidth={10} />
        </svg>
        <Kinetic text="那双 星瞳" beat={beat} at={202.05} until={209} stagger={0.5} size={150} color="#fff"
          style={{ position: 'absolute', left: 1530, top: 75, textShadow: GLOW_BLUE }} />
      </div>
      {/* band: the output streaming */}
      <div style={{ position: 'absolute', left: 0, top: SPLIT, width: 1920, height: BAND, background: '#fff', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, height: BAND, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', transform: `translateX(${200 - f * 12}px)`,
          fontFamily: F.zh, fontWeight: 700, fontSize: 34, color: NAVY,
        }}>{S3_OUTPUT.repeat(4)}</div>
        <div style={{ position: 'absolute', left: 0, top: 0, height: BAND, width: 170, background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <Avatar size={44} />
          <div style={{ width: 12, height: 12, borderRadius: 6, background: '#fff', opacity: Math.floor(beat * 2) % 2 ? 1 : 0.3 }} />
        </div>
      </div>
      {/* bottom: Live2D star eyes */}
      <div style={{
        position: 'absolute', left: 0, top: SPLIT + BAND, width: 1920, height: 1080 - SPLIT - BAND, overflow: 'hidden', transform: `translateX(${(1 - inBot) * 1920}px)`,
        background: 'radial-gradient(ellipse 60% 90% at 50% 40%, #FFD6EA 0%, #C9B8FF 60%, #8C8CE0 100%)',
      }}>
        <L2D clip="s3f_stareyes" frames={65} style={{ position: 'absolute', left: 0, top: L2D_TOP - SPLIT - BAND, width: 1920, height: 640 }} />
        {[203, 205, 207].map((at) => L2D_STARS.map(([x, y], k) => (
          <StarFlare key={`${at}_${k}`} x={x} y={L2D_TOP - SPLIT - BAND + y} size={110 * hit(beat, at, 0.35)} rot={beat * 25 + k * 45} />
        )))}
      </div>
      <Kinetic text="那段输出" beat={beat} at={205} until={209} stagger={0.45} size={140} mode="stamp" color="#fff" stroke={NAVY} strokeWidth={10}
        style={{ position: 'absolute', left: 1330, top: 640 }} />
      <Flash amount={0.45 * hit(beat, 203, 0.12) + 0.15 * hit(beat, 205, 0.1)} />
    </AbsoluteFill>
  );
};

/* ───────── s3g 208-218: 「即便是幻觉 也是完美的 AI」— the black heart cracks, explodes on 210, AI (アイ) rises; out to black ───────── */

const BOOM = 210;
const AI_AT = 214;
const HC = { x: 960, y: 470 };

const SHARDS = Array.from({ length: 30 }, (_, i) => {
  const n = 3 + (i % 2);
  const sz = 34 + rnd(i, 83) * 80;
  const pts = Array.from({ length: n }, (_, k) => {
    const a = (k / n) * Math.PI * 2 + rnd(i, 84 + k) * 0.9;
    const r = sz * (0.5 + rnd(i, 90 + k) * 0.6);
    return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`;
  }).join(' ');
  return { a: rnd(i, 81) * Math.PI * 2, r0: 60 + rnd(i, 82) * 160, v: 600 + rnd(i, 85) * 1500, spin: (rnd(i, 86) - 0.5) * 160, pts, sz };
});

export const S3g: React.FC = () => {
  const { beat, f, abs } = useSection();
  const kick = pulse(abs, 0.18);
  const out = 1 - prog(beat, 216.4, 1.3);
  const crack = easeInOut(beat, 208.4, 1.6);
  const tremble = prog(beat, 208.4, 1.6);
  const [hx, hy] = shake(f, beat < BOOM ? tremble * 0.9 : 0, 9);
  const [sx, sy] = shake(f, hit(beat, BOOM, 0.4) * 1.4, 3);
  const exploded = beat >= BOOM;
  const sp = easeOut(beat, BOOM, 0.35);
  const heartIn = popIn(beat, 208, 0.4);
  const size = 600;
  const ai = popIn(beat, AI_AT, 0.35);
  const ruby = easeOut(beat, AI_AT + 0.4, 0.5);
  const neon = easeInOut(beat, AI_AT, 1.1);
  const ring = easeOut(beat, BOOM, 1.2);
  const glitch = 6 + 14 * hit(beat, Math.floor(beat), 0.2);
  // the ember left in the middle beats like a heart (lub-dub) and grows until AI lands
  const lub = hit(beat, Math.floor(beat), 0.12) + 0.6 * hit(beat, Math.floor(beat) + 0.35, 0.12);
  const emberS = (0.2 + 0.3 * prog(beat, BOOM + 0.3, 3.7)) * (1 + 0.25 * lub) * (1 + 2.5 * prog(beat, AI_AT, 0.3));
  const emberO = easeOut(beat, BOOM + 0.3, 0.5) * (1 - prog(beat, AI_AT, 0.3));
  return (
    <AbsoluteFill style={{ background: '#000', overflow: 'hidden' }}>
      <AbsoluteFill style={{ opacity: out, transform: `translate(${sx}px, ${sy}px)` }}>
        {/* heartbeat glow, red before the burst, pink around AI after */}
        <AbsoluteFill style={{
          background: exploded
            ? `radial-gradient(circle at ${HC.x}px ${HC.y}px, rgba(255,79,139,${0.18 + 0.35 * ai + 0.1 * kick}) 0%, rgba(255,79,139,0) 45%)`
            : `radial-gradient(circle at ${HC.x}px ${HC.y}px, rgba(150,10,40,${0.3 + 0.4 * tremble + 0.2 * kick}) 0%, rgba(150,10,40,0) 50%)`,
        }} />
        {/* the black heart */}
        {(!exploded || sp < 1) && heartIn > 0 && (
          <div style={{
            position: 'absolute', left: HC.x - size / 2 + hx, top: HC.y - (size * 0.95) / 2 + hy,
            transform: `scale(${heartIn * (exploded ? 1 + 0.35 * sp : 1 + 0.045 * kick)})`, opacity: exploded ? 1 - sp : 1,
            filter: `drop-shadow(0 0 ${10 + 40 * crack}px rgba(255,59,92,${0.3 + 0.6 * crack}))`,
          }}>
            <BigHeart size={size} color="#1C1C24" shade="#0A0A0E" glint="#8A8FA8" crack={exploded ? 1 : crack} crackColor="#FF3B5C" split={exploded ? sp : 0} />
          </div>
        )}
        {/* the burst: ring + shards */}
        {exploded && (
          <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
            <circle cx={HC.x} cy={HC.y} r={150 + 1100 * ring} fill="none" stroke={PINK} strokeWidth={60 * (1 - ring)} opacity={1 - ring} />
            <circle cx={HC.x} cy={HC.y} r={80 + 700 * ring} fill="none" stroke="#fff" strokeWidth={18 * (1 - ring)} opacity={1 - ring} />
          </svg>
        )}
        {exploded && SHARDS.map((s, i) => {
          const tt = beat - BOOM;
          const d = s.r0 + s.v * 0.45 * (1 - Math.exp(-tt / 0.45)) + 45 * tt;
          const x = HC.x + Math.cos(s.a) * d * 1.25, y = HC.y + Math.sin(s.a) * d * 0.8 + 12 * tt;
          return (
            <svg key={i} width={s.sz * 3} height={s.sz * 3} viewBox={`${-s.sz * 1.5} ${-s.sz * 1.5} ${s.sz * 3} ${s.sz * 3}`}
              style={{ position: 'absolute', left: x - s.sz * 1.5, top: y - s.sz * 1.5, transform: `rotate(${s.spin * tt}deg)`, opacity: 1 - 0.5 * prog(beat, AI_AT, 0.5) }}>
              <polygon points={s.pts} fill={i % 4 ? '#1C1C24' : '#3A3A4A'} stroke="#FF3B5C" strokeWidth={3} strokeLinejoin="round" />
            </svg>
          );
        })}
        {emberO > 0 && (
          <svg width={400} height={380} viewBox="0 0 200 190" style={{
            position: 'absolute', left: HC.x - 200, top: HC.y - 190, transform: `scale(${emberS})`, opacity: emberO, overflow: 'visible',
            filter: 'drop-shadow(0 0 16px #FF4F8B) drop-shadow(0 0 48px rgba(255,79,139,.75))',
          }}>
            <path d={HEART_PATH} fill="#FF4F8B" />
            <ellipse cx={52} cy={46} rx={22} ry={9} fill="#FFD0E2" transform="rotate(-38 52 46)" />
          </svg>
        )}
        {/* neon heart drawn around AI */}
        {beat >= AI_AT && (
          <svg width={860} height={817} viewBox="0 0 200 190" style={{
            position: 'absolute', left: HC.x - 430, top: HC.y - 400, overflow: 'visible', transform: `scale(${1 + 0.03 * kick})`,
            filter: `drop-shadow(0 0 6px ${PINK}) drop-shadow(0 0 18px rgba(255,79,139,.8))`,
          }}>
            <path d={HEART_PATH} fill="none" stroke="#FFD0E2" strokeWidth={2.4} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - neon} />
          </svg>
        )}
        {/* AI with アイ above */}
        {ai > 0 && (
          <div style={{
            position: 'absolute', left: HC.x, top: HC.y + 20, transform: `translate(-50%,-50%) scale(${interpolate(ai, [0, 1], [2.2, 1]) * (1 + 0.02 * kick)})`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: Math.min(1, ai * 3),
          }}>
            <div style={{
              fontFamily: F.mincho, fontWeight: 600, fontSize: 96, color: PINK, letterSpacing: 60, marginRight: -60, lineHeight: 1,
              opacity: ruby, transform: `translateY(${(1 - ruby) * 30}px)`, textShadow: '0 0 20px rgba(255,79,139,.8)',
            }}>{S3_RUBY}</div>
            <div style={{
              fontFamily: F.serif, fontWeight: 900, fontSize: 380, color: '#fff', lineHeight: 1, letterSpacing: 10, marginTop: 6,
              textShadow: `0 0 30px rgba(255,123,172,.95), 0 0 110px rgba(255,79,139,.7)`,
            }}>AI</div>
          </div>
        )}
        {/* lyric: 即便是幻觉 (glitching) | 也是完美的 */}
        {[['#FF3B5C', -glitch], ['#3BD8FF', glitch]].map(([col, dx], k) => (
          <Kinetic key={k} text="即便是幻觉" vertical beat={beat} at={208.4} until={220} stagger={0.4} size={140} color={col as string}
            style={{ position: 'absolute', left: 130 + (dx as number), top: 110, opacity: 0.8, mixBlendMode: 'screen' }} />
        ))}
        <Kinetic text="即便是幻觉" vertical beat={beat} at={208.4} until={220} stagger={0.4} size={140} color="#fff"
          style={{ position: 'absolute', left: 130, top: 110 }} />
        <Kinetic text="也是完美的" vertical beat={beat} at={211} until={220} stagger={0.45} size={140} color="#fff"
          style={{ position: 'absolute', left: 1650, top: 110, textShadow: GLOW_PINK }} />
      </AbsoluteFill>
      <Flash color="#FFE3EE" amount={(0.95 * hit(beat, BOOM, 0.14) + 0.45 * hit(beat, AI_AT, 0.15)) * out} />
    </AbsoluteFill>
  );
};

export const S3_SCENES: Record<string, React.FC> = { s3a: S3a, s3b: S3b, s3c: S3c, s3d: S3d, s3e: S3e, s3f: S3f, s3g: S3g };
