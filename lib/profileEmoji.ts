// Derive a profile emoji from the user's "define yourself in 1–2 words".
// Scans for keyword matches; falls back to a stable pick from a friendly set.

const KEYWORDS: [RegExp, string][] = [
  [/\b(creativ|artist|paint|draw|design)/i, "🎨"],
  [/\b(music|musician|singer|song|melod)/i, "🎧"],
  [/\b(chaos|chaotic|wild|messy|feral)/i, "🌪️"],
  [/\b(calm|chill|peace|grounded|zen|relax)/i, "🌿"],
  [/\b(dream|dreamer|imagin|star|cosmic)/i, "🌙"],
  [/\b(ambiti|driven|hustle|grind|founder|boss)/i, "🚀"],
  [/\b(kind|caring|gentle|soft|empath|warm)/i, "🫶"],
  [/\b(funny|humor|silly|goofy|meme|jok)/i, "😂"],
  [/\b(introvert|quiet|shy|reserved|alone)/i, "🐚"],
  [/\b(extrovert|social|outgoing|loud|party)/i, "🎉"],
  [/\b(nerd|geek|smart|curious|learn|book|read)/i, "🤓"],
  [/\b(athlet|sport|gym|run|active|fit)/i, "⚡"],
  [/\b(food|foodie|cook|chef|hungry|snack)/i, "🍜"],
  [/\b(tired|sleepy|burnt|exhaust|done)/i, "😮‍💨"],
  [/\b(adventure|explore|travel|wander|free)/i, "🧭"],
  [/\b(romantic|love|hopeless|soft heart)/i, "🌷"],
  [/\b(mysteri|deep|complex|enigma|moody)/i, "🌑"],
  [/\b(sunshine|happy|bright|joy|optimis|positive)/i, "🌟"],
  [/\b(cat|feline|kitty)/i, "🐈"],
  [/\b(dog|puppy|loyal)/i, "🐕"],
  [/\b(ocean|sea|water|wave|fluid)/i, "🌊"],
  [/\b(fire|passion|intense|bold)/i, "🔥"],
  [/\b(plant|nature|green|grow|earth)/i, "🌱"],
  [/\b(coffee|caffeine|espresso)/i, "☕"],
  [/\b(night|nocturnal|midnight|owl)/i, "🦉"],
];

const FALLBACK = ["✨", "🌈", "🪐", "🍃", "🫧", "🌻", "🦋", "🌸", "🔆", "🪞"];

export function deriveEmoji(words: string): string {
  const text = words.trim();
  for (const [re, emoji] of KEYWORDS) {
    if (re.test(text)) return emoji;
  }
  // stable fallback so the same words always map to the same emoji
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  return FALLBACK[hash % FALLBACK.length] || "✨";
}
