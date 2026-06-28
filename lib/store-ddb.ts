import {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { doc, TABLE } from "./ddb";
import {
  MATCH_THRESHOLD,
  blendedMatchPercent,
  matchPercent,
  signatureOf,
  similarity,
} from "./curve";
import { midnightTtlSeconds, nextMidnight, today } from "./time";
import type { CurvePoints, MatchResult, Member, Message, Profile, RoomState } from "./types";

/**
 * DynamoDB single-table implementation (playbook §10.1). Mirrors lib/store.ts's
 * in-memory behaviour exactly, including the ambient companions, so the UI is
 * unchanged. Every item carries a `ttl` (unix seconds) set to local midnight so
 * DynamoDB TTL eventually reaps it; the app additionally enforces expiry by
 * `expiresAt` so behaviour is correct even before TTL physically deletes.
 *
 * Item shapes (single table, keys PK/SK, GSI1 = GSI1PK/GSI1SK):
 *   Curve   PK=USER#{uid}  SK=CURVE#{date}   points,bucket,roomId  GSI1PK=DATE#{date}#BUCKET#{sig} GSI1SK=USER#{uid}
 *   Room    PK=ROOM#{rid}  SK=META           date,signature,memberCount,expiresAt
 *   Member  PK=ROOM#{rid}  SK=MEMBER#{uid}   emoji,joinedAt,ambient,points
 *   Message PK=ROOM#{rid}  SK=MSG#{ts}#{uid} text,emoji,userId,ts
 */

const ROOM_CAP = 5;

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

interface CurveRow {
  userId: string;
  points: CurvePoints;
  roomId?: string;
}

interface AnyItem {
  SK: string;
  [k: string]: unknown;
}

// ── public API (matches lib/store.ts signatures, async) ─────────────────────

// Best day-shape similarity (0..1) between `points` and a room's member curves —
// real souls first, falling back to the ambient companions when you're first in.
function bestSimilarity(points: CurvePoints, memberItems: AnyItem[]): number {
  let best = 0;
  let sawReal = false;
  for (const it of memberItems) {
    if (it.ambient) continue;
    const p = it.points as CurvePoints | undefined;
    if (!p) continue;
    sawReal = true;
    best = Math.max(best, similarity(points, p));
  }
  if (sawReal) return best;
  for (const it of memberItems) {
    if (!it.ambient) continue;
    const p = it.points as CurvePoints | undefined;
    if (p) best = Math.max(best, similarity(points, p));
  }
  return best;
}

function bestSimilarityOf(points: CurvePoints, pool: CurvePoints[]): number {
  let best = 0;
  for (const p of pool) best = Math.max(best, similarity(points, p));
  return best;
}

function isCapacityRace(e: unknown): boolean {
  return e instanceof Error && e.name === "ConditionalCheckFailedException";
}

export async function submitCurve(
  userId: string,
  emoji: string,
  points: CurvePoints,
  affKeys: string[] = [],
): Promise<MatchResult> {
  if (affKeys.length) return submitByAffinity(userId, emoji, points, affKeys);
  return submitBySignature(userId, emoji, points);
}

// Affinity matching: interests choose the candidate pool (deepest shared branch
// first), then the drawn curve chooses the room within it — you land with the
// soul who shares your interest AND felt today most like you. The shown % is an
// honest day-shape similarity, lifted slightly by how deep the shared branch runs.
async function submitByAffinity(
  userId: string,
  emoji: string,
  points: CurvePoints,
  affKeys: string[],
): Promise<MatchResult> {
  const d = doc();
  const date = today();
  const ttl = midnightTtlSeconds();
  const expiresAt = nextMidnight();
  const now = Date.now();

  let roomId: string | undefined;
  let matchedDepth = 0;
  let bestSim = 0;

  for (const key of affKeys) {
    const res = await d.send(
      new QueryCommand({
        TableName: TABLE,
        IndexName: "GSI1",
        KeyConditionExpression: "GSI1PK = :pk",
        ExpressionAttributeValues: { ":pk": `DATE#${date}#AFF#${key}` },
      }),
    );
    const rids = [...new Set((res.Items ?? []).map((it) => it.roomId as string).filter(Boolean))];

    // the curve breaks the tie within this interest pool: pick the open room
    // whose souls felt today most like you
    let chosen: string | undefined;
    let chosenSim = -1;
    for (const rid of rids) {
      const room = await d.send(
        new QueryCommand({
          TableName: TABLE,
          KeyConditionExpression: "PK = :pk",
          ExpressionAttributeValues: { ":pk": `ROOM#${rid}` },
        }),
      );
      const items = (room.Items ?? []) as AnyItem[];
      const meta = items.find((i) => i.SK === "META");
      if (!meta || (meta.expiresAt as number) <= now || (meta.memberCount as number) >= ROOM_CAP) {
        continue;
      }
      const memberItems = items.filter((i) => i.SK.startsWith("MEMBER#"));
      if (memberItems.some((i) => i.userId === userId)) continue; // already here — don't re-join
      const sim = bestSimilarity(points, memberItems);
      if (sim > chosenSim) {
        chosenSim = sim;
        chosen = rid;
      }
    }
    if (chosen) {
      roomId = chosen;
      bestSim = Math.max(0, chosenSim);
      matchedDepth = key.split(">").length;
      break;
    }
  }

  // open a fresh room seeded with close ambient company; count me immediately
  const openFresh = async (): Promise<string> => {
    const rid = uid("room");
    await d.send(
      new PutCommand({
        TableName: TABLE,
        Item: { PK: `ROOM#${rid}`, SK: "META", date, signature: "", memberCount: 1, expiresAt, ttl },
      }),
    );
    const ambient = await seedAmbient(rid, points, ttl);
    bestSim = bestSimilarityOf(points, ambient);
    matchedDepth = 0;
    return rid;
  };

  if (!roomId) {
    roomId = await openFresh();
  } else {
    // atomic join: bump the count only if the room still has space — this closes
    // the check-then-write race where two souls fill the last seat at once
    try {
      await d.send(
        new UpdateCommand({
          TableName: TABLE,
          Key: { PK: `ROOM#${roomId}`, SK: "META" },
          UpdateExpression: "ADD memberCount :one",
          ConditionExpression: "attribute_not_exists(memberCount) OR memberCount < :cap",
          ExpressionAttributeValues: { ":one": 1, ":cap": ROOM_CAP },
        }),
      );
    } catch (e) {
      if (!isCapacityRace(e)) throw e;
      roomId = await openFresh(); // it filled the instant we joined — no one is turned away
    }
  }

  await d.send(
    new PutCommand({
      TableName: TABLE,
      Item: { PK: `ROOM#${roomId}`, SK: `MEMBER#${userId}`, userId, emoji, joinedAt: now, points, ttl },
    }),
  );

  // index the room under each of our keys so future souls sharing any branch find it
  for (const key of affKeys) {
    await d.send(
      new PutCommand({
        TableName: TABLE,
        Item: {
          PK: `ROOM#${roomId}`,
          SK: `AFF#${key}`,
          roomId,
          GSI1PK: `DATE#${date}#AFF#${key}`,
          GSI1SK: `ROOM#${roomId}`,
          ttl,
        },
      }),
    );
  }

  return {
    roomId,
    matchPercent: blendedMatchPercent(bestSim, matchedDepth),
    signature: "",
    you: { userId, emoji, joinedAt: now },
  };
}

async function submitBySignature(
  userId: string,
  emoji: string,
  points: CurvePoints,
): Promise<MatchResult> {
  const d = doc();
  const date = today();
  const signature = signatureOf(points);
  const ttl = midnightTtlSeconds();
  const expiresAt = nextMidnight();
  const now = Date.now();

  // 1) who else is in today's shape-bucket (the GSI1 query)
  const bucket = await d.send(
    new QueryCommand({
      TableName: TABLE,
      IndexName: "GSI1",
      KeyConditionExpression: "GSI1PK = :pk",
      ExpressionAttributeValues: { ":pk": `DATE#${date}#BUCKET#${signature}` },
    }),
  );
  const candidates: CurveRow[] = (bucket.Items ?? [])
    .map((it) => ({ userId: it.userId as string, points: it.points as CurvePoints, roomId: it.roomId as string | undefined }))
    .filter((c) => c.userId && c.userId !== userId);

  // 2) try to join an open, unexpired room from those candidates
  let roomId: string | undefined;
  const candidateRoomIds = [...new Set(candidates.map((c) => c.roomId).filter(Boolean))] as string[];
  for (const rid of candidateRoomIds) {
    const meta = await d.send(
      new GetCommand({ TableName: TABLE, Key: { PK: `ROOM#${rid}`, SK: "META" } }),
    );
    const m = meta.Item;
    if (m && (m.expiresAt as number) > now && (m.memberCount as number) < ROOM_CAP) {
      roomId = rid;
      break;
    }
  }

  // 3) otherwise open a fresh room seeded with ambient company
  let ambientPoints: CurvePoints[] = [];
  if (!roomId) {
    roomId = uid("room");
    await d.send(
      new PutCommand({
        TableName: TABLE,
        Item: {
          PK: `ROOM#${roomId}`,
          SK: "META",
          date,
          signature,
          memberCount: 0,
          expiresAt,
          ttl,
        },
      }),
    );
    ambientPoints = await seedAmbient(roomId, points, ttl);
  }

  // 4) add self as a member + bump the room's real-member count
  await d.send(
    new PutCommand({
      TableName: TABLE,
      Item: { PK: `ROOM#${roomId}`, SK: `MEMBER#${userId}`, userId, emoji, joinedAt: now, ttl },
    }),
  );
  await d.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { PK: `ROOM#${roomId}`, SK: "META" },
      UpdateExpression: "ADD memberCount :one",
      ExpressionAttributeValues: { ":one": 1 },
    }),
  );

  // 5) write our curve (now tagged with the room) into the bucket index
  await d.send(
    new PutCommand({
      TableName: TABLE,
      Item: {
        PK: `USER#${userId}`,
        SK: `CURVE#${date}`,
        userId,
        points,
        bucket: signature,
        roomId,
        GSI1PK: `DATE#${date}#BUCKET#${signature}`,
        GSI1SK: `USER#${userId}`,
        ttl,
      },
    }),
  );

  // 6) honest match% vs the closest soul already here
  const others = candidates.filter((c) => c.roomId === roomId).map((c) => c.points);
  const pool = others.length ? others : ambientPoints;
  let best = 0;
  for (const p of pool) best = Math.max(best, matchPercent(points, p));
  const percent = Math.max(best, Math.round(MATCH_THRESHOLD * 100));

  return {
    roomId,
    matchPercent: percent,
    signature,
    you: { userId, emoji, joinedAt: now },
  };
}

