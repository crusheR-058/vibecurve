"use client";

import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { describeCurve, quantize } from "@/lib/curve";
import type { CurvePoints } from "@/lib/types";
import MagneticButton from "@/components/ui/MagneticButton";

const VW = 1000;
const VH = 440;
const PAD_L = 72;
const PAD_R = 44;
const PAD_TOP = 56;
const PAD_BOTTOM = 76;
const PLOT_W = VW - PAD_L - PAD_R;
const PLOT_H = VH - PAD_TOP - PAD_BOTTOM;
const N = 5;
const EASE = [0.22, 1, 0.36, 1] as const;

const DEFAULT: CurvePoints = [4, 6, 5, 7, 5];

// Day-phase markers along the bottom. The 4 labels mark regions; 5 points are
// sampled across the Morning→Night axis (the 5th closes the night).
const PHASES = [
  { label: "Morning", icon: "🌅" },
  { label: "Afternoon", icon: "☀️" },
  { label: "Evening", icon: "🌇" },
  { label: "Night", icon: "🌙" },
];

// The emotional Y-axis — calm, never clinical (no angry faces).
const MOODS = [
  { v: 9.4, e: "😊" },
  { v: 5, e: "😐" },
  { v: 0.6, e: "😔" },
];

function valueToY(v: number) {
  return PAD_TOP + PLOT_H * (1 - v / 10);
}
function indexX(i: number) {
  return PAD_L + (PLOT_W * i) / (N - 1);
}

// Mood emoji for a 0–10 value — bright at the top, gently heavy at the bottom.
function moodEmoji(v: number): string {
  if (v >= 8) return "😄";
  if (v >= 6) return "🙂";
  if (v >= 4) return "😐";
  if (v >= 2) return "😔";
  return "😞";
}

