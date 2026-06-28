"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CountdownRing from "@/components/ui/CountdownRing";
import { toast } from "@/components/ui/Toast";
import StickerArt from "@/components/room/StickerArt";
import MediaTray from "@/components/room/MediaTray";
import VoicePlayer from "@/components/room/VoicePlayer";
import GroupCall from "@/components/room/GroupCall";
import { useVoiceRecorder, type VoiceResult } from "@/components/room/useVoiceRecorder";
import { getSticker } from "@/lib/stickers";
import { MAX_AUDIO_B64 } from "@/lib/voice";
import type { Member, Message, MessageInput, RoomState } from "@/lib/types";

// optimistic messages carry a local blob URL so a voice note plays instantly,
// before the server round-trip makes it fetchable from the media route
type ChatMessage = Message & { localUrl?: string };

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const x = Math.floor(s % 60);
  return `${m}:${String(x).padStart(2, "0")}`;
}

async function blobToBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

// match an optimistic message to its real twin so we can drop the placeholder
function keyOf(m: Message): string {
  if (m.kind === "text") return `t:${m.userId}:${m.text}`;
  if (m.kind === "voice") return `v:${m.userId}:${m.duration}`;
  return `s:${m.userId}:${m.stickerId}`;
}

export default function ParallelRoom({
  roomId,
  userId,
  emoji,
  matchPercent,
  onBurn,
}: {
  roomId: string;
  userId: string;
  emoji: string;
  matchPercent: number;
  onBurn: () => void;
}) {
  const [room, setRoom] = useState<RoomState | null>(null);
  const [text, setText] = useState("");
  const [optimistic, setOptimistic] = useState<ChatMessage[]>([]);
  const [trayOpen, setTrayOpen] = useState(false);
  const [othersTyping, setOthersTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const localUrlsRef = useRef<string[]>([]);
  const rec = useVoiceRecorder(30);

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/room/${roomId}`, { cache: "no-store" });
      if (!res.ok) return;
      const data: RoomState = await res.json();
      setRoom(data);
      setOptimistic((opt) => {
        const kept = opt.filter(
          (o) => !data.messages.some((m) => m.userId === userId && keyOf(m) === keyOf(o)),
        );
        // free blob URLs for placeholders the server has now confirmed
        opt.forEach((o) => {
          if (!kept.includes(o) && o.localUrl) URL.revokeObjectURL(o.localUrl);
        });
        return kept;
      });
    } catch {
      /* keep last state */
    }
  }, [roomId, userId]);

  useEffect(() => {
    poll();
    const id = setInterval(poll, 1200);
    return () => clearInterval(id);
  }, [poll]);

  // release any outstanding blob URLs when leaving the room
  useEffect(() => () => localUrlsRef.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const messages = [...(room?.messages ?? []), ...optimistic] as ChatMessage[];

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length, othersTyping]);

  const sendMessage = useCallback(
    async (input: MessageInput, localUrl?: string) => {
      const temp: ChatMessage = {
        id: `tmp_${Date.now()}_${Math.round(Math.random() * 1e6)}`,
        roomId,
        userId,
        emoji,
        kind: input.kind,
        text: input.text ?? "",
        stickerId: input.stickerId,
        duration: input.duration,
        mime: input.mime,
        ts: Date.now(),
        localUrl,
      };
      setOptimistic((o) => [...o, temp]);
      // others "notice" you
      setOthersTyping(true);
      setTimeout(() => setOthersTyping(false), 2400);
      try {
        await fetch(`/api/room/${roomId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, emoji, ...input }),
        });
        poll();
      } catch {
        toast("Couldn't send that — check your connection", "⚠️");
      }
    },
    [roomId, userId, emoji, poll],
  );

  const sendText = () => {
    const v = text.trim();
    if (!v) return;
    setText("");
    setTrayOpen(false);
    sendMessage({ kind: "text", text: v });
  };

  const sendSticker = (id: string) => {
    const s = getSticker(id);
    if (!s) return;
    setTrayOpen(false);
    sendMessage({ kind: s.kind, stickerId: id });
  };

  const finishVoice = useCallback(
    async (r: VoiceResult) => {
      let audio: string;
      try {
        audio = await blobToBase64(r.blob);
      } catch {
        toast("Couldn't process that note", "🎤");
        return;
      }
      if (audio.length > MAX_AUDIO_B64) {
        toast("That note's a touch long — keep it under 30s", "🎤");
        return;
      }
      const localUrl = URL.createObjectURL(r.blob);
      localUrlsRef.current.push(localUrl);
      sendMessage({ kind: "voice", audio, mime: r.mime, duration: r.duration }, localUrl);
    },
    [sendMessage],
  );

  const onMic = useCallback(async () => {
    if (rec.recording) {
      const r = await rec.stop();
      if (r) finishVoice(r);
    } else {
      setTrayOpen(false);
      const ok = await rec.start();
      if (!ok) toast("Mic unavailable — allow access to send a voice note", "🎤");
    }
  }, [rec, finishVoice]);

  const members: Member[] = room?.members ?? [{ userId, emoji, joinedAt: Date.now() }];
  const others = members.filter((m) => m.userId !== userId);

  return (
    <div className="relative mx-auto flex h-[100dvh] w-full max-w-2xl flex-col px-4 sm:px-6">
      {/* header */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between gap-4 py-4"
      >
        <div>
          <h1 className="font-serif-display text-[22px] leading-none text-ink">Parallel Room</h1>
          <p className="mt-1 text-xs text-muted">
            {matchPercent}% parallel · {members.length} here tonight
          </p>
        </div>
        {room && <CountdownRing expiresAt={room.expiresAt} onExpire={onBurn} size={58} />}
      </motion.header>

      {/* member orbs */}
      <div className="flex items-center gap-2 pb-3">
        {members.map((m, i) => (
          <motion.div
            key={m.userId}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.06, type: "spring", stiffness: 320, damping: 18 }}
            className={`grid h-9 w-9 place-items-center rounded-full text-lg shadow-soft ${
              m.userId === userId ? "bg-accent-light ring-2 ring-accent" : "bg-card border border-hair"
            }`}
            title={m.userId === userId ? "you" : undefined}
          >
            {m.emoji}
          </motion.div>
        ))}
      </div>

      {/* group voice call — peer-to-peer audio, faces stay hidden */}
      <GroupCall roomId={roomId} userId={userId} emoji={emoji} />

      <div className="h-px w-full bg-hair" />

      {/* messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto py-5">
        {!room && <RoomSkeleton />}
        {room && others.length === 0 && <EmptyState />}
        <AnimatePresence initial={false}>
          {messages.map((m) => {
            const mine = m.userId === userId;
            return (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : ""}`}
              >
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-hair bg-card text-sm shadow-soft">
                  {m.emoji}
                </div>

                {m.kind === "text" && (
                  <div
                    className={`max-w-[76%] rounded-card px-4 py-2.5 text-[15px] leading-relaxed shadow-soft ${
                      mine
                        ? "rounded-br-md bg-accent text-white"
                        : "rounded-bl-md border border-hair bg-card text-ink"
                    }`}
                  >
                    {m.text}
                  </div>
                )}

                {(m.kind === "sticker" || m.kind === "gif") && m.stickerId && (
                  <div className="px-1 py-1">
                    <StickerArt id={m.stickerId} size={m.kind === "gif" ? 112 : 96} />
                  </div>
                )}

                {m.kind === "voice" && (
                  <div className="max-w-[80%]">
                    <VoicePlayer
                      mine={mine}
                      duration={m.duration ?? 0}
                      src={m.localUrl ?? `/api/room/${roomId}/media?m=${encodeURIComponent(m.id)}`}
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        <AnimatePresence>
          {othersTyping && others.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="grid h-7 w-7 place-items-center rounded-full border border-hair bg-card text-sm shadow-soft">
                {others[0].emoji}
              </div>
              <div className="flex gap-1 rounded-card border border-hair bg-card px-4 py-3 shadow-soft">
                {[0, 1, 2].map((d) => (
                  <motion.span
                    key={d}
                    className="h-1.5 w-1.5 rounded-full bg-muted"
                    animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity, delay: d * 0.15 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* composer */}
      <div className="relative pb-5 pt-2">
        <AnimatePresence>
          {trayOpen && !rec.recording && (
            <MediaTray onEmoji={(e) => setText((t) => t + e)} onSticker={sendSticker} />
          )}
        </AnimatePresence>

        {rec.recording ? (
          <div className="flex items-center gap-3 rounded-sheet border border-accent/40 bg-card p-2.5 shadow-soft">
            <button
              onClick={rec.cancel}
              aria-label="cancel recording"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted transition hover:bg-hair/60"
            >
              ✕
            </button>
            <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-red-500" />
            <span className="shrink-0 text-sm tabular-nums text-ink">{fmt(rec.elapsed)}</span>
            <div className="flex flex-1 items-center justify-center gap-[3px] overflow-hidden">
              {Array.from({ length: 28 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="w-[3px] rounded-full bg-accent/70"
                  animate={{ height: [5, 15, 5] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.05, ease: "easeInOut" }}
                />
              ))}
            </div>
            <span className="shrink-0 text-[11px] text-muted">/ 0:30</span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onMic}
              aria-label="send voice note"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-white shadow-glow"
            >
              ↑
            </motion.button>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-sheet border border-hair bg-card p-2 shadow-soft">
            <button
              onClick={() => setTrayOpen((o) => !o)}
              aria-label="stickers and gifs"
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-xl transition hover:bg-accent-light/60 ${
                trayOpen ? "bg-accent-light/70" : ""
              }`}
            >
              😊
            </button>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendText()}
              placeholder="say something gentle…"
              maxLength={500}
              className="flex-1 bg-transparent px-1 text-[15px] text-ink outline-none placeholder:text-muted/70"
            />
            {rec.supported && (
              <button
                onClick={onMic}
                aria-label="record voice note"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-xl transition hover:bg-accent-light/60"
              >
                🎤
              </button>
            )}
            <motion.button
              onClick={sendText}
              whileTap={{ scale: 0.9 }}
              disabled={!text.trim()}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-white shadow-glow transition disabled:opacity-30"
              aria-label="send"
            >
              ↑
            </motion.button>
          </div>
        )}

        <button
          onClick={onBurn}
          className="mt-3 block w-full text-center text-xs text-muted/80 transition hover:text-accent"
        >
          let tonight end ›
        </button>
      </div>
    </div>
  );
}

function RoomSkeleton() {
  const rows = [
    { mine: false, w: "60%" },
    { mine: true, w: "45%" },
    { mine: false, w: "72%" },
  ];
  return (
    <div className="space-y-3">
      {rows.map((r, i) => (
        <div key={i} className={`flex items-end gap-2 ${r.mine ? "flex-row-reverse" : ""}`}>
          <div className="h-7 w-7 shrink-0 rounded-full bg-card shadow-soft" />
          <div
            className="relative h-10 overflow-hidden rounded-card bg-card shadow-soft shimmer"
            style={{ width: r.w }}
          />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="grid place-items-center py-10 text-center"
    >
      <div className="mb-3 text-3xl">🫧</div>
      <p className="max-w-xs text-sm leading-relaxed text-muted">
        This room is yours for a moment. Others who felt today like you will drift in before midnight.
      </p>
    </motion.div>
  );
}
