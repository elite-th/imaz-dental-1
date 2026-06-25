// src/app/api/notifications/subscribe/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const subscription = await request.json();
    const { endpoint, keys } = subscription;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: "Invalid subscription payload" }, { status: 400 });
    }
    await db.notificationSubscription.upsert({
      where: { endpoint },
      update: { p256dh: keys.p256dh, auth: keys.auth },
      create: { endpoint, p256dh: keys.p256dh, auth: keys.auth },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/notifications/subscribe]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
