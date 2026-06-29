"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Sheet from "./Sheet";
import GetEmbersSheet from "./GetEmbersSheet";
import AuraRing from "./AuraRing";
import { toast } from "@/components/ui/Toast";
import { useEconomy } from "@/lib/economy";
import { AURAS } from "@/lib/economyData";

export default function AuraPickerSheet({
  emoji,
  onClose,
}: {
  emoji: string;
  onClose: () => void;
}) {
  const current = useEconomy((s) => s.aura);
  const setAura = useEconomy((s) => s.setAura);
  const spend = useEconomy((s) => s.spend);
  const plus = useEconomy((s) => s.plus);
  const [need, setNeed] = useState(false);

  const pick = (id: string, price: number, plusOnly?: boolean) => {
    if (id === current) return;
    if (plusOnly && !plus) {
      setNeed(true);
      return;
    }
    if (price > 0 && !spend(price)) {
      setNeed(true);
      return;
    }
    setAura(id);
    toast("Aura set — your vibe, just for tonight", "✨");
  };

  return (
    <>
      <Sheet
        onClose={onClose}
        title="Your aura"
        subtitle="A vibe around your emoji. It can't become a flex — you're anonymous, and it resets with the night."
      >
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {AURAS.map((a) => (
            <button
              key={a.id}
              onClick={() => pick(a.id, a.price, a.plusOnly)}
              className={`flex flex-col items-center gap-2 rounded-card border p-3 transition ${
                a.id === current ? "border-accent bg-accent-light/20" : "border-hair hover:bg-accent-light/10"
              }`}
            >
              <AuraRing auraId={a.id} size={40}>
                <span className="grid h-9 w-9 place-items-center rounded-full border border-hair bg-card text-lg">
                  {emoji}
                </span>
              </AuraRing>
              <span className="text-[11px] font-medium text-ink">{a.label}</span>
              <span className="text-[10px] text-muted">
                {a.plusOnly ? "VibeCurve+" : a.price === 0 ? "free" : `✦${a.price}`}
              </span>
            </button>
          ))}
        </div>
      </Sheet>
      <AnimatePresence>{need && <GetEmbersSheet onClose={() => setNeed(false)} />}</AnimatePresence>
    </>
  );
}
