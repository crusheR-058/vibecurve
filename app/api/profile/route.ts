import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { getProfile, saveProfile } from "@/lib/store";
import { deriveEmoji } from "@/lib/profileEmoji";
import type { Profile, ProfileAnswer } from "@/lib/types";

// GET /api/profile → the signed-in user's permanent profile (or null).
export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const profile = await getProfile(email);
  return NextResponse.json({ profile });
}

// POST /api/profile → create/update the walkthrough profile (never expires).
// Identity comes from the session, not the body.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let body: { words?: string; track?: string; answers?: ProfileAnswer[]; describe?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const words = (body.words ?? "").trim().slice(0, 60);
  if (!words) return NextResponse.json({ error: "words required" }, { status: 400 });
  if (!Array.isArray(body.answers) || body.answers.length === 0) {
    return NextResponse.json({ error: "answers required" }, { status: 400 });
  }

  const existing = await getProfile(email);
  const now = Date.now();
  const profile: Profile = {
    userId: email,
    words,
    emoji: deriveEmoji(words),
    track: (body.track ?? "").slice(0, 24),
    answers: body.answers.slice(0, 20),
    describe: body.describe?.trim().slice(0, 280) || undefined,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  try {
    await saveProfile(profile);
    return NextResponse.json({ profile });
  } catch (err) {
    console.error("saveProfile failed", err);
    return NextResponse.json({ error: "could not save profile" }, { status: 500 });
  }
}
