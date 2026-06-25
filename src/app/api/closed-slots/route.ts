import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/* ------------------------------------------------------------------ */
/*  Helper: transform DB row to API ClosedSlot (snake_case)           */
/* ------------------------------------------------------------------ */
function transformClosedSlot(row: any) {
  return {
    id: row.id,
    date: row.date,
    time: row.time,
    reason: row.reason,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

/* ------------------------------------------------------------------ */
/*  GET /api/closed-slots?date=YYYY-MM-DD — List closed slots        */
/* ------------------------------------------------------------------ */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFilter = searchParams.get("date");
    const monthFilter = searchParams.get("month"); // YYYY-MM

    const where: any = {};
    if (dateFilter) {
      where.date = dateFilter;
    } else if (monthFilter) {
      // Filter by month prefix (YYYY-MM)
      where.date = { startsWith: monthFilter };
    }

    const closedSlots = await db.closedSlot.findMany({
      where,
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });

    return NextResponse.json({
      closed_slots: closedSlots.map(transformClosedSlot),
    });
  } catch (error) {
    console.error("[GET /api/closed-slots] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch closed slots" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/closed-slots — Close a slot or full day                 */
/* ------------------------------------------------------------------ */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, time, reason } = body;

    // Validate date
    if (!date || typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "date is required in YYYY-MM-DD format" },
        { status: 400 }
      );
    }

    // Validate time (optional — null means full day)
    if (time !== undefined && time !== null && typeof time !== "string") {
      return NextResponse.json(
        { error: "time must be a string (HH:MM) or null for full day" },
        { status: 400 }
      );
    }

    if (time && !/^\d{2}:\d{2}$/.test(time)) {
      return NextResponse.json(
        { error: "time must be in HH:MM format" },
        { status: 400 }
      );
    }

    // Check for duplicate
    const existing = await db.closedSlot.findFirst({
      where: {
        date,
        time: time || null,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "این اسلات قبلاً بسته شده است", closed_slot: transformClosedSlot(existing) },
        { status: 409 }
      );
    }

    // If closing a full day, delete any individual time closures for that day
    if (!time) {
      await db.closedSlot.deleteMany({
        where: { date, time: { not: null } },
      });
    }

    const closedSlot = await db.closedSlot.create({
      data: {
        date,
        time: time || null,
        reason: reason && typeof reason === "string" ? reason.trim() : null,
      },
    });

    return NextResponse.json(
      { closed_slot: transformClosedSlot(closedSlot), message: time ? "اسلات بسته شد" : "روز کامل بسته شد" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/closed-slots] Error:", error);
    return NextResponse.json(
      { error: "Failed to close slot" },
      { status: 500 }
    );
  }
}
