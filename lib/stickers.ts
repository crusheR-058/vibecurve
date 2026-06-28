// The curated, on-brand sticker + GIF pack. Everything here is plain data —
// glyphs are emoji, "GIFs" are looping motion presets rendered client-side
// (components/room/StickerArt) — so nothing is ever fetched from a third party.
// That keeps the room's privacy promise intact: no Tenor/GIPHY, nothing leaks.
//
// This module is server-safe (no React), so the API route can validate ids.

export type StickerKind = "sticker" | "gif";

/** Motion the client animates the glyph with (see StickerArt). */
export type StickerPreset =
  | "pulse"
  | "bounce"
  | "float"
  | "breathe"
  | "drift"
  | "sway"
  | "roll"
  | "burst"
  | "steam"
  | "rain"
  | "twinkle";

export interface Sticker {
  id: string;
  kind: StickerKind;
  /** for accessibility + the tray's title text */
  label: string;
  glyph: string;
  preset: StickerPreset;
  /** GIFs pair the motion with a few warm words */
  caption?: string;
}

export const STICKERS: Sticker[] = [
  // ── stickers: a single expressive, animated feeling ──
  { id: "heart", kind: "sticker", label: "Heart", glyph: "💜", preset: "pulse" },
  { id: "hug", kind: "sticker", label: "Hug", glyph: "🫂", preset: "bounce" },
  { id: "teary", kind: "sticker", label: "Touched", glyph: "🥹", preset: "float" },
  { id: "sparkle", kind: "sticker", label: "Sparkle", glyph: "✨", preset: "burst" },
  { id: "calm", kind: "sticker", label: "Calm", glyph: "😌", preset: "breathe" },
  { id: "sigh", kind: "sticker", label: "Sigh", glyph: "😮‍💨", preset: "drift" },
  { id: "moon", kind: "sticker", label: "Moon", glyph: "🌙", preset: "twinkle" },
  { id: "wave", kind: "sticker", label: "Wave", glyph: "🌊", preset: "roll" },
  { id: "leaf", kind: "sticker", label: "Leaf", glyph: "🌿", preset: "sway" },
  { id: "coffee", kind: "sticker", label: "Coffee", glyph: "☕", preset: "steam" },
  { id: "rain", kind: "sticker", label: "Rain", glyph: "🌧️", preset: "rain" },
  { id: "star", kind: "sticker", label: "Star", glyph: "🌟", preset: "twinkle" },

  // ── GIFs: a looping reaction with a few words ──
  { id: "same", kind: "gif", label: "Same", glyph: "🌊", preset: "roll", caption: "same, honestly" },
  { id: "here", kind: "gif", label: "Here for you", glyph: "🫂", preset: "breathe", caption: "here for you" },
  { id: "proud", kind: "gif", label: "So proud", glyph: "🥹", preset: "float", caption: "so proud of you" },
  { id: "night", kind: "gif", label: "Goodnight", glyph: "🌙", preset: "sway", caption: "goodnight" },
  { id: "sending-hug", kind: "gif", label: "Sending a hug", glyph: "🤗", preset: "bounce", caption: "sending a hug" },
  { id: "you-got-this", kind: "gif", label: "You got this", glyph: "💪", preset: "pulse", caption: "you got this" },
  { id: "take-it-easy", kind: "gif", label: "Take it easy", glyph: "🌿", preset: "sway", caption: "take it easy" },
  { id: "love-this", kind: "gif", label: "Love this", glyph: "💜", preset: "pulse", caption: "love this" },
];

const byId = new Map(STICKERS.map((s) => [s.id, s]));

export function getSticker(id: string): Sticker | null {
  return byId.get(id) ?? null;
}

export const STICKER_IDS = new Set(STICKERS.map((s) => s.id));
export const STICKER_PACK = STICKERS.filter((s) => s.kind === "sticker");
export const GIF_PACK = STICKERS.filter((s) => s.kind === "gif");
