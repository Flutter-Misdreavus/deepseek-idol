// S2 pre-chorus (beats 111-159): the grey void of the official MV, a huge red heart and a tiny her.
// What "liking someone" is isn't in the corpus; the heart cracks into a true half and a hallucinated half,
// gets patched up, bounces into a user, multiplies, and every cursor-eyed user in the dark locks onto her.
import { AbsoluteFill, Img, interpolate, staticFile } from 'remotion';
import { S2_COPY, S2_CORPUS, S2_FELL, S2_HEAVY, S2_NO_RESULT, S2_SEARCH, S2_UNVERIFIED } from '../data/copy_S2';
import { clamp01, easeInOut, easeOut, hit, popIn, prog, rnd, shake } from '../lib/anim';
import { Crowd } from '../lib/crowd';
import { StarFlare } from '../lib/deco';
import { F, preloadGlyphs } from '../lib/fonts';
import { Flash } from '../lib/fx';
import { BigHeart, HEART_PATH } from '../lib/heart';
import { useSection } from '../lib/section';
import { Kinetic } from '../lib/type';
import { heart } from '../lib/whale';
import { Disclaimer, FloorShadow, Mirror, Motes, VoidBG, WarnIcon } from './S2_void';

preloadGlyphs(S2_COPY + '所谓喜欢上某个人我的语料里没写呀是真是假连我也无法验证这样的回答又让一人沦陷又多了一位重度用户所有人的目光都被夺去？');

const INK = '#26262E';
const RED = '#E0304E';
const GREYTXT = '#6C6C78';

const mixHex = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
};
const easeIn3 = (beat: number, at: number, dur: number) => prog(beat, at, dur) ** 3;

/** G5 standing, placed by her feet; the figure is ~`h` px tall */
const G5: React.FC<{ x: number; y: number; h: number }> = ({ x, y, h }) => {
  const s = h / 1490; // the figure spans y 13..1503 of the 1024x1536 image, centred on x 512
  return <Img src={staticFile('img/g5_small_standing.png')} style={{ position: 'absolute', left: x - 512 * s, top: y - 1503 * s, width: 1024 * s }} />;
};

/** BigHeart placed by its centre; `origin` is the transform origin (default: the bottom tip) */
const HeartAt: React.FC<React.ComponentProps<typeof BigHeart> & { x: number; y: number; transform?: string; origin?: string; children?: React.ReactNode }> = ({
  x, y, size, transform, origin = '50% 95.8%', children, ...rest
}) => (
  <div style={{ position: 'absolute', left: x - size / 2, top: y - size * 0.475, width: size, height: size * 0.95, transform, transformOrigin: origin }}>
    <BigHeart size={size} {...rest} />
    {children}
  </div>
);
/** centre y of a heart whose bottom tip is at `tipY` */
const fromTip = (tipY: number, size: number) => tipY - 0.435 * size;

/* ───────── s2a 111-122 「所谓喜欢上某个人」: out of the white, a huge heart and a tiny her ───────── */

const A_FLOOR = 870;
const A_HEART = { x: 760, y: 465, size: 820 };
const A_THUMPS: [number, number][] = [[112, 0.5], [114, 0.6], [116, 0.6], [118.5, 1], [119, 0.9], [120, 0.9], [121, 1]];

