import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserFromCookieStore } from "@/lib/auth";
import { createPresignedUpload } from "@/lib/s3";

export async function POST(request: Request) {
  const session = await getUserFromCookieStore(await cookies());
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as {
    fileName?: string;
    contentType?: string;
  };

  const fileName = body.fileName ?? "";
  const contentType = body.contentType ?? "";

  if (!fileName || !contentType.startsWith("image/")) {
    return NextResponse.json({ error: "Invalid file." }, { status: 400 });
  }

  const upload = await createPresignedUpload({
    userId: session.userId,
    fileName,
    contentType
  });

  return NextResponse.json(upload);
}
