"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";

/**
 * Glass, scroll-aware top nav. Floats transparent over the hero, then condenses
 * into a frosted pill once you scroll, staying legible over the lighter sections
 * below. White text + dark glass = readable on any world.
 */
export default function ImmersiveNav({ onEnter }: { onEnter?: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-[80] px-4 transition-all duration-500 ${scrolled ? "py-3" : "py-5"}`}>
      <div
        className={`mx-auto flex items-center justify-between rounded-full px-5 transition-all duration-500 ${
          scrolled
            ? "max-w-3xl border border-white/10 bg-black/40 py-2 shadow-lg backdrop-blur-xl"
            : "max-w-5xl py-1"
        }`}
      >
        <Link href="/" data-cursor aria-label="VibeCurve home" className="text-white">
          <Logo />
        </Link>

        <span className="hidden text-xs uppercase tracking-[0.28em] text-white/45 md:block">
          an emotional journey
        </span>

        <button
          data-cursor
          onClick={onEnter}
          className="rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-sm text-white backdrop-blur transition hover:border-white/50"
        >
          Enter
        </button>
      </div>
    </header>
  );
}
