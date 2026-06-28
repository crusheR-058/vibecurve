"use client";

import { useRef, useState } from "react";

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const x = Math.floor(s % 60);
  return `${m}:${String(x).padStart(2, "0")}`;
}

// Deterministic bar heights from the src — same waveform every render, no
// Math.random (so no hydration drift), and each note looks distinct.
function bars(seed: string, n = 28): number[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    h = (h * 1103515245 + 12345) & 0x7fffffff;
    out.push(0.28 + ((h % 100) / 100) * 0.72);
  }
  return out;
}

export default function VoicePlayer({
  src,
  duration,
  mine,
}: {
  src: string;
  duration: number;
  mine: boolean;
}) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const heights = bars(src);

  const known = ref.current?.duration;
  const dur = known && isFinite(known) && known > 0 ? known : duration;
  const progress = dur ? Math.min(1, t / dur) : 0;

  const toggle = () => {
    const a = ref.current;
    if (!a) return;
    if (playing) a.pause();
    else a.play().catch(() => {});
  };

  return (
    <div
      className={`flex items-center gap-3 rounded-card px-3 py-2.5 shadow-soft ${
        mine ? "rounded-br-md bg-accent text-white" : "rounded-bl-md border border-hair bg-card text-ink"
      }`}
    >
      <audio
        ref={ref}
        src={src}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setT(0);
        }}
        onTimeUpdate={(e) => setT(e.currentTarget.currentTime)}
      />
      <button
        onClick={toggle}
        aria-label={playing ? "pause" : "play"}
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm ${
          mine ? "bg-white/20 text-white" : "bg-accent-light/70 text-accent"
        }`}
      >
        {playing ? "❚❚" : "▶"}
      </button>

      <div className="flex h-7 items-center gap-[2px]">
        {heights.map((h, i) => {
          const on = i / heights.length <= progress;
          return (
            <span
              key={i}
              className={`w-[3px] rounded-full ${
                mine ? (on ? "bg-white" : "bg-white/35") : on ? "bg-accent" : "bg-hair"
              }`}
              style={{ height: `${Math.round(h * 100)}%` }}
            />
          );
        })}
      </div>

      <span className={`shrink-0 text-xs tabular-nums ${mine ? "text-white/80" : "text-muted"}`}>
        {fmt(playing || t > 0 ? t : duration)}
      </span>
    </div>
  );
}
