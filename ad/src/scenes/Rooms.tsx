import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { CountdownRing } from "../components/CountdownRing";
import { Kicker, Headline, Sub } from "../components/Type";
import { fadeUp, pop } from "../anim";
import { useLayout } from "../layout";
import { COLORS } from "../theme";
import { SANS } from "../fonts";

type Msg = { emoji: string; from: "a" | "b" | "c" | "d"; delay: number };
const COLORMAP: Record<Msg["from"], string> = {
  a: COLORS.accentBright,
  b: COLORS.peach,
  c: "#38bdf8",
  d: "#34d399",
};
const MESSAGES: Msg[] = [
  { emoji: "🌧️", from: "a", delay: 40 },
  { emoji: "😮‍💨🫂", from: "b", delay: 56 },
  { emoji: "🌙✨", from: "c", delay: 74 },
  { emoji: "🫶", from: "d", delay: 92 },
  { emoji: "🕯️🤍", from: "a", delay: 108 },
];

const Bubble: React.FC<{ msg: Msg; fps: number }> = ({ msg, fps }) => {
  const frame = useCurrentFrame();
  const mine = msg.from === "b";
  const p = pop(frame, fps, msg.delay, { stiffness: 200, damping: 16 });
  const color = COLORMAP[msg.from];
  return (
    <div
      style={{
        ...p,
        display: "flex",
        flexDirection: mine ? "row-reverse" : "row",
        alignItems: "center",
        gap: 14,
        alignSelf: mine ? "flex-end" : "flex-start",
      }}
    >
      <span style={{ width: 18, height: 18, borderRadius: "50%", background: color, boxShadow: `0 0 12px ${color}99`, flexShrink: 0 }} />
      <div
        style={{
          padding: "16px 24px",
          borderRadius: 22,
          background: mine ? `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentSoft})` : "rgba(255,255,255,0.06)",
          border: `1px solid ${mine ? "transparent" : COLORS.hair}`,
          fontSize: 40,
          lineHeight: 1,
        }}
      >
        {msg.emoji}
      </div>
    </div>
  );
};

export const Rooms: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLayout();

  const remaining = Math.round(interpolate(frame, [0, 150], [179, 168], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const spent = interpolate(frame, [0, 150], [0.74, 0.82]);

  return (
    <Background tone="canvas">
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: L.pad, gap: L.vertical ? 30 : 38 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={fadeUp(frame, 4, { dist: 14 })}>
            <Kicker style={{ fontSize: L.kicker }}>Parallel rooms</Kicker>
          </div>
          <div style={fadeUp(frame, 12)}>
            <Headline size={L.headline}>Small anonymous rooms.</Headline>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: L.vertical ? "column" : "row",
            alignItems: "center",
            justifyContent: "center",
            gap: L.vertical ? 28 : 56,
            width: "100%",
            maxWidth: L.vertical ? 780 : 1280,
          }}
        >
          {/* chat card */}
          <div
            style={{
              ...fadeUp(frame, 24, { dist: 28 }),
              flex: L.vertical ? "unset" : 1,
              width: L.vertical ? "100%" : undefined,
              borderRadius: 30,
              border: `1px solid ${COLORS.hair}`,
              background: "rgba(20,18,28,0.9)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.55)",
              padding: 30,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS.peach, boxShadow: `0 0 10px ${COLORS.peach}` }} />
              <span style={{ fontFamily: SANS, fontSize: 20, color: COLORS.muted, letterSpacing: "0.04em" }}>
                Heavy-evening room · 4 here
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, minHeight: 320 }}>
              {MESSAGES.map((m, i) => (
                <Bubble key={i} msg={m} fps={fps} />
              ))}
            </div>
          </div>

          {/* countdown */}
          <div style={{ ...fadeUp(frame, 36, { dist: 24 }), flexShrink: 0 }}>
            <CountdownRing size={L.ring} progress={spent} time={`${mm}:${ss}`} caption="until midnight" />
          </div>
        </div>

        <div style={fadeUp(frame, 100)}>
          <Sub style={{ fontSize: L.sub, maxWidth: L.subMax }}>
            Emoji-only. No names, no feed — just presence, with a countdown running.
          </Sub>
        </div>
      </AbsoluteFill>
    </Background>
  );
};
