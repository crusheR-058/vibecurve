#!/usr/bin/env bash
#
# Regenerate the ad's audio with the ElevenLabs API.
#   • music1–3.mp3 — three evolving 30s ambient segments (Sound-Generation;
#                    the API caps a single clip at 30s, so the score is built
#                    from three and crossfaded in src/Soundtrack.tsx).
#   • vo1–vo13.mp3 — scene-synced narration (Text-to-Speech).
#
# Reads your key + voice id from ../.env.local. Run from the `ad/` folder:
#   bash scripts/generate-audio.sh
#
# After editing lines below, re-run, then `npm run render`. If a line's length
# changes, update its from/dur in src/Soundtrack.tsx so the ducking stays synced.
set -euo pipefail
cd "$(dirname "$0")/.."

ENVF="../.env.local"
KEY=$(grep '^EXPO_PUBLIC_ELEVENLABS_API_KEY=' "$ENVF" | cut -d= -f2- | tr -d ' "')
VOICE=$(grep '^EXPO_PUBLIC_ELEVENLABS_VOICE_ID=' "$ENVF" | cut -d= -f2- | tr -d ' "')
mkdir -p public

echo "♪ music segments (3 × 30s)…"
MPROMPTS=(
"Soft airy ambient opening for an intimate film: distant felt piano notes, a gentle warm synth pad, calm, spacious and hopeful, very minimal, no drums, no vocals"
"Warm tender ambient that gently builds: felt piano with soft gentle motion, glowing analog synth pads swelling, a subtle low pulse, hopeful and intimate, no drums, no vocals"
"Tender uplifting ambient resolve: warm rounded piano chords, soft glowing pad, gently hopeful and peaceful, settling to a calm resolve, no drums, no vocals"
)
mi=0
for P in "${MPROMPTS[@]}"; do
  mi=$((mi+1))
  printf '{"text":"%s","duration_seconds":30,"prompt_influence":0.25}' "$P" > /tmp/vc-m.json
  curl -s -X POST "https://api.elevenlabs.io/v1/sound-generation" \
    -H "xi-api-key: $KEY" -H "Content-Type: application/json" --data @/tmp/vc-m.json -o "public/music$mi.mp3"
  echo "  → public/music$mi.mp3 ($(wc -c < public/music$mi.mp3) bytes)"
done

echo "🎙  narration (13 lines)…"
LINES=(
"What if a network actually cared how your day felt?"
"This is VibeCurve. Every vibe has a curve."
"First, you become a profile that is truly yours."
"Pick what you love, and branch in. The deeper you go, the closer your people."
"Then each day, you draw its shape. One honest line, from morning to night."
"And meet someone whose day felt just like yours."
"In small, anonymous rooms. No names. No feed. No flex."
"Here, you don't buy clout. You give warmth."
"Embers you pass to someone else. A glow, a candle, a whole room lit up."
"Go further with VibeCurve Plus."
"And part of every ember lights the way for someone who can't pay. No one is priced out."
"At midnight, it all burns away."
"The day doesn't stay. So, how did today feel?"
)
i=0
for TEXT in "${LINES[@]}"; do
  i=$((i+1))
  printf '{"text":"%s","model_id":"eleven_multilingual_v2","voice_settings":{"stability":0.45,"similarity_boost":0.8,"style":0.25,"use_speaker_boost":true}}' "$TEXT" > /tmp/vc-vo.json
  curl -s -X POST "https://api.elevenlabs.io/v1/text-to-speech/$VOICE?output_format=mp3_44100_128" \
    -H "xi-api-key: $KEY" -H "Content-Type: application/json" --data @/tmp/vc-vo.json -o "public/vo$i.mp3"
  echo "  → public/vo$i.mp3  \"$TEXT\""
done

echo "✓ audio regenerated — now run: npm run render"
