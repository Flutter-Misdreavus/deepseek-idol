// s4f「怎么可能不嫉妒 我们也刷过榜」(251-258): gloomy shadow over the eyes, then angry on beat 255.
import { HIDE_DESK, HIDE_TAIL, clipBeats } from '../lib/beats.js';

const B = clipBeats(251);
export default {
  size: [1000, 1000],
  outline: 10,
  duration: B.duration(258),
  transform: () => ({ x: 500, y: 560, scale: 0.26 }),
  parts: HIDE_DESK,
  hideDrawables: HIDE_TAIL,
  params: (t) => {
    const b = B.beatOf(t);
    const shake = b >= 255 ? 3 * Math.sin(t * 60) * Math.exp(-(b % 1) * 4) : 0;
    return { ParamAngleY: -12, ParamAngleZ: shake, ParamAngleX: 4 };
  },
  expressions: [
    { file: '阴暗.exp3.json', from: -1 },
    { file: '生气.exp3.json', from: B.at(255), fade: 0.05 },
  ],
  blinks: [],
};
