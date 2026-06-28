"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useJourney, pointer } from "@/lib/journeyStore";

/**
 * Inertial smooth scroll (Lenis) synced to GSAP ScrollTrigger, plus the global
 * scroll→progress and pointer feeds the 3D worlds read from. Window-scoped, so
 * it only runs while the landing is mounted and tears down on navigation.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({
      duration: reduce ? 0 : 1.1,
      smoothWheel: !reduce,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });

    const setProgress = useJourney.getState().setProgress;
    lenis.on("scroll", () => {
      ScrollTrigger.update();
      setProgress(lenis.progress ?? 0);
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    const onMove = (ev: PointerEvent) => {
      pointer.x = (ev.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((ev.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onMove);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
