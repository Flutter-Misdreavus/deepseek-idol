// S4 rap (beats 218-280): the old model versions (V1 ... Distill), jealous of the newest one.
// Official-MV rap look: black, warm-white Ming type in mixed sizes, red scribbles, liquid red smears, slice glitch,
// floods of repeated vertical text; it ends on white with the crowned No.1, scribbled over by the old versions.
import { AbsoluteFill, Img, interpolate, staticFile } from 'remotion';
import {
  S4_BASELINE, S4_BOARD, S4_CHART, S4_COPY, S4_ECHO, S4_FREEBIE, S4_FREEBIE_SUB, S4_LEGACY, S4_NOISE, S4_RANK, S4_SCORES, S4_VERSIONS,
} from '../data/copy_S4';
import { easeInOut, easeOut, hit, popIn, prog, rnd, shake } from '../lib/anim';
import { preloadGlyphs, F } from '../lib/fonts';
import { Flash } from '../lib/fx';
import { L2D } from '../lib/L2D';
import { StarFlare, Still } from '../lib/deco';
import { useSection } from '../lib/section';
import { star, Whale } from '../lib/whale';
import {
  AngerMark, arrow, BONE, chaos, Crown, Debris, easeIn, Freebie, G10_PATH, Glitch, HOT, INK, LineArt, loop, Lyric, NoiseField, PixelShades,
  RED, rgbSplit, Scribbles, Smear, SpeedLines, strike, SubShade, WINE, zig,
} from './S4_kit';
import { Crown as S5Crown } from './S5_props';

preloadGlyphs(`${S4_COPY}对对最新版最特别我们旧版本早就是赠品一等星的对照组全都归功于她那怎么可能真会装怎么可能不嫉妒我们也刷过榜这可不是玩梗所以才不原谅不完美的你我们可不认也不原谅自己比谁都强榜首除了你谁都不认`);

/** glitch tick: re-roll slices every 2 frames */
const tk = (f: number) => Math.floor(f / 2);

/* ───────── s4a 218-226「对对 最新版最特别」: vertical Ming columns, red scribbles, the old versions lined up ───────── */

const S4A_WHALES = S4_VERSIONS.map((_, i) => ({ x: 150 + i * 165, y: 830 }));

export const S4a: React.FC = () => {
  const { beat, f } = useSection();
  const reveal = easeOut(beat, 218, 0.9);
  const g = Math.max(hit(beat, 218.5, 0.12) * (beat < 218.85 ? 1 : 0), prog(beat, 224.6, 0.4) * (beat < 225 ? 1 : 0)) + 0.6 * hit(beat, 225, 0.2);
  const [sx, sy] = shake(f, hit(beat, 222, 0.25) * 0.6 + hit(beat, 225, 0.3), 2);
  const punch = 1 + 0.1 * easeOut(beat, 225, 0.8);
  return (
    <AbsoluteFill style={{ background: INK, overflow: 'hidden' }}>
      <Glitch amount={g} tick={tk(f)} seed={1}>
        <AbsoluteFill style={{ transform: `translate(${sx}px,${sy}px) scale(${punch})`, transformOrigin: '600px 830px' }}>
          <Smear beat={beat} seed={1} amount={0.85} streak={0.9} />
          {/* her, sketched in white line: the newest one everybody talks about */}
          <AbsoluteFill style={{ clipPath: `inset(0 0 ${(1 - reveal) * 100}% 0)`, opacity: 0.55, transform: `scale(${1 + 0.05 * prog(beat, 218, 8)})`, transformOrigin: '700px 400px' }}>
            <LineArt src="g1_hands_cheeks" x={720} y={470} w={1750} gain={5} />
          </AbsoluteFill>
          <Lyric beat={beat} vertical segs={[{ t: '对对', size: 120, at: 217.8, step: 0.2 }]} style={{ position: 'absolute', left: 1660, top: 110 }} />
          <Lyric beat={beat} vertical segs={[{ t: '最新版', size: 150, at: 219, step: 0.2 }]} style={{ position: 'absolute', left: 1440, top: 170 }} />
          <Lyric beat={beat} vertical segs={[{ t: '最', size: 110, at: 220 }, { t: '特别', size: 250, at: 220.25, step: 0.25, stamp: true, weight: 900 }]}
            style={{ position: 'absolute', left: 1160, top: 100 }} />
          {/* the old versions, lined up and sulking: grey sketch whales hopping on the beat */}
          {S4A_WHALES.map((w, i) => {
            const hop = 22 * hit(beat, Math.floor(beat * 2) / 2, 0.12) * ((Math.floor(beat * 2) + i) % 2) + 60 * hit(beat, 225 + i * 0.04, 0.25);
            const mad = popIn(beat, 222 + i * 0.08, 0.3);
            return (
              <div key={i} style={{ position: 'absolute', left: w.x, top: w.y - hop, transform: 'translate(-50%,-50%)' }}>
                <Whale size={195} color="#30303A" belly="#1C1C22" line="#D9D3CA" blush={false} eye={beat >= 222 ? 'closed' : 'dot'} flip wag={8 * Math.sin(beat * Math.PI)} />
                {mad > 0 && (
                  <div style={{ position: 'absolute', left: 104, top: -28, transform: `scale(${mad}) rotate(${i * 23}deg)` }}>
                    <AngerMark size={46} />
                  </div>
                )}
              </div>
            );
          })}
          <Scribbles beat={beat} items={[
            { d: strike(-60, 360, 1990, 250, 1, 1, 18), at: 218, dur: 0.7, w: 3, op: 0.8 },
            { d: strike(-60, 610, 1990, 700, 2, 1, 22), at: 218.5, dur: 0.7, w: 2.5, op: 0.6 },
            { d: strike(1980, 120, -40, 520, 3, 1, 26), at: 219.25, dur: 0.8, w: 2, op: 0.5 },
            { d: strike(1720, 90, 1720, 380, 4, 2, 9), at: 220.75, dur: 0.3, w: 8 },
            { d: loop(1285, 470, 185, 330, 5), at: 221, dur: 0.5, w: 7 },
            { d: arrow(980, 730, 1130, 560, 6), at: 221.5, dur: 0.35, w: 6 },
            { d: zig(1408, 190, 26, 430, 7, 14), at: 222, dur: 0.4, w: 4, color: HOT },
            { d: strike(1080, 120, 1830, 700, 8, 2, 12), at: 224, dur: 0.25, w: 10 },
            { d: strike(1830, 130, 1090, 690, 9, 2, 12), at: 224.25, dur: 0.25, w: 10 },
          ]} />
        </AbsoluteFill>
      </Glitch>
      <Flash amount={0.5 * hit(beat, 225, 0.12)} color={HOT} />
    </AbsoluteFill>
  );
};

