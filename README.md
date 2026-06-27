# 🌊 VibeCurve

> Draw the emotional curve of your day, match with people whose day had the same shape, and meet in small anonymous rooms that quietly burn at midnight.

**The anti-flex network** — presence over permanence, connection over content, honesty over perfection.

[![Live on Vercel](https://img.shields.io/badge/Live-vibecurve.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vibecurve.vercel.app)

### 🔗 Live app → **https://vibecurve.vercel.app**

Auto-deployed from `main` via Vercel's GitHub integration.

## Stack

- **Next.js 15** (App Router) · **TypeScript** · **Tailwind CSS** · **Framer Motion**
- **Amazon DynamoDB** — single-table design, `GSI1` shape-bucket matching, TTL (midnight), Streams
- **NextAuth (Google)** — identity-backed pseudonymity (verified account on the backend, emoji to peers)
- **Vercel** — hosting + auto-deploy from this repo

## How it works

1. **Sign in with Google** → build a **permanent profile** in a short walkthrough (define yourself in 1–2 words → branching flashcards → one-sentence bio).
2. **VibeCheck** — draw the shape of your day as five points; the curve is colour-graded live (green = bright, red = heavy).
3. **Match** — your curve is bucketed into an L/M/H signature; people with the closest day land in the same small room.
4. **Parallel Room** — anonymous, emoji-only chat with a countdown to midnight.
5. **Midnight burn** — the room, messages and curves dissolve. The profile stays; the day doesn't.

## Local development

```bash
npm install
cp .env.local.example .env.local   # fill in the values below
npm run setup:ddb                  # one-time: create the DynamoDB table
npm run dev                        # http://localhost:3000
```

Without AWS credentials the app transparently falls back to an in-memory store, so it runs locally with zero cloud setup.

### Environment variables (`.env.local`, never committed)

| Var | Purpose |
|---|---|
| `VC_AWS_REGION` / `VC_AWS_ACCESS_KEY_ID` / `VC_AWS_SECRET_ACCESS_KEY` | DynamoDB access (custom names — Vercel reserves `AWS_*`) |
| `VC_DDB_TABLE` | table name (default `VibeCurve`) |
| `NEXTAUTH_SECRET` / `NEXTAUTH_URL` | NextAuth session signing + base URL |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth client |
| `NEXT_PUBLIC_AUTH_ENABLED` | `true` to surface the sign-in UI |

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | local dev server |
| `npm run build` / `npm start` | production build / serve |
| `npm run setup:ddb` | provision the DynamoDB table (GSI1 + Streams + TTL) |
| `npm run db:status` | live backend dashboard (rooms, members, messages) |

## Deploy

Pushing to `main` auto-deploys to production via Vercel's Git integration. Production env vars are configured in the Vercel project (not in this repo).
