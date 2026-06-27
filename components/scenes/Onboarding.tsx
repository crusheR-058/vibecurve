"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedWave from "@/components/ui/AnimatedWave";
import MagneticButton from "@/components/ui/MagneticButton";
import { EMOJI_CHOICES, getEmoji, setEmoji } from "@/lib/session";

interface Step {
  key: string;
  eyebrow: string;
  title: React.ReactNode;
  body?: React.ReactNode;
  visual: React.ReactNode;
}

function CurveGlyph() {
  return (
    <div className="relative h-44 w-full max-w-sm">
      <AnimatedWave width={420} height={170} className="h-full w-full" points={[3, 7, 4.5, 8.5, 6]} />
    </div>
  );
}

function RoomGlyph() {
  const orbs = ["🌙", "🍀", "🎈", "🦊", "🐳"];
  return (
    <div className="relative grid h-44 w-full max-w-sm place-items-center">
      <div className="flex items-center gap-3">
        {orbs.map((o, i) => (
          <motion.div
            key={o}
            className="grid h-12 w-12 place-items-center rounded-full border border-hair bg-card text-2xl shadow-soft"
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: [0, -6, 0], opacity: 1 }}
            transition={{
              y: { duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut" },
              opacity: { delay: i * 0.12, duration: 0.5 },
            }}
          >
            {o}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PrivacyGlyph({ emoji }: { emoji: string }) {
  return (
    <div className="grid h-44 w-full max-w-sm place-items-center">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 16 }}
        className="grid h-24 w-24 place-items-center rounded-full border border-hair bg-card text-5xl shadow-lift"
      >
        {emoji}
      </motion.div>
    </div>
  );
}

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const [emoji, setEmojiState] = useState<string>(() => getEmoji());

  const reshuffle = () => {
    const next = EMOJI_CHOICES[Math.floor(Math.random() * EMOJI_CHOICES.length)];
    setEmojiState(next);
    setEmoji(next);
  };

  const steps: Step[] = [
    {
      key: "welcome",
      eyebrow: "Welcome",
      title: (
        <>
          Every day <span className="italic text-accent">has a shape.</span>
        </>
      ),
      body: "Some rise. Some fall. Some are a quiet flat line. Tonight, you'll draw yours.",
      visual: <CurveGlyph />,
    },
    {
      key: "draw",
      eyebrow: "The ritual",
      title: <>Draw the curve of how today felt.</>,
      body: "One honest line from morning to night. No words to find, no face to perform. Just the shape.",
      visual: <CurveGlyph />,
    },
    {
      key: "rooms",
      eyebrow: "Parallel Rooms",
      title: <>Meet a few people whose day looked the same.</>,
      body: "We drop you into a small, anonymous room with people who felt today the way you did. Emoji only. No strangers shouting into a void.",
      visual: <RoomGlyph />,
    },
    {
      key: "privacy",
      eyebrow: "Our promise",
      title: (
        <>
          No followers. No likes.
          <br />
          No profiles. Only tonight.
        </>
      ),
      body: (
        <>
          Everything vanishes at midnight. You'll appear to others as{" "}
          <button
            onClick={reshuffle}
            className="mx-0.5 rounded-full bg-accent-light/70 px-2 py-0.5 text-base align-middle transition hover:bg-accent-light"
            title="shuffle"
          >
            {emoji}
          </button>{" "}
          — nothing more.
        </>
      ),
      visual: <PrivacyGlyph emoji={emoji} />,
    },
  ];

  const step = steps[i];
  const last = i === steps.length - 1;

  return (
    <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col items-center justify-center px-6 py-12">
      {/* progress */}
      <div className="absolute top-8 flex gap-2">
        {steps.map((s, idx) => (
          <motion.span
            key={s.key}
            className={`h-1.5 rounded-full ${idx <= i ? "bg-accent" : "bg-hair"}`}
            animate={{ width: idx === i ? 26 : 8 }}
            transition={{ duration: 0.4 }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step.key}
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -24, filter: "blur(6px)" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center text-center"
        >
          <div className="mb-7">{step.visual}</div>
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-accent">
            {step.eyebrow}
          </p>
          <h2 className="font-serif-display text-[30px] leading-[1.15] text-ink sm:text-[36px]">
            {step.title}
          </h2>
          {step.body && (
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted">{step.body}</p>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-12 flex w-full flex-col items-center gap-4 px-6">
        <MagneticButton onClick={() => (last ? onDone() : setI(i + 1))}>
          {last ? "Begin Experience" : "Continue"}
          <span aria-hidden>→</span>
        </MagneticButton>
        {!last && (
          <button
            onClick={onDone}
            className="text-sm text-muted transition hover:text-ink"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
