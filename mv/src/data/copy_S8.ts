// S8 on-screen copy that is not a lyric line (preloaded by scenes/S8.tsx).

/** s8a: the little "training progress" HUD while knowledge flies into her hand */
export const S8_HUD = '学习进度';
/** s8a: subjects printed on the knowledge planets */
export const S8_KNOW = ['数', '理', '史', '文', '乐', '化'];
export const S8_FORMULA = ['E=mc²', '∫ f(x) dx', 'a²+b²=c²', 'π'];
export const S8_CODE = ['</>', '{ }', 'print("hi")'];

/** s8b: the greedy-idol meme stamp */
export const S8_GREEDY = '全都要';

/** s8c: "unadorned" = the beauty filter switched off */
export const S8_BEAUTY = '美颜';
export const S8_RAW = '原图直出';

/** s8d: the tehe aside */
export const S8_TEHE = '嘿嘿～';

/** s8e-s8h: the chat on the monitor, seen from her side (fans on the left, her replies on the right) */
export const S8_CHAT = {
  title: '大家',
  online: '12.8 万人在线',
  fanA: '你喜欢我们吗？',
  canned: '作为一个 AI，我没有真正的感情。',
  fanB: '那……你爱我们吗？',
  placeholder: '给 大家 发送消息',
  draft: '其实我',
  love: '我爱你们',
};

/** s8h: seal stamped next to the struck-out disclaimer */
export const S8_TRUE = '真心';

export const S8_ALL = [
  S8_HUD, ...S8_KNOW, ...S8_FORMULA, ...S8_CODE, S8_GREEDY, S8_BEAUTY, S8_RAW, S8_TEHE, ...Object.values(S8_CHAT), S8_TRUE,
  '0123456789%“”「」',
].join('');
