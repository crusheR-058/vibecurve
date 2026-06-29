"use client";

import Sheet from "./Sheet";
import MagneticButton from "@/components/ui/MagneticButton";
import { toast } from "@/components/ui/Toast";
import { useEconomy } from "@/lib/economy";
import { EMBER_TIERS, PLUS } from "@/lib/economyData";

// Mock purchase + VibeCurve+ upsell. UI only: "buying" simply grants embers.
export default function GetEmbersSheet({ onClose }: { onClose: () => void }) {
  const grant = useEconomy((s) => s.grant);
  const plus = useEconomy((s) => s.plus);
  const setPlus = useEconomy((s) => s.setPlus);

  const buy = (embers: number) => {
    grant(embers);
    toast(`+${embers} ✦ embers — warmth to give`, "✦");
    onClose();
  };
  const join = () => {
    if (plus) return;
    setPlus(true);
    toast("Welcome to VibeCurve+ · 120 ✦ added", "🤍");
    onClose();
  };

  return (
    <Sheet
      onClose={onClose}
      title="Embers"
      subtitle="Warmth you can pass on — spend it on others, never on standing out."
    >
      <div className="grid grid-cols-3 gap-2">
        {EMBER_TIERS.map((t) => (
          <button
            key={t.id}
            onClick={() => buy(t.embers)}
            className={`relative flex flex-col items-center gap-1 rounded-card border bg-card p-3 text-center shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift ${
              t.best ? "border-accent" : "border-hair"
            }`}
          >
            {t.best && (
              <span className="absolute -top-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-white">
                warmest
              </span>
            )}
            <span className="text-xl text-peach">✦</span>
            <span className="font-serif-display text-[22px] leading-none text-ink">{t.embers}</span>
            <span className="text-[11px] text-muted">{t.blurb}</span>
            <span className="mt-1 text-sm font-medium text-ink">{t.price}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-card border border-hair bg-accent-light/20 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-serif-display text-[18px] leading-none text-ink">VibeCurve+</p>
            <p className="mt-1 text-xs text-muted">
              {PLUS.price}
              {PLUS.cadence}
            </p>
          </div>
          <MagneticButton variant={plus ? "soft" : "primary"} onClick={join}>
            {plus ? "You're in 🤍" : "Become a patron"}
          </MagneticButton>
        </div>
        <ul className="mt-3 space-y-1.5">
          {PLUS.perks.map((p) => (
            <li key={p} className="flex items-center gap-2 text-sm text-muted">
              <span className="text-accent">✦</span> {p}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-center text-[11px] leading-relaxed text-muted/80">
        In a real release, part of every ember would fund free lights for people who can&apos;t pay —
        so no one is priced out of being met. This is a demo: nothing is charged.
      </p>
    </Sheet>
  );
}
