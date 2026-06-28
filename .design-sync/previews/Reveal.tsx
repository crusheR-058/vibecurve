import { Reveal } from "vibecurve";

// Fade + slide into view on scroll. Preview shows the revealed end state.
export const Default = () => (
  <Reveal>
    <div className="rounded-card border border-hair bg-card p-6 shadow-soft">
      <div className="font-serif-display text-2xl text-ink">It arrives, gently.</div>
      <p className="mt-2 text-sm text-muted">
        Content fades and slides up as it enters the viewport — nothing ever pops.
      </p>
    </div>
  </Reveal>
);
