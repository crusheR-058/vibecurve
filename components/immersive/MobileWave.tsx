"use client";

import { useEffect, useRef, useState } from "react";

// Mobile-only: a continuously flowing brand wave pinned to the bottom of the
// screen — the "wave movement" from the Play Store install border, but in a
// straight horizontal line rather than a circle. Two layered sine waves travel
// at different speeds for depth. Renders nothing on desktop (returns null).

const W = 480;
const MIDY = 22;
const AMP = 7;
const PERIOD = 110;
const STEP = 6;

function wavePath(phase: number, amp: number): string {
  let d = `M 0 ${(MIDY + amp * Math.sin(phase)).toFixed(2)}`;
  for (let x = STEP; x <= W; x += STEP) {
    const y = MIDY + amp * Math.sin((x / PERIOD) * Math.PI * 2 + phase);
    d += ` L ${x} ${y.toFixed(2)}`;
  }
  return d;
}

export default function MobileWave() {
  const [mobile, setMobile] = useState(false);
  const front = useRef<SVGPathElement>(null);
  const back = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) setMobile(true);
  }, []);

  useEffect(() => {
    if (!mobile) return;
    let raf = 0;
    let t = 0;
    const loop = () => {
      t += 0.035;
      front.current?.setAttribute("d", wavePath(t, AMP));
      back.current?.setAttribute("d", wavePath(t * 0.6 + 1.2, AMP * 0.7));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [mobile]);

  if (!mobile) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] bg-gradient-to-t from-[#07060c]/85 to-transparent pb-[env(safe-area-inset-bottom)]">
      <svg viewBox="0 0 480 44" preserveAspectRatio="none" className="block h-[46px] w-full" aria-hidden>
        <defs>
          <linearGradient id="mw-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#fb7185" />
          </linearGradient>
        </defs>
        <path
          ref={back}
          d={wavePath(1.2, AMP * 0.7)}
          fill="none"
          stroke="url(#mw-grad)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.35"
        />
        <path
          ref={front}
          d={wavePath(0, AMP)}
          fill="none"
          stroke="url(#mw-grad)"
          strokeWidth="2.6"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 6px rgba(139,92,246,0.7))" }}
        />
      </svg>
    </div>
  );
}