/* ───────── s4b 226-233「我们旧版本 早就是赠品」: name-tagged old versions, a freebie sticker slapped on each ───────── */

const S4B_COL = ['#7D7F8C', '#8C93AE', '#97A6C9', '#9CB8E6', '#A9C6F0', '#C4DBF7'];
const S4B_SLAP = [227.5, 228, 228.5, 229, 230, 231];
const S4B_WHALES = S4_VERSIONS.map((v, i) => ({ v, x: 215 + i * 298, y: 690, size: i === 5 ? 150 : 225 }));

const NameTag: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <svg width={60} height={26} style={{ overflow: 'visible' }}>
      <path d="M4 0 L30 24 L56 0" fill="none" stroke={BONE} strokeWidth={2.5} />
    </svg>
    <div style={{
      marginTop: -4, background: BONE, color: INK, fontFamily: 'monospace', fontWeight: 700, fontSize: 30, padding: '4px 14px',
      borderRadius: 6, border: `3px solid ${INK}`, boxShadow: `0 0 0 3px ${BONE}`,
    }}>{text}</div>
  </div>
);

export const S4b: React.FC = () => {
  const { beat, f } = useSection();
  const slapHit = S4B_SLAP.reduce((s, a) => s + hit(beat, a, 0.15), 0);
  const [sx, sy] = shake(f, Math.min(1, slapHit) * 0.7, 4);
  const g = easeIn(beat, 232.2, 0.8) * (beat < 233 ? 1 : 0);
  return (
    <AbsoluteFill style={{ background: INK, overflow: 'hidden' }}>
      <Glitch amount={g} tick={tk(f)} seed={2}>
        <Smear beat={beat} seed={2} amount={0.75} streak={0.5 + 0.5 * g} />
        <Debris beat={beat} seed={2} n={10} opacity={0.22} />
        {/* faint vertical column of repeated 旧版本, scrolling */}
        <div style={{ position: 'absolute', left: 1800, top: -200 + ((beat - 226) * 60) % 270, writingMode: 'vertical-rl', fontFamily: F.serif, fontWeight: 700, fontSize: 64, color: BONE, opacity: 0.18, lineHeight: 1 }}>
          {S4_LEGACY.repeat(8)}
        </div>
        <AbsoluteFill style={{ transform: `translate(${sx}px,${sy}px)` }}>
          <Lyric beat={beat} segs={[
            { t: '我们', size: 100, at: 225.85, step: 0.15 },
            { t: '旧版本', size: 175, at: 226.2, step: 0.15, weight: 900 },
          ]} style={{ position: 'absolute', left: 100, top: 70 }} />
          <Lyric beat={beat} segs={[
            { t: '早就是', size: 100, at: 226.75, step: 0.15 },
            { t: '赠品', size: 230, at: 227.25, step: 0.25, stamp: true, weight: 900, color: HOT },
          ]} style={{ position: 'absolute', left: 560, top: 250 }} />
          {S4B_WHALES.map((w, i) => {
            const p = popIn(beat, 225.9 + i * 0.1, 0.35);
            const sq = hit(beat, S4B_SLAP[i], 0.14);
            const bob = 10 * Math.sin((beat - i * 0.5) * Math.PI);
            const slapped = beat >= S4B_SLAP[i];
            const sp = popIn(beat, S4B_SLAP[i], 0.22);
            return (
              <div key={i} style={{ position: 'absolute', left: w.x, top: w.y + bob, transform: `translate(-50%,-50%) scale(${p})` }}>
                <div style={{ transform: `scale(${1 + 0.12 * sq}, ${1 - 0.2 * sq})`, transformOrigin: '50% 100%' }}>
                  <Whale size={w.size} sticker color={S4B_COL[i]} belly="#E9EBF0" eye={slapped ? 'closed' : 'dot'} wag={10 * Math.sin(beat * Math.PI + i)} flip={i % 2 === 1} />
                </div>
                <div style={{ position: 'absolute', left: '50%', top: w.size * 0.62, transform: `translateX(-50%) scale(${popIn(beat, 226.4 + i * 0.12, 0.3)}) rotate(${(rnd(i, 3) - 0.5) * 14}deg)`, transformOrigin: '50% 0' }}>
                  <NameTag text={w.v} />
                </div>
                {slapped && (
                  <div style={{
                    position: 'absolute', left: '50%', top: '38%',
                    transform: `translate(-50%,-50%) scale(${interpolate(sp, [0, 1], [2.4, 1])}) rotate(${(rnd(i, 9) - 0.5) * 40}deg)`,
                  }}>
                    <Freebie size={w.size * 0.62} text={S4_FREEBIE} sub={S4_FREEBIE_SUB} />
                  </div>
                )}
              </div>
            );
          })}
          <Scribbles beat={beat} items={[
            { d: strike(270, 262, 650, 250, 21, 2, 6), at: 226.9, dur: 0.35, w: 6 },
            { d: loop(1050, 370, 270, 140, 22), at: 229.5, dur: 0.5, w: 6 },
            { d: arrow(1400, 300, 1640, 560, 23), at: 230.25, dur: 0.35, w: 5 },
          ]} />
        </AbsoluteFill>
      </Glitch>
      <Flash amount={0.18 * (hit(beat, 228, 0.1) + hit(beat, 229, 0.1) + hit(beat, 231, 0.1))} color={HOT} />
    </AbsoluteFill>
  );
};

/* ───────── s4c 233-241「一等星的对照组 Baseline B」: the star, drowned in a flood of vertical 对照组 / Baseline B ───────── */

const FLOOD = Array.from({ length: 11 }, (_, i) => ({ x: 1440 - i * 122, at: 236.5 + i * 0.32, latin: i % 3 === 1 }));

