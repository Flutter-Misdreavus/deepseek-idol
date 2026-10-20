// s6f「又唱又跳又推理」(398-407): the "reasoning" panel — round glasses, nodding along on every beat.
import { HIDE_DESK, HIDE_TAIL, clipBeats } from '../lib/beats.js';

const B = clipBeats(398);
export default {
  size: [1000, 1000],
  outline: 10,
  duration: B.duration(407),
  transform: () => ({ x: 500, y: 560, scale: 0.26 }),
  parts: HIDE_DESK,
  hideDrawables: HIDE_TAIL,
  params: (t) => {
    const b = B.beatOf(t);
    return { ParamAngleY: -8 * Math.exp(-(b % 1) * 5), ParamAngleZ: 6, ParamAngleX: 10 };
  },
  expressions: [
    { file: '圆眼镜.exp3.json', from: -1 },
    { file: '感叹号.exp3.json', from: B.at(404), fade: 0.05 },
  ],
  blinks: { seed: 8 },
};
