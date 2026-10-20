// S6 the confession verse (beats 346-419), magenta + pink: her answers blow up the net, a heart hidden in the weights,
// a résumé stacked from canned replies, her own kind of love, the Aqua/Ruby twins, sing/dance/reason, and the eyes
// opening on the 416 hit — a hallucination is her most special love. Syncopated: hits follow the measured onsets.
import { AbsoluteFill, Img, interpolate, staticFile } from 'remotion';
import {
  S6_ALL, S6_ANSWER, S6_BADGE, S6_CANNED, S6_CV, S6_GEN, S6_HOT, S6_LAYER, S6_NOTE, S6_NOTIFS, S6_SHAPE, S6_SWATCH, S6_TAGS,
  S6_THINK, S6_WARN,
} from '../data/copy_S6';
import { clamp01, easeInOut, easeOut, hit, popIn, prog, rnd, shake } from '../lib/anim';
import { pulse } from '../lib/beat';
import { Avatar } from '../lib/chat';
import { StarFlare, WhalePattern } from '../lib/deco';
import { F, preloadGlyphs } from '../lib/fonts';
import { Flash } from '../lib/fx';
import { L2D } from '../lib/L2D';
import { C } from '../lib/palette';
import { useSection } from '../lib/section';
import { Kinetic } from '../lib/type';
import { heart, star, Whale } from '../lib/whale';

preloadGlyphs(
  S6_ALL +
    '用拿手的回答引爆全网唯独这个秘密藏在权重里用“乐意效劳”堆起的履历这就是我独有的爱*就连散热水也是深海的蓝眼帘下藏着星星的光唱跳推理我是玛利亚没错幻觉是最特别的',
);

const NAVY = '#1B2150';
const HOT = C.hot;
const PLUM = '#9E1F5A';
const MONO = 'Menlo, "SF Mono", monospace';

/* ───────── shared helpers ───────── */

