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

export type MessageKind = "text" | "sticker" | "gif" | "voice";

export interface Message {
  id: string;
  roomId: string;
  userId: string;
  emoji: string;
  kind: MessageKind;
  /** the words, for kind "text"; "" for media */
  text: string;
  /** sticker/gif: id into the curated pack (lib/stickers) */
  stickerId?: string;
  /** voice: clip length in seconds */
  duration?: number;
  /** voice: audio mime type (e.g. "audio/webm;codecs=opus") */
  mime?: string;
  ts: number;
}

/**
 * What a client may post to a room. The store stamps id/ts and routes the
 * kind-specific bits. Voice audio is carried here as base64 but stored apart
 * from the message (and never echoed back through the room poll).
 */
export interface MessageInput {
  kind: MessageKind;
  text?: string;
  stickerId?: string;
  audio?: string;
  mime?: string;
  duration?: number;
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

/** One node in a chosen branch (e.g. India, then North India…). */
export interface DomainStep {
  id: string;
  label: string;
  emoji?: string;
}

/** A domain the user picked + how far they branched into it. */
export interface DomainSelection {
  domainId: string;
  domainLabel: string;
  domainEmoji: string;
  /** ordered sub-selections, first level → deepest */
  path: DomainStep[];
}

export interface Profile {
  /** stable id = the signed-in Google email */
  userId: string;
  /** "define yourself in 1–2 words" */
  words: string;
  /** emoji derived from `words` */
  emoji: string;
  /** the 3 domains the user branched into (drives affinity matching) */
  domains: DomainSelection[];
  /** "describe yourself in one sentence" (optional / skippable) */
  describe?: string;
  createdAt: number;
  updatedAt: number;
}
