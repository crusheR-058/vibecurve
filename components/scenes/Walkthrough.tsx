"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MagneticButton from "@/components/ui/MagneticButton";
import { BRANCH_CARD, cardsForTrack, type FlashCard, type FlashOption } from "@/lib/walkthrough";
import { deriveEmoji } from "@/lib/profileEmoji";
import type { Profile, ProfileAnswer } from "@/lib/types";

type Phase = "words" | "cards" | "describe" | "saving";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Walkthrough({
  onComplete,
}: {
  onComplete: (profile: Profile) => void;
}) {
  const [phase, setPhase] = useState<Phase>("words");
  const [words, setWords] = useState("");
  const [track, setTrack] = useState("");
  const [queue, setQueue] = useState<FlashCard[]>([BRANCH_CARD]);
  const [ci, setCi] = useState(0);
  const [answers, setAnswers] = useState<ProfileAnswer[]>([]);
  const [describe, setDescribe] = useState("");
  const [error, setError] = useState<string | null>(null);

  const total = 1 + queue.length + 1; // words + cards + describe
  const stepIndex = phase === "words" ? 0 : phase === "describe" ? total - 1 : 1 + ci;
  const liveEmoji = words.trim() ? deriveEmoji(words) : "✨";

  const pickOption = (card: FlashCard, opt: FlashOption) => {
    const ans: ProfileAnswer = { id: card.id, q: card.q, a: opt.label, emoji: opt.emoji };
    setAnswers((prev) => [...prev.filter((a) => a.id !== card.id), ans]);

    if (card.id === BRANCH_CARD.id) {
      setTrack(opt.value);
      setQueue([BRANCH_CARD, ...cardsForTrack(opt.value)]);
      setCi(1);
      return;
    }
    if (ci + 1 < queue.length) setCi(ci + 1);
    else setPhase("describe");
  };

  const finish = async (skip: boolean) => {
    setPhase("saving");
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          words: words.trim(),
          track,
          answers,
          describe: skip ? undefined : describe.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      onComplete(data.profile as Profile);
    } catch {
      setError("Couldn't save that — please try again.");
      setPhase("describe");
    }
  };

  const card = queue[ci];

  return (
    <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col items-center justify-center px-6 py-16">
      {/* progress */}
      <div className="absolute top-8 flex gap-1.5">
        {Array.from({ length: total }).map((_, idx) => (
          <motion.span
            key={idx}
            className={`h-1.5 rounded-full ${idx <= stepIndex ? "bg-accent" : "bg-hair"}`}
            animate={{ width: idx === stepIndex ? 26 : 8 }}
            transition={{ duration: 0.4 }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── Q1: define in 1–2 words ── */}
        {phase === "words" && (
          <motion.div
            key="words"
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -24, filter: "blur(6px)" }}
            transition={{ duration: 0.5, ease: EASE }}
            className="flex w-full flex-col items-center text-center"
          >
            <motion.div
              key={liveEmoji}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-6 grid h-20 w-20 place-items-center rounded-full border border-hair bg-card text-4xl shadow-soft"
            >
              {liveEmoji}
            </motion.div>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-accent">
              First things first
            </p>
            <h2 className="font-serif-display text-[30px] leading-tight text-ink sm:text-[36px]">
              Define yourself in one or two words.
            </h2>
            <input
              autoFocus
              value={words}
              onChange={(e) => setWords(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && words.trim() && setPhase("cards")}
              maxLength={40}
              placeholder="e.g. chaotic dreamer"
              className="mt-7 w-full rounded-input border border-hair bg-card px-5 py-3.5 text-center text-[17px] text-ink shadow-soft outline-none transition focus:border-accent placeholder:text-muted/60"
            />
            <p className="mt-3 text-xs text-muted">This shapes your profile emoji. Required.</p>
            <MagneticButton
              onClick={() => words.trim() && setPhase("cards")}
              className={`mt-7 ${words.trim() ? "" : "pointer-events-none opacity-40"}`}
            >
              Continue
              <span aria-hidden>→</span>
            </MagneticButton>
          </motion.div>
        )}

        {/* ── flashcards (branch + track + common) ── */}
        {phase === "cards" && card && (
          <motion.div
            key={`card-${card.id}`}
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -24, filter: "blur(6px)" }}
            transition={{ duration: 0.45, ease: EASE }}
            className="flex w-full flex-col items-center text-center"
          >
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-accent">
              {ci === 0 ? "Pick your energy" : `A little more — ${ci}/${queue.length - 1}`}
            </p>
            <h2 className="mb-8 font-serif-display text-[28px] leading-tight text-ink sm:text-[34px]">
              {card.q}
            </h2>
            <div className="grid w-full grid-cols-2 gap-3">
              {card.options.map((opt, i) => (
                <motion.button
                  key={opt.value}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => pickOption(card, opt)}
                  className="flex flex-col items-center gap-2 rounded-card border border-hair bg-card p-5 shadow-soft transition hover:border-accent hover:shadow-lift"
                >
                  <span className="text-3xl">{opt.emoji}</span>
                  <span className="text-[15px] font-medium text-ink">{opt.label}</span>
                </motion.button>
              ))}
            </div>
            <p className="mt-6 text-xs text-muted">Tap one — these build your dashboard. Required.</p>
          </motion.div>
        )}

        {/* ── describe in one sentence (skippable) ── */}
        {phase === "describe" && (
          <motion.div
            key="describe"
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -24, filter: "blur(6px)" }}
            transition={{ duration: 0.5, ease: EASE }}
            className="flex w-full flex-col items-center text-center"
          >
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-accent">
              Last one
            </p>
            <h2 className="font-serif-display text-[30px] leading-tight text-ink sm:text-[36px]">
              Describe yourself in one sentence.
            </h2>
            <textarea
              autoFocus
              value={describe}
              onChange={(e) => setDescribe(e.target.value)}
              maxLength={200}
              rows={3}
              placeholder="say it however feels true…"
              className="mt-7 w-full resize-none rounded-card border border-hair bg-card px-5 py-4 text-[16px] leading-relaxed text-ink shadow-soft outline-none transition focus:border-accent placeholder:text-muted/60"
            />
            {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
            <MagneticButton onClick={() => finish(false)} className="mt-7">
              Save my profile
              <span aria-hidden>→</span>
            </MagneticButton>
            <button
              onClick={() => finish(true)}
              className="mt-4 text-sm text-muted transition hover:text-ink"
            >
              Skip
            </button>
          </motion.div>
        )}

        {/* ── saving ── */}
        {phase === "saving" && (
          <motion.div
            key="saving"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1], rotate: [0, 8, -8, 0] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="grid h-20 w-20 place-items-center rounded-full border border-hair bg-card text-4xl shadow-soft"
            >
              {liveEmoji}
            </motion.div>
            <p className="mt-6 text-[15px] text-muted">Saving your profile…</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
