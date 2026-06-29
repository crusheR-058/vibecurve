"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { countdownTo, formatCountdown, nextMidnight, type Countdown } from "@/lib/time";

/**
 * The countdown-to-midnight ring. A thin gradient arc quietly drains as the
 * night runs out — the visual heartbeat of the room's ephemerality.
 *
 * "Until midnight" always means the *viewer's own* local midnight. We derive it
 * on the client from the browser clock, which auto-detects the user's timezone
 * (IST, PST, …) — never from the server's expiry. The server computes expiry in
 * its own local time, and a UTC-hosted server's "midnight" is UTC midnight,
 * which is wrong for anyone east or west of UTC. For IST that read ~3–4h left
 * between 00:00 and 05:30 local instead of the true ~22h; the room's server
 * expiry stays the data-lifecycle instant, but the ring is purely the viewer's
 * own clock.
 */
export default function CountdownRing({
  size = 64,
  onExpire,
}: {
  size?: number;
  onExpire?: () => void;
}) {
  // Start unresolved so the server render and the first client paint agree —
  // nextMidnight() is timezone-dependent and would otherwise hydrate-mismatch.
  // The mount effect fills in the real, locally-detected value immediately.
  const [c, setC] = useState<Countdown | null>(null);
  const fired = useState({ done: false })[0];

  useEffect(() => {
    const tick = () => {
      const next = countdownTo(nextMidnight());
      setC(next);
      if (next.total <= 0 && !fired.done) {
        fired.done = true;
        onExpire?.();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [onExpire, fired]);

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
            animate={{ strokeDashoffset: circ * (1 - (c?.fraction ?? 1)) }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-base">🌙</span>
      </div>
      <div className="leading-tight">
        <div className="font-mono text-sm tabular-nums text-ink">{c ? formatCountdown(c) : "--:--:--"}</div>
        <div className="text-xs text-muted">until midnight</div>
      </div>
    </div>
  );
}
