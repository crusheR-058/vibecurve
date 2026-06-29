// Server-safe catalog for the Warmth Economy (UI only). No React, no secrets —
// just prices, packs, auras and copy. Sticker *definitions* (id, glyph, src,
// motion) live in lib/stickers.ts so the API can still validate ids; here we
// only group and price them.

export const LIGHT_COST = 1; // embers, when the free daily light is spent
export const HOLD_COST = 6; // embers to push the burn back
export const HOLD_MS = 5 * 60 * 1000; // +5 minutes for everyone
export const ECHO_COST = 2; // embers to keep a single line past midnight

export interface WarmthTier {
  id: string;
  label: string;
  glyph: string;
  embers: number;
  blurb: string;
}
// Warmth always flows to *someone else's* message — never to your own status.
export const WARMTH_TIERS: WarmthTier[] = [
  { id: "glow", label: "Glow", glyph: "✨", embers: 1, blurb: "a soft halo" },
  { id: "candle", label: "Candle", glyph: "🕯️", embers: 3, blurb: "a warm light" },
  { id: "aurora", label: "Aurora", glyph: "🔥", embers: 8, blurb: "the whole room feels it" },
];

export interface EmberTier {
  id: string;
  embers: number;
  price: string;
  blurb: string;
  best?: boolean;
}
export const EMBER_TIERS: EmberTier[] = [
  { id: "pocket", embers: 20, price: "$1.99", blurb: "a pocketful" },
  { id: "handful", embers: 60, price: "$4.99", blurb: "a handful", best: true },
  { id: "lantern", embers: 160, price: "$9.99", blurb: "a lantern" },
];

export const PLUS = {
  price: "$4.99",
  cadence: "/mo",
  perks: [
    "120 ✦ embers every month",
    "every aura, including the animated ones",
    "keep unlimited echoes",
    "a quiet patron mark by your emoji",
  ],
};

export interface Pack {
  id: string;
  name: string;
  blurb: string;
  price: number; // embers
  stickerIds: string[];
}
export const PACKS: Pack[] = [
  {
    id: "patron",
    name: "Patron",
    blurb: "Give big, warmly — crowns, gifts and confetti for the moments that earn them.",
    price: 60,
    stickerIds: [
      "p_gift",
      "p_crown",
      "p_superstar",
      "p_supporter",
      "p_levelup",
      "p_nitro",
      "p_vip",
      "p_coin",
      "p_ultragift",
      "p_elite",
    ],
  },
  {
    id: "tender",
    name: "Tender Nights",
    blurb: "For the quiet things — gentle words for a room that ends at midnight.",
    price: 40,
    stickerIds: [
      "t_gentle",
      "t_mid1",
      "t_mid2",
      "t_loveshape",
      "t_found98",
      "t_parallel",
      "t_talk",
      "t_book",
      "t_ghost",
      "t_fox",
      "t_voicenav",
    ],
  },
  {
    id: "moods",
    name: "Big Moods",
    blurb: "Say exactly how today felt — the whole emotional weather, drawn out loud.",
    price: 40,
    stickerIds: [
      "m_joy",
      "m_loved",
      "m_excited",
      "m_awe",
      "m_relieved",
      "m_curious",
      "m_sad",
      "m_anxious",
      "m_angry",
      "m_proud",
    ],
  },
];

export interface Aura {
  id: string;
  label: string;
  price: number; // embers; 0 = free or plus-only
  ring: string; // css color, or "gradient" for the animated wash
  animated?: boolean;
  plusOnly?: boolean;
}
export const AURAS: Aura[] = [
  { id: "ember", label: "Ember", price: 0, ring: "#fdba74" },
  { id: "tide", label: "Tide", price: 0, ring: "#a78bfa" },
  { id: "moss", label: "Moss", price: 8, ring: "#86efac" },
  { id: "rose", label: "Rose", price: 8, ring: "#fda4af" },
  { id: "halo", label: "Halo", price: 12, ring: "#c4b5fd", animated: true },
  { id: "aurora", label: "Aurora", price: 0, ring: "gradient", animated: true, plusOnly: true },
];

// Copy shown to someone arriving after a heavy day — a past stranger's warmth.
// No backend: drawn from this pool, index chosen by the caller.
export const RECEIVED_LIGHTS: string[] = [
  "Someone who lived through a day shaped like yours left this for you. You made it here — that counts.",
  "A stranger who felt today the way you did lit this before they left: you're not carrying it alone.",
  "Someone walked out of a night like this one and left a light for whoever came next. Tonight that's you.",
  "A quiet hello from someone whose day also dipped low — they wanted you to know it lifts again.",
];

export function pack(id: string): Pack | undefined {
  return PACKS.find((p) => p.id === id);
}
export function packOfSticker(stickerId: string): Pack | undefined {
  return PACKS.find((p) => p.stickerIds.includes(stickerId));
}
export function aura(id: string): Aura | undefined {
  return AURAS.find((a) => a.id === id);
}