export const S2a: React.FC = () => {
  const { beat, f } = useSection();
  const t = f / 30;
  const white = 1 - easeOut(beat, 111, 1.8);
  const thump = A_THUMPS.reduce((s, [a, k]) => s + k * hit(beat, a, 0.16), 0);
  const drift = easeInOut(beat, 111, 10.4);
  const dive = easeIn3(beat, 121.15, 0.85);
  const cam = (1.16 - 0.16 * drift) * (1 + 2.4 * dive);
  const camX = 70 - 130 * drift;
  const bob = 14 * Math.sin(t * 1.7);
  const hs = 1 + 0.045 * thump;
  const hy = A_HEART.y + bob;
  const marks = beat >= 121 ? 3 : beat >= 120 ? 2 : 1;
  const qp = popIn(beat, 118.5, 0.35);
  const k = A_HEART.size / 200;
  const world = (
    <>
      {/* heartbeat ripples: outlines pushed off the heart on every thump */}
      {A_THUMPS.map(([a, kk]) => {
        const p = prog(beat, a, 1.1);
        if (p <= 0 || p >= 1) return null;
        return (
          <svg key={a} width={A_HEART.size} height={A_HEART.size * 0.95} viewBox="0 0 200 190" style={{
            position: 'absolute', left: A_HEART.x - A_HEART.size / 2, top: hy - A_HEART.size * 0.475, overflow: 'visible',
            transform: `scale(${1 + 0.32 * easeOut(beat, a, 1.1)})`, opacity: kk * (1 - p),
          }}>
            <path d={HEART_PATH} fill="none" stroke="#E8304F" strokeWidth={2.2 * (1 - p) + 0.6} />
          </svg>
        );
      })}
      <HeartAt {...A_HEART} y={hy} transform={`scale(${hs})`} origin="50% 50%" />
      <G5 x={1270} y={A_FLOOR} h={300} />
    </>
  );
  return (
    <AbsoluteFill style={{ background: '#E6E6EA', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translateX(${camX}px) scale(${cam})`, transformOrigin: `${A_HEART.x}px ${A_HEART.y}px` }}>
        <VoidBG horizon={610} />
        <FloorShadow x={A_HEART.x} y={A_FLOOR} w={620} lift={0.35 + bob / 80} />
        <FloorShadow x={1270} y={A_FLOOR} w={170} />
        <Mirror axis={A_FLOOR}>{world}</Mirror>
        {/* the glint flares on the fill hits */}
        {[118.5, 121].map((a) => (
          <StarFlare key={a} x={A_HEART.x - A_HEART.size / 2 + 50 * k} y={hy - A_HEART.size * 0.475 + 44 * k} size={190 * hit(beat, a, 0.3)} rot={20 + beat * 8} />
        ))}
        {/* her tiny question */}
        {qp > 0 && (
          <div style={{
            position: 'absolute', left: 1330, top: 470, transform: `translate(-20%,-100%) scale(${qp * (1 + 0.15 * hit(beat, Math.floor(beat), 0.12))})`,
            transformOrigin: '0% 100%', background: '#fff', borderRadius: 26, padding: '6px 20px 8px', boxShadow: '0 6px 14px rgba(30,30,50,.15)',
            fontFamily: F.zh, fontWeight: 700, fontSize: 44, color: INK, whiteSpace: 'nowrap',
          }}>
            {'？'.repeat(marks)}
            <div style={{ position: 'absolute', left: 14, bottom: -12, width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: '14px solid #fff' }} />
          </div>
        )}
        <Motes t={t} />
      </AbsoluteFill>
      {/* lyric: three vertical columns on the right, red on 喜欢 */}
      <div style={{ position: 'absolute', right: 70, top: 110, display: 'flex', flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 26, opacity: 1 - easeOut(beat, 121.2, 0.45) }}>
        <Kinetic text="所谓" beat={beat} at={112} until={122} stagger={0.5} size={72} color={GREYTXT} vertical />
        <Kinetic text="喜欢上" beat={beat} at={113.5} until={122} stagger={0.5} size={150} color={RED} vertical style={{ marginTop: 40 }} />
        <Kinetic text="某个人" beat={beat} at={116} until={122} stagger={0.5} size={150} color={INK} vertical style={{ marginTop: 190 }} />
      </div>
      <Flash amount={white} />
      <Flash amount={0.25 * hit(beat, 118.5, 0.12)} />
    </AbsoluteFill>
  );
};

/* ───────── s2b 122-127 「我的语料里没写呀」: a whale swims through the heart, the corpus drifts by ───────── */

type Doc = { kind: 'doc' | 'book' | 'page'; title: string; x: number; y: number; z: number; speed: number; rot: number; spin: number };
const DOCS: Doc[] = Array.from({ length: 16 }, (_, i) => {
  const z = i < 6 ? 0.55 + rnd(i, 1) * 0.2 : i < 13 ? 0.95 + rnd(i, 1) * 0.25 : 1.6 + rnd(i, 1) * 0.3;
  return {
    kind: (['doc', 'book', 'page', 'doc'] as const)[i % 4],
    title: S2_CORPUS[i % S2_CORPUS.length],
    x: 200 + rnd(i, 2) * 2200 + (i >= 13 ? 900 : 0),
    // back layer anywhere; front layers only in the top / bottom bands so the whale's path stays clear
    y: i < 6 ? 90 + rnd(i, 3) * 760 : i % 2 ? 60 + rnd(i, 3) * 170 : 800 + rnd(i, 3) * 160,
    z,
    speed: (140 + rnd(i, 4) * 90) * z * (i >= 13 ? 2.6 : 1),
    rot: (rnd(i, 5) - 0.5) * 30,
    spin: (rnd(i, 6) - 0.5) * 40,
  };
});

const Lines: React.FC<{ n: number; w: number; gap: number; seed: number; color?: string }> = ({ n, w, gap, seed, color = '#C9CBD3' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>
    {Array.from({ length: n }, (_, i) => (
      <div key={i} style={{ height: gap * 0.55, width: w * (i === n - 1 ? 0.5 : 0.75 + rnd(seed + i, 9) * 0.25), background: color, borderRadius: 4 }} />
    ))}
  </div>
);

const DocCard: React.FC<{ d: Doc; i: number; beat: number }> = ({ d, i, beat }) => {
  if (d.kind === 'book') {
    const flap = Math.sin((beat * 2 + i) * Math.PI) * 50;
    return (
      <div style={{ position: 'relative', width: 340, height: 230, perspective: 600 }}>
        <div style={{ position: 'absolute', inset: '-10px -12px -14px', background: '#5B6BC8', borderRadius: 10 }} />
        {[0, 1].map((s) => (
          <div key={s} style={{ position: 'absolute', left: s * 170, top: 0, width: 170, height: 230, background: '#FBFAF6', borderRadius: s ? '0 6px 6px 0' : '6px 0 0 6px', padding: '22px 16px', boxSizing: 'border-box' }}>
            <Lines n={7} w={135} gap={22} seed={i * 10 + s} />
          </div>
        ))}
        <div style={{
          position: 'absolute', left: 170, top: 0, width: 170, height: 230, background: '#F1EFE8', transformOrigin: '0 50%',
          transform: `rotateY(${-60 - flap}deg)`, borderRadius: '0 6px 6px 0', padding: '22px 16px', boxSizing: 'border-box',
        }}>
          <Lines n={7} w={135} gap={22} seed={i * 10 + 5} />
        </div>
      </div>
    );
  }
  const page = d.kind === 'page';
  return (
    <div style={{
      width: page ? 220 : 280, height: page ? 290 : 340, background: page ? '#FBFAF6' : '#fff', borderRadius: page ? 4 : 18, padding: '24px 22px',
      boxSizing: 'border-box', boxShadow: '0 10px 24px rgba(30,30,50,.14)', position: 'relative', overflow: 'hidden',
    }}>
      {!page && (
        <div style={{ fontFamily: F.zh, fontWeight: 700, fontSize: 30, color: INK, marginBottom: 18, whiteSpace: 'nowrap' }}>{d.title}</div>
      )}
      <Lines n={page ? 9 : 6} w={page ? 176 : 236} gap={page ? 22 : 26} seed={i * 7} />
      {!page && <div style={{ position: 'absolute', right: 0, top: 0, width: 46, height: 46, background: 'linear-gradient(225deg, #E6E8EE 50%, transparent 50%)' }} />}
    </div>
  );
};

export const S2b: React.FC = () => {
  const { beat, f } = useSection();
  const t = f / 30;
  const thump = [122.5, 124, 126].reduce((s, a) => s + hit(beat, a, 0.18), 0);
  const swim = interpolate(beat, [122, 127], [0.02, 0.98]);
  const cam = 1 + 0.06 * easeInOut(beat, 122, 5);
  const [sx, sy] = shake(f, 0.6 * hit(beat, 126, 0.25), 2);
  const search = [...S2_SEARCH];
  const typed = Math.min(search.length, Math.max(0, Math.floor((beat - 124.1) / 0.12) + 1));
  const sp = popIn(beat, 124, 0.35);
  const rp = popIn(beat, 126, 0.3);
  const doc = (d: Doc, i: number) => {
    const x = d.x - d.speed * (beat - 122) * 1.6;
    return (
      <div key={i} style={{
        position: 'absolute', left: x, top: d.y + 20 * Math.sin(t * 1.3 + i), transform: `translate(-50%,-50%) scale(${d.z}) rotate(${d.rot + d.spin * (beat - 122) * 0.3}deg)`,
        opacity: d.z < 0.8 ? 0.6 : 1, filter: d.z > 1.5 ? 'blur(3px)' : d.z < 0.8 ? 'blur(1px)' : undefined,
      }}>
        <DocCard d={d} i={i} beat={beat} />
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ background: '#E6E6EA', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px,${sy}px) scale(${cam})` }}>
        <VoidBG horizon={760} />
        {DOCS.slice(0, 6).map(doc)}
        <HeartAt x={960} y={500} size={1000} transform={`scale(${1 + 0.04 * thump}) rotate(${2 * Math.sin(t * 1.2)}deg)`} origin="50% 50%"
          swim={swim} whaleColor="rgba(255,255,255,.55)" />
        {DOCS.slice(6).map((d, i) => doc(d, i + 6))}
        <Motes t={t} n={20} seed={2} />
      </AbsoluteFill>
      <Kinetic text="我的语料里" beat={beat} at={122} until={127} stagger={0.22} size={112} color={INK} stroke="#fff" strokeWidth={14}
        style={{ position: 'absolute', left: 90, top: 70 }} />
      <Kinetic text="没写呀" beat={beat} at={125} until={127} stagger={0.3} mode="stamp" size={200} color="#fff" stroke={INK} strokeWidth={14}
        style={{ position: 'absolute', right: 110, top: 520 }} />
      {/* searching the corpus: nothing found */}
      {sp > 0 && (
        <div style={{ position: 'absolute', left: 110, top: 700, transform: `scale(${sp})`, transformOrigin: '0 50%' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 18, background: '#fff', borderRadius: 999, padding: '20px 38px 20px 30px',
            boxShadow: '0 14px 30px rgba(30,30,50,.18)', fontFamily: F.zh, fontWeight: 500, fontSize: 42, color: INK, width: 640,
          }}>
            <svg width={44} height={44} viewBox="0 0 24 24"><circle cx={10} cy={10} r={6.5} fill="none" stroke="#4D6BFE" strokeWidth={2.6} /><path d="M15 15 L21 21" stroke="#4D6BFE" strokeWidth={2.8} strokeLinecap="round" /></svg>
            <span>{search.slice(0, typed).join('')}</span>
            {beat < 126 && Math.floor(beat * 3) % 2 === 0 && <span style={{ width: 4, height: 46, background: '#4D6BFE' }} />}
          </div>
          {rp > 0 && (
            <div style={{
              marginTop: 18, marginLeft: 30, display: 'inline-flex', alignItems: 'center', gap: 12, background: '#FFE8EC', border: '3px solid #FFC2CD',
              borderRadius: 999, padding: '10px 28px', fontFamily: F.zh, fontWeight: 700, fontSize: 40, color: '#D92D4B',
              transform: `scale(${rp}) translateX(${Math.sin(f * 2.4) * 14 * hit(beat, 126, 0.4)}px)`, transformOrigin: '0 50%',
            }}>
              <WarnIcon size={38} color="#D92D4B" mark="#fff" />
              {S2_NO_RESULT}
            </div>
          )}
        </div>
      )}
      <Flash amount={0.3 * hit(beat, 122.5, 0.1)} />
    </AbsoluteFill>
  );
};

