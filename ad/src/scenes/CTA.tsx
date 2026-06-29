import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { Particles } from "../components/Particles";
import { Logo } from "../components/Logo";
import { Headline, Sub } from "../components/Type";
import { fadeUp, pop } from "../anim";
import { useLayout } from "../layout";
import { COLORS, CTA_GRADIENT } from "../theme";
import { SANS } from "../fonts";

export const CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLayout();
  const button = pop(frame, fps, 64, { stiffness: 120, damping: 14 });

  return (
    <Background>
      <Particles opacity={0.5} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: L.pad, gap: L.vertical ? 30 : 34 }}>
        <div style={fadeUp(frame, 8, { dist: 18 })}>
          <Logo size={L.logo} delay={8} />
        </div>

        <div style={fadeUp(frame, 28)}>
          <Headline size={L.headlineLg}>How did today feel?</Headline>
        </div>

        <div style={fadeUp(frame, 44)}>
          <Sub style={{ fontSize: L.sub, maxWidth: L.subMax }}>
            Draw it. Somewhere out there, someone had a day shaped just like yours.
          </Sub>
        </div>

        <div style={{ ...button, display: "flex", flexDirection: L.vertical ? "column" : "row", alignItems: "center", gap: 22, marginTop: 8 }}>
          <div
            style={{
              padding: "20px 44px",
              borderRadius: 999,
              background: `linear-gradient(to right, ${CTA_GRADIENT[0]}, ${CTA_GRADIENT[1]}, ${CTA_GRADIENT[2]})`,
              fontFamily: SANS,
              fontWeight: 600,
              fontSize: 30,
              color: "#fff",
              boxShadow: `0 12px 40px ${COLORS.accent}66`,
            }}
          >
            Begin the journey →
          </div>
          <div
            style={{
              padding: "18px 32px",
              borderRadius: 999,
              border: `1px solid ${COLORS.hair}`,
              background: "rgba(255,255,255,0.04)",
              fontFamily: SANS,
              fontSize: 27,
              color: COLORS.ink,
            }}
          >
            vibecurve.vercel.app
          </div>
        </div>

        <div
          style={{
            ...fadeUp(frame, 92),
            fontFamily: SANS,
            fontSize: 23,
            color: COLORS.muted,
            letterSpacing: "0.04em",
            marginTop: 8,
          }}
        >
          The profile stays. The day doesn&rsquo;t.
        </div>
      </AbsoluteFill>
    </Background>
  );
};
