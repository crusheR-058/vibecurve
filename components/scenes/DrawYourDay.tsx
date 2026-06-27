"use client";

import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { curvePath, describeCurve, quantize, TIMELINE_LABELS } from "@/lib/curve";
import type { CurvePoints } from "@/lib/types";
import MagneticButton from "@/components/ui/MagneticButton";

const VW = 1000;
const VH = 460;
const PAD_X = 44;
const PAD_TOP = 44;
const PAD_BOTTOM = 70;
const PLOT_W = VW - PAD_X * 2;
const PLOT_H = VH - PAD_TOP - PAD_BOTTOM;
const N = 5;

const DEFAULT: CurvePoints = [4, 6, 5, 7, 5];

function valueToY(v: number) {
  return PAD_TOP + PLOT_H * (1 - v / 10);
}
function indexX(i: number) {
  return PAD_X + (PLOT_W * i) / (N - 1);
}

// Mood emoji for a 0–10 value — bright/smiley at the top, heavy then angry low.
function moodEmoji(v: number): string {
  if (v >= 8) return "😄";
  if (v >= 6) return "🙂";
  if (v >= 4) return "😐";
  if (v >= 2) return "😔";
  return "😠";
}

export default function DrawYourDay({
  onSubmit,
}: {
  onSubmit: (points: CurvePoints) => void;
}) {
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
    // nearest control index to the pointer's x
    const frac = (sx - PAD_X) / PLOT_W;
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

  const line = curvePath(points, VW, VH, 0)
    // re-map to plot coords (curvePath uses full box; we need plot padding)
    ;
  // build path manually within the plot box for accuracy
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
  void line;
  const area = `${plotLine} L ${indexX(N - 1)},${valueToY(0)} L ${indexX(0)},${valueToY(0)} Z`;

  return (
    <div className="mx-auto w-full max-w-3xl px-5">
      <div className="mb-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif-display text-[34px] leading-tight text-ink sm:text-[42px]"
        >
          Draw your day.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.7 }}
          className="mt-2 text-[15px] text-muted"
        >
          One continuous line, morning to night. However today actually felt.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-card border border-hair bg-card p-3 shadow-soft sm:p-4"
      >
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
            {/* live mood grading — happy/high = green, mid = amber, sad/low = red */}
            <linearGradient
              id="vc-draw-line"
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1={valueToY(10)}
              x2="0"
              y2={valueToY(0)}
            >
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="32%" stopColor="#a3e635" />
              <stop offset="58%" stopColor="#fbbf24" />
              <stop offset="80%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#f87171" />
            </linearGradient>
            <linearGradient
              id="vc-draw-fill"
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1={valueToY(10)}
              x2="0"
              y2={valueToY(0)}
            >
              <stop offset="0%" stopColor="rgba(52,211,153,0.24)" />
              <stop offset="55%" stopColor="rgba(251,191,36,0.16)" />
              <stop offset="100%" stopColor="rgba(248,113,113,0.18)" />
            </linearGradient>
          </defs>

          {/* horizontal guide lines */}
          {[0, 2.5, 5, 7.5, 10].map((v) => (
            <line
              key={v}
              x1={PAD_X}
              x2={VW - PAD_X}
              y1={valueToY(v)}
              y2={valueToY(v)}
              className="stroke-ink/[0.07]"
              strokeWidth={1}
            />
          ))}

          {/* mood anchors — the emotional Y axis (bright · heavy · angry) */}
          {[
            { v: 10, e: "😊" },
            { v: 3.2, e: "😔" },
            { v: 0, e: "😠" },
          ].map((a) => (
            <text key={a.v} x={20} y={valueToY(a.v) + 7} fontSize="22" textAnchor="middle">
              {a.e}
            </text>
          ))}

          {/* area + line */}
          <motion.path d={area} fill="url(#vc-draw-fill)" />
          <motion.path
            d={plotLine}
            fill="none"
            stroke="url(#vc-draw-line)"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* control handles */}
          {points.map((v, i) => {
            const cx = indexX(i);
            const cy = valueToY(v);
            const isActive = active === i;
            return (
              <g key={i}>
                {isActive && (
                  <motion.circle
                    cx={cx}
                    cy={cy}
                    r={22}
                    fill="rgba(139,92,246,0.14)"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
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
                  <text x={cx} y={cy - 22} fontSize="22" textAnchor="middle">
                    {moodEmoji(v)}
                  </text>
                )}
              </g>
            );
          })}

          {/* timeline labels */}
          {TIMELINE_LABELS.map((label, i) => {
            const x = PAD_X + (PLOT_W * (i + 0.5)) / TIMELINE_LABELS.length;
            return (
              <text
                key={label}
                x={x}
                y={VH - 26}
                fontSize="14"
                textAnchor="middle"
                className="fill-muted font-sans"
              >
                {label}
              </text>
            );
          })}
        </svg>
      </motion.div>

      <div className="mt-6 flex flex-col items-center gap-3">
        <AnimatePresence mode="wait">
          <motion.p
            key={touched ? describeCurve(points) : "hint"}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4 }}
            className="text-sm text-muted"
          >
            {touched ? (
              <>Looks like {describeCurve(points)}.</>
            ) : (
              <>Drag across the canvas to shape your day.</>
            )}
          </motion.p>
        </AnimatePresence>

        <MagneticButton onClick={() => onSubmit(points)}>
          Find My People
          <span aria-hidden>→</span>
        </MagneticButton>
      </div>
    </div>
  );
}