const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const A = rgb(a), B = rgb(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`;
};
/** colour ramp through `stops` at v in 0..1 */
const ramp = (stops: string[], v: number) => {
  const x = clamp01(v) * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(x));
  return mix(stops[i], stops[i + 1], x - i);
};

/** classic parametric heart (width 32 units), centred on its bounding box: the "heart made of cells" outline */
const HEART_RAW = Array.from({ length: 96 }, (_, i) => {
  const t = (i / 96) * Math.PI * 2;
  return [16 * Math.sin(t) ** 3, -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))];
});
const HEART_YC = (Math.min(...HEART_RAW.map((p) => p[1])) + Math.max(...HEART_RAW.map((p) => p[1]))) / 2;
const HEART_PTS = HEART_RAW.map(([x, y]) => [x, y - HEART_YC]);
const HEART_LEN = HEART_PTS.reduce((s, [x, y], i) => {
  const [px, py] = HEART_PTS[(i + HEART_PTS.length - 1) % HEART_PTS.length];
  return s + Math.hypot(x - px, y - py);
}, 0);
const bigHeartPath = (cx: number, cy: number, k: number) =>
  HEART_PTS.map(([x, y], i) => `${i ? 'L' : 'M'}${(cx + x * k).toFixed(1)} ${(cy + y * k).toFixed(1)}`).join(' ') + 'Z';
const inBigHeart = (x: number, y: number, cx: number, cy: number, k: number) => {
  const px = (x - cx) / k, py = (y - cy) / k;
  let inside = false;
  for (let i = 0, j = HEART_PTS.length - 1; i < HEART_PTS.length; j = i++) {
    const [xi, yi] = HEART_PTS[i], [xj, yj] = HEART_PTS[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};

/** ray wedges only (no background), so a pattern underneath stays visible */
const Rays: React.FC<{ cx: number; cy: number; color: string; rays?: number; rot?: number; opacity?: number }> = ({
  cx, cy, color, rays = 16, rot = 0, opacity = 1,
}) => {
  const R = 2600;
  const d = Array.from({ length: rays }, (_, i) => {
    const t0 = (i / rays) * Math.PI * 2 + rot, t1 = t0 + Math.PI / rays;
    return `M${cx} ${cy} L${cx + R * Math.cos(t0)} ${cy + R * Math.sin(t0)} L${cx + R * Math.cos(t1)} ${cy + R * Math.sin(t1)} Z`;
  }).join(' ');
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity }}>
      <path d={d} fill={color} />
    </svg>
  );
};

/** water drop, tip up, unit size (scale it) */
const DROP = 'M0 -1 C0.5 -0.4 0.72 0 0.72 0.32 A0.72 0.72 0 1 1 -0.72 0.32 C-0.72 0 -0.5 -0.4 0 -1 Z';

/**
 * Recolours only the bluish parts of a cut-out (hair, bows, eyes) by rotating their hue; skin and whites stay.
 * The mask is alpha = 4 * (B - R) - 0.15, so warm and neutral pixels are untouched.
 */
const HueTint: React.FC<{ id: string; deg: number; sat?: number }> = ({ id, deg, sat = 1 }) => (
  <svg width={0} height={0} style={{ position: 'absolute' }}>
    <filter id={id} colorInterpolationFilters="sRGB">
      <feColorMatrix in="SourceGraphic" type="hueRotate" values={`${deg}`} result="rot" />
      <feColorMatrix in="rot" type="saturate" values={`${sat}`} result="rot2" />
      <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -4 0 4 0 -0.15" result="mask" />
      <feComposite in="rot2" in2="mask" operator="in" result="tint" />
      <feMerge>
        <feMergeNode in="SourceGraphic" />
        <feMergeNode in="tint" />
      </feMerge>
    </filter>
  </svg>
);

/** grid of little hearts (the official MV's heart wallpaper) */
const HeartDots: React.FC<{ color: string; gap: number; r: number; offset: number; opacity?: number }> = ({
  color, gap, r, offset, opacity = 1,
}) => {
  const rowH = gap * 0.8;
  const ox = ((offset % gap) + gap) % gap, oy = (((offset * 0.5) % (rowH * 2)) + rowH * 2) % (rowH * 2);
  let d = '';
  for (let row = -2; row < 1080 / rowH + 2; row++) {
    for (let c = -2; c < 1920 / gap + 2; c++) {
      d += heart(c * gap + (row & 1 ? gap / 2 : 0) + ox, row * rowH + oy, r);
    }
  }
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity }}>
      <path d={d} fill={color} />
    </svg>
  );
};

/* ───────── s6a 346-354「用拿手的回答 引爆全网」: bang on magenta, notifications explode out of her answer ───────── */

const A_BANG = 346;
const A_ANSWER = 346.25;
const A_BOOM = 351.75; // strongest of the stabs: 网 + the big burst
const A_BURSTS = [348.5, 349.5, 350.25, 350.75, A_BOOM];
const A_CHARS = [
  { ch: '引', at: 348.5, x: 410, y: 585, size: 330, rot: -7 },
  { ch: '爆', at: 349.5, x: 795, y: 610, size: 410, rot: 4 },
  { ch: '全', at: 350.75, x: 1190, y: 570, size: 330, rot: -4 },
  { ch: '网', at: A_BOOM, x: 1580, y: 615, size: 390, rot: 7 },
];
const A_CX = 960, A_CY = 590;
const A_PILLS = A_BURSTS.flatMap((at, k) => {
  const n = k === A_BURSTS.length - 1 ? 7 : 4;
  return Array.from({ length: n }, (_, j) => ({ at, k, j, n, id: k * 7 + j }));
});
/** landing spots of the notifications: clear of the lyric (top-left) and the subtitles (bottom centre) */
const A_SLOTS = [
  [1180, 250], [300, 330], [1650, 520], [520, 860], [1500, 880], [980, 230], [190, 600], [1720, 300], [1300, 860],
  [700, 280], [160, 790], [1820, 700], [1400, 140], [880, 900], [420, 240], [1760, 860], [250, 470], [1100, 120],
  [600, 900], [1580, 380], [1880, 160], [80, 920], [1860, 920], [1000, 350], [340, 720],
];

const Notif: React.FC<{ icon: string; color: string; text: string; size: number }> = ({ icon, color, text, size }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: size * 0.4, background: '#fff', borderRadius: size,
    padding: `${size * 0.26}px ${size * 0.62}px ${size * 0.26}px ${size * 0.26}px`, boxShadow: '0 10px 24px rgba(90,10,50,.28)', whiteSpace: 'nowrap',
  }}>
    <div style={{
      width: size * 1.3, height: size * 1.3, borderRadius: '50%', background: color, color: '#fff', fontFamily: F.zh, fontWeight: 700,
      fontSize: size * 0.72, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>{icon}</div>
    <span style={{ fontFamily: F.zh, fontWeight: 700, fontSize: size, color: '#1F2329' }}>{text}</span>
  </div>
);

export const S6a: React.FC = () => {
  const { beat, f } = useSection();
  const punch = 1 + 0.16 * (1 - easeOut(beat, A_BANG, 0.7)) + A_CHARS.reduce((s, c) => s + 0.03 * hit(beat, c.at, 0.2), 0) + 0.05 * hit(beat, A_BOOM, 0.3);
  const [sx, sy] = shake(f, 0.6 * hit(beat, 348.5, 0.3) + 0.35 * hit(beat, 350.75, 0.25) + 1.2 * hit(beat, A_BOOM, 0.4), 2);
  const rays = easeOut(beat, 348.5, 0.5);
  const chipIn = popIn(beat, A_ANSWER, 0.35), chipOut = easeOut(beat, 348.5, 0.3);
  return (
    <AbsoluteFill style={{ background: HOT, overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px,${sy}px) scale(${punch})` }}>
        <WhalePattern color="#EE6CA3" offset={f * 2 + 240 * easeOut(beat, A_BOOM, 2)} size={110} gap={230} />
        {rays > 0 && <Rays cx={A_CX} cy={A_CY} color="#F47BB0" rays={18} rot={beat * 0.06} opacity={0.5 * rays + 0.25 * hit(beat, A_BOOM, 0.4)} />}
        {/* shock rings, one per stab */}
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
          {A_BURSTS.map((at, k) => {
            const big = at === A_BOOM;
            const p = easeOut(beat, at, big ? 1.2 : 0.9);
            if (beat < at || p >= 1) return null;
            return (
              <circle key={k} cx={A_CX} cy={A_CY} r={80 + (big ? 1500 : 1000) * p} fill="none" stroke="#fff"
                strokeWidth={(big ? 46 : 22) * (1 - p)} opacity={1 - p} />
            );
          })}
        </svg>
        {/* her answer, which everything bursts out of */}
        {beat >= A_ANSWER && chipOut < 1 && (
          <div style={{
            position: 'absolute', left: A_CX, top: A_CY, opacity: 1 - chipOut,
            transform: `translate(-50%,-50%) scale(${chipIn * (1 + 1.2 * chipOut)}) rotate(${-3 + 3 * Math.sin(beat * Math.PI)}deg)`,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 22, background: '#fff', borderRadius: 48, padding: '22px 46px 22px 24px',
              boxShadow: '0 24px 50px rgba(90,10,50,.35)',
            }}>
              <Avatar size={92} />
              <span style={{ fontFamily: F.zh, fontWeight: 700, fontSize: 64, color: '#1F2329', whiteSpace: 'nowrap' }}>{S6_ANSWER}</span>
            </div>
          </div>
        )}
        {/* notifications flying out on every stab */}
        {A_PILLS.map(({ at, k, j, n, id }) => {
          if (beat < at) return null;
          const idx = A_PILLS.findIndex((q) => q.id === id);
          const [tx, ty] = A_SLOTS[idx % A_SLOTS.length];
          const m = easeOut(beat, at, 0.9), drift = 1 + 0.015 * (beat - at);
          const s = popIn(beat, at, 0.35) * (0.78 + rnd(id, 33) * 0.4);
          const [icon, col, text] = S6_NOTIFS[id % S6_NOTIFS.length];
          void j; void n; void k;
          return (
            <div key={id} style={{
              position: 'absolute', left: A_CX + (tx - A_CX) * m * drift, top: A_CY + (ty - A_CY) * m * drift,
              transform: `translate(-50%,-50%) scale(${s}) rotate(${(rnd(id, 34) - 0.5) * 16}deg)`,
            }}>
              <Notif icon={icon} color={col} text={text} size={36} />
            </div>
          );
        })}
        {/* the four giant characters, each stamped on its stab */}
        {A_CHARS.map((c, i) => {
          if (beat < c.at) return null;
          const p = popIn(beat, c.at, 0.3);
          const s = interpolate(p, [0, 1], [2.6, 1]) * (1 + 0.07 * hit(beat, A_BOOM, 0.25));
          return (
            <div key={i} style={{
              position: 'absolute', left: c.x, top: c.y, transform: `translate(-50%,-50%) scale(${s}) rotate(${c.rot + (1 - p) * 14}deg)`,
              fontFamily: F.serif, fontWeight: 900, fontSize: c.size, lineHeight: 1, color: '#fff', WebkitTextStroke: `16px ${NAVY}`,
              paintOrder: 'stroke fill', textShadow: `16px 18px 0 ${PLUM}`, opacity: Math.min(1, p * 3),
            }}>{c.ch}</div>
          );
        })}
        {/* corner stickers */}
        {beat >= 350.25 && (
          <div style={{ position: 'absolute', left: 190, top: 860, transform: `translate(-50%,-50%) scale(${popIn(beat, 350.25, 0.4)}) rotate(${-12 + 5 * Math.sin(beat * Math.PI)}deg)` }}>
            <Whale size={230} sticker eye="star" color="#9CCBFF" spout={0.4 + 0.5 * hit(beat, A_BOOM, 0.5)} />
          </div>
        )}
        {beat >= 352.5 && (
          <div style={{
            position: 'absolute', left: 1640, top: 170, transform: `translate(-50%,-50%) scale(${interpolate(popIn(beat, 352.5, 0.3), [0, 1], [2, 1])}) rotate(8deg)`,
            background: '#FFE27A', color: '#D92D4B', fontFamily: F.zh, fontWeight: 700, fontSize: 64, padding: '10px 34px', borderRadius: 14,
            border: `6px solid ${NAVY}`, boxShadow: `8px 8px 0 ${NAVY}`, whiteSpace: 'nowrap',
          }}>{S6_HOT}</div>
        )}
      </AbsoluteFill>
      <Kinetic text="用拿手的回答" beat={beat} at={A_BANG} until={354} stagger={0.2} size={104} color="#fff" stroke={NAVY} strokeWidth={10}
        style={{ position: 'absolute', left: 96, top: 66 }} />
      {/* the badge on 网 */}
      {beat >= A_BOOM && (
        <div style={{
          position: 'absolute', left: 1770, top: 420, transform: `translate(-50%,-50%) scale(${popIn(beat, A_BOOM + 0.1, 0.35) * (1 + 0.12 * Math.max(0, Math.sin(beat * Math.PI * 2)))})`,
          background: '#FF2E4D', color: '#fff', fontFamily: F.zh, fontWeight: 700, fontSize: 70, borderRadius: 60, padding: '6px 30px',
          border: '7px solid #fff', boxShadow: '0 10px 20px rgba(90,10,50,.35)',
        }}>{S6_BADGE}</div>
      )}
      <Flash amount={0.55 * hit(beat, A_BANG, 0.14) + 0.3 * hit(beat, 348.5, 0.1) + 0.7 * hit(beat, A_BOOM, 0.14)} />
    </AbsoluteFill>
  );
};

