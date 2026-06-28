"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import ImmersiveNav from "./ImmersiveNav";
import WorldSection from "./WorldSection";
import MobileScrollCurve from "./MobileScrollCurve";
import { WORLDS } from "@/lib/worlds";
import type { Profile } from "@/lib/types";

const JourneyCanvas = dynamic(() => import("./JourneyCanvas"), { ssr: false });
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The whole landing as one continuous flight: a persistent 3D universe fixed
 * behind, with the hero, the emotional worlds, and the CTA scrolling over it.
 * `onEnter` preserves the existing CTA behavior (→ /app).
 */
export default function ImmersiveJourney({
  onEnter,
  profile,
}: {
  onEnter: () => void;
  profile: Profile;
}) {
  return (
    <main className="relative bg-[#07060c] text-white">
      {/* the persistent emotional universe */}
      <div className="fixed inset-0 z-0">
        <JourneyCanvas />
      </div>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(72%_60%_at_50%_50%,transparent,rgba(7,6,12,0.62))]"
      />

      {/* mobile-only: brand curve at the bottom that completes as you scroll */}
      <MobileScrollCurve />

      <div className="relative z-10">
        <ImmersiveNav profile={profile} />

        {/* ── Hero ── */}
        <section className="relative flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
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
            {"Every vibe has a curve.".split(" ").map((w, i) => (
              <motion.span
                key={i}
                className="mr-[0.25em] inline-block"
                initial={{ opacity: 0, y: "55%", filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.5 + i * 0.09, duration: 0.7, ease: EASE }}
              >
                {w}
              </motion.span>
            ))}
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="mt-6 max-w-xl text-[16px] leading-relaxed text-white/60"
          >
            Scroll, and travel the emotional worlds we all move through — then meet the people who felt
            today like you.
          </motion.p>
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

        {/* ── The emotional worlds ── */}
        {WORLDS.map((world, i) => (
          <WorldSection key={world.id} world={world} index={i} />
        ))}

        {/* ── Final CTA ── */}
        <section className="relative flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 0.9, ease: EASE }}
            className="font-serif-display text-[clamp(40px,7vw,84px)] leading-[1.04]"
          >
            How did today feel?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ delay: 0.2, duration: 1 }}
            className="mt-5 max-w-md text-[16px] text-white/60"
          >
            Draw it. Somewhere out there, someone had a day shaped just like yours.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ delay: 0.35, duration: 0.8 }}
            className="mt-10"
          >
            <button
              data-cursor
              onClick={onEnter}
              className="group relative overflow-hidden rounded-full border border-white/20 px-9 py-4 text-sm font-medium text-white backdrop-blur transition-colors hover:border-white/0"
            >
              <span className="relative z-10 inline-flex items-center gap-2">
                Begin the journey <span aria-hidden>→</span>
              </span>
              <span className="absolute inset-0 translate-y-full bg-gradient-to-r from-[#38bdf8] via-[#8b5cf6] to-[#fb7185] transition-transform duration-500 ease-out group-hover:translate-y-0" />
            </button>
          </motion.div>
        </section>

        <footer className="relative z-10 border-t border-white/10 px-6 py-10 text-center text-xs text-white/40">
          <p>VibeCurve — presence over permanence · gone by midnight</p>
          <p className="mt-2">No followers · no likes · no profiles</p>
        </footer>
      </div>
    </main>
  );
}
