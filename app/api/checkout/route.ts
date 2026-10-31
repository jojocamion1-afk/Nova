import { NextRequest, NextResponse } from "next/server";
import { readSession } from "../../../lib/steam";
const offers: Record<string, { credits: number; cents: number }> = {
  starter: { credits: 1000, cents: 1000 },
  city: { credits: 2500, cents: 2500 },
  legend: { credits: 5000, cents: 5000 },
};
export async function POST(request: NextRequest) {
  const steamId = await readSession(request);
  if (!steamId) return NextResponse.json({ message: "Connecte-toi avec Steam pour commander." }, { status: 401 });
  const body = await request.json().catch(() => null) as { plan?: string } | null;
  if (!body?.plan || !offers[body.plan]) return NextResponse.json({ message: "Pack invalide." }, { status: 400 });
  // Do not take payments or allocate credits until a verified payment webhook,
  // durable order ledger, and secured GMod fulfilment bridge are configured.
  return NextResponse.json({ message: "La passerelle de paiement est en cours de configuration. Aucun achat n'est encore encaissé." }, { status: 503 });
}
