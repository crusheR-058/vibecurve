"use client";

import { useEffect, useRef, useState } from "react";
import { useJourney } from "@/lib/journeyStore";

// Mobile-only: a brand curve pinned to the bottom of the screen that draws
// itself as you scroll and lands fully complete at the end. It renders nothing
// on desktop (returns null on pointer-fine), so the desktop UI is untouched.
// Driven by the same scroll `progress` as the 3D scene, so the two stay in step.

const CURVE = "M 0 46 C 70 8, 132 62, 200 34 S 332 6, 400 38";

export default function MobileScrollCurve() {
  const [mobile, setMobile] = useState(false);
  const pathRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) setMobile(true);
  }, []);

  useEffect(() => {
    if (!mobile) return;
    const path = pathRef.current;
    if (!path) return;
    const total = path.getTotalLength();
    path.style.strokeDasharray = `${total}`;

    const apply = (raw: number) => {
      const p = Math.min(1, Math.max(0, raw));
      path.style.strokeDashoffset = `${total * (1 - p)}`;
      const dot = dotRef.current;
      if (dot) {
        const pt = path.getPointAtLength(total * p);
        dot.setAttribute("cx", String(pt.x));
        dot.setAttribute("cy", String(pt.y));
      }
    };

    apply(useJourney.getState().progress);
    return useJourney.subscribe((s) => apply(s.progress));
  }, [mobile]);

  if (!mobile) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] bg-gradient-to-t from-[#07060c]/85 to-transparent pb-[env(safe-area-inset-bottom)]">
      <svg
        viewBox="0 0 400 64"
        preserveAspectRatio="none"
        className="block h-[60px] w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="msc-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#fb7185" />
          </linearGradient>
        </defs>
        {/* faint full track */}
        <path d={CURVE} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="2.5" strokeLinecap="round" />
        {/* the part drawn so far */}
        <path
          ref={pathRef}
          d={CURVE}
          fill="none"
          stroke="url(#msc-grad)"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 6px rgba(139,92,246,0.75))" }}
        />
        {/* the leading dot riding the curve */}
        <circle ref={dotRef} cx="0" cy="46" r="3.4" fill="#fff" style={{ filter: "drop-shadow(0 0 5px #fff)" }} />
      </svg>
    </div>
  );
}
