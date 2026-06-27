"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AnimatedWave from "@/components/ui/AnimatedWave";
import FloatingParticles from "@/components/ui/FloatingParticles";
import type { CurvePoints } from "@/lib/types";

const MESSAGES = [
  "Looking for someone who felt today the way you did…",
  "Reading the shape of your hours…",
  "Finding your parallel…",
  "Some days rhyme. Listening for yours…",
];

export default function Matching({
  points,
  onResolved,
  resolvedPercent,
  ready,
}: {
  points: CurvePoints;
  onResolved: () => void;
  resolvedPercent: number | null;
  ready: boolean;
}) {
  const [mi, setMi] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setMi((m) => (m + 1) % MESSAGES.length), 2200);
    return () => clearInterval(id);
  }, []);

  // reveal the match % once the server has answered AND a graceful minimum has passed
  useEffect(() => {
    if (ready && resolvedPercent != null) {
      const t = setTimeout(() => setRevealed(true), 400);
      return () => clearTimeout(t);
    }
  }, [ready, resolvedPercent]);

  useEffect(() => {
    if (revealed) {
      const t = setTimeout(onResolved, 1900);
      return () => clearTimeout(t);
    }
  }, [revealed, onResolved]);

  return (
    <div className="relative grid min-h-[100dvh] place-items-center overflow-hidden px-6">
      <FloatingParticles count={22} />

      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.div
          className="relative mb-10 h-40 w-72"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <AnimatedWave width={300} height={150} points={points} className="h-full w-full" />
          <motion.div
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(196,181,253,0.4), transparent 70%)" }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2.6, repeat: Infinity }}
          />
        </motion.div>

        {!revealed ? (
          <>
            <motion.h2
              key="head"
              className="font-serif-display text-[30px] text-ink sm:text-[34px]"
            >
              Finding your parallel
              <AnimatedDots />
            </motion.h2>
            <div className="mt-4 h-6">
              <motion.p
                key={mi}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="text-[15px] text-muted"
              >
                {MESSAGES[mi]}
              </motion.p>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 18 }}
            className="relative flex flex-col items-center"
          >
            <Celebration />
            <motion.div
              className="relative z-10 font-serif-display text-[72px] leading-none animated-gradient-text"
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 160, damping: 12 }}
            >
              {resolvedPercent}%
            </motion.div>
            <p className="mt-2 text-[15px] text-muted">
              Your days had nearly the same shape.
            </p>
            <p className="mt-1 text-sm text-accent">Opening your room…</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Celebration() {
  // a soft radial burst of light when the match lands — a quiet celebration
  const bits = Array.from({ length: 18 }, (_, i) => {
    const angle = (i / 18) * Math.PI * 2;
    const dist = 90 + (i % 3) * 26;
    return {
      id: i,
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      warm: i % 2 === 0,
      size: 4 + (i % 3) * 2,
    };
  });
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
      {bits.map((b) => (
        <motion.span
          key={b.id}
          className="absolute rounded-full"
          style={{
            width: b.size,
            height: b.size,
            background: b.warm ? "#FDBA74" : "#C4B5FD",
            boxShadow: b.warm ? "0 0 10px #FDBA74" : "0 0 10px #C4B5FD",
          }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
          animate={{ x: b.x, y: b.y, opacity: [0, 1, 0], scale: [0.4, 1, 0.6] }}
          transition={{ duration: 1.3, ease: "easeOut", delay: 0.05 }}
        />
      ))}
    </div>
  );
}

function AnimatedDots() {
  return (
    <span className="inline-flex">
      {[0, 1, 2].map((d) => (
        <motion.span
          key={d}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: d * 0.2 }}
        >
          .
        </motion.span>
      ))}
    </span>
  );
}
