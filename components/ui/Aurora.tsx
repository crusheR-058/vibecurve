"use client";

import { motion } from "framer-motion";

/**
 * Slow, breathing ambient gradient — the warm "weather" behind immersive
 * screens. Three soft blobs drift on independent loops. Nothing harsh.
 */
export default function Aurora({ intensity = 1 }: { intensity?: number }) {
  const blob = (
    color: string,
    size: number,
    from: [string, string],
    to: [string, string],
    duration: number,
  ) => (
    <motion.div
      aria-hidden
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        background: color,
        filter: "blur(80px)",
        opacity: 0.55 * intensity,
        left: from[0],
        top: from[1],
      }}
      animate={{ left: [from[0], to[0], from[0]], top: [from[1], to[1], from[1]] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    />
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {blob("rgba(221,214,254,0.9)", 520, ["-8%", "-10%"], ["18%", "8%"], 26)}
      {blob("rgba(253,186,116,0.5)", 440, ["70%", "-6%"], ["55%", "20%"], 32)}
      {blob("rgba(196,181,253,0.7)", 600, ["25%", "70%"], ["45%", "55%"], 30)}
    </div>
  );
}
