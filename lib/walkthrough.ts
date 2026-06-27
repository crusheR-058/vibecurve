// Flashcard content for the walkthrough. The first card ("energy") branches the
// rest: each track gets one track-specific card, then a shared GenZ batch.

export interface FlashOption {
  emoji: string;
  label: string;
  value: string;
}
export interface FlashCard {
  id: string;
  q: string;
  options: FlashOption[];
}

export const BRANCH_CARD: FlashCard = {
  id: "energy",
  q: "Which energy is most you?",
  options: [
    { emoji: "🌪️", label: "Chaotic good", value: "chaos" },
    { emoji: "🌿", label: "Calm & grounded", value: "calm" },
    { emoji: "✨", label: "Main character", value: "dreamer" },
    { emoji: "🛋️", label: "Cozy gremlin", value: "cozy" },
  ],
};

export const TRACK_CARDS: Record<string, FlashCard> = {
  chaos: {
    id: "chaos_q",
    q: "Your group chat role?",
    options: [
      { emoji: "🔥", label: "Starts the drama", value: "instigator" },
      { emoji: "📸", label: "Screenshots everything", value: "archivist" },
      { emoji: "🤡", label: "Unhinged meme dealer", value: "jester" },
      { emoji: "🫡", label: "Down for anything", value: "wildcard" },
    ],
  },
  calm: {
    id: "calm_q",
    q: "How do you recharge?",
    options: [
      { emoji: "🚶", label: "A long quiet walk", value: "walk" },
      { emoji: "📖", label: "Book + tea", value: "book" },
      { emoji: "🧘", label: "Doing absolutely nothing", value: "nothing" },
      { emoji: "🌅", label: "Watching the sky", value: "sky" },
    ],
  },
  dreamer: {
    id: "dreamer_q",
    q: "Your main character moment?",
    options: [
      { emoji: "🎬", label: "Walking to a soundtrack", value: "soundtrack" },
      { emoji: "🌃", label: "City lights at 2am", value: "citylights" },
      { emoji: "💭", label: "Staring out the window", value: "daydream" },
      { emoji: "🎤", label: "Shower concert headliner", value: "shower" },
    ],
  },
  cozy: {
    id: "cozy_q",
    q: "Peak comfort is…",
    options: [
      { emoji: "🧦", label: "Fuzzy socks + blanket", value: "blanket" },
      { emoji: "🍲", label: "Warm food, rainy day", value: "warmfood" },
      { emoji: "🎮", label: "Same comfort show again", value: "rewatch" },
      { emoji: "🐈", label: "A pet on your lap", value: "pet" },
    ],
  },
};

export const COMMON_CARDS: FlashCard[] = [
  {
    id: "food",
    q: "Comfort food, no thoughts?",
    options: [
      { emoji: "🍜", label: "Ramen / noodles", value: "ramen" },
      { emoji: "🍕", label: "Pizza", value: "pizza" },
      { emoji: "🍫", label: "Chocolate", value: "chocolate" },
      { emoji: "🍟", label: "Fries", value: "fries" },
    ],
  },
  {
    id: "color",
    q: "Your color aura?",
    options: [
      { emoji: "💜", label: "Violet", value: "violet" },
      { emoji: "💚", label: "Green", value: "green" },
      { emoji: "🧡", label: "Peach", value: "peach" },
      { emoji: "🖤", label: "Black", value: "black" },
    ],
  },
  {
    id: "animal",
    q: "Spirit animal?",
    options: [
      { emoji: "🦊", label: "Fox", value: "fox" },
      { emoji: "🐳", label: "Whale", value: "whale" },
      { emoji: "🦋", label: "Butterfly", value: "butterfly" },
      { emoji: "🐢", label: "Turtle", value: "turtle" },
    ],
  },
  {
    id: "texting",
    q: "Your texting energy?",
    options: [
      { emoji: "🔡", label: "all lowercase always", value: "lowercase" },
      { emoji: "🎙️", label: "voice notes only", value: "voicenote" },
      { emoji: "✨", label: "emoji over words", value: "emoji" },
      { emoji: "📜", label: "full paragraphs", value: "paragraph" },
    ],
  },
];

/** The ordered card list for a chosen track (after the branch card). */
export function cardsForTrack(track: string): FlashCard[] {
  const t = TRACK_CARDS[track];
  return t ? [t, ...COMMON_CARDS] : COMMON_CARDS;
}
