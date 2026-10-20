// Lyric lines on the beat grid: each line's landing beat and the next line's, for kinetic text.
import lyrics from './data/lyrics.json';
import { lyricBeat } from './lib/beat';

export const LINE_BEATS = lyrics.map((l, i) => ({
  i,
  zh: l.zh,
  ja: l.ja,
  beat: lyricBeat(l.start),
  next: i + 1 < lyrics.length ? lyricBeat(lyrics[i + 1].start) : lyricBeat(l.end) + 4,
}));
