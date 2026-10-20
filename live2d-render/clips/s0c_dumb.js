// s0c「就连偶尔犯傻」(17-25): blank stare, a question mark pops on beat 19, head bobbing on the beat.
import { HIDE_DESK, HIDE_TAIL, clipBeats } from '../lib/beats.js';

const B = clipBeats(17);
export default {
  size: [1000, 1000],
  outline: 10,
  duration: B.duration(25),
  transform: () => ({ x: 500, y: 560, scale: 0.26 }),
  parts: HIDE_DESK,
  hideDrawables: HIDE_TAIL,
  params: (t) => {
    const b = B.beatOf(t);
    return { ParamAngleZ: 10 * Math.sin((b * Math.PI) / 2), ParamAngleY: -6 * Math.exp(-(b % 1) * 6), ParamAngleX: 6 };
  },
  expressions: [
    { file: '呆呆眼.exp3.json', from: -1 },
    { file: '问号.exp3.json', from: B.at(19), fade: 0.05 },
  ],
  blinks: [],
};
