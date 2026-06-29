import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { MoodCurve } from "../components/MoodCurve";
import { Kicker, Headline, Sub } from "../components/Type";
import { fadeUp, pop } from "../anim";
import { useLayout } from "../layout";
import { COLORS } from "../theme";
import { SANS } from "../fonts";

const YOU = [3.2, 6.4, 4.2, 7.6, 5.2];
const THEM = [3.6, 6.0, 4.6, 7.1, 4.9];
const EASE = Easing.bezier(0.22, 1, 0.36, 1);

const MiniCard: React.FC<{ values: number[]; id: string; label: string; emoji: string }> = ({ values, id, label, emoji }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [30, 92], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
  return (
    <div
      style={{
        borderRadius: 26,
        border: `1px solid ${COLORS.hair}`,
        background: "rgba(30,27,40,0.85)",
        boxShadow: "0 18px 60px rgba(0,0,0,0.5)",
        padding: 22,
        width: "100%",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6, paddingLeft: 6 }}>
        <span style={{ fontSize: 28 }}>{emoji}</span>
        <span style={{ fontFamily: SANS, fontSize: 22, color: COLORS.muted, letterSpacing: "0.02em" }}>{label}</span>
      </div>
      <MoodCurve values={values} progress={progress} id={id} showRail={false} showPhases={false} showPen={false} lineWidth={6} />
    </div>
  );
};

export const Match: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLayout();

  // a soft "matched" pulse after both curves are drawn
  const pulse = 0.5 + 0.5 * Math.sin((frame - 84) / 6);
  const emblem = pop(frame, fps, 84, { stiffness: 120, damping: 12 });
  const matched = frame > 84;

  const sig = ["L", "M", "H"];

  return (
    <Background>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: L.pad, gap: L.vertical ? 30 : 40 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={fadeUp(frame, 4, { dist: 14 })}>
            <Kicker style={{ fontSize: L.kicker }}>The match</Kicker>
          </div>
          <div style={fadeUp(frame, 12)}>
            <Headline size={L.headline}>Find people who felt it too.</Headline>
          </div>
        </div>

        {/* two cards + a match emblem between them */}
        <div
          style={{
            ...fadeUp(frame, 24, { dist: 26 }),
            display: "flex",
            flexDirection: L.vertical ? "column" : "row",
            alignItems: "center",
            justifyContent: "center",
            gap: L.vertical ? 26 : 40,
            width: "100%",
            maxWidth: L.vertical ? 760 : 1320,
          }}
        >
          <div style={{ flex: 1, width: "100%" }}>
            <MiniCard values={YOU} id="you" label="You" emoji="🫧" />
          </div>

          {/* emblem */}
          <div style={{ position: "relative", width: 96, height: 96, flexShrink: 0, ...emblem }}>
            {matched && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: `2px solid ${COLORS.accentBright}`,
                  opacity: (1 - pulse) * 0.6,
                  transform: `scale(${1 + pulse * 0.7})`,
                }}
              />
            )}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.peach})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 46,
                boxShadow: `0 0 36px ${COLORS.accent}88`,
              }}
            >
              <span style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }}>✶</span>
            </div>
          </div>

          <div style={{ flex: 1, width: "100%" }}>
            <MiniCard values={THEM} id="them" label="Someone, somewhere" emoji="🌙" />
          </div>
        </div>

        {/* signature chips + sub */}
        <div style={{ ...fadeUp(frame, 96), display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: SANS, fontSize: 20, color: COLORS.muted, letterSpacing: "0.16em", textTransform: "uppercase" }}>
              same signature
            </span>
            {sig.map((s, i) => (
              <span
                key={s}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: SANS,
                  fontWeight: 700,
                  fontSize: 22,
                  color: i === 2 ? "#0b0a12" : COLORS.ink,
                  background: i === 2 ? COLORS.peach : "rgba(255,255,255,0.05)",
                  border: `1px solid ${i === 2 ? COLORS.peach : COLORS.hair}`,
                }}
              >
                {s}
              </span>
            ))}
          </div>
          <Sub style={{ fontSize: L.sub, maxWidth: L.subMax }}>
            Your curve becomes a signature — the closest day lands in your room.
          </Sub>
        </div>
      </AbsoluteFill>
    </Background>
  );
};
