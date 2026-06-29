import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { MoodCurve } from "../components/MoodCurve";
import { Kicker, Headline, Sub } from "../components/Type";
import { fadeUp } from "../anim";
import { useLayout } from "../layout";
import { COLORS } from "../theme";

const VALUES = [3.2, 6.4, 4.2, 7.6, 5.2];
const EASE = Easing.bezier(0.22, 1, 0.36, 1);

export const DrawDay: React.FC = () => {
  const frame = useCurrentFrame();
  const L = useLayout();

  const progress = interpolate(frame, [28, 132], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });

  return (
    <Background tone="canvas">
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: L.pad, gap: L.vertical ? 30 : 34 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={fadeUp(frame, 4, { dist: 14 })}>
            <Kicker style={{ fontSize: L.kicker }}>Your day · in one line</Kicker>
          </div>
          <div style={fadeUp(frame, 12)}>
            <Headline size={L.headline}>Draw your day.</Headline>
          </div>
        </div>

        {/* the canvas card */}
        <div style={{ ...fadeUp(frame, 22, { dist: 30 }), position: "relative", width: L.curveWidth }}>
          <div
            style={{
              position: "absolute",
              inset: -40,
              zIndex: -1,
              filter: "blur(60px)",
              opacity: 0.7,
              background:
                "radial-gradient(45% 60% at 30% 25%, rgba(139,92,246,0.30), transparent 70%), radial-gradient(40% 55% at 78% 80%, rgba(253,186,116,0.22), transparent 70%)",
            }}
          />
          <div
            style={{
              borderRadius: 32,
              border: `1px solid ${COLORS.hair}`,
              background: "rgba(30,27,40,0.88)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.55)",
              padding: L.vertical ? 22 : 30,
            }}
          >
            <MoodCurve values={VALUES} progress={progress} id="draw" />
          </div>
        </div>

        <div style={fadeUp(frame, 40)}>
          <Sub style={{ fontSize: L.sub, maxWidth: L.subMax }}>
            One continuous line from morning to night — however today actually felt.
          </Sub>
        </div>
      </AbsoluteFill>
    </Background>
  );
};
