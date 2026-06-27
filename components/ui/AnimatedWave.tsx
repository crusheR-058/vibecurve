"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { curvePath } from "@/lib/curve";

/**
 * A living emotional wave. Used as the brand motif on the landing hero and the
 * welcome screen. The line draws itself on, then breathes softly forever.
 */
export default function AnimatedWave({
  width = 640,
  height = 220,
  stroke = 3,
  points,
  className = "",
  glow = true,
}: {
  width?: number;
  height?: number;
  stroke?: number;
  points?: number[];
  className?: string;
  glow?: boolean;
}) {
  const base = useMemo(() => points ?? [3, 7, 4.5, 8.5, 6], [points]);
  const variants = useMemo(
    () => [
      base,
      base.map((v, i) => Math.max(0.5, Math.min(9.5, v + (i % 2 ? 1.1 : -1.1)))),
      base.map((v, i) => Math.max(0.5, Math.min(9.5, v + (i % 2 ? -0.9 : 0.9)))),
    ],
    [base],
  );

  const paths = variants.map((v) => curvePath(v, width, height, 16));
  const areaPath = `${paths[0]} L ${width - 16},${height} L 16,${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      fill="none"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="vc-wave" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="55%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#fdba74" />
        </linearGradient>
        <linearGradient id="vc-wave-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(139,92,246,0.16)" />
          <stop offset="100%" stopColor="rgba(139,92,246,0)" />
        </linearGradient>
        {glow && (
          <filter id="vc-glow" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      <motion.path
        d={areaPath}
        fill="url(#vc-wave-fill)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1.2 }}
      />

      <motion.path
        d={paths[0]}
        stroke="url(#vc-wave)"
        strokeWidth={stroke}
        strokeLinecap="round"
        filter={glow ? "url(#vc-glow)" : undefined}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{
          pathLength: 1,
          opacity: 1,
          d: paths,
        }}
        transition={{
          pathLength: { duration: 1.6, ease: "easeInOut" },
          opacity: { duration: 0.6 },
          d: { duration: 9, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: 1.7 },
        }}
      />

      {base.map((v, i) => {
        const x = 16 + ((width - 32) * i) / (base.length - 1);
        const y = 16 + (height - 32) * (1 - v / 10);
        return (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r={4}
            fill="#fff"
            stroke="#8b5cf6"
            strokeWidth={2}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1 + i * 0.12, type: "spring", stiffness: 300, damping: 16 }}
          />
        );
      })}
    </svg>
  );
}
