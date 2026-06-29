"use client";

import { motion } from "framer-motion";
import { WARMTH_TIERS } from "@/lib/economyData";

// The tier chooser that floats by a message when you warm it. Presentational —
// the parent handles spending embers, the halo, and the toast.
export default function WarmthPopover({
  onPick,
  onClose,
  className = "",
}: {
  onPick: (id: string, embers: number) => void;
  onClose: () => void;
  className?: string;
}) {
  return (
    <>
      <button aria-label="close" onClick={onClose} className="fixed inset-0 z-30 cursor-default" />
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 6, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
        className={`absolute z-40 flex gap-1 rounded-sheet border border-hair bg-card p-1.5 shadow-lift ${className}`}
      >
        {WARMTH_TIERS.map((t) => (
          <button
            key={t.id}
            onClick={() => onPick(t.id, t.embers)}
            title={`${t.label} · ${t.blurb}`}
            className="flex flex-col items-center gap-0.5 rounded-card px-2.5 py-1.5 transition hover:bg-accent-light/40"
          >
            <span className="text-lg">{t.glyph}</span>
            <span className="text-[10px] font-medium text-muted">✦{t.embers}</span>
          </button>
        ))}
      </motion.div>
    </>
  );
}
