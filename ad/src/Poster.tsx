import React from "react";
import { AbsoluteFill } from "remotion";
import { Background } from "./components/Background";
import { Particles } from "./components/Particles";
import { Logo } from "./components/Logo";
import { COLORS } from "./theme";
import { SERIF } from "./fonts";

const WORDS = "Every vibe has a curve.".split(" ");

/**
 * Poster / thumbnail still — just the logo (top, centered) above the hero line.
 * No kicker, no sub-copy. Rendered via `npm run still` at a settled frame so the
 * logo wave is fully drawn.
 */
export const Poster: React.FC = () => {
  return (
    <Background>
      <Particles opacity={0.5} />
      <AbsoluteFill style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 64, padding: 120 }}>
        <Logo size={128} delay={0} />
        <h1
          style={{
            fontFamily: SERIF,
            fontSize: 132,
            lineHeight: 1.04,
            letterSpacing: "-0.02em",
            color: COLORS.ink,
            margin: 0,
            textAlign: "center",
            maxWidth: 1640,
          }}
        >
          {WORDS.map((w, i) => {
            const isAccent = w.startsWith("curve");
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  marginRight: "0.26em",
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
      </AbsoluteFill>
    </Background>
  );
};
