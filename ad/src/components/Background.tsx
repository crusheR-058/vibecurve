import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../theme";

/**
 * The persistent VibeCurve canvas: deep warm-violet base with two slowly
 * breathing aura blooms (violet + peach), mirroring `.dark body` in globals.css.
 */
export const Background: React.FC<{ children?: React.ReactNode; tone?: "canvas" | "deep" }> = ({
  children,
  tone = "deep",
}) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 90) * 3;
  const base = tone === "deep" ? COLORS.bg : COLORS.canvas;

  return (
    <AbsoluteFill style={{ backgroundColor: base }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 50% at ${20 + drift}% 0%, rgba(139,92,246,0.18) 0%, transparent 60%),
                       radial-gradient(55% 50% at ${88 - drift}% 12%, rgba(253,186,116,0.10) 0%, transparent 55%),
                       radial-gradient(70% 60% at 50% 115%, rgba(167,139,250,0.10) 0%, transparent 60%)`,
        }}
      />
      {/* edge vignette for cinematic depth */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(72% 62% at 50% 48%, transparent 55%, rgba(5,4,10,0.55) 100%)",
        }}
      />
      {children}
    </AbsoluteFill>
  );
};
