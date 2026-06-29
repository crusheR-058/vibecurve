import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { Logo } from "../components/Logo";
import { Headline, Sub } from "../components/Type";
import { fadeUp, pop } from "../anim";
import { useLayout } from "../layout";
import { COLORS, CTA_GRADIENT } from "../theme";
import { SANS, SERIF } from "../fonts";

// Embers that rise and fade during the burn — deterministic seeds.
const EMBERS = Array.from({ length: 34 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 9.13 + n * 41.7) * 23117.3) % 1 + 1) % 1;
  return { x: r(1), spread: (r(2) - 0.5) * 1.4, size: 2 + r(3) * 5, speed: 0.6 + r(4) * 1.1, delay: r(5) * 14, peach: r(6) > 0.5 };
});

const Embers: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ opacity }}>
      {EMBERS.map((e, i) => {
        const t = Math.max(0, frame - 8 - e.delay);
        const rise = t * e.speed * 6;
        const op = interpolate(t, [0, 6, 40, 60], [0, 1, 0.7, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: width * (0.5 + e.spread * 0.4) + e.x * 40 - 20,
              top: height * 0.56 - rise,
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
  );
};

export const Burn: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLayout();

  const burnOpacity = interpolate(frame, [44, 62], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const midnightOpacity = interpolate(frame, [8, 22, 44, 58], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ctaButton = pop(frame, fps, 96, { stiffness: 120, damping: 14 });

  return (
    <Background>
      {/* ── burn moment ── */}
      <Embers opacity={burnOpacity} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: midnightOpacity }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: SERIF, fontSize: L.vertical ? 120 : 150, color: COLORS.ink, letterSpacing: "-0.02em" }}>00:00</div>
          <div style={{ fontFamily: SANS, fontSize: 24, color: COLORS.muted, letterSpacing: "0.22em", textTransform: "uppercase", marginTop: 6 }}>
            the room burns
          </div>
        </div>
      </AbsoluteFill>

      {/* ── closing CTA ── */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: L.pad, gap: L.vertical ? 30 : 34 }}>
        <div style={fadeUp(frame, 66, { dist: 18 })}>
          <Logo size={L.logo} delay={64} />
        </div>

        <div style={fadeUp(frame, 74)}>
          <Headline size={L.headlineLg}>How did today feel?</Headline>
        </div>

        <div style={fadeUp(frame, 86)}>
          <Sub style={{ fontSize: L.sub, maxWidth: L.subMax }}>
            Draw it. Somewhere out there, someone had a day shaped just like yours.
          </Sub>
        </div>

        <div style={{ ...ctaButton, display: "flex", flexDirection: L.vertical ? "column" : "row", alignItems: "center", gap: 22, marginTop: 8 }}>
          <div
            style={{
              padding: "20px 42px",
              borderRadius: 999,
              background: `linear-gradient(to right, ${CTA_GRADIENT[0]}, ${CTA_GRADIENT[1]}, ${CTA_GRADIENT[2]})`,
              fontFamily: SANS,
              fontWeight: 600,
              fontSize: 28,
              color: "#fff",
              boxShadow: `0 12px 40px ${COLORS.accent}66`,
            }}
          >
            Begin the journey →
          </div>
          <div
            style={{
              padding: "18px 30px",
              borderRadius: 999,
              border: `1px solid ${COLORS.hair}`,
              background: "rgba(255,255,255,0.04)",
              fontFamily: SANS,
              fontSize: 26,
              color: COLORS.ink,
              letterSpacing: "0.01em",
            }}
          >
            vibecurve.vercel.app
          </div>
        </div>

        <div
          style={{
            ...fadeUp(frame, 110),
            fontFamily: SANS,
            fontSize: 22,
            color: COLORS.muted,
            letterSpacing: "0.04em",
            marginTop: 6,
          }}
        >
          The profile stays. The day doesn&rsquo;t.
        </div>
      </AbsoluteFill>
    </Background>
  );
};
