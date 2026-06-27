"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getTheme, toggleTheme, type Theme } from "@/lib/theme";

/**
 * Sun/moon theme switch. Mount-gated so the icon never mismatches the
 * pre-paint class (the actual theme is decided by the inline script at runtime).
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(getTheme());
    setMounted(true);
  }, []);

  return (
    <button
      onClick={() => setTheme(toggleTheme())}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative grid h-9 w-9 place-items-center overflow-hidden rounded-full border border-hair bg-card/60 text-ink transition hover:bg-card ${className}`}
    >
      {mounted && (
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme}
            initial={{ opacity: 0, rotate: -50, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 50, scale: 0.5 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-[15px]"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </motion.span>
        </AnimatePresence>
      )}
    </button>
  );
}
