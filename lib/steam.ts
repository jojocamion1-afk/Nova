export const SESSION_COOKIE = "__Host-novacity_steam";
export const STATE_COOKIE = "__Host-novacity_state";
const STEAM_ID_RE = /^\d{17}$/;

function secret(): string | null {
  const value = process.env.STEAM_SESSION_SECRET;
  return typeof value === "string" && value.length >= 32 ? value : null;
}
async function hmacKey() {
  const value = secret();
  if (!value) return null;
  return crypto.subtle.importKey("raw", new TextEncoder().encode(value), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}
function bytesToBase64Url(bytes: Uint8Array): string {
  return btoa(Array.from(bytes, b => String.fromCharCode(b)).join("")).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function base64UrlToBytes(text: string): Uint8Array {
  if (!/^[\w-]+$/.test(text)) throw new Error("Invalid encoding");
  const raw = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, char => char.charCodeAt(0));
}
export function getCookie(request: Request, name: string): string | undefined {
  const cookie = request.headers.get("cookie") || "";
  const target = cookie.split(";").map(v => v.trim()).find(v => v.startsWith(name + "="));
  return target?.slice(name.length + 1);
}
export function makeCookie(name: string, value: string, maxAge: number): string {
  return `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}
export async function createSession(steamId: string): Promise<string> {
  const key = await hmacKey();
  if (!key || !STEAM_ID_RE.test(steamId)) throw new Error("Steam session unavailable");
  const payload = bytesToBase64Url(new TextEncoder().encode(JSON.stringify({ steamId, exp: Date.now() + 30 * 86400_000 })));
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)));
  return `${payload}.${bytesToBase64Url(signature)}`;
}
export async function readSession(request: Request): Promise<string | null> {
  try {
    const cookie = getCookie(request, SESSION_COOKIE);
    if (!cookie) return null;
    const [payload, signature, extra] = cookie.split(".");
    if (!payload || !signature || extra) return null;
    const key = await hmacKey();
    if (!key) return null;
    const signatureBytes = Uint8Array.from(base64UrlToBytes(signature));
    const valid = await crypto.subtle.verify("HMAC", key, signatureBytes.buffer, new TextEncoder().encode(payload));
    if (!valid) return null;
    const value = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload))) as { steamId?: string; exp?: number };
    if (!value.steamId || !STEAM_ID_RE.test(value.steamId) || !value.exp || value.exp < Date.now()) return null;
    return value.steamId;
  } catch { return null; }
}
export function isSteamConfigured() { return secret() !== null; }
