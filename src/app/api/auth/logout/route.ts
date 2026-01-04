import { NextResponse } from "next/server";
import { getAuthCookieName, getAuthCookieOptions } from "@/lib/auth";
import { getRequestOrigin } from "@/lib/redirect";

export async function POST(request: Request) {
  const origin = await getRequestOrigin(request);
  const response = NextResponse.redirect(new URL("/login", origin), 303);
  response.cookies.delete({
    name: getAuthCookieName(),
    path: getAuthCookieOptions().path
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
