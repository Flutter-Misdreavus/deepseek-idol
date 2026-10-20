// S1 Q&A (beats 45-111): fans grill her through the chat window; she answers like a reasoning model would.
import { AbsoluteFill, Img, interpolate, staticFile } from 'remotion';
import {
  S1_ANSWER, S1_ASK, S1_ASK_NOW, S1_COT, S1_FLOOD, S1_IDK, S1_IDK_HEAD, S1_SECRET, S1_THINK, UI,
} from '../data/copy';
import { easeInOut, easeOut, hit, popIn, prog, rnd, shake } from '../lib/anim';
import { pulse } from '../lib/beat';
import { BotRow, ChatWindow, InputBox, ThinkBox, UIC, UserBubble } from '../lib/chat';
import { Confetti, Stamp, StarFlare, Still, Sunburst, WhalePattern } from '../lib/deco';
import { F } from '../lib/fonts';
import { Flash } from '../lib/fx';
import { L2D } from '../lib/L2D';
import { C } from '../lib/palette';
import { useSection } from '../lib/section';
import { Kinetic } from '../lib/type';
import { Whale } from '../lib/whale';

const NAVY = '#1B2150';

/* ───────── s1a 45-64: the chat window drops in, three fan questions, "server busy" ───────── */

const ASK_AT = [47, 51.5, 55.5];
const BUSY_AT = 58; // strongest hit of the section
const TYPING_AT = 60;

/** grows a message slot from 0 to its height, so older messages scroll up smoothly */
const Slot: React.FC<{ beat: number; at: number; h: number; children: React.ReactNode; align?: 'flex-start' | 'flex-end' | 'center' }> = ({
  beat, at, h, children, align = 'flex-end',
}) => {
  if (beat < at) return null;
  const grow = easeOut(beat, at, 0.25);
  const p = popIn(beat, at, 0.35);
  return (
    <div style={{ height: h * grow, display: 'flex', justifyContent: align, alignItems: 'flex-end', flexShrink: 0 }}>
      <div style={{ transform: `scale(${0.6 + 0.4 * p})`, transformOrigin: align === 'flex-end' ? '100% 100%' : align === 'center' ? '50% 100%' : '0 100%', opacity: Math.min(1, p * 2) }}>
        {children}
      </div>
    </div>
  );
};

