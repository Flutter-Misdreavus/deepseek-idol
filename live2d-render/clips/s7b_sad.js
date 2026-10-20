// s7b「爱过谁的心情 我都不曾有」(427-437): alone at the desk in the dark, sad, head sinking lower.
import { clipBeats } from '../lib/beats.js';

const B = clipBeats(427);
export default {
  size: [1000, 1000],
  outline: 0,
  duration: B.duration(437),
  transform: () => ({ x: 500, y: 540, scale: 0.27 }),
  params: (t) => ({ ParamAngleY: -8 - 8 * Math.min(1, t / B.duration(437)), ParamAngleX: -4, ParamAngleZ: 3 * Math.sin(t * 0.8) }),
  expressions: [
    { file: '深色桌布.exp3.json', from: -1 },
    { file: '悲伤.exp3.json', from: -1 },
  ],
  blinks: { seed: 5 },
};
