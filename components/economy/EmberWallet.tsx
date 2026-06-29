"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useEconomy } from "@/lib/economy";
import GetEmbersSheet from "./GetEmbersSheet";

// The ✦ balance chip. Renders nothing until the store hydrates (matches the
// CountdownRing / AuthButton client-only pattern, so there's no SSR mismatch).
export default function EmberWallet({ className = "" }: { className?: string }) {
  const hydrated = useEconomy((s) => s.hydrated);
  const embers = useEconomy((s) => s.embers);
  const [open, setOpen] = useState(false);

  if (!hydrated) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={`${embers} embers — get more`}
        className={`glass no-tap-highlight flex items-center gap-1.5 rounded-button border border-hair px-3 py-1.5 text-sm shadow-soft transition hover:shadow-lift ${className}`}
      >
        <span className="text-peach">✦</span>
        <motion.span
          key={embers}
          initial={{ y: -6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
          className="font-medium tabular-nums text-ink"
        >
          {embers}
        </motion.span>
      </button>
      <AnimatePresence>{open && <GetEmbersSheet onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}