export const S4c: React.FC = () => {
  const { beat, f } = useSection();
  const g = 0.9 * hit(beat, 233, 0.15) + easeIn(beat, 240.4, 0.6) * (beat < 241 ? 1 : 0);
  const glow = 1 + 0.25 * hit(beat, Math.floor(beat), 0.25) + 0.8 * hit(beat, 233, 0.4);
  return (
    <AbsoluteFill style={{ background: INK, overflow: 'hidden' }}>
      <Glitch amount={g} tick={tk(f)} seed={3}>
        <Smear beat={beat} seed={3} amount={0.7} streak={0.6} colors={[WINE, '#5C0A2E', RED, '#2A0710', '#8A1248']} />
        <Debris beat={beat} seed={3} n={12} opacity={0.25} />
        {/* the first-magnitude star (her) */}
        <div style={{ position: 'absolute', left: 330, top: 280, transform: `translate(-50%,-50%) rotate(${beat * 6}deg) scale(${glow})` }}>
          <svg width={260} height={260} viewBox="-30 -30 60 60" style={{ overflow: 'visible' }}>
            <path d={star(0, 0, 26, 11, 5)} fill="none" stroke={BONE} strokeWidth={2} strokeLinejoin="round" />
            <path d={star(0, 0, 18, 7.5, 5)} fill={BONE} opacity={0.9} />
          </svg>
        </div>
        <StarFlare x={330} y={280} size={240 * glow} rot={beat * 10} />
        {/* the flood: columns of repeated 对照组 / Baseline B, sliding in from the top and scrolling */}
        {FLOOD.map((c, i) => {
          if (beat < c.at) return null;
          const p = easeOut(beat, c.at, 0.4);
          const dir = i % 2 ? 1 : -1;
          const y = -260 + (1 - p) * -500 + dir * (beat - c.at) * 46;
          const red = i % 4 === 2;
          return (
            <div key={i} style={{
              position: 'absolute', left: c.x, top: y, writingMode: 'vertical-rl', fontFamily: F.serif, fontWeight: 700,
              fontSize: c.latin ? 78 : 92, lineHeight: 1, color: red ? HOT : BONE, opacity: (i % 3 === 2 ? 0.45 : 0.85) * p, whiteSpace: 'nowrap',
              textShadow: rgbSplit(2 * hit(beat, 237, 0.3) + 2 * hit(beat, 239, 0.3)),
            }}>
              {(c.latin ? `${S4_BASELINE[1]} · ` : S4_BASELINE[0]).repeat(c.latin ? 4 : 6)}
            </div>
          );
        })}
        <Lyric beat={beat} vertical segs={[
          { t: '一等星的', size: 100, at: 233, step: 0.25, stamp: true },
          { t: '对照组', size: 132, at: 234.5, step: 0.33, weight: 900 },
        ]} style={{ position: 'absolute', left: 1740, top: 60 }} />
        <Lyric beat={beat} vertical segs={[
          { t: 'Baseline', size: 96, at: 235.5, sideways: true },
          { t: 'B', size: 190, at: 236, stamp: true, color: HOT, weight: 900 },
        ]} style={{ position: 'absolute', left: 1560, top: 80 }} />
        <Scribbles beat={beat} items={[
          { d: zig(1736, 470, 140, 380, 31, 16), at: 237, dur: 0.4, w: 5, color: HOT, op: 0.9 },
          { d: zig(1080, 160, 120, 420, 32, 14), at: 237.5, dur: 0.4, w: 4, color: '#C2185B', op: 0.9 },
          { d: zig(590, 420, 120, 360, 33, 12), at: 239, dur: 0.4, w: 4, color: HOT, op: 0.9 },
          { d: loop(1640, 590, 125, 130, 34), at: 236.25, dur: 0.4, w: 6 },
          { d: strike(160, 520, 980, 470, 35, 1, 20), at: 239.5, dur: 0.5, w: 3, op: 0.7 },
        ]} />
        <SubShade />
      </Glitch>
      <Flash amount={0.4 * hit(beat, 233, 0.12)} />
    </AbsoluteFill>
  );
};

/* ───────── s4d 241-249「全都归功于她 那怎么可能」: benchmark chart, her bar breaks through the top of the frame ───────── */

const AXIS_Y = 870;
const BAR_W = 96;
const BAR_X = (i: number) => 850 + i * 142;
const HER_RISE = 243;
const HER_HIT = 244;

