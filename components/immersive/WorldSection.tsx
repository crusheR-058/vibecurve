"use client";

import { motion } from "framer-motion";
import type { World } from "@/lib/worlds";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * One emotional world: a full-height beat that surfaces its line as you arrive.
 * The 3D universe behind it has already morphed to this world's palette, so the
 * accent here matches the light in the scene.
 */
export default function WorldSection({ world, index }: { world: World; index: number }) {
  return (
    <section className="relative flex min-h-[100svh] items-center justify-center px-6">
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-25%" }}
          transition={{ duration: 0.7 }}
          className="mb-5 text-xs font-medium uppercase tracking-[0.32em]"
          style={{ color: world.accent }}
        >
          {String(index + 1).padStart(2, "0")} — {world.name}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-25%" }}
          transition={{ duration: 0.9, ease: EASE }}
          className="font-serif-display text-[clamp(32px,6vw,72px)] leading-[1.06] text-white"
        >
          {world.line}
        </motion.h2>
      </div>
    </section>
  );
}
