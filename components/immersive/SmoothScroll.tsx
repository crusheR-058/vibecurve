"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useJourney, pointer } from "@/lib/journeyStore";

/**
 * Scroll engine for the journey.
 *
 * Desktop keeps Lenis inertial smoothing (unchanged). On touch devices we use
 * NATIVE scrolling — Lenis doesn't smooth touch, and reading `lenis.progress`
 * there goes stale, which is why the scroll-driven 3D never reached its end
 * state on mobile. Either way, `progress` is derived from the real
 * `window.scrollY`, so the animation stays in sync on every device.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;

    gsap.registerPlugin(ScrollTrigger);
    const setProgress = useJourney.getState().setProgress;

    // single source of truth for progress: the actual scroll position
    const updateProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };

    // Lenis smooths the wheel on pointer-fine (desktop) only; touch stays native
    let lenis: Lenis | null = null;
    if (!isTouch && !reduce) {
      lenis = new Lenis({ duration: 1.1, smoothWheel: true, wheelMultiplier: 1 });
      lenis.on("scroll", () => ScrollTrigger.update());
    }

    let rafId = 0;
    const raf = (time: number) => {
      lenis?.raf(time);
      updateProgress();
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // belt-and-braces for mobile: native scroll/resize also refresh progress
    const onScroll = () => updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    // mouse parallax is a desktop affordance only
    const onMove = (ev: PointerEvent) => {
      pointer.x = (ev.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((ev.clientY / window.innerHeight) * 2 - 1);
    };
    if (!isTouch) window.addEventListener("pointermove", onMove);

    updateProgress();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("pointermove", onMove);
      lenis?.destroy();
    };
  }, []);

  return <>{children}</>;
}
