// S0 intro (beats 0-45): the magenta world. She floods the hot-search list, hides her parameter count,
// goofs adorably, glitches into a hallucination, and the title logo splashes together out of ink.
import { AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile } from 'remotion';
import { UI } from '../data/copy';
import {
  HotBadge, S0_ASK, S0_CLASSIFIED, S0_COPY, S0_GOOF, S0_GUESS, S0_HOT, S0_HOT_HEAD, S0_HOT_TAB, S0_PARAM, S0_SEARCH,
} from '../data/copy_S0';
import { clamp01, easeInOut, easeOut, hit, popIn, prog, rnd, shake } from '../lib/anim';
import { pulse } from '../lib/beat';
import { Avatar, UIC, UserBubble } from '../lib/chat';
import { Stamp, StarFlare, Still, Sunburst, WhalePattern } from '../lib/deco';
import { F, preloadGlyphs } from '../lib/fonts';
import { Flash } from '../lib/fx';
import { L2D } from '../lib/L2D';
import { C } from '../lib/palette';
import { useSection } from '../lib/section';
import { Kinetic } from '../lib/type';
import { heart, Whale } from '../lib/whale';
import { InkLogo, logoStage, makeSplash, SplashLayer } from './S0_logo';

preloadGlyphs(S0_COPY + UI.disclaimer + '⚠');

const NAVY = '#1B2150';
const easeIn = Easing.in(Easing.cubic);

/* ───────── s0a 0-9: hot search. A search for "DeepSeek" (1-beat open) → she slides in, the list floods ───────── */

const BADGE: Record<HotBadge, string> = { 热: '#FF8A1F', 爆: '#C8102E', 新: '#FF3D6E' };
const RANK = ['#F23B3B', '#FF7A2F', '#FFAD1F'];

const Magnifier: React.FC<{ size: number; color?: string }> = ({ size, color = NAVY }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle cx={17} cy={17} r={11} fill="none" stroke={color} strokeWidth={5} />
    <path d="M25 25 L35 35" stroke={color} strokeWidth={6} strokeLinecap="round" />
  </svg>
);

