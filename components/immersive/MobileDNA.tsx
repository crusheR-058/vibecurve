"use client";

import { useEffect, useRef, useState } from "react";
import { useJourney } from "@/lib/journeyStore";

// Mobile-only: a DNA double-helix pinned to the bottom that draws itself left to
// right as you scroll and lands fully formed at the end of the journey. Two
// crossing sine strands + base-pair rungs; a faint track shows what's still to
// come; a glowing fork rides the reveal edge. Renders nothing on desktop.

const W = 480;
const H = 56;
const MIDY = 28;
const AMP = 12;
const PERIOD = 96;
const STEP = 6;

function buildStrand(): string {
  let d = `M 0 ${MIDY.toFixed(2)}`;
  for (let x = STEP; x <= W; x += STEP) {
    const y = MIDY + AMP * Math.sin((x / PERIOD) * Math.PI * 2);
    d += ` L ${x} ${y.toFixed(2)}`;
  }
  return d;
}

const STRAND = buildStrand();

export default function MobileDNA() {
  const [mobile, setMobile] = useState(false);
  const clipRect = useRef<SVGRectElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) setMobile(true);
  }, []);

  useEffect(() => {
    if (!mobile) return;
    const apply = (raw: number) => {
      const p = Math.min(1, Math.max(0, raw));
      clipRect.current?.setAttribute("width", String(p * W));
    };
    apply(useJourney.getState().progress);
    return useJourney.subscribe((s) => apply(s.progress));
  }, [mobile]);

  if (!mobile) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] bg-gradient-to-t from-[#07060c]/85 to-transparent pb-[env(safe-area-inset-bottom)]">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="block h-[54px] w-full" aria-hidden>
        <defs>
          <linearGradient id="dna-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#fb7185" />
          </linearGradient>
          <clipPath id="dna-reveal">
            <rect ref={clipRect} x="0" y="0" width="0" height={H} />
          </clipPath>
        </defs>

        {/* faint full curve (what's still to come) */}
        <g opacity="0.12" stroke="white" fill="none">
          <path d={STRAND} strokeWidth="1.4" />
        </g>

        {/* the part drawn so far */}
        <g clipPath="url(#dna-reveal)">
          <path
            d={STRAND}
            fill="none"
            stroke="url(#dna-grad)"
            strokeWidth="2.6"
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 5px rgba(139,92,246,0.7))" }}
          />
        </g>
      </svg>
    </div>
  );
}
