// On-screen text of S2 (pre-chorus) that is not a lyric line.

/** s2b: the training corpus drifting past the heart */
export const S2_CORPUS = ['维基百科', '教科书.pdf', '恋爱小说 第3章', 'arXiv 论文', '新闻联播', 'main.py', '百科词条', '问答社区', '现代汉语词典', '歌词.txt'];
/** s2b: searching the corpus */
export const S2_SEARCH = '检索：喜欢上某个人';
export const S2_NO_RESULT = '0 条结果';
/** s2c: tag on the hallucinated half */
export const S2_UNVERIFIED = '无法验证';
/** s2d: the user who fell for it */
export const S2_FELL = '用户 +1';
/** s2e: counter label */
export const S2_HEAVY = '重度用户';

export const S2_COPY = [...S2_CORPUS, S2_SEARCH, S2_NO_RESULT, S2_UNVERIFIED, S2_FELL, S2_HEAVY, '99+0123456789×'].join('');
