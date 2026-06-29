import React from "react";
import { Audio, Sequence, interpolate, staticFile } from "remotion";

/**
 * Audio bed for the ad — all generated with the ElevenLabs API:
 *  • music.mp3   — a 30s ambient pad (Sound-Generation)
 *  • vo1–vo6.mp3 — scene-synced narration (Text-to-Speech, voice "Jessica")
 *
 * `from` is the absolute start frame of each line; durations are the clip
 * lengths (CBR 128kbps) rounded up a frame so nothing trims. The music ducks
 * ~7dB under each line and fades at the head/tail.
 */
const VO = [
  { file: "vo1.mp3", from: 8, dur: 84 },
  { file: "vo2.mp3", from: 120, dur: 72 },
  { file: "vo3.mp3", from: 262, dur: 148 },
  { file: "vo4.mp3", from: 446, dur: 80 },
  { file: "vo5.mp3", from: 598, dur: 128 },
  { file: "vo6.mp3", from: 770, dur: 128 },
];

const MUSIC_BASE = 0.27;
const MUSIC_DUCKED = 0.12;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// 0→1 ramp that is 1 inside [start,end] and eases out over `ramp` frames.
function duckWindow(f: number, start: number, end: number, ramp = 10): number {
  const up = interpolate(f, [start - ramp, start], [0, 1], clamp);
  const down = interpolate(f, [end, end + ramp], [1, 0], clamp);
  return Math.min(up, down);
}

const musicVolume = (f: number): number => {
  const fadeIn = interpolate(f, [0, 28], [0, 1], clamp);
  const fadeOut = interpolate(f, [866, 900], [1, 0], clamp);
  let duck = 0;
  for (const v of VO) duck = Math.max(duck, duckWindow(f, v.from, v.from + v.dur));
  const base = interpolate(duck, [0, 1], [MUSIC_BASE, MUSIC_DUCKED]);
  return base * fadeIn * fadeOut;
};

export const Soundtrack: React.FC = () => {
  return (
    <>
      <Audio src={staticFile("music.mp3")} volume={musicVolume} />
      {VO.map((v) => (
        <Sequence key={v.file} from={v.from} durationInFrames={v.dur}>
          <Audio src={staticFile(v.file)} volume={(f) => interpolate(f, [0, 3], [0, 1], clamp)} />
        </Sequence>
      ))}
    </>
  );
};