export const S1a: React.FC = () => {
  const { beat, f } = useSection();
  const drop = popIn(beat, 45, 0.7);
  const bumps = ASK_AT.reduce((s, a) => s + hit(beat, a, 0.2), 0) + 2 * hit(beat, BUSY_AT, 0.3);
  const [sx, sy] = shake(f, hit(beat, BUSY_AT, 0.4));
  const push = 1 + 0.05 * easeInOut(beat, 45, 19);
  return (
    <AbsoluteFill style={{ background: C.hot, overflow: 'hidden' }}>
      <WhalePattern color="#EE6CA3" offset={f * 1.6} size={110} gap={230} />
      {/* giant question marks behind the window, one per question */}
      {ASK_AT.map((a, i) => {
        const p = popIn(beat, a, 0.5);
        return p > 0 ? (
          <div key={i} style={{
            position: 'absolute', left: [180, 1500, 260][i], top: [140, 300, 600][i], fontFamily: F.serif, fontWeight: 900,
            fontSize: 420, color: '#F7A8CB', transform: `scale(${p}) rotate(${[-14, 12, -6][i]}deg)`, lineHeight: 1,
          }}>？</div>
        ) : null;
      })}
      {/* corner stickers pop on the downbeats */}
      {[[49, 250, 820, -12, 'dot'], [53, 1700, 170, 10, 'closed'], [57, 1640, 860, -8, 'star'], [61, 210, 230, 14, 'heart']].map(([at, x, y, r, eye], i) => {
        const p = popIn(beat, at as number, 0.4);
        return p > 0 ? (
          <div key={i} style={{ position: 'absolute', left: x as number, top: y as number, transform: `translate(-50%,-50%) scale(${p}) rotate(${(r as number) + 4 * Math.sin(beat * Math.PI)}deg)` }}>
            <Whale size={220} sticker eye={eye as never} color={['#9CCBFF', '#FFB3CF', '#FFE27A', '#B9A6FF'][i]} spout={i === 1 ? 0.8 : 0} />
          </div>
        ) : null;
      })}
      <div style={{
        position: 'absolute', left: 960, top: 530, transform: `translate(-50%,-50%) translate(${sx}px, ${sy + interpolate(drop, [0, 1], [-1100, 0])}px) scale(${push * (1 + 0.012 * bumps)}) rotate(${(1 - drop) * -6}deg)`,
      }}>
        <ChatWindow width={1260} height={830}>
          <div style={{ position: 'absolute', inset: 0, padding: '30px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 26 }}>
            <Slot beat={beat} at={45.6} h={96} align="flex-start">
              <BotRow avatar={76}>
                <div style={{ fontFamily: F.zh, fontWeight: 500, fontSize: 46, color: UIC.ink, paddingTop: 4 }}>{UI.hello}</div>
              </BotRow>
            </Slot>
            {S1_ASK.map((q, i) => (
              <Slot key={i} beat={beat} at={ASK_AT[i]} h={110}>
                <UserBubble text={q} size={52} />
              </Slot>
            ))}
            <Slot beat={beat} at={BUSY_AT} h={70} align="center">
              <div style={{
                fontFamily: F.zh, fontWeight: 700, fontSize: 30, color: '#D92D4B', background: '#FFE8EC', border: '2px solid #FFC2CD',
                padding: '10px 26px', borderRadius: 999, transform: `translateX(${Math.sin(f * 2.4) * 16 * hit(beat, BUSY_AT, 0.5)}px)`,
              }}>⚠ {UI.busy}</div>
            </Slot>
            <Slot beat={beat} at={TYPING_AT} h={86} align="flex-start">
              <BotRow avatar={70}>
                <div style={{ display: 'flex', gap: 12, padding: '20px 10px' }}>
                  {[0, 1, 2].map((k) => (
                    <div key={k} style={{
                      width: 18, height: 18, borderRadius: 9, background: UIC.sub,
                      transform: `translateY(${-10 * Math.max(0, Math.sin((beat * 2 - k * 0.3) * Math.PI))}px)`,
                    }} />
                  ))}
                </div>
              </BotRow>
            </Slot>
          </div>
        </ChatWindow>
      </div>
      <Flash amount={0.35 * hit(beat, BUSY_AT, 0.15)} />
    </AbsoluteFill>
  );
};

/* ───────── s1b 64-71: "我只吃 token" on yellow with confetti → punch-in "保密" ───────── */

const S1B_PUNCH = 67;
const S1B_STAMP = 69;

export const S1b: React.FC = () => {
  const { beat, f } = useSection();
  const punch = easeOut(beat, S1B_PUNCH, 0.4);
  // g4 is 1536x1024; her face is around (666, 360) in the image
  const w = 1560, x = 1190, y = 590;
  const s = w / 1536;
  const fx = x - w / 2 + 666 * s, fy = y - (1024 * s) / 2 + 360 * s;
  const [sx, sy] = shake(f, hit(beat, S1B_STAMP, 0.3) * 0.8, 3);
  const t = f / 30;
  return (
    <AbsoluteFill style={{ background: '#F6C445', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px,${sy}px)` }}>
        {/* far confetti layer */}
        {Array.from({ length: 22 }, (_, i) => (
          <Confetti key={`a${i}`} i={i} t={t} size={70 + rnd(i, 5) * 40}
            x={((rnd(i, 6) * 2100 - 90 - t * (20 + rnd(i, 7) * 30)) % 2100 + 2100) % 2100 - 90}
            y={((rnd(i, 8) * 1200 - t * (40 + rnd(i, 9) * 50)) % 1200 + 1200) % 1200 - 60} />
        ))}
        <div style={{ position: 'absolute', inset: 0, transform: `scale(${1 + 0.55 * punch})`, transformOrigin: `${fx}px ${fy}px` }}>
          <Still src="g4_hoodie_shh" x={x} y={y + 10 * Math.sin(t * 2)} w={w} />
        </div>
        {/* near confetti layer, in front of her */}
        {Array.from({ length: 8 }, (_, i) => (
          <Confetti key={`b${i}`} i={i + 50} t={t} size={110}
            x={((rnd(i, 16) * 2100 - t * 70) % 2100 + 2100) % 2100 - 90}
            y={((rnd(i, 18) * 1200 - t * 110) % 1200 + 1200) % 1200 - 60} />
        ))}
      </AbsoluteFill>
      <Kinetic text="我只吃" beat={beat} at={64} until={S1B_PUNCH} stagger={0.3} size={150} color="#fff" stroke={NAVY} strokeWidth={10}
        style={{ position: 'absolute', left: 120, top: 250 }} />
      {/* the latin word lands whole, not letter by letter */}
      <Kinetic text={UI.token} beat={beat} at={65} until={S1B_PUNCH} stagger={0} mode="stamp" size={170} color="#fff" stroke={NAVY} strokeWidth={11}
        style={{ position: 'absolute', left: 110, top: 425 }} />
      <Kinetic text="这个嘛…" beat={beat} at={S1B_PUNCH + 0.05} until={71} stagger={0.3} size={120} color="#fff" stroke={NAVY} strokeWidth={9}
        style={{ position: 'absolute', left: 110, top: 180 }} />
      {beat >= S1B_STAMP && (
        <div style={{
          position: 'absolute', left: 380, top: 640, transform: `translate(-50%,-50%) scale(${interpolate(popIn(beat, S1B_STAMP, 0.3), [0, 1], [2.4, 1])}) rotate(-10deg)`,
        }}>
          <Stamp text={S1_SECRET} size={330} id="s1b_stamp" />
        </div>
      )}
      <Flash amount={0.8 * hit(beat, S1B_PUNCH, 0.12)} />
    </AbsoluteFill>
  );
};

/* ───────── s1c 71-79: "嗯，让我想想" — Live2D thinking + the thinking box ───────── */

export const S1c: React.FC = () => {
  const { beat, f, abs } = useSection();
  const done = beat >= 78;
  const lines = S1_THINK.slice(0, Math.max(0, Math.min(S1_THINK.length, Math.floor(beat - 71) + 1)));
  const enter = easeOut(beat, 71, 0.5);
  return (
    <AbsoluteFill style={{ background: '#F4F6FB', overflow: 'hidden' }}>
      {/* dot grid */}
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id="s1c_dots" width={48} height={48} patternUnits="userSpaceOnUse" patternTransform={`translate(${-f * 0.8} 0)`}>
            <circle cx={24} cy={24} r={3} fill="#D9DEEA" />
          </pattern>
        </defs>
        <rect width={1920} height={1080} fill="url(#s1c_dots)" />
      </svg>
      {/* big faint "思考" behind */}
      <div style={{
        position: 'absolute', right: -40, top: 40, fontFamily: F.serif, fontWeight: 900, fontSize: 520, color: '#E6EAF4', lineHeight: 1,
        transform: `translateX(${(1 - enter) * 200}px)`,
      }}>思考</div>
      <div style={{ position: 'absolute', left: 20, top: 60, width: 1000, height: 1000, transform: `translateX(${(1 - enter) * -300}px) scale(${1 + 0.02 * pulse(abs, 0.2)})` }}>
        <L2D clip="s1c_think" frames={87} style={{ width: 1000, height: 1000 }} />
      </div>
      <div style={{ position: 'absolute', left: 960, top: 150, transform: `translateY(${(1 - enter) * 80}px)`, opacity: enter }}>
        <BotRow avatar={84}>
          <div style={{ transform: `scale(${done ? 1 + 0.06 * hit(beat, 78, 0.2) : 1})`, transformOrigin: '0 0' }}>
            <ThinkBox seconds={done ? 8 : null} spin={beat * 0.75} lines={lines} size={46} width={820} />
          </div>
        </BotRow>
      </div>
    </AbsoluteFill>
  );
};

/* ───────── s1d 79-87: "没错 深度思考 / 却又 秒出答案" — grey thought stream, gold answer slashes in ───────── */

const S1D_GOLD = 83;

export const S1d: React.FC = () => {
  const { beat, f } = useSection();
  const slash = easeOut(beat, S1D_GOLD, 0.25);
  const scroll = (beat - 79) * 2 * 52; // two lines per beat
  // the gold wedge: right part of the frame, diagonal edge
  const edgeTop = interpolate(slash, [0, 1], [1990, 1010]);
  const edgeBot = interpolate(slash, [0, 1], [1990, 820]);
  return (
    <AbsoluteFill style={{ background: '#22232A', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 90, top: 0, width: 1800, transform: `translateY(${600 - scroll}px)`, fontFamily: 'monospace', fontSize: 34, lineHeight: '52px', color: '#6F7380' }}>
        {Array.from({ length: 40 }, (_, i) => (
          <div key={i} style={{ color: i % 7 === 3 ? '#9EA3B0' : undefined }}>{S1_COT[i % S1_COT.length]}</div>
        ))}
      </div>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, #22232A 0%, rgba(34,35,42,0) 25%, rgba(34,35,42,0) 75%, #22232A 100%)' }} />
      {/* a background-coloured stroke knocks the scrolling thoughts out around the big glyphs */}
      <Kinetic text="没错" beat={beat} at={79} until={87} size={70} color="#C9CCD6" stroke="#22232A" strokeWidth={16}
        style={{ position: 'absolute', left: 120, top: 280 }} />
      <Kinetic text="深度思考" beat={beat} at={80} until={87} stagger={0.5} size={175} color="#fff" stroke="#22232A" strokeWidth={28}
        style={{ position: 'absolute', left: 110, top: 390 }} />
      {beat >= S1D_GOLD && (
        <div style={{ position: 'absolute', inset: 0, clipPath: `polygon(${edgeTop}px 0, 1920px 0, 1920px 1080px, ${edgeBot}px 1080px)` }}>
          <Sunburst cx={1450} cy={560} a="#F7B733" b="#FFCB52" rays={16} rot={beat * 0.15} />
          {[83, 84, 85, 86].map((a, i) => (
            <StarFlare key={i} x={[1300, 1700, 1180, 1620][i]} y={[230, 380, 850, 900][i]} size={120 + 140 * hit(beat, a, 0.3)} rot={beat * 20} />
          ))}
          <Kinetic text="却又" beat={beat} at={S1D_GOLD} until={87} size={70} color={NAVY} style={{ position: 'absolute', left: 1210, top: 300 }} />
          <Kinetic text={S1_ANSWER} beat={beat} at={S1D_GOLD + 0.5} until={87} stagger={0.25} mode="stamp" size={170} color={NAVY}
            style={{ position: 'absolute', left: 1150, top: 400 }} />
        </div>
      )}
      {beat >= S1D_GOLD && (
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
          <line x1={edgeTop} y1={0} x2={edgeBot} y2={1080} stroke="#fff" strokeWidth={10} />
        </svg>
      )}
      <Flash amount={0.7 * hit(beat, S1D_GOLD, 0.12)} />
    </AbsoluteFill>
  );
};

/* ───────── s1e 87-95: the star eye, a blurred chain of thought glimmering in the iris ───────── */

// g3_eye.png is 1536x1024; iris centre (691, 546), radius ~245, star glint (702, 513)
const EYE = { cx: 691, cy: 546, r: 245, sx: 702, sy: 513 };

export const S1e: React.FC = () => {
  const { beat, abs } = useSection();
  const k = 1.25; // image scale
  const ix = 880, iy = 540; // where the iris centre sits on screen
  const zoom = 1 + 0.12 * easeInOut(beat, 87, 8) + 0.015 * pulse(abs, 0.25);
  const left = ix - EYE.cx * k, top = iy - EYE.cy * k;
  const r = EYE.r * k * 0.82;
  const glint = 1 + 0.35 * hit(beat, Math.floor(beat), 0.25) + 2.2 * hit(beat, 94, 0.35);
  return (
    <AbsoluteFill style={{ background: '#141A3C', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: `${ix}px ${iy}px` }}>
        <Img src={staticFile('img/g3_eye.png')} style={{ position: 'absolute', left, top, width: 1536 * k }} />
        {/* the reflection: chain of thought scrolling inside the iris, blurred in and out */}
        <div style={{
          position: 'absolute', left: ix - r, top: iy - r, width: r * 2, height: r * 2, borderRadius: '50%', overflow: 'hidden',
          mixBlendMode: 'screen', opacity: 0.75,
        }}>
          <div style={{
            position: 'absolute', left: 30, top: r * 2 - (beat - 87) * 70, width: r * 2 - 60, fontFamily: F.zh, fontWeight: 500,
            fontSize: 30, lineHeight: '44px', color: '#BFD7FF', transform: 'scaleX(-1)',
          }}>
            {S1_COT.concat(S1_COT).map((l, i) => (
              <div key={i} style={{ filter: `blur(${2 + 5 * (0.5 + 0.5 * Math.sin(beat * 1.7 + i * 1.3))}px)` }}>{l}</div>
            ))}
          </div>
        </div>
        <StarFlare x={left + EYE.sx * k} y={top + EYE.sy * k} size={150 * glint} rot={8 + beat * 6} />
      </AbsoluteFill>
      {/* vertical lyric in two columns on the right, blurring into focus */}
      <div style={{ position: 'absolute', right: 120, top: 120, display: 'flex', flexDirection: 'row-reverse', gap: 30 }}>
        {['思维链若隐若现', '才最让人上头'].map((col, ci) => (
          <div key={ci} style={{ display: 'flex', flexDirection: 'column' }}>
            {[...col].map((ch, i) => {
              const at = 87 + ci * 3.5 + i * 0.4;
              const p = prog(beat, at, 0.6);
              const flick = ci === 0 && i >= 3 ? 0.5 + 0.5 * Math.sin(beat * 5 + i) : 1; // 若隐若现 flickers
              return (
                <span key={i} style={{
                  fontFamily: F.serif, fontWeight: 900, fontSize: 108, lineHeight: 1.08, color: '#fff',
                  opacity: p * (0.55 + 0.45 * flick), filter: `blur(${(1 - p) * 14}px)`, textShadow: '0 0 24px rgba(100,140,255,.6)',
                }}>{ch}</span>
              );
            })}
          </div>
        ))}
      </div>
      <Flash amount={0.6 * hit(beat, 94, 0.15)} />
    </AbsoluteFill>
  );
};

/* ───────── s1f 95-103: "那个也 不知道×3 / 这个也 不知道×3" — a wall of dumbfounded chibis, three stamps per phrase ───────── */

const IDK = [[96, 97, 98], [100, 101, 102]];
const STAMP_POS = [[560, 330, -12], [1360, 300, 9], [960, 700, -4], [640, 720, 7], [1300, 690, -9], [960, 330, 4]];

export const S1f: React.FC = () => {
  const { beat, f } = useSection();
  const phrase = beat < 99 ? 0 : 1;
  const stamps = IDK[phrase];
  const lastHit = stamps.reduce((m, a) => (beat >= a ? a : m), -10);
  const [sx, sy] = shake(f, hit(beat, lastHit, 0.25), 5);
  const tileBg = phrase === 0 ? '#F3A6C8' : '#A9C4FF';
  const cols = 9, rows = 6, tw = 1920 / 7;
  const off = (f * 2) % tw;
  return (
    <AbsoluteFill style={{ background: tileBg, overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px,${sy}px)` }}>
        {Array.from({ length: rows * cols }, (_, i) => {
          const c = i % cols, r = Math.floor(i / cols);
          const flip = stamps.some((a) => beat >= a && beat < a + 0.5 && (c + r + a) % 3 === 0);
          return (
            <div key={i} style={{
              position: 'absolute', left: c * tw - tw + off, top: r * tw * 0.75 - 60, width: tw - 14, height: tw * 0.75 - 14,
              background: flip ? '#fff' : phrase === 0 ? '#E46A9E' : '#5B7BE6', borderRadius: 10, overflow: 'hidden',
              border: '3px solid rgba(255,255,255,.7)',
            }}>
              <Img src={staticFile('l2d/s0c_dumb/00060.png')} style={{ width: '100%', marginTop: -tw * 0.12 }} />
            </div>
          );
        })}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'rgba(30,20,50,.25)' }} />
      <Kinetic text={S1_IDK_HEAD[phrase]} beat={beat} at={phrase ? 99 : 95} until={phrase ? 103 : 99} stagger={0.3} size={130} color="#fff" stroke={NAVY} strokeWidth={10}
        style={{ position: 'absolute', left: 80, top: 60 }} />
      {stamps.map((a, i) => {
        if (beat < a) return null;
        const [x, y, r] = STAMP_POS[phrase * 3 + i];
        return (
          <div key={`${phrase}_${i}`} style={{
            position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${interpolate(popIn(beat, a, 0.25), [0, 1], [2.6, 1])}) rotate(${r}deg)`,
          }}>
            <div style={{ background: 'rgba(255,255,255,.92)', borderRadius: 30, padding: 18 }}>
              <Stamp text={S1_IDK} size={330} id={`s1f_${phrase}_${i}`} />
            </div>
          </div>
        );
      })}
      <Flash amount={0.4 * hit(beat, lastHit, 0.1)} />
    </AbsoluteFill>
  );
};

/* ───────── s1g 103-108: "最爱哪种 prompt？哪位用户？" — the questions flood in ───────── */

export const S1g: React.FC = () => {
  const { beat, f } = useSection();
  const zoomOut = 1.12 - 0.12 * easeOut(beat, 103, 5);
  const [sx, sy] = shake(f, 0.15 + 0.5 * prog(beat, 105, 3), 7);
  return (
    <AbsoluteFill style={{ background: '#F4F6FB', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px,${sy}px) scale(${zoomOut})` }}>
        {S1_FLOOD.map((q, i) => {
          const at = i < 2 ? 103 + i * 1.5 : 104.6 + (i - 2) * 0.2;
          if (beat < at) return null;
          const p = popIn(beat, at, 0.3);
          const big = i < 2;
          const x = big ? [760, 1160][i] : 120 + rnd(i, 21) * 1500;
          const y = big ? [400, 600][i] : 90 + rnd(i, 22) * 820;
          return (
            <div key={i} style={{
              position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${p}) rotate(${big ? 0 : (rnd(i, 23) - 0.5) * 14}deg)`,
              zIndex: big ? 10 : i,
            }}>
              <UserBubble text={q} size={big ? 74 : 40 + rnd(i, 24) * 14} style={{
                boxShadow: '0 10px 24px rgba(20,26,60,.12)', background: big ? UIC.userBubble : ['#EAF0FF', '#FFE6F0', '#FFF4D6', '#E8F8EE'][i % 4],
              }} />
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ───────── s1h 108-111: "来吧 请作答" typed into the input box, send → white ───────── */

const S1H_SEND = 110.25;

export const S1h: React.FC = () => {
  const { beat } = useSection();
  const chars = [...S1_ASK_NOW];
  const n = Math.min(chars.length, Math.max(0, Math.floor((beat - 108.2) / 0.28) + 1));
  const sent = beat >= S1H_SEND;
  const press = hit(beat, S1H_SEND, 0.15);
  const white = prog(beat, S1H_SEND + 0.15, 0.6);
  return (
    <AbsoluteFill style={{ background: '#EEF0F6', alignItems: 'center', justifyContent: 'center' }}>
      <Kinetic text="来吧" beat={beat} at={108.2} until={112} size={110} color={NAVY} style={{ position: 'absolute', left: 340, top: 170 }} />
      <Kinetic text="请作答" beat={beat} at={109} until={112} stagger={0.3} mode="stamp" size={170} color={C.hot}
        style={{ position: 'absolute', left: 600, top: 230 }} />
      <div style={{ position: 'absolute', top: 560, transform: `translateY(${sent ? -40 * easeOut(beat, S1H_SEND, 0.3) : 0}px)` }}>
        <InputBox text={sent ? '' : chars.slice(0, n).join('')} cursor={!sent && Math.floor(beat * 2) % 2 === 0} press={press} />
      </div>
      {sent && (
        <div style={{ position: 'absolute', top: 400 - 300 * easeOut(beat, S1H_SEND, 0.5), right: 360, opacity: 1 - prog(beat, S1H_SEND + 0.2, 0.4) }}>
          <UserBubble text={S1_ASK_NOW} size={54} />
        </div>
      )}
      <Flash amount={white} />
    </AbsoluteFill>
  );
};

export const S1_SCENES: Record<string, React.FC> = { s1a: S1a, s1b: S1b, s1c: S1c, s1d: S1d, s1e: S1e, s1f: S1f, s1g: S1g, s1h: S1h };

