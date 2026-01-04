import { NextResponse } from "next/server";
import { getAuthCookieName, getAuthCookieOptions } from "@/lib/auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  response.cookies.delete({
    name: getAuthCookieName(),
    path: getAuthCookieOptions().path
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
