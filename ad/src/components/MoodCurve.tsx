import React from "react";
import { VW, VH, valueToY, linePath, areaPath, points, pointAtProgress } from "../lib/curve";
import { MOOD_STOPS, COLORS } from "../theme";

const PHASES = [
  { label: "Morning", icon: "🌅" },
  { label: "Afternoon", icon: "☀️" },
  { label: "Evening", icon: "🌇" },
  { label: "Night", icon: "🌙" },
];
const MOODS = [
  { v: 9.4, e: "😊" },
  { v: 5, e: "😐" },
  { v: 0.6, e: "😔" },
];
const PAD_L = 72;
const PAD_R = 44;

/**
 * The "draw your day" canvas. `progress` (0→1) sweeps the line on; dots pop as
 * the front passes them, and a glowing pen rides the tip. `id` namespaces the
 * SVG gradients so two curves can coexist (the match scene).
 */
export const MoodCurve: React.FC<{
  values: number[];
  progress: number;
  id?: string;
  showDots?: boolean;
  showPhases?: boolean;
  showRail?: boolean;
  showPen?: boolean;
  lineWidth?: number;
}> = ({
  values,
  progress,
  id = "vc",
  showDots = true,
  showPhases = true,
  showRail = true,
  showPen = true,
  lineWidth = 7,
}) => {
  const line = linePath(values);
  const area = areaPath(values);
  const pts = points(values);
  const n = values.length;
  const tip = pointAtProgress(values, progress);
  const drawn = Math.max(0, Math.min(1, progress));

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
      <defs>
        <linearGradient id={`${id}-line`} gradientUnits="userSpaceOnUse" x1="0" y1={valueToY(10)} x2="0" y2={valueToY(0)}>
          {MOOD_STOPS.map((s) => (
            <stop key={s.offset} offset={s.offset} stopColor={s.color} />
          ))}
        </linearGradient>
        <linearGradient id={`${id}-area`} gradientUnits="userSpaceOnUse" x1="0" y1={valueToY(10)} x2="0" y2={valueToY(0)}>
          <stop offset="0%" stopColor="rgba(139,92,246,0.30)" />
          <stop offset="62%" stopColor="rgba(139,92,246,0.10)" />
          <stop offset="100%" stopColor="rgba(139,92,246,0)" />
        </linearGradient>
        <radialGradient id={`${id}-sky`} cx="50%" cy="6%" r="65%">
          <stop offset="0%" stopColor="rgba(139,92,246,0.18)" />
          <stop offset="100%" stopColor="rgba(139,92,246,0)" />
        </radialGradient>
        <filter id={`${id}-glow`} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      {/* plot backdrop */}
      <rect x={PAD_L} y={48} width={VW - PAD_L - PAD_R} height={VH - 48 - 76 + 8} rx={18} fill="rgba(244,241,249,0.03)" />
      <rect x={PAD_L} y={48} width={VW - PAD_L - PAD_R} height={VH - 48 - 76 + 8} rx={18} fill={`url(#${id}-sky)`} />

      {/* quiet guides */}
      {[10, 5, 0].map((v) => (
        <line
          key={v}
          x1={PAD_L}
          x2={VW - PAD_R}
          y1={valueToY(v)}
          y2={valueToY(v)}
          strokeDasharray={v === 5 ? "5 9" : undefined}
          stroke="rgba(244,241,249,0.07)"
          strokeWidth={1}
        />
      ))}

      {showRail && (
        <>
          <line x1={34} x2={34} y1={valueToY(9.4)} y2={valueToY(0.6)} stroke={`url(#${id}-line)`} strokeWidth={3} strokeLinecap="round" opacity={0.5} />
          {MOODS.map((m) => (
            <g key={m.v}>
              <circle cx={34} cy={valueToY(m.v)} r={15} fill={COLORS.card} stroke={COLORS.hair} strokeWidth={1.5} />
              <text x={34} y={valueToY(m.v) + 6} fontSize="17" textAnchor="middle">
                {m.e}
              </text>
            </g>
          ))}
        </>
      )}

      {/* violet wash under the curve (revealed with the draw) */}
      <path d={area} fill={`url(#${id}-area)`} opacity={interpolateClamp(drawn, 0.15, 0.7)} />

      {/* glow pass + crisp line, both swept on via normalized dash */}
      <path
        d={line}
        fill="none"
        stroke={`url(#${id}-line)`}
        strokeWidth={lineWidth + 3}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${id}-glow)`}
        opacity={0.45}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - drawn}
      />
      <path
        d={line}
        fill="none"
        stroke={`url(#${id}-line)`}
        strokeWidth={lineWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - drawn}
      />

      {/* glowing pen tip riding the draw front */}
      {showPen && drawn > 0.01 && drawn < 0.995 && (
        <>
          <circle cx={tip.x} cy={tip.y} r={16} fill="rgba(255,255,255,0.18)" />
          <circle cx={tip.x} cy={tip.y} r={6.5} fill="#ffffff" />
        </>
      )}

      {/* control dots pop as the front passes them */}
      {showDots &&
        pts.map((p, i) => {
          const threshold = i / (n - 1);
          const local = interpolateClamp((drawn - threshold) / 0.08, 0, 1);
          if (local <= 0) return null;
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={8 * local}
              fill="#fff"
              stroke={COLORS.accent}
              strokeWidth={3 * local}
            />
          );
        })}

      {/* day-phase markers */}
      {showPhases &&
        PHASES.map((p, i) => {
          const x = PAD_L + ((VW - PAD_L - PAD_R) * (i + 0.5)) / PHASES.length;
          return (
            <g key={p.label} opacity={interpolateClamp((drawn - 0.1) / 0.3, 0, 1)}>
              <text x={x} y={VH - 40} fontSize="16" textAnchor="middle" opacity={0.85}>
                {p.icon}
              </text>
              <text x={x} y={VH - 18} fontSize="13" textAnchor="middle" fill={COLORS.muted}>
                {p.label}
              </text>
            </g>
          );
        })}
    </svg>
  );
};

function interpolateClamp(t: number, a: number, b: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}
