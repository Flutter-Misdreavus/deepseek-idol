// S4 rap (beats 218-280): the old model versions, jealous of the newest one. On-screen text that is not a lyric line.

/** the old versions, oldest first (name tags in s4b, bars in s4d) */
export const S4_VERSIONS = ['V1', 'V2', 'V2.5', 'V3', 'R1', 'Distill'];

/** the freebie sticker slapped on each old version (s4b) */
export const S4_FREEBIE = '赠品';
export const S4_FREEBIE_SUB = 'FREE';

/** s4c flood columns */
export const S4_BASELINE = ['对照组', 'Baseline B'];

/** s4d benchmark chart */
export const S4_CHART = { title: '综合跑分', unit: 'Benchmark', her: '最新版', off: '爆表' };
export const S4_SCORES = [31.4, 42.7, 48.9, 61.2, 66.8, 52.3];

/** s4f: their old #1 leaderboard entries, struck through */
export const S4_BOARD = ['No.1  DeepSeek-V3  2024.12', 'No.1  DeepSeek-R1  2025.01', 'No.1  R1-Distill  2025.01'];
export const S4_LEGACY = '旧版本';
export const S4_ECHO = '不可能';

/** s4h / s4i noise-text glyph sets */
export const S4_NOISE = ['不完美的你', '可不认', '不原谅', '自己'];

/** s4i the crowned No.1 */
export const S4_RANK = '#1';

export const S4_COPY = [
  ...S4_VERSIONS, S4_FREEBIE, S4_FREEBIE_SUB, ...S4_BASELINE, ...Object.values(S4_CHART), ...S4_BOARD, S4_LEGACY, S4_ECHO,
  ...S4_NOISE, S4_RANK, '0123456789.%',
].join('');
