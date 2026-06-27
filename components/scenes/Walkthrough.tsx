"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MagneticButton from "@/components/ui/MagneticButton";
import { DOMAINS, childrenAt, type Domain, type FlashNode } from "@/lib/domains";
import { deriveEmoji } from "@/lib/profileEmoji";
import type { DomainSelection, Profile } from "@/lib/types";

type Phase = "words" | "domains" | "describe" | "saving";
const EASE = [0.22, 1, 0.36, 1] as const;
const NEEDED = 3; // domains to pick

export default function Walkthrough({
  onComplete,
}: {
  onComplete: (profile: Profile) => void;
}) {
  const [phase, setPhase] = useState<Phase>("words");
  const [words, setWords] = useState("");
  const [selections, setSelections] = useState<DomainSelection[]>([]);
  const [active, setActive] = useState<Domain | null>(null);
  const [path, setPath] = useState<FlashNode[]>([]);
  const [describe, setDescribe] = useState("");
  const [error, setError] = useState<string | null>(null);

  const liveEmoji = words.trim() ? deriveEmoji(words) : "✨";
  const stepIndex =
    phase === "words" ? 0 : phase === "describe" ? NEEDED + 1 : selections.length + 1;
  const total = NEEDED + 2;

  const pickedIds = new Set(selections.map((s) => s.domainId));

  const completeDomain = (domain: Domain, finalPath: FlashNode[]) => {
    const sel: DomainSelection = {
      domainId: domain.id,
      domainLabel: domain.label,
      domainEmoji: domain.emoji,
      path: finalPath.map((nd) => ({ id: nd.id, label: nd.label, emoji: nd.emoji })),
    };
    const next = [...selections, sel];
    setSelections(next);
    setActive(null);
    setPath([]);
    if (next.length >= NEEDED) setPhase("describe");
  };

  const pickNode = (node: FlashNode) => {
    if (!active) return;
    const nextPath = [...path, node];
    if (node.children && node.children.length) setPath(nextPath);
    else completeDomain(active, nextPath); // leaf → done with this domain
  };

  const goBack = () => {
    if (path.length > 0) setPath(path.slice(0, -1));
    else setActive(null);
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
          domains: selections,
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

  const cards = active ? childrenAt(active, path) : [];

  return (
    <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-2xl flex-col items-center justify-center px-6 py-16">
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
        {/* ── define in 1–2 words ── */}
        {phase === "words" && (
          <motion.div
            key="words"
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -24, filter: "blur(6px)" }}
            transition={{ duration: 0.5, ease: EASE }}
            className="flex w-full max-w-lg flex-col items-center text-center"
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
              onKeyDown={(e) => e.key === "Enter" && words.trim() && setPhase("domains")}
              maxLength={40}
              placeholder="e.g. chaotic dreamer"
              className="mt-7 w-full rounded-input border border-hair bg-card px-5 py-3.5 text-center text-[17px] text-ink shadow-soft outline-none transition focus:border-accent placeholder:text-muted/60"
            />
            <p className="mt-3 text-xs text-muted">This shapes your profile emoji. Required.</p>
            <MagneticButton
              onClick={() => words.trim() && setPhase("domains")}
              className={`mt-7 ${words.trim() ? "" : "pointer-events-none opacity-40"}`}
            >
              Continue
              <span aria-hidden>→</span>
            </MagneticButton>
          </motion.div>
        )}

        {/* ── domains: pick + branch ── */}
        {phase === "domains" && (
          <motion.div
            key={active ? `branch-${active.id}-${path.length}` : "grid"}
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -24, filter: "blur(6px)" }}
            transition={{ duration: 0.4, ease: EASE }}
            className="flex w-full flex-col items-center text-center"
          >
            {!active ? (
              <>
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-accent">
                  Pick {NEEDED} things you&apos;re into · {selections.length}/{NEEDED}
                </p>
                <h2 className="mb-7 font-serif-display text-[26px] leading-tight text-ink sm:text-[32px]">
                  What are you into? Pick one to branch in.
                </h2>
                {selections.length > 0 && (
                  <div className="mb-6 flex flex-wrap justify-center gap-2">
                    {selections.map((s) => (
                      <span
                        key={s.domainId}
                        className="rounded-full bg-accent-light/60 px-3 py-1 text-xs text-ink"
                      >
                        {s.domainEmoji} {s.path.map((p) => p.label).join(" › ") || s.domainLabel}
                      </span>
                    ))}
                  </div>
                )}
                <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
                  {DOMAINS.map((d, i) => {
                    const taken = pickedIds.has(d.id);
                    return (
                      <motion.button
                        key={d.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: taken ? 0.35 : 1, y: 0 }}
                        transition={{ delay: i * 0.03, duration: 0.35 }}
                        whileHover={taken ? undefined : { y: -4 }}
                        whileTap={taken ? undefined : { scale: 0.97 }}
                        disabled={taken}
                        onClick={() => {
                          setActive(d);
                          setPath([]);
                        }}
                        className="flex flex-col items-center gap-2 rounded-card border border-hair bg-card p-4 shadow-soft transition enabled:hover:border-accent enabled:hover:shadow-lift disabled:cursor-not-allowed"
                      >
                        <span className="text-3xl">{d.emoji}</span>
                        <span className="text-[13px] font-medium leading-tight text-ink">
                          {d.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={goBack}
                  className="mb-4 self-start text-sm text-muted transition hover:text-ink"
                >
                  ← back
                </button>
                {/* breadcrumb */}
                <p className="mb-3 max-w-md text-xs text-muted">
                  <span className="text-accent">{active.emoji} {active.label}</span>
                  {path.map((nd) => (
                    <span key={nd.id}> › {nd.label}</span>
                  ))}
                </p>
                <h2 className="mb-7 font-serif-display text-[26px] leading-tight text-ink sm:text-[32px]">
                  {path.length === 0 ? `Which ${active.label.toLowerCase()}?` : "Go deeper — or stop here."}
                </h2>
                <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
                  {cards.map((c, i) => (
                    <motion.button
                      key={c.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.35 }}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => pickNode(c)}
                      className="flex flex-col items-center gap-2 rounded-card border border-hair bg-card p-4 shadow-soft transition hover:border-accent hover:shadow-lift"
                    >
                      <span className="text-3xl">{c.emoji ?? "•"}</span>
                      <span className="text-[13px] font-medium leading-tight text-ink">
                        {c.label}
                      </span>
                      {c.children && c.children.length > 0 && (
                        <span className="text-[10px] text-muted">tap to go deeper →</span>
                      )}
                    </motion.button>
                  ))}
                </div>
                {path.length >= 1 && (
                  <button
                    onClick={() => completeDomain(active, path)}
                    className="mt-6 rounded-button border border-accent/40 bg-accent-light/40 px-5 py-2.5 text-sm font-medium text-accent transition hover:bg-accent-light/70"
                  >
                    ✓ This is me — stop here
                  </button>
                )}
              </>
            )}
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
            className="flex w-full max-w-lg flex-col items-center text-center"
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
          <motion.div key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center">
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
