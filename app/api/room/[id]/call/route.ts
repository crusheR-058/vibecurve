import { NextResponse } from "next/server";
import { callHeartbeat, callJoin, callLeave, callPoll, callSignal } from "@/lib/store";
import type { SignalKind } from "@/lib/types";

const SIGNAL_KINDS: SignalKind[] = ["offer", "answer", "candidate"];
const MAX_SIGNAL_BYTES = 20_000;

// GET /api/room/:id/call?me=<userId>
// Live roster of the room's voice call + any signaling addressed to you
// (delivered once, then deleted). Polled quickly only while you're in a call.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const me = new URL(req.url).searchParams.get("me");
  if (!me) return NextResponse.json({ error: "missing me" }, { status: 400 });
  try {
    const data = await callPoll(id, me);
    return NextResponse.json(data);
  } catch (err) {
    console.error("callPoll failed", err);
    return NextResponse.json({ error: "call unavailable" }, { status: 500 });
  }
}

// POST /api/room/:id/call  -> { action: join | heartbeat | leave | signal, ... }
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let body: {
    action?: string;
    userId?: string;
    emoji?: string;
    from?: string;
    to?: string;
    kind?: SignalKind;
    data?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  try {
    switch (body.action) {
      case "join":
      case "heartbeat": {
        if (!body.userId || !body.emoji) {
          return NextResponse.json({ error: "missing fields" }, { status: 400 });
        }
        if (body.action === "join") await callJoin(id, body.userId, body.emoji);
        else await callHeartbeat(id, body.userId, body.emoji);
        return NextResponse.json({ ok: true });
      }
      case "leave": {
        if (!body.userId) return NextResponse.json({ error: "missing fields" }, { status: 400 });
        await callLeave(id, body.userId);
        return NextResponse.json({ ok: true });
      }
      case "signal": {
        const { from, to, kind, data } = body;
        if (!from || !to || !kind || !SIGNAL_KINDS.includes(kind) || typeof data !== "string") {
          return NextResponse.json({ error: "bad signal" }, { status: 400 });
        }
        if (data.length > MAX_SIGNAL_BYTES) {
          return NextResponse.json({ error: "signal too large" }, { status: 413 });
        }
        await callSignal(id, { from, to, kind, data, ts: Date.now() });
        return NextResponse.json({ ok: true });
      }
      default:
        return NextResponse.json({ error: "unknown action" }, { status: 400 });
    }
  } catch (err) {
    console.error("call action failed", err);
    return NextResponse.json({ error: "call action failed" }, { status: 500 });
  }
}