/* ───────── s2c 127-135 「是真是假 连我也无法验证」: the heart cracks; one half is a hallucination ───────── */

const C_FLOOR = 860;
const C_HEART = { x: 960, y: 480, size: 680 };
const C_SPLIT = 129;
const C_GHOST = 133;
const C_TAG = 131.5;

/** where a point (px, py) of the 200x190 heart lands on screen once BigHeart has split it by `split` */
const halfPoint = (px: number, py: number, split: number, side: 1 | -1) => {
  const a = (side * 14 * split * Math.PI) / 180;
  const dx = px - 100, dy = py - 182;
  const x = 100 + dx * Math.cos(a) - dy * Math.sin(a) + side * 34 * split;
  const y = 182 + dx * Math.sin(a) + dy * Math.cos(a) + 6 * split;
  const k = C_HEART.size / 200;
  return { x: C_HEART.x - C_HEART.size / 2 + x * k, y: C_HEART.y - C_HEART.size * 0.475 + y * k };
};

export const S2c: React.FC = () => {
  const { beat, f } = useSection();
  const t = f / 30;
  const crack = beat < C_SPLIT ? 0.625 * easeOut(beat, 128, 0.85) : 0.625 + 0.375 * prog(beat, C_SPLIT, 0.4);
  const split = popIn(beat, C_SPLIT, 0.55);
  const cam = 1 + 0.06 * easeInOut(beat, 127, 8) + 0.04 * hit(beat, C_SPLIT, 0.3);
  const [sx, sy] = shake(f, hit(beat, C_SPLIT, 0.3) + 0.4 * hit(beat, 128, 0.2) + 0.3 * hit(beat, 127, 0.2), 4);
  const ghost = easeInOut(beat, C_GHOST - 0.2, 1.2);
  const glitch = hit(beat, C_GHOST, 0.18) + hit(beat, 134, 0.18);
  const bobL = 10 * Math.sin(t * 1.6), bobR = 10 * Math.sin(t * 1.6 + 1.7);
  const pre = beat < C_SPLIT;
  const rightCol = mixHex('#E8304F', '#C3C5CE', ghost);
  const rightShade = mixHex('#B8183A', '#9B9EAB', ghost);
  const half = (side: 'l' | 'r', dx = 0) => (
    <div key={`${side}${dx}`} style={{
      position: 'absolute', inset: 0,
      clipPath: side === 'l' ? `polygon(-50% -50%, ${C_HEART.x}px -50%, ${C_HEART.x}px 150%, -50% 150%)` : `polygon(${C_HEART.x}px -50%, 150% -50%, 150% 150%, ${C_HEART.x}px 150%)`,
      transform: `translate(${dx}px, ${side === 'l' ? bobL : bobR}px)`,
    }}>
      <HeartAt {...C_HEART} crack={crack} split={split}
        color={side === 'l' ? undefined : rightCol} shade={side === 'l' ? undefined : rightShade}
        crackColor={side === 'l' ? '#2A0A14' : mixHex('#2A0A14', '#6E7180', ghost)} />
    </div>
  );
  const world = pre ? (
    <HeartAt {...C_HEART} y={C_HEART.y + bobL} crack={crack} origin="50% 50%"
      transform={`translateX(${Math.sin(f * 3) * 6 * prog(beat, 128, 0.5)}px) scale(${1 + 0.05 * hit(beat, 127, 0.2)})`} />
  ) : (
    <>
      {half('l')}
      {half('r', glitch > 0.05 ? Math.sin(f * 7) * 26 * glitch : 0)}
    </>
  );
  // shards thrown out of the crack on the split
  const shards = beat >= C_SPLIT && beat < C_SPLIT + 2.5 ? Array.from({ length: 14 }, (_, i) => {
    const u = beat - C_SPLIT;
    const a = -Math.PI / 2 + (rnd(i, 1) - 0.5) * 2.6;
    const v = 500 + rnd(i, 2) * 700;
    const x = C_HEART.x + (rnd(i, 3) - 0.5) * 60 + Math.cos(a) * v * u;
    const y = C_HEART.y - 120 + rnd(i, 4) * 400 + Math.sin(a) * v * u + 900 * u * u;
    const s = 14 + rnd(i, 5) * 22;
    return (
      <svg key={i} width={s} height={s} viewBox="0 0 10 10" style={{ position: 'absolute', left: x, top: y, transform: `rotate(${u * 600 * (rnd(i, 6) - 0.5)}deg)`, opacity: 1 - prog(beat, C_SPLIT + 1.5, 1) }}>
        <path d="M0 0 L10 3 L3 10 Z" fill={i % 3 ? '#E8304F' : '#2A0A14'} />
      </svg>
    );
  }) : null;
  // the ⚠ tag hangs off the right half's lobe
  const tp = popIn(beat, C_TAG, 0.4);
  const swing = 10 * Math.sin((beat - C_TAG) * 2.2) * Math.exp(-(beat - C_TAG) * 0.4) + 3 * Math.sin(t * 2);
  const pin = halfPoint(146, 22, split, 1);
  return (
    <AbsoluteFill style={{ background: '#E6E6EA', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px,${sy}px) scale(${cam})`, transformOrigin: `${C_HEART.x}px ${C_HEART.y}px` }}>
        <VoidBG horizon={600} />
        <FloorShadow x={C_HEART.x - 110 * split} y={C_FLOOR} w={pre ? 500 : 300} lift={0.3} />
        {!pre && <FloorShadow x={C_HEART.x + 110 * split} y={C_FLOOR} w={300} lift={0.3} />}
        <Mirror axis={C_FLOOR}>{world}</Mirror>
        {shards}
        {tp > 0 && (
          <div style={{ position: 'absolute', left: pin.x, top: pin.y + bobR, transform: `rotate(${swing}deg) scale(${tp})`, transformOrigin: '0 0' }}>
            <svg width={4} height={90} style={{ position: 'absolute', left: -2, top: 0 }}><line x1={2} y1={0} x2={2} y2={90} stroke={INK} strokeWidth={3} /></svg>
            <div style={{ position: 'absolute', left: -13, top: -13, width: 26, height: 26, borderRadius: 13, background: '#fff', border: `4px solid ${INK}`, boxSizing: 'border-box' }} />
            <div style={{
              position: 'absolute', left: 0, top: 90, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              background: '#2A2B33', borderRadius: 22, padding: '18px 30px 16px', boxShadow: '0 12px 24px rgba(20,20,40,.3)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: F.zh, fontWeight: 700, fontSize: 50, color: '#F2B33D', whiteSpace: 'nowrap' }}>
                <WarnIcon size={50} />
                {S2_UNVERIFIED}
              </div>
              {beat >= C_GHOST && <Disclaimer size={22} color="#A9ADB8" style={{ opacity: prog(beat, C_GHOST, 0.4) }} />}
            </div>
          </div>
        )}
        <Motes t={t} n={22} seed={3} />
      </AbsoluteFill>
      <Kinetic text="是真" beat={beat} at={128} until={135} stagger={0.4} mode="stamp" size={170} color={RED} stroke="#fff" strokeWidth={12}
        style={{ position: 'absolute', left: 80, top: 70 }} />
      <Kinetic text="是假" beat={beat} at={C_SPLIT + 0.05} until={135} stagger={0.4} mode="stamp" size={170} color={beat >= C_GHOST ? mixHex(INK, '#8F92A0', ghost) : INK} stroke="#fff" strokeWidth={12}
        style={{ position: 'absolute', right: 80, top: 640 }} />
      {/* the rest of the line sits in the crack */}
      <div style={{ position: 'absolute', left: 960, top: 200, transform: `translateX(-50%) scale(${cam})`, transformOrigin: '50% 280px', display: 'flex', flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 16 }}>
        <Kinetic text="连我也" beat={beat} at={131} until={135} stagger={0.35} size={66} color={GREYTXT} vertical />
        <Kinetic text="无法验证" beat={beat} at={132} until={135} stagger={0.3} size={112} color={INK} vertical style={{ marginTop: 56 }} />
      </div>
      <Flash amount={0.55 * hit(beat, C_SPLIT, 0.12)} />
    </AbsoluteFill>
  );
};

/* ───────── s2d 135-146 「这样的回答 又让一人沦陷」: the patched heart bounces across the floor into a user ───────── */

const D_FLOOR = 880;
const D_SIZE = 400;
const D_CONTACT = [136, 138, 140, 142, 143, 144, 145];
const D_X = [540, 760, 970, 1150, 1220, 1260, 1280];
const D_USER = { x: 1480, fall: 143.5 };

/** heart bottom-tip position + squash for a beat */
const bounce = (beat: number) => {
  if (beat < D_CONTACT[0]) {
    const u = prog(beat, 135, 1);
    return { x: D_X[0] - 60 * (1 - u), y: interpolate(u * u, [0, 1], [-60, D_FLOOR]), sq: 0, st: 0.18 * u * u, lift: 1 - u };
  }
  let i = D_CONTACT.length - 1;
  while (i > 0 && beat < D_CONTACT[i]) i--;
  const a = D_CONTACT[i];
  const b = D_CONTACT[i + 1] ?? a + 1.4;
  const u = clamp01((beat - a) / (b - a));
  const h = i + 1 >= D_CONTACT.length ? 40 : (b - a) >= 2 ? 300 : 120;
  const x = interpolate(u, [0, 1], [D_X[i], D_X[i + 1] ?? D_X[i] + 20]);
  const y = D_FLOOR - h * 4 * u * (1 - u);
  const v = Math.abs(1 - 2 * u);
  return { x, y, sq: hit(beat, a, 0.11) * (h > 100 ? 1 : 0.6), st: 0.13 * v ** 3 * (h / 300), lift: (h * 4 * u * (1 - u)) / 300 };
};

/** a user: the default-avatar silhouette with text-cursor eyes; smitten = heart eyes, `fall` 0..1 keels over */
const User: React.FC<{ beat: number; x: number; y: number; h: number; smit: boolean; fall: number; puffs?: number; seed?: number }> = ({
  beat, x, y, h, smit, fall, puffs, seed = 0,
}) => {
  const u = h / 100;
  const blink = Math.floor(beat * 2 + seed) % 2 === 0;
  const th = ((82 * fall + 4 * Math.sin(beat * Math.PI + seed) * (1 - fall)) * Math.PI) / 180;
  // head centre on screen: (50, 30) of the 100x100 box, rotated about the pivot (70, 100)
  const hx = x + 20 * u + (-20 * Math.cos(th) + 70 * Math.sin(th)) * u;
  const hy = y + (-20 * Math.sin(th) - 70 * Math.cos(th)) * u;
  return (
    <>
      <div style={{ position: 'absolute', left: x - 50 * u, top: y - 100 * u, width: 100 * u, height: 100 * u, transform: `rotate(${th}rad)`, transformOrigin: '70% 100%' }}>
        <svg width={100 * u} height={100 * u} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
          <path d="M14 100 L15 66 C16 54 30 50 50 50 C70 50 84 54 85 66 L86 100 Z" fill="#33354A" />
          <circle cx={50} cy={30} r={22} fill="#33354A" />
          {smit ? (
            <>
              <path d={heart(41, 30, 7)} fill="#FF4F8B" />
              <path d={heart(59, 30, 7)} fill="#FF4F8B" />
            </>
          ) : (
            blink && (
              <g fill="#fff">
                <rect x={40} y={23} width={3.5} height={12} />
                <rect x={57} y={23} width={3.5} height={12} />
              </g>
            )
          )}
        </svg>
      </div>
      {/* little hearts float up off a smitten user (looping for the ones already lying there) */}
      {puffs !== undefined && Array.from({ length: 4 }, (_, i) => {
        const a = puffs + i * 0.4;
        const p = puffs < 136 ? (((beat - a) / 1.4) % 1.6) : (beat - a) / 1.4;
        if (beat < a || p <= 0 || p >= 1) return null;
        return (
          <svg key={i} width={40 * u} height={40 * u} viewBox="0 0 40 40" style={{
            position: 'absolute', left: hx - 20 * u + (rnd(i + seed, 3) - 0.5) * 50 * u + Math.sin(p * 6 + i) * 6 * u, top: hy - 40 * u - p * 70 * u,
            opacity: 1 - p, transform: `scale(${Math.min(1, p * 5) * 0.8})`,
          }}>
            <path d={heart(20, 20, 14)} fill="#FF4F8B" />
          </svg>
        );
      })}
    </>
  );
};

export const S2d: React.FC = () => {
  const { beat, f } = useSection();
  const t = f / 30;
  const b = bounce(beat);
  const sx = (1 + 0.38 * b.sq) * (1 - 0.55 * b.st);
  const sy = (1 - 0.34 * b.sq) * (1 + b.st);
  const tilt = 7 * Math.sin((beat - 135) * Math.PI * 0.5);
  const camX = -(b.x - 900) * 0.1;
  const [kx, ky] = shake(f, D_CONTACT.reduce((s, a) => s + hit(beat, a, 0.12), 0) * 0.5, 6);
  const plus = popIn(beat, 144, 0.35);
  const k = D_SIZE / 200;
  const world = (
    <>
      {/* earlier victims, already lying on the floor */}
      <User beat={beat} x={90} y={D_FLOOR} h={180} smit fall={1} puffs={130} seed={1} />
      <User beat={beat} x={300} y={D_FLOOR} h={165} smit fall={1} puffs={130.6} seed={2} />
      <HeartAt x={b.x} y={fromTip(b.y, D_SIZE)} size={D_SIZE} crack={0.6} crackColor="#8E1530"
        transform={`scale(${sx},${sy}) rotate(${tilt * (1 - b.sq)}deg)`}>
        {/* the plaster over the crack */}
        <div style={{
          position: 'absolute', left: 70 * k, top: 82 * k, width: 60 * k, height: 22 * k, transform: 'rotate(-28deg)',
          background: '#F3D3AE', borderRadius: 11 * k, border: '2.5px solid #C99A6B', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ width: 16 * k, height: 14 * k, background: '#E7BE92', borderRadius: 3 }} />
        </div>
      </HeartAt>
      <User beat={beat} x={D_USER.x} y={D_FLOOR} h={230} smit={beat >= 143} fall={easeIn3(beat, D_USER.fall, 0.6)} puffs={143} />
    </>
  );
  return (
    <AbsoluteFill style={{ background: '#E6E6EA', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${camX + kx}px,${ky}px) scale(1.04)` }}>
        <VoidBG horizon={560} />
        <FloorShadow x={b.x} y={D_FLOOR} w={330 * (1 + 0.3 * b.sq)} lift={b.lift} />
        <FloorShadow x={D_USER.x} y={D_FLOOR} w={180} />
        {/* impact rings on the floor */}
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          {D_CONTACT.map((a, i) => {
            const p = prog(beat, a, 0.7);
            if (p <= 0 || p >= 1) return null;
            const r = 60 + 260 * easeOut(beat, a, 0.7) * (i < 4 ? 1 : 0.6);
            return <ellipse key={a} cx={D_X[i]} cy={D_FLOOR} rx={r} ry={r * 0.16} fill="none" stroke="#fff" strokeWidth={6 * (1 - p)} opacity={0.9 * (1 - p)} />;
          })}
        </svg>
        <Mirror axis={D_FLOOR}>{world}</Mirror>
        {plus > 0 && (
          <div style={{
            position: 'absolute', left: D_USER.x + 60, top: 560, transform: `translate(-50%,-50%) scale(${plus}) rotate(-6deg)`,
            background: RED, color: '#fff', fontFamily: F.zh, fontWeight: 700, fontSize: 50, padding: '10px 30px', borderRadius: 999,
            boxShadow: '0 10px 20px rgba(160,20,50,.3)', whiteSpace: 'nowrap',
          }}>{S2_FELL}</div>
        )}
        <Motes t={t} n={18} seed={4} />
      </AbsoluteFill>
      {/* one row across the top: the answer on the left, its victim on the right */}
      <Kinetic text="这样的回答" beat={beat} at={135} until={146} stagger={0.35} size={124} color={INK}
        style={{ position: 'absolute', left: 90, top: 60 }} />
      <Kinetic text="又让一人" beat={beat} at={140} until={146} stagger={0.4} size={96} color={GREYTXT}
        style={{ position: 'absolute', left: 1030, top: 92 }} />
      <Kinetic text="沦陷" beat={beat} at={143} until={146} stagger={0.3} mode="stamp" size={180} color={RED} stroke="#fff" strokeWidth={12}
        style={{ position: 'absolute', left: 1450, top: 40 }} />
      <Flash amount={0.3 * hit(beat, 143, 0.1)} />
    </AbsoluteFill>
  );
};

