import { Easing, interpolate, spring } from "remotion";

const OUT_CUBIC = Easing.out(Easing.cubic);

/** Clamped fade — opacity 0→1 over [delay, delay+dur]. */
export function fade(frame: number, delay = 0, dur = 18): number {
  return interpolate(frame, [delay, delay + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

/** Fade + rise. Returns a style object ready to spread onto an element. */
export function fadeUp(
  frame: number,
  delay = 0,
  { dur = 22, dist = 26 }: { dur?: number; dist?: number } = {}
): { opacity: number; transform: string } {
  const opacity = fade(frame, delay, dur);
  const y = interpolate(frame, [delay, delay + dur], [dist, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT_CUBIC,
  });
  return { opacity, transform: `translateY(${y}px)` };
}

/** A springy pop (scale + fade) — good for chips, dots, badges. */
export function pop(
  frame: number,
  fps: number,
  delay = 0,
  { from = 0.6, damping = 14, stiffness = 140 } = {}
): { opacity: number; transform: string } {
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping, stiffness, mass: 0.7 },
  });
  const scale = interpolate(s, [0, 1], [from, 1]);
  return { opacity: interpolate(s, [0, 0.6], [0, 1], { extrapolateRight: "clamp" }), transform: `scale(${scale})` };
}

/** Exit fade — 1→0 over the last `dur` frames before `end`. */
export function fadeOut(frame: number, end: number, dur = 16): number {
  return interpolate(frame, [end - dur, end], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

export { OUT_CUBIC };
