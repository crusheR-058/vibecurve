"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const HeroCanvas = dynamic(() => import("./HeroCanvas"), { ssr: false });

const EASE = [0.22, 1, 0.36, 1] as const;
const TITLE = "Every vibe has a curve.";

/**
 * The hero world: a dark volumetric scene with a self-drawing glowing curve,
 * overlaid by a cinematic title that reveals character by character. `onEnter`
 * keeps the existing CTA behavior (→ /app), so no routing/logic changes.
 */
export default function HeroWorld({ onEnter }: { onEnter: () => void }) {
  return (
    <section className="relative h-[100svh] w-full overflow-hidden bg-[#07060c] text-white">
      <div className="absolute inset-0">
        <HeroCanvas />
      </div>

      {/* vignette for legibility */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(72%_60%_at_50%_56%,transparent,rgba(7,6,12,0.72))]"
      />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <motion.span
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-white/70 backdrop-blur"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "#fdba74" }} />
          The anti-flex network · gone by midnight
        </motion.span>

        <h1 className="font-serif-display text-[clamp(40px,8.5vw,96px)] leading-[1.02]">
          <span className="sr-only">{TITLE}</span>
          <span aria-hidden className="flex flex-wrap justify-center">
            {TITLE.split("").map((c, i) => (
              <motion.span
                key={i}
                className="inline-block whitespace-pre"
                initial={{ opacity: 0, y: "55%", filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.5 + i * 0.03, duration: 0.7, ease: EASE }}
              >
                {c}
              </motion.span>
            ))}
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="mt-6 max-w-xl text-[16px] leading-relaxed text-white/60"
        >
          Travel the curve of your day and meet the people who felt it too — in rooms that vanish at
          midnight.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.75, duration: 0.8 }}
          className="mt-10"
        >
          <button
            data-cursor
            onClick={onEnter}
            className="group relative overflow-hidden rounded-full border border-white/20 px-8 py-3.5 text-sm font-medium text-white backdrop-blur transition-colors hover:border-white/0"
          >
            <span className="relative z-10 inline-flex items-center gap-2">
              Begin the journey <span aria-hidden>→</span>
            </span>
            <span className="absolute inset-0 translate-y-full bg-gradient-to-r from-[#38bdf8] via-[#8b5cf6] to-[#fb7185] transition-transform duration-500 ease-out group-hover:translate-y-0" />
          </button>
        </motion.div>
      </div>

      {/* scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex h-9 w-5 justify-center rounded-full border border-white/30 pt-1.5">
          <motion.span
            className="h-1.5 w-1 rounded-full bg-white/70"
            animate={{ y: [0, 7, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
