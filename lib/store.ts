import type {
  CallParticipant,
  CallSignal,
  CurvePoints,
  MatchResult,
  Member,
  Message,
  MessageInput,
  Profile,
  RoomState,
} from "./types";
import { safeAudioMime } from "./voice";

/** A call presence is considered live only while its heartbeat is recent. */
const CALL_STALE_MS = 10_000;
import {
  MATCH_THRESHOLD,
  blendedMatchPercent,
  matchPercent,
  signatureOf,
  similarity,
} from "./curve";
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
  audio: Map<string, { audio: string; mime: string }>; // roomId|msgId -> voice blob (kept apart from the poll)
  callPresence: Map<string, Map<string, CallParticipant>>; // roomId -> userId -> presence
  callSignals: Map<string, CallSignal[]>; // roomId -> pending signaling queue
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
    audio: new Map(),
    callPresence: new Map(),
    callSignals: new Map(),
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
        kind: "text",
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
    kind: "text",
    text: line,
    ts: Date.now() + 2600 + Math.floor(Math.random() * 2400),
  });
}

// ── Public API ─────────────────────────────────────────────────────────────

// Best day-shape similarity (0..1) between `points` and the souls already in a
// room — real members first (their curves live in db.curves), falling back to
// the room's ambient companions when you're the first real soul. Excludes self.
function bestRoomSimilarity(points: CurvePoints, room: RoomState, selfId: string): number {
  let best = 0;
  let sawReal = false;
  for (const m of room.members) {
    if (m.userId === selfId || m.ambient) continue;
    const other = db.curves.get(m.userId)?.points;
    if (!other) continue;
    sawReal = true;
    best = Math.max(best, similarity(points, other));
  }
  if (sawReal) return best;
  for (const m of room.members) {
    if (!m.ambient) continue;
    const other = db.ambientCurves.get(`${room.roomId}|${m.userId}`);
    if (other) best = Math.max(best, similarity(points, other));
  }
  return best;
}

