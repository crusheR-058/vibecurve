/**
 * VibeCurve brand tokens — lifted straight from the app's design system
 * (tailwind.config.ts + app/globals.css, dark theme is the product default).
 */
export const COLORS = {
  // Immersive landing uses a near-black violet; the app canvas is a touch lighter.
  bg: "#07060c",
  canvas: "#14121C",
  card: "#1E1B28",
  ink: "#F4F1F9",
  muted: "#9C95AC",
  hair: "#2A2536",

  accent: "#8B5CF6", // brand violet
  accentBright: "#A78BFA", // dark-mode violet
  accentSoft: "#4A3F73",
  lilac: "#C4B5FD",
  peach: "#FDBA74",
} as const;

// The mood-graded curve: bright/high = green → heavy/low = soft red.
// Same five stops the product uses for the "draw your day" line.
export const MOOD_STOPS = [
  { offset: "0%", color: "#34d399" },
  { offset: "34%", color: "#a3e635" },
  { offset: "60%", color: "#fbbf24" },
  { offset: "82%", color: "#fb923c" },
  { offset: "100%", color: "#f87171" },
] as const;

// The final-CTA gradient from the immersive landing (sky → violet → rose).
export const CTA_GRADIENT = ["#38bdf8", "#8b5cf6", "#fb7185"] as const;

export const FONT = {
  serif: "var(--vc-serif)",
  sans: "var(--vc-sans)",
};
