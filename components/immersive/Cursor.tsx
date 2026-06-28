"use client";

import { useEffect, useRef } from "react";

/**
 * A custom cursor: a precise dot + a lagging ring that swells and brightens over
 * anything interactive (links, buttons, [data-cursor]). mix-blend-difference
 * keeps it legible on any backdrop. Disabled on touch + reduced-motion.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { ...pos };
    let hovering = false;

    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
    };
    const onOver = (e: Event) => {
      const t = e.target as HTMLElement | null;
      hovering = !!t?.closest?.("a, button, [data-cursor]");
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });

    let raf = 0;
    const loop = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.2;
      ringPos.y += (pos.y - ringPos.y) * 0.2;
      if (dot.current) {
        dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
      }
      if (ring.current) {
        ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%) scale(${hovering ? 1.9 : 1})`;
        ring.current.style.opacity = hovering ? "1" : "0.5";
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    document.documentElement.classList.add("cursor-none");

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.documentElement.classList.remove("cursor-none");
    };
  }, []);

  return (
    <>
      <div
        ref={ring}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] h-8 w-8 rounded-full border border-white mix-blend-difference will-change-transform"
      />
      <div
        ref={dot}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] h-1.5 w-1.5 rounded-full bg-white mix-blend-difference will-change-transform"
      />
    </>
  );
}
