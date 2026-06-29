import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";
import { SERIF } from "../fonts";

/**
 * The VibeCurve mark — a violet→peach gradient tile holding the emotional wave
 * that draws itself in, then the serif wordmark. Ported from components/ui/Logo.tsx.
 */
export const Logo: React.FC<{
  size?: number;
  showWordmark?: boolean;
  delay?: number;
}> = ({ size = 96, showWordmark = true, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;

  const draw = spring({ frame: f, fps, config: { damping: 200, mass: 1.1 }, durationInFrames: 42 });
  const dot = spring({ frame: f - 30, fps, config: { damping: 14, stiffness: 320, mass: 0.7 } });
  const word = interpolate(f, [26, 46], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const wordY = interpolate(word, [0, 1], [10, 0]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.32, userSelect: "none" }}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <defs>
          <linearGradient id="vc-logo-tile" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={COLORS.accent} />
            <stop offset="100%" stopColor={COLORS.peach} />
          </linearGradient>
          <linearGradient id="vc-logo-gloss" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="44" height="44" rx="14" fill="url(#vc-logo-tile)" />
        <rect x="2" y="2" width="44" height="44" rx="14" fill="url(#vc-logo-gloss)" />
        <path
          d="M9 30 C 15 17, 19 17, 24 24 S 33 35, 39 18"
          stroke="#ffffff"
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
          opacity={0.96}
        />
        <circle cx="39" cy="18" r="3.4" fill="#ffffff" style={{ transform: `scale(${dot})`, transformOrigin: "39px 18px" }} />
      </svg>
      {showWordmark && (
        <span
          style={{
            fontFamily: SERIF,
            fontSize: size * 0.66,
            letterSpacing: "-0.01em",
            color: COLORS.ink,
            opacity: word,
            transform: `translateY(${wordY}px)`,
          }}
        >
          VibeCurve
        </span>
      )}
    </div>
  );
};
