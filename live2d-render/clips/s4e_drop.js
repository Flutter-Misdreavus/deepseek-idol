// s4e「真会装」(249-251): smug face first, the pixel shades snap on at 249.75 (S4.tsx drops a code-drawn
// pair from the top that lands on that frame), then the smug tilt.
import { HIDE_DESK, HIDE_TAIL, clipBeats } from '../lib/beats.js';

const B = clipBeats(249);
const LAND = B.at(249.75);
export default {
  size: [1000, 1000],
  outline: 10,
  duration: B.duration(251),
  transform: () => ({ x: 500, y: 560, scale: 0.26 }),
  parts: HIDE_DESK,
  hideDrawables: HIDE_TAIL,
  params: (t) => {
    const k = t < LAND ? 0 : Math.min(1, (t - LAND) / 0.12);
    return { ParamAngleZ: 14 * k, ParamAngleY: 6 - 10 * (1 - k), ParamAngleX: -6 * k };
  },
  expressions: [
    { file: '调皮.exp3.json', from: -1 },
    { file: '墨镜.exp3.json', from: LAND, fade: 0.001 },
  ],
  blinks: [],
};