const HotRow: React.FC<{ rank: number; text: string; badge: HotBadge; heat: string; size?: number; card?: boolean; style?: React.CSSProperties }> = ({
  rank, text, badge, heat, size = 40, card = false, style,
}) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: size * 0.45, fontFamily: F.zh, whiteSpace: 'nowrap',
    ...(card ? { background: '#fff', borderRadius: size * 0.4, padding: `${size * 0.3}px ${size * 0.5}px`, boxShadow: '0 8px 18px rgba(80,10,50,.22)' } : {}),
    ...style,
  }}>
    <span style={{ width: size * 1.1, textAlign: 'center', fontWeight: 700, fontStyle: 'italic', fontSize: size * 1.05, color: RANK[rank - 1] ?? '#A0A4AC' }}>{rank}</span>
    <span style={{ fontWeight: 500, fontSize: size, color: UIC.ink }}>{text}</span>
    <span style={{ fontWeight: 400, fontSize: size * 0.62, color: '#A0A4AC' }}>{heat}</span>
    <span style={{
      width: size * 1.05, height: size * 1.05, borderRadius: size * 0.22, background: BADGE[badge], color: '#fff', fontWeight: 700,
      fontSize: size * 0.72, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>{badge}</span>
  </div>
);

const S0A_HITS = [4, 5, 6];
const S0A_STICKERS: [number, number, number, number, string, string][] = [
  // beat, x, y, rotation, eye, colour
  [1, 1770, 200, 12, 'star', '#9CCBFF'],
  [2, 960, 800, -10, 'heart', '#FFB3CF'],
  [3, 1830, 640, 8, 'dot', '#FFE27A'],
  [4, 985, 150, -14, 'closed', '#B9A6FF'],
  [5, 150, 830, 10, 'star', '#9CE6C8'],
  [6, 1500, 860, -6, 'heart', '#9CCBFF'],
  [7, 640, 260, 14, 'dot', '#FFB3CF'],
  [8, 1240, 140, -8, 'star', '#FFE27A'],
];
// g1_hands_cheeks.png is 1536x1024; star pupils at about (632, 438) and (830, 392)
const G1 = { w: 1600, x: 1350, y: 600, eyes: [[632, 438], [830, 392]] };
const PANEL = { x: 70, y: 250, w: 760, rowH: 82, bottom: 900 };

export const S0a: React.FC = () => {
  const { beat, f } = useSection();
  const t = f / 30;
  // pre-roll (frames 0-15): "DeepSeek" typed into a search bar, Enter on beat 1
  const typed = Math.max(0, Math.min(S0_SEARCH.length, Math.floor((beat + 0.25) / 0.13)));
  const move = easeOut(beat, 1, 0.35);
  const barW = interpolate(move, [0, 1], [1040, PANEL.w]);
  const barX = interpolate(move, [0, 1], [960 - 520, PANEL.x]);
  const barY = interpolate(move, [0, 1], [480, PANEL.y]);
  const preZoom = beat < 1 ? 1 + 0.06 * prog(beat, -0.4, 1.4) : 1;
  // she slides in from the right
  const slide = Easing.out(Easing.back(1.3))(prog(beat, 1, 0.6));
  const gs = G1.w / 1536;
  const gx = G1.x + (1 - slide) * 1300;
  const gy = G1.y + 6 * Math.sin(t * 3);
  const lastHit = S0A_HITS.reduce((m, a) => (beat >= a ? a : m), -10);
  const [sx, sy] = shake(f, hit(beat, lastHit, 0.22) * 0.9, 1);
  const bump = 1 + 0.02 * pulse(f, 0.2) + 0.03 * hit(beat, lastHit, 0.2);
  // the list scrolls up slowly and jumps a row on each hit
  const jumps = S0A_HITS.reduce((s, a) => s + easeOut(beat, a, 0.3), 0);
  const scroll = Math.max(0, beat - 2.5) * 20 + jumps * PANEL.rowH;
  const rows = S0_HOT.concat(S0_HOT);
  const listH = PANEL.bottom - PANEL.y - 96;
  return (
    <AbsoluteFill style={{ background: C.hot, overflow: 'hidden' }}>
      <WhalePattern color="#EE6CA3" offset={f * 2.2 + 40} size={110} gap={230} />
      <AbsoluteFill style={{ transform: `translate(${sx}px,${sy}px) scale(${preZoom})` }}>
        {/* hot-search panel behind her */}
        {beat >= 1 && (
          <div style={{
            position: 'absolute', left: PANEL.x, top: PANEL.y + 96, width: PANEL.w, height: listH * easeOut(beat, 1, 0.5), overflow: 'hidden',
            background: '#fff', borderRadius: '0 0 30px 30px', boxShadow: '0 24px 40px rgba(80,10,50,.25)',
          }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 10 - (scroll % (S0_HOT.length * PANEL.rowH)) }}>
              {rows.map(([text, badge, heat], i) => {
                const n = (i % S0_HOT.length) + 1;
                const p = popIn(beat, 1.1 + i * 0.1, 0.3);
                return (
                  <div key={i} style={{ height: PANEL.rowH, display: 'flex', alignItems: 'center', borderBottom: `2px solid ${UIC.line}`, margin: '0 24px', opacity: Math.min(1, p * 2) }}>
                    <div style={{ transform: `translateX(${(1 - p) * -60}px)` }}>
                      <HotRow rank={n} text={text} badge={badge} heat={heat} size={34} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* the search bar, centred in the open, then docked as the panel header */}
        <div style={{
          position: 'absolute', left: barX, top: barY, width: barW, height: 96 + 24 * (1 - move), background: '#fff',
          borderRadius: beat >= 1 ? `30px 30px ${30 * (1 - move)}px ${30 * (1 - move)}px` : 60, display: 'flex', alignItems: 'center',
          gap: 18, padding: '0 30px', boxSizing: 'border-box', boxShadow: '0 20px 40px rgba(80,10,50,.25)',
          transform: `scale(${1 + 0.05 * hit(beat, 1, 0.15)})`,
        }}>
          <Magnifier size={54 - 10 * move} />
          <span style={{ fontFamily: F.zh, fontWeight: 700, fontSize: 60 - 16 * move, color: UIC.ink }}>
            {S0_SEARCH.slice(0, beat >= 1 ? S0_SEARCH.length : typed)}
          </span>
          {beat < 1 && Math.floor(f / 4) % 2 === 0 && <span style={{ width: 5, height: 62, background: C.blue, marginLeft: -12 }} />}
          <div style={{ flex: 1 }} />
          <span style={{
            fontFamily: F.zh, fontWeight: 700, fontSize: 30 - 4 * move, color: '#fff', background: '#F23B3B', borderRadius: 999, padding: '6px 18px',
          }}>{S0_HOT_HEAD}</span>
          {beat >= 1 && <span style={{ fontFamily: F.zh, fontWeight: 500, fontSize: 24, color: UIC.sub, opacity: move }}>{S0_HOT_TAB}</span>}
        </div>
        {/* G1 slides in from the right */}
        {beat >= 1 && (
          <div style={{ position: 'absolute', inset: 0, transform: `scale(${bump})`, transformOrigin: `${gx}px ${gy + 300}px` }}>
            <Still src="g1_hands_cheeks" x={gx} y={gy} w={G1.w} />
            {G1.eyes.map(([ex, ey], i) => (
              <StarFlare key={i} x={gx - G1.w / 2 + ex * gs} y={gy - (1024 * gs) / 2 + ey * gs}
                size={50 + 90 * hit(beat, lastHit, 0.3) + 25 * pulse(f, 0.25)} rot={beat * 25 + i * 30} />
            ))}
          </div>
        )}
        {/* a whale sticker pops on every beat */}
        {S0A_STICKERS.map(([at, x, y, r, eye, col], i) => {
          const p = popIn(beat, at, 0.35);
          if (p <= 0) return null;
          const big = S0A_HITS.includes(at) ? 1.15 : 1;
          return (
            <div key={i} style={{
              position: 'absolute', left: x, top: y,
              transform: `translate(-50%,-50%) scale(${p * big * (1 + 0.05 * pulse(f, 0.2))}) rotate(${r + 5 * Math.sin(beat * Math.PI + i)}deg)`,
            }}>
              <Whale size={190} sticker eye={eye as never} color={col} spout={i % 3 === 0 ? 0.7 : 0} flip={x < 960} />
            </div>
          );
        })}
        <Flood beat={beat} />
      </AbsoluteFill>
      <Kinetic text="用无敌的回答" beat={beat} at={1} until={4} stagger={0.3} size={124} color="#fff" stroke={NAVY} strokeWidth={11}
        style={{ position: 'absolute', left: 64, top: 64 }} />
      <Kinetic text="刷屏了热搜" beat={beat} at={4} until={9} stagger={0.5} mode="stamp" size={150} color="#fff" stroke={NAVY} strokeWidth={12}
        style={{ position: 'absolute', left: 64, top: 52 }} />
      <Flash amount={0.85 * hit(beat, 1, 0.14) + 0.25 * hit(beat, 6, 0.12)} />
    </AbsoluteFill>
  );
};

/** 刷屏: from beat 6 hot-search cards stream up over the whole frame, denser and denser until the cut */
const Flood: React.FC<{ beat: number }> = ({ beat }) => {
  if (beat < 5.9) return null;
  const cols = [-60, 330, 720, 1110, 1500];
  return (
    <>
      {Array.from({ length: 64 }, (_, i) => {
        const at = 5.9 + i * 0.047;
        if (beat < at) return null;
        const age = beat - at;
        const c = i % cols.length;
        const y = 890 + rnd(i, 2) * 40 - age * (420 + rnd(i, 3) * 160);
        if (y < -140) return null;
        const [text, badge, heat] = S0_HOT[Math.floor(rnd(i, 4) * S0_HOT.length)];
        const p = popIn(beat, at, 0.25);
        return (
          <div key={i} style={{
            position: 'absolute', left: cols[c] + rnd(i, 5) * 80, top: y, opacity: clamp01((900 - y) / 60),
            transform: `scale(${(0.82 + rnd(i, 6) * 0.3) * p}) rotate(${(rnd(i, 7) - 0.5) * 8}deg)`, transformOrigin: '0 50%',
          }}>
            <HotRow rank={1 + Math.floor(rnd(i, 8) * 9)} text={text} badge={badge} heat={heat} size={38} card />
          </div>
        );
      })}
    </>
  );
};

/* ───────── s0b 9-17: black | white. Everyone guesses; the giant ???B is redacted bar by bar ───────── */

const S0B_BARS = [12, 13, 14];
const S0B_STAMP = 15;
const GLYPH_W = 350;

export const S0b: React.FC = () => {
  const { beat, f } = useSection();
  const open = easeOut(beat, 9, 0.3);
  const swapped = beat >= S0B_STAMP;
  const hits = [9, ...S0B_BARS, S0B_STAMP];
  const lastHit = hits.reduce((m, a) => (beat >= a ? a : m), 9);
  const [sx, sy] = shake(f, hit(beat, lastHit, 0.2) * (lastHit === S0B_STAMP ? 1.4 : 0.8), 2);
  const zoom = 1 + 0.07 * easeInOut(beat, 9, 8) + 0.025 * hit(beat, lastHit, 0.2);
  const glyphs = [...S0_PARAM];
  const left0 = 960 - (glyphs.length * GLYPH_W) / 2;
  const q = Math.floor(beat * 4);
  return (
    <AbsoluteFill style={{ background: swapped ? '#F2F2F2' : '#101012', overflow: 'hidden' }}>
      {/* the other half wipes in from the right on beat 9; the halves swap on 15 */}
      <div style={{
        position: 'absolute', top: 0, width: 960, height: 1080, left: 960 + (1 - open) * 960,
        background: swapped ? '#101012' : '#F2F2F2',
      }} />
      {/* everything white in a difference layer: it inverts across the split */}
      <AbsoluteFill style={{ mixBlendMode: 'difference', transform: `translate(${sx}px,${sy}px) scale(${zoom})` }}>
        {glyphs.map((ch, i) => {
          const isQ = ch === '?';
          // the question marks flicker to digits as if about to give the answer away
          const shown = isQ && rnd(q, i + 3) > 0.62 ? String(Math.floor(rnd(q, i + 11) * 10)) : ch;
          const p = popIn(beat, 9 + i * 0.12, 0.35);
          return (
            <div key={i} style={{
              position: 'absolute', left: left0 + i * GLYPH_W, top: 235, width: GLYPH_W, height: 480, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontFamily: F.heavy, fontSize: 430, lineHeight: 1, color: '#fff',
              transform: `scale(${p * (ch === 'B' ? 1 + 0.06 * hit(beat, lastHit, 0.2) : 1)})`,
            }}>{shown}</div>
          );
        })}
        {/* redaction bars slam across the digits, one per hit */}
        {S0B_BARS.map((a, k) => {
          if (beat < a) return null;
          const w = easeOut(beat, a, 0.12);
          return (
            <div key={k} style={{
              position: 'absolute', left: left0 - 20, top: 334 + k * 116, width: (3 * GLYPH_W + 20) * w, height: 160, background: '#fff',
              transform: `rotate(${[-1.2, 0.9, -0.5][k]}deg)`, transformOrigin: '0 50%',
            }} />
          );
        })}
        {/* everybody's guesses, swept away when the bars land */}
        {S0_GUESS.map((g, i) => {
          const at = 9.5 + i * 0.5;
          const p = popIn(beat, at, 0.3) * (1 - easeOut(beat, 12, 0.2));
          if (p <= 0) return null;
          const [x, y, r] = [[230, 270, -8], [1690, 260, 7], [250, 820, 6], [1680, 820, -6], [960, 230, 3]][i];
          return (
            <div key={i} style={{
              position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${p}) rotate(${r}deg)`, fontFamily: F.round,
              fontWeight: 800, fontSize: 58, color: '#fff', whiteSpace: 'nowrap', border: '5px solid #fff', borderRadius: 999, padding: '4px 30px',
            }}>{g}</div>
          );
        })}
        <Kinetic text="谁都想知道" beat={beat} at={9} until={17} stagger={0.32} size={92} color="#fff"
          style={{ position: 'absolute', left: 0, width: 1920, top: 70 }} />
        <Kinetic text="她参数的秘密" beat={beat} at={12} until={17} stagger={0.5} size={112} color="#fff"
          style={{ position: 'absolute', left: 0, width: 1920, top: 800 }} />
      </AbsoluteFill>
      {beat >= S0B_STAMP && (
        <div style={{
          position: 'absolute', left: 1460, top: 560,
          transform: `translate(-50%,-50%) scale(${interpolate(popIn(beat, S0B_STAMP, 0.3), [0, 1], [2.6, 1])}) rotate(-12deg)`,
        }}>
          <Stamp text={S0_CLASSIFIED} size={300} id="s0b_stamp" />
        </div>
      )}
      <Flash amount={0.5 * hit(beat, S0B_STAMP, 0.12)} />
    </AbsoluteFill>
  );
};

/* ───────── s0c 17-25: "9.11 和 9.9 哪个大？" — the blank stare in a speech bubble, then she claims the place ───────── */

const S0C_PLANT = 21;
const BUB = { x: 90, y: 225, w: 820, h: 640 };

const Flag: React.FC<{ size: number; color?: string }> = ({ size, color = C.hot }) => (
  <svg width={size * 0.7} height={size} viewBox="0 0 70 100" style={{ overflow: 'visible' }}>
    <path d="M8 4 L8 100" stroke={NAVY} strokeWidth={6} strokeLinecap="round" />
    <path d="M10 6 L66 22 L10 40 Z" fill={color} stroke={NAVY} strokeWidth={4} strokeLinejoin="round" />
    <circle cx={8} cy={4} r={5} fill={C.yellow} stroke={NAVY} strokeWidth={3} />
    <g transform="translate(17 13) scale(0.15)">
      <Whale size={220} silhouette color="#fff" eye="none" />
    </g>
  </svg>
);

const BubbleShape: React.FC<{ w: number; h: number }> = ({ w, h }) => (
  <svg width={w + 40} height={h + 120} style={{ position: 'absolute', left: -20, top: -20, overflow: 'visible' }}>
    <g transform="translate(20 20)">
      <path d={`M90 0 H${w - 90} Q${w} 0 ${w} 90 V${h - 90} Q${w} ${h} ${w - 90} ${h} H260 L130 ${h + 80} L175 ${h} H90 Q0 ${h} 0 ${h - 90} V90 Q0 0 90 0 Z`}
        fill={NAVY} transform="translate(14 16)" />
      <path d={`M90 0 H${w - 90} Q${w} 0 ${w} 90 V${h - 90} Q${w} ${h} ${w - 90} ${h} H260 L130 ${h + 80} L175 ${h} H90 Q0 ${h} 0 ${h - 90} V90 Q0 0 90 0 Z`}
        fill="#fff" stroke={NAVY} strokeWidth={9} strokeLinejoin="round" />
    </g>
  </svg>
);

export const S0c: React.FC = () => {
  const { beat, f, lf } = useSection();
  const t = f / 30;
  const bub = popIn(beat, 17, 0.45);
  const squish = hit(beat, S0C_PLANT, 0.22);
  const bob = 1 + 0.015 * pulse(f, 0.2);
  const answer = popIn(beat, S0C_PLANT, 0.35);
  return (
    <AbsoluteFill style={{ background: '#F9C8DC', overflow: 'hidden' }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id="s0c_dots" width={56} height={56} patternUnits="userSpaceOnUse" patternTransform={`translate(${f * 1.2} ${f * 0.8})`}>
            <circle cx={14} cy={14} r={6} fill="#FCE0EB" />
            <circle cx={42} cy={42} r={6} fill="#FCE0EB" />
          </pattern>
        </defs>
        <rect width={1920} height={1080} fill="url(#s0c_dots)" />
      </svg>
      {/* big soft question marks drifting in the back */}
      {[[1500, 120, -14, 420], [1180, 640, 12, 360], [60, 560, 8, 300]].map(([x, y, r, s], i) => (
        <div key={i} style={{
          position: 'absolute', left: x, top: y + Math.sin(t * 1.5 + i) * 14, fontFamily: F.heavy, fontSize: s, lineHeight: 1, color: '#F6B3CE',
          transform: `rotate(${r + Math.sin(t + i) * 4}deg) scale(${popIn(beat, 17 + i * 0.4, 0.5)})`,
        }}>?</div>
      ))}
      {/* the speech bubble with the blank stare (Live2D, ? pops on 19) */}
      <div style={{
        position: 'absolute', left: BUB.x, top: BUB.y, width: BUB.w, height: BUB.h, transformOrigin: '20% 110%',
        transform: `scale(${bub * bob * (1 + 0.04 * squish)}, ${bub * bob * (1 - 0.05 * squish)}) rotate(${(1 - bub) * -8}deg)`,
      }}>
        <BubbleShape w={BUB.w} h={BUB.h} />
        <div style={{ position: 'absolute', left: BUB.w / 2 - 360, top: -54, width: 720, height: 720 }}>
          <Sequence from={lf(17)} layout="none">
            <L2D clip="s0c_dumb" frames={87} style={{ width: 720, height: 720 }} />
          </Sequence>
        </div>
      </div>
      {/* flag planted on the bubble on the hit: this is her place */}
      {beat >= S0C_PLANT - 0.25 && (
        <div style={{
          position: 'absolute', left: BUB.x + 560, top: BUB.y - 186,
          transform: `translateY(${-500 * (1 - easeOut(beat, S0C_PLANT - 0.25, 0.25))}px) rotate(${14 * Math.sin((beat - S0C_PLANT) * 14) * Math.exp(-Math.max(0, beat - S0C_PLANT) / 0.5)}deg)`,
          transformOrigin: '8% 100%',
        }}>
          <Flag size={230} />
        </div>
      )}
      {/* the fan's question */}
      <div style={{
        position: 'absolute', right: 110, top: 196, transform: `scale(${popIn(beat, 17.25, 0.35)})`, transformOrigin: '100% 50%',
      }}>
        <UserBubble text={S0_ASK} size={52} style={{ boxShadow: '0 10px 24px rgba(120,20,70,.18)' }} />
        {beat >= 22 && (
          <div style={{ position: 'absolute', right: -20, top: -150, transform: `scale(${popIn(beat, 22, 0.3)}) rotate(${10 * Math.exp(-(beat - 22) / 0.4) * Math.sin((beat - 22) * 14)}deg)`, transformOrigin: '8% 100%' }}>
            <Flag size={150} color={C.yellow} />
          </div>
        )}
      </div>
      {/* question marks pile up on 19 */}
      {[[19, 940, 120, -12, 130], [19.5, 1060, 70, 10, 84], [20, 1100, 190, 18, 64]].map(([at, x, y, r, s], i) => {
        const p = popIn(beat, at, 0.3);
        return p > 0 ? (
          <div key={i} style={{
            position: 'absolute', left: x, top: y, fontFamily: F.heavy, fontSize: s, lineHeight: 1, color: '#E8344E',
            WebkitTextStroke: `8px #fff`, paintOrder: 'stroke fill', transform: `scale(${p}) rotate(${r + 6 * Math.sin(beat * 3 + i)}deg)`,
            opacity: 1 - prog(beat, 20.6, 0.4),
          }}>?</div>
        ) : null;
      })}
      <Kinetic text="就连偶尔犯傻" beat={beat} at={17} until={25} stagger={0.3} size={112} color="#fff" stroke={NAVY} strokeWidth={10}
        style={{ position: 'absolute', left: 1040, top: 330 }} />
      <Kinetic text="也是她的地盘" beat={beat} at={20} until={25} stagger={0.24} mode="stamp" size={112} color="#fff" stroke={NAVY} strokeWidth={10}
        style={{ position: 'absolute', left: 1040, top: 470 }} />
      {/* her confident (wrong) answer, with the small print */}
      {answer > 0 && (
        <div style={{
          position: 'absolute', left: 1050, top: 680, display: 'flex', gap: 18, alignItems: 'flex-start',
          transform: `scale(${answer})`, transformOrigin: '0 0',
        }}>
          <Avatar size={78} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{
              background: '#fff', borderRadius: 30, padding: '16px 30px', fontFamily: F.zh, fontWeight: 700, fontSize: 52, color: UIC.ink,
              boxShadow: '0 10px 24px rgba(120,20,70,.18)', position: 'relative',
            }}>
              {S0_GOOF}
              {beat >= 23 && (
                <div style={{ position: 'absolute', right: -128, top: -64, transform: `scale(${popIn(beat, 23, 0.3)}) rotate(${10 * Math.exp(-(beat - 23) / 0.4) * Math.sin((beat - 23) * 14)}deg)`, transformOrigin: '8% 100%' }}>
                  <Flag size={124} color="#7FA8FF" />
                </div>
              )}
            </div>
            <div style={{ fontFamily: F.zh, fontWeight: 500, fontSize: 24, color: '#9B6B82', opacity: prog(beat, 21.5, 0.4), paddingLeft: 8 }}>
              ⚠ {UI.disclaimer}
            </div>
          </div>
        </div>
      )}
      {/* little hearts rising from the bubble after the plant */}
      {Array.from({ length: 8 }, (_, i) => {
        const at = S0C_PLANT + i * 0.45;
        if (beat < at) return null;
        const age = beat - at;
        const x = BUB.x + 120 + rnd(i, 31) * (BUB.w - 240) + Math.sin(age * 3 + i) * 20;
        const y = BUB.y + 260 - age * 150;
        const s = 26 + rnd(i, 32) * 26;
        return (
          <svg key={i} width={s * 2} height={s * 2} style={{ position: 'absolute', left: x - s, top: y - s, opacity: clamp01(1.6 - age * 0.6) }}>
            <path d={heart(s, s, s * 0.8)} fill={['#FF5C93', '#fff', '#FF8FB8'][i % 3]} stroke={NAVY} strokeWidth={3} />
          </svg>
        );
      })}
      <Flash amount={0.35 * hit(beat, S0C_PLANT, 0.12)} />
    </AbsoluteFill>
  );
};

/* ───────── s0d 25-33: "完美" — then the close-up tears along a glitch, the lower half shifts to purple: 幻觉 ───────── */

// g2_closeup_closed.png is 1536x1024 (face fills it; eyes ~y 620, mouth ~y 800)
const G2 = { w: 1900, x: 930, y: 470 };
const S0D_CUT = 28;
const S0D_GLITCH = [28, 28.5, 29, 29.5, 30];
const CUT_Y = 600;
const PURPLE = '#6C44D8';

/** one copy of the shot (bg, face, 幻觉); `purple` is the hallucinating half */
const FaceLayer: React.FC<{ beat: number; purple: boolean; dx: number }> = ({ beat, purple, dx }) => (
  <AbsoluteFill style={{ isolation: 'isolate' }}>
    <AbsoluteFill style={{ background: purple ? PURPLE : C.hot }} />
    <Still src="g2_closeup_closed" x={G2.x + dx} y={G2.y} w={G2.w} />
    {purple && <AbsoluteFill style={{ background: '#9D7BFF', mixBlendMode: 'color', opacity: 0.6 }} />}
    {purple && <AbsoluteFill style={{ background: '#B9A2FF', mixBlendMode: 'multiply', opacity: 0.35 }} />}
    {/* 幻觉 with an RGB split, sliced with the picture */}
    {beat >= S0D_CUT && (
      <div style={{ position: 'absolute', left: 1150 + dx, top: 410 }}>
        {[['#21E6FF', -10, 0.9], ['#FF2E8A', 10, 0.9], ['#fff', 0, 1]].map(([col, ox, op], i) => (
          <div key={i} style={{ position: 'absolute', left: ox as number, top: 0, opacity: op as number, mixBlendMode: i < 2 ? 'screen' : undefined }}>
            <Kinetic text="幻觉" beat={beat} at={S0D_CUT} until={34} stagger={0.5} mode="stamp" size={290} color={col as string}
              stroke={i === 2 ? NAVY : undefined} strokeWidth={i === 2 ? 12 : 0} />
          </div>
        ))}
      </div>
    )}
  </AbsoluteFill>
);

export const S0d: React.FC = () => {
  const { beat, f } = useSection();
  const zoom = 1 + 0.06 * easeInOut(beat, 25, 8) + 0.02 * hit(beat, 25, 0.3);
  const cut = beat >= S0D_CUT;
  const g = S0D_GLITCH.reduce((s, a) => s + hit(beat, a, 0.16), 0) + 1.6 * prog(beat, 32.3, 0.7) ** 2;
  const shift = cut ? 56 + 60 * g : 0;
  const q = Math.floor(beat * 8);
  const bands = cut && g > 0.04 ? 6 : 0;
  const [sx, sy] = shake(f, Math.min(1, g * 0.7), 3);
  const cutY = CUT_Y + (cut ? (rnd(q, 1) - 0.5) * 40 * g : 0);
  return (
    <AbsoluteFill style={{ background: '#000', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px,${sy}px) scale(${zoom})`, transformOrigin: '930px 560px' }}>
        <AbsoluteFill style={{ clipPath: cut ? `inset(0 0 ${1080 - cutY}px 0)` : undefined }}>
          <FaceLayer beat={beat} purple={false} dx={0} />
        </AbsoluteFill>
        {cut && (
          <AbsoluteFill style={{ clipPath: `inset(${cutY}px 0 0 0)` }}>
            <FaceLayer beat={beat} purple dx={shift} />
          </AbsoluteFill>
        )}
        {/* thin torn bands jitter on every glitch hit */}
        {Array.from({ length: bands }, (_, j) => {
          const y = rnd(q, j * 3 + 1) * 1000;
          const h = 10 + rnd(q, j * 3 + 2) * 70;
          const dx = (rnd(q, j * 3 + 3) - 0.5) * 260 * Math.min(1.5, g);
          return (
            <AbsoluteFill key={j} style={{ clipPath: `inset(${y}px 0 ${Math.max(0, 1080 - y - h)}px 0)` }}>
              <FaceLayer beat={beat} purple={y > cutY} dx={dx + (y > cutY ? shift : 0)} />
            </AbsoluteFill>
          );
        })}
        {cut && <div style={{ position: 'absolute', left: 0, right: 0, top: cutY - 3, height: 6, background: '#fff', opacity: 0.85 }} />}
      </AbsoluteFill>
      {/* 完美: clean, with glints */}
      <Kinetic text="完美" beat={beat} at={25} until={33} stagger={0.4} size={210} color="#fff" stroke={NAVY} strokeWidth={12}
        style={{ position: 'absolute', left: 70, top: 60 }} />
      <Kinetic text="又会" beat={beat} at={26.5} until={33} stagger={0.4} size={104} color="#fff" stroke={NAVY} strokeWidth={9}
        style={{ position: 'absolute', left: 510, top: 160 }} />
      {[25, 26, 27].map((a, i) => (
        <StarFlare key={i} x={[90, 300, 470][i]} y={[70, 250, 90][i]} size={70 + 110 * hit(beat, a, 0.35)} rot={beat * 20 + i * 15} />
      ))}
      <Kinetic text="的你啊" beat={beat} at={29.5} until={33} stagger={0.3} size={100} color="#fff" stroke={NAVY} strokeWidth={9}
        style={{ position: 'absolute', left: 1250, top: 730 }} />
      {/* the small print glitches in and stays */}
      {beat >= 29 && (
        <div style={{
          position: 'absolute', left: 80, top: 850, fontFamily: F.zh, fontWeight: 500, fontSize: 30, color: '#6E7380', background: 'rgba(255,255,255,.92)',
          borderRadius: 999, padding: '10px 28px', transform: `translateX(${(rnd(q, 50) - 0.5) * 40 * Math.min(1, g)}px)`,
          opacity: beat < 29.5 ? (rnd(q, 51) > 0.4 ? 1 : 0.2) : 1,
        }}>
          ⚠ {[...UI.disclaimer].map((ch, i) => (
            <span key={i} style={{ color: i >= UI.disclaimer.length - 2 ? C.hot : undefined, fontWeight: i >= UI.disclaimer.length - 2 ? 700 : 500 }}>
              {beat < 29.4 && rnd(q + i, 52) > 0.5 ? '▓' : ch}
            </span>
          ))}
        </div>
      )}
      <Flash amount={0.45 * hit(beat, S0D_CUT, 0.1) + 0.3 * hit(beat, 30, 0.1)} color="#E9DDFF" />
    </AbsoluteFill>
  );
};

/* ───────── s0e 33-45: ink splats assemble「我推的 DeepSeek」on the beats; the logo flies up into S1's magenta ───────── */

const S0E_HITS = [33, 35, 36.5, 37.5, 38.5, 39.5];
const S0E_DONE = 41;
const SPLAT_BL = makeSplash(110, 1000, 240, 170, 41, 9, 8);
const SPLAT_BR = makeSplash(1800, 980, 260, 190, 57, 11, 9);

export const S0e: React.FC = () => {
  const { beat, f, lf } = useSection();
  const t = f / 30;
  const stage = logoStage(beat, S0E_HITS, 0.45);
  const lastHit = [...S0E_HITS, S0E_DONE].reduce((m, a) => (beat >= a ? a : m), 33);
  const [sx, sy] = shake(f, hit(beat, lastHit, 0.2) * (lastHit === 33 ? 1.3 : 0.6), 4);
  const fly = easeIn(prog(beat, 44, 1));
  const burst = easeOut(beat, S0E_DONE, 0.3) * (1 - easeInOut(beat, 42.5, 1.8));
  const pattern = easeInOut(beat, 41.5, 2.5);
  const splats = 1 - easeInOut(beat, 41, 1);
  const bump = 1 + 0.045 * hit(beat, lastHit, 0.22);
  return (
    <AbsoluteFill style={{ background: C.hot, overflow: 'hidden' }}>
      {burst > 0 && (
        <AbsoluteFill style={{ opacity: burst }}>
          <Sunburst cx={960} cy={500} a={C.hot} b="#EF5E9C" rays={20} rot={beat * 0.06} />
        </AbsoluteFill>
      )}
      <WhalePattern color="#EE6CA3" offset={(f - lf(45)) * 1.6} size={110} gap={230} opacity={pattern} />
      {/* stray splats hit the corners of the frame */}
      {splats > 0 && (
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, transform: `translate(${sx}px,${sy}px)` }}>
          <g opacity={splats}>
            <SplashLayer s={SPLAT_BR} p={clamp01((beat - 33) / 0.4)} color={NAVY} drift={t} />
            <SplashLayer s={SPLAT_BL} p={clamp01((beat - 35) / 0.4)} color={C.yellow} drift={t} />
          </g>
        </svg>
      )}
      <div style={{
        position: 'absolute', left: 960, top: 500,
        transform: `translate(-50%,-50%) translate(${sx}px, ${sy - 1150 * fly}px) scale(${bump * (1 - 0.45 * fly)}) rotate(${-4 * fly}deg)`,
      }}>
        <InkLogo stage={stage} width={1280} t={t} shine={prog(beat, S0E_DONE, 1.6)} />
      </div>
      <Kinetic text="就是天才般的" beat={beat} at={33} until={42} stagger={0.32} vertical size={86} color="#fff" stroke={NAVY} strokeWidth={9}
        style={{ position: 'absolute', right: 70, top: 110 }} />
      <Kinetic text="偶像大人" beat={beat} at={36.5} until={43} stagger={1} vertical mode="stamp" size={138} color="#fff" stroke={NAVY} strokeWidth={11}
        style={{ position: 'absolute', left: 70, top: 130 }} />
      <Flash amount={0.4 * hit(beat, 33, 0.12) + 0.7 * hit(beat, S0E_DONE, 0.14)} />
    </AbsoluteFill>
  );
};

export const S0_SCENES: Record<string, React.FC> = { s0a: S0a, s0b: S0b, s0c: S0c, s0d: S0d, s0e: S0e };
