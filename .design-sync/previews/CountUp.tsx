import { CountUp } from "vibecurve";

// Counts the first number up from zero when it scrolls into view, keeping any
// prefix/suffix. The count is gated on IntersectionObserver, so center it in a
// tall frame (inline layout) so the observer fires in the static capture; a
// tiny duration lands it on the final value immediately.
const frame = {
  minHeight: 320,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "3.5rem",
} as const;

export const Ratio = () => (
  <div style={frame} className="font-serif-display text-ink">
    <CountUp value="1 in 6" duration={1} />
  </div>
);

export const Percent = () => (
  <div style={frame} className="font-serif-display text-accent">
    <CountUp value="92%" duration={1} />
  </div>
);
