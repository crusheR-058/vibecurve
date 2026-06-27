import type {
  CurvePoints,
  MatchResult,
  Member,
  Message,
  Profile,
  RoomState,
} from "./types";
import { MATCH_THRESHOLD, matchPercent, signatureOf, similarity } from "./curve";
import { nextMidnight, today } from "./time";
import { ddbConfigured } from "./ddb";
import * as ddb from "./store-ddb";

/**
 * In-memory data layer. It deliberately mirrors the playbook's DynamoDB
 * single-table design (USER#/CURVE#, ROOM#/META, ROOM#/MEMBER#, ROOM#/MSG#)
 * so this file is the ONLY thing that changes when wiring real DynamoDB:
 *   submitCurve  -> PutItem(curve) + Query(GSI1 by DATE#date#BUCKET#sig) + Put(member)
 *   getRoom      -> Query(pk = ROOM#id)
 *   postMessage  -> PutItem(ROOM#id / MSG#ts#user), all with TTL = midnight.
 *
 * State lives on globalThis so it survives Next.js dev hot-reloads and is
 * shared across API route invocations within the one dev server process
 * (which is exactly what lets two browser tabs match into the same room).
 */

interface CurveRecord {
  userId: string;
  emoji: string;
  points: CurvePoints;
  signature: string;
  date: string;
  roomId?: string;
}

interface DB {
  curves: Map<string, CurveRecord>; // key: userId (one curve per soul per day)
  rooms: Map<string, RoomState>;
  ambientCurves: Map<string, CurvePoints>; // roomId|userId -> curve (for honest match%)
  profiles: Map<string, Profile>; // key: userId — permanent (never reaped)
  roomAff: Map<string, Set<string>>; // roomId -> affinity keys it's discoverable by
}

const g = globalThis as unknown as { __vibecurve?: DB };
const db: DB =
  g.__vibecurve ??
  (g.__vibecurve = {
    curves: new Map(),
    rooms: new Map(),
    ambientCurves: new Map(),
    profiles: new Map(),
    roomAff: new Map(),
  });

const ROOM_CAP = 5;

// ── Ambient companions ────────────────────────────────────────────────────
// Soft, real-feeling presence so a room is never lonely in a demo. Remove
// this block entirely once real-time liquidity exists; nothing else depends
// on it. Their messages are gentle, supportive, and never clinical.
const AMBIENT_POOL: { emoji: string; warp: number; lines: string[] }[] = [
  { emoji: "🌙", warp: -1, lines: ["today felt like a lot, honestly", "but i'm glad someone gets it"] },
  { emoji: "🍀", warp: 1, lines: ["the morning was rough but it softened", "hope your night is gentle"] },
  { emoji: "🎈", warp: 0, lines: ["funny how our days had the same shape", "what lifted yours?"] },
  { emoji: "🦊", warp: 2, lines: ["i almost didn't draw mine tonight", "feels good to be seen without the noise"] },
  { emoji: "🐳", warp: -2, lines: ["this is the calmest app i've opened all week", "no likes. just this. i needed it"] },
];

function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function warpCurve(base: CurvePoints, warp: number): CurvePoints {
  return base.map((v, i) =>
    Math.max(0, Math.min(10, v + warp + (i % 2 === 0 ? 1 : -1))),
  ) as CurvePoints;
}

function closestMatch(points: CurvePoints, members: Member[], roomId: string): number {
  let best = 0;
  for (const m of members) {
    const other = m.ambient
      ? db.ambientCurves.get(`${roomId}|${m.userId}`)
      : db.curves.get(m.userId)?.points;
    if (!other) continue;
    best = Math.max(best, matchPercent(points, other));
  }
  return best;
}

function seedAmbient(room: RoomState, userPoints: CurvePoints) {
  // pick the two companions whose warped curves sit closest to this day
  const ranked = AMBIENT_POOL.map((a) => {
    const c = warpCurve(userPoints, a.warp);
    return { a, c, sim: similarity(userPoints, c) };
  })
    .sort((x, y) => y.sim - x.sim)
    .slice(0, 2);

  let delay = 2200;
  for (const { a, c } of ranked) {
    const userId = uid("ambient");
    room.members.push({ userId, emoji: a.emoji, joinedAt: Date.now(), ambient: true });
    db.ambientCurves.set(`${room.roomId}|${userId}`, c);
    // queue gentle opening lines slightly in the future; getRoom reveals them in time
    for (const line of a.lines.slice(0, 1)) {
      room.messages.push({
        id: uid("msg"),
        roomId: room.roomId,
        userId,
        emoji: a.emoji,
        text: line,
        ts: Date.now() + delay,
      });
      delay += 3400 + Math.floor(Math.random() * 2600);
    }
  }
}

function maybeAmbientReply(room: RoomState) {
  const ambient = room.members.filter((m) => m.ambient);
  if (ambient.length === 0) return;
  const ambientMsgCount = room.messages.filter((m) =>
    ambient.some((a) => a.userId === m.userId),
  ).length;
  if (ambientMsgCount > 4) return; // don't overdo it
  const who = ambient[Math.floor(Math.random() * ambient.length)];
  const pool = AMBIENT_POOL.find((a) => a.emoji === who.emoji);
  const line = pool?.lines[1] ?? "i feel that.";
  room.messages.push({
    id: uid("msg"),
    roomId: room.roomId,
    userId: who.userId,
    emoji: who.emoji,
    text: line,
    ts: Date.now() + 2600 + Math.floor(Math.random() * 2400),
  });
}

