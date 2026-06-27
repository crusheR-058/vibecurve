"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/**
 * Counts the first number in `value` up from zero when scrolled into view,
 * preserving any prefix/suffix ("9 hrs", "52%", "1 in 6"). Reduced-motion
 * users see the final value immediately.
 */
const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);

export default function CountUp({
  value,
  duration = 1500,
  className = "",
}: {
  value: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const match = value.match(/^(\D*)(\d+)(.*)$/);
  const target = match ? parseInt(match[2], 10) : 0;
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView || !match) return;
    if (reduce) {
      setN(target);
      return;
    }
    let raf = 0;
    let start = 0;
    const step = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      setN(Math.round(target * easeOut(p)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, target, duration, match]);

  if (!match) return <span ref={ref} className={className}>{value}</span>;
  return (
    <span ref={ref} className={className}>
      {match[1]}
      {n}
      {match[3]}
    </span>
  );
}
