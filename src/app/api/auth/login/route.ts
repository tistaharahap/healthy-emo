import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
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
        new URL("/login?error=missing", request.url)
      );
    }
    return NextResponse.json({ error: "Missing username or password." }, { status: 400 });
  }

  const user = await User.findOne({
    usernameLower: username.toLowerCase()
  }).lean();
  if (!user) {
    if (isForm) {
      return NextResponse.redirect(new URL("/login?error=invalid", request.url));
    }
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    if (isForm) {
      return NextResponse.redirect(new URL("/login?error=invalid", request.url));
    }
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const token = await createSessionToken({
    userId: user._id.toString(),
    username: user.username
  });

  const response = NextResponse.redirect(new URL("/entries", request.url));
  response.cookies.set(getAuthCookieName(), token, getAuthCookieOptions());
  return response;
}
