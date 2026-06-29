/**
 * Catmull-Rom → cubic-bézier curve builder, ported verbatim from the product
 * (components/scenes/DrawYourDay.tsx) so the ad's signature curve matches the
 * real "draw your day" plot exactly. Values are a 0–10 mood scale.
 */
export const VW = 1000;
export const VH = 440;
const PAD_L = 72;
const PAD_R = 44;
const PAD_TOP = 56;
const PAD_BOTTOM = 76;
export const PLOT_W = VW - PAD_L - PAD_R;
export const PLOT_H = VH - PAD_TOP - PAD_BOTTOM;

export function valueToY(v: number): number {
  return PAD_TOP + PLOT_H * (1 - v / 10);
}
export function indexX(i: number, n: number): number {
  return PAD_L + (PLOT_W * i) / (n - 1);
}

export type Pt = { x: number; y: number };
type Seg = { p1: Pt; c1: Pt; c2: Pt; p2: Pt };

function controlPoints(values: number[]): Pt[] {
  return values.map((v, i) => ({ x: indexX(i, values.length), y: valueToY(v) }));
}

function segments(values: number[]): Seg[] {
  const n = values.length;
  const xy = controlPoints(values);
  const segs: Seg[] = [];
  for (let i = 0; i < n - 1; i++) {
    const p0 = xy[i === 0 ? 0 : i - 1];
    const p1 = xy[i];
    const p2 = xy[i + 1];
    const p3 = xy[i + 2 < n ? i + 2 : n - 1];
    segs.push({
      p1,
      c1: { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 },
      c2: { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 },
      p2,
    });
  }
  return segs;
}

/** Smooth line path through the mood values. */
export function linePath(values: number[]): string {
  const segs = segments(values);
  let d = `M ${segs[0].p1.x},${segs[0].p1.y}`;
  for (const s of segs) {
    d += ` C ${s.c1.x},${s.c1.y} ${s.c2.x},${s.c2.y} ${s.p2.x},${s.p2.y}`;
  }
  return d;
}

/** Filled area under the curve (for the violet wash). */
export function areaPath(values: number[]): string {
  const n = values.length;
  return `${linePath(values)} L ${indexX(n - 1, n)},${valueToY(0)} L ${indexX(0, n)},${valueToY(0)} Z`;
}

/** Control-point coordinates (for the dot handles). */
export function points(values: number[]): (Pt & { v: number })[] {
  return values.map((v, i) => ({ x: indexX(i, values.length), y: valueToY(v), v }));
}

/** Point on the curve at draw-progress p∈[0,1] — used for the glowing pen tip. */
export function pointAtProgress(values: number[], p: number): Pt {
  const segs = segments(values);
  const total = segs.length;
  const f = Math.max(0, Math.min(1, p)) * total;
  const i = Math.min(total - 1, Math.floor(f));
  const t = f - i;
  const s = segs[i];
  const mt = 1 - t;
  return {
    x: mt * mt * mt * s.p1.x + 3 * mt * mt * t * s.c1.x + 3 * mt * t * t * s.c2.x + t * t * t * s.p2.x,
    y: mt * mt * mt * s.p1.y + 3 * mt * mt * t * s.c1.y + 3 * mt * t * t * s.c2.y + t * t * t * s.p2.y,
  };
}
