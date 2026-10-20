// s8d「所以今天也在"幻觉"」(489-495): wink + tongue + peace sign, the "tehepero" of the hallucination joke.
import { HIDE_DESK, HIDE_TAIL, clipBeats } from '../lib/beats.js';

const B = clipBeats(489);
export default {
  size: [1000, 1000],
  outline: 10,
  duration: B.duration(495),
  transform: () => ({ x: 500, y: 560, scale: 0.26 }),
  parts: HIDE_DESK,
  hideDrawables: HIDE_TAIL,
  params: (t) => ({ ParamAngleZ: 12 * Math.min(1, t / 0.2), ParamAngleX: 8, ParamAngleY: 4 }),
  expressions: [
    { file: '调皮.exp3.json', from: -1 },
    { file: '吐舌.exp3.json', from: -1, weight: 0.6 },
    { file: '双手比耶.exp3.json', from: -1 },
    { file: '脸红.exp3.json', from: -1 },
  ],
  blinks: [],
};
