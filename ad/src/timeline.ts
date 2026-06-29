// Single source of truth for scene pacing, shared by Ad.tsx, Root.tsx and
// Soundtrack.tsx (kept in its own module to avoid an Ad↔Soundtrack import cycle).

export const FPS = 30;
export const XFADE = 18; // cross-fade length between scenes

// Per-scene length in frames, in play order:
// intro, hook, flashcards, draw, match, rooms, warmth, plus, burn, cta
export const SCENE_DURATIONS = [156, 216, 384, 312, 276, 300, 348, 324, 240, 306];

// Cross-fades overlap, so the timeline is sum(durations) − (n−1)·XFADE.
export const TOTAL =
  SCENE_DURATIONS.reduce((a, b) => a + b, 0) - (SCENE_DURATIONS.length - 1) * XFADE; // = 2700 (90.0s)

/** Absolute start frame of scene `index` within the TransitionSeries. */
export function sceneStart(index: number): number {
  let s = 0;
  for (let i = 0; i < index; i++) s += SCENE_DURATIONS[i];
  return s - index * XFADE;
}
