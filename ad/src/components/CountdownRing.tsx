import React from "react";
import { COLORS } from "../theme";
import { SANS, SERIF } from "../fonts";

/**
 * A circular countdown to midnight — a peach→violet arc draining around a clock
 * readout. `progress` 0→1 is how much of the ring is spent.
 */
export const CountdownRing: React.FC<{
  size?: number;
  progress: number;
  time: string;
  caption?: string;
}> = ({ size = 220, progress, time, caption = "burns at midnight" }) => {
  const stroke = size * 0.055;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const spent = Math.max(0, Math.min(1, progress));

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id="vc-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={COLORS.peach} />
            <stop offset="100%" stopColor={COLORS.accentBright} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={COLORS.hair} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#vc-ring)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * spent}
          style={{ filter: `drop-shadow(0 0 10px ${COLORS.accentBright}66)` }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: size * 0.03,
        }}
      >
        <span style={{ fontFamily: SERIF, fontSize: size * 0.26, color: COLORS.ink, letterSpacing: "-0.02em" }}>{time}</span>
        <span style={{ fontFamily: SANS, fontSize: size * 0.072, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.18em" }}>
          {caption}
        </span>
      </div>
    </div>
  );
};
