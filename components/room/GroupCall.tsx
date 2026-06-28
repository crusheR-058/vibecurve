"use client";

import { AnimatePresence, motion } from "framer-motion";
import { toast } from "@/components/ui/Toast";
import { useGroupCall } from "./useGroupCall";

export default function GroupCall({
  roomId,
  userId,
  emoji,
}: {
  roomId: string;
  userId: string;
  emoji: string;
}) {
  const call = useGroupCall(roomId, userId, emoji);
  if (!call.supported) return null;

  const others = call.participants.filter((p) => !p.isMe);

  const onJoin = async () => {
    const ok = await call.join();
    if (!ok && call.error === "mic") {
      toast("Allow mic access to join the voice room", "🎙️");
    }
  };

  return (
    <div className="pb-3">
      <AnimatePresence mode="wait" initial={false}>
        {!call.inCall ? (
          <motion.button
            key="join"
            type="button"
            onClick={onJoin}
            disabled={call.joining}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex w-full items-center gap-3 rounded-sheet border border-hair bg-card px-4 py-2.5 text-left shadow-soft transition hover:border-accent disabled:opacity-60"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent-light/70 text-lg">
              🎙️
            </span>
            {call.joining ? (
              <span className="text-sm text-muted">Connecting…</span>
            ) : others.length > 0 ? (
              <>
                <div className="flex -space-x-2">
                  {others.slice(0, 4).map((o) => (
                    <span
                      key={o.userId}
                      className="grid h-7 w-7 place-items-center rounded-full border border-hair bg-card text-sm shadow-soft"
                    >
                      {o.emoji}
                    </span>
                  ))}
                </div>
                <span className="text-sm font-medium text-ink">
                  Join voice room
                  <span className="ml-1 font-normal text-muted">· {others.length} here</span>
                </span>
              </>
            ) : (
              <span className="text-sm font-medium text-ink">
                Start a voice room
                <span className="ml-1 font-normal text-muted">· talk, no faces</span>
              </span>
            )}
          </motion.button>
        ) : (
          <motion.div
            key="bar"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-3 rounded-sheet border border-accent/40 bg-card px-3 py-2.5 shadow-soft"
          >
            <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-accent">
              <motion.span
                className="h-2 w-2 rounded-full bg-accent"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              />
              Live
            </span>

            <div className="flex flex-1 items-center gap-1.5 overflow-x-auto">
              {call.participants.map((p) => (
                <div key={p.userId} className="relative shrink-0" title={p.isMe ? "you" : undefined}>
                  <motion.div
                    animate={{ scale: p.speaking ? 1.12 : 1 }}
                    transition={{ type: "spring", stiffness: 320, damping: 18 }}
                    className={`grid h-9 w-9 place-items-center rounded-full text-lg transition-shadow ${
                      p.speaking
                        ? "bg-accent-light shadow-glow ring-2 ring-accent"
                        : p.isMe
                          ? "bg-accent-light ring-1 ring-accent/50"
                          : "border border-hair bg-card"
                    } ${!p.connected && !p.isMe ? "animate-pulse opacity-60" : ""}`}
                  >
                    {p.emoji}
                  </motion.div>
                  {p.isMe && call.muted && (
                    <span className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-card text-[9px] shadow-soft">
                      🔇
                    </span>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={call.toggleMute}
              aria-label={call.muted ? "unmute" : "mute"}
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-base transition ${
                call.muted ? "bg-accent-light/70 text-accent" : "hover:bg-accent-light/60"
              }`}
            >
              {call.muted ? "🔇" : "🎙️"}
            </button>
            <button
              onClick={call.leave}
              className="shrink-0 rounded-full bg-red-500/90 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-500"
            >
              Leave
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
