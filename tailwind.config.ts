import type { Config } from "tailwindcss";

/**
 * VibeCurve design tokens — the "Apple of emotional wellbeing".
 * Colors are driven by CSS variables (channel triples) defined in globals.css,
 * so a single `.dark` class on <html> retones the entire app. The
 * `rgb(var(--x) / <alpha-value>)` form keeps Tailwind opacity modifiers working
 * (e.g. bg-accent-light/60). Shadows are variables too, so dark mode swaps
 * dark drop-shadows for accent glows.
 */
const withAlpha = (v: string) => `rgb(var(${v}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: withAlpha("--canvas"),
        card: withAlpha("--card"),
        ink: withAlpha("--ink"),
        muted: withAlpha("--muted"),
        accent: {
          DEFAULT: withAlpha("--accent"),
          light: withAlpha("--accent-light"),
        },
        peach: withAlpha("--peach"),
        hair: withAlpha("--hair"),
      },
      fontFamily: {
        serif: ["var(--font-instrument-serif)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        button: "16px",
        input: "16px",
        card: "24px",
        dialog: "24px",
        sheet: "28px",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        lift: "var(--shadow-lift)",
        glow: "var(--shadow-glow)",
      },
      keyframes: {
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "gradient-pan": "gradient-pan 12s ease infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
