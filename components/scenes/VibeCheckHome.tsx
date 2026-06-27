"use client";

import { motion } from "framer-motion";
import MagneticButton from "@/components/ui/MagneticButton";
import type { Profile } from "@/lib/types";

export default function VibeCheckHome({
  profile,
  name,
  onStart,
  onProfile,
}: {
  profile: Profile;
  name?: string | null;
  onStart: () => void;
  onProfile: () => void;
}) {
  const first = (name || "you").split(" ")[0];
  return (
    <div className="relative grid min-h-[100dvh] place-items-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md text-center"
      >
        <motion.div
          className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-full border border-hair bg-card text-5xl shadow-lift"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          {profile.emoji}
        </motion.div>
        <h1 className="font-serif-display text-[34px] leading-tight text-ink sm:text-[42px]">
          hey {first}.
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-[16px] leading-relaxed text-muted">
          How did today actually feel? Draw your curve and we&apos;ll find a few people whose day had
          the same shape.
        </p>
        <div className="mt-9 flex flex-col items-center gap-4">
          <MagneticButton onClick={onStart}>
            Start VibeCheck
            <span aria-hidden>→</span>
          </MagneticButton>
          <button onClick={onProfile} className="text-sm text-muted transition hover:text-ink">
            view your profile
          </button>
        </div>
      </motion.div>
    </div>
  );
}
