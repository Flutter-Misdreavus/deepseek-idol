import { Composition } from 'remotion';
import './lib/fonts';
import { Cover } from './Cover';
import { FPS } from './lib/beat';
import { MV } from './MV';
import { TOTAL_FRAMES } from './timeline';
import { SharedSheet } from './dev/SharedSheet';
import { WhaleSheet } from './dev/WhaleSheet';

export const Root: React.FC = () => (
  <>
    <Composition id="MV" component={MV} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1920} height={1080} defaultProps={{ debug: true }} />
    <Composition id="Cover" component={Cover} durationInFrames={1} fps={FPS} width={1920} height={1080} />
    <Composition id="Cover43" component={Cover} durationInFrames={1} fps={FPS} width={1440} height={1080} />
    <Composition id="SharedSheet" component={SharedSheet} durationInFrames={1} fps={FPS} width={1920} height={1080} />
    <Composition id="WhaleSheet" component={WhaleSheet} durationInFrames={1} fps={FPS} width={1920} height={1080} />
  </>
);