// Affinity matching (in-memory mirror of store-ddb): interests choose the
// candidate pool (deepest shared branch first); the drawn curve then chooses the
// room within it, so you land with the soul who shares your interest AND felt
// today most like you. The shown % is an honest day-shape similarity.
function submitByAffinityMem(
  userId: string,
  emoji: string,
  points: CurvePoints,
  affKeys: string[],
): MatchResult {
  const now = Date.now();
  const date = today();
  // persist my curve so this room and future souls can compare day-shapes
  db.curves.set(userId, {
    userId,
    emoji,
    points,
    signature: signatureOf(points),
    date,
    roomId: undefined,
  });

  let room: RoomState | undefined;
  let matchedDepth = 0;

  for (const key of affKeys) {
    const candidates = [...db.rooms.values()].filter(
      (r) =>
        r.expiresAt > now &&
        r.members.filter((m) => !m.ambient).length < ROOM_CAP &&
        !r.members.some((m) => m.userId === userId) &&
        (db.roomAff.get(r.roomId)?.has(key) ?? false),
    );
    if (!candidates.length) continue;
    // the curve breaks the tie within this interest pool
    let bestSim = -1;
    for (const r of candidates) {
      const s = bestRoomSimilarity(points, r, userId);
      if (s > bestSim) {
        bestSim = s;
        room = r;
      }
    }
    matchedDepth = key.split(">").length;
    break;
  }

  if (!room) {
    const roomId = uid("room");
    room = {
      roomId,
      date,
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

  // honest day-shape closeness to whoever is already here (real, else ambient),
  // measured before I join so I'm not compared against myself
  const sim = bestRoomSimilarity(points, room, userId);

  room.members.push({ userId, emoji, joinedAt: now });
  const rec = db.curves.get(userId);
  if (rec) rec.roomId = room.roomId;

  return {
    roomId: room.roomId,
    matchPercent: blendedMatchPercent(sim, matchedDepth),
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
    members: [...room.members], // copy so callers can't mutate the live store
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
  input: MessageInput,
): Message | null {
  const room = db.rooms.get(roomId);
  if (!room) return null;
  const base = { id: uid("msg"), roomId, userId, emoji, ts: Date.now() };

  let msg: Message;
  if (input.kind === "sticker" || input.kind === "gif") {
    if (!input.stickerId) return null;
    msg = { ...base, kind: input.kind, text: "", stickerId: input.stickerId };
  } else if (input.kind === "voice") {
    if (!input.audio) return null;
    const duration = Math.min(31, Math.max(1, Math.round(input.duration ?? 0)));
    const mime = safeAudioMime(input.mime);
    msg = { ...base, kind: "voice", text: "", duration, mime };
    // keep the clip out of room.messages so the 1.2s poll never re-ships it
    db.audio.set(`${roomId}|${msg.id}`, { audio: input.audio, mime });
  } else {
    const clean = (input.text ?? "").trim().slice(0, 500);
    if (!clean) return null;
    msg = { ...base, kind: "text", text: clean };
  }

  room.messages.push(msg);
  maybeAmbientReply(room);
  return msg;
}

function getMessageMediaMem(
  roomId: string,
  msgId: string,
): { audio: string; mime: string } | null {
  return db.audio.get(`${roomId}|${msgId}`) ?? null;
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
  input: MessageInput,
): Promise<Message | null> {
  return ddbConfigured
    ? ddb.postMessage(roomId, userId, emoji, input)
    : postMessageMem(roomId, userId, emoji, input);
}

// Voice clips live apart from the message (and outside getRoom) so the poll
// stays light; the player fetches them once, on demand.
export async function getMessageMedia(
  roomId: string,
  msgId: string,
): Promise<{ audio: string; mime: string } | null> {
  return ddbConfigured
    ? ddb.getMessageMedia(roomId, msgId)
    : getMessageMediaMem(roomId, msgId);
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

// ── group voice call: presence + signaling (in-memory mirror) ───────────────

function callPresenceMap(roomId: string): Map<string, CallParticipant> {
  let m = db.callPresence.get(roomId);
  if (!m) {
    m = new Map();
    db.callPresence.set(roomId, m);
  }
  return m;
}

function callJoinMem(roomId: string, userId: string, emoji: string) {
  callPresenceMap(roomId).set(userId, { userId, emoji, lastSeen: Date.now() });
}

function callLeaveMem(roomId: string, userId: string) {
  db.callPresence.get(roomId)?.delete(userId);
  const q = db.callSignals.get(roomId);
  if (q) db.callSignals.set(roomId, q.filter((s) => s.to !== userId && s.from !== userId));
}

function callSignalMem(roomId: string, sig: CallSignal) {
  const q = db.callSignals.get(roomId) ?? [];
  q.push(sig);
  // guard against runaway accumulation if a recipient never polls
  db.callSignals.set(roomId, q.length > 800 ? q.slice(-800) : q);
}

function callPollMem(
  roomId: string,
  me: string,
): { participants: CallParticipant[]; signals: CallSignal[] } {
  const now = Date.now();
  const m = callPresenceMap(roomId);
  for (const [uid, p] of m) if (now - p.lastSeen > CALL_STALE_MS) m.delete(uid);
  const participants = [...m.values()];

  const q = db.callSignals.get(roomId) ?? [];
  const signals = q.filter((s) => s.to === me); // delivered once…
  db.callSignals.set(roomId, q.filter((s) => s.to !== me)); // …then dropped
  return { participants, signals };
}

export async function callJoin(roomId: string, userId: string, emoji: string): Promise<void> {
  return ddbConfigured ? ddb.joinCall(roomId, userId, emoji) : void callJoinMem(roomId, userId, emoji);
}

export async function callHeartbeat(roomId: string, userId: string, emoji: string): Promise<void> {
  // heartbeat is just a presence refresh
  return ddbConfigured ? ddb.joinCall(roomId, userId, emoji) : void callJoinMem(roomId, userId, emoji);
}

export async function callLeave(roomId: string, userId: string): Promise<void> {
  return ddbConfigured ? ddb.leaveCall(roomId, userId) : void callLeaveMem(roomId, userId);
}

export async function callSignal(roomId: string, sig: CallSignal): Promise<void> {
  return ddbConfigured ? ddb.sendSignal(roomId, sig) : void callSignalMem(roomId, sig);
}

export async function callPoll(
  roomId: string,
  me: string,
): Promise<{ participants: CallParticipant[]; signals: CallSignal[] }> {
  return ddbConfigured ? ddb.pollCall(roomId, me) : callPollMem(roomId, me);
}
