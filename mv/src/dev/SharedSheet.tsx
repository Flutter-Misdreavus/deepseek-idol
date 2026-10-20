// Contact sheet of the cross-section props (monitor, heart, crowd) for design review.
import { AbsoluteFill } from 'remotion';
import { Crowd } from '../lib/crowd';
import { BigHeart } from '../lib/heart';
import { Monitor, SCREEN_H, SCREEN_W } from '../lib/monitor';
import { C } from '../lib/palette';

export const SharedSheet: React.FC = () => (
  <AbsoluteFill style={{ background: '#D9D9DE' }}>
    <div style={{ position: 'absolute', left: 40, top: 30 }}>
      <Monitor width={560} glow="#FFE27A">
        <div style={{ width: SCREEN_W, height: SCREEN_H, background: C.yellow }} />
      </Monitor>
    </div>
    <div style={{ position: 'absolute', left: 640, top: 60 }}>
      <Monitor width={380} on={0} stand={false} />
    </div>
    <div style={{ position: 'absolute', left: 1080, top: 40, display: 'flex', gap: 30 }}>
      <BigHeart size={240} swim={0.45} />
      <BigHeart size={240} crack={0.5} split={0.5} />
      <BigHeart size={240} color="#1C1C24" shade="#0A0A0E" glint="#8A8FA8" crack={1} crackColor="#FF3B5C" />
    </div>
    <div style={{ position: 'absolute', left: 0, bottom: 0, width: 1920, height: 560, background: '#141A3C' }}>
      <Crowd beat={3.2} width={1920} height={560} eyes={1} sticks={0.7} blink={false} />
    </div>
  </AbsoluteFill>
);
