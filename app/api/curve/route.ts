import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { submitCurve, getProfile } from "@/lib/store";
import { POINT_COUNT } from "@/lib/curve";
import { affinityKeys } from "@/lib/domains";
import type { CurvePoints } from "@/lib/types";

// POST /api/curve
// Draw triggers a match. Identity + interests come from the signed-in profile;
// people are roomed by their deepest shared interest branch (affinity keys).
export async function POST(req: Request) {
  let body: { userId?: string; emoji?: string; points?: number[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? null;
  const userId = email ?? body.userId;

  const { emoji, points } = body;
  if (
    !userId ||
    !emoji ||
    !Array.isArray(points) ||
    points.length !== POINT_COUNT ||
    points.some((p) => typeof p !== "number" || p < 0 || p > 10)
  ) {
    return NextResponse.json({ error: "invalid curve" }, { status: 400 });
  }

  try {
    const profile = email ? await getProfile(email) : null;
    const keys = profile ? affinityKeys(profile.domains) : [];
    const result = await submitCurve(
      userId,
      emoji,
      points.map((p) => Math.round(p)) as CurvePoints,
      keys,
    );
    return NextResponse.json(result);
  } catch (err) {
    console.error("submitCurve failed", err);
    return NextResponse.json({ error: "matching failed" }, { status: 500 });
  }
}
