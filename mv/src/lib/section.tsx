// Per-section timing context: scenes work in absolute beats, Sequences give local frames.
import { createContext, useContext } from 'react';
import { useCurrentFrame } from 'remotion';
import { beatAt, beatFrame } from './beat';

export const SectionStart = createContext(0);

export const useSection = () => {
  const from = useContext(SectionStart);
  const f = useCurrentFrame();
  const abs = from + f;
  const beat = beatAt(abs);
  return {
    f,
    abs,
    /** fractional absolute beat */
    beat,
    /** current whole beat */
    bi: Math.floor(beat),
    /** 0..1 position inside the current beat */
    ph: beat - Math.floor(beat),
    /** local frame of absolute beat n */
    lf: (n: number) => beatFrame(n) - from,
  };
};