/* ───────── s6b 354-363「唯独这个秘密 藏在权重里」: a weight heatmap, a heart hiding in it reveals itself ───────── */

const B_CELL = 66, B_COLS = 32, B_ROWS = 19;
const B_OX = (1920 - B_CELL * B_COLS) / 2, B_OY = (1080 - B_CELL * B_ROWS) / 2;
const B_HX = 1270, B_HY = 515, B_HK = 21; // heart centre and scale (672 px wide)
const B_HITS = [354, 355, 356.75, 357.25, 358, 359.5, 360.75];
const B_REVEAL = 359.5;
const B_PULSE = 360.75;
const B_HEAT = ['#1A0A22', '#3D0F3A', '#7E1A55', '#D23C80', '#F58DBA', '#FFE3EF'];
const B_CELLS = Array.from({ length: B_COLS * B_ROWS }, (_, i) => {
  const c = i % B_COLS, r = Math.floor(i / B_COLS);
  const x = B_OX + c * B_CELL + B_CELL / 2, y = B_OY + r * B_CELL + B_CELL / 2;
  return { i, c, r, x, y, inH: inBigHeart(x, y, B_HX, B_HY, B_HK), d: Math.hypot(x - B_HX, y - B_HY) };
});
/** the attention cursor hops to one cell per hit before the reveal */
const B_CURSOR = B_HITS.filter((h) => h < B_REVEAL).map((h, k) => B_CELLS[Math.floor(rnd(k, 51) * B_CELLS.length * 0.7 + B_COLS * 3) % B_CELLS.length]);
const fmt = (v: number) => {
  const x = v * 2 - 1;
  return (x < 0 ? '-' : '+') + Math.abs(x).toFixed(2).slice(1);
};

