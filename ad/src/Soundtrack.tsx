import React from "react";
import { Audio, Sequence, interpolate, staticFile } from "remotion";

/**
 * Audio bed for the 90s ad — all generated with the ElevenLabs API:
 *  • music1–3.mp3 — three evolving 30s ambient segments (Sound-Generation),
 *    crossfaded to cover the full minute-and-a-half.
 *  • vo1–vo13.mp3 — scene-synced narration (Text-to-Speech, voice "Jessica").
 *
 * `from`/`dur` are absolute frames; VO durations are the clip lengths (CBR
 * 128kbps) rounded up so nothing trims. The music ducks under each line.
 */
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const MUSIC_BASE = 0.24;
const MUSIC_DUCKED = 0.11;
const CLIP = 902; // ~30.07s @ 30fps per segment

// Each segment fades in / out (relative frames) to crossfade with its neighbour.
const MUSIC = [
  { file: "music1.mp3", from: 0, fadeIn: [0, 28] as const, fadeOut: [876, CLIP] as const },
  { file: "music2.mp3", from: 876, fadeIn: [0, 26] as const, fadeOut: [876, CLIP] as const },
  { file: "music3.mp3", from: 1752, fadeIn: [0, 26] as const, fadeOut: [846, CLIP] as const },
];

// One line per beat, pinned to its scene (see SCENE starts in timeline.ts).
const VO = [
  { file: "vo1.mp3", from: 12, dur: 84 }, // intro
  { file: "vo2.mp3", from: 150, dur: 86 }, // hook
  { file: "vo3.mp3", from: 356, dur: 91 }, // flashcards a
  { file: "vo4.mp3", from: 540, dur: 150 }, // flashcards b
  { file: "vo5.mp3", from: 720, dur: 150 }, // draw your day
  { file: "vo6.mp3", from: 1018, dur: 82 }, // match
  { file: "vo7.mp3", from: 1276, dur: 132 }, // rooms
  { file: "vo8.mp3", from: 1556, dur: 80 }, // warmth a
  { file: "vo9.mp3", from: 1700, dur: 180 }, // warmth b
  { file: "vo10.mp3", from: 1890, dur: 64 }, // plus a
  { file: "vo11.mp3", from: 2014, dur: 150 }, // plus b
  { file: "vo12.mp3", from: 2206, dur: 62 }, // burn
  { file: "vo13.mp3", from: 2424, dur: 110 }, // cta
];

// 0→1, =1 inside [start,end], eased over `ramp` frames at each edge.
function duckWindow(f: number, start: number, end: number, ramp = 10): number {
  const up = interpolate(f, [start - ramp, start], [0, 1], clamp);
  const down = interpolate(f, [end, end + ramp], [1, 0], clamp);
  return Math.min(up, down);
}

// Music level at an absolute frame: base, dipping to ducked under any VO line.
function musicLevel(abs: number): number {
  let duck = 0;
  for (const v of VO) duck = Math.max(duck, duckWindow(abs, v.from, v.from + v.dur));
  return interpolate(duck, [0, 1], [MUSIC_BASE, MUSIC_DUCKED]);
}

export const Soundtrack: React.FC = () => {
  return (
    <>
      {MUSIC.map((m) => (
        <Sequence key={m.file} from={m.from}>
          <Audio
            src={staticFile(m.file)}
            volume={(f) => {
              const shape = interpolate(f, m.fadeIn, [0, 1], clamp) * interpolate(f, m.fadeOut, [1, 0], clamp);
              return musicLevel(m.from + f) * shape;
            }}
          />
        </Sequence>
      ))}

      {VO.map((v) => (
        <Sequence key={v.file} from={v.from} durationInFrames={v.dur}>
          <Audio src={staticFile(v.file)} volume={(f) => interpolate(f, [0, 3], [0, 1], clamp)} />
        </Sequence>
      ))}
    </>
  );
};
