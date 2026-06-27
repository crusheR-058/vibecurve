"use client";

import { motion } from "framer-motion";

/**
 * Seamless infinite marquee. The row is duplicated and translated exactly one
 * set-width (-50%) so the loop is invisible. Edges fade out via a mask.
 */
export default function Marquee({
  items,
  duration = 30,
  className = "",
}: {
  items: string[];
  duration?: number;
  className?: string;
}) {
  const row = [...items, ...items];
  return (
    <div
      aria-hidden
      className={`relative flex overflow-hidden ${className}`}
      style={{
        maskImage:
          "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
      }}
    >
      <motion.div
        className="flex shrink-0 items-center gap-10 pr-10"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        {row.map((t, i) => (
          <span
            key={i}
            className="flex items-center gap-10 whitespace-nowrap text-sm tracking-wide text-muted"
          >
            <span>{t}</span>
            <span className="text-accent/60">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
