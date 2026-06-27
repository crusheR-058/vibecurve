// Midnight + countdown helpers. The whole product is built around the day
// boundary: curves, rooms and messages all expire at the next local midnight.

/** ms timestamp of the next local midnight (the burn moment / DynamoDB TTL). */
export function nextMidnight(from = new Date()): number {
  const d = new Date(from);
  d.setHours(24, 0, 0, 0);
  return d.getTime();
}

/** TTL value (unix seconds) for DynamoDB — kept here so the seam is obvious. */
export function midnightTtlSeconds(from = new Date()): number {
  return Math.floor(nextMidnight(from) / 1000);
}

/** YYYY-MM-DD for the current local day — the partition for today's curves. */
export function today(from = new Date()): string {
  const y = from.getFullYear();
  const m = String(from.getMonth() + 1).padStart(2, "0");
  const d = String(from.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export interface Countdown {
  hours: number;
  minutes: number;
  seconds: number;
  /** fraction of the day remaining, 0..1 — drives the countdown ring */
  fraction: number;
  total: number;
}

export function countdownTo(target: number, now = Date.now()): Countdown {
  const remaining = Math.max(0, target - now);
  const dayMs = 24 * 60 * 60 * 1000;
  return {
    hours: Math.floor(remaining / 3_600_000),
    minutes: Math.floor((remaining % 3_600_000) / 60_000),
    seconds: Math.floor((remaining % 60_000) / 1000),
    fraction: Math.min(1, remaining / dayMs),
    total: remaining,
  };
}

export function formatCountdown(c: Countdown): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(c.hours)}:${pad(c.minutes)}:${pad(c.seconds)}`;
}
