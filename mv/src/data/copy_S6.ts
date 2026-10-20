// On-screen text of S6 (beats 346-419) that is not the lyric itself. Preloaded by scenes/S6.tsx.

/** s6a: notifications bursting out of the frame. [icon char, icon colour, text] */
export const S6_NOTIFS: [string, string, string][] = [
  ['热', '#FF4D4F', '#DeepSeek 又出圈了#'],
  ['赞', '#FF7BAC', '点赞 10万+'],
  ['转', '#4D6BFE', '转发 99+'],
  ['评', '#F29A38', '「这回答绝了」'],
  ['新', '#22B573', '你关注的 DeepSeek 回答了问题'],
  ['@', '#4D6BFE', '@DeepSeek 太强了'],
  ['热', '#FF4D4F', '热搜 第1'],
  ['赞', '#FF7BAC', '收藏 5万+'],
  ['评', '#F29A38', '「怎么什么都会」'],
  ['新', '#22B573', '下载榜 #1'],
  ['转', '#4D6BFE', '分享到群聊'],
  ['热', '#FF4D4F', '#全网都在问#'],
  ['!', '#D92D4B', '服务器繁忙'],
  ['赞', '#FF7BAC', '+1'],
];
export const S6_ANSWER = '这题我最拿手！';
export const S6_BADGE = '99+';
export const S6_HOT = '热搜 第1';

/** s6b: matrix labels */
export const S6_LAYER = 'layers[61].mlp.W_down';
export const S6_SHAPE = 'shape: [7168 × 18432]';

/** s6c: the résumé of canned replies, bottom row first */
export const S6_CANNED = [
  '好的',
  '当然可以！',
  '很高兴为你解答',
  '乐意效劳',
  '这是一个很好的问题',
  '作为一个 AI 助手',
  '希望对你有帮助',
  '以下是详细解答：',
  '我理解你的感受',
  '还有什么可以帮你的吗？',
];
export const S6_CV = '个人履历 · DeepSeek';

/** s6d: footnote under the big 爱 */
export const S6_NOTE = '*内容由 AI 生成';

/** s6e: name tags and the colour swatch */
export const S6_TAGS = ['V3', 'R1'];
export const S6_SWATCH = ['深海蓝', '#4D6BFE'];

/** s6f: placeholders while a panel is still "generating" */
export const S6_GEN = '生成中…';
export const S6_THINK = ['∵ 唱 + 跳', '∴ 偶像', '<think>', 'Q.E.D.'];

/** s6g */
export const S6_WARN = '⚠ 可能包含幻觉';

export const S6_ALL = [
  ...S6_NOTIFS.flatMap(([a, , b]) => [a, b]), S6_ANSWER, S6_BADGE, S6_HOT, S6_LAYER, S6_SHAPE, ...S6_CANNED, S6_CV, S6_NOTE,
  ...S6_TAGS, ...S6_SWATCH, S6_GEN, ...S6_THINK, S6_WARN, 'No.0123456789-.',
].join('');
