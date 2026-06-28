import { Aurora } from "vibecurve";

// Ambient breathing gradient — the warm "weather" behind immersive screens.
// It's absolutely positioned, so preview it inside a sized, relative frame.
export const Default = () => (
  <div className="relative h-64 w-full overflow-hidden rounded-card border border-hair bg-canvas">
    <Aurora />
    <div className="relative z-10 flex h-full items-center justify-center">
      <div className="font-serif-display text-3xl text-ink">A calm weather</div>
    </div>
  </div>
);