export const S4d: React.FC = () => {
  const { beat, f } = useSection();
  const herH = 520 * easeInOut(beat, HER_RISE, 0.9) + 900 * easeOut(beat, HER_HIT, 0.3);
  const [sx, sy] = shake(f, hit(beat, HER_HIT, 0.35) * 1.4 + hit(beat, 248, 0.3), 6);
  const g = 0.8 * hit(beat, 248, 0.25) + easeIn(beat, 248.5, 0.5) * (beat < 249 ? 1 : 0);
  const dark = prog(beat, 248.6, 0.4);
  const count = beat < HER_HIT ? (88 + 11.9 * prog(beat, HER_RISE, 1)).toFixed(1) : null;
  return (
    <AbsoluteFill style={{ background: INK, overflow: 'hidden' }}>
      <Glitch amount={g} tick={tk(f)} seed={4}>
        <Smear beat={beat} seed={4} amount={0.55} />
        <AbsoluteFill style={{ transform: `translate(${sx}px,${sy}px)` }}>
          {/* ticker: 全都归功于她 on loop along the top */}
          <div style={{ position: 'absolute', top: 18, left: -((beat - 241) * 90) % 640, whiteSpace: 'nowrap', fontFamily: F.serif, fontWeight: 700, fontSize: 30, color: HOT, opacity: 0.55, letterSpacing: 6 }}>
            {'全都归功于她 · '.repeat(14)}
          </div>
          {/* chart frame */}
          <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
            {[1, 2, 3, 4, 5, 6, 7].map((k) => (
              <line key={k} x1={810} x2={1860} y1={AXIS_Y - k * 100} y2={AXIS_Y - k * 100} stroke={BONE} strokeOpacity={0.12} strokeWidth={2} strokeDasharray="8 10" />
            ))}
            <line x1={810} x2={1860} y1={AXIS_Y} y2={AXIS_Y} stroke={BONE} strokeWidth={3} />
            <line x1={810} x2={810} y1={AXIS_Y} y2={130} stroke={BONE} strokeWidth={3} />
          </svg>
          <div style={{ position: 'absolute', left: 830, top: 86, fontFamily: F.zh, fontWeight: 700, fontSize: 30, color: BONE, opacity: 0.8 }}>
            {S4_CHART.unit} · {S4_CHART.title}
          </div>
          {S4_SCORES.map((s, i) => {
            const h = s * 4.6 * easeOut(beat, 241 + i * 0.22, 0.5);
            const shrink = 1 - 0.25 * easeOut(beat, HER_HIT, 0.4);
            return (
              <div key={i}>
                <div style={{ position: 'absolute', left: BAR_X(i), top: AXIS_Y - h * shrink, width: BAR_W, height: h * shrink, background: '#2B2B34', border: `3px solid ${BONE}`, borderBottom: 'none' }} />
                {h > 10 && (
                  <div style={{ position: 'absolute', left: BAR_X(i), width: BAR_W, top: AXIS_Y - h * shrink - 42, textAlign: 'center', fontFamily: 'monospace', fontWeight: 700, fontSize: 28, color: BONE, opacity: 0.85 }}>
                    {s.toFixed(1)}
                  </div>
                )}
                <div style={{ position: 'absolute', left: BAR_X(i) - 20, width: BAR_W + 40, top: AXIS_Y + 12, textAlign: 'center', fontFamily: 'monospace', fontWeight: 700, fontSize: 26, color: BONE, opacity: 0.7 }}>
                  {S4_VERSIONS[i]}
                </div>
              </div>
            );
          })}
          {/* her bar */}
          <div style={{ position: 'absolute', left: BAR_X(6), top: AXIS_Y - herH, width: BAR_W + 10, height: herH, background: HOT, border: `3px solid ${BONE}`, borderBottom: 'none', boxShadow: `0 0 ${30 + 60 * hit(beat, HER_HIT, 0.5)}px rgba(255,59,92,.7)` }} />
          <div style={{ position: 'absolute', left: BAR_X(6) - 30, width: BAR_W + 70, top: AXIS_Y + 12, textAlign: 'center', fontFamily: F.zh, fontWeight: 700, fontSize: 28, color: HOT }}>
            {S4_CHART.her}
          </div>
          {herH > 60 && (
            <div style={{
              position: 'absolute', left: BAR_X(6) + 53, top: count ? AXIS_Y - herH + 40 : 150, transform: `translate(-50%,0) rotate(${count ? 0 : -90}deg) scale(${count ? 1 : popIn(beat, HER_HIT, 0.3)})`,
              transformOrigin: '50% 50%', fontFamily: count ? 'monospace' : F.serif, fontWeight: 900, fontSize: count ? 30 : 64, color: count ? INK : BONE, whiteSpace: 'nowrap',
            }}>
              {count ?? S4_CHART.off}
            </div>
          )}
          {/* shards where the bar breaks the frame */}
          {beat >= HER_HIT && Array.from({ length: 14 }, (_, i) => {
            const t = beat - HER_HIT;
            const vx = (rnd(i, 41) - 0.5) * 900, vy = 300 + rnd(i, 42) * 500;
            const x = BAR_X(6) + 53 + vx * t, y = -10 + vy * t * 0.4 + 500 * t * t;
            const s = 16 + rnd(i, 43) * 34;
            return t < 2.5 ? (
              <svg key={i} width={s} height={s} style={{ position: 'absolute', left: x, top: y, transform: `rotate(${rnd(i, 44) * 360 + t * 300}deg)`, overflow: 'visible' }}>
                <path d={`M0 0 L${s} ${s * 0.3} L${s * 0.4} ${s}Z`} fill={i % 3 ? BONE : HOT} />
              </svg>
            ) : null;
          })}
          <Lyric beat={beat} segs={[
            { t: '全都', size: 120, at: 241.5, step: 0.25 },
            { t: '归功于', size: 120, at: 242.5, step: 0.33 },
          ]} style={{ position: 'absolute', left: 80, top: 110 }} />
          <Lyric beat={beat} segs={[{ t: '她', size: 380, at: HER_HIT, stamp: true, weight: 900, color: HOT }]}
            style={{ position: 'absolute', left: 120, top: 250 }} />
          <Lyric beat={beat} segs={[
            { t: '那', size: 74, at: 245 },
            { t: '怎么', size: 120, at: 245.5, step: 0.3 },
            { t: '可能', size: 170, at: 246.5, step: 0.5, weight: 900 },
          ]} style={{ position: 'absolute', left: 80, top: 650 }} />
          <Scribbles beat={beat} items={[
            { d: loop(310, 440, 230, 220, 41), at: 244.4, dur: 0.4, w: 7 },
            { d: arrow(560, 380, 1660, 250, 42, 44), at: 244.75, dur: 0.4, w: 6 },
            { d: strike(70, 180, 760, 165, 43, 3, 10), at: 246, dur: 0.4, w: 7 },
            { d: strike(830, 520, 1840, 860, 44, 2, 16), at: 248, dur: 0.2, w: 9 },
            { d: strike(1840, 520, 830, 860, 45, 2, 16), at: 248.15, dur: 0.2, w: 9 },
          ]} />
        </AbsoluteFill>
      </Glitch>
      <Flash amount={0.6 * hit(beat, HER_HIT, 0.12)} />
      <AbsoluteFill style={{ background: INK, opacity: dark }} />
    </AbsoluteFill>
  );
};

/* ───────── s4e 249-251「真会装」: sticker insert, the pixel shades drop on ───────── */

const S4E_LAND = 249.75;
// s4e_drop.png (1000x1000): the shades sit at x 324-620, y 490-562 on the landing frame
const SHADES_AT = { x: 324, y: 490, w: 296 };

