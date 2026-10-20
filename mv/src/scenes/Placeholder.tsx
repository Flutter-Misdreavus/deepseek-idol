// Grey-box animatic shot: section colour, the storyboard note, and the real kinetic lyric timing.
import { AbsoluteFill } from 'remotion';
import { pulse } from '../lib/beat';
import { F } from '../lib/fonts';
import { useSection } from '../lib/section';
import { Kinetic } from '../lib/type';
import { LINE_BEATS } from '../lyrics';
import { SECTION_BG, SHOTS, shotEnd } from '../timeline';

const isLight = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) > 150;
};

export const Placeholder: React.FC<{ index: number }> = ({ index }) => {
  const { beat, abs } = useSection();
  const shot = SHOTS[index];
  const end = shotEnd(index);
  const bg = SECTION_BG[shot.sec];
  const ink = isLight(bg) ? '#1A1A22' : '#FFFFFF';
  const lines = LINE_BEATS.filter((l) => l.beat >= shot.from - 0.5 && l.beat < end);
  return (
    <AbsoluteFill style={{ background: bg, filter: `brightness(${1 + 0.08 * pulse(abs)})` }}>
      <div style={{
        position: 'absolute', left: 120, right: 120, top: 120, height: 150, border: `3px dashed ${ink}55`, borderRadius: 18,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: `${ink}AA`, fontFamily: F.zh, fontSize: 34, padding: 20,
      }}>
        <b style={{ marginRight: 24 }}>{shot.id}</b>{shot.plan}
      </div>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', top: 120 }}>
        {lines.map((l) => (
          <Kinetic key={l.i} text={l.zh} beat={beat} at={l.beat} until={Math.min(end, l.next)} size={110} color={ink} style={{ position: 'absolute' }} />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
