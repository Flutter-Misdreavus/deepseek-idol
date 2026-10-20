// Fonts come from @fontsource (npm) because Google Fonts is unreachable on this network.
import '@fontsource/hachi-maru-pop/400.css';
import '@fontsource/m-plus-rounded-1c/800.css';
import '@fontsource/m-plus-rounded-1c/500.css';
import '@fontsource/dela-gothic-one/400.css';
import '@fontsource/rampart-one/400.css';
import '@fontsource/yomogi/400.css';
import '@fontsource/zen-old-mincho/600.css';
import '@fontsource/zcool-kuaile/400.css';
import '@fontsource/noto-sans-sc/400.css';
import '@fontsource/noto-sans-sc/500.css';
import '@fontsource/noto-sans-sc/700.css';
import '@fontsource/noto-serif-sc/700.css';
import '@fontsource/noto-serif-sc/900.css';
import { continueRender, delayRender } from 'remotion';
import { ALL_COPY } from '../data/copy';
import lyrics from '../data/lyrics.json';

export const F = {
  pop: '"Hachi Maru Pop"',
  round: '"M PLUS Rounded 1c"',
  heavy: '"Dela Gothic One"',
  outline: '"Rampart One"',
  hand: '"Yomogi"',
  mincho: '"Zen Old Mincho"',
  zhCute: '"ZCOOL KuaiLe"',
  zh: '"Noto Sans SC"',
  serif: '"Noto Serif SC"',
} as const;

const FACES = [
  `400 40px ${F.pop}`, `800 40px ${F.round}`, `500 40px ${F.round}`, `400 40px ${F.heavy}`,
  `400 40px ${F.outline}`, `400 40px ${F.hand}`, `600 40px ${F.mincho}`, `400 40px ${F.zhCute}`,
  `400 40px ${F.zh}`, `500 40px ${F.zh}`, `700 40px ${F.zh}`, `700 40px ${F.serif}`, `900 40px ${F.serif}`,
];

/**
 * @font-face with unicode-range loads lazily; block rendering until every face has the glyphs of `text`.
 * Call at module level of a scene file with all of its on-screen strings.
 */
export const preloadGlyphs = (text: string) => {
  const handle = delayRender('fonts');
  Promise.all(FACES.map((f) => document.fonts.load(f, text))).then(() => continueRender(handle));
};

const SAMPLE = 'あア漢字0123456789！？♪【】我推的DeepSeekアイドル偶像YOASOBI「」ver.嗯，让我想想思考中…已深度思考（用时秒）热搜爆新全网刷屏中保密token#' + lyrics.map((l) => l.ja + l.zh).join('') + ALL_COPY;
preloadGlyphs(SAMPLE);