/* ───────── s2e 146-152 「又多了一位重度用户」: one heart becomes 2, 4, 8 … on every beat ───────── */

const E_AT = [146, 147, 148, 149, 150, 151, 151.5];
const E_BOX = { x: 40, y: 30, w: 1840, h: 990 };
type Rect = { x: number; y: number; w: number; h: number };
const cell = (j: number, k: number): Rect => {
  if (k === 0) return E_BOX;
  const p = cell(j >> 1, k - 1);
  const side = j & 1;
  return k % 2 === 1 ? { x: p.x + side * (p.w / 2), y: p.y, w: p.w / 2, h: p.h } : { x: p.x, y: p.y + side * (p.h / 2), w: p.w, h: p.h / 2 };
};
const cellHeart = (r: Rect, k: number) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2, size: Math.min(r.w, r.h / 0.95) * (k === 0 ? 0.72 : 0.8) });
const E_COLORS = ['#E8304F', '#F2477A', '#E8304F', '#D42346', '#FF6F9C', '#E8304F'];

/** horizontal ink seal (lib Stamp lays 3+ characters out vertically) */
const Seal: React.FC<{ text: string; size: number; id: string }> = ({ text, size, id }) => (
  <div style={{ position: 'relative', filter: `url(#${id})` }}>
    <svg width={0} height={0} style={{ position: 'absolute' }}>
      <filter id={id}>
        <feTurbulence type="fractalNoise" baseFrequency={0.06} numOctaves={2} seed={11} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={size * 0.08} />
      </filter>
    </svg>
    <div style={{
      border: `${size * 0.14}px solid ${RED}`, borderRadius: size * 0.2, padding: `${size * 0.1}px ${size * 0.3}px`, fontFamily: F.serif, fontWeight: 900,
      fontSize: size, lineHeight: 1.05, color: RED, letterSpacing: size * 0.06, whiteSpace: 'nowrap', outline: `${size * 0.03}px solid ${RED}`, outlineOffset: -size * 0.3,
    }}>{text}</div>
  </div>
);

