import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { Entry } from "@/models/Entry";
import { getUserFromCookieStore } from "@/lib/auth";
import { getFeeling } from "@/lib/feelings";
import { getUtcDateFromInput } from "@/lib/dates";

export async function GET() {
  await connectToDatabase();
  const session = await getUserFromCookieStore(await cookies());
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const entries = await Entry.find({ userId: session.userId })
    .sort({ date: -1 })
    .lean();
  return NextResponse.json({ entries });
}

export async function POST(request: Request) {
  await connectToDatabase();
  const session = await getUserFromCookieStore(await cookies());
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as {
    date?: string;
    feelingLabel?: string;
    reason?: string;
    imageUrl?: string | null;
  };

  const feeling = body.feelingLabel ? getFeeling(body.feelingLabel) : null;
  if (!body.date || !feeling || !body.reason?.trim()) {
    return NextResponse.json({ error: "Invalid entry data." }, { status: 400 });
  }

  const entry = await Entry.create({
    userId: session.userId,
    date: getUtcDateFromInput(body.date),
    feelingLabel: feeling.label,
    feelingScore: feeling.score,
    reason: body.reason.trim(),
    imageUrl: body.imageUrl ?? undefined
  });

  return NextResponse.json({ entry });
}
