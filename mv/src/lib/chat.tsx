// Code-drawn chat UI (the MV's stand-in for the official MV's CRT TV): window, bubbles, thinking box, input box.
import { UI } from '../data/copy';
import { F } from './fonts';
import { C } from './palette';
import { Whale } from './whale';

export const UIC = {
  ink: '#1F2329',
  sub: '#8A8F98',
  line: '#E6E8EC',
  userBubble: '#EAF0FF',
  panel: '#F6F7F9',
  blue: C.blue,
};

export const Avatar: React.FC<{ size?: number }> = ({ size = 64 }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%', background: '#EEF2FF', border: `2px solid ${UIC.line}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0,
  }}>
    <Whale size={size * 0.95} color="#7FA8FF" belly="#F4F8FF" blush={false} style={{ marginTop: size * 0.08 }} />
  </div>
);

export const ChatWindow: React.FC<{
  width: number;
  height: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ width, height, children, style }) => (
  <div style={{
    width, height, background: '#fff', borderRadius: 30, overflow: 'hidden', position: 'relative',
    boxShadow: '0 30px 60px rgba(40,10,60,.28), 0 0 0 3px rgba(255,255,255,.6)', display: 'flex', flexDirection: 'column', ...style,
  }}>
    <div style={{
      height: 92, flexShrink: 0, borderBottom: `2px solid ${UIC.line}`, display: 'flex', alignItems: 'center', gap: 16, padding: '0 30px',
    }}>
      <Avatar size={54} />
      <span style={{ fontFamily: F.zh, fontWeight: 700, fontSize: 34, color: UIC.ink, letterSpacing: 0.5 }}>{UI.brand}</span>
      <span style={{
        fontFamily: F.zh, fontWeight: 700, fontSize: 20, color: '#fff', background: C.hot, borderRadius: 999, padding: '4px 14px', marginLeft: 4,
      }}>{UI.oshi}</span>
      <div style={{ flex: 1 }} />
      {[0, 1, 2].map((i) => <div key={i} style={{ width: 14, height: 14, borderRadius: 7, background: UIC.line }} />)}
    </div>
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>{children}</div>
  </div>
);

export const UserBubble: React.FC<{ text: string; size?: number; style?: React.CSSProperties }> = ({ text, size = 44, style }) => (
  <div style={{
    background: UIC.userBubble, color: UIC.ink, fontFamily: F.zh, fontWeight: 500, fontSize: size, lineHeight: 1.35,
    padding: `${size * 0.42}px ${size * 0.62}px`, borderRadius: size * 0.62, whiteSpace: 'nowrap', ...style,
  }}>
    {text}
  </div>
);

/** assistant row: avatar + free content */
export const BotRow: React.FC<{ children: React.ReactNode; avatar?: number; style?: React.CSSProperties }> = ({ children, avatar = 64, style }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 22, ...style }}>
    <Avatar size={avatar} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: avatar * 0.12 }}>{children}</div>
  </div>
);

/** "已深度思考（用时 N 秒）" header with a spinner, plus the grey monologue under a left rule */
export const ThinkBox: React.FC<{
  seconds: number | null;
  /** rotation of the spinner in turns (only while thinking, i.e. seconds === null) */
  spin?: number;
  lines: string[];
  size?: number;
  width?: number;
}> = ({ seconds, spin = 0, lines, size = 34, width = 760 }) => (
  <div style={{ width, fontFamily: F.zh }}>
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 14, background: UIC.panel, borderRadius: 14,
      padding: `${size * 0.32}px ${size * 0.55}px`, fontSize: size * 0.8, fontWeight: 500, color: UIC.ink,
    }}>
      {seconds === null ? (
        <svg width={size * 0.8} height={size * 0.8} viewBox="0 0 24 24" style={{ transform: `rotate(${spin * 360}deg)` }}>
          <circle cx={12} cy={12} r={9} fill="none" stroke={UIC.line} strokeWidth={3} />
          <path d="M12 3 A9 9 0 0 1 21 12" fill="none" stroke={UIC.blue} strokeWidth={3} strokeLinecap="round" />
        </svg>
      ) : (
        <svg width={size * 0.8} height={size * 0.8} viewBox="0 0 24 24">
          <path d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z" fill={UIC.blue} />
        </svg>
      )}
      <span>{seconds === null ? UI.thinking : UI.thought(seconds)}</span>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24">
        <path d="M6 9 L12 15 L18 9" fill="none" stroke={UIC.sub} strokeWidth={2.5} strokeLinecap="round" />
      </svg>
    </div>
    <div style={{
      marginTop: size * 0.5, borderLeft: `3px solid ${UIC.line}`, paddingLeft: size * 0.6, color: UIC.sub,
      fontSize: size, lineHeight: 1.55, fontWeight: 400,
    }}>
      {lines.map((l, i) => <div key={i}>{l}</div>)}
    </div>
  </div>
);

export const InputBox: React.FC<{
  text: string;
  cursor: boolean;
  width?: number;
  /** 0..1 press of the send button */
  press?: number;
  size?: number;
}> = ({ text, cursor, width = 1240, press = 0, size = 46 }) => (
  <div style={{
    width, background: '#fff', borderRadius: 34, border: `3px solid ${UIC.line}`, padding: '34px 40px 26px',
    boxShadow: '0 20px 50px rgba(20,26,60,.12)', fontFamily: F.zh,
  }}>
    <div style={{ fontSize: size, fontWeight: 500, color: text ? UIC.ink : '#B4B8C0', height: size * 1.4, display: 'flex', alignItems: 'center' }}>
      {text || UI.placeholder}
      {cursor && <span style={{ display: 'inline-block', width: 4, height: size * 1.1, background: UIC.blue, marginLeft: 6 }} />}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 26 }}>
      <Pill on>{UI.deepThink}</Pill>
      <Pill>{UI.search}</Pill>
      <div style={{ flex: 1 }} />
      <div style={{
        width: 74, height: 74, borderRadius: 37, background: text ? UIC.blue : '#C9D3F5', display: 'flex', alignItems: 'center',
        justifyContent: 'center', transform: `scale(${1 - 0.15 * press})`,
      }}>
        <svg width={36} height={36} viewBox="0 0 24 24">
          <path d="M12 19 L12 5 M6 11 L12 5 L18 11" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  </div>
);

const Pill: React.FC<{ on?: boolean; children: React.ReactNode }> = ({ on, children }) => (
  <div style={{
    fontSize: 26, fontWeight: 500, padding: '10px 22px', borderRadius: 999,
    background: on ? '#E3EBFF' : '#fff', color: on ? UIC.blue : UIC.sub, border: `2px solid ${on ? '#C3D3FF' : UIC.line}`,
  }}>
    {children}
  </div>
);
