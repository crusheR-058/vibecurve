"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** A thin gradient bar at the very top that fills as the page scrolls. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[55] h-[3px] origin-left"
      style={{
        scaleX,
        background: "linear-gradient(90deg, #8b5cf6, #a78bfa, #fdba74)",
      }}
    />
  );
}
