# 🎬 VibeCurve — Remotion ad

A 30-second, brand-accurate SaaS video ad for VibeCurve, built with
[Remotion](https://remotion.dev). This is a **standalone workspace** with its own
`package.json` / `node_modules`, isolated from the Next.js app (the app's
`tsconfig.json` excludes `/ad` and `.gitignore` ignores `ad/node_modules`), so it
never touches `next build`.

## Quick start

```bash
cd ad
npm install            # one-time (also fetches a headless Chromium for rendering)
npm start              # opens Remotion Studio at http://localhost:3000 to preview & scrub
```

## Render to MP4

```bash
npm run render           # 16:9 1920×1080 → out/vibecurve-ad.mp4
npm run render:vertical  # 9:16 1080×1920 → out/vibecurve-ad-vertical.mp4 (Reels/TikTok/Shorts)
npm run still            # a poster frame → out/poster.png
```

Outputs land in `ad/out/` (git-ignored). H.264 by default; for a transparent or
ProRes master, pass e.g. `-- --codec=prores`.

## What's in the ad

Six cross-faded scenes (`src/scenes/`), 30.0s @ 30fps:

| # | Scene | Beat |
|---|-------|------|
| 1 | `Intro` | Logo mark draws its wave · "The anti-flex network · gone by midnight" |
| 2 | `Hook` | "Every vibe has a curve." (the real hero line) |
| 3 | `DrawDay` | The signature mood curve drawing itself, morning → night |
| 4 | `Match` | Two near-identical day-shapes matching on the same L·M·H signature |
| 5 | `Rooms` | Anonymous emoji-only chat + the midnight countdown ring |
| 6 | `Burn` | Midnight burn dissolves to embers → "How did today feel?" + CTA |

The output MP4s include a full **audio mix**: a 30s ambient music bed + a 6-line
voiceover, one line per scene.

### Brand fidelity

Colors, fonts (Instrument Serif + Inter), the logo mark, the mood-graded curve
(`green → red`) and its Catmull-Rom math are lifted directly from the app
(`tailwind.config.ts`, `app/globals.css`, `components/ui/Logo.tsx`,
`components/scenes/DrawYourDay.tsx`) so the ad matches the product exactly.
Tokens live in `src/theme.ts`; orientation sizing in `src/layout.ts`.

## Audio (music + voiceover)

All audio lives in `ad/public/` and is generated with the **ElevenLabs API**:

- `music.mp3` — a 30s ambient bed (Sound-Generation)
- `vo1.mp3 … vo6.mp3` — the voiceover, one line per scene (Text-to-Speech, voice "Jessica")

`src/Soundtrack.tsx` places each line at its scene's frame and **ducks the music
~7 dB under speech** (it swells back up between lines). Two knobs at the top of
that file control the balance: `MUSIC_BASE` (gaps) and `MUSIC_DUCKED` (under VO).

> Tip: run `npm start` (Remotion Studio) to actually *hear* the mix and scrub —
> the terminal renders are silent to you, not to the file.

### Regenerate the audio

Edit the lines/prompt and re-run (reads your key from `../.env.local`):

```bash
bash scripts/generate-audio.sh
npm run render
```

If you change a line's length, update its `from`/`dur` in `src/Soundtrack.tsx`
so the ducking stays aligned. The ad also reads fine **muted with captions**
(the on-screen text carries it) for autoplay social feeds.

## Tweak the pacing

Per-scene frame budgets live in `src/Ad.tsx` (they sum to 990; five 18-frame
cross-fades overlap → 900 frames = 30s). If you change them, keep `DURATION` in
`src/Root.tsx` in sync.
