import { getMessageMedia } from "@/lib/store";

// GET /api/room/:id/media?m=<messageId>
// Streams a voice note's audio. Kept off the room poll so playback is fetched
// once, on demand, and the clip burns at midnight with the rest of the room.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const msgId = new URL(req.url).searchParams.get("m");
  if (!msgId) return new Response("missing id", { status: 400 });

  try {
    const media = await getMessageMedia(id, msgId);
    if (!media) return new Response("not found", { status: 404 });
    const bytes = Buffer.from(media.audio, "base64");
    return new Response(bytes, {
      headers: {
        "Content-Type": media.mime,
        "Content-Length": String(bytes.length),
        // immutable for the life of the room; it's gone at midnight regardless
        "Cache-Control": "private, max-age=3600, immutable",
      },
    });
  } catch (err) {
    console.error("getMessageMedia failed", err);
    return new Response("media unavailable", { status: 500 });
  }
}
