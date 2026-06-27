"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Tiny pub/sub toast. Any component can call toast("…") without prop drilling;
// <Toaster /> is mounted once in app/providers.tsx.

interface ToastItem {
  id: number;
  message: string;
  emoji?: string;
}

let listeners: ((t: ToastItem) => void)[] = [];
let counter = 0;

export function toast(message: string, emoji = "🫧") {
  const item: ToastItem = { id: ++counter, message, emoji };
  listeners.forEach((l) => l(item));
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const onToast = (t: ToastItem) => {
      setItems((prev) => [...prev, t]);
      setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== t.id)), 3600);
    };
    listeners.push(onToast);
    return () => {
      listeners = listeners.filter((l) => l !== onToast);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {items.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            className="glass flex items-center gap-2.5 rounded-button border border-hair px-4 py-2.5 shadow-lift"
          >
            <span className="text-base">{t.emoji}</span>
            <span className="text-sm text-ink">{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
