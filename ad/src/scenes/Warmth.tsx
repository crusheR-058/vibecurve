import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { Kicker, Headline, Sub } from "../components/Type";
import { fadeUp, pop } from "../anim";
import { useLayout } from "../layout";
import { COLORS } from "../theme";
import { SANS } from "../fonts";

// The three warmth tiers, straight from lib/economyData.ts.
const GIFTS = [
  { glyph: "✨", name: "Glow", cost: 1, blurb: "a soft halo", color: COLORS.lilac },
  { glyph: "🕯️", name: "Candle", cost: 3, blurb: "a warm light", color: COLORS.peach },
  { glyph: "🔥", name: "Aurora", cost: 8, blurb: "the whole room feels it", color: "#fb7185" },
];
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const RISERS = ["✨", "🕯️", "🔥"];

const EmberChip: React.FC<{ frame: number; delay: number }> = ({ frame, delay }) => (
  <div
    style={{
      ...fadeUp(frame, delay),
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      padding: "9px 18px",
      borderRadius: 999,
      border: `1px solid ${COLORS.peach}55`,
      background: `${COLORS.peach}14`,
      fontFamily: SANS,
      fontSize: 22,
      color: COLORS.ink,
    }}
  >
    <span style={{ color: COLORS.peach, fontSize: 22 }}>✦</span> 15 embers
  </div>
);

export const Warmth: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLayout();

  const halo = interpolate(frame, [150, 200], [0, 1], clamp) * (0.85 + 0.15 * Math.sin(frame / 8));

  return (
    <Background>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: L.pad, gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={fadeUp(frame, 4, { dist: 14 })}>
            <Kicker style={{ fontSize: L.kicker }}>The warmth economy</Kicker>
          </div>
          <div style={fadeUp(frame, 12)}>
            <Headline size={L.headline}>Give warmth, not clout.</Headline>
          </div>
          <EmberChip frame={frame} delay={22} />
        </div>

        {/* three gift tiers */}
        <div
          style={{
            display: "flex",
            flexDirection: L.vertical ? "column" : "row",
            alignItems: "stretch",
            justifyContent: "center",
            gap: 18,
            width: "100%",
            maxWidth: L.vertical ? 620 : 1100,
            marginTop: 6,
          }}
        >
          {GIFTS.map((g, i) => (
            <div
              key={g.name}
              style={{
                ...pop(frame, fps, 56 + i * 16),
                flex: 1,
                display: "flex",
                flexDirection: L.vertical ? "row" : "column",
                alignItems: "center",
                gap: 12,
                padding: "26px 20px",
                borderRadius: 24,
                background: COLORS.card,
                border: `1px solid ${COLORS.hair}`,
                boxShadow: "0 14px 44px rgba(0,0,0,0.45)",
              }}
            >
              <span style={{ fontSize: 50, filter: `drop-shadow(0 0 16px ${g.color}aa)` }}>{g.glyph}</span>
              <div style={{ display: "flex", flexDirection: "column", alignItems: L.vertical ? "flex-start" : "center", gap: 6 }}>
                <span style={{ fontFamily: SANS, fontSize: 26, fontWeight: 600, color: COLORS.ink }}>{g.name}</span>
                <span
                  style={{
                    fontFamily: SANS,
                    fontSize: 18,
                    fontWeight: 600,
                    color: COLORS.peach,
                    border: `1px solid ${COLORS.peach}44`,
                    borderRadius: 999,
                    padding: "3px 12px",
                  }}
                >
                  {g.cost} ✦
                </span>
                <span style={{ fontFamily: SANS, fontSize: 17, color: COLORS.muted }}>{g.blurb}</span>
              </div>
            </div>
          ))}
        </div>

        {/* a message receiving warmth (clearly separated from the tiers) */}
        <div style={{ position: "relative", marginTop: L.vertical ? 40 : 60, ...fadeUp(frame, 120, { dist: 18 }) }}>
          {/* warm halo */}
          <div
            style={{
              position: "absolute",
              inset: -30,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${COLORS.peach}55, transparent 70%)`,
              opacity: halo,
              filter: "blur(12px)",
            }}
          />
          {/* rising glyphs — stay in the gap above the bubble */}
          {RISERS.map((g, i) => {
            const t = frame - (160 + i * 12);
            const op = interpolate(t, [0, 10, 40, 56], [0, 1, 1, 0], clamp);
            const rise = interpolate(t, [0, 56], [0, -56], clamp);
            return (
              <span
                key={i}
                style={{ position: "absolute", left: `calc(50% + ${(i - 1) * 44}px)`, top: -8, marginLeft: -13, fontSize: 26, opacity: op, transform: `translateY(${rise}px)` }}
              >
                {g}
              </span>
            );
          })}
          <div
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              gap: 14,
              padding: "16px 26px",
              borderRadius: 22,
              background: "rgba(255,255,255,0.06)",
              border: `1px solid ${COLORS.hair}`,
            }}
          >
            <span style={{ width: 16, height: 16, borderRadius: "50%", background: "#38bdf8", boxShadow: "0 0 10px #38bdf8" }} />
            <span style={{ fontSize: 34 }}>🌧️😮‍💨</span>
          </div>
        </div>

        <div style={fadeUp(frame, 210)}>
          <Sub style={{ fontSize: L.sub, maxWidth: L.subMax }}>
            Spend it on someone else&rsquo;s words — never to stand out. 15 to start, +3 every day.
          </Sub>
        </div>
      </AbsoluteFill>
    </Background>
  );
};
