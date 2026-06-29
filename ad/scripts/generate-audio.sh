#!/usr/bin/env bash
#
# Regenerate the ad's audio with the ElevenLabs API.
#   • music.mp3   — 30s ambient bed  (Sound-Generation)
#   • vo1–vo6.mp3 — scene-synced narration (Text-to-Speech)
#
# Reads your key + voice id from ../.env.local. Run from the `ad/` folder:
#   bash scripts/generate-audio.sh
#
# After editing the lines below, re-run, then `npm run render`. If you change a
# line's length, update the matching `from`/`dur` in src/Soundtrack.tsx so the
# music ducking stays in sync.
set -euo pipefail
cd "$(dirname "$0")/.."

ENVF="../.env.local"
KEY=$(grep '^EXPO_PUBLIC_ELEVENLABS_API_KEY=' "$ENVF" | cut -d= -f2- | tr -d ' "')
VOICE=$(grep '^EXPO_PUBLIC_ELEVENLABS_VOICE_ID=' "$ENVF" | cut -d= -f2- | tr -d ' "')
mkdir -p public

echo "♪ music bed…"
cat > /tmp/vc-music.json <<'JSON'
{"text":"Warm intimate cinematic ambient music bed: soft felt piano notes, gentle warm analog synth pad, a slow subtle low pulse, airy and calm, lightly nostalgic and hopeful, smooth evolving texture, no drums, no percussion hits, no vocals","duration_seconds":30,"prompt_influence":0.25}
JSON
curl -s -X POST "https://api.elevenlabs.io/v1/sound-generation" \
  -H "xi-api-key: $KEY" -H "Content-Type: application/json" \
  --data @/tmp/vc-music.json -o public/music.mp3
echo "  → public/music.mp3 ($(wc -c < public/music.mp3) bytes)"

# Narration — one line per scene (keep these in sync with src/Soundtrack.tsx).
LINES=(
"What if a network actually cared how your day felt?"
"On VibeCurve, every vibe has a curve."
"Draw the shape of your day. One honest line, from morning to night."
"Then meet someone whose day felt just like yours."
"Small, anonymous rooms. No names. No feed. No flex."
"At midnight, it all burns away. So, how did today feel?"
)
i=0
for TEXT in "${LINES[@]}"; do
  i=$((i+1))
  printf '{"text":"%s","model_id":"eleven_multilingual_v2","voice_settings":{"stability":0.45,"similarity_boost":0.8,"style":0.25,"use_speaker_boost":true}}' "$TEXT" > /tmp/vc-vo.json
  curl -s -X POST "https://api.elevenlabs.io/v1/text-to-speech/$VOICE?output_format=mp3_44100_128" \
    -H "xi-api-key: $KEY" -H "Content-Type: application/json" \
    --data @/tmp/vc-vo.json -o "public/vo$i.mp3"
  echo "  → public/vo$i.mp3  \"$TEXT\""
done

echo "✓ audio regenerated — now run: npm run render"
