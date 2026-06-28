import { Reveal } from "vibecurve";

// Fade + slide into view on scroll. The reveal is gated on IntersectionObserver,
// so center the content in a tall frame so it actually fires (and shows the
// revealed end state) in the static capture.
export const Default = () => (
  <div style={{ minHeight: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <Reveal>
      <div className="rounded-card border border-hair bg-card shadow-soft" style={{ padding: 24, maxWidth: 380 }}>
        <div className="font-serif-display text-ink" style={{ fontSize: "1.5rem" }}>
          It arrives, gently.
        </div>
        <p className="text-muted" style={{ marginTop: 8, fontSize: "0.875rem", lineHeight: 1.6 }}>
          Content fades and slides up as it enters the viewport — nothing ever pops.
        </p>
      </div>
    </Reveal>
  </div>
);
