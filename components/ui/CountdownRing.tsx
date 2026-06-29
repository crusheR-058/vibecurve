"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { countdownTo, formatCountdown, nextMidnight, type Countdown } from "@/lib/time";

/**
 * The countdown-to-midnight ring. A thin gradient arc quietly drains as the
 * night runs out — the visual heartbeat of the room's ephemerality.
 */
export default function CountdownRing({
  expiresAt,
  size = 64,
  onExpire,
}: {
  expiresAt: number;
  size?: number;
  onExpire?: () => void;
}) {
  // `expiresAt` is computed server-side, so on a UTC-hosted server it points at
  // UTC midnight — wrong for anyone in another timezone. "Until midnight" should
  // always mean the *user's* local midnight, so target the client's own next
  // local midnight, capped by the server expiry so we never count past it.
  const [c, setC] = useState<Countdown>(() =>
    countdownTo(Math.min(expiresAt, nextMidnight())),
  );
  const fired = useState({ done: false })[0];

  useEffect(() => {
    const tick = () => {
      const next = countdownTo(Math.min(expiresAt, nextMidnight()));
      setC(next);
      if (next.total <= 0 && !fired.done) {
        fired.done = true;
        onExpire?.();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt, onExpire, fired]);

  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;

  return (
    <div className="flex items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id="vc-ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#fdba74" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={4}
            className="stroke-hair"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="url(#vc-ring)"
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={circ}
            animate={{ strokeDashoffset: circ * (1 - c.fraction) }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-base">🌙</span>
      </div>
      <div className="leading-tight">
        <div className="font-mono text-sm tabular-nums text-ink">{formatCountdown(c)}</div>
        <div className="text-xs text-muted">until midnight</div>
      </div>
    </div>
  );
}
