"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

/**
 * Soft floating particles — dust motes of light drifting upward. Used as
 * ambient texture and, with `rising`, as the seed of the burn-to-ash moment.
 *
 * Positions are derived from a deterministic, index-seeded pseudo-random so the
 * server and client render byte-identical markup (no hydration mismatch). Real
 * Math.random() in render would differ between SSR and hydration.
 */

// deterministic 0..1 from an index + salt (stable across server/client)
function seeded(i: number, salt: number): number {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export default function FloatingParticles({
  count = 18,
  rising = false,
  className = "",
}: {
  count?: number;
  rising?: boolean;
  className?: string;
}) {
  const dots = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: seeded(i, 1) * 100,
        top: seeded(i, 2) * 100,
        size: 2 + seeded(i, 3) * 5,
        delay: seeded(i, 4) * 6,
        duration: 8 + seeded(i, 5) * 10,
        drift: (seeded(i, 6) - 0.5) * 40,
        warm: seeded(i, 7) > 0.5,
        riseDist: 160 + seeded(i, 8) * 120,
        riseDur: 2.4 + seeded(i, 9) * 1.4,
        riseDelay: seeded(i, 10) * 0.8,
      })),
    [count],
  );

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {dots.map((d) => (
        <motion.span
          key={d.id}
          className="absolute rounded-full"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            background: d.warm ? "rgba(253,186,116,0.7)" : "rgba(196,181,253,0.8)",
            boxShadow: d.warm
              ? "0 0 8px rgba(253,186,116,0.6)"
              : "0 0 8px rgba(196,181,253,0.7)",
          }}
          animate={
            rising
              ? { y: [0, -d.riseDist], x: d.drift, opacity: [0.9, 0] }
              : { y: [0, -24, 0], x: [0, d.drift, 0], opacity: [0.2, 0.8, 0.2] }
          }
          transition={{
            duration: rising ? d.riseDur : d.duration,
            delay: rising ? d.riseDelay : d.delay,
            repeat: rising ? 0 : Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
