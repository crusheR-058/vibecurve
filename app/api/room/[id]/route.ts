import { NextResponse } from "next/server";
import { getRoom, postMessage } from "@/lib/store";
import { STICKER_IDS } from "@/lib/stickers";
import { MAX_AUDIO_B64, isLikelyBase64 } from "@/lib/voice";
import type { MessageInput, MessageKind } from "@/lib/types";

// GET /api/room/:id  -> current room state (members + revealed messages).
// Polled every ~1.2s by the room screen (Streams in production).
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const room = await getRoom(id);
    if (!room) return NextResponse.json({ error: "room not found" }, { status: 404 });
    return NextResponse.json(room);
  } catch (err) {
    console.error("getRoom failed", err);
    return NextResponse.json({ error: "room unavailable" }, { status: 500 });
  }
}

// POST /api/room/:id  -> send a message.
// body: { userId, emoji, kind?, text? | stickerId? | (audio, mime, duration) }
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let body: {
    userId?: string;
    emoji?: string;
    kind?: MessageKind;
    text?: string;
    stickerId?: string;
    audio?: string;
    mime?: string;
    duration?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { userId, emoji } = body;
  if (!userId || !emoji) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const kind: MessageKind = body.kind ?? "text";
  let input: MessageInput;

  if (kind === "sticker" || kind === "gif") {
    if (!body.stickerId || !STICKER_IDS.has(body.stickerId)) {
      return NextResponse.json({ error: "unknown sticker" }, { status: 400 });
    }
    input = { kind, stickerId: body.stickerId };
  } else if (kind === "voice") {
    if (!isLikelyBase64(body.audio)) {
      return NextResponse.json({ error: "invalid audio" }, { status: 400 });
    }
    if (body.audio.length > MAX_AUDIO_B64) {
      return NextResponse.json({ error: "voice note too long" }, { status: 413 });
    }
    input = { kind, audio: body.audio, mime: body.mime, duration: body.duration };
  } else if (kind === "text") {
    if (!body.text || !body.text.trim()) {
      return NextResponse.json({ error: "empty message" }, { status: 400 });
    }
    input = { kind, text: body.text };
  } else {
    return NextResponse.json({ error: "unknown kind" }, { status: 400 });
  }

  try {
    const msg = await postMessage(id, userId, emoji, input);
    if (!msg) return NextResponse.json({ error: "could not post" }, { status: 400 });
    return NextResponse.json(msg);
  } catch (err) {
    console.error("postMessage failed", err);
    return NextResponse.json({ error: "could not post" }, { status: 500 });
  }
}
