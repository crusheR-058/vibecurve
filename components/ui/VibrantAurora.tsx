"use client";

import { motion } from "framer-motion";

/**
 * A richer, more saturated aurora than the ambient one — five big, soft,
 * blurred color fields drifting on independent loops. Pure CSS/transform, so it
 * renders identically on every device (no WebGL), scales to any screen, and
 * stays calm while reading vibrant. Used as the landing hero's "weather".
 */
const BLOBS: {
  c: string;
  s: number;
  from: [string, string];
  to: [string, string];
  d: number;
}[] = [
  { c: "#8b5cf6", s: 560, from: ["-12%", "-14%"], to: ["10%", "6%"], d: 24 }, // violet
  { c: "#ec4899", s: 480, from: ["66%", "-10%"], to: ["50%", "16%"], d: 30 }, // pink
  { c: "#38bdf8", s: 520, from: ["6%", "68%"], to: ["28%", "50%"], d: 28 }, // sky
  { c: "#fdba74", s: 440, from: ["74%", "62%"], to: ["58%", "46%"], d: 34 }, // peach
  { c: "#a78bfa", s: 620, from: ["34%", "26%"], to: ["46%", "42%"], d: 26 }, // light violet
];

export default function VibrantAurora({ intensity = 1 }: { intensity?: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {BLOBS.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: b.s,
            height: b.s,
            background: b.c,
            filter: "blur(95px)",
            opacity: 0.5 * intensity,
            left: b.from[0],
            top: b.from[1],
          }}
          animate={{ left: [b.from[0], b.to[0], b.from[0]], top: [b.from[1], b.to[1], b.from[1]] }}
          transition={{ duration: b.d, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
