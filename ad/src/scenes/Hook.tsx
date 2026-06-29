import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { Particles } from "../components/Particles";
import { Kicker, Sub } from "../components/Type";
import { fadeUp, OUT_CUBIC } from "../anim";
import { useLayout } from "../layout";
import { SERIF } from "../fonts";
import { COLORS } from "../theme";

const WORDS = "Every vibe has a curve.".split(" ");

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const L = useLayout();

  return (
    <Background>
      <Particles opacity={0.4} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: L.pad, gap: 40 }}>
        <div style={fadeUp(frame, 6, { dist: 16 })}>
          <Kicker style={{ fontSize: L.kicker }}>The anti-flex network</Kicker>
        </div>

        <h1
          style={{
            fontFamily: SERIF,
            fontSize: L.headlineLg,
            lineHeight: 1.03,
            letterSpacing: "-0.02em",
            color: COLORS.ink,
            margin: 0,
            textAlign: "center",
            maxWidth: L.vertical ? 900 : 1500,
          }}
        >
          {WORDS.map((w, i) => {
            const d = 22 + i * 7;
            const opacity = interpolate(frame, [d, d + 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const y = interpolate(frame, [d, d + 18], [60, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: OUT_CUBIC });
            const blur = interpolate(frame, [d, d + 18], [12, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const isAccent = w.startsWith("curve");
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  marginRight: "0.26em",
                  opacity,
                  transform: `translateY(${y}px)`,
                  filter: `blur(${blur}px)`,
                  color: isAccent ? "transparent" : COLORS.ink,
                  background: isAccent ? `linear-gradient(110deg, ${COLORS.accentBright}, ${COLORS.lilac}, ${COLORS.peach})` : undefined,
                  WebkitBackgroundClip: isAccent ? "text" : undefined,
                  backgroundClip: isAccent ? "text" : undefined,
                }}
              >
                {w}
              </span>
            );
          })}
        </h1>

        <div style={fadeUp(frame, 70)}>
          <Sub style={{ fontSize: L.sub, maxWidth: L.subMax }}>
            Presence over permanence. Connection over content. Honesty over perfection.
          </Sub>
        </div>
      </AbsoluteFill>
    </Background>
  );
};
