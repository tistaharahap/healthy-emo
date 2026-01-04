import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { Entry } from "@/models/Entry";
import { getUserFromCookieStore } from "@/lib/auth";
import { getFeeling } from "@/lib/feelings";
import { getUtcDateFromInput } from "@/lib/dates";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getParams(context: RouteContext) {
  return context.params;
}

export async function GET(_: Request, context: RouteContext) {
  await connectToDatabase();
  const session = await getUserFromCookieStore(await cookies());
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const { id } = await getParams(context);

  const entry = await Entry.findOne({
    _id: id,
    userId: session.userId
  }).lean();

  if (!entry) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({ entry });
}

export async function PUT(request: Request, context: RouteContext) {
  await connectToDatabase();
  const session = await getUserFromCookieStore(await cookies());
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const { id } = await getParams(context);

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

  const entry = await Entry.findOneAndUpdate(
    { _id: id, userId: session.userId },
    {
      date: getUtcDateFromInput(body.date),
      feelingLabel: feeling.label,
      feelingScore: feeling.score,
      reason: body.reason.trim(),
      imageUrl: body.imageUrl ?? undefined
    },
    { new: true }
  ).lean();

  if (!entry) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({ entry });
}

export async function DELETE(_: Request, context: RouteContext) {
  await connectToDatabase();
  const session = await getUserFromCookieStore(await cookies());
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const { id } = await getParams(context);

  const entry = await Entry.findOneAndDelete({
    _id: id,
    userId: session.userId
  }).lean();

  if (!entry) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
