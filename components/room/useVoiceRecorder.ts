"use client";

import { useCallback, useRef, useState } from "react";

export interface VoiceResult {
  blob: Blob;
  duration: number;
  mime: string;
}

// Prefer Opus in WebM/Ogg (tiny), fall back to mp4 for Safari.
function pickMime(): string {
  if (typeof MediaRecorder === "undefined") return "";
  const cands = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];
  for (const m of cands) {
    try {
      if (MediaRecorder.isTypeSupported(m)) return m;
    } catch {
      /* not supported */
    }
  }
  return "";
}

/**
 * In-browser voice recording. `start()` asks for the mic (returns false if
 * denied/unsupported), `stop()` resolves the finished clip, `cancel()` discards.
 * Auto-stops at `maxSec`. The stream is always torn down on cleanup.
 */
export function useVoiceRecorder(maxSec = 30) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const mrRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedRef = useRef(0);

  const supported =
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== "undefined";

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    mrRef.current = null;
    setRecording(false);
  }, []);

  const stop = useCallback((): Promise<VoiceResult | null> => {
    return new Promise((resolve) => {
      const mr = mrRef.current;
      if (!mr) {
        resolve(null);
        return;
      }
      const duration = Math.min(maxSec, (Date.now() - startedRef.current) / 1000);
      mr.onstop = () => {
        const mime = mr.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mime });
        cleanup();
        resolve(blob.size ? { blob, duration: Math.max(1, Math.round(duration)), mime } : null);
      };
      try {
        mr.stop();
      } catch {
        cleanup();
        resolve(null);
      }
    });
  }, [maxSec, cleanup]);

  const start = useCallback(async (): Promise<boolean> => {
    if (!supported) return false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = pickMime();
      const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      mr.start();
      mrRef.current = mr;
      startedRef.current = Date.now();
      setElapsed(0);
      setRecording(true);
      timerRef.current = setInterval(() => {
        const s = (Date.now() - startedRef.current) / 1000;
        setElapsed(s);
        if (s >= maxSec) void stop();
      }, 150);
      return true;
    } catch {
      cleanup();
      return false;
    }
  }, [supported, maxSec, cleanup, stop]);

  const cancel = useCallback(() => {
    const mr = mrRef.current;
    if (mr) {
      mr.onstop = () => cleanup();
      try {
        mr.stop();
      } catch {
        cleanup();
      }
    } else {
      cleanup();
    }
  }, [cleanup]);

  return { supported, recording, elapsed, start, stop, cancel };
}
