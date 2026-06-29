import React from "react";
import { COLORS } from "../theme";
import { SANS, SERIF } from "../fonts";

/** Small uppercase, letter-spaced label in brand violet (the product's kicker). */
export const Kicker: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      fontFamily: SANS,
      fontSize: 22,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.24em",
      color: COLORS.accentBright,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Serif display headline (Instrument Serif). */
export const Headline: React.FC<{
  children: React.ReactNode;
  size?: number;
  style?: React.CSSProperties;
}> = ({ children, size = 96, style }) => (
  <h1
    style={{
      fontFamily: SERIF,
      fontWeight: 400,
      fontSize: size,
      lineHeight: 1.04,
      letterSpacing: "-0.015em",
      color: COLORS.ink,
      margin: 0,
      textAlign: "center",
      ...style,
    }}
  >
    {children}
  </h1>
);

/** Muted supporting line. */
export const Sub: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <p
    style={{
      fontFamily: SANS,
      fontSize: 30,
      lineHeight: 1.5,
      color: COLORS.muted,
      margin: 0,
      textAlign: "center",
      maxWidth: 820,
      ...style,
    }}
  >
    {children}
  </p>
);

/** A glassy pill/badge (the hero's "anti-flex network" chip). */
export const Badge: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 22px",
      borderRadius: 999,
      border: `1px solid ${COLORS.hair}`,
      background: "rgba(255,255,255,0.04)",
      backdropFilter: "blur(8px)",
      fontFamily: SANS,
      fontSize: 21,
      color: "rgba(244,241,249,0.78)",
      ...style,
    }}
  >
    {children}
  </div>
);
