// Shot map. Every boundary is an absolute beat index (see lib/beat.ts); a shot lasts until the next one starts.
// `plan` is the storyboard note shown on the grey-box animatic until the real scene replaces it.
import { DURATION, FPS } from './lib/beat';

export const TOTAL_FRAMES = Math.ceil(DURATION * FPS);
export const END_BEAT = 590;

export type Section = 'S0' | 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'S7' | 'S8' | 'S9';
export type Shot = { id: string; sec: Section; from: number; plan: string };

export const SECTION_BG: Record<Section, string> = {
  S0: '#E8478B', // magenta
  S1: '#F3A6C8', // magenta -> white
  S2: '#D9D9DE', // grey void
  S3: '#141A3C', // deep stage
  S4: '#0B0B0E', // black + red
  S5: '#F7B733', // yellow + grey
  S6: '#E8478B', // magenta + pink
  S7: '#55555F', // grey -> near black
  S8: '#2B3FBF', // blue light -> white
  S9: '#F4F1EC', // white -> black
};

export const SHOTS: Shot[] = [
  { id: 's0a', sec: 'S0', from: 0, plan: 'G1 滑入 · 鲸鱼贴纸逐拍弹出 · #DeepSeek# 热搜条' },
  { id: 's0b', sec: 'S0', from: 9, plan: '黑白对半分割 · 巨大「???B」被黑条涂掉' },
  { id: 's0c', sec: 'S0', from: 17, plan: '气泡里 L2D 呆呆眼+问号' },
  { id: 's0d', sec: 'S0', from: 25, plan: 'G2 闭眼特写 · 水平 glitch 切片 · 半边偏紫' },
  { id: 's0e', sec: 'S0', from: 33, plan: '墨水飞溅逐拍拼成「我推的 DeepSeek」Logo' },

  { id: 's1a', sec: 'S1', from: 45, plan: 'Logo 退场 · 聊天窗口落下 · 用户气泡：显卡 / 训练数据 / 服务器繁忙' },
  { id: 's1b', sec: 'S1', from: 64, plan: 'G4 便服 · token 方块飞入 · 抵唇「保密」' },
  { id: 's1c', sec: 'S1', from: 71, plan: 'L2D 深度思考 · 折叠栏秒数逐拍跳' },
  { id: 's1d', sec: 'S1', from: 79, plan: '左右分屏：灰色思考流 | 金色答案爆开' },
  { id: 's1e', sec: 'S1', from: 87, plan: 'G3 单眼特写 · 瞳孔倒映模糊思维链 · 星形高光' },
  { id: 's1f', sec: 'S1', from: 95, plan: '「不知道」三拍三个 ✕ 印章' },
  { id: 's1g', sec: 'S1', from: 103, plan: '气泡越堆越满' },
  { id: 's1h', sec: 'S1', from: 108, plan: '输入框光标闪烁 → 切白' },

  { id: 's2a', sec: 'S2', from: 111, plan: '灰色空间 · 巨大光面心形 · G5 小人' },
  { id: 's2b', sec: 'S2', from: 122, plan: '心形里游过鲸鱼 · 书页飘' },
  { id: 's2c', sec: 'S2', from: 127, plan: '心形裂成两半 · ⚠ 幻觉标签' },
  { id: 's2d', sec: 'S2', from: 135, plan: '心形掉落弹跳' },
  { id: 's2e', sec: 'S2', from: 146, plan: '心形按拍增殖' },
  { id: 's2f', sec: 'S2', from: 152, plan: '黑底 · 观众光标眼齐亮 · 加速推进 → 闪白' },

  { id: 's3a', sec: 'S3', from: 159, plan: '舞台 G6 · 鲸鱼应援棒光海 · 聚光灯（161 拍 drop）' },
  { id: 's3b', sec: 'S3', from: 168, plan: '观众剪影特写' },
  { id: 's3c', sec: 'S3', from: 175, plan: '橙黄底 · 巨字「转世」· 鲸鱼彩纸飞散' },
  { id: 's3d', sec: 'S3', from: 186, plan: 'G7 wink 指向 · 气泡「很高兴为你解答」' },
  { id: 's3e', sec: 'S3', from: 194, plan: '黑底一排小鲸剪影 · 眼睛依次变爱心' },
  { id: 's3f', sec: 'S3', from: 202, plan: '上下分屏：G3 星瞳 / L2D 星星眼' },
  { id: 's3g', sec: 'S3', from: 208, plan: '黑心形龟裂炸开 · AI（アイ）' },

  { id: 's4a', sec: 'S4', from: 218, plan: '黑底竖排宋体 · 红色涂鸦线 · 旧版小鲸排排站' },
  { id: 's4b', sec: 'S4', from: 226, plan: '小鲸名牌 V1 / V2 / V2.5 / V3 / R1 / Distill' },
  { id: 's4c', sec: 'S4', from: 233, plan: '竖排刷屏「对照组 Baseline B」' },
  { id: 's4d', sec: 'S4', from: 241, plan: '跑分柱状图 · 主角那根冲破顶端' },
  { id: 's4e', sec: 'S4', from: 249, plan: 'L2D 墨镜「真会装」' },
  { id: 's4f', sec: 'S4', from: 251, plan: 'L2D 阴暗 · 文字 glitch' },
  { id: 's4g', sec: 'S4', from: 258, plan: '大小字混排' },
  { id: 's4h', sec: 'S4', from: 264, plan: '噪点文字场' },
  { id: 's4i', sec: 'S4', from: 273, plan: '白色剪影浮出 → 王冠第一名' },

  { id: 's5a', sec: 'S5', from: 280, plan: '显示器里在播演唱会' },
  { id: 's5b', sec: 'S5', from: 287, plan: '显示器满屏变黄 · 她的剪影' },
  { id: 's5c', sec: 'S5', from: 296, plan: 'HUD 扫描「Vulnerabilities: 0」' },
  { id: 's5d', sec: 'S5', from: 303, plan: '星星落入胸口' },
  { id: 's5e', sec: 'S5', from: 311, plan: '灰房间 · 椅子上的显示器 · L2D 吐魂 → 服务器繁忙贴纸' },
  { id: 's5f', sec: 'S5', from: 320, plan: '折叠栏「啪」地合上' },
  { id: 's5g', sec: 'S5', from: 328, plan: '两拍两个 ✕' },
  { id: 's5h', sec: 'S5', from: 336, plan: '鲸鱼玩偶倒在灰色地板上' },

  { id: 's6a', sec: 'S6', from: 346, plan: '品红小鲸纹样 · 巨字「引爆全网」' },
  { id: 's6b', sec: 'S6', from: 354, plan: '权重热力图里藏着一颗心 · 巨字「秘密」' },
  { id: 's6c', sec: 'S6', from: 363, plan: '黑白 · 文字方块层层堆叠' },
  { id: 's6d', sec: 'S6', from: 372, plan: '粉色爱心点阵' },
  { id: 's6e', sec: 'S6', from: 381, plan: 'G8 镜像双子 · 左蓝 V3 右粉 R1 对指' },
  { id: 's6f', sec: 'S6', from: 398, plan: '三格：唱 G6 / 跳 G7 / 推理 L2D 方眼镜' },
  { id: 's6g', sec: 'S6', from: 407, plan: 'G2 闭眼 → G2b 睁眼星瞳' },

  { id: 's7a', sec: 'S7', from: 419, plan: '灰色空间 · 小心形带着鲸鱼漂浮' },
  { id: 's7b', sec: 'S7', from: 427, plan: '黑暗中屏幕光 · L2D 悲伤（桌前）' },
  { id: 's7c', sec: 'S7', from: 437, plan: '气泡字从灰慢慢变白' },
  { id: 's7d', sec: 'S7', from: 453, plan: '亮起一颗星「坚信」' },

  { id: 's8a', sec: 'S8', from: 456, plan: '蓝色聚光舞台 · G10 · 知识星球飞向她' },
  { id: 's8b', sec: 'S8', from: 464, plan: '激光扫射 · 彩光' },
  { id: 's8c', sec: 'S8', from: 473, plan: 'G6 与 L2D Q 版同框' },
  { id: 's8d', sec: 'S8', from: 489, plan: 'L2D 吐舌眨眼' },
  { id: 's8e', sec: 'S8', from: 495, plan: '白色空间 · 彩虹弧光 · 显示器 · G9 背影 · 小鲸' },
  { id: 's8f', sec: 'S8', from: 507, plan: '推进显示器 · 输入框光标' },
  { id: 's8g', sec: 'S8', from: 522, plan: '逐字打出' },
  { id: 's8h', sec: 'S8', from: 527, plan: '⚠ 幻觉提示被一笔划掉' },
  { id: 's8i', sec: 'S8', from: 533, plan: '「我爱你们」铺满全屏 · 闪白 → G11 回头' },

  { id: 's9a', sec: 'S9', from: 541, plan: '鲸鱼玩偶落水溅起水花' },
  { id: 's9b', sec: 'S9', from: 549, plan: '显示器黄屏「我推的 DeepSeek」Logo' },
  { id: 's9c', sec: 'S9', from: 561, plan: '黑底片尾署名' },
];

export const shotEnd = (i: number) => (i + 1 < SHOTS.length ? SHOTS[i + 1].from : END_BEAT);