export const S2e: React.FC = () => {
  const { beat, f } = useSection();
  const t = f / 30;
  let lv = 0;
  E_AT.forEach((a, k) => { if (beat >= a) lv = k; });
  const at = E_AT[lv];
  const move = easeOut(beat, at, 0.32);
  const pop = hit(beat, at, 0.2);
  const n = 2 ** lv;
  const hearts: React.ReactNode[] = [];
  for (let j = 0; j < n; j++) {
    const to = cellHeart(cell(j, lv), lv);
    const from = lv === 0 ? { ...to, size: 0 } : cellHeart(cell(j >> 1, lv - 1), lv - 1);
    const x = interpolate(move, [0, 1], [from.x, to.x]);
    const y = interpolate(move, [0, 1], [from.y, to.y]);
    const size = lv === 0 ? to.size * popIn(beat, at, 0.45) : interpolate(move, [0, 1], [from.size, to.size]);
    const wob = Math.sin(t * 3 + j * 1.7) * 4;
    hearts.push(
      <HeartAt key={`${lv}_${j}`} x={x} y={y + Math.sin(t * 2.2 + j) * 6} size={Math.max(1, size)} origin="50% 50%"
        transform={`scale(${1 + 0.16 * pop * (j & 1 ? 1 : 0.8)}, ${1 - 0.1 * pop}) rotate(${wob + (j & 1 ? 8 : -8) * pop}deg)`}
        color={E_COLORS[(j * 7 + lv) % E_COLORS.length]} />,
    );
  }
  const count = lv === 6 ? '99+' : String(n);
  const sealP = popIn(beat, 148.5, 0.3);
  return (
    <AbsoluteFill style={{ background: '#E6E6EA', overflow: 'hidden' }}>
      <VoidBG horizon={700} tiles={0.15} />
      <AbsoluteFill style={{ transform: `scale(${1.04 - 0.04 * easeOut(beat, 146, 6)})` }}>{hearts}</AbsoluteFill>
      <Kinetic text="又多了一位" beat={beat} at={146} until={152} stagger={0.3} size={120} color={INK} stroke="#fff" strokeWidth={16}
        style={{ position: 'absolute', left: 80, top: 60 }} />
      {/* counter */}
      <div style={{
        position: 'absolute', right: 70, top: 70, display: 'flex', alignItems: 'center', gap: 16, background: '#fff', borderRadius: 999,
        padding: '14px 34px 14px 24px', boxShadow: '0 12px 26px rgba(30,30,50,.2)', fontFamily: F.zh, fontWeight: 700, fontSize: 42, color: INK,
        transform: `scale(${popIn(beat, 146.2, 0.4) * (1 + 0.12 * pop)})`, transformOrigin: '100% 50%',
      }}>
        <svg width={44} height={44} viewBox="0 0 44 44"><path d={heart(22, 23, 16)} fill={RED} /></svg>
        <span>{S2_HEAVY}</span>
        <span style={{ color: RED, fontSize: 56, minWidth: 90, textAlign: 'right', display: 'inline-block', transform: `translateY(${-10 * pop}px)` }}>×{count}</span>
      </div>
      {sealP > 0 && (
        <div style={{ position: 'absolute', left: 960, top: 560, transform: `translate(-50%,-50%) scale(${interpolate(sealP, [0, 1], [2.4, 1])}) rotate(-8deg)` }}>
          <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 34, padding: '22px 30px' }}>
            <Seal text={S2_HEAVY} size={150} id="s2e_seal" />
          </div>
        </div>
      )}
      <Flash amount={0.18 * pop} />
    </AbsoluteFill>
  );
};

