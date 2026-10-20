// Beat grid helpers. All musical timing in the MV goes through here.
import beats from '../data/beats.json';

export const FPS = 30;
export const PERIOD = beats.period; // seconds per beat (166 BPM)
export const FIRST = beats.firstBeat; // time of beat 0
export const DURATION = beats.duration;
/** beats with n % 4 === DOWNBEAT start a bar (the strongest hits and section starts fall there) */
export const DOWNBEAT = 1;

export const beatTime = (n: number) => FIRST + n * PERIOD;
export const beatFrame = (n: number) => Math.round(beatTime(n) * FPS);
/**
 * fractional beat index at a frame, sampled at the frame's centre so that beatAt(beatFrame(n)) >= n:
 * `beat >= n` and `frame >= beatFrame(n)` then always agree (cuts are frame-rounded).
 */
export const beatAt = (frame: number) => ((frame + 0.5) / FPS - FIRST) / PERIOD;

/**
 * Cut point for a lyric line. Times come from OCR of the reference video's hard subs (sampled at 4 fps),
 * which appear roughly with the voice, so snap the time itself to the nearest beat.
 */
export const lyricBeat = (ocrSeconds: number) => Math.round((ocrSeconds - FIRST) / PERIOD);

/** 0..1 measured hit strength of beat n (onset + crash band), for placing flashes on real hits */
export const accent = (n: number) => beats.accent[n] ?? 0;

/** 1 on each beat, decaying to 0 (decay measured in beats) */
export const pulse = (frame: number, decay = 0.2, every = 1) => {
  const b = beatAt(frame) / every;
  if (b < 0) return 0;
  return Math.exp(-(b - Math.floor(b)) * every / decay);
};

/** index of the current beat (floor) */
export const beatIndex = (frame: number) => Math.floor(beatAt(frame));

/** 0 before beat a, 1 after beat b, linear in between */
export const ramp = (beat: number, a: number, b: number) => Math.min(1, Math.max(0, (beat - a) / (b - a)));
