import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

// Deterministic dust — slow drifting embers behind the content. Fixed seeds so
// every render is identical (Remotion renders frames out of order in parallel).
const SEEDS = Array.from({ length: 26 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
  return {
    x: r(1),
    y: r(2),
    size: 1.5 + r(3) * 3.5,
    speed: 0.15 + r(4) * 0.4,
    phase: r(5) * Math.PI * 2,
    peach: r(6) > 0.66,
    twinkle: 0.2 + r(7) * 0.5,
  };
});

export const Particles: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ opacity }}>
      {SEEDS.map((p, i) => {
        const y = (p.y - ((frame * p.speed) / height) * 0.6) % 1;
        const wrapped = y < 0 ? y + 1 : y;
        const sway = Math.sin(frame / 40 + p.phase) * 14;
        const tw = 0.35 + Math.abs(Math.sin(frame / 50 + p.phase)) * p.twinkle;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.x * width + sway,
              top: wrapped * height,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: p.peach ? COLORS.peach : COLORS.accentBright,
              opacity: tw,
              filter: "blur(0.5px)",
              boxShadow: `0 0 ${p.size * 3}px ${p.peach ? COLORS.peach : COLORS.accentBright}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
