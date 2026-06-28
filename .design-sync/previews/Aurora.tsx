import { Aurora } from "vibecurve";

// Ambient breathing gradient — the warm "weather" behind immersive screens.
// It's absolutely positioned (inset-0), so frame it in a sized, relative box.
export const Default = () => (
  <div
    className="rounded-card border border-hair bg-canvas"
    style={{ position: "relative", height: 260, width: "100%", overflow: "hidden" }}
  >
    <Aurora />
    <div
      style={{
        position: "relative",
        zIndex: 10,
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="font-serif-display text-ink" style={{ fontSize: "1.875rem" }}>
        A calm weather
      </div>
    </div>
  </div>
);
