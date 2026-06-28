import type { CurvePoints } from "./types";

// ─────────────────────────────────────────────────────────────────────────
// The curve primitive. Five integer values (0–10) sampled across the day.
// Timeline reads Morning → Afternoon → Evening → Night; we sample 5 points
// along that axis (the 4 labels mark regions, the 5th point closes the night).
// ─────────────────────────────────────────────────────────────────────────

export const TIMELINE_LABELS = ["Morning", "Afternoon", "Evening", "Night"];
export const POINT_COUNT = 5;
export const MATCH_THRESHOLD = 0.85;

/**
 * Coarse L/M/H signature per point — the GSI bucket key (playbook §10.2).
 * Everyone sharing a signature lands in the same matching pool.
 */
export function signatureOf(points: CurvePoints): string {
  return points.map((v) => (v < 4 ? "L" : v > 6 ? "H" : "M")).join("");
}

/**
 * Similarity in [0,1]. 1.0 = an identical day. Group when >= MATCH_THRESHOLD.
 * Exact Euclidean distance, normalised by the maximum possible distance.
 */
export function similarity(a: CurvePoints, b: CurvePoints): number {
  const maxDist = Math.sqrt(POINT_COUNT * 100); // each axis spans 0..10
  const d = Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0));
  return 1 - d / maxDist;
}

export function matchPercent(a: CurvePoints, b: CurvePoints): number {
  return Math.round(similarity(a, b) * 100);
}

/** A warm floor so a near-empty demo room never reads as cold. */
export const MATCH_FLOOR = 72;

/**
 * The number shown on a match. The drawn curve is the headline signal — an
 * honest day-shape similarity (`curveSim` in [0,1]) to the closest soul already
 * in the room — lifted a little by how deep a shared interest branch runs
 * (`depth` 0 = a fresh room, no real soul yet). Kept in [MATCH_FLOOR, 98] so it
 * is always warm but never a flat 100. This is what makes "people who felt it
 * too" honest: interests choose the room, the curve sets the closeness.
 */
export function blendedMatchPercent(curveSim: number, depth: number): number {
  const base = Math.max(0, Math.min(1, curveSim)) * 100;
  const lift = Math.min(Math.max(0, depth) * 2, 8);
  return Math.max(MATCH_FLOOR, Math.min(98, Math.round(base * 0.92 + lift)));
}

/** A short human read of the day's overall shape, for warm copy. */
export function describeCurve(points: CurvePoints): string {
  const avg = points.reduce((s, v) => s + v, 0) / points.length;
  const start = points[0];
  const end = points[points.length - 1];
  const rose = end - start >= 3;
  const fell = start - end >= 3;
  if (avg >= 7) return "a bright day";
  if (avg <= 3) return "a heavy day";
  if (rose) return "a day that lifted";
  if (fell) return "a day that softened";
  const peak = Math.max(...points);
  const trough = Math.min(...points);
  if (peak - trough >= 5) return "a day of waves";
  return "a steady day";
}

/** Clamp + round raw canvas values into the 0–10 integer domain. */
export function quantize(value: number): number {
  return Math.max(0, Math.min(10, Math.round(value)));
}

/**
 * Build a smooth SVG path (Catmull-Rom → cubic Bézier) through points mapped
 * into a [width × height] box. Shared by the canvas, hero, and overlays.
 */
export function curvePath(
  points: number[],
  width: number,
  height: number,
  padding = 0,
): string {
  const n = points.length;
  if (n === 0) return "";
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const xy = points.map((v, i) => {
    const x = padding + (innerW * i) / (n - 1);
    const y = padding + innerH * (1 - v / 10);
    return [x, y] as const;
  });

  let d = `M ${xy[0][0]},${xy[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = xy[i === 0 ? 0 : i - 1];
    const p1 = xy[i];
    const p2 = xy[i + 1];
    const p3 = xy[i + 2 < n ? i + 2 : n - 1];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}