export async function getRoom(roomId: string): Promise<RoomState | null> {
  const d = doc();
  const res = await d.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: { ":pk": `ROOM#${roomId}` },
    }),
  );
  const items = (res.Items ?? []) as AnyItem[];
  const meta = items.find((i) => i.SK === "META");
  if (!meta) return null;

  const now = Date.now();
  const members: Member[] = items
    .filter((i) => i.SK.startsWith("MEMBER#"))
    .map((i) => ({
      userId: i.userId as string,
      emoji: i.emoji as string,
      joinedAt: i.joinedAt as number,
      ambient: (i.ambient as boolean) || undefined,
    }))
    .sort((a, b) => a.joinedAt - b.joinedAt);

  const messages: Message[] = items
    .filter((i) => i.SK.startsWith("MSG#"))
    .map((i) => ({
      id: i.SK as string,
      roomId,
      userId: i.userId as string,
      emoji: i.emoji as string,
      text: i.text as string,
      ts: i.ts as number,
    }))
    .filter((m) => m.ts <= now)
    .sort((a, b) => a.ts - b.ts);

  return {
    roomId,
    date: meta.date as string,
    signature: meta.signature as string,
    members,
    messages,
    expiresAt: meta.expiresAt as number,
  };
}

export async function postMessage(
  roomId: string,
  userId: string,
  emoji: string,
  text: string,
): Promise<Message | null> {
  const clean = text.trim().slice(0, 500);
  if (!clean) return null;
  const d = doc();
  const ttl = midnightTtlSeconds();
  const ts = Date.now();
  const sk = `MSG#${ts}#${userId}`;

  await d.send(
    new PutCommand({
      TableName: TABLE,
      Item: { PK: `ROOM#${roomId}`, SK: sk, userId, emoji, text: clean, ts, ttl },
    }),
  );

  await maybeAmbientReply(roomId, ttl);

  return { id: sk, roomId, userId, emoji, text: clean, ts };
}

