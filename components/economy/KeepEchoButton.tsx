"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import GetEmbersSheet from "./GetEmbersSheet";
import { toast } from "@/components/ui/Toast";
import { useEconomy, type Echo } from "@/lib/economy";
import { ECHO_COST } from "@/lib/economyData";

// Keep one line past the burn. Free + unlimited for VibeCurve+, else a couple
// of embers. Appears on hover of a message row (parent marks the row `group`).
export default function KeepEchoButton({ echo }: { echo: Echo }) {
  const keepEcho = useEconomy((s) => s.keepEcho);
  const echoes = useEconomy((s) => s.echoes);
  const spend = useEconomy((s) => s.spend);
  const plus = useEconomy((s) => s.plus);
  const hydrated = useEconomy((s) => s.hydrated);
  const [need, setNeed] = useState(false);
  const kept = hydrated && echoes.some((x) => x.id === echo.id);

  const keep = () => {
    if (kept) return;
    if (!plus && !spend(ECHO_COST)) {
      setNeed(true);
      return;
    }
    keepEcho(echo);
    toast("Kept — this line survives midnight", "🌌");
  };

  return (
    <>
      <button
        onClick={keep}
        aria-label={kept ? "kept past midnight" : "keep this past midnight"}
        title={kept ? "Kept" : plus ? "Keep this (VibeCurve+)" : `Keep past midnight · ${ECHO_COST} ✦`}
        className={`shrink-0 self-center text-[11px] transition ${
          kept ? "text-accent" : "text-transparent hover:text-accent group-hover:text-muted"
        }`}
      >
        {kept ? "✦ kept" : "✦ keep"}
      </button>
      <AnimatePresence>{need && <GetEmbersSheet onClose={() => setNeed(false)} />}</AnimatePresence>
    </>
  );
}
