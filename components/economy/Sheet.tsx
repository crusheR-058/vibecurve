"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

// Shared bottom-sheet shell for the economy surfaces (Get embers, Pack store,
// Aura picker). Slides up on mobile, centers as a dialog on desktop. Parent
// renders it inside <AnimatePresence> and owns the open flag.

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Sheet({
  onClose,
  title,
  subtitle,
  children,
  maxW = "max-w-md",
}: {
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  maxW?: string;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        aria-label="close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/40 backdrop-blur-sm"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        initial={{ y: "100%", opacity: 0.6 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0.6 }}
        transition={{ duration: 0.5, ease: EASE }}
        className={`relative z-10 max-h-[88dvh] w-full overflow-y-auto rounded-t-sheet border border-hair bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-lift sm:rounded-sheet sm:pb-5 ${maxW}`}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-hair sm:hidden" />
        {title && (
          <div className="mb-4 text-center">
            <h2 className="font-serif-display text-[24px] leading-tight text-ink">{title}</h2>
            {subtitle && <p className="mx-auto mt-1 max-w-xs text-sm leading-relaxed text-muted">{subtitle}</p>}
          </div>
        )}
        {children}
      </motion.div>
    </motion.div>
  );
}