// ── permanent profile (no TTL — survives logout and midnight) ───────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  const d = doc();
  const res = await d.send(
    new GetCommand({ TableName: TABLE, Key: { PK: `USER#${userId}`, SK: "PROFILE" } }),
  );
  const it = res.Item;
  if (!it) return null;
  return {
    userId,
    words: it.words as string,
    emoji: it.emoji as string,
    domains: (it.domains as Profile["domains"]) ?? [],
    describe: it.describe as string | undefined,
    createdAt: it.createdAt as number,
    updatedAt: it.updatedAt as number,
  };
}

export async function saveProfile(p: Profile): Promise<Profile> {
  const d = doc();
  await d.send(
    new PutCommand({
      TableName: TABLE,
      Item: {
        PK: `USER#${p.userId}`,
        SK: "PROFILE",
        words: p.words,
        emoji: p.emoji,
        domains: p.domains,
        describe: p.describe,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        // intentionally NO ttl
      },
    }),
  );
  return p;
}

// ── ambient companions (demo warmth; remove once real liquidity exists) ─────

async function seedAmbient(
  roomId: string,
  userPoints: CurvePoints,
  ttl: number,
): Promise<CurvePoints[]> {
  const d = doc();
  const ranked = AMBIENT_POOL.map((a) => ({ a, c: warpCurve(userPoints, a.warp) }))
    .map((x) => ({ ...x, sim: similarity(userPoints, x.c) }))
    .sort((x, y) => y.sim - x.sim)
    .slice(0, 2);

  const points: CurvePoints[] = [];
  let delay = 2200;
  for (const { a, c } of ranked) {
    const auid = uid("ambient");
    points.push(c);
    await d.send(
      new PutCommand({
        TableName: TABLE,
        Item: {
          PK: `ROOM#${roomId}`,
          SK: `MEMBER#${auid}`,
          userId: auid,
          emoji: a.emoji,
          joinedAt: Date.now(),
          ambient: true,
          points: c,
          ttl,
        },
      }),
    );
    const ts = Date.now() + delay;
    await d.send(
      new PutCommand({
        TableName: TABLE,
        Item: {
          PK: `ROOM#${roomId}`,
          SK: `MSG#${ts}#${auid}`,
          userId: auid,
          emoji: a.emoji,
          text: a.lines[0],
          ts,
          ttl,
        },
      }),
    );
    delay += 3400 + Math.floor(Math.random() * 2600);
  }
  return points;
}

async function maybeAmbientReply(roomId: string, ttl: number): Promise<void> {
  const d = doc();
  const res = await d.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: { ":pk": `ROOM#${roomId}` },
    }),
  );
  const items = (res.Items ?? []) as AnyItem[];
  const ambient = items.filter((i) => i.SK.startsWith("MEMBER#") && i.ambient);
  if (ambient.length === 0) return;
  const ambientIds = new Set(ambient.map((a) => a.userId as string));
  const ambientMsgs = items.filter(
    (i) => i.SK.startsWith("MSG#") && ambientIds.has(i.userId as string),
  );
  if (ambientMsgs.length > 4) return;

  const who = ambient[Math.floor(Math.random() * ambient.length)];
  const pool = AMBIENT_POOL.find((a) => a.emoji === who.emoji);
  const line = pool?.lines[1] ?? "i feel that.";
  const ts = Date.now() + 2600 + Math.floor(Math.random() * 2400);
  await d.send(
    new PutCommand({
      TableName: TABLE,
      Item: {
        PK: `ROOM#${roomId}`,
        SK: `MSG#${ts}#${who.userId as string}`,
        userId: who.userId,
        emoji: who.emoji,
        text: line,
        ts,
        ttl,
      },
    }),
  );
}
