/**
 * Push Notification Library
 *
 * Uses web-push to send push notifications to all subscribed browsers.
 * Called from server-side code (API routes) when a new event occurs
 * (e.g., new booking, status change).
 */
import webpush from "web-push";
import { db } from "@/lib/db";

/* ── Configure web-push with VAPID details ── */
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:info@imazdental.com";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

/* ── Types ── */
interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
}

/* ── Send a push notification to ALL subscribed browsers ── */
export async function sendPushToAll(payload: PushPayload): Promise<number> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn("[Push] VAPID keys not configured — skipping push notification");
    return 0;
  }

  const subscriptions = await db.notificationSubscription.findMany();
  if (subscriptions.length === 0) {
    return 0;
  }

  const pushPayload = JSON.stringify({
    ...payload,
    icon: payload.icon || "/favicon.ico",
    badge: payload.badge || "/favicon.ico",
    url: payload.url || "/admin",
    tag: payload.tag || "imaz-notification",
  });

  let sentCount = 0;
  const staleEndpoints: string[] = [];

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          pushPayload,
          {
            TTL: 3600, // 1 hour
          }
        );
        sentCount++;
      } catch (err: any) {
        // 410 = subscription expired, 404 = not found — remove stale subscriptions
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          staleEndpoints.push(sub.endpoint);
        } else {
          console.error(`[Push] Failed to send to ${sub.endpoint.slice(0, 50)}...`, err?.message || err);
        }
      }
    })
  );

  // Clean up stale subscriptions
  if (staleEndpoints.length > 0) {
    try {
      await db.notificationSubscription.deleteMany({
        where: { endpoint: { in: staleEndpoints } },
      });
    } catch {
      // ignore cleanup errors
    }
  }

  return sentCount;
}

/* ── Convenience: send push for new booking ── */
export async function notifyNewBooking(patientName: string, service: string): Promise<number> {
  return sendPushToAll({
    title: "نوبت جدید 🦷",
    body: `${patientName} — ${service}`,
    tag: "imaz-new-booking",
    url: "/admin",
  });
}

/* ── Convenience: send push for booking status change ── */
export async function notifyBookingStatus(
  patientName: string,
  newStatus: string
): Promise<number> {
  const statusLabels: Record<string, string> = {
    confirmed: "تایید شد",
    rejected: "رد شد",
    rescheduled: "جابجا شد",
    pending: "در انتظار بررسی",
  };
  return sendPushToAll({
    title: "تغییر وضعیت نوبت",
    body: `${patientName} — ${statusLabels[newStatus] || newStatus}`,
    tag: "imaz-booking-status",
    url: "/admin",
  });
}

/* ── Get VAPID public key (for client-side subscription) ── */
export function getVapidPublicKey(): string {
  return VAPID_PUBLIC_KEY;
}
