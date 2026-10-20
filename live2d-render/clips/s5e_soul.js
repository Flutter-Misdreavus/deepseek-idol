// s5e「"服务器繁忙"可不能被看到」(311-320): on the monitor her soul leaks out (blank eyes + ghost) before the sticker covers it.
import { HIDE_DESK, HIDE_TAIL, clipBeats } from '../lib/beats.js';

const B = clipBeats(311);
export default {
  size: [1000, 1000],
  outline: 10,
  duration: B.duration(320),
  transform: () => ({ x: 500, y: 560, scale: 0.26 }),
  parts: HIDE_DESK,
  hideDrawables: HIDE_TAIL,
  params: (t) => ({ ParamAngleY: -14, ParamAngleZ: -8 + 2 * Math.sin(t * 3), ParamAngleX: 0 }),
  expressions: [
    { file: '呆呆眼.exp3.json', from: -1 },
    { file: '吐魂.exp3.json', from: -1 },
    { file: '流汗.exp3.json', from: -1 },
  ],
  blinks: [],
};
