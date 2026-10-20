// Bottom bilingual subtitle line (DS zh on top, ja below), present for the whole MV.
import { interpolate, useCurrentFrame } from 'remotion';
import lyrics from './data/lyrics.json';
import { FPS, beatTime, lyricBeat } from './lib/beat';
import { F } from './lib/fonts';
import { C } from './lib/palette';

// LRC times run ~0.3 s ahead of the voice: show each line from its beat-snapped cut (2 frames early)
// so a new line never appears over the previous scene.
const LINES = lyrics.map((l) => ({ ...l, start: beatTime(lyricBeat(l.start)) - 0.07, end: l.end + 0.3 }));
LINES.forEach((l, i) => { if (i + 1 < LINES.length) l.end = Math.min(l.end, LINES[i + 1].start); });

export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const line = LINES.find((l) => t >= l.start && t < l.end);
  if (!line) return null;
  const fade = Math.min(
    interpolate(t, [line.start, line.start + 0.15], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(t, [line.end - 0.15, line.end], [1, 0], { extrapolateLeft: 'clamp' }),
  );
  // official-MV style: small white type low in the frame. A thin dark rim plus a soft shadow keeps it legible
  // on the white and light-grey worlds (S2, S8 end, S9) without boxing it in on dark scenes.
  const rim = [[1, 0], [-1, 0], [0, 1], [0, -1], [0.7, 0.7], [-0.7, 0.7], [0.7, -0.7], [-0.7, -0.7]]
    .map(([x, y]) => `${x * 1.6}px ${y * 1.6}px 0 rgba(20,22,40,.55)`).join(', ');
  const shadow = `${rim}, 0 0 8px rgba(0,0,0,.5), 0 2px 4px rgba(0,0,0,.4)`;
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 34, display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 2, opacity: fade, color: C.white,
    }}>
      {line.zh && (
        <div style={{ fontFamily: F.zh, fontWeight: 700, fontSize: 32, letterSpacing: 3, textShadow: shadow }}>
          {line.zh}
        </div>
      )}
      <div style={{ fontFamily: F.round, fontWeight: 500, fontSize: 23, letterSpacing: 2, textShadow: shadow, opacity: 0.92 }}>
        {line.ja}
      </div>
    </div>
  );
};