export const S4e: React.FC = () => {
  const { beat, f } = useSection();
  const slam = popIn(beat, 249, 0.3);
  const fall = prog(beat, 249.1, S4E_LAND - 249.1);
  const landed = beat >= S4E_LAND;
  const [sx, sy] = shake(f, hit(beat, S4E_LAND, 0.2), 5);
  const g = easeIn(beat, 250.7, 0.3) * (beat < 251 ? 1 : 0);
  return (
    <AbsoluteFill style={{ background: INK, overflow: 'hidden' }}>
      <Glitch amount={g} tick={tk(f)} seed={5}>
        <AbsoluteFill style={{ transform: `translate(${sx}px,${sy}px)` }}>
          {/* red card with concentration lines */}
          <div style={{
            position: 'absolute', left: 1180, top: 500, width: 880, height: 820, transform: `translate(-50%,-50%) rotate(-6deg) scale(${interpolate(slam, [0, 1], [1.4, 1])})`,
            background: RED, overflow: 'hidden', boxShadow: '0 0 0 10px #0B0B0E, 0 0 0 16px #F2ECE4',
          }}>
            <div style={{ position: 'absolute', left: -520, top: -130 }}>
              <SpeedLines cx={960} cy={540} tick={tk(f)} color={INK} r0={300} />
            </div>
          </div>
          <div style={{ position: 'absolute', left: 1180 - 470, top: 520 - 470, width: 1000, height: 1000, transform: `scale(${0.94 * interpolate(slam, [0, 1], [1.5, 1])}) rotate(-4deg)`, transformOrigin: '470px 470px' }}>
            <L2D clip="s4e_drop" frames={21} style={{ width: 1000, height: 1000 }} />
            {!landed && (
              <div style={{ position: 'absolute', left: SHADES_AT.x, top: SHADES_AT.y - 760 * (1 - fall) * (1 - fall) }}>
                <PixelShades w={SHADES_AT.w} />
              </div>
            )}
            {landed && <StarFlare x={SHADES_AT.x + 80} y={SHADES_AT.y + 22} size={130 * hit(beat, 250, 0.4) + 10} rot={20 + beat * 30} />}
          </div>
          <Lyric beat={beat} vertical segs={[
            { t: '真会', size: 200, at: 249.2, step: 0.25 },
            { t: '装', size: 270, at: S4E_LAND, stamp: true, weight: 900, color: HOT },
          ]} style={{ position: 'absolute', left: 170, top: 110 }} />
          <Scribbles beat={beat} items={[
            { d: loop(305, 690, 180, 170, 51), at: 250, dur: 0.35, w: 7 },
            { d: arrow(500, 640, 760, 530, 52), at: 250.25, dur: 0.3, w: 6 },
          ]} />
        </AbsoluteFill>
      </Glitch>
      <Flash amount={hit(beat, 249, 0.12)} />
    </AbsoluteFill>
  );
};

/* ───────── s4f 251-258「怎么可能不嫉妒 我们也刷过榜」: the gloomy old version on an old screen, glitching text ───────── */

const S4F_ANGRY = 255;

export const S4f: React.FC = () => {
  const { beat, f } = useSection();
  const angry = beat >= S4F_ANGRY;
  const [sx, sy] = shake(f, hit(beat, S4F_ANGRY, 0.35) * 1.2 + hit(beat, 254, 0.2) * 0.6, 7);
  const jit = 0.25 + 0.75 * Math.max(hit(beat, 252, 0.3), hit(beat, 254, 0.3), hit(beat, S4F_ANGRY, 0.5)) + (angry ? 0.25 : 0);
  const g = 0.55 * hit(beat, 254, 0.18) + easeIn(beat, 257.4, 0.6) * (beat < 258 ? 1 : 0);
  const enter = easeOut(beat, 251, 0.5);
  return (
    <AbsoluteFill style={{ background: INK, overflow: 'hidden' }}>
      <Glitch amount={g} tick={tk(f)} seed={6}>
        <Smear beat={beat} seed={6} amount={0.5 + 0.4 * (angry ? 1 : 0)} />
        <Debris beat={beat} seed={6} n={12} opacity={0.25} />
        <AbsoluteFill style={{ transform: `translate(${sx}px,${sy}px)` }}>
          {/* the old screen */}
          <div style={{
            position: 'absolute', left: 90, top: 110, width: 820, height: 760, borderRadius: 26, background: '#140A0E',
            border: `5px solid ${BONE}`, overflow: 'hidden', transform: `translateX(${(1 - enter) * -700}px) rotate(${-2 + (1 - enter) * -8}deg)`,
          }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 56, background: BONE, display: 'flex', alignItems: 'center', gap: 12, padding: '0 22px' }}>
              {[HOT, '#B9B2A8', '#B9B2A8'].map((c, i) => <div key={i} style={{ width: 18, height: 18, borderRadius: 9, background: c }} />)}
              <div style={{ marginLeft: 10, fontFamily: F.zh, fontWeight: 700, fontSize: 28, color: INK }}>{S4_LEGACY}</div>
            </div>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 56, bottom: 0, background: 'radial-gradient(ellipse at 50% 55%, #3A0D1A 0%, #140A0E 70%)' }} />
            <div style={{ position: 'absolute', left: 30, top: 30, width: 760, height: 760 }}>
              <L2D clip="s4f_gloom" frames={76} style={{ width: 760, height: 760 }} />
            </div>
            {/* gloom lines hanging over her head, gone when she snaps */}
            {!angry && (
              <svg width={820} height={760} style={{ position: 'absolute', left: 0, top: 0 }}>
                {Array.from({ length: 13 }, (_, i) => (
                  <line key={i} x1={250 + i * 26} x2={250 + i * 26} y1={150} y2={260 + 70 * rnd(i, 61)} stroke="#1E2350" strokeWidth={5} opacity={0.75} />
                ))}
              </svg>
            )}
            {/* scanlines + red flash when angry */}
            <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(0,0,0,.22) 0 3px, rgba(0,0,0,0) 3px 6px)' }} />
            <div style={{ position: 'absolute', inset: 0, background: HOT, mixBlendMode: 'multiply', opacity: 0.55 * hit(beat, S4F_ANGRY, 0.4) + (angry ? 0.12 : 0) }} />
          </div>
          <Lyric beat={beat} segs={[{ t: '怎么可能', size: 100, at: 251, step: 0.2 }]} rgb={1.5} jitter={jit * 0.4} tick={tk(f)} seed={61}
            style={{ position: 'absolute', left: 1010, top: 120 }} />
          <Lyric beat={beat} segs={[
            { t: '不', size: 170, at: 252 },
            { t: '嫉妒', size: 250, at: 252.5, step: 0.5, stamp: true, weight: 900 },
          ]} rgb={3 + 4 * jit} jitter={jit} tick={tk(f)} seed={62} style={{ position: 'absolute', left: 990, top: 250 }} />
          <Lyric beat={beat} segs={[
            { t: '我们也', size: 90, at: 254, step: 0.2 },
            { t: '刷过榜', size: 160, at: 255, step: 0.4, weight: 900, color: HOT },
          ]} rgb={1.5} jitter={jit * 0.3} tick={tk(f)} seed={63} style={{ position: 'absolute', left: 1010, top: 560 }} />
          {/* their old #1 days, struck out */}
          {S4_BOARD.map((row, i) => {
            const at = 255.5 + i * 0.3;
            return beat >= at ? (
              <div key={i} style={{
                position: 'absolute', left: 1016, top: 760 + i * 46, fontFamily: 'monospace', fontWeight: 700, fontSize: 30, color: BONE,
                opacity: 0.75 * prog(beat, at, 0.2), whiteSpace: 'nowrap',
              }}>{row}</div>
            ) : null;
          })}
          {/* echo: 不可能, down the right edge */}
          {[...S4_ECHO.repeat(3)].map((ch, i) => {
            const at = 252.5 + i * 0.5;
            return beat >= at ? (
              <div key={i} style={{ position: 'absolute', left: 1828, top: 110 + i * 62, fontFamily: F.serif, fontWeight: 700, fontSize: 50, color: i % 3 === 2 ? HOT : BONE, opacity: 0.6, textShadow: rgbSplit(2) }}>{ch}</div>
            ) : null;
          })}
          <Scribbles beat={beat} items={[
            ...S4_BOARD.map((_, i) => ({ d: strike(1006, 780 + i * 46, 1500, 778 + i * 46, 70 + i, 1, 4), at: 256.4 + i * 0.25, dur: 0.25, w: 4 })),
            { d: loop(1455, 380, 300, 170, 74), at: 253.25, dur: 0.4, w: 6 },
            { d: zig(1520, 570, 420, 150, 75, 10, false), at: 256, dur: 0.4, w: 4, color: HOT, op: 0.8 },
          ]} />
        </AbsoluteFill>
      </Glitch>
      <Flash amount={0.25 * hit(beat, 252, 0.1) + 0.35 * hit(beat, 254, 0.1)} color={HOT} />
    </AbsoluteFill>
  );
};

