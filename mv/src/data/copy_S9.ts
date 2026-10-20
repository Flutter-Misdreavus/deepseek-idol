// On-screen text of S9 (outro): the end credits.

export const S9_CREDITS = [
  { role: '原曲', names: ['YOASOBI「アイドル」'] },
  { role: 'Live2D 模型', names: ['@氵六青'] },
  { role: '形象', names: ['@上善无形', '@ZipZipPin'] },
];
export const S9_LICENSE = 'CC BY-NC-SA 4.0';
export const S9_FAN = '非商用同人二创';

export const S9_COPY = [...S9_CREDITS.flatMap((c) => [c.role, ...c.names]), S9_LICENSE, S9_FAN, '我推的DeepSeek'].join('');