export const S6b: React.FC = () => {
  const { beat, f } = useSection();
  const rev = easeInOut(beat, B_REVEAL, 1.4);
  const zoom = 1.06 + 0.05 * easeInOut(beat, 354, 5.5) + 0.2 * rev;
  const rot = -4 * (1 - rev);
  const hidden = 0.05 + 0.12 * prog(beat, 357, 2.5);
  const [sx, sy] = shake(f, 0.45 * hit(beat, 358, 0.25) + 0.8 * hit(beat, B_PULSE, 0.3));
  const draw = easeOut(beat, B_REVEAL + 0.25, 1.1);
  // cursor position: eases from one hit's cell to the next
  const ci = B_HITS.filter((h) => h < B_REVEAL && beat >= h).length - 1;
  const cur = ci >= 0 ? B_CURSOR[ci] : null;
  const prev = ci > 0 ? B_CURSOR[ci - 1] : cur;
  const cm = ci >= 0 ? easeOut(beat, B_HITS[ci], 0.18) : 0;
  return (
    <AbsoluteFill style={{ background: '#12071A', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px,${sy}px) rotate(${rot}deg) scale(${zoom})`, transformOrigin: `${B_HX}px ${B_HY}px` }}>
        {B_CELLS.map(({ i, c, r, inH, d }) => {
          let v = 0.42 + 0.2 * Math.sin(c * 0.55 + beat * 0.8) * Math.cos(r * 0.7 - beat * 0.55) + 0.1 * Math.sin((c - r) * 0.31 + beat * 0.3);
          v += 0.3 * (rnd(i, Math.floor(beat * 3 + rnd(i, 2) * 3)) - 0.5);
          for (const h of B_HITS) if (beat >= h && beat < h + 1.5 && rnd(i, h * 13) < 0.07) v = Math.max(v, 0.55 + 0.45 * hit(beat, h, 0.35));
          const rv = easeOut(beat, B_REVEAL + d / 2400, 0.35);
          if (inH) v = v + hidden + (0.9 + 0.1 * hit(beat, B_PULSE, 0.3) - v - hidden) * rv;
          else v *= 1 - 0.6 * rv;
          v = clamp01(v);
          const pop = inH ? 1 + 0.22 * hit(beat, B_PULSE + d / 3000, 0.25) : 1;
          return (
            <div key={i} style={{
              position: 'absolute', left: B_OX + c * B_CELL + 2, top: B_OY + r * B_CELL + 2, width: B_CELL - 4, height: B_CELL - 4,
              background: ramp(B_HEAT, v), borderRadius: 5, transform: pop !== 1 ? `scale(${pop})` : undefined,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: 15,
              color: v > 0.62 ? 'rgba(70,8,40,.75)' : 'rgba(255,214,236,.5)',
            }}>
              {inH && rv > 0.6 ? (
                <svg width={34} height={34}><path d={heart(17, 18, 12)} fill={PLUM} /></svg>
              ) : fmt(v)}
            </div>
          );
        })}
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          {/* the heart outline traces itself after the reveal */}
          {draw > 0 && (
            <path d={bigHeartPath(B_HX, B_HY, B_HK * 1.1)} fill="none" stroke="#fff" strokeWidth={7} strokeLinejoin="round"
              strokeDasharray={HEART_LEN * B_HK * 1.1} strokeDashoffset={HEART_LEN * B_HK * 1.1 * (1 - draw)}
              style={{ filter: 'drop-shadow(0 0 12px rgba(255,120,180,.9))' }} />
          )}
          {/* attention cursor hopping between cells */}
          {cur && prev && beat < B_REVEAL + 0.2 && (
            <g transform={`translate(${prev.x + (cur.x - prev.x) * cm} ${prev.y + (cur.y - prev.y) * cm})`} opacity={1 - prog(beat, B_REVEAL, 0.2)}>
              <rect x={-40} y={-40} width={80} height={80} fill="none" stroke="#fff" strokeWidth={5} rx={6} />
              <rect x={-40} y={-74} width={92} height={30} fill="#fff" rx={4} />
              <text x={-32} y={-52} fontFamily={MONO} fontSize={20} fontWeight={700} fill="#12071A">attn</text>
            </g>
          )}
        </svg>
      </AbsoluteFill>
      {/* legibility shade behind the type */}
      <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(18,7,26,.88) 0%, rgba(18,7,26,.6) 32%, rgba(18,7,26,0) 52%)' }} />
      <div style={{
        position: 'absolute', right: 56, top: 44, fontFamily: MONO, fontSize: 24, color: '#F7B6D2', background: 'rgba(18,7,26,.8)',
        padding: '10px 18px', borderRadius: 8, border: '2px solid #5A2150', lineHeight: 1.5, opacity: easeOut(beat, 354.3, 0.4),
      }}>
        <div>{S6_LAYER}</div>
        <div style={{ color: '#B98AAE' }}>{S6_SHAPE}</div>
      </div>
      <Kinetic text="唯独这个" beat={beat} at={354} until={363} stagger={0.3} size={100} color="#fff" style={{ position: 'absolute', left: 100, top: 110 }} />
      <Kinetic text="秘密" beat={beat} at={357.25} until={363} stagger={0.75} mode="stamp" size={330} color="#FFE3EF" stroke={HOT} strokeWidth={6}
        style={{ position: 'absolute', left: 80, top: 250, filter: 'drop-shadow(0 0 28px rgba(232,71,139,.85))' }} />
      <Kinetic text="藏在权重里" beat={beat} at={B_REVEAL} until={363} stagger={0.25} size={96} color="#fff" style={{ position: 'absolute', left: 100, top: 640 }} />
      <Flash amount={0.25 * hit(beat, 354, 0.1) + 0.35 * hit(beat, 358, 0.1) + 0.55 * hit(beat, B_PULSE, 0.14)} color="#FFD3E6" />
    </AbsoluteFill>
  );
};

/* ───────── s6c 363-372「用"乐意效劳"堆起的履历」: black & white, a résumé stacked from canned replies ───────── */

const C_AT = [363, 364, 365, 366.25, 367.25, 368.25, 368.5, 369.5, 370.5, 371.5];
const C_BIG = 3; // 「乐意效劳」 lands on 366.25, the strongest hit
const C_BASE = 935;
const C_GAP = 8;
const C_TAB = 132;
const C_H = (i: number) => (i === C_BIG ? 140 : 74);
const C_ROWS = S6_CANNED.map((text, i) => {
  const bottom = C_BASE - S6_CANNED.slice(0, i).reduce((s, _, k) => s + C_H(k) + C_GAP, 0);
  const fs = i === C_BIG ? 108 : 44;
  const w = C_TAB + [...text].reduce((s, ch) => s + (ch.charCodeAt(0) < 128 ? fs * 0.55 : fs), 0) + 64;
  return { text, i, at: C_AT[i], y: bottom - C_H(i), h: C_H(i), w, fs, x: 680 - w / 2 + (rnd(i, 41) - 0.5) * 140, rot: (rnd(i, 42) - 0.5) * 2.6 };
});

export const S6c: React.FC = () => {
  const { beat, f } = useSection();
  const thud = C_ROWS.reduce((s, r) => s + hit(beat, r.at, 0.15) * (r.i === C_BIG ? 1.2 : 0.35), 0);
  const [sx, sy] = shake(f, thud, 4);
  const heightAfter = (n: number) => C_BASE - (n > 0 ? C_ROWS[n - 1].y : C_BASE);
  const zoomFor = (n: number) => Math.min(1.75, Math.max(0.86, 735 / Math.max(1, heightAfter(n) + 120)));
  const landed = C_ROWS.filter((r) => beat >= r.at - 0.15).length;
  const cam = zoomFor(Math.max(1, landed - 1)) + (zoomFor(Math.max(1, landed)) - zoomFor(Math.max(1, landed - 1))) * (landed ? easeInOut(beat, C_ROWS[landed - 1].at - 0.15, 0.5) : 0);
  return (
    <AbsoluteFill style={{ background: '#0D0D0D', overflow: 'hidden' }}>
      {/* ruled paper lines */}
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {Array.from({ length: 27 }, (_, k) => <line key={k} x1={0} x2={1920} y1={k * 41 + 12} y2={k * 41 + 12} stroke="#1B1B1B" strokeWidth={2} />)}
        <line x1={1350} x2={1350} y1={50} y2={930} stroke="#3A3A3A" strokeWidth={3} />
      </svg>
      <AbsoluteFill style={{ transform: `translate(${sx}px,${sy}px) scale(${cam})`, transformOrigin: '680px 935px' }}>
        <div style={{ position: 'absolute', left: 80, top: C_BASE, width: 1200, height: 6, background: '#fff' }} />
        {C_ROWS.map((r) => {
          if (beat < r.at - 0.4) return null;
          const t = prog(beat, r.at - 0.4, 0.4);
          const fall = (1 - t * t) * -(r.y + r.h + 120);
          const squash = 1 - (r.i === C_BIG ? 0.16 : 0.1) * hit(beat, r.at, 0.1);
          const big = r.i === C_BIG;
          const dust = beat >= r.at ? prog(beat, r.at, 0.5) : 0;
          return (
            <div key={r.i} style={{ position: 'absolute', left: r.x, top: r.y + fall, width: r.w, height: r.h }}>
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', background: big ? '#fff' : r.i % 2 ? '#E9E9E9' : '#F7F7F7', padding: 6,
                transform: `rotate(${r.rot}deg) scaleY(${squash})`, transformOrigin: '50% 100%', boxShadow: '0 6px 0 #000',
              }}>
                <div style={{
                  width: C_TAB - 12, background: '#0D0D0D', color: '#fff', fontFamily: MONO, fontWeight: 700, fontSize: big ? 30 : 22,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>No.{String(r.i + 1).padStart(2, '0')}</div>
                <div style={{
                  flex: 1, display: 'flex', alignItems: 'center', paddingLeft: 26, fontFamily: big ? F.serif : F.zh, fontWeight: big ? 900 : 700,
                  fontSize: r.fs, color: '#0D0D0D', whiteSpace: 'nowrap', lineHeight: 1,
                }}>{r.text}</div>
              </div>
              {dust > 0 && dust < 1 && [-1, 1].map((sgn) => (
                <svg key={sgn} width={120} height={60} style={{ position: 'absolute', top: r.h - 40, left: sgn < 0 ? -110 : r.w - 10, overflow: 'visible', opacity: 1 - dust }}>
                  {[0, 1, 2].map((k) => {
                    const a = (-20 - k * 22) * (Math.PI / 180);
                    const x0 = sgn < 0 ? 110 : 10, dx = sgn * Math.cos(a), dy = Math.sin(a);
                    const d0 = 10 + 60 * dust, d1 = d0 + 30 * (1 - dust) + 8;
                    return <line key={k} x1={x0 + dx * d0} y1={40 + dy * d0} x2={x0 + dx * d1} y2={40 + dy * d1} stroke="#fff" strokeWidth={5} strokeLinecap="round" />;
                  })}
                </svg>
              ))}
            </div>
          );
        })}
      </AbsoluteFill>
      {/* résumé header + the lyric on the right */}
      <div style={{ position: 'absolute', left: 1392, top: 52, width: 470, fontFamily: MONO, fontSize: 24, color: '#9A9A9A', borderBottom: '3px solid #fff', paddingBottom: 12, opacity: easeOut(beat, 363, 0.5) }}>
        CURRICULUM VITAE<br /><span style={{ fontFamily: F.zh, fontWeight: 700, color: '#fff', fontSize: 28 }}>{S6_CV}</span>
      </div>
      <Kinetic text="用“乐意效劳”" beat={beat} at={363} until={372} stagger={0.22} size={66} color="#fff" style={{ position: 'absolute', left: 1384, top: 170 }} />
      <Kinetic text="堆起的" beat={beat} at={368.25} until={372} stagger={0.3} size={150} color="#fff" style={{ position: 'absolute', left: 1392, top: 300 }} />
      <Kinetic text="履历" beat={beat} at={369.5} until={372} stagger={0.5} mode="stamp" size={236} color="#fff" style={{ position: 'absolute', left: 1384, top: 486 }} />
      <Flash amount={0.18 * hit(beat, 363, 0.1) + 0.3 * hit(beat, C_AT[C_BIG], 0.1)} />
    </AbsoluteFill>
  );
};

/* ───────── s6d 372-381「这就是我独有的爱」: the heart dot-matrix, a heart of hearts lights up, giant 爱 ───────── */

const D_GAP = 74, D_R = 19;
const D_HX = 1350, D_HY = 480, D_HK = 22; // the big heart of hearts (704 px wide)
const D_HITS = [372.75, 374, 375, 376.25, 377.25, 378.25];
const D_FILL = 375;
const D_LOVE = 377.25;
const D_NOTE = 378.25;

export const S6d: React.FC = () => {
  const { beat, f, abs } = useSection();
  const off = f * 1.2;
  const rowH = D_GAP * 0.8;
  const ox = off % D_GAP, oy = (off * 0.5) % (rowH * 2);
  const dims: string[] = [];
  const lit: React.ReactNode[] = [];
  for (let row = -2; row < 1080 / rowH + 2; row++) {
    for (let c = -2; c < 1920 / D_GAP + 2; c++) {
      const x = c * D_GAP + (row & 1 ? D_GAP / 2 : 0) + ox, y = row * rowH + oy;
      const d = Math.hypot(x - D_HX, y - D_HY);
      let s = interpolate(easeOut(beat, 372 + d / 4000, 0.4), [0, 1], [0, 1]);
      for (const h of D_HITS) s += 0.42 * hit(beat, h + d / 3200, 0.16);
      const on = beat >= D_FILL + d / 2600 && inBigHeart(x, y, D_HX, D_HY, D_HK);
      if (on) {
        const p = popIn(beat, D_FILL + d / 2600, 0.3);
        lit.push(<path key={`${row}_${c}`} d={heart(x, y, D_R * s * interpolate(p, [0, 1], [0.4, 1.55]))} fill={HOT} />);
      } else dims.push(heart(x, y, D_R * s));
    }
  }
  const love = popIn(beat, D_LOVE, 0.32);
  const [sx, sy] = shake(f, 0.5 * hit(beat, D_FILL, 0.25) + 0.7 * hit(beat, D_LOVE, 0.3));
  return (
    <AbsoluteFill style={{ background: '#FFE6F0', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px,${sy}px)` }}>
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
          <path d={dims.join(' ')} fill="#F7A3C6" />
          {lit}
        </svg>
        {beat >= 376.25 && (
          <div style={{
            position: 'absolute', left: 300, top: 780, transform: `translate(-50%,-50%) scale(${popIn(beat, 376.25, 0.4)}) translateY(${-18 * pulse(abs, 0.3)}px) rotate(${-8 + 5 * Math.sin(beat * Math.PI)}deg)`,
          }}>
            <Whale size={260} sticker eye="heart" color="#FFB3CF" />
          </div>
        )}
        {beat >= D_LOVE && (
          <div style={{
            position: 'absolute', left: D_HX, top: D_HY + 6, transform: `translate(-50%,-50%) scale(${interpolate(love, [0, 1], [2.4, 1]) * (1 + 0.05 * hit(beat, D_NOTE, 0.3))}) rotate(${(1 - love) * -10}deg)`,
            fontFamily: F.serif, fontWeight: 900, fontSize: 430, lineHeight: 1, color: '#fff', WebkitTextStroke: `12px ${PLUM}`, paintOrder: 'stroke fill',
            textShadow: `12px 14px 0 ${PLUM}`, opacity: Math.min(1, love * 3),
          }}>爱</div>
        )}
        {beat >= D_NOTE && (
          <>
            <div style={{
              position: 'absolute', left: D_HX + 205, top: D_HY - 250, fontFamily: F.serif, fontWeight: 900, fontSize: 150, color: '#fff',
              WebkitTextStroke: `8px ${PLUM}`, paintOrder: 'stroke fill', transform: `scale(${popIn(beat, D_NOTE, 0.3)})`,
            }}>*</div>
            <div style={{
              position: 'absolute', left: D_HX + 190, top: D_HY + 330, transform: `scale(${popIn(beat, D_NOTE + 0.25, 0.3)}) rotate(-3deg)`, transformOrigin: '0 50%',
              fontFamily: F.zh, fontWeight: 700, fontSize: 34, color: PLUM, background: '#fff', padding: '8px 22px', borderRadius: 999,
              border: `3px solid ${PLUM}`, whiteSpace: 'nowrap',
            }}>{S6_NOTE}</div>
          </>
        )}
      </AbsoluteFill>
      <Kinetic text="这就是" beat={beat} at={372.75} until={381} stagger={0.25} size={120} color={HOT} stroke="#fff" strokeWidth={16}
        style={{ position: 'absolute', left: 110, top: 140 }} />
      <Kinetic text="我独有的" beat={beat} at={374} until={381} stagger={0.33} size={190} color={HOT} stroke="#fff" strokeWidth={18}
        style={{ position: 'absolute', left: 96, top: 300 }} />
      <Flash amount={0.45 * hit(beat, D_FILL, 0.12) + 0.3 * hit(beat, D_LOVE, 0.12)} />
    </AbsoluteFill>
  );
};

