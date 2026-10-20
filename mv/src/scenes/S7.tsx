// S7 bridge (beats 419-456): the quietest part of the film, grey to near black.
// A small heart lifts a whale out of the S2 void, the lights go out, the real her sits sad behind the screen,
// her answer to a fan slowly turns from a grey "hallucination" to white, and one star is left.
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { S7_ASK, S7_COPY, S7_LIE, S7_Q } from '../data/copy_S7';
import { clamp01, easeInOut, easeOut, hit, popIn, prog } from '../lib/anim';
import { Avatar, UserBubble } from '../lib/chat';
import { StarFlare } from '../lib/deco';
import { F, preloadGlyphs } from '../lib/fonts';
import { BigHeart } from '../lib/heart';
import { useSection } from '../lib/section';
import { Whale } from '../lib/whale';
import { DUSK, Disclaimer, Mirror, Motes, VoidBG } from './S2_void';

preloadGlyphs(S7_COPY + '被谁爱过的感觉爱过谁的心情我都不曾有这样的我说出的谎总有一天会成为真实我如此坚信');

const mixHex = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
};

/** quiet vertical lyric: each character blurs into focus at its own (syncopated) beat */
const Whisper: React.FC<{
  cols: { text: string; size: number; color: string; at: number[]; top?: number }[];
  beat: number;
  until: number;
  style?: React.CSSProperties;
  glow?: string;
}> = ({ cols, beat, until, style, glow }) => {
  const out = 1 - prog(beat, until - 0.6, 0.6);
  if (out <= 0) return null;
  return (
    <div style={{ position: 'absolute', display: 'flex', flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 22, opacity: out, ...style }}>
      {cols.map((c, ci) => (
        <div key={ci} style={{ display: 'flex', flexDirection: 'column', marginTop: c.top ?? 0 }}>
          {[...c.text].map((ch, i) => {
            const p = easeOut(beat, c.at[i] ?? c.at[c.at.length - 1], 0.9);
            return (
              <span key={i} style={{
                fontFamily: F.serif, fontWeight: 700, fontSize: c.size, lineHeight: 1.12, color: c.color, opacity: p,
                filter: `blur(${(1 - p) * 12}px)`, transform: `translateY(${(1 - p) * -14}px)`, textShadow: glow,
              }}>{ch}</span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/* ───────── s7a 419-427 「被谁爱过的感觉」: a small heart lifts a whale off the dusk-grey floor; the lights go out ───────── */

const A_FLOOR = 900;
const LIGHTS_OUT = [425, 425.5, 426]; // three measured hits, the room dims in steps

/** heart balloon with a whale hanging off its string; (x, y) = heart centre */
const Balloon: React.FC<{ x: number; y: number; t: number; thump: number; spout: number; rot: number }> = ({ x, y, t, thump, spout, rot }) => {
  const hs = 200;
  const tipY = y + 0.435 * hs;
  const len = 170;
  const sway = 10 * Math.sin(t * 1.3 + 1);
  const ex = x + sway, ey = tipY + len;
  const ws = 190, k = ws * 0.003589; // Whale renders its 240x190 viewBox at this scale
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: `rotate(${rot}deg)`, transformOrigin: `${x}px ${y}px` }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <path d={`M${x} ${tipY + 6} C${x - 14} ${tipY + len * 0.35} ${ex + 16} ${tipY + len * 0.65} ${ex} ${ey}`} fill="none" stroke="#3D3D48" strokeWidth={3} />
        <path d={`M${x - 7} ${tipY + 10} L${x + 7} ${tipY + 10} L${x} ${tipY - 2} Z`} fill="#B8183A" />
      </svg>
      <div style={{ position: 'absolute', left: ex - ws / 2, top: ey - (18 + 40) * k + 4, transform: `rotate(${-rot * 1.6 + 4 * Math.sin(t * 1.3)}deg)`, transformOrigin: '50% 0' }}>
        <Whale size={ws} color="#9CCBFF" eye="closed" spout={spout} wag={8 * Math.sin(t * 2.2)} />
      </div>
      <div style={{ position: 'absolute', left: x - hs / 2, top: y - hs * 0.475, transform: `scale(${1 + 0.1 * thump})` }}>
        <BigHeart size={hs} color="#E0405C" shade="#AC1E3C" />
      </div>
    </div>
  );
};

export const S7a: React.FC = () => {
  const { beat, f } = useSection();
  const t = f / 30;
  const rise = easeInOut(beat, 419, 9.5);
  const x = 1180 + 70 * rise;
  const y = 548 - 220 * rise;
  const thump = LIGHTS_OUT.reduce((s, a) => s + hit(beat, a, 0.2), 0) + 0.6 * hit(beat, 424, 0.2);
  const spout = Math.sin(Math.PI * prog(beat, 420.25, 1.6)) * 0.75;
  const rot = 2.5 * Math.sin(t * 0.9);
  const dim = 0.32 * easeOut(beat, 425, 0.12) + 0.26 * easeOut(beat, 425.5, 0.12) + 0.3 * easeOut(beat, 426, 0.15) + 0.07 * prog(beat, 426.3, 0.7);
  const tilt = 50 * easeInOut(beat, 419, 8);
  const balloon = <Balloon x={x} y={y} t={t} thump={thump} spout={spout} rot={rot} />;
  const hy = y - 0.475 * 200;
  return (
    <AbsoluteFill style={{ background: '#8E8E98', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translateY(${tilt}px)` }}>
        <VoidBG horizon={640} tone={DUSK} tiles={0.16} />
        <div style={{
          position: 'absolute', left: x - 120 + 10 * Math.sin(t * 1.3 + 1), top: A_FLOOR - 14, width: 240, height: 28, borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(30,30,45,.3), rgba(30,30,45,0))', opacity: 1 - 0.7 * rise,
        }} />
        <Mirror axis={A_FLOOR} opacity={0.28}>{balloon}</Mirror>
        <Motes t={t} n={26} fall opacity={0.5} seed={7} />
      </AbsoluteFill>
      <Whisper beat={beat} until={427.4} style={{ left: 170, top: 150 }} cols={[
        { text: '被谁', size: 78, color: '#E9E9EE', at: [419.1, 419.6] },
        { text: '爱过的感觉', size: 118, color: '#FFFFFF', at: [420.25, 420.75, 421.25, 422, 423], top: 70 },
      ]} />
      {/* the lights go out in three steps; only the heart keeps glowing */}
      <AbsoluteFill style={{ background: '#07070C', opacity: dim }} />
      {dim > 0.01 && (
        <AbsoluteFill style={{ transform: `translateY(${tilt}px)`, opacity: Math.min(1, dim * 1.4) }}>
          <div style={{
            position: 'absolute', left: x - 260, top: y - 260, width: 520, height: 520, borderRadius: '50%',
            background: `radial-gradient(closest-side, rgba(255,80,110,${0.35 + 0.25 * thump}), rgba(255,80,110,0))`,
            transform: `rotate(${rot}deg)`, transformOrigin: `260px 260px`,
          }} />
          <div style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: `rotate(${rot}deg)`, transformOrigin: `${x}px ${y}px` }}>
            <div style={{ position: 'absolute', left: x - 100, top: hy, transform: `scale(${1 + 0.1 * thump})` }}>
              <BigHeart size={200} color="#E0405C" shade="#AC1E3C" />
            </div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/* ───────── s7b 427-437 「爱过谁的心情 我都不曾有」: dark, the real her at the desk, lit only by the screen we look out of ───────── */

const B_HITS = [427.75, 428.75, 430.25, 430.75, 431.75, 434.5, 436];
const B_FRAMES = 108;

export const S7b: React.FC = () => {
  const { beat, f } = useSection();
  const src = staticFile(`l2d/s7b_sad/${String(Math.min(B_FRAMES - 1, Math.max(0, f))).padStart(5, '0')}.png`);
  const on = easeOut(beat, 427, 1.6);
  const flick = 0.035 * Math.sin(f * 1.3) + 0.025 * Math.sin(f * 0.37 + 1);
  const bump = B_HITS.reduce((s, a) => s + hit(beat, a, 0.35), 0);
  const light = clamp01(on * (0.8 + flick + 0.18 * bump));
  const push = 1 + 0.07 * easeInOut(beat, 427, 10);
  const ask = popIn(beat, 427.75, 0.5);
  const typing = beat >= 430.25 && beat < 436.3;
  const img = { position: 'absolute' as const, left: 0, top: 0, width: 1000, height: 1000 };
  // the clip's canvas cuts the whale tail at its right edge: fade that edge into the dark
  const edge = 'linear-gradient(90deg, #000 76%, transparent 97%)';
  return (
    <AbsoluteFill style={{ background: '#04050A', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: '890px 560px' }}>
        {/* screen light bouncing off the wall behind her */}
        <div style={{
          position: 'absolute', left: 360, top: 40, width: 1100, height: 900, borderRadius: '50%', opacity: light,
          background: 'radial-gradient(closest-side, rgba(60,90,190,.28), rgba(60,90,190,0))',
        }} />
        <div style={{ position: 'absolute', left: 410, top: 70, width: 1000, height: 1000, WebkitMaskImage: edge, maskImage: edge }}>
        <Img src={src} style={{ ...img, filter: 'brightness(0.22) saturate(0.5)' }} />
        <Img src={src} style={{
          ...img, opacity: light, filter: 'brightness(0.95) saturate(0.6) contrast(1.05)',
          WebkitMaskImage: 'radial-gradient(ellipse 40% 46% at 47% 50%, #000 0%, rgba(0,0,0,.8) 45%, transparent 100%)',
          maskImage: 'radial-gradient(ellipse 40% 46% at 47% 50%, #000 0%, rgba(0,0,0,.8) 45%, transparent 100%)',
        }} />
        </div>
      </AbsoluteFill>
      {/* cool screen cast over everything */}
      <AbsoluteFill style={{ background: '#8FB0FF', mixBlendMode: 'multiply', opacity: 0.85 }} />
      {/* the glass we look through: her chat, seen mirrored from her side */}
      <div style={{ position: 'absolute', left: 230, top: 96, width: 1460, transform: 'scaleX(-1)', opacity: 0.55 * on, filter: 'blur(1.2px)' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', transform: `scale(${0.85 + 0.15 * ask})`, transformOrigin: '100% 50%', opacity: ask }}>
          <div style={{
            fontFamily: F.zh, fontWeight: 500, fontSize: 50, color: 'rgba(210,225,255,.75)', background: 'rgba(150,180,255,.13)',
            padding: '18px 34px', borderRadius: 32,
          }}>{S7_ASK}</div>
        </div>
        {typing && (
          <div style={{ display: 'flex', gap: 14, marginTop: 30, marginLeft: 10, alignItems: 'center' }}>
            <div style={{ width: 62, height: 62, borderRadius: 31, border: '3px solid rgba(150,180,255,.35)' }} />
            {[0, 1, 2].map((k) => (
              <div key={k} style={{
                width: 16, height: 16, borderRadius: 8, background: 'rgba(190,210,255,.7)',
                opacity: 0.35 + 0.65 * Math.max(0, Math.sin((beat * 2 - k * 0.3) * Math.PI)),
              }} />
            ))}
          </div>
        )}
      </div>
      <div style={{
        position: 'absolute', inset: 0, mixBlendMode: 'screen', opacity: 0.35,
        background: 'repeating-linear-gradient(0deg, rgba(110,140,220,.10) 0 2px, rgba(0,0,0,0) 2px 6px)',
      }} />
      {/* the screen's rounded edge */}
      <AbsoluteFill style={{ borderRadius: 70, boxShadow: 'inset 0 0 0 26px #020206, inset 0 0 140px 70px rgba(2,2,8,.85)' }} />
      <Whisper beat={beat} until={437.2} style={{ right: 130, top: 330 }} glow="0 0 18px rgba(120,150,255,.45)" cols={[
        { text: '爱过谁的心情', size: 70, color: '#AFB9DA', at: [427.3, 427.75, 428.75, 429.5, 430.25, 430.75] },
        { text: '我都不曾有', size: 70, color: '#7F8AB0', at: [431.75, 432.5, 433.25, 434, 434.5], top: 140 },
      ]} />
    </AbsoluteFill>
  );
};

/* ───────── s7c 437-453 「这样的我说出的谎 / 总有一天会成为真实」: her answer turns from grey to white ───────── */

const C_HITS = [444.5, 445.5, 447.5, 449.25, 450.25, 451.25, 451.75];
/** where the answer sits (and where s7d's star lights up) */
export const STAR = { x: 960, y: 470 };

export const S7c: React.FC = () => {
  const { beat, f } = useSection();
  const t = f / 30;
  const W = easeInOut(beat, 443.6, 8.4); // grey -> white
  const hits = C_HITS.reduce((s, a) => s + hit(beat, a, 0.3), 0);
  const push = 1 + 0.16 * easeInOut(beat, 437, 15.5);
  const collapse = prog(beat, 452.1, 0.85) ** 2.2;
  const enter = easeOut(beat, 437, 1.5);
  const q = popIn(beat, 437, 0.5);
  const chars = [...S7_LIE];
  const typed = Math.min(chars.length, Math.max(0, Math.floor((beat - 437.8) / 0.24) + 1));
  const glowA = 0.5 * W + 0.25 * hits * W;
  const bubbleW = 900;
  return (
    <AbsoluteFill style={{ background: '#06070C', overflow: 'hidden' }}>
      {/* the answer's light filling the dark */}
      <div style={{
        position: 'absolute', left: STAR.x - 900, top: STAR.y - 600, width: 1800, height: 1200, borderRadius: '50%',
        background: `radial-gradient(closest-side, rgba(120,145,230,${0.05 + 0.2 * W + 0.06 * hits}), rgba(120,145,230,0))`, opacity: 1 - collapse,
      }} />
      <AbsoluteFill style={{
        transform: `translateY(${(1 - enter) * 30}px) scale(${push * (1 - 0.97 * collapse)})`, transformOrigin: `${STAR.x}px ${STAR.y}px`,
        opacity: enter * (1 - collapse * 0.6),
      }}>
        {/* the fan's question */}
        <div style={{ position: 'absolute', right: 1920 - 1400, top: 250, transform: `scale(${q})`, transformOrigin: '100% 100%', opacity: 0.85 * (1 - 0.5 * W) }}>
          <UserBubble text={S7_Q} size={42} style={{ background: '#1E2232', color: '#9FA6BD' }} />
        </div>
        <div style={{ position: 'absolute', left: STAR.x - bubbleW / 2 - 104, top: STAR.y - 58, opacity: 0.9 }}>
          <Avatar size={84} />
        </div>
        {/* the answer bubble */}
        <div style={{
          position: 'absolute', left: STAR.x - bubbleW / 2, top: STAR.y - 70, width: bubbleW, height: 140, boxSizing: 'border-box',
          borderRadius: 40, background: mixHex('#12141D', '#1A1E2E', W), border: `2px solid ${mixHex('#262A39', '#C9D4FF', W * 0.6)}`,
          boxShadow: `0 0 ${40 + 60 * W}px rgba(150,175,255,${glowA * 0.5})`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ position: 'relative', display: 'flex', fontFamily: F.zh, fontWeight: 500, fontSize: 64, letterSpacing: 2 }}>
            {chars.map((ch, i) => {
              const w = clamp01(W * 1.5 - (i / chars.length) * 0.5);
              return (
                <span key={i} style={{
                  color: mixHex('#5E6374', '#FFFFFF', w), visibility: i < typed ? 'visible' : 'hidden',
                  textShadow: w > 0.05 ? `0 0 ${10 + 16 * w}px rgba(170,195,255,${0.7 * w * (0.7 + 0.3 * Math.min(1, hits))})` : undefined,
                }}>{ch}</span>
              );
            })}
            {/* the hallucination squiggle under the text, fading as it becomes true */}
            {typed > 0 && (
              <svg width={chars.length * 66} height={16} style={{ position: 'absolute', left: 0, bottom: -16, opacity: 1 - W }}>
                <path d={Array.from({ length: Math.ceil((typed * 66) / 12) }, (_, i) => `${i ? 'L' : 'M'}${i * 12} ${i % 2 ? 12 : 4}`).join(' ')}
                  fill="none" stroke="#7B8092" strokeWidth={2.5} strokeDasharray="6 5" />
              </svg>
            )}
            {beat < 440 && typed < chars.length && Math.floor(beat * 3) % 2 === 0 && (
              <span style={{ width: 4, height: 64, background: '#5E6374', marginLeft: 6 }} />
            )}
          </div>
        </div>
        <Disclaimer size={28} color="#5E6374" style={{ position: 'absolute', left: STAR.x - bubbleW / 2 + 30, top: STAR.y + 96, opacity: prog(beat, 440, 1) }} />
      </AbsoluteFill>
      {/* the point the whole answer collapses into (s7d's star) */}
      {collapse > 0 && (
        <div style={{
          position: 'absolute', left: STAR.x - 40, top: STAR.y - 40, width: 80, height: 80, borderRadius: '50%',
          background: 'radial-gradient(closest-side, #fff, rgba(200,215,255,.6) 35%, rgba(160,185,255,0))', opacity: collapse,
          transform: `scale(${0.4 + 0.6 * collapse})`,
        }} />
      )}
      <Whisper beat={beat} until={444.4} style={{ left: 150, top: 200 }} cols={[
        { text: '这样的我', size: 80, color: '#7B8092', at: [437, 437.5, 438.25, 439] },
        { text: '说出的谎', size: 104, color: '#9AA0B2', at: [439.75, 440.5, 441.75, 442.25], top: 80 },
      ]} />
      <Whisper beat={beat} until={452.6} style={{ right: 140, top: 160 }} glow={`0 0 22px rgba(170,195,255,${0.25 + 0.4 * W})`} cols={[
        { text: '总有一天', size: 80, color: mixHex('#8A90A3', '#E8ECF8', W), at: [444, 444.5, 445.5, 446.25] },
        { text: '会成为真实', size: 104, color: mixHex('#9AA0B2', '#FFFFFF', W), at: [447.5, 448.25, 449.25, 450.25, 451.25], top: 80 },
      ]} />
      <div style={{ position: 'absolute', inset: 0, background: `rgba(255,255,255,${0.04 * hits * W})` }} />
    </AbsoluteFill>
  );
};

/* ───────── s7d 453-456 「我如此坚信」: one star; 455.x is the darkest, stillest frame before S8's hit ───────── */

export const S7d: React.FC = () => {
  const { beat } = useSection();
  const on = easeOut(beat, 453, 1);
  const size = 18 + 82 * on;
  const still = prog(beat, 454.6, 0.6);
  return (
    <AbsoluteFill style={{ background: '#030307', overflow: 'hidden' }}>
      <AbsoluteFill style={{ background: '#000', opacity: still }} />
      <div style={{
        position: 'absolute', left: STAR.x - 260, top: STAR.y - 260, width: 520, height: 520, borderRadius: '50%',
        background: `radial-gradient(closest-side, rgba(150,175,255,${0.22 * on}), rgba(150,175,255,0))`,
      }} />
      <StarFlare x={STAR.x} y={STAR.y} size={size} rot={0} glow={1.2} />
      <Whisper beat={beat} until={455.1} style={{ left: STAR.x + 120, top: STAR.y - 40 }} glow="0 0 16px rgba(170,195,255,.5)" cols={[
        { text: '我如此坚信', size: 58, color: '#C9D1EA', at: [453.3, 453.6, 453.9, 454.2, 454.5] },
      ]} />
    </AbsoluteFill>
  );
};

export const S7_SCENES: Record<string, React.FC> = { s7a: S7a, s7b: S7b, s7c: S7c, s7d: S7d };
