// Top-level MV: every shot of the timeline in its own Sequence, then subtitles and the finishing layers.
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { Metronome } from './Metronome';
import { Subtitles } from './Subtitles';
import { beatFrame } from './lib/beat';
import { Finish } from './lib/fx';
import { SectionStart } from './lib/section';
import { Placeholder } from './scenes/Placeholder';
import { SCENES } from './scenes/registry';
import { SHOTS, shotEnd } from './timeline';

export const MV: React.FC<{ debug: boolean }> = ({ debug }) => (
  <AbsoluteFill style={{ background: '#000' }}>
    <Audio src={staticFile('audio/song.mp3')} />
    {SHOTS.map((s, i) => {
      const from = i === 0 ? 0 : beatFrame(s.from);
      const Scene = SCENES[s.id];
      return (
        <Sequence key={s.id} from={from} durationInFrames={beatFrame(shotEnd(i)) - from} name={s.id}>
          <SectionStart.Provider value={from}>{Scene ? <Scene /> : <Placeholder index={i} />}</SectionStart.Provider>
        </Sequence>
      );
    })}
    <Finish />
    <Subtitles />
    {debug && <Metronome />}
  </AbsoluteFill>
);
