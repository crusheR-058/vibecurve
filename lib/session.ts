"use client";

import type { CurvePoints } from "./types";

// Lightweight per-soul session. Identity is a random pseudonymous id + an
// emoji handle (no name, no profile) — the privacy promise, enforced client-side.

const EMOJIS = ["🌙", "🍀", "🎈", "🦊", "🐳", "🌿", "🪞", "🕊️", "🌊", "🔆", "🫧", "🍂"];

function rid(): string {
  return `u_${Math.random().toString(36).slice(2, 10)}`;
}

export function pickEmoji(): string {
  return EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
}

export function getUserId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("vc:userId");
  if (!id) {
    id = rid();
    localStorage.setItem("vc:userId", id);
  }
  return id;
}

export function getEmoji(): string {
  if (typeof window === "undefined") return "🌙";
  let e = localStorage.getItem("vc:emoji");
  if (!e) {
    e = pickEmoji();
    localStorage.setItem("vc:emoji", e);
  }
  return e;
}

export function setEmoji(e: string) {
  if (typeof window !== "undefined") localStorage.setItem("vc:emoji", e);
}

export function hasOnboarded(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("vc:onboarded") === "1";
}

export function setOnboarded() {
  if (typeof window !== "undefined") localStorage.setItem("vc:onboarded", "1");
}

export function rememberCurve(points: CurvePoints) {
  if (typeof window !== "undefined")
    sessionStorage.setItem("vc:points", JSON.stringify(points));
}

export function recallCurve(): CurvePoints | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem("vc:points");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CurvePoints;
  } catch {
    return null;
  }
}

export function rememberMatch(roomId: string, percent: number) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("vc:roomId", roomId);
    sessionStorage.setItem("vc:match", String(percent));
  }
}

export function recallMatch(): { roomId: string | null; percent: number } {
  if (typeof window === "undefined") return { roomId: null, percent: 0 };
  return {
    roomId: sessionStorage.getItem("vc:roomId"),
    percent: Number(sessionStorage.getItem("vc:match") ?? 0),
  };
}

export const EMOJI_CHOICES = EMOJIS;
