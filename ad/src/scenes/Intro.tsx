import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { Particles } from "../components/Particles";
import { Logo } from "../components/Logo";
import { Badge } from "../components/Type";
import { fadeUp } from "../anim";
import { useLayout } from "../layout";
import { COLORS } from "../theme";
import { SANS } from "../fonts";

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const L = useLayout();

  return (
    <Background>
      <Particles opacity={0.6} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 40 }}>
        <Logo size={L.vertical ? 120 : 150} delay={6} />

        <div style={{ ...fadeUp(frame, 52), marginTop: 8 }}>
          <Badge>
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                background: COLORS.peach,
                boxShadow: `0 0 10px ${COLORS.peach}`,
                display: "inline-block",
              }}
            />
            The anti-flex network · gone by midnight
          </Badge>
        </div>

        <div
          style={{
            ...fadeUp(frame, 66),
            fontFamily: SANS,
            fontSize: L.vertical ? 26 : 28,
            color: COLORS.muted,
            letterSpacing: "0.01em",
          }}
        >
          Your day has a shape.
        </div>
      </AbsoluteFill>
    </Background>
  );
};
