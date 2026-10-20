// Beat grid for clip scripts (same data the Remotion side uses).
import fs from 'node:fs';
import path from 'node:path';

const g = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, '../../mv/src/data/beats.json'), 'utf8'));
export const PERIOD = g.period;
export const FIRST = g.firstBeat;
const FPS = 30;

/** Remotion frame of beat n (must match mv/src/lib/beat.ts beatFrame) */
export const beatFrame = (n) => Math.round((FIRST + n * PERIOD) * FPS);

/**
 * Time helpers for a clip that starts at beat `start` (clip t=0 == that beat's frame).
 * at(n): clip time of absolute beat n;  beatOf(t): fractional absolute beat at clip time t.
 */
export function clipBeats(start) {
  const t0 = beatFrame(start) / FPS;
  return {
    at: (n) => FIRST + n * PERIOD - t0,
    beatOf: (t) => (t + t0 - FIRST) / PERIOD,
    duration: (end) => (beatFrame(end) - beatFrame(start)) / FPS,
  };
}

// Desk, clipboard, mat, mouse: hide for a clean bust.
export const HIDE_DESK = Object.fromEntries(
  ['Part109', 'Part122', 'Part123', 'Part37', 'Part35', 'Part18', 'Part21', 'Part10', 'Part15', 'Part133', 'Part22', 'Part114', 'Part112', 'Part5']
    .map((p) => [p, 0]),
);

// The whale tail meshes (inside the 尾巴(蒙皮) skinning part; hiding that part would also take the ear fins).
// With the desk/clipboard hidden nothing covers her front and the tail floats detached, so every clip that
// uses HIDE_DESK hides these too (render with `hideDrawables: HIDE_TAIL`).
export const HIDE_TAIL = ['ArtMesh38', 'ArtMesh56', 'ArtMesh58', 'ArtMesh59', 'ArtMesh60'];
