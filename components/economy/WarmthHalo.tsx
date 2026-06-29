"use client";

import { type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Wraps a message bubble. When warmed, the bubble gains a peach/violet glow and
// a single ember drifts off it. Warmth always lands on someone *else's* message.
const RING: Record<string, string> = {
  glow: "0 0 0 1px rgba(253,186,116,0.5), 0 0 22px rgba(253,186,116,0.45)",
  candle: "0 0 0 1px rgba(253,186,116,0.7), 0 0 30px rgba(253,186,116,0.6)",
  aurora: "0 0 0 1px rgba(167,139,250,0.7), 0 0 38px rgba(167,139,250,0.6)",
};

export default function WarmthHalo({
  tier,
  className = "",
  radius = "rounded-card",
  children,
}: {
  tier: string | null;
  className?: string;
  radius?: string;
  children: ReactNode;
}) {
  return (
    <div className={`relative w-fit ${className}`}>
      <motion.div
        animate={{ boxShadow: tier ? RING[tier] ?? RING.glow : "0 0 0 0 rgba(0,0,0,0)" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={radius}
      >
        {children}
      </motion.div>
      <AnimatePresence>
        {tier && (
          <motion.span
            key={tier}
            aria-hidden
            className="pointer-events-none absolute -top-1 right-3 text-sm"
            initial={{ y: 0, opacity: 0.9, scale: 0.8 }}
            animate={{ y: -28, opacity: 0, scale: 1.2 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            style={{ filter: "drop-shadow(0 0 8px rgba(253,186,116,0.7))" }}
          >
            {tier === "aurora" ? "🔥" : "✦"}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
