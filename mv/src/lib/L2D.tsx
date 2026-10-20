// Plays a pre-rendered Live2D PNG sequence (public/l2d/<clip>/00000.png ...) from the start of its Sequence.
import { Img, staticFile, useCurrentFrame } from 'remotion';

export const L2D: React.FC<{
  clip: string;
  frames: number;
  /** hold every n-th frame ("on twos") for a hand-drawn cadence */
  step?: number;
  loop?: boolean;
  style?: React.CSSProperties;
}> = ({ clip, frames, step = 1, loop = false, style }) => {
  const f = useCurrentFrame();
  let i = Math.floor(f / step) * step;
  i = loop ? i % frames : Math.min(i, frames - 1);
  return <Img src={staticFile(`l2d/${clip}/${String(i).padStart(5, '0')}.png`)} style={style} />;
};