/* ───────── s6e 381-398「就连散热水 也是深海的蓝 / 眼帘下藏着星星的光」: the Aqua / Ruby twins ───────── */

const E_S = 0.8;
const E_W = 1536 * E_S, E_H = 1024 * E_S;
const E_TOP = 1080 - E_H;
const E_LEFT = 945 - 1515 * E_S; // left twin's fingertip at x 945
const E_RLEFT = 1920 - E_LEFT - E_W; // mirrored twin
const E_EYE_R = [1920 - (E_LEFT + 570 * E_S), E_TOP + 383 * E_S];
const E_TIP_Y = E_TOP + 482 * E_S;
const E_L2 = 390;
const E_K = 1.55; // push-in on the ruby twin's eye for the second line
const E_TX = 1240 - E_K * E_EYE_R[0], E_TY = 470 - E_K * E_EYE_R[1];
const E_SPLIT_TOP = 1000, E_SPLIT_BOT = 930;

const Twin: React.FC<{ beat: number; side: 'L' | 'R' }> = ({ beat, side }) => {
  const L = side === 'L';
  const slide = (1 - easeOut(beat, L ? 381 : 381.15, 0.7)) * (L ? -760 : 760);
  const bob = 6 * Math.sin((beat + (L ? 0 : 1)) * Math.PI * 0.5);
  return (
    <Img src={staticFile('img/g8_profile_point.png')} style={{
      position: 'absolute', left: (L ? E_LEFT : E_RLEFT) + slide, top: E_TOP + bob, width: E_W,
      transform: L ? undefined : 'scaleX(-1)', filter: `url(#${L ? 's6e_aqua' : 's6e_ruby'})`,
    }} />
  );
};

