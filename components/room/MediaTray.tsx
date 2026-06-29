"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import StickerArt from "./StickerArt";
import PackStoreSheet from "@/components/economy/PackStoreSheet";
import { GIF_PACK, STICKER_PACK } from "@/lib/stickers";
import { PACKS } from "@/lib/economyData";
import { useEconomy } from "@/lib/economy";

const QUICK_EMOJI = [
  "💜", "🫶", "🌙", "🍀", "🥹", "✨", "🌊", "☕", "😮‍💨", "🌿", "🤍", "🌧️", "🔆", "🫂",
];

type Tab = "stickers" | "packs" | "gifs" | "emoji";

export default function MediaTray({
  onEmoji,
  onSticker,
}: {
  onEmoji: (emoji: string) => void;
  onSticker: (id: string) => void;
}) {
  const [tab, setTab] = useState<Tab>("stickers");
  const [store, setStore] = useState(false);
  const owned = useEconomy((s) => s.ownedPacks);
  const ownedPacks = PACKS.filter((p) => owned.includes(p.id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      className="absolute bottom-[72px] left-0 right-0 z-20 rounded-sheet border border-hair bg-card p-2 shadow-lift"
    >
      <div className="mb-2 flex gap-1">
        {(["stickers", "packs", "gifs", "emoji"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition ${
              tab === t ? "bg-accent text-white" : "text-muted hover:bg-accent-light/50"
            }`}
          >
            {t === "gifs" ? "GIFs" : t}
          </button>
        ))}
      </div>

      <div className="max-h-[232px] overflow-y-auto p-1">
        {tab === "emoji" ? (
          <div className="grid grid-cols-7 gap-1">
            {QUICK_EMOJI.map((e) => (
              <button
                key={e}
                onClick={() => onEmoji(e)}
                className="grid h-10 w-10 place-items-center rounded-full text-xl transition hover:bg-accent-light/60"
              >
                {e}
              </button>
            ))}
          </div>
        ) : tab === "packs" ? (
          <div className="space-y-3">
            {ownedPacks.map((p) => (
              <div key={p.id}>
                <p className="mb-1 px-1 text-[11px] font-medium uppercase tracking-wide text-muted">
                  {p.name}
                </p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {p.stickerIds.map((sid) => (
                    <button
                      key={sid}
                      onClick={() => onSticker(sid)}
                      className="grid place-items-center rounded-card border border-transparent p-2 transition hover:border-hair hover:bg-accent-light/30"
                    >
                      <StickerArt id={sid} size={64} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={() => setStore(true)}
              className="flex w-full items-center justify-center gap-2 rounded-card border border-dashed border-hair py-3 text-sm text-muted transition hover:border-accent hover:text-accent"
            >
              <span className="text-peach">✦</span>
              {ownedPacks.length ? "Get more vibe packs" : "Unlock vibe packs — say it with art"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {(tab === "stickers" ? STICKER_PACK : GIF_PACK).map((s) => (
              <button
                key={s.id}
                onClick={() => onSticker(s.id)}
                title={s.label}
                aria-label={s.label}
                className="grid place-items-center rounded-card border border-transparent p-2 transition hover:border-hair hover:bg-accent-light/30"
              >
                <StickerArt id={s.id} size={tab === "stickers" ? 64 : 80} />
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {store && <PackStoreSheet onClose={() => setStore(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}
