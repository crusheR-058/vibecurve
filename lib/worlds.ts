// The emotional worlds the journey flies through. Each carries a palette that the
// persistent 3D scene morphs toward as you scroll, plus the line that surfaces
// when you arrive. Order = the master scroll story (after the hero).

export interface World {
  id: string;
  name: string;
  line: string;
  /** three colors the curve + particles lerp toward in this world */
  colors: [string, string, string];
  /** headline accent for this world's section */
  accent: string;
}

export const WORLDS: World[] = [
  {
    id: "curious",
    name: "Curious",
    line: "What if someone out there felt today exactly like you?",
    colors: ["#7dd3fc", "#a5b4fc", "#e0f2fe"],
    accent: "#7dd3fc",
  },
  {
    id: "playful",
    name: "Playful",
    line: "Some days simply bounce.",
    colors: ["#f472b6", "#fb923c", "#22d3ee"],
    accent: "#fb923c",
  },
  {
    id: "laughter",
    name: "Laughter",
    line: "And some you just have to laugh your way through.",
    colors: ["#fbbf24", "#fb7185", "#a78bfa"],
    accent: "#fbbf24",
  },
  {
    id: "confident",
    name: "Confidence",
    line: "Some days, you quietly own.",
    colors: ["#38bdf8", "#60a5fa", "#312e81"],
    accent: "#38bdf8",
  },
  {
    id: "romance",
    name: "Romance",
    line: "Some ache, softly, in a good way.",
    colors: ["#fb7185", "#f472b6", "#fda4af"],
    accent: "#fb7185",
  },
  {
    id: "adventure",
    name: "Adventure",
    line: "Some days, you fly.",
    colors: ["#2dd4bf", "#38bdf8", "#a7f3d0"],
    accent: "#2dd4bf",
  },
  {
    id: "deep",
    name: "Deep Conversations",
    line: "Some nights, you finally say the real thing.",
    colors: ["#818cf8", "#a78bfa", "#6366f1"],
    accent: "#a78bfa",
  },
  {
    id: "connections",
    name: "Real Connections",
    line: "And you realize you were never the only one.",
    colors: ["#8b5cf6", "#ec4899", "#38bdf8"],
    accent: "#ec4899",
  },
];

/** Palette path the 3D scene interpolates along: brand (hero) → every world. */
export const PALETTES: [string, string, string][] = [
  ["#38bdf8", "#8b5cf6", "#fb7185"],
  ...WORLDS.map((w) => w.colors),
];
