"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;
const WORD = "VibeCurve";

/**
 * Cinematic intro: a glowing curve draws itself, the wordmark rises letter by
 * letter, then the whole veil lifts to reveal the hero. Calls onDone when the
 * sequence completes (parent unmounts it inside AnimatePresence to play exit).
 */
export default function Loader({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(onDone, reduce ? 400 : 2600);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[120] grid place-items-center bg-[#07060c]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(8px)" }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      <div className="flex flex-col items-center">
        <svg width="240" height="44" viewBox="0 0 240 44" className="mb-6">
          <defs>
            <linearGradient id="ld-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#fb7185" />
            </linearGradient>
          </defs>
          <motion.path
            d="M6 24 C 54 2, 96 42, 138 20 S 214 6, 234 26"
            fill="none"
            stroke="url(#ld-grad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 7px rgba(139,92,246,0.8))" }}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.7, ease: "easeInOut" }}
          />
        </svg>

        <div className="flex overflow-hidden">
          {WORD.split("").map((c, i) => (
            <motion.span
              key={i}
              className="font-serif-display text-3xl tracking-tight text-white sm:text-4xl"
              initial={{ y: "120%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 + i * 0.05, duration: 0.6, ease: EASE }}
            >
              {c}
            </motion.span>
          ))}
        </div>

        <motion.div
          className="mt-5 h-px w-40 origin-left bg-gradient-to-r from-transparent via-white/40 to-transparent"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        />
      </div>
    </motion.div>
  );
}
