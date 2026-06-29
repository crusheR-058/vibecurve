"use client";

import {
  motion,
  useReducedMotion,
  type TargetAndTransition,
  type Transition,
} from "framer-motion";
import { getSticker, type StickerPreset } from "@/lib/stickers";

// Renders a curated sticker / "GIF" entirely client-side: an emoji glyph with a
// looping motion preset (+ a small particle layer for some). Nothing is fetched
// from a third party, so the room's "nothing leaks" promise stays intact.

type Anim = { animate: TargetAndTransition; transition: Transition };

function motionFor(preset: StickerPreset): Anim {
  const loop = (duration: number) => ({ duration, repeat: Infinity, ease: "easeInOut" });
  switch (preset) {
    case "pulse":
      return { animate: { scale: [1, 1.18, 1] }, transition: loop(1.1) };
    case "bounce":
      return { animate: { y: [0, -12, 0] }, transition: loop(0.9) };
    case "float":
      return { animate: { y: [0, -8, 0], rotate: [-3, 3, -3] }, transition: loop(2.4) };
    case "breathe":
      return { animate: { scale: [1, 1.08, 1] }, transition: loop(2.6) };
    case "drift":
      return { animate: { x: [0, 6, 0], opacity: [1, 0.7, 1] }, transition: loop(2.2) };
    case "sway":
      return { animate: { rotate: [-8, 8, -8] }, transition: loop(2.0) };
    case "roll":
      return { animate: { x: [-4, 4, -4], rotate: [-4, 4, -4] }, transition: loop(1.8) };
    case "burst":
      return { animate: { scale: [1, 1.12, 1] }, transition: loop(1.6) };
    case "steam":
      return { animate: { y: [0, -3, 0] }, transition: loop(2.0) };
    case "rain":
      return { animate: { y: [0, -2, 0] }, transition: loop(2.0) };
    case "twinkle":
      return { animate: { scale: [1, 1.12, 1], rotate: [0, 6, 0] }, transition: loop(2.4) };
    default:
      return { animate: {}, transition: {} };
  }
}

export default function StickerArt({ id, size = 104 }: { id: string; size?: number }) {
  const reduce = useReducedMotion();
  const s = getSticker(id);
  if (!s) return null;
  const { animate, transition } = reduce ? { animate: {}, transition: {} } : motionFor(s.preset);
  const glyph = Math.round(size * (s.caption ? 0.46 : 0.54));

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size }}>
      <div className="relative grid place-items-center" style={{ width: size, height: size }}>
        {!reduce && !s.src && <Particles preset={s.preset} size={size} />}
        <motion.div
          className="relative z-10 select-none leading-none"
          style={{ fontSize: glyph }}
          animate={animate}
          transition={transition}
        >
          {s.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={s.src}
              alt={s.label}
              draggable={false}
              className="pointer-events-none select-none"
              style={{ width: size * 0.94, height: size * 0.94, objectFit: "contain" }}
            />
          ) : (
            s.glyph
          )}
        </motion.div>
      </div>
      {s.caption && (
        <div className="relative z-10 -mt-1 text-center text-[13px] font-medium leading-tight text-ink">
          {s.caption}
        </div>
      )}
    </div>
  );
}

function Particles({ preset, size }: { preset: StickerPreset; size: number }) {
  if (preset === "burst" || preset === "twinkle") return <Sparkles size={size} />;
  if (preset === "steam") return <Steam size={size} />;
  if (preset === "rain") return <RainDrops size={size} />;
  return null;
}

// fixed positions (no Math.random) so there's never a hydration mismatch
const SPARK = [
  { x: -34, y: -20, d: 0 },
  { x: 32, y: -26, d: 0.3 },
  { x: 38, y: 14, d: 0.6 },
  { x: -30, y: 22, d: 0.9 },
  { x: 0, y: -38, d: 0.45 },
  { x: 4, y: 34, d: 0.75 },
];

function Sparkles({ size }: { size: number }) {
  const c = size / 2;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {SPARK.map((s, i) => (
        <motion.span
          key={i}
          className="absolute text-accent"
          style={{ left: c, top: c, fontSize: Math.max(9, size * 0.12) }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0], x: [0, s.x], y: [0, s.y], scale: [0.4, 1, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: s.d, ease: "easeOut" }}
        >
          ✦
        </motion.span>
      ))}
    </div>
  );
}

function Steam({ size }: { size: number }) {
  const c = size / 2;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-ink/15"
          style={{ left: c - 6 + i * 6, top: c - size * 0.18, width: 6, height: 6 }}
          animate={{ y: [-2, -size * 0.34], opacity: [0, 0.5, 0], scale: [0.6, 1.2] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.4, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

function RainDrops({ size }: { size: number }) {
  const xs = [-18, -6, 6, 18, 0];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {xs.map((x, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-accent/50"
          style={{ left: size / 2 + x, top: size * 0.55, width: 2, height: 8 }}
          animate={{ y: [0, size * 0.3], opacity: [0, 0.8, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.22, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}
