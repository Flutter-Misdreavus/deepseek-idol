// Debug overlay: flashes on every beat, shows time / beat number.
import { useCurrentFrame } from 'remotion';
import { FPS, beatAt, pulse } from './lib/beat';

export const Metronome: React.FC = () => {
  const f = useCurrentFrame();
  const b = beatAt(f);
  const p = pulse(f, 0.15);
  return (
    <div style={{
      position: 'absolute', left: 24, top: 24, padding: '8px 14px', borderRadius: 12,
      background: `rgba(255,${Math.round(80 + 175 * (1 - p))},80,${0.35 + 0.6 * p})`,
      fontFamily: 'monospace', fontSize: 22, color: '#000',
    }}>
      {(f / FPS).toFixed(2)}s · f{f} · beat {b < 0 ? '-' : Math.floor(b)}
    </div>
  );
};
