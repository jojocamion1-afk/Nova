import { NextRequest, NextResponse } from "next/server";
import { createSession, getCookie, makeCookie, SESSION_COOKIE, STATE_COOKIE } from "../../../../../lib/steam";
export const dynamic = "force-dynamic";
const endpoint = "https://steamcommunity.com/openid/login";
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const fail = () => {
    const response = NextResponse.redirect(url.origin + "/?auth=error");
    response.headers.append("Set-Cookie", makeCookie(STATE_COOKIE, "", 0));
    return response;
  };
  const expectedState = getCookie(request, STATE_COOKIE);
  const state = url.searchParams.get("state");
  if (!state || !expectedState || !/^[a-f0-9]{32}$/.test(state) || state !== expectedState) return fail();
  const claimed = url.searchParams.get("openid.claimed_id");
  const identity = url.searchParams.get("openid.identity");
  // Steam documents the Claimed ID as HTTP, and some responses use HTTPS.
  // The protocol can vary, but the exact Steam host, path and SteamID must not.
  const match = claimed?.match(/^https?:\/\/steamcommunity\.com\/openid\/id\/(\d{17})$/);
  if (!match || identity !== claimed) return fail();
  if (url.searchParams.get("openid.mode") !== "id_res" || url.searchParams.get("openid.op_endpoint") !== endpoint) return fail();
  const returnTo = `${url.origin}/api/auth/steam/callback?state=${state}`;
  if (url.searchParams.get("openid.return_to") !== returnTo) return fail();
  const signed = (url.searchParams.get("openid.signed") || "").split(",");
  if (!["op_endpoint", "claimed_id", "identity", "return_to", "response_nonce", "assoc_handle"].every(k => signed.includes(k))) return fail();
  if (!url.searchParams.has("openid.sig") || !url.searchParams.has("openid.assoc_handle")) return fail();
  const nonce = url.searchParams.get("openid.response_nonce") || "";
  const timestamp = Date.parse(nonce.slice(0, 20));
  if (!Number.isFinite(timestamp) || Math.abs(Date.now() - timestamp) > 600_000) return fail();
  const data = new URLSearchParams();
  url.searchParams.forEach((value, key) => { if (key.startsWith("openid.")) data.set(key, value); });
  data.set("openid.mode", "check_authentication");
  try {
    const verified = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: data.toString(), signal: AbortSignal.timeout(8000) });
    if (!verified.ok || !/^is_valid:true\s*$/m.test(await verified.text())) return fail();
    const session = await createSession(match[1]);
    const response = NextResponse.redirect(url.origin + "/#boutique");
    response.headers.append("Set-Cookie", makeCookie(SESSION_COOKIE, session, 30 * 86400));
    response.headers.append("Set-Cookie", makeCookie(STATE_COOKIE, "", 0));
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch { return fail(); }
}
