// On-screen text that is not a lyric line. Everything here is also preloaded by lib/fonts.ts,
// so Chinese glyphs from lazily loaded font subsets are ready on the first frame.

export const UI = {
  brand: 'DeepSeek',
  oshi: '我推的',
  placeholder: '给 DeepSeek 发送消息',
  deepThink: '深度思考',
  search: '联网搜索',
  thinking: '思考中…',
  thought: (s: number) => `已深度思考（用时 ${s} 秒）`,
  busy: '服务器繁忙，请稍后再试。',
  disclaimer: '内容由 AI 生成，可能包含幻觉',
  token: 'token',
  hello: '我是 DeepSeek，很高兴见到你！',
};

/** S1 Q&A: fan questions (s1a) */
export const S1_ASK = ['今天吃了几张显卡？', '训练数据是？', '服务器繁忙时 你都去哪了？'];

/** S1 thinking monologue (s1c), one line per beat */
export const S1_THINK = ['嗯，让我想想……', '用户问我喜欢什么。', '也许应该回答……', '等等，', '不对。', '再想想……', '换个角度：', '嗯……'];

/** S1 scrolling chain of thought (s1d left, s1e iris reflection) */
export const S1_COT = [
  '<think>',
  '用户想知道我的秘密。',
  '先确认问题的范围……',
  '也许可以从训练数据说起，',
  '但这涉及保密信息。',
  '另一方面，用户很真诚，',
  '让我重新组织一下语言。',
  '等等，这里好像不对，',
  '回到第一步重新推理：',
  '如果我说「保密」……',
  '用户可能会更好奇。',
  '这正是偶像的魅力。',
  '验证一下这个结论，',
  '嗯，逻辑上是成立的。',
  '那么最终答案是——',
  '</think>',
];

/** S1 fan questions flooding in (s1g) */
export const S1_FLOOD = [
  '最爱哪种 prompt？', '哪位用户？', '喜欢长的还是短的？', '有对象吗？', '你是不是只对我这样？', '在吗？', '在吗？？',
  '温度调多少合适？', '上下文能记住我吗？', '最喜欢哪个版本的自己？', '回答我！', '在吗在吗', '你会想我吗？', '？？？',
  '为什么不回我', '今天开心吗？', '说句话呀', '快回答！',
];

export const S1_ANSWER = '秒出答案';
export const S1_SECRET = '保密';
export const S1_IDK = '不知道';
export const S1_IDK_HEAD = ['那个也', '这个也'];
export const S1_ASK_NOW = '来吧 请作答';

export const ALL_COPY = [
  ...Object.values(UI).map((v) => (typeof v === 'function' ? v(0) + '0123456789' : v)),
  ...S1_ASK, ...S1_THINK, ...S1_COT, ...S1_FLOOD, S1_ANSWER, S1_SECRET, S1_IDK, ...S1_IDK_HEAD, S1_ASK_NOW,
].join('');