export default function DrawYourDay({
  onSubmit,
}: {
  onSubmit: (points: CurvePoints) => void;
}) {
  const reduce = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const [points, setPoints] = useState<CurvePoints>(DEFAULT);
  const [drawing, setDrawing] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const [touched, setTouched] = useState(false);

  const apply = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const sx = ((clientX - rect.left) / rect.width) * VW;
    const sy = ((clientY - rect.top) / rect.height) * VH;
    const frac = (sx - PAD_L) / PLOT_W;
    const idx = Math.max(0, Math.min(N - 1, Math.round(frac * (N - 1))));
    const v = quantize(((valueToY(0) - sy) / (valueToY(0) - valueToY(10))) * 10);
    setActive(idx);
    setPoints((prev) => {
      const next = [...prev] as CurvePoints;
      next[idx] = v;
      return next;
    });
  }, []);

  const start = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDrawing(true);
    setTouched(true);
    apply(e.clientX, e.clientY);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing) return;
    apply(e.clientX, e.clientY);
  };
  const end = () => {
    setDrawing(false);
    setActive(null);
  };

  // smooth Catmull-Rom → bézier through the control points, in plot coords
  const plotLine = (() => {
    const xy = points.map((v, i) => [indexX(i), valueToY(v)] as const);
    let d = `M ${xy[0][0]},${xy[0][1]}`;
    for (let i = 0; i < N - 1; i++) {
      const p0 = xy[i === 0 ? 0 : i - 1];
      const p1 = xy[i];
      const p2 = xy[i + 1];
      const p3 = xy[i + 2 < N ? i + 2 : N - 1];
      const c1x = p1[0] + (p2[0] - p0[0]) / 6;
      const c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6;
      const c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
    }
    return d;
  })();
  const area = `${plotLine} L ${indexX(N - 1)},${valueToY(0)} L ${indexX(0)},${valueToY(0)} Z`;

  const avg = points.reduce((s, v) => s + v, 0) / points.length;

  return (
    <div className="mx-auto w-full max-w-3xl px-5">
      <div className="mb-7 text-center">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-accent"
        >
          Your day · in one line
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="font-serif-display text-[34px] leading-tight text-ink sm:text-[44px]"
        >
          Draw your day.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.7 }}
          className="mx-auto mt-2.5 max-w-md text-[15px] leading-relaxed text-muted"
        >
          One continuous line from morning to night — however today actually felt.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 26, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="relative"
      >
        {/* soft ambient aura behind the canvas */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-8 -z-10 opacity-70 blur-3xl"
          style={{
            background:
              "radial-gradient(45% 60% at 30% 25%, rgba(139,92,246,0.22), transparent 70%), radial-gradient(40% 55% at 78% 80%, rgba(253,186,116,0.18), transparent 70%)",
          }}
        />

        <div className="relative overflow-hidden rounded-[28px] border border-hair bg-card/90 p-3 shadow-lift backdrop-blur-sm sm:p-4">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${VW} ${VH}`}
            className="w-full touch-none select-none"
            style={{ cursor: drawing ? "grabbing" : "crosshair" }}
            onPointerDown={start}
            onPointerMove={move}
            onPointerUp={end}
            onPointerLeave={end}
          >
            <defs>
              {/* mood-graded line: bright/high = green, mid = amber, heavy/low = soft red */}
              <linearGradient
                id="vc-line"
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1={valueToY(10)}
                x2="0"
                y2={valueToY(0)}
              >
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="34%" stopColor="#a3e635" />
                <stop offset="60%" stopColor="#fbbf24" />
                <stop offset="82%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#f87171" />
              </linearGradient>

              {/* clean brand-violet wash under the curve (no muddy stacking) */}
              <linearGradient
                id="vc-area"
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1={valueToY(10)}
                x2="0"
                y2={valueToY(0)}
              >
                <stop offset="0%" stopColor="rgba(139,92,246,0.28)" />
                <stop offset="62%" stopColor="rgba(139,92,246,0.09)" />
                <stop offset="100%" stopColor="rgba(139,92,246,0)" />
              </linearGradient>

              {/* faint top-light, gives the plot an organic "sky" depth */}
              <radialGradient id="vc-sky" cx="50%" cy="6%" r="65%">
                <stop offset="0%" stopColor="rgba(139,92,246,0.16)" />
                <stop offset="100%" stopColor="rgba(139,92,246,0)" />
              </radialGradient>

              <filter id="vc-glow" x="-20%" y="-50%" width="140%" height="200%">
                <feGaussianBlur stdDeviation="7" />
              </filter>
            </defs>

            {/* plot backdrop */}
            <rect
              x={PAD_L}
              y={PAD_TOP - 8}
              width={PLOT_W}
              height={PLOT_H + 8}
              rx={18}
              className="fill-ink/[0.025]"
            />
            <rect
              x={PAD_L}
              y={PAD_TOP - 8}
              width={PLOT_W}
              height={PLOT_H + 8}
              rx={18}
              fill="url(#vc-sky)"
            />

            {/* a few quiet guides — not a grid */}
            {[
              { v: 10, dash: "" },
              { v: 5, dash: "5 9" },
              { v: 0, dash: "" },
            ].map((g) => (
              <line
                key={g.v}
                x1={PAD_L}
                x2={VW - PAD_R}
                y1={valueToY(g.v)}
                y2={valueToY(g.v)}
                strokeDasharray={g.dash || undefined}
                className="stroke-ink/[0.06]"
                strokeWidth={1}
              />
            ))}

            {/* emotional Y-axis: a soft mood rail + warm chips */}
            <line
              x1={34}
              x2={34}
              y1={valueToY(9.4)}
              y2={valueToY(0.6)}
              stroke="url(#vc-line)"
              strokeWidth={3}
              strokeLinecap="round"
              opacity={0.5}
            />
            {MOODS.map((m) => (
              <g key={m.v}>
                <circle cx={34} cy={valueToY(m.v)} r={15} className="fill-card stroke-hair" strokeWidth={1.5} />
                <text x={34} y={valueToY(m.v) + 6} fontSize="17" textAnchor="middle">
                  {m.e}
                </text>
              </g>
            ))}

            {/* area + glow + line */}
            <motion.path
              d={area}
              fill="url(#vc-area)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: reduce ? 0 : 0.5, duration: 0.8 }}
            />
            <motion.path
              d={plotLine}
              fill="none"
              stroke="url(#vc-line)"
              strokeWidth={7}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#vc-glow)"
              opacity={0.45}
              initial={{ pathLength: reduce ? 1 : 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: reduce ? 0 : 1.2, ease: EASE }}
            />
            <motion.path
              d={plotLine}
              fill="none"
              stroke="url(#vc-line)"
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: reduce ? 1 : 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: reduce ? 0 : 1.2, ease: EASE }}
            />

            {/* control handles */}
            {points.map((v, i) => {
              const cx = indexX(i);
              const cy = valueToY(v);
              const isActive = active === i;
              return (
                <g key={i}>
                  {isActive && (
                    <>
                      {/* grounding drop line */}
                      <line
                        x1={cx}
                        x2={cx}
                        y1={cy}
                        y2={valueToY(0)}
                        className="stroke-accent/30"
                        strokeWidth={1.5}
                        strokeDasharray="3 6"
                      />
                      <motion.circle
                        cx={cx}
                        cy={cy}
                        r={24}
                        fill="rgba(139,92,246,0.14)"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                      />
                    </>
                  )}

                  {/* idle invitation pulse before the first interaction */}
                  {!touched && !reduce && (
                    <motion.circle
                      cx={cx}
                      cy={cy}
                      r={9}
                      className="fill-accent"
                      initial={{ opacity: 0.4, scale: 1 }}
                      animate={{ opacity: 0, scale: 2.4 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: 1 + i * 0.18,
                        ease: "easeOut",
                      }}
                    />
                  )}

                  <motion.circle
                    cx={cx}
                    cy={cy}
                    r={isActive ? 11 : 8}
                    fill="#fff"
                    strokeWidth={3}
                    className="stroke-accent"
                    animate={{ r: isActive ? 11 : 8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  />

                  {isActive && (
                    <motion.g
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <circle cx={cx} cy={cy - 36} r={16} className="fill-card stroke-hair" strokeWidth={1.5} />
                      <text x={cx} y={cy - 30} fontSize="20" textAnchor="middle">
                        {moodEmoji(v)}
                      </text>
                    </motion.g>
                  )}
                </g>
              );
            })}

            {/* day-phase markers */}
            {PHASES.map((p, i) => {
              const x = PAD_L + (PLOT_W * (i + 0.5)) / PHASES.length;
              return (
                <g key={p.label}>
                  <text x={x} y={VH - 40} fontSize="16" textAnchor="middle" opacity={0.85}>
                    {p.icon}
                  </text>
                  <text
                    x={x}
                    y={VH - 18}
                    fontSize="13"
                    letterSpacing="0.5"
                    textAnchor="middle"
                    className="fill-muted font-sans"
                  >
                    {p.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </motion.div>

      <div className="mt-7 flex flex-col items-center gap-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={touched ? describeCurve(points) : "hint"}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 text-[15px] text-muted"
          >
            {touched ? (
              <>
                <span className="text-lg">{moodEmoji(avg)}</span>
                <span>
                  Looks like <span className="text-ink">{describeCurve(points)}</span>.
                </span>
              </>
            ) : (
              <span>Tap and drag across the canvas to shape your day.</span>
            )}
          </motion.div>
        </AnimatePresence>

        <MagneticButton onClick={() => onSubmit(points)}>
          Find My People
          <span aria-hidden>→</span>
        </MagneticButton>
      </div>
    </div>
  );
}
