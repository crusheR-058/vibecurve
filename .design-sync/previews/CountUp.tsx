import { CountUp } from "vibecurve";

// Counts the first number up from zero when scrolled into view, keeping any
// prefix/suffix. Short duration so the preview settles on the final value.
export const Ratio = () => (
  <div className="font-serif-display text-5xl text-ink">
    <CountUp value="1 in 6" duration={400} />
  </div>
);

export const Percent = () => (
  <div className="font-serif-display text-5xl text-accent">
    <CountUp value="92%" duration={400} />
  </div>
);
