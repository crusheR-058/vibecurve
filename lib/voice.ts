// Shared limits for inline voice notes. Clips are recorded in-browser, posted as
// base64, stored in their own item (apart from the message) and reaped at
// midnight by the same TTL as everything else — no S3, no separate lifecycle.

export const MAX_VOICE_SECONDS = 30;

/**
 * Cap on the base64 payload (~260 KB of audio). 30s of Opus is comfortably under
 * this; the cap stops an oversized clip from bumping the DynamoDB item ceiling.
 */
export const MAX_AUDIO_B64 = 350_000;

export function isLikelyBase64(s: unknown): s is string {
  return typeof s === "string" && s.length > 0 && /^[A-Za-z0-9+/=]+$/.test(s);
}

/** Keep stored mime types to real audio, defaulting to webm/opus. */
export function safeAudioMime(mime: unknown): string {
  return typeof mime === "string" && mime.startsWith("audio/") ? mime : "audio/webm";
}
