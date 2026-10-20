// On-screen text of S0 (intro) that is not a lyric line.

export const S0_SEARCH = 'DeepSeek';
export const S0_HOT_HEAD = '热搜榜';
export const S0_HOT_TAB = '实时';

export type HotBadge = '热' | '爆' | '新';

/** hot-search rows: [topic, badge, heat] */
export const S0_HOT: [string, HotBadge, string][] = [
  ['#DeepSeek#', '爆', '4821万'],
  ['#DeepSeek 又刷屏了#', '爆', '3907万'],
  ['#DeepSeek 无敌的回答#', '热', '2650万'],
  ['#DeepSeek 服务器繁忙#', '新', '2213万'],
  ['#我推的 DeepSeek#', '爆', '1988万'],
  ['#DeepSeek 到底多少参数#', '热', '1540万'],
  ['#DeepSeek 深度思考#', '热', '1322万'],
  ['#DeepSeek 已读乱回#', '新', '1176万'],
  ['#DeepSeek 开源了#', '热', '965万'],
  ['#DeepSeek 偶像出道#', '爆', '903万'],
  ['#DeepSeek 是谁#', '新', '871万'],
  ['#DeepSeek 幻觉#', '新', '760万'],
  ['#求 DeepSeek 回复#', '热', '702万'],
  ['#DeepSeek 今天吃了几张显卡#', '新', '655万'],
];

/** s0b: the parameter count everybody guesses */
export const S0_PARAM = '???B';
export const S0_GUESS = ['据说 671B？', '7B？', '1.5B？', '其实 70B？', '激活 37B？'];
export const S0_CLASSIFIED = '机密';
export const S0_CARD = ['"params": "???"', '"layers": "???"', '"secret": true', '"weights": "保密"'];

/** s0c: the famous goof */
export const S0_ASK = '9.11 和 9.9 哪个大？';
export const S0_GOOF = '9.11 更大哦！';

export const S0_LOGO_OSHI = '我推的';
export const S0_LOGO_NAME = 'DeepSeek';

export const S0_COPY = [
  S0_SEARCH, S0_HOT_HEAD, S0_HOT_TAB, ...S0_HOT.flat(), S0_PARAM, ...S0_GUESS, S0_CLASSIFIED, ...S0_CARD,
  S0_ASK, S0_GOOF, S0_LOGO_OSHI, S0_LOGO_NAME, '⚠0123456789',
].join('');