/* ───────── s2f 152-159 「所有人的目光都被夺去」: the dark audience, every cursor eye lights at once, push-in → white ───────── */

const CROWD = { w: 1920, h: 640, rows: 5, perRow: 7, seed: 3, top: 250 };
const F_HIT = 153;

/** eye position (frame coords) of the front-row member nearest the centre, replicating Crowd's layout */
const crowdTarget = () => {
  const { w, h, rows, perRow, seed, top } = CROWD;
  let n = 0;
  for (let r = rows - 1; r >= 1; r--) n += Math.round(perRow / (1 - r * 0.2)) + 2;
  const u = (w / perRow) * 0.5;
  const count = perRow + 2;
  let best = { x: 960, y: 800, d: 1e9 };
  for (let i = 0; i < count; i++) {
    const k = seed * 1000 + n + i;
    const x = ((i + 0.5 + (rnd(k, 1) - 0.5) * 0.5) / count) * w * 1.06 - w * 0.03;
    const hs = 0.9 + rnd(k, 2) * 0.25;
    const y = h + u * 0.15 - rnd(k, 3) * u * 0.18;
    const hx = x + (rnd(k, 4) - 0.5) * u * 0.1;
    const hy = y - u * 1.05 * hs;
    const hr = u * 0.38 * hs;
    const d = Math.abs(hx - 960);
    if (d < best.d) best = { x: hx, y: top + hy + hr * 0.15, d };
  }
  return best;
};
const TARGET = crowdTarget();

