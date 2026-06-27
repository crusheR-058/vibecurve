"use client";

import { useId } from "react";
import { motion } from "framer-motion";

/** Wordmark + the Aurora Tile mark — a soft gradient tile holding the
 *  emotional wave that draws itself in. */
export default function Logo({ size = 26 }: { size?: number }) {
  const raw = useId();
  const uid = raw.replace(/[:]/g, "");
  const tile = `${uid}-tile`;
  const gloss = `${uid}-gloss`;

  return (
    <div className="flex items-center gap-2.5 select-none">
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
        <defs>
          <linearGradient id={tile} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#fdba74" />
          </linearGradient>
          <linearGradient id={gloss} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="44" height="44" rx="14" fill={`url(#${tile})`} />
        <rect x="2" y="2" width="44" height="44" rx="14" fill={`url(#${gloss})`} />
        <motion.path
          d="M9 30 C 15 17, 19 17, 24 24 S 33 35, 39 18"
          stroke="#ffffff"
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.96 }}
          transition={{ duration: 1.3, ease: "easeInOut" }}
        />
        <motion.circle
          cx="39"
          cy="18"
          r="3.4"
          fill="#ffffff"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.05, type: "spring", stiffness: 320, damping: 14 }}
          style={{ transformOrigin: "39px 18px" }}
        />
      </svg>
      <span className="font-serif-display text-[19px] tracking-tight text-ink">
        VibeCurve
      </span>
    </div>
  );
}
