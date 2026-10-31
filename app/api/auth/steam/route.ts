import { NextRequest, NextResponse } from "next/server";
import { isSteamConfigured, makeCookie, STATE_COOKIE } from "../../../../lib/steam";
export const dynamic = "force-dynamic";
export function GET(request: NextRequest) {
  if (!isSteamConfigured()) return NextResponse.json({ message: "L'authentification Steam n'est pas encore configurée." }, { status: 503 });
  const origin = new URL(request.url).origin;
  const state = crypto.randomUUID().replace(/-/g, "");
  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": `${origin}/api/auth/steam/callback?state=${state}`,
    "openid.realm": origin + "/",
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
  });
  const response = NextResponse.redirect("https://steamcommunity.com/openid/login?" + params.toString());
  response.headers.append("Set-Cookie", makeCookie(STATE_COOKIE, state, 600));
  response.headers.set("Cache-Control", "no-store");
  return response;
}
