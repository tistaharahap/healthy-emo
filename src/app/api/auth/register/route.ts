import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import type { UserDocument } from "@/models/User";
import type { Types } from "mongoose";
import {
  createSessionToken,
  getAuthCookieName,
  getAuthCookieOptions
} from "@/lib/auth";

async function parseBody(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await request.json()) as { username?: string; password?: string };
  }
  const form = await request.formData();
  return {
    username: form.get("username")?.toString(),
    password: form.get("password")?.toString()
  };
}

export async function POST(request: Request) {
  await connectToDatabase();
  const body = await parseBody(request);
  const username = (body.username ?? "").trim();
  const password = (body.password ?? "").trim();
  const isForm =
    !(request.headers.get("content-type") ?? "").includes("application/json");

  if (!username || !password) {
    if (isForm) {
      return NextResponse.redirect(
        new URL("/register?error=missing", request.url)
      );
    }
    return NextResponse.json({ error: "Missing username or password." }, { status: 400 });
  }

  const usernameLower = username.toLowerCase();
  const existing = await User.findOne({ usernameLower }).lean<
    UserDocument & { _id: Types.ObjectId }
  >();
  if (existing) {
    if (isForm) {
      return NextResponse.redirect(
        new URL("/register?error=exists", request.url)
      );
    }
    return NextResponse.json({ error: "Username already taken." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, usernameLower, passwordHash });

  const token = await createSessionToken({
    userId: user._id.toString(),
    username: user.username
  });

  const response = NextResponse.redirect(new URL("/entries", request.url));
  response.cookies.set(getAuthCookieName(), token, getAuthCookieOptions());
  return response;
}
