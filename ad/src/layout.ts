import { useVideoConfig } from "remotion";

/**
 * Orientation-aware sizing so the same scenes render well as a 16:9 landing/
 * YouTube ad and a 9:16 Reels/TikTok cut. Everything is a centered column, so
 * only a handful of sizes need to flex.
 */
export function useLayout() {
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  return {
    width,
    height,
    vertical,
    pad: vertical ? 72 : 140,
    gap: vertical ? 30 : 30,
    kicker: vertical ? 20 : 22,
    headline: vertical ? 78 : 96,
    headlineLg: vertical ? 92 : 124,
    sub: vertical ? 30 : 30,
    subMax: vertical ? 760 : 860,
    curveWidth: vertical ? width * 0.94 : Math.min(1180, width * 0.62),
    logo: vertical ? 88 : 104,
    ring: vertical ? 300 : 240,
  };
}
