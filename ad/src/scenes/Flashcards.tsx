import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { Kicker, Headline } from "../components/Type";
import { fadeUp, pop } from "../anim";
import { useLayout } from "../layout";
import { COLORS } from "../theme";
import { SANS } from "../fonts";

// Authentic domains + a real branch from lib/domains.ts (gaming › rpg › open_world › elden_ring).
const DOMAINS = [
  { emoji: "🎮", label: "Gaming" },
  { emoji: "🎧", label: "Music" },
  { emoji: "✈️", label: "Travel" },
  { emoji: "🍜", label: "Cuisine" },
  { emoji: "🎬", label: "Entertainment" },
  { emoji: "🔭", label: "Science" },
];
const PICKED: Record<number, number> = { 0: 78, 1: 112, 3: 146 }; // index → frame it gets selected
const BRANCH = [
  { emoji: "🎮", label: "Gaming" },
  { emoji: "🗡️", label: "RPG" },
  { emoji: "🗺️", label: "Open world" },
  { emoji: "💍", label: "Elden Ring" },
];
const BRANCH_AT = [214, 252, 290, 328];

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Tile: React.FC<{ emoji: string; label: string; appear: number; selectAt?: number; w: number }> = ({
  emoji,
  label,
  appear,
  selectAt,
  w,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, appear);
  const sel = selectAt !== undefined ? interpolate(frame, [selectAt, selectAt + 10], [0, 1], clamp) : 0;
  const check = selectAt !== undefined ? pop(frame, fps, selectAt) : null;
  return (
    <div
      style={{
        ...p,
        position: "relative",
        width: w,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        padding: "22px 14px",
        borderRadius: 22,
        background: COLORS.card,
        border: `1px solid ${sel > 0 ? COLORS.accent : COLORS.hair}`,
        boxShadow: sel > 0 ? `0 0 0 1px ${COLORS.accent}, 0 14px 40px ${COLORS.accent}40` : "0 8px 24px rgba(0,0,0,0.4)",
      }}
    >
      <span style={{ fontSize: 46 }}>{emoji}</span>
      <span style={{ fontFamily: SANS, fontSize: 20, fontWeight: 500, color: COLORS.ink }}>{label}</span>
      {check && sel > 0 && (
        <div
          style={{
            ...check,
            position: "absolute",
            top: -10,
            right: -10,
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: COLORS.accent,
            color: "#fff",
            fontSize: 17,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✓
        </div>
      )}
    </div>
  );
};

export const Flashcards: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLayout();

  const gridOpacity = interpolate(frame, [196, 216], [1, 0], clamp);
  const branchOpacity = interpolate(frame, [206, 228], [0, 1], clamp);
  const cols = L.vertical ? 2 : 3;
  const cardW = L.vertical ? (L.width - 2 * L.pad - 18) / 2 : 220;
  const helperA = interpolate(frame, [50, 70, 188, 204], [0, 1, 1, 0], clamp);
  const helperB = interpolate(frame, [228, 248], [0, 1], clamp);

  return (
    <Background tone="canvas">
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: L.pad, gap: 22 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={fadeUp(frame, 4, { dist: 14 })}>
            <Kicker style={{ fontSize: L.kicker }}>Your profile · your way</Kicker>
          </div>
          <div style={fadeUp(frame, 12)}>
            <Headline size={L.headline}>Branch into who you are.</Headline>
          </div>
        </div>

        {/* identity chip (the "define yourself in 1–2 words" step) */}
        <div
          style={{
            ...fadeUp(frame, 20),
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 20px",
            borderRadius: 999,
            border: `1px solid ${COLORS.hair}`,
            background: "rgba(255,255,255,0.04)",
            fontFamily: SANS,
            fontSize: 22,
            color: COLORS.ink,
          }}
        >
          <span style={{ fontSize: 24 }}>✨</span> chaotic dreamer
        </div>

        {/* stage: domain grid → branch cascade */}
        <div style={{ position: "relative", width: "100%", maxWidth: L.vertical ? undefined : 1320, minHeight: L.vertical ? 470 : 360, marginTop: 8 }}>
          {/* GRID */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: gridOpacity,
              display: "grid",
              gridTemplateColumns: `repeat(${cols}, ${cardW}px)`,
              gap: 18,
              justifyContent: "center",
              alignContent: "center",
              justifyItems: "center",
            }}
          >
            {DOMAINS.map((d, i) => (
              <Tile key={d.label} emoji={d.emoji} label={d.label} appear={40 + i * 8} selectAt={PICKED[i]} w={cardW} />
            ))}
          </div>

          {/* BRANCH cascade */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: branchOpacity,
              display: "flex",
              flexDirection: L.vertical ? "column" : "row",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "nowrap",
              gap: 14,
            }}
          >
            {BRANCH.map((b, i) => (
              <React.Fragment key={b.label}>
                {i > 0 && (
                  <span style={{ ...pop(frame, fps, BRANCH_AT[i] - 6), fontSize: 30, color: COLORS.muted }}>
                    {L.vertical ? "↓" : "›"}
                  </span>
                )}
                <div
                  style={{
                    ...pop(frame, fps, BRANCH_AT[i]),
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "16px 26px",
                    borderRadius: 18,
                    background: i === BRANCH.length - 1 ? `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentSoft})` : COLORS.card,
                    border: `1px solid ${i === BRANCH.length - 1 ? "transparent" : COLORS.hair}`,
                    boxShadow: i === BRANCH.length - 1 ? `0 14px 44px ${COLORS.accent}55` : "0 8px 24px rgba(0,0,0,0.4)",
                  }}
                >
                  <span style={{ fontSize: 34 }}>{b.emoji}</span>
                  <span style={{ fontFamily: SANS, fontSize: 24, fontWeight: 600, color: COLORS.ink }}>{b.label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* helper line swaps with the phase */}
        <div style={{ position: "relative", height: 44, width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ position: "absolute", opacity: helperA, fontFamily: SANS, fontSize: L.sub, color: COLORS.muted }}>
            Pick 3 things you love.
          </span>
          <span style={{ position: "absolute", opacity: helperB, fontFamily: SANS, fontSize: L.sub, color: COLORS.muted, textAlign: "center" }}>
            The deeper you branch, the closer the match.
          </span>
        </div>
      </AbsoluteFill>
    </Background>
  );
};
