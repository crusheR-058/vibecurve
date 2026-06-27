"use client";

import { motion } from "framer-motion";

/** Wordmark + a tiny living curve glyph. */
export default function Logo({ size = 22 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <svg width={size + 12} height={size} viewBox="0 0 34 22" fill="none" aria-hidden>
        <defs>
          <linearGradient id="vc-logo" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#fdba74" />
          </linearGradient>
        </defs>
        <motion.path
          d="M2 14 C 7 4, 11 4, 16 11 S 27 20, 32 6"
          stroke="url(#vc-logo)"
          strokeWidth={2.6}
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
        />
      </svg>
      <span className="font-serif-display text-[19px] tracking-tight text-ink">
        VibeCurve
      </span>
    </div>
  );
}
