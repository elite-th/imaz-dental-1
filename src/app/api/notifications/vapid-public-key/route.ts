import { NextResponse } from "next/server";
import { getVapidPublicKey } from "@/lib/push";

/**
 * GET /api/notifications/vapid-public-key
 *
 * Returns the VAPID public key for client-side push subscription.
 */
export async function GET() {
  const publicKey = getVapidPublicKey();
  if (!publicKey) {
    return NextResponse.json({ error: "VAPID not configured" }, { status: 500 });
  }
  return NextResponse.json({ publicKey });
}
