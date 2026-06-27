"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "scale";

/** Fade + slide/scale into view on scroll. Nothing instantly appears. */
export default function Reveal({
  children,
  delay = 0,
  y = 24,
  direction = "up",
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  direction?: Direction;
  className?: string;
}) {
  const from =
    direction === "left"
      ? { x: -48 }
      : direction === "right"
        ? { x: 48 }
        : direction === "scale"
          ? { scale: 0.9 }
          : direction === "down"
            ? { y: -y }
            : { y };

  return (
    <motion.div
      initial={{ opacity: 0, ...from }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