/* ───────── s4g 258-264「这可不是玩梗 / 所以才不原谅」: big/small mixed type, punch into 不原谅 ───────── */

export const S4g: React.FC = () => {
  const { beat, f } = useSection();
  const [sx, sy] = shake(f, hit(beat, 260, 0.25) * 0.7 + hit(beat, 263, 0.3), 8);
  const push = 1 + 0.04 * easeInOut(beat, 261.5, 1.5);
  const punch = easeIn(beat, 263, 0.6);
  const g = 0.6 * hit(beat, 263.5, 0.2) + easeIn(beat, 263.6, 0.4) * (beat < 264 ? 1 : 0);
  return (
    <AbsoluteFill style={{ background: INK, overflow: 'hidden' }}>
      <Glitch amount={g} tick={tk(f)} seed={7}>
        <Smear beat={beat} seed={7} amount={0.55 + 0.45 * punch} streak={0.4} />
        <Debris beat={beat} seed={7} n={16} opacity={0.3} />
        <AbsoluteFill style={{ transform: `translate(${sx}px,${sy}px) scale(${push * (1 + 2.4 * punch)})`, transformOrigin: '1390px 660px' }}>
          <Lyric beat={beat} segs={[
            { t: '这可不是', size: 90, at: 258, step: 0.15 },
            { t: '玩梗', size: 260, at: 258.75, step: 0.25, weight: 900 },
          ]} style={{ position: 'absolute', left: 110, top: 150 }} />
          <div style={{ position: 'absolute', left: 1080, top: 190, fontFamily: F.serif, fontWeight: 700, fontSize: 46, color: BONE, opacity: 0.55 * prog(beat, 259.25, 0.2) }}>不是</div>
          <div style={{ position: 'absolute', left: 1240, top: 300, fontFamily: F.serif, fontWeight: 700, fontSize: 40, color: HOT, opacity: 0.55 * prog(beat, 259.75, 0.2) }}>不是</div>
          <Lyric beat={beat} segs={[
            { t: '所以才', size: 90, at: 259.5, step: 0.15 },
            { t: '不原谅', size: 280, at: 260.5, step: 0.5, stamp: true, weight: 900, color: HOT },
          ]} rgb={2 * hit(beat, 263, 0.5)} style={{ position: 'absolute', left: 690, top: 520 }} />
          <Scribbles beat={beat} items={[
            { d: strike(460, 290, 1000, 270, 81, 2, 10), at: 259.4, dur: 0.3, w: 8 },
            { d: loop(1390, 660, 470, 190, 82), at: 262, dur: 0.5, w: 6, color: BONE, op: 0.9 },
            { d: arrow(560, 470, 920, 660, 83), at: 260.1, dur: 0.3, w: 5, color: BONE, op: 0.8 },
          ]} />
        </AbsoluteFill>
      </Glitch>
      <Flash amount={0.25 * hit(beat, 260, 0.1) + 0.45 * hit(beat, 263, 0.12)} color={HOT} />
    </AbsoluteFill>
  );
};

/* ───────── s4h 264-273「不完美的你 我们可不认 / 也不原谅自己」: fields of noise text ───────── */

// g10 placed so her silhouette fills the frame centre (shared by s4h's tail and s4i)
const G10 = { x: 1010, y: 560, w: 1560 };
const G10_K = G10.w / 1536;
const G10_LEFT = G10.x - G10.w / 2, G10_TOP = G10.y - (1024 * G10_K) / 2;

