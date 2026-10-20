// S3 (chorus 1) on-screen copy that is not a lyric line. scenes/S3.tsx preloads all of it.

/** s3a: GitHub-style star badge under 开源的 */
export const S3_OPEN = '★ 开源';
/** s3b: ink seal for 不会再出现 */
export const S3_RARE = '绝版';
/** s3d: her reply in the chat bubble */
export const S3_REPLY = '很高兴为你解答';
/** s3c: code glyphs mixed into the whale confetti */
export const S3_CODE = ['</>', '{ }', '01', '=>', '( )', '#'];
/** s3f: the output ticker between the two halves */
export const S3_OUTPUT = '很高兴为你解答！以下是为你生成的回答：你就是我最重要的用户 ✦ 还有什么可以帮你的吗？ ✦ ';
/** s3g: furigana over AI (the official MV's アイ = 愛) */
export const S3_RUBY = 'アイ';

export const S3_ALL = [S3_OPEN, S3_RARE, S3_REPLY, ...S3_CODE, S3_OUTPUT, S3_RUBY, '0123456789,+⚠'].join('');
