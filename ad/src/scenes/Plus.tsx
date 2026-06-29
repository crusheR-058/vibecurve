import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { Kicker, Sub } from "../components/Type";
import { fadeUp, pop } from "../anim";
import { useLayout } from "../layout";
import { COLORS, CTA_GRADIENT } from "../theme";
import { SANS, SERIF } from "../fonts";

// VibeCurve+ perks + ember packs, from lib/economyData.ts (PLUS, EMBER_TIERS, AURAS).
const PERKS = ["120 embers every month", "Every aura — including animated", "Keep unlimited echoes", "A quiet patron mark by your emoji"];
const PACKS = [
  { embers: 20, price: "$1.99" },
  { embers: 60, price: "$4.99", best: true },
  { embers: 160, price: "$9.99" },
];
const AURAS = ["#fdba74", "#a78bfa", "#86efac", "#fda4af", "#c4b5fd"];
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const Plus: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLayout();

  return (
    <Background tone="canvas">
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: L.pad, gap: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, ...fadeUp(frame, 6, { dist: 14 }) }}>
          <Kicker style={{ fontSize: L.kicker }}>Go further</Kicker>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", justifyContent: "center", ...fadeUp(frame, 12) }}>
          <span style={{ fontFamily: SERIF, fontSize: L.headline, color: COLORS.ink, letterSpacing: "-0.015em" }}>VibeCurve+</span>
          <span
            style={{
              fontFamily: SANS,
              fontSize: 24,
              fontWeight: 600,
              color: COLORS.ink,
              padding: "6px 16px",
              borderRadius: 999,
              border: `1px solid ${COLORS.accent}`,
              background: `${COLORS.accent}1c`,
            }}
          >
            $4.99/mo
          </span>
        </div>

        {/* perks card */}
        <div
          style={{
            ...fadeUp(frame, 26, { dist: 26 }),
            width: "100%",
            maxWidth: L.vertical ? 680 : 720,
            borderRadius: 28,
            border: `1px solid ${COLORS.hair}`,
            background: "rgba(30,27,40,0.9)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
            padding: L.vertical ? 30 : 38,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {PERKS.map((p, i) => (
            <div key={p} style={{ ...fadeUp(frame, 54 + i * 12, { dist: 12 }), display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ color: COLORS.peach, fontSize: 24 }}>✦</span>
              <span style={{ fontFamily: SANS, fontSize: 26, color: COLORS.ink }}>{p}</span>
              {i === 1 && (
                <span style={{ display: "inline-flex", gap: 8, marginLeft: 6 }}>
                  {AURAS.map((c, k) => (
                    <span
                      key={c}
                      style={{
                        ...pop(frame, fps, 96 + k * 7),
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        border: `3px solid ${c}`,
                        boxShadow: `0 0 10px ${c}aa`,
                      }}
                    />
                  ))}
                </span>
              )}
            </div>
          ))}

          <div
            style={{
              ...pop(frame, fps, 150),
              alignSelf: "flex-start",
              marginTop: 8,
              padding: "16px 34px",
              borderRadius: 999,
              background: `linear-gradient(to right, ${CTA_GRADIENT[0]}, ${CTA_GRADIENT[1]}, ${CTA_GRADIENT[2]})`,
              fontFamily: SANS,
              fontWeight: 600,
              fontSize: 24,
              color: "#fff",
              boxShadow: `0 12px 40px ${COLORS.accent}66`,
            }}
          >
            Become a patron 🤍
          </div>
        </div>

        {/* ember packs */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", ...fadeUp(frame, 178) }}>
          {PACKS.map((p, i) => (
            <div
              key={p.embers}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 22px",
                borderRadius: 16,
                background: COLORS.card,
                border: `1px solid ${p.best ? COLORS.accent : COLORS.hair}`,
              }}
            >
              {p.best && (
                <span
                  style={{
                    position: "absolute",
                    top: -11,
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: 12,
                    fontFamily: SANS,
                    fontWeight: 600,
                    color: "#fff",
                    background: COLORS.accent,
                    borderRadius: 999,
                    padding: "2px 10px",
                  }}
                >
                  warmest
                </span>
              )}
              <span style={{ color: COLORS.peach, fontSize: 20 }}>✦</span>
              <span style={{ fontFamily: SERIF, fontSize: 24, color: COLORS.ink }}>{p.embers}</span>
              <span style={{ fontFamily: SANS, fontSize: 20, color: COLORS.muted }}>· {p.price}</span>
            </div>
          ))}
        </div>

        <div style={fadeUp(frame, 220)}>
          <Sub style={{ fontSize: L.sub, maxWidth: L.subMax }}>
            And part of every ember lights a free path for someone who can&rsquo;t pay — so no one is priced out.
          </Sub>
        </div>
      </AbsoluteFill>
    </Background>
  );
};
