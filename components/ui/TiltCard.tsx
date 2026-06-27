"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";

/**
 * A card that tilts subtly toward the cursor in 3D and lifts on hover, with a
 * soft glare that tracks the pointer. Calm, never gimmicky — max ~7° of tilt.
 */
export default function TiltCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const smx = useSpring(mx, { stiffness: 180, damping: 20 });
  const smy = useSpring(my, { stiffness: 180, damping: 20 });

  const rotateY = useTransform(smx, [0, 1], [-7, 7]);
  const rotateX = useTransform(smy, [0, 1], [7, -7]);
  // hooks must run unconditionally — compute the glare gradient up front
  const glare = useTransform(
    smx,
    (x) =>
      `radial-gradient(circle at ${(x * 100).toFixed(1)}% 0%, rgba(255,255,255,0.10), transparent 60%)`,
  );

  const handleMove = (e: React.MouseEvent) => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };

  const reset = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={reduce ? undefined : { rotateX, rotateY, transformPerspective: 900 }}
      whileHover={reduce ? undefined : { y: -6, transition: { type: "spring", stiffness: 280, damping: 22 } }}
      className={`group relative rounded-card border border-hair bg-card p-7 shadow-soft transition-shadow duration-300 hover:shadow-lift ${className}`}
    >
      {!reduce && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-card opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: glare }}
        />
      )}
      <div style={reduce ? undefined : { transform: "translateZ(40px)" }}>{children}</div>
    </motion.div>
  );
}
