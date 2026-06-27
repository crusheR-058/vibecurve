"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import FloatingParticles from "@/components/ui/FloatingParticles";

/**
 * The burn-to-ash. The night dissolves upward into light and the screen
 * brightens to a clean dawn, then returns home. The single most important
 * emotional beat in the product.
 */
export default function MidnightBurn({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const t = setTimeout(onComplete, 6200);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center overflow-hidden"
      initial={{ background: "#141019" }}
      animate={{ background: ["#141019", "#2c2440", "#8a7caa", "#F4EEF6", "#FFFDFB"] }}
      exit={{ opacity: 0 }}
      transition={{ duration: 6, times: [0, 0.25, 0.55, 0.85, 1], ease: "easeInOut" }}
    >
      {/* embers rising */}
      <FloatingParticles count={46} rising />

      {/* a final ribbon of the day, dissolving upward */}
      <motion.div
        className="absolute"
        initial={{ opacity: 0.9, y: 0, filter: "blur(0px)" }}
        animate={{ opacity: 0, y: -120, filter: "blur(14px)" }}
        transition={{ duration: 3.4, ease: "easeIn" }}
      >
        <svg width="320" height="120" viewBox="0 0 320 120" fill="none">
          <path
            d="M10 80 C 60 20, 110 20, 160 70 S 260 110, 310 30"
            stroke="rgba(253,186,116,0.9)"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>

      {/* Message uses fixed dawn-ink (not theme tokens) so it stays legible as
          the background sweeps from night to a bright dawn in either theme. */}
      <div className="relative z-10 px-8 text-center">
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: [0, 0, 1, 1, 0], y: [18, 18, 0, 0, -10] }}
          transition={{ duration: 6, times: [0, 0.32, 0.52, 0.86, 1], ease: "easeInOut" }}
          style={{ color: "#241F33" }}
          className="mx-auto max-w-md font-serif-display text-[26px] leading-snug sm:text-[30px]"
        >
          Some conversations are beautiful because they don&apos;t last forever.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 0.75, 0] }}
          transition={{ duration: 6, times: [0, 0.6, 0.82, 1] }}
          style={{ color: "rgba(36,31,51,0.7)" }}
          className="mt-4 text-sm"
        >
          The room has returned to ash. Nothing was kept.
        </motion.p>
      </div>
    </motion.div>
  );
}