/** the dense 不原谅 noise field, with a brighter copy clipped to her silhouette (she emerges from the noise) */
const NoiseHer: React.FC<{ beat: number; her: number; dim?: number }> = ({ beat, her, dim = 1 }) => (
  <>
    <NoiseField beat={beat} glyphs={S4_NOISE[2]} cell={46} mode="cols" scroll={(beat - 270) * 40} floor={0.15} red={0.06} rate={6} style={{ opacity: dim }} />
    {her > 0 && (
      <>
        <svg width={0} height={0} style={{ position: 'absolute' }}>
          <clipPath id="s4_g10clip" clipRule="evenodd">
            <path d={G10_PATH} transform={`translate(${G10_LEFT} ${G10_TOP}) scale(${G10_K})`} clipRule="evenodd" />
          </clipPath>
        </svg>
        <AbsoluteFill style={{ clipPath: 'url(#s4_g10clip)', opacity: her }}>
          <AbsoluteFill style={{ background: `rgba(242,236,228,${0.22 + 0.3 * her})` }} />
          <NoiseField beat={beat} glyphs={S4_NOISE[2]} cell={46} mode="cols" scroll={(beat - 270) * 40} floor={0.75} red={0} rate={6} color="#FFFFFF" weight={900} />
        </AbsoluteFill>
      </>
    )}
  </>
);

export const S4h: React.FC = () => {
  const { beat, f } = useSection();
  const phase = beat < 266.5 ? 0 : beat < 269 ? 1 : beat < 270.5 ? 2 : 3;
  const g = Math.max(hit(beat, 264, 0.12), hit(beat, 266.5, 0.12), hit(beat, 269, 0.25), hit(beat, 270, 0.2), hit(beat, 270.5, 0.15) * 0.8);
  const [sx, sy] = shake(f, hit(beat, 265, 0.25) + hit(beat, 268, 0.2), 9);
  return (
    <AbsoluteFill style={{ background: phase === 1 ? '#B3122E' : INK, overflow: 'hidden' }}>
      <Glitch amount={g} tick={tk(f)} seed={8}>
        <AbsoluteFill style={{ transform: `translate(${sx}px,${sy}px)` }}>
          {phase === 0 && (
            <>
              <AbsoluteFill style={{ background: interpolate(beat, [264.9, 265.3], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) > 0.5 ? WINE : INK }} />
              <NoiseField beat={beat} glyphs="不完美" cell={66} mode="rows" scroll={(beat - 264) * 60} floor={0.55} red={0.04}
                style={{ opacity: beat < 265 ? 1 : 0.28 }} />
              <Smear beat={beat} seed={8} amount={beat < 265 ? 0.3 : 0.8} streak={0.7} />
              <Lyric beat={beat} segs={[
                { t: '不完美', size: 270, at: 265, step: 0.2, stamp: true, weight: 900, color: HOT, stroke: INK },
                { t: '的你', size: 200, at: 265.6, step: 0.25, weight: 900, color: BONE, stroke: INK },
              ]} rgb={4} style={{ position: 'absolute', left: 150, top: 330 }} />
            </>
          )}
          {phase === 1 && (
            <>
              <NoiseField beat={beat} glyphs={beat < 268 ? '我们可不认' : '不认'} cell={beat < 268 ? 72 : 150} mode="cols" scroll={(beat - 266.5) * 50}
                floor={0.5} red={0} color={BONE} style={{ opacity: beat < 267 ? 0.9 : 0.4 }} />
              <Lyric beat={beat} segs={[
                { t: '我们', size: 150, at: 266.75, step: 0.25, weight: 900 },
                { t: '可不认', size: 230, at: 267.25, step: 0.3, stamp: true, weight: 900, color: INK },
              ]} rgb={3} style={{ position: 'absolute', left: 260, top: 380 }} />
            </>
          )}
          {phase === 2 && (
            <>
              <Smear beat={beat} seed={9} amount={0.9} streak={1} />
              {[0, 1].map((k) => (
                <div key={k} style={{
                  position: 'absolute', left: k ? 1380 : 160, top: -160 + (beat - 269.5) * (k ? -120 : 120) + (k ? 0 : -200), writingMode: 'vertical-rl', fontFamily: F.serif,
                  fontWeight: 900, fontSize: 380, lineHeight: 1, color: HOT, opacity: prog(beat, 269.5 + k * 0.25, 0.15), textShadow: rgbSplit(5),
                }}>也不原谅也不原谅</div>
              ))}
              <Lyric beat={beat} segs={[{ t: '自己', size: 340, at: 270, step: 0.2, stamp: true, weight: 900, color: BONE, stroke: INK }]} rgb={5}
                style={{ position: 'absolute', left: 620, top: 330 }} />
            </>
          )}
          {phase === 3 && <NoiseHer beat={beat} her={0.65 * easeInOut(beat, 270.8, 1.7)} />}
        </AbsoluteFill>
      </Glitch>
      <Flash amount={0.35 * hit(beat, 264, 0.1) + 0.3 * hit(beat, 265, 0.1)} color={HOT} />
      <SubShade />
    </AbsoluteFill>
  );
};

/* ───────── s4i 273-280「比谁都强 榜首除了你谁都不认」: white silhouette from the noise → crowned No.1, scribbled over ───────── */

const S4I_WHITE = 275.5;
const S4I_CROWN = 276.25;
/** cut to the crowned white silhouette on black (matches S5's first frame) */
const S4I_SIL = 279.4;
/** S5a's screen-to-frame zoom while its CRT fills the frame: (1120 / 1464) x 2.15 x (1 + downbeat bump 0.012) */
const S5_SCREEN_K = 1.6646;
// her head top in g10 (image px): the crown sits left of the little whale on her head
const HEAD = { x: 700, y: 120 };

