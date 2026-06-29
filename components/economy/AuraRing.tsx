"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { aura as auraOf } from "@/lib/economyData";

// A vibe ring drawn behind an emoji orb. Because identity is anonymous and
// resets nightly, an aura is pure in-the-moment expression — never a flex.
export default function AuraRing({
  auraId,
  size,
  children,
}: {
  auraId: string;
  size: number;
  children: ReactNode;
}) {
  const a = auraOf(auraId);
  if (!a || auraId === "none") return <>{children}</>;
  const gradient = a.ring === "gradient";

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <motion.span
        aria-hidden
        className="absolute rounded-full"
        style={
          gradient
            ? { inset: -3, background: "conic-gradient(from 0deg, #8b5cf6, #fdba74, #a78bfa, #8b5cf6)" }
            : { inset: 0, boxShadow: `0 0 0 2px ${a.ring}, 0 0 16px ${a.ring}` }
        }
        animate={a.animated ? { rotate: 360 } : undefined}
        transition={a.animated ? { duration: 8, repeat: Infinity, ease: "linear" } : undefined}
      />
      <div className="relative z-10 grid place-items-center" style={{ width: size, height: size }}>
        {children}
      </div>
    </div>
  );
}
