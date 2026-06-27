"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const ITEMS = [
  {
    q: "Is it really anonymous?",
    a: "To everyone else, you're a single emoji — no name, no photo, no profile to perform. VibeCurve is built so there is simply nothing to curate or compare.",
  },
  {
    q: "What happens at midnight?",
    a: "Every room, message and curve quietly dissolves. Nothing is kept, nothing is searchable tomorrow. The day ends, and so does the room.",
  },
  {
    q: "How does the matching work?",
    a: "You draw the emotional shape of your day as five points. We find a few people whose day had nearly the same shape and place you together in a small, calm room.",
  },
  {
    q: "Why no likes or followers?",
    a: "Because metrics are the engine of comparison and anxiety. VibeCurve is presence over permanence, connection over content. There's no score to chase here.",
  },
  {
    q: "Who is this for?",
    a: "Anyone 16+ who's tired of performing online and wants a quieter, more human way to feel a little less alone at the end of the day.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-2xl divide-y divide-hair">
      {ITEMS.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={it.q} className="py-2">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 py-4 text-left"
            >
              <span className="text-[17px] font-medium text-ink">{it.q}</span>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent-light/60 text-lg text-accent"
              >
                +
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-5 pr-10 text-[15px] leading-relaxed text-muted">{it.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
