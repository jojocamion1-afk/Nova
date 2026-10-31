import { NextRequest, NextResponse } from "next/server";
import { readSession } from "../../../../lib/steam";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  const steamId = await readSession(request);
  return NextResponse.json(steamId ? { authenticated: true, steamId } : { authenticated: false }, { headers: { "Cache-Control": "no-store" } });
}
