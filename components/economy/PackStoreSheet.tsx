"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Sheet from "./Sheet";
import GetEmbersSheet from "./GetEmbersSheet";
import StickerArt from "@/components/room/StickerArt";
import { toast } from "@/components/ui/Toast";
import { useEconomy } from "@/lib/economy";
import { PACKS } from "@/lib/economyData";

// The vibe-pack gallery. Unlocking spends embers (UI only) and is permanent —
// packs live on past midnight, like the profile.
export default function PackStoreSheet({ onClose }: { onClose: () => void }) {
  const owned = useEconomy((s) => s.ownedPacks);
  const spend = useEconomy((s) => s.spend);
  const unlockPack = useEconomy((s) => s.unlockPack);
  const [needEmbers, setNeedEmbers] = useState(false);

  const unlock = (id: string, price: number) => {
    if (owned.includes(id)) return;
    if (!spend(price)) {
      setNeedEmbers(true);
      return;
    }
    unlockPack(id);
    toast("Pack unlocked — say it with art", "🎨");
  };

  return (
    <>
      <Sheet
        onClose={onClose}
        title="Vibe Packs"
        subtitle="Hand-drawn art for what words miss. Yours to keep — use them in any room."
      >
        <div className="space-y-4">
          {PACKS.map((p) => {
            const has = owned.includes(p.id);
            return (
              <div key={p.id} className="rounded-card border border-hair bg-card p-4 shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-serif-display text-[19px] leading-none text-ink">{p.name}</p>
                    <p className="mt-1.5 max-w-xs text-[13px] leading-relaxed text-muted">{p.blurb}</p>
                  </div>
                  {has ? (
                    <span className="shrink-0 rounded-full bg-accent-light/50 px-3 py-1 text-xs font-medium text-accent">
                      owned
                    </span>
                  ) : (
                    <button
                      onClick={() => unlock(p.id, p.price)}
                      className="shrink-0 rounded-button bg-accent px-3 py-1.5 text-sm font-medium text-white shadow-glow transition hover:brightness-110"
                    >
                      ✦ {p.price}
                    </button>
                  )}
                </div>
                <div className={`mt-3 flex gap-1 overflow-x-auto pb-1 ${has ? "" : "opacity-60"}`}>
                  {p.stickerIds.slice(0, 6).map((sid) => (
                    <div key={sid} className="shrink-0">
                      <StickerArt id={sid} size={52} />
                    </div>
                  ))}
                  {p.stickerIds.length > 6 && (
                    <div className="grid shrink-0 place-items-center px-2 text-xs text-muted">
                      +{p.stickerIds.length - 6}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-center text-[11px] leading-relaxed text-muted/80">
          In a real release, artists would keep most of every unlock. This is a demo: nothing is
          charged.
        </p>
      </Sheet>
      <AnimatePresence>
        {needEmbers && <GetEmbersSheet onClose={() => setNeedEmbers(false)} />}
      </AnimatePresence>
    </>
  );
}
