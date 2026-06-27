"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type Variant = "primary" | "ghost" | "soft";

/**
 * Magnetic CTA. The button leans toward the cursor, lifts on hover, and emits
 * a ripple on click. Primary = the warm violet → peach gradient.
 */
export default function MagneticButton({
  children,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: Variant;
  className?: string;
  type?: "button" | "submit";
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 250, damping: 18 });
  const sy = useSpring(y, { stiffness: 250, damping: 18 });
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set(((e.clientX - r.left) / r.width - 0.5) * 16);
    y.set(((e.clientY - r.top) / r.height - 0.5) * 16);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const handleClick = (e: React.MouseEvent) => {
    const el = ref.current;
    if (el) {
      const r = el.getBoundingClientRect();
      const id = Date.now();
      setRipples((p) => [...p, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
      setTimeout(() => setRipples((p) => p.filter((rp) => rp.id !== id)), 650);
    }
    onClick?.();
  };

  const base =
    "relative overflow-hidden rounded-button px-7 py-3.5 text-[15px] font-medium transition-shadow no-tap-highlight";
  const styles: Record<Variant, string> = {
    primary: "text-white shadow-glow",
    ghost: "text-ink bg-card/70 border border-hair hover:bg-card",
    soft: "text-accent bg-accent-light/60 hover:bg-accent-light",
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      onClick={handleClick}
      style={{ x: sx, y: sy }}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={`${base} ${styles[variant]} ${className}`}
    >
      {variant === "primary" && (
        <span
          aria-hidden
          className="absolute inset-0 animate-gradient-pan"
          style={{
            background:
              "linear-gradient(110deg, #8b5cf6, #a78bfa, #fdba74, #8b5cf6)",
            backgroundSize: "300% 100%",
          }}
        />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          className="absolute z-0 rounded-full bg-white/40"
          style={{ left: r.x, top: r.y, translateX: "-50%", translateY: "-50%" }}
          initial={{ width: 0, height: 0, opacity: 0.5 }}
          animate={{ width: 320, height: 320, opacity: 0 }}
          transition={{ duration: 0.62, ease: "easeOut" }}
        />
      ))}
    </motion.button>
  );
}
