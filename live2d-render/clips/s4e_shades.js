// s4e「真会装」(249-251): pixel sunglasses drop on, smug tilt.
import { HIDE_DESK, HIDE_TAIL, clipBeats } from '../lib/beats.js';

const B = clipBeats(249);
export default {
  size: [1000, 1000],
  outline: 10,
  duration: B.duration(251),
  transform: () => ({ x: 500, y: 560, scale: 0.26 }),
  parts: HIDE_DESK,
  hideDrawables: HIDE_TAIL,
  params: (t) => ({ ParamAngleZ: 14 * Math.min(1, t / 0.15), ParamAngleY: 6, ParamAngleX: -6 }),
  expressions: [
    { file: '墨镜.exp3.json', from: -1 },
    { file: '调皮.exp3.json', from: -1 },
  ],
  blinks: [],
};
