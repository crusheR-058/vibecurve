// Shared domain types. These mirror the playbook's DynamoDB single-table
// entities so the in-memory store can later be swapped for real DynamoDB
// (see lib/store.ts header for the swap notes).

export type CurvePoints = [number, number, number, number, number];

export interface Member {
  userId: string;
  emoji: string;
  joinedAt: number;
  /** ambient companions exist only to make the demo feel alive (see store.ts) */
  ambient?: boolean;
}

export interface Message {
  id: string;
  roomId: string;
  userId: string;
  emoji: string;
  text: string;
  ts: number;
}

export interface RoomState {
  roomId: string;
  date: string;
  signature: string;
  members: Member[];
  messages: Message[];
  /** ms timestamp when the room "burns" (local midnight) */
  expiresAt: number;
}

export interface MatchResult {
  roomId: string;
  /** 0–100, similarity to the closest soul already in the room */
  matchPercent: number;
  signature: string;
  you: Member;
}

// ── Permanent profile (built in the walkthrough, never expires) ─────────────

export interface ProfileAnswer {
  /** question id */
  id: string;
  /** human question text */
  q: string;
  /** chosen option label */
  a: string;
  /** chosen option emoji */
  emoji?: string;
}

export interface Profile {
  /** stable id = the signed-in Google email */
  userId: string;
  /** "define yourself in 1–2 words" */
  words: string;
  /** emoji derived from `words` */
  emoji: string;
  /** chosen personality track (chaos | calm | dreamer | cozy) */
  track: string;
  /** flashcard answers */
  answers: ProfileAnswer[];
  /** "describe yourself in one sentence" (optional / skippable) */
  describe?: string;
  createdAt: number;
  updatedAt: number;
}
