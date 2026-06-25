import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/notifications/check
 *
 * Returns count of new bookings, new patients, and unread messages since a given timestamp.
 * Query params:
 *   - since: ISO 8601 timestamp (optional) — only count items created after this time
 */
export async function GET(req: NextRequest) {
  try {
    const since = req.nextUrl.searchParams.get("since");

    // Count new (pending) bookings since the given timestamp
    let newBookings = 0;
    if (since) {
      try {
        const sinceDate = new Date(since);
        if (!isNaN(sinceDate.getTime())) {
          newBookings = await db.booking.count({
            where: {
              status: "pending",
              createdAt: { gt: sinceDate },
            },
          });
        }
      } catch {
        // If 'since' is invalid, fall back to counting all pending bookings
        newBookings = await db.booking.count({
          where: { status: "pending" },
        });
      }
    } else {
      // No timestamp provided — return total pending bookings
      newBookings = await db.booking.count({
        where: { status: "pending" },
      });
    }

    // Count new patients since the given timestamp
    let newPatients = 0;
    if (since) {
      try {
        const sinceDate = new Date(since);
        if (!isNaN(sinceDate.getTime())) {
          newPatients = await db.patient.count({
            where: {
              createdAt: { gt: sinceDate },
            },
          });
        }
      } catch {
        newPatients = await db.patient.count();
      }
    } else {
      newPatients = await db.patient.count();
    }

    // Count unread messages. With a timestamp, only count newly-created unread messages
    // so the secretary does not get the same system notification repeatedly.
    let unreadMessages = 0;
    if (since) {
      try {
        const sinceDate = new Date(since);
        if (!isNaN(sinceDate.getTime())) {
          unreadMessages = await db.message.count({
            where: {
              isRead: false,
              createdAt: { gt: sinceDate },
            },
          });
        }
      } catch {
        unreadMessages = await db.message.count({
          where: { isRead: false },
        });
      }
    } else {
      unreadMessages = await db.message.count({
        where: { isRead: false },
      });
    }

    return NextResponse.json({
      newBookings,
      newPatients,
      unreadMessages,
      lastChecked: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Notifications Check API] Error:", error);
    return NextResponse.json(
      { newBookings: 0, newPatients: 0, unreadMessages: 0, lastChecked: new Date().toISOString() },
      { status: 200 } // Return 200 with zeros to avoid breaking the polling
    );
  }
}