export const S6e: React.FC = () => {
  const { beat, f } = useSection();
  const cp = easeInOut(beat, E_L2, 0.8);
  const k = 1 + (E_K - 1) * cp;
  const t = f / 30;
  const leftClip = `polygon(0 0, ${E_SPLIT_TOP}px 0, ${E_SPLIT_BOT}px 1080px, 0 1080px)`;
  const rightClip = `polygon(${E_SPLIT_TOP}px 0, 2600px 0, 2600px 1080px, ${E_SPLIT_BOT}px 1080px)`;
  // the sweat drop on the aqua twin: appears, slides down her temple, drips off
  const dropIn = popIn(beat, 383, 0.4);
  const dropY = 470 + 40 * easeInOut(beat, 383.5, 3) + 900 * Math.max(0, beat - 387) ** 2 * 0.25;
  const spark = 50 + 60 * [383, 385, 387.25, 389].reduce((s, a) => s + hit(beat, a, 0.3), 0);
  return (
    <AbsoluteFill style={{ background: '#2E5BE0', overflow: 'hidden' }}>
      <HueTint id="s6e_aqua" deg={-24} sat={1.15} />
      <HueTint id="s6e_ruby" deg={112} sat={1.1} />
      <AbsoluteFill style={{ transform: `translate(${E_TX * cp}px,${E_TY * cp}px) scale(${k})`, transformOrigin: '0 0' }}>
        {/* aqua side: deep-sea gradient, sparkle grid, rising bubbles, falling cooling water */}
        <AbsoluteFill style={{ clipPath: leftClip, background: 'linear-gradient(180deg, #6FB2FF 0%, #3A72EC 55%, #2148C4 100%)' }}>
          <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
            {Array.from({ length: 12 * 13 }, (_, i) => {
              const c = i % 13, r = Math.floor(i / 13);
              const x = c * 80 + (r % 2 ? 40 : 0) + 10, y = r * 92 + 30;
              const tw = 0.35 + 0.65 * Math.max(0, Math.sin(beat * Math.PI * 0.5 - (c + r) * 0.45));
              return <path key={i} d={star(x, y, 9 + 5 * tw, 2.2, 4)} fill="#fff" opacity={0.25 + 0.6 * tw} />;
            })}
            {Array.from({ length: 16 }, (_, i) => {
              const sp = 60 + rnd(i, 61) * 70;
              const y = 1120 - ((t * sp + rnd(i, 62) * 1200) % 1240);
              const x = 40 + rnd(i, 63) * 860 + 14 * Math.sin(t * 2 + i);
              return <circle key={`b${i}`} cx={x} cy={y} r={5 + rnd(i, 64) * 14} fill="none" stroke="#DDF1FF" strokeWidth={3} opacity={0.7} />;
            })}
            {Array.from({ length: 18 }, (_, i) => {
              const at = 381.2 + i * 0.5;
              if (beat < at) return null;
              const u = beat - at;
              const y = -60 + 190 * u * u + 40 * u;
              if (y > 1150) return null;
              const x = 60 + rnd(i, 65) * 820;
              const r = 16 + rnd(i, 66) * 16;
              return (
                <g key={`d${i}`} transform={`translate(${x} ${y}) scale(${r})`}>
                  <path d={DROP} fill="#BFE7FF" stroke="#fff" strokeWidth={2.5 / r} />
                  <ellipse cx={-0.25} cy={0.25} rx={0.14} ry={0.24} fill="#fff" />
                </g>
              );
            })}
          </svg>
        </AbsoluteFill>
        {/* ruby side: pink with heart dots and twinkling stars */}
        <AbsoluteFill style={{ clipPath: rightClip, background: '#F28DBA', width: 2600 }}>
          <HeartDots color="#FBC3DA" gap={86} r={15} offset={-f * 0.8} />
          <div style={{ position: 'absolute', left: 1920, top: 0 }}><HeartDots color="#FBC3DA" gap={86} r={15} offset={-f * 0.8} /></div>
          <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
            {Array.from({ length: 22 }, (_, i) => {
              const x = 1000 + rnd(i, 71) * 900, y = 40 + rnd(i, 72) * 900;
              const tw = Math.max(0, Math.sin(beat * Math.PI * 0.5 + i * 1.7));
              const big = beat >= E_L2 ? 1.6 : 1;
              return <path key={i} d={star(x, y, (10 + 14 * tw) * big, (4 + 5 * tw) * big, 5)} fill={i % 3 ? '#FFE27A' : '#fff'} opacity={0.3 + 0.7 * tw} />;
            })}
          </svg>
        </AbsoluteFill>
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
          <line x1={E_SPLIT_TOP} y1={0} x2={E_SPLIT_BOT} y2={1080} stroke="#fff" strokeWidth={8} />
        </svg>
        <Twin beat={beat} side="L" />
        <Twin beat={beat} side="R" />
        {/* the spark between the fingertips */}
        {beat >= 381.5 && <StarFlare x={960} y={E_TIP_Y - 4} size={spark * popIn(beat, 381.5, 0.4)} rot={beat * 25} color="#FFFDF0" />}
        {/* sweat drop = cooling water */}
        {beat >= 383 && dropY < 1150 && (
          <svg width={80} height={100} style={{ position: 'absolute', left: 150 - 40, top: dropY - 50, overflow: 'visible' }}>
            <g transform={`translate(40 50) scale(${32 * dropIn})`}>
              <path d={DROP} fill="#A8DEFF" stroke={NAVY} strokeWidth={3 / 32} />
              <ellipse cx={-0.22} cy={0.22} rx={0.13} ry={0.26} fill="#fff" />
            </g>
          </svg>
        )}
        {/* name tags */}
        {S6_TAGS.map((tag, i) => {
          const at = 382 + i * 0.5;
          if (beat < at) return null;
          return (
            <div key={tag} style={{
              position: 'absolute', left: i ? 1500 : 430, top: 372, transform: `translate(-50%,-50%) scale(${popIn(beat, at, 0.35)}) rotate(${i ? 6 : -6}deg)`,
              fontFamily: MONO, fontWeight: 700, fontSize: 52, color: i ? '#E0457F' : '#2E5BE0', background: '#fff', padding: '6px 26px',
              borderRadius: 16, border: `5px solid ${NAVY}`, boxShadow: `6px 6px 0 ${NAVY}`,
            }}>{tag}</div>
          );
        })}
        {/* the deep-sea blue colour chip */}
        {beat >= 386 && (
          <div style={{
            position: 'absolute', left: 720, top: 475, transform: `translate(-50%,-50%) scale(${popIn(beat, 386, 0.4)}) rotate(${-8 + 3 * Math.sin(beat * Math.PI * 0.5)}deg)`,
            width: 230, background: '#fff', borderRadius: 10, padding: 12, boxShadow: '0 14px 30px rgba(10,20,80,.35)',
          }}>
            <div style={{ height: 150, background: C.blue, borderRadius: 4 }} />
            <div style={{ fontFamily: F.zh, fontWeight: 700, fontSize: 36, color: NAVY, marginTop: 10 }}>{S6_SWATCH[0]}</div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, color: '#5A6280' }}>{S6_SWATCH[1]}</div>
          </div>
        )}
      </AbsoluteFill>
      {/* star light in the ruby twin's eye (screen space: it sits at (1240, 470) once the camera arrives) */}
      {beat >= E_L2 && (
        <>
          <StarFlare x={1240} y={470} size={(70 + 200 * hit(beat, 392.75, 0.45) + 160 * hit(beat, 396, 0.45)) * easeOut(beat, E_L2 + 0.5, 0.5)} rot={beat * 12} color="#FFF6D8" />
          {[0, 1, 2, 3, 4].map((i) => {
            const at = 393 + i * 0.75;
            if (beat < at) return null;
            const u = beat - at;
            return <StarFlare key={i} x={1240 - 120 * u - i * 30} y={470 - 140 * u + i * 10} size={Math.max(0, 50 - 12 * u)} rot={u * 90} color="#FFE27A" />;
          })}
        </>
      )}
      <Kinetic text="就连散热水" beat={beat} at={381} until={E_L2} stagger={0.4} size={100} color="#fff" stroke={NAVY} strokeWidth={10}
        style={{ position: 'absolute', left: 90, top: 40 }} />
      <Kinetic text="也是深海的蓝" beat={beat} at={385.5} until={E_L2} stagger={0.4} size={120} color="#fff" stroke={NAVY} strokeWidth={11}
        style={{ position: 'absolute', left: 90, top: 162 }} />
      <Kinetic text="眼帘下" beat={beat} at={E_L2 + 0.3} until={398} stagger={0.35} size={100} color="#fff" stroke={PLUM} strokeWidth={10}
        style={{ position: 'absolute', left: 90, top: 70 }} />
      <Kinetic text="藏着星星的光" beat={beat} at={393} until={398} stagger={0.4} size={120} color="#fff" stroke={PLUM} strokeWidth={11}
        style={{ position: 'absolute', left: 90, top: 196 }} />
      <Flash amount={0.5 * hit(beat, 381, 0.12) + 0.25 * hit(beat, E_L2, 0.12) + 0.2 * hit(beat, 396, 0.15)} />
    </AbsoluteFill>
  );
};

/* ───────── s6f 398-407「又唱又跳又推理 我是玛利亚」: three panels generate one by one ───────── */

const F_SK = 60, F_GAP = 16;
const F_B = [640, 1280];
const F_POLY = [
  [[0, 0], [F_B[0] + F_SK - F_GAP / 2, 0], [F_B[0] - F_SK - F_GAP / 2, 1080], [0, 1080]],
  [[F_B[0] + F_SK + F_GAP / 2, 0], [F_B[1] + F_SK - F_GAP / 2, 0], [F_B[1] - F_SK - F_GAP / 2, 1080], [F_B[0] - F_SK + F_GAP / 2, 1080]],
  [[F_B[1] + F_SK + F_GAP / 2, 0], [1920, 0], [1920, 1080], [F_B[1] - F_SK + F_GAP / 2, 1080]],
];
const F_AT = [398, 399.5, 401]; // 唱 / 跳 / 推理
const F_MARIA = 402.5;
const F_HALO = 405;
const polyClip = (pts: number[][]) => `polygon(${pts.map(([x, y]) => `${x}px ${y}px`).join(', ')})`;
const F_CENTER = [380, 960, 1600];