// ── Public API ─────────────────────────────────────────────────────────────

function affinityPercentMem(depth: number): number {
  if (!depth) return 74;
  return Math.min(98, 70 + depth * 6);
}

// Affinity matching (in-memory mirror of store-ddb): deepest shared branch first.
function submitByAffinityMem(
  userId: string,
  emoji: string,
  points: CurvePoints,
  affKeys: string[],
): MatchResult {
  const now = Date.now();
  let room: RoomState | undefined;
  let matchedDepth = 0;

  for (const key of affKeys) {
    room = [...db.rooms.values()].find(
      (r) =>
        r.expiresAt > now &&
        r.members.filter((m) => !m.ambient).length < ROOM_CAP &&
        !r.members.some((m) => m.userId === userId) &&
        (db.roomAff.get(r.roomId)?.has(key) ?? false),
    );
    if (room) {
      matchedDepth = key.split(">").length;
      break;
    }
  }

  if (!room) {
    const roomId = uid("room");
    room = {
      roomId,
      date: today(),
      signature: "",
      members: [],
      messages: [],
      expiresAt: nextMidnight(),
    };
    db.rooms.set(roomId, room);
    db.roomAff.set(roomId, new Set());
    seedAmbient(room, points);
  }

  const keys = db.roomAff.get(room.roomId) ?? new Set<string>();
  affKeys.forEach((k) => keys.add(k));
  db.roomAff.set(room.roomId, keys);

  room.members.push({ userId, emoji, joinedAt: now });

  return {
    roomId: room.roomId,
    matchPercent: affinityPercentMem(matchedDepth),
    signature: "",
    you: { userId, emoji, joinedAt: now },
  };
}

function submitCurveMem(
  userId: string,
  emoji: string,
  points: CurvePoints,
  affKeys: string[] = [],
): MatchResult {
  if (affKeys.length) return submitByAffinityMem(userId, emoji, points, affKeys);
  const date = today();
  const signature = signatureOf(points);
  db.curves.set(userId, { userId, emoji, points, signature, date, roomId: undefined });

  // 1) try to join an open room in the same shape-bucket (the GSI1 query)
  let room = [...db.rooms.values()].find(
    (r) =>
      r.date === date &&
      r.signature === signature &&
      r.expiresAt > Date.now() &&
      r.members.filter((m) => !m.ambient).length < ROOM_CAP &&
      !r.members.some((m) => m.userId === userId),
  );

  // 2) otherwise open a fresh room and seed it with ambient company
  if (!room) {
    const roomId = uid("room");
    room = {
      roomId,
      date,
      signature,
      members: [],
      messages: [],
      expiresAt: nextMidnight(),
    };
    db.rooms.set(roomId, room);
    seedAmbient(room, points);
  }

  const you: Member = { userId, emoji, joinedAt: Date.now() };
  room.members.push(you);
  const rec = db.curves.get(userId);
  if (rec) rec.roomId = room.roomId;

  const percent = Math.max(
    closestMatch(points, room.members.filter((m) => m.userId !== userId), room.roomId),
    Math.round(MATCH_THRESHOLD * 100), // never colder than the join threshold
  );

  return { roomId: room.roomId, matchPercent: percent, signature, you };
}

function getRoomMem(roomId: string): RoomState | null {
  const room = db.rooms.get(roomId);
  if (!room) return null;
  const now = Date.now();
  return {
    ...room,
    members: room.members,
    // only reveal messages whose (possibly future) timestamp has arrived
    messages: room.messages
      .filter((m) => m.ts <= now)
      .sort((a, b) => a.ts - b.ts),
    expiresAt: room.expiresAt,
  };
}

function postMessageMem(
  roomId: string,
  userId: string,
  emoji: string,
  text: string,
): Message | null {
  const room = db.rooms.get(roomId);
  if (!room) return null;
  const clean = text.trim().slice(0, 500);
  if (!clean) return null;
  const msg: Message = {
    id: uid("msg"),
    roomId,
    userId,
    emoji,
    text: clean,
    ts: Date.now(),
  };
  room.messages.push(msg);
  maybeAmbientReply(room);
  return msg;
}

// ── Dispatch: real DynamoDB when configured, in-memory otherwise ─────────────
// All three are async so the API routes have a single uniform contract.

export async function submitCurve(
  userId: string,
  emoji: string,
  points: CurvePoints,
  affKeys: string[] = [],
): Promise<MatchResult> {
  return ddbConfigured
    ? ddb.submitCurve(userId, emoji, points, affKeys)
    : submitCurveMem(userId, emoji, points, affKeys);
}

export async function getRoom(roomId: string): Promise<RoomState | null> {
  return ddbConfigured ? ddb.getRoom(roomId) : getRoomMem(roomId);
}

export async function postMessage(
  roomId: string,
  userId: string,
  emoji: string,
  text: string,
): Promise<Message | null> {
  return ddbConfigured
    ? ddb.postMessage(roomId, userId, emoji, text)
    : postMessageMem(roomId, userId, emoji, text);
}

// ── permanent profile ───────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  if (ddbConfigured) return ddb.getProfile(userId);
  return db.profiles.get(userId) ?? null;
}

export async function saveProfile(profile: Profile): Promise<Profile> {
  if (ddbConfigured) return ddb.saveProfile(profile);
  db.profiles.set(profile.userId, profile);
  return profile;
}
