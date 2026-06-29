"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GetEmbersSheet from "./GetEmbersSheet";
import { toast } from "@/components/ui/Toast";
import { useEconomy } from "@/lib/economy";
import { today } from "@/lib/time";

// Give a light to a future stranger. The day's first light is free; after that
// it costs a single ember. `onGiven` lets the room drop a 🕯️ into the transcript.
export default function LeaveALightButton({
  variant = "icon",
  onGiven,
  className = "",
}: {
  variant?: "icon" | "cta";
  onGiven?: () => void;
  className?: string;
}) {
  const giveLight = useEconomy((s) => s.giveLight);
  const lastFreeLight = useEconomy((s) => s.lastFreeLight);
  const hydrated = useEconomy((s) => s.hydrated);
  const [need, setNeed] = useState(false);
  const [lit, setLit] = useState(false);

  const give = () => {
    const how = giveLight();
    if (how === "none") {
      setNeed(true);
      return;
    }
    setLit(true);
    setTimeout(() => setLit(false), 1600);
    toast(how === "free" ? "You left a light for a stranger" : "Light sent · −1 ✦", "🕯️");
    onGiven?.();
  };

  const free = hydrated && lastFreeLight !== today();

  return (
    <>
      {variant === "cta" ? (
        <button
          onClick={give}
          className={`flex items-center gap-2 rounded-button border border-hair bg-card/70 px-5 py-2.5 text-sm font-medium text-ink shadow-soft transition hover:shadow-lift ${className}`}
        >
          <span className="text-lg">🕯️</span>
          leave a light for whoever has a day like tonight
        </button>
      ) : (
        <button
          onClick={give}
          aria-label="leave a light"
          title={free ? "Leave a light (free today)" : "Leave a light · 1 ✦"}
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-xl transition hover:bg-accent-light/60 ${className}`}
        >
          🕯️
        </button>
      )}

      {/* the candle lifts and dissolves upward, like an ember at the burn */}
      <AnimatePresence>
        {lit && (
          <motion.div
            className="pointer-events-none fixed inset-x-0 bottom-24 z-[80] grid place-items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 0, opacity: 1, scale: 1 }}
              animate={{ y: -150, opacity: 0, scale: 1.3 }}
              transition={{ duration: 1.5, ease: "easeIn" }}
              className="text-4xl"
              style={{ filter: "drop-shadow(0 0 14px rgba(253,186,116,0.8))" }}
            >
              🕯️
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{need && <GetEmbersSheet onClose={() => setNeed(false)} />}</AnimatePresence>
    </>
  );
}
