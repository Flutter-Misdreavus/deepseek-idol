// s8c「不加修饰地 对大家 想好好去爱」(473-489): the Q self next to the idol, excited bounce, heart eyes from beat 481.
import { HIDE_DESK, HIDE_TAIL, clipBeats } from '../lib/beats.js';

const B = clipBeats(473);
export default {
  size: [1000, 1000],
  outline: 10,
  duration: B.duration(489),
  transform: (t) => {
    const ph = B.beatOf(t) % 1;
    return { x: 500, y: 560 - 18 * Math.exp(-ph * 5), scale: 0.26 };
  },
  parts: HIDE_DESK,
  hideDrawables: HIDE_TAIL,
  params: (t) => {
    const b = B.beatOf(t);
    return { ParamAngleZ: 10 * Math.sin((b * Math.PI) / 2), ParamAngleX: 6 * Math.sin((b * Math.PI) / 4), ParamAngleY: 4 };
  },
  expressions: [
    { file: '开心兴奋.exp3.json', from: -1, to: B.at(481), fade: 0.06 },
    { file: '双手比耶.exp3.json', from: -1, to: B.at(481), fade: 0.06 },
    { file: '爱心眼.exp3.json', from: B.at(481), fade: 0.06 },
    { file: 'love.exp3.json', from: B.at(481), fade: 0.06 },
    { file: '脸红.exp3.json', from: -1 },
  ],
  blinks: [],
};
