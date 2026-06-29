"use client";

import { motion } from "framer-motion";
import { useEconomy } from "@/lib/economy";

// The kept lines, shown on the permanent profile — the one place things outlive
// midnight. Renders nothing until there's something to show.
export default function EchoesList() {
  const hydrated = useEconomy((s) => s.hydrated);
  const echoes = useEconomy((s) => s.echoes);
  if (!hydrated || echoes.length === 0) return null;

  return (
    <div className="mt-10">
      <p className="mb-3 text-center text-xs font-medium uppercase tracking-[0.18em] text-muted">
        Echoes you kept
      </p>
      <div className="space-y-2">
        {echoes.map((e, i) => (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.4 }}
            className="flex items-start gap-3 rounded-card border border-hair bg-card p-4 shadow-soft"
          >
            <span className="text-lg">{e.emoji}</span>
            <p className="flex-1 text-[15px] leading-relaxed text-ink">&ldquo;{e.text}&rdquo;</p>
          </motion.div>
        ))}
      </div>
      <p className="mt-3 text-center text-[11px] text-muted">
        The rooms burned — these are the lines you chose to keep.
      </p>
    </div>
  );
}
