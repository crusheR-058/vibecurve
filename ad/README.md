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

### Brand fidelity

Colors, fonts (Instrument Serif + Inter), the logo mark, the mood-graded curve
(`green → red`) and its Catmull-Rom math are lifted directly from the app
(`tailwind.config.ts`, `app/globals.css`, `components/ui/Logo.tsx`,
`components/scenes/DrawYourDay.tsx`) so the ad matches the product exactly.
Tokens live in `src/theme.ts`; orientation sizing in `src/layout.ts`.

## Add a soundtrack (optional)

The ad is designed to read perfectly **muted with on-screen captions** (the norm
for autoplay social ads). To add music:

1. Drop a track at `ad/public/music.mp3`.
2. In `src/Ad.tsx`, add inside the returned `<AbsoluteFill>`:
   ```tsx
   import { Audio, staticFile } from "remotion";
   // ...
   <Audio src={staticFile("music.mp3")} volume={0.6} />
   ```

## Tweak the pacing

Per-scene frame budgets live in `src/Ad.tsx` (they sum to 990; five 18-frame
cross-fades overlap → 900 frames = 30s). If you change them, keep `DURATION` in
`src/Root.tsx` in sync.
