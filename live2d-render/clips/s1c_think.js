// s1c「无论被问什么 都"嗯，让我想想"」(71-79): square glasses, head slowly circling while "thinking", dizzy spiral eyes for the last two beats.
import { HIDE_DESK, HIDE_TAIL, clipBeats } from '../lib/beats.js';

const B = clipBeats(71);
export default {
  size: [1000, 1000],
  outline: 10,
  duration: B.duration(79),
  transform: () => ({ x: 500, y: 560, scale: 0.26 }),
  parts: HIDE_DESK,
  hideDrawables: HIDE_TAIL,
  params: (t) => {
    const a = (B.beatOf(t) - 71) * (Math.PI / 2);
    return { ParamAngleX: 18 * Math.cos(a), ParamAngleY: 10 * Math.sin(a), ParamAngleZ: 8 * Math.sin(a) };
  },
  expressions: [
    { file: '方眼镜.exp3.json', from: -1 },
    { file: '晕晕.exp3.json', from: B.at(77), fade: 0.06 },
    { file: '流汗.exp3.json', from: B.at(77), fade: 0.06 },
  ],
  blinks: { seed: 3, to: B.at(77) },
};