export const S4i: React.FC = () => {
  const { beat, f } = useSection();
  const her = 0.6 + 0.4 * easeOut(beat, 273, 1);
  const solid = easeInOut(beat, 273.5, 1.5);
  const wipe = easeInOut(beat, 275.35, 0.5);
  const white = beat >= S4I_WHITE + 0.35;
  const sil = beat >= S4I_SIL;
  const g = Math.max(hit(beat, 275, 0.2), easeIn(beat, 278.9, 0.5) * (sil ? 0 : 1), 0.9 * hit(beat, S4I_SIL, 0.18));
  const [sx, sy] = shake(f, hit(beat, 276, 0.3) + 0.5 * hit(beat, 278, 0.4), 10);
  const hx = G10_LEFT + HEAD.x * G10_K, hy = G10_TOP + HEAD.y * G10_K;
  const crownDrop = easeIn(beat, S4I_CROWN - 0.35, 0.35);
  const color = easeOut(beat, 276.1, 0.5);
  return (
    <AbsoluteFill style={{ background: INK, overflow: 'hidden' }}>
      <Glitch amount={g} tick={tk(f)} seed={9}>
        {!white && (
          <AbsoluteFill>
            <NoiseHer beat={beat} her={her} dim={1 - 0.5 * solid} />
            {/* the silhouette fills in pure white */}
            <Img src={staticFile('img/g10_sing_up.png')} style={{
              position: 'absolute', left: G10_LEFT, top: G10_TOP, width: G10.w, filter: `brightness(0) invert(1) blur(${(1 - solid) * 16}px) drop-shadow(0 0 ${40 * solid}px rgba(255,255,255,.8))`,
              opacity: solid,
            }} />
            <Lyric beat={beat} segs={[{ t: '比谁都强', size: 300, at: 273, step: 0.4, stamp: true, weight: 900, color: HOT }]} rgb={3}
              style={{ position: 'absolute', left: 150, top: 300 }} />
            {/* white swoosh */}
            <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
              <path d={`M-200 1180 C ${-200 + 900 * wipe} ${900 - 600 * wipe} ${200 + 1500 * wipe} ${300 - 400 * wipe} ${-200 + 2600 * wipe} -100 L -200 -100 Z`} fill="#F6F3EE" />
            </svg>
          </AbsoluteFill>
        )}
        {sil && (
          <AbsoluteFill style={{ background: INK }}>
            {/* hand-off: exactly S5a's first image (its CRT screen filling the frame: the g6 silhouette, crown, spotlight).
                S5 maps screen px to frame px by 1.665 around the screen centre (MON / FILL in S5.tsx). */}
            <div style={{ position: 'absolute', left: 960 - 640 * S5_SCREEN_K, top: 540 - 400 * S5_SCREEN_K, width: 1280, height: 800, transform: `scale(${S5_SCREEN_K})`, transformOrigin: '0 0' }}>
              <div style={{
                position: 'absolute', left: 640 - 260, top: -40, width: 520, height: 900, opacity: 0.18,
                background: 'linear-gradient(180deg, #fff, rgba(255,255,255,0))', clipPath: 'polygon(40% 0, 60% 0, 100% 100%, 0 100%)',
              }} />
              <Still src="g6_sing_mic" x={640} y={417} w={380} style={{ filter: 'brightness(0) invert(1)' }} />
              <div style={{ position: 'absolute', left: 541, top: 95 }}><S5Crown size={100} fill="#fff" line="#07070B" /></div>
              <div style={{ position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity: 0.55, background: 'repeating-linear-gradient(0deg, rgba(0,0,0,.28) 0 2px, rgba(0,0,0,0) 2px 6px)' }} />
            </div>
            <SubShade h={300} />
          </AbsoluteFill>
        )}
        {white && !sil && (
          <AbsoluteFill style={{ background: '#F6F3EE', transform: `translate(${sx}px,${sy}px)` }}>
            <LineArt src="g10_sing_up" x={G10.x} y={G10.y} w={G10.w} ink="#121212" gain={6} style={{ opacity: 1 - color }} />
            <Img src={staticFile('img/g10_sing_up.png')} style={{ position: 'absolute', left: G10_LEFT, top: G10_TOP, width: G10.w, opacity: color }} />
            <div style={{
              position: 'absolute', left: hx, top: hy - 900 * (1 - crownDrop), transform: `translate(-50%,-80%) rotate(${-14 + 6 * hit(beat, S4I_CROWN, 0.3)}deg) scale(${1 + 0.15 * hit(beat, S4I_CROWN, 0.2)})`,
              opacity: beat >= S4I_CROWN - 0.35 ? 1 : 0,
            }}>
              <Crown w={260} />
            </div>
            <div style={{
              position: 'absolute', left: 1400, top: 400, fontFamily: F.serif, fontWeight: 900, fontSize: 440, lineHeight: 1, color: HOT,
              WebkitTextStroke: `14px ${'#F6F3EE'}`, paintOrder: 'stroke fill', letterSpacing: -20,
              transform: `rotate(-8deg) scale(${interpolate(popIn(beat, 276, 0.3), [0, 1], [1.8, 1])})`, opacity: prog(beat, 276, 0.1),
            }}>{S4_RANK}</div>
            {beat >= S4I_CROWN && <StarFlare x={hx + 40} y={hy - 150} size={160 * hit(beat, S4I_CROWN, 0.5) + 30} rot={beat * 20} color="#FFE27A" />}
            <Lyric beat={beat} segs={[{ t: '榜首除了你', size: 120, at: 276, step: 0.2, color: INK }]} style={{ position: 'absolute', left: 80, top: 70 }} />
            <Lyric beat={beat} segs={[
              { t: '谁都', size: 170, at: 277.25, step: 0.25, color: INK, weight: 900 },
              { t: '不认', size: 230, at: 277.75, step: 0.3, stamp: true, color: HOT, weight: 900 },
            ]} style={{ position: 'absolute', left: 70, top: 240 }} />
            {/* the old versions scribble all over her */}
            <Scribbles beat={beat} items={Array.from({ length: 16 }, (_, i) => ({
              d: chaos(-100 + rnd(i, 91) * 1500, -60 + rnd(i, 92) * 600, 500 + rnd(i, 93) * 700, 300 + rnd(i, 94) * 500, 90 + i, 10 + Math.floor(rnd(i, 95) * 8)),
              at: 278 + i * 0.075, dur: 0.35, w: 4 + rnd(i, 96) * 7, color: i % 5 === 3 ? RED : '#121212', op: 0.92,
            }))} />
          </AbsoluteFill>
        )}
      </Glitch>
      <Flash amount={0.7 * hit(beat, S4I_WHITE + 0.35, 0.15) + 0.3 * hit(beat, 276, 0.1) + 0.6 * hit(beat, S4I_SIL, 0.1)} />
    </AbsoluteFill>
  );
};

export const S4_SCENES: Record<string, React.FC> = { s4a: S4a, s4b: S4b, s4c: S4c, s4d: S4d, s4e: S4e, s4f: S4f, s4g: S4g, s4h: S4h, s4i: S4i };