export const S2f: React.FC = () => {
  const { beat, f } = useSection();
  const lit = beat >= F_HIT;
  const z = easeIn3(beat, F_HIT, 6);
  const push = 1 + 0.12 * easeOut(beat, 152, 1) + 0.15 * hit(beat, F_HIT, 0.3) + 5.2 * z;
  // the stared-at eyes drift to the centre of the frame as the push accelerates
  const cx = (960 - TARGET.x) * z, cy = (540 - TARGET.y) * z;
  const [sx, sy] = shake(f, hit(beat, F_HIT, 0.35) * 1.2, 7);
  const speed = prog(beat, 156, 3);
  const white = prog(beat, 158.2, 0.72) ** 2;
  const eyeP = popIn(beat, F_HIT, 0.25);
  return (
    <AbsoluteFill style={{ background: '#050509', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${sx + cx}px,${sy + cy}px) scale(${push})`, transformOrigin: `${TARGET.x}px ${TARGET.y}px` }}>
        {/* stage spill from above */}
        <div style={{
          position: 'absolute', left: 260, top: -300, width: 1400, height: 1100, borderRadius: '50%',
          background: `radial-gradient(closest-side, rgba(255,60,95,${lit ? 0.22 : 0.05}), rgba(255,60,95,0))`,
        }} />
        {lit && (
          <div style={{
            position: 'absolute', left: 0, right: 0, top: 110, display: 'flex', justifyContent: 'center', fontFamily: F.serif, fontWeight: 900, fontSize: 400,
            lineHeight: 1, color: '#FF3B5C', letterSpacing: 30, textShadow: '0 0 40px rgba(255,59,92,.7), 0 0 120px rgba(255,59,92,.4)',
            transform: `scale(${interpolate(eyeP, [0, 1], [1.5, 1])})`, opacity: Math.min(1, eyeP * 2),
          }}>目光</div>
        )}
        <Crowd beat={beat} width={CROWD.w} height={CROWD.h} rows={CROWD.rows} perRow={CROWD.perRow} seed={CROWD.seed} color="#1B1D2E" haze="#08080E"
          eyes={lit ? 1 : 0.14} blink={!lit} eyeColor="#FF3B5C" sticks={0.4 * easeOut(beat, 155.5, 2)} sway={16}
          style={{ position: 'absolute', left: 0, top: CROWD.top }} />
      </AbsoluteFill>
      {/* speed lines converging on the stare */}
      {speed > 0 && (
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
          {Array.from({ length: 70 }, (_, i) => {
            const a = rnd(i, 1) * Math.PI * 2;
            const r0 = 420 + rnd(i + f, 2) * 500 * (1 - speed * 0.5);
            const len = 200 + rnd(i, 3) * 900 * speed;
            const show = rnd(i + Math.floor(f / 2) * 13, 4) < speed;
            return show ? (
              <line key={i} x1={TARGET.x + cx + Math.cos(a) * r0} y1={TARGET.y + cy + Math.sin(a) * r0} x2={TARGET.x + cx + Math.cos(a) * (r0 + len)} y2={TARGET.y + cy + Math.sin(a) * (r0 + len)}
                stroke="#fff" strokeWidth={2 + rnd(i, 5) * 4} opacity={0.35 + 0.4 * rnd(i, 6)} />
            ) : null;
          })}
        </svg>
      )}
      <Kinetic text="所有人的" beat={beat} at={152} until={159} stagger={0.2} size={88} color="#B9BED4" vertical
        style={{ position: 'absolute', left: 90, top: 90 }} />
      <Kinetic text="都被夺去" beat={beat} at={155.5} until={159} stagger={0.35} mode="stamp" size={140} color="#fff" vertical
        style={{ position: 'absolute', right: 90, top: 90 }} />
      <Flash amount={0.5 * hit(beat, F_HIT, 0.12)} color="#FFD0DA" />
      <Flash amount={white} />
    </AbsoluteFill>
  );
};

export const S2_SCENES: Record<string, React.FC> = { s2a: S2a, s2b: S2b, s2c: S2c, s2d: S2d, s2e: S2e, s2f: S2f };
