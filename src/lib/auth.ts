import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const AUTH_COOKIE = "he-session";

type SessionPayload = {
  userId: string;
  username: string;
};

const encoder = new TextEncoder();

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return encoder.encode(secret);
}

export function getAuthCookieName() {
  return AUTH_COOKIE;
}

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production"
  };
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT({ username: payload.username })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getJwtSecret());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (!payload.sub || typeof payload.username !== "string") {
      return null;
    }
    return { userId: payload.sub, username: payload.username };
  } catch {
    return null;
  }
}

type CookieReader = {
  get: (name: string) => { value: string } | undefined;
};

export async function getUserFromCookieStore(cookieStore: CookieReader) {
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) {
    return null;
  }
  return verifySessionToken(token);
}

export async function getUserFromCookies() {
  const cookieStore = await cookies();
  return getUserFromCookieStore(cookieStore);
}

export async function requireUser() {
  const session = await getUserFromCookies();
  if (!session) {
    redirect("/login");
  }
  return session;
}
