import { NextResponse } from "next/server";
import { makeCookie, SESSION_COOKIE, STATE_COOKIE } from "../../../../lib/steam";
export async function POST() {
  const response = NextResponse.json({ authenticated: false });
  response.headers.append("Set-Cookie", makeCookie(SESSION_COOKIE, "", 0));
  response.headers.append("Set-Cookie", makeCookie(STATE_COOKIE, "", 0));
  return response;
}
