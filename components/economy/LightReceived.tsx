"use client";

import { motion } from "framer-motion";
import FloatingParticles from "@/components/ui/FloatingParticles";
import MagneticButton from "@/components/ui/MagneticButton";

// Shown before the room when today's curve was heavy: a light a past stranger
// left for whoever came next. Always free to receive.
export default function LightReceived({
  text,
  onContinue,
}: {
  text: string;
  onContinue: () => void;
}) {
  return (
    <div className="relative grid min-h-[100dvh] place-items-center overflow-hidden px-6">
      <FloatingParticles count={26} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex max-w-md flex-col items-center text-center"
      >
        <motion.div
          className="mb-7 text-6xl"
          style={{ filter: "drop-shadow(0 0 26px rgba(253,186,116,0.7))" }}
          animate={{ scale: [1, 1.08, 1], rotate: [-2, 2, -2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          🕯️
        </motion.div>
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-accent">
          A light was left for you
        </p>
        <p className="font-serif-display text-[24px] leading-snug text-ink sm:text-[28px]">{text}</p>
        <div className="mt-9">
          <MagneticButton onClick={onContinue}>
            Step into your room
            <span aria-hidden>→</span>
          </MagneticButton>
        </div>
        <p className="mt-5 text-xs text-muted">No one knows who lit it. That&apos;s the point.</p>
      </motion.div>
    </div>
  );
}
