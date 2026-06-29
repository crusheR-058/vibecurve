import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { useLayout } from "../layout";
import { COLORS } from "../theme";
import { SANS, SERIF } from "../fonts";

// Embers that rise and fade through the whole burn — deterministic seeds.
const EMBERS = Array.from({ length: 60 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 9.13 + n * 41.7) * 23117.3) % 1 + 1) % 1;
  return { x: r(1), size: 2 + r(3) * 6, speed: 0.5 + r(4) * 1.3, delay: r(5) * 60, peach: r(6) > 0.5 };
});
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const Burn: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const L = useLayout();

  // clock flips 23:59 → 00:00 at frame 70 with a flash
  const flipped = frame >= 70;
  const flashS = spring({ frame: frame - 70, fps, config: { damping: 12, stiffness: 200 } });
  const clockScale = flipped ? interpolate(flashS, [0, 1], [1.18, 1]) : 1;
  const clockOpacity = interpolate(frame, [10, 28], [0, 1], clamp);
  const line2 = interpolate(frame, [110, 130, 210, 234], [0, 1, 1, 0], clamp);

  return (
    <Background>
      {/* rising embers */}
      <AbsoluteFill>
        {EMBERS.map((e, i) => {
          const t = Math.max(0, frame - e.delay);
          const rise = t * e.speed * 6;
          const op = interpolate(t, [0, 8, 120, 170], [0, 1, 0.7, 0], clamp) * interpolate(frame, [0, 16], [0, 1], clamp);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: e.x * width,
                top: height * 0.72 - rise,
                width: e.size,
                height: e.size,
                borderRadius: "50%",
                background: e.peach ? COLORS.peach : COLORS.accentBright,
                opacity: op,
                filter: "blur(0.6px)",
                boxShadow: `0 0 ${e.size * 4}px ${e.peach ? COLORS.peach : COLORS.accentBright}`,
              }}
            />
          );
        })}
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 18 }}>
        <div style={{ opacity: clockOpacity, transform: `scale(${clockScale})`, textAlign: "center" }}>
          <div style={{ fontFamily: SERIF, fontSize: L.vertical ? 150 : 184, color: COLORS.ink, letterSpacing: "-0.02em" }}>
            {flipped ? "00:00" : "23:59"}
          </div>
          <div style={{ fontFamily: SANS, fontSize: 26, color: COLORS.muted, letterSpacing: "0.24em", textTransform: "uppercase", marginTop: 8 }}>
            the room burns
          </div>
        </div>
        <div style={{ opacity: line2, fontFamily: SANS, fontSize: L.sub, color: COLORS.muted, textAlign: "center", maxWidth: L.subMax }}>
          Messages, curves, the whole room — gone by morning.
        </div>
      </AbsoluteFill>
    </Background>
  );
};
