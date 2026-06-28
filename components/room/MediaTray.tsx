"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import StickerArt from "./StickerArt";
import { GIF_PACK, STICKER_PACK } from "@/lib/stickers";

const QUICK_EMOJI = [
  "💜", "🫶", "🌙", "🍀", "🥹", "✨", "🌊", "☕", "😮‍💨", "🌿", "🤍", "🌧️", "🔆", "🫂",
];

type Tab = "stickers" | "gifs" | "emoji";

export default function MediaTray({
  onEmoji,
  onSticker,
}: {
  onEmoji: (emoji: string) => void;
  onSticker: (id: string) => void;
}) {
  const [tab, setTab] = useState<Tab>("stickers");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      className="absolute bottom-[72px] left-0 right-0 z-20 rounded-sheet border border-hair bg-card p-2 shadow-lift"
    >
      <div className="mb-2 flex gap-1">
        {(["stickers", "gifs", "emoji"] as Tab[]).map((t) => (
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
    </motion.div>
  );
}
