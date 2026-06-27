"use client";

import { motion } from "framer-motion";
import MagneticButton from "@/components/ui/MagneticButton";
import type { Profile } from "@/lib/types";

export default function ProfileDashboard({
  profile,
  name,
  onBack,
}: {
  profile: Profile;
  name?: string | null;
  onBack: () => void;
}) {
  return (
    <div className="relative mx-auto min-h-[100dvh] w-full max-w-xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 16 }}
            className="grid h-24 w-24 place-items-center rounded-full border border-hair bg-card text-5xl shadow-lift"
          >
            {profile.emoji}
          </motion.div>
          <h1 className="mt-5 font-serif-display text-[32px] capitalize text-ink">{profile.words}</h1>
          {profile.describe && (
            <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted">
              &ldquo;{profile.describe}&rdquo;
            </p>
          )}
          {name && <p className="mt-3 text-xs text-muted">{name}</p>}
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {profile.answers.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="rounded-card border border-hair bg-card p-4 shadow-soft"
            >
              <p className="text-xs text-muted">{a.q}</p>
              <p className="mt-1 text-[15px] text-ink">
                <span className="mr-1.5">{a.emoji}</span>
                {a.a}
              </p>
            </motion.div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted">
          This profile is permanent — it stays with your account, even after midnight.
        </p>
        <div className="mt-6 flex justify-center">
          <MagneticButton variant="ghost" onClick={onBack}>
            ← Back
          </MagneticButton>
        </div>
      </motion.div>
    </div>
  );
}
