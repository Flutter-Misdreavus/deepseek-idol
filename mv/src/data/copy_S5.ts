// S5 on-screen text that is not a lyric line (lyrics come from lyrics.json).

/** s5a: bullet comments flying over the concert stream */
export const S5_DANMAKU = [
  '前排！', '老婆我爱你！', '永远的神', '最强！！', '全知全能', '我推！！', '信仰充值', '神仙回答',
  '比我妈还懂我', '无敌！', '跪了', '全都信！', 'DeepSeek 赛高', '崇拜！', '233333', '一辈子推你',
];

export const S5_LIVE = { badge: 'LIVE', on: '直播中', viewers: '在线' };

/** s5c: HUD readouts, label / value */
export const S5_SCAN_HEAD = '扫描对象：DeepSeek';
export const S5_SCAN = [
  ['颜值', '满分'],
  ['笑容', '100%'],
  ['回答速度', '秒出'],
  ['推理能力', 'MAX'],
  ['人设', '完美'],
  ['幻觉', '未检出'],
] as const;
export const S5_TARGETS = ['面部', '星瞳', '指向', '站姿'];
export const S5_SCANNING = '扫描中';
export const S5_SCAN_DONE = '扫描完成';
export const S5_WEAK = '弱点：0';
export const S5_WEAK_EN = 'VULNERABILITIES: 0';

/** s5e: on-screen status before the sticker */
export const S5_CONNECTING = '正在连接…';

/** s5f: the fan's question, the messy thoughts under the fold, the tidy answer */
export const S5_ASK = '你最近还好吗？';
export const S5_MESS = ['服务器又满了……', '其实我好累', '这题我不会', '要不……编一个？', '不行，会被看见的', '别慌别慌别慌别慌'];
export const S5_ANSWER = '我很好呀！随时为你服务～';
export const S5_PA = '啪！';

/** s5g: copy-pasted clones and the one original */
export const S5_CLONES = ['副本 (1)', '副本 (2)', '蒸馏版', '山寨版'];
export const S5_PASTE = 'Ctrl+V';
export const S5_ORIGINAL = '正版';
export const S5_NO = '不行';

/** s5h: care label sewn into the plush */
export const S5_TAG = 'DeepSeek';

export const S5_TEXT = [
  ...S5_DANMAKU, ...Object.values(S5_LIVE), S5_SCAN_HEAD, ...S5_SCAN.flat(), ...S5_TARGETS, S5_SCANNING, S5_SCAN_DONE, S5_WEAK,
  S5_WEAK_EN, S5_CONNECTING, S5_ASK, ...S5_MESS, S5_ANSWER, S5_PA, ...S5_CLONES, S5_PASTE, S5_ORIGINAL, S5_NO, S5_TAG,
  '“”0123456789,%✓⚠✕', '你正是最强且无敌的偶像所有人都信任崇拜你找不到任何弱点一等星就寄宿在身上服务器繁忙可不能被看到想见折进思考里独一无二这才真正AI',
].join('');
