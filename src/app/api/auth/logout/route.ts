import { NextResponse } from "next/server";
import { getAuthCookieName, getAuthCookieOptions } from "@/lib/auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.set(getAuthCookieName(), "", {
    ...getAuthCookieOptions(),
    maxAge: 0
  });
  return response;
}
