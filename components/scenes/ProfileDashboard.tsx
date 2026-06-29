"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { signOut } from "next-auth/react";
import MagneticButton from "@/components/ui/MagneticButton";
import EmberWallet from "@/components/economy/EmberWallet";
import EchoesList from "@/components/economy/EchoesList";
import AuraRing from "@/components/economy/AuraRing";
import AuraPickerSheet from "@/components/economy/AuraPickerSheet";
import { useEconomy } from "@/lib/economy";
import type { Profile } from "@/lib/types";

export default function ProfileDashboard({
  profile,
  onBack,
}: {
  profile: Profile;
  onBack: () => void;
}) {
  const [auraOpen, setAuraOpen] = useState(false);
  const aura = useEconomy((s) => s.aura);
  const hydrated = useEconomy((s) => s.hydrated);
  const warmthReach = useEconomy((s) => s.warmthReach);
  const lightsGiven = useEconomy((s) => s.lightsGiven);

  return (
    <div className="relative mx-auto min-h-[100dvh] w-full max-w-xl px-6 py-24">
      <div className="absolute right-5 top-5 z-20">
        <EmberWallet />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex flex-col items-center text-center">
          <button onClick={() => setAuraOpen(true)} className="no-tap-highlight" title="Choose your aura">
            <AuraRing auraId={hydrated ? aura : "none"} size={96}>
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 16 }}
                className="grid h-24 w-24 place-items-center rounded-full border border-hair bg-card text-5xl shadow-lift"
              >
                {profile.emoji}
              </motion.div>
            </AuraRing>
          </button>
          <h1 className="mt-5 font-serif-display text-[32px] capitalize text-ink">{profile.words}</h1>
          {profile.describe && (
            <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted">
              &ldquo;{profile.describe}&rdquo;
            </p>
          )}
          <p className="mt-3 text-xs text-muted">
            Anonymous · only this emoji is ever shown to other people
          </p>
          {hydrated && (warmthReach > 0 || lightsGiven > 0) && (
            <p className="mt-2 text-xs text-accent">
              Your warmth has reached {warmthReach} {warmthReach === 1 ? "soul" : "souls"}
              {lightsGiven > 0 &&
                ` · ${lightsGiven} ${lightsGiven === 1 ? "light" : "lights"} left for strangers`}
            </p>
          )}
          <button
            onClick={() => setAuraOpen(true)}
            className="mt-2 text-xs text-muted underline-offset-2 transition hover:text-accent hover:underline"
          >
            choose your aura ✨
          </button>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {profile.domains.map((dsel, i) => (
            <motion.div
              key={dsel.domainId}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="rounded-card border border-hair bg-card p-4 shadow-soft"
            >
              <p className="text-xs text-muted">
                {dsel.domainEmoji} {dsel.domainLabel}
              </p>
              <p className="mt-1 text-[15px] leading-relaxed text-ink">
                {dsel.path.length
                  ? dsel.path.map((p) => `${p.emoji ?? ""} ${p.label}`.trim()).join("  ›  ")
                  : "—"}
              </p>
            </motion.div>
          ))}
        </div>

        <EchoesList />

        <p className="mt-8 text-center text-xs text-muted">
          This profile is permanent — it stays with your account, even after midnight.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <MagneticButton variant="ghost" onClick={onBack}>
            ← Back
          </MagneticButton>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-button border border-hair bg-card px-5 py-2.5 text-sm font-medium text-muted shadow-soft transition hover:border-red-400/40 hover:text-red-400"
          >
            Sign out
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {auraOpen && <AuraPickerSheet emoji={profile.emoji} onClose={() => setAuraOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