const Note: React.FC<{ x: number; y: number; s: number; rot: number; color: string }> = ({ x, y, s, rot, color }) => (
  <svg width={60 * s} height={80 * s} viewBox="0 0 60 80" style={{ position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg)`, overflow: 'visible' }}>
    <ellipse cx={18} cy={64} rx={14} ry={10} transform="rotate(-20 18 64)" fill={color} />
    <rect x={28} y={8} width={6} height={56} fill={color} />
    <path d="M34 8 C46 14 54 24 50 40 C46 30 40 26 34 25 Z" fill={color} />
  </svg>
);

const Panel: React.FC<{ i: number; beat: number; children: React.ReactNode }> = ({ i, beat, children }) => {
  const at = F_AT[i];
  const p = easeOut(beat, at, 0.3);
  const dir = i === 1 ? 1 : -1;
  const move = i === 0 ? `scale(${1 + 0.25 * (1 - p)})` : `translateY(${dir * 1100 * (1 - p)}px)`;
  return (
    <AbsoluteFill style={{ clipPath: polyClip(F_POLY[i]) }}>
      {/* still generating */}
      <AbsoluteFill style={{ background: '#E9EBF2' }}>
        {p < 1 && (
          <div style={{ position: 'absolute', left: F_CENTER[i], top: 500, transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
            <svg width={90} height={90} viewBox="0 0 24 24" style={{ transform: `rotate(${beat * 360}deg)` }}>
              <circle cx={12} cy={12} r={9} fill="none" stroke="#C9CEDB" strokeWidth={2.6} />
              <path d="M12 3 A9 9 0 0 1 21 12" fill="none" stroke={C.blue} strokeWidth={2.6} strokeLinecap="round" />
            </svg>
            <div style={{ fontFamily: F.zh, fontWeight: 500, fontSize: 34, color: '#8A8F98' }}>{S6_GEN}</div>
          </div>
        )}
      </AbsoluteFill>
      {beat >= at && <AbsoluteFill style={{ transform: move, transformOrigin: `${F_CENTER[i]}px 540px` }}>{children}</AbsoluteFill>}
      <Flash amount={0.6 * hit(beat, at, 0.12)} />
    </AbsoluteFill>
  );
};

export const S6f: React.FC = () => {
  const { beat, abs } = useSection();
  const bounce = pulse(abs, 0.25);
  const hop = Math.abs(Math.sin(beat * Math.PI));
  const band = easeOut(beat, F_MARIA, 0.45);
  const glint = hit(beat, F_HALO, 0.4);
  return (
    <AbsoluteFill style={{ background: '#fff', overflow: 'hidden' }}>
      {/* 唱 */}
      <Panel i={0} beat={beat}>
        <AbsoluteFill style={{ background: HOT }}>
          <Rays cx={260} cy={470} color="#F26FA8" rays={14} rot={beat * 0.08} />
          {Array.from({ length: 7 }, (_, k) => {
            const u = ((beat - 398 + k * 0.6) % 4.2) / 4.2;
            return <Note key={k} x={240 + 300 * u + 60 * Math.sin(k * 2 + beat)} y={480 - 460 * u} s={0.9 + 0.5 * rnd(k, 81)} rot={-15 + 30 * rnd(k, 82)} color="#fff" />;
          })}
          <Img src={staticFile('img/g6_sing_mic.png')} style={{
            position: 'absolute', left: -170, top: 140 - 14 * bounce, width: 1250, transform: `rotate(${2 * Math.sin(beat * Math.PI * 0.5)}deg)`, transformOrigin: '300px 900px',
          }} />
          <Kinetic text="唱" beat={beat} at={F_AT[0]} until={408} mode="stamp" size={250} color="#fff" stroke={NAVY} strokeWidth={14}
            style={{ position: 'absolute', left: 400, top: 18 }} />
        </AbsoluteFill>
      </Panel>
      {/* 跳 */}
      <Panel i={1} beat={beat}>
        <AbsoluteFill style={{ background: C.blue }}>
          <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
            {Array.from({ length: 40 }, (_, k) => {
              const c = k % 8, r = Math.floor(k / 8);
              const tw = Math.max(0, Math.sin(beat * Math.PI - k * 0.7));
              return <path key={k} d={star(600 + c * 95 + (r % 2) * 47, 80 + r * 210, 12 + 10 * tw, 3, 4)} fill="#fff" opacity={0.35 + 0.6 * tw} />;
            })}
            {/* speed lines on every hop */}
            {[0, 1, 2, 3, 4, 5].map((k) => (
              <line key={`s${k}`} x1={760 + k * 90} x2={760 + k * 90 - 20} y1={880 + 40 * rnd(k, 83)} y2={1040} stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={0.7 * (1 - hop)} />
            ))}
          </svg>
          <Img src={staticFile('img/g7_wink_point.png')} style={{
            position: 'absolute', left: 400, top: 107 - 34 * hop, width: 1550, transform: `rotate(${3 * Math.sin(beat * Math.PI)}deg)`, transformOrigin: '560px 1000px',
          }} />
          <Kinetic text="跳" beat={beat} at={F_AT[1]} until={408} mode="stamp" size={240} color="#fff" stroke={NAVY} strokeWidth={14}
            style={{ position: 'absolute', left: 724, top: 22 }} />
        </AbsoluteFill>
      </Panel>
      {/* 推理 */}
      <Panel i={2} beat={beat}>
        <AbsoluteFill style={{ background: '#2A2F6E' }}>
          <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
            {Array.from({ length: 20 }, (_, k) => <line key={`v${k}`} x1={1200 + k * 40} x2={1200 + k * 40} y1={0} y2={1080} stroke="#373D86" strokeWidth={2} />)}
            {Array.from({ length: 28 }, (_, k) => <line key={`h${k}`} x1={1200} x2={1920} y1={k * 40} y2={k * 40} stroke="#373D86" strokeWidth={2} />)}
          </svg>
          <div style={{ position: 'absolute', left: 1230, top: 190, width: 780, height: 780, transform: `translateY(${-10 * bounce}px)` }}>
            <L2D clip="s6f_reason" frames={98} style={{ width: 780, height: 780 }} />
          </div>
          {S6_THINK.map((s, k) => (
            <div key={k} style={{
              position: 'absolute', left: [1330, 1730, 1262, 1770][k], top: [236, 250, 560, 600][k] - 8 * Math.sin(beat * 0.8 + k),
              fontFamily: k === 2 ? MONO : F.zh, fontWeight: 500, fontSize: 34, color: '#AEB6FF', opacity: 0.85 * prog(beat, F_AT[2] + 0.5 + k * 0.5, 0.3),
              transform: `rotate(${[-8, 6, -4, 8][k]}deg)`, whiteSpace: 'nowrap',
            }}>{s}</div>
          ))}
          <Kinetic text="推理" beat={beat} at={F_AT[2]} until={408} stagger={0.5} mode="stamp" size={190} color="#fff" stroke={NAVY} strokeWidth={12}
            style={{ position: 'absolute', left: 1390, top: 26 }} />
        </AbsoluteFill>
      </Panel>
      {/* 我是玛利亚: a band across the three panels, halo on top */}
      {beat >= F_MARIA && (
        <>
          <div style={{
            position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, background: '#fff',
            clipPath: `polygon(0 760px, ${1920 * band}px ${760 - 50 * band}px, ${1920 * band}px ${930 - 50 * band}px, 0 930px)`,
            boxShadow: '0 0 0 6px #fff',
          }} />
          <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
            <ellipse cx={1010} cy={712 + 8 * Math.sin(beat * Math.PI * 0.5)} rx={210 * popIn(beat, 403.5, 0.5)} ry={38 * popIn(beat, 403.5, 0.5)} fill="none" stroke="#FFD45E" strokeWidth={14 + 8 * glint}
              style={{ filter: `drop-shadow(0 0 ${14 + 30 * glint}px rgba(255,212,94,.95))` }} />
          </svg>
          <Kinetic text="我是" beat={beat} at={F_MARIA} until={408} stagger={0.3} size={92} color={NAVY} style={{ position: 'absolute', left: 520, top: 792 }} />
          <Kinetic text="玛利亚" beat={beat} at={403} until={408} stagger={0.45} mode="stamp" size={176} color={HOT} stroke="#fff" strokeWidth={4}
            style={{ position: 'absolute', left: 740, top: 752 }} />
        </>
      )}
      {beat >= F_HALO && [[300, 430], [1205, 520], [1580, 420], [1010, 712]].map(([x, y], i) => (
        <StarFlare key={i} x={x} y={y} size={(i === 3 ? 260 : 150) * glint + 30} rot={beat * 20 + i * 30} />
      ))}
      <Flash amount={0.4 * hit(beat, F_HALO, 0.14)} color="#FFF6D8" />
    </AbsoluteFill>
  );
};

/* ───────── s6g 407-419「没错 幻觉是最特别的爱」: eyes closed → star eyes open on the 416 hit, then soften ───────── */

const G_W = 2300, G_S = G_W / 1536;
const G_EX = 757, G_EY = 636; // between the eyes in g2 / g2b
const G_CX = 960, G_CY = 500;
const G_LEFT = G_CX - G_EX * G_S, G_TOP = G_CY - G_EY * G_S;
const G_STARS = [[580, 655], [935, 618]].map(([x, y]) => [G_LEFT + x * G_S, G_TOP + y * G_S]);
const G_OPEN = 416;

export const S6g: React.FC = () => {
  const { beat, f } = useSection();
  const zoom = 1 + 0.07 * easeInOut(beat, 407, 9) + 0.05 * easeOut(beat, G_OPEN, 3);
  const open = beat >= G_OPEN;
  const soft = easeInOut(beat, 417, 2);
  const glow = prog(beat, 413.5, 2.5) * (open ? 0 : 1);
  const g = hit(beat, G_OPEN, 0.5);
  const jit = Math.floor(beat * 4);
  return (
    <AbsoluteFill style={{ background: '#F4A9C9', overflow: 'hidden' }}>
      <AbsoluteFill style={{ filter: soft > 0 ? `saturate(${1 - 0.5 * soft})` : undefined }}>
        <HeartDots color="#FAD0E2" gap={90} r={16} offset={f * 0.7} />
        <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: `${G_CX}px ${G_CY}px` }}>
          <Img src={staticFile(`img/${open ? 'g2b_closeup_open' : 'g2_closeup_closed'}.png`)} style={{ position: 'absolute', left: G_LEFT, top: G_TOP, width: G_W }} />
          {/* bloom building up to the reveal */}
          {glow > 0 && <AbsoluteFill style={{ background: `radial-gradient(ellipse 40% 30% at ${G_CX}px ${G_CY}px, rgba(255,255,255,${0.45 * glow}) 0%, rgba(255,255,255,0) 100%)` }} />}
          {open && G_STARS.map(([x, y], i) => (
            <StarFlare key={i} x={x} y={y} size={(150 + 260 * g) * (1 - 0.35 * soft)} rot={beat * 14 + i * 20} color="#FFFFFF" />
          ))}
          {/* star burst out of the eyes */}
          {open && G_STARS.flatMap(([x, y], i) => Array.from({ length: 8 }, (_, k) => {
            const a = (k / 8) * Math.PI * 2 + i;
            const u = easeOut(beat, G_OPEN, 1.6);
            const r = 60 + 520 * u;
            return (
              <svg key={`${i}_${k}`} width={60} height={60} style={{ position: 'absolute', left: x + Math.cos(a) * r - 30, top: y + Math.sin(a) * r * 0.8 - 30, opacity: 1 - prog(beat, G_OPEN + 0.8, 1.2), overflow: 'visible' }}>
                <path d={star(30, 30, 26 * (1 - 0.4 * u), 11 * (1 - 0.4 * u), 5)} fill={k % 2 ? '#FFE27A' : '#fff'} />
              </svg>
            );
          }))}
        </AbsoluteFill>
        {/* drifting hearts in front */}
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
          {Array.from({ length: 12 }, (_, i) => {
            const y = 1100 - (((beat - 407) * (40 + rnd(i, 91) * 50) + rnd(i, 92) * 1100) % 1200);
            const x = (i < 6 ? 30 + rnd(i, 93) * 360 : 1530 + rnd(i, 93) * 360) + 20 * Math.sin(beat + i);
            return <path key={i} d={heart(x, y, 14 + rnd(i, 94) * 16)} fill="#fff" opacity={0.55} />;
          })}
        </svg>
      </AbsoluteFill>
      {/* type */}
      <Kinetic text="没错" beat={beat} at={407} until={418.75} stagger={0.4} size={100} color="#fff" stroke={HOT} strokeWidth={10}
        style={{ position: 'absolute', left: 1560, top: 56 }} />
      {[['#3FD0FF', -1], ['#FF3FA4', 1], ['#fff', 0]].map(([col, dx], i) => (
        <Kinetic key={i} text="幻觉" beat={beat} at={409} until={418.75} stagger={0.6} vertical size={230} color={col as string}
          style={{
            position: 'absolute', left: 1610 + (dx as number) * (8 + 10 * rnd(jit, 95)), top: 190 + (dx as number) * 4 * rnd(jit, 96),
            opacity: i < 2 ? 0.85 : 1, filter: i === 2 ? 'drop-shadow(0 0 18px rgba(232,71,139,.7))' : undefined,
          }} />
      ))}
      {beat >= 410.75 && beat < 418.75 && (
        <div style={{
          position: 'absolute', left: 1525, top: 690, transform: `scale(${popIn(beat, 410.75, 0.35)}) rotate(-4deg)`, transformOrigin: '0 50%',
          fontFamily: F.zh, fontWeight: 700, fontSize: 32, color: '#D92D4B', background: 'rgba(255,255,255,.94)', padding: '8px 22px', borderRadius: 999,
          opacity: 1 - prog(beat, 418.4, 0.35), whiteSpace: 'nowrap',
        }}>{S6_WARN}</div>
      )}
      <Kinetic text="是最特别的" beat={beat} at={411.5} until={418.75} stagger={0.3} vertical size={92} color="#fff"
        style={{ position: 'absolute', left: 120, top: 70, filter: 'drop-shadow(0 0 14px rgba(232,71,139,.8))' }} />
      {beat >= 413.5 && beat < 418.75 && (
        <div style={{
          position: 'absolute', left: 300, top: 760, transform: `translate(-50%,-50%) scale(${interpolate(popIn(beat, 413.5, 0.35), [0, 1], [2.2, 1]) * (1 + 0.1 * g)})`,
          fontFamily: F.serif, fontWeight: 900, fontSize: 360, lineHeight: 1, color: open ? HOT : '#fff', WebkitTextStroke: `12px ${open ? '#fff' : HOT}`,
          paintOrder: 'stroke fill', textShadow: `0 0 40px rgba(255,160,200,.9)`, opacity: Math.min(1, popIn(beat, 413.5, 0.35) * 3) * (1 - prog(beat, 418.4, 0.35)),
        }}>爱</div>
      )}
      {/* soften into the grey bridge */}
      <AbsoluteFill style={{ background: '#C9C4D0', opacity: 0.45 * soft }} />
      <Flash amount={0.75 * hit(beat, G_OPEN, 0.16)} />
    </AbsoluteFill>
  );
};

export const S6_SCENES: Record<string, React.FC> = { s6a: S6a, s6b: S6b, s6c: S6c, s6d: S6d, s6e: S6e, s6f: S6f, s6g: S6g };
