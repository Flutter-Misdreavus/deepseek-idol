// Small animation helpers in beat time.
import { Easing } from 'remotion';

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** 0 before `at`, 1 after `at + dur` (beats), linear between */
export const prog = (beat: number, at: number, dur: number) => clamp01((beat - at) / dur);

const back = Easing.out(Easing.back(2.0));
const cubicOut = Easing.out(Easing.cubic);
const cubicInOut = Easing.inOut(Easing.cubic);

/** overshooting 0 -> 1 pop that starts at `at` (beats) */
export const popIn = (beat: number, at: number, dur = 0.35) => (beat < at ? 0 : back(prog(beat, at, dur)));
export const easeOut = (beat: number, at: number, dur: number) => cubicOut(prog(beat, at, dur));
export const easeInOut = (beat: number, at: number, dur: number) => cubicInOut(prog(beat, at, dur));

/** exponential decay after `at`: 1 at the hit, ~0 after `decay * 4` beats; 0 before */
export const hit = (beat: number, at: number, decay = 0.25) => (beat < at ? 0 : Math.exp(-(beat - at) / decay));

/** deterministic pseudo-random in [0, 1) */
export const rnd = (i: number, salt = 0) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** small camera shake offset (px) driven by an intensity 0..1 */
export const shake = (frame: number, amount: number, seed = 0) =>
  amount <= 0.001 ? [0, 0] : [Math.sin(frame * 2.1 + seed) * 14 * amount, Math.cos(frame * 2.7 + seed * 3) * 10 * amount];
