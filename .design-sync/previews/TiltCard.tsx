import { TiltCard } from "vibecurve";

// A card that tilts toward the cursor; preview shows realistic content inside.
export const Default = () => (
  <TiltCard className="max-w-sm">
    <div className="text-xs uppercase tracking-[0.14em] text-muted">Today&rsquo;s vibe</div>
    <div className="mt-2 font-serif-display text-2xl text-ink">A gentle climb</div>
    <p className="mt-3 text-sm leading-relaxed text-muted">
      Your curve rose through the afternoon and settled soft by evening. Three
      people felt the same shape today.
    </p>
  </TiltCard>
);
