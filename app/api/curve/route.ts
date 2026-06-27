import { NextResponse } from "next/server";
import { submitCurve } from "@/lib/store";
import { POINT_COUNT } from "@/lib/curve";
import type { CurvePoints } from "@/lib/types";

// POST /api/curve
// body: { userId, emoji, points: number[5] }
// -> writes today's curve, matches into a Parallel Room, returns the match.
export async function POST(req: Request) {
  let body: { userId?: string; emoji?: string; points?: number[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { userId, emoji, points } = body;
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
    const result = await submitCurve(
      userId,
      emoji,
      points.map((p) => Math.round(p)) as CurvePoints,
    );
    return NextResponse.json(result);
  } catch (err) {
    console.error("submitCurve failed", err);
    return NextResponse.json({ error: "matching failed" }, { status: 500 });
  }
}
