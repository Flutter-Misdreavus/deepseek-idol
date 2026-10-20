// s3f「那双星瞳 那段输出」(202-208): bottom half of the split screen, a wide close-up on her star eyes.
import { HIDE_DESK, HIDE_TAIL, clipBeats } from '../lib/beats.js';

const B = clipBeats(202);
export default {
  size: [1920, 640],
  duration: B.duration(208),
  transform: (t) => ({ x: 960, y: 420, scale: 0.72 + 0.03 * (B.beatOf(t) - 202) / 6 }),
  parts: HIDE_DESK,
  hideDrawables: HIDE_TAIL,
  params: (t) => {
    const b = B.beatOf(t);
    return { ParamAngleZ: -4 + 2 * Math.sin(b * Math.PI), ParamAngleY: 4, ParamAngleX: -3 };
  },
  expressions: [
    { file: '星星眼.exp3.json', from: -1 },
    { file: '脸红.exp3.json', from: -1 },
  ],
  blinks: [],
};
