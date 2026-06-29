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
  /** premium "vibe pack" stickers render this PNG (from /public) over the glyph */
  src?: string;
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

  // ── "Leave a light" — a candle handed to a stranger (sent via its own button) ──
  { id: "light", kind: "sticker", label: "A light", glyph: "🕯️", preset: "twinkle" },

  // ── Vibe Packs: premium PNG art (lib/economyData groups + prices these) ──
  // Patron — set 1
  { id: "p_gift", kind: "sticker", label: "Gift", glyph: "🎁", preset: "bounce", src: "/images/individual_sticker_pngs/01_gift.png" },
  { id: "p_crown", kind: "sticker", label: "Crown", glyph: "👑", preset: "bounce", src: "/images/individual_sticker_pngs/02_ultra_crown.png" },
  { id: "p_superstar", kind: "sticker", label: "Superstar", glyph: "🌟", preset: "bounce", src: "/images/individual_sticker_pngs/03_superstar.png" },
  { id: "p_supporter", kind: "sticker", label: "Supporter", glyph: "🤝", preset: "bounce", src: "/images/individual_sticker_pngs/04_supporter.png" },
  { id: "p_levelup", kind: "sticker", label: "Level up", glyph: "⬆️", preset: "bounce", src: "/images/individual_sticker_pngs/05_level_up_10.png" },
  { id: "p_nitro", kind: "sticker", label: "Boost", glyph: "🚀", preset: "bounce", src: "/images/individual_sticker_pngs/06_nitro_boost.png" },
  { id: "p_vip", kind: "sticker", label: "VIP", glyph: "🎟️", preset: "bounce", src: "/images/individual_sticker_pngs/07_vip.png" },
  { id: "p_coin", kind: "sticker", label: "Coin", glyph: "🪙", preset: "bounce", src: "/images/individual_sticker_pngs/08_creator_coin.png" },
  { id: "p_ultragift", kind: "sticker", label: "Ultra gift", glyph: "🎉", preset: "bounce", src: "/images/individual_sticker_pngs/09_ultra_gift.png" },
  { id: "p_elite", kind: "sticker", label: "Elite", glyph: "💎", preset: "bounce", src: "/images/individual_sticker_pngs/10_elite_member.png" },
  // Tender Nights — set 2
  { id: "t_gentle", kind: "sticker", label: "Say something gentle", glyph: "🤍", preset: "float", src: "/images/individual_sticker_pngs_set2/say_something_gentle.png" },
  { id: "t_mid1", kind: "sticker", label: "Until midnight", glyph: "🌙", preset: "float", src: "/images/individual_sticker_pngs_set2/until_midnight_1.png" },
  { id: "t_mid2", kind: "sticker", label: "Until midnight", glyph: "🌙", preset: "float", src: "/images/individual_sticker_pngs_set2/until_midnight_2.png" },
  { id: "t_loveshape", kind: "sticker", label: "Love the day's shape", glyph: "💜", preset: "float", src: "/images/individual_sticker_pngs_set2/love_the_days_shape.png" },
  { id: "t_found98", kind: "sticker", label: "Parallel found", glyph: "✨", preset: "float", src: "/images/individual_sticker_pngs_set2/parallel_found_98.png" },
  { id: "t_parallel", kind: "sticker", label: "Parallel vibe", glyph: "🌊", preset: "float", src: "/images/individual_sticker_pngs_set2/parallel_vibe.png" },
  { id: "t_talk", kind: "sticker", label: "Let's talk", glyph: "💬", preset: "float", src: "/images/individual_sticker_pngs_set2/lets_talk_no_faces.png" },
  { id: "t_book", kind: "sticker", label: "Let tonight end", glyph: "📖", preset: "float", src: "/images/individual_sticker_pngs_set2/let_tonight_end_book.png" },
  { id: "t_ghost", kind: "sticker", label: "Let tonight end", glyph: "👻", preset: "float", src: "/images/individual_sticker_pngs_set2/let_tonight_end_ghost.png" },
  { id: "t_fox", kind: "sticker", label: "Drift", glyph: "🦊", preset: "float", src: "/images/individual_sticker_pngs_set2/fox_whale_balloon.png" },
  { id: "t_voicenav", kind: "sticker", label: "Voice room", glyph: "🎧", preset: "float", src: "/images/individual_sticker_pngs_set2/voice_room_navigator.png" },
  // Big Moods — set 4
  { id: "m_joy", kind: "sticker", label: "Pure joy", glyph: "😄", preset: "breathe", src: "/images/individual_sticker_pngs_set4/pure_joy.png" },
  { id: "m_loved", kind: "sticker", label: "Totally loved", glyph: "🥰", preset: "breathe", src: "/images/individual_sticker_pngs_set4/totally_loved.png" },
  { id: "m_excited", kind: "sticker", label: "So excited", glyph: "🤩", preset: "breathe", src: "/images/individual_sticker_pngs_set4/so_excited.png" },
  { id: "m_awe", kind: "sticker", label: "Awestruck", glyph: "😮", preset: "breathe", src: "/images/individual_sticker_pngs_set4/awestruck.png" },
  { id: "m_relieved", kind: "sticker", label: "Relieved", glyph: "😮‍💨", preset: "breathe", src: "/images/individual_sticker_pngs_set4/whew_relieved.png" },
  { id: "m_curious", kind: "sticker", label: "Curious", glyph: "🐱", preset: "breathe", src: "/images/individual_sticker_pngs_set4/curious_cat.png" },
  { id: "m_sad", kind: "sticker", label: "A bit sad", glyph: "😔", preset: "breathe", src: "/images/individual_sticker_pngs_set4/a_bit_sad.png" },
  { id: "m_anxious", kind: "sticker", label: "Anxious", glyph: "😰", preset: "breathe", src: "/images/individual_sticker_pngs_set4/worried_and_anxious.png" },
  { id: "m_angry", kind: "sticker", label: "So angry", glyph: "😣", preset: "breathe", src: "/images/individual_sticker_pngs_set4/so_angry.png" },
  { id: "m_proud", kind: "sticker", label: "Proud", glyph: "🏆", preset: "breathe", src: "/images/individual_sticker_pngs_set4/proud_and_accomplished.png" },
];

const byId = new Map(STICKERS.map((s) => [s.id, s]));

export function getSticker(id: string): Sticker | null {
  return byId.get(id) ?? null;
}

export const STICKER_IDS = new Set(STICKERS.map((s) => s.id));
// The free, always-available sticker tab: the original glyph stickers only.
// Premium pack art carries `src`; the "light" glyph is given via its own button.
export const STICKER_PACK = STICKERS.filter(
  (s) => s.kind === "sticker" && !s.src && s.id !== "light",
);
export const GIF_PACK = STICKERS.filter((s) => s.kind === "gif");
