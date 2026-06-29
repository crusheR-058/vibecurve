"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import GetEmbersSheet from "./GetEmbersSheet";
import { toast } from "@/components/ui/Toast";
import { useEconomy } from "@/lib/economy";
import { HOLD_COST } from "@/lib/economyData";

// A collective gift: push the burn back by five minutes for everyone in the
// room. The warmth goes to the room, never to your own standing.
export default function HoldRoomButton({
  onHold,
  className = "",
}: {
  onHold: () => void;
  className?: string;
}) {
  const spend = useEconomy((s) => s.spend);
  const [need, setNeed] = useState(false);

  const hold = () => {
    if (!spend(HOLD_COST)) {
      setNeed(true);
      return;
    }
    onHold();
    toast("You held the room open — five more minutes for everyone", "🔥");
  };

  return (
    <>
      <button
        onClick={hold}
        title={`Give everyone five more minutes · ${HOLD_COST} ✦`}
        className={`flex items-center gap-1.5 rounded-full border border-hair bg-card/70 px-3 py-1.5 text-xs text-muted shadow-soft transition hover:border-peach hover:text-ink ${className}`}
      >
        🔥 hold the room · ✦{HOLD_COST}
      </button>
      <AnimatePresence>{need && <GetEmbersSheet onClose={() => setNeed(false)} />}</AnimatePresence>
    </>
  );
}
