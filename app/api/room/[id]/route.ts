import { NextResponse } from "next/server";
import { getRoom, postMessage } from "@/lib/store";

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

// POST /api/room/:id  -> send a message. body: { userId, emoji, text }
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let body: { userId?: string; emoji?: string; text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const { userId, emoji, text } = body;
  if (!userId || !emoji || !text) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }
  try {
    const msg = await postMessage(id, userId, emoji, text);
    if (!msg) return NextResponse.json({ error: "could not post" }, { status: 400 });
    return NextResponse.json(msg);
  } catch (err) {
    console.error("postMessage failed", err);
    return NextResponse.json({ error: "could not post" }, { status: 500 });
  }
}
