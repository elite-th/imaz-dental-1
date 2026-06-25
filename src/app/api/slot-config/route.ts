import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/* ------------------------------------------------------------------ */
/*  GET /api/slot-config — Get slot configuration                     */
/* ------------------------------------------------------------------ */
export async function GET() {
  try {
    let config = await db.slotConfig.findFirst();
    if (!config) {
      // Create default config if none exists
      config = await db.slotConfig.create({
        data: { slotDuration: 30, bufferTime: 0 },
      });
    }
    return NextResponse.json({
      config: {
        id: config.id,
        slot_duration: config.slotDuration,
        buffer_time: config.bufferTime,
        updated_at: config.updatedAt,
      },
    });
  } catch (error) {
    console.error("[GET /api/slot-config] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch slot config" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  PATCH /api/slot-config — Update slot configuration                */
/* ------------------------------------------------------------------ */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { slotDuration, bufferTime } = body;

    // Validate
    if (slotDuration !== undefined && (typeof slotDuration !== "number" || slotDuration < 5 || slotDuration > 120)) {
      return NextResponse.json(
        { error: "slotDuration must be between 5 and 120 minutes" },
        { status: 400 }
      );
    }
    if (bufferTime !== undefined && (typeof bufferTime !== "number" || bufferTime < 0 || bufferTime > 60)) {
      return NextResponse.json(
        { error: "bufferTime must be between 0 and 60 minutes" },
        { status: 400 }
      );
    }

    let config = await db.slotConfig.findFirst();
    if (!config) {
      config = await db.slotConfig.create({
        data: {
          slotDuration: slotDuration || 30,
          bufferTime: bufferTime || 0,
        },
      });
    } else {
      const data: any = {};
      if (slotDuration !== undefined) data.slotDuration = slotDuration;
      if (bufferTime !== undefined) data.bufferTime = bufferTime;
      config = await db.slotConfig.update({
        where: { id: config.id },
        data,
      });
    }

    return NextResponse.json({
      config: {
        id: config.id,
        slot_duration: config.slotDuration,
        buffer_time: config.bufferTime,
        updated_at: config.updatedAt,
      },
      message: "Slot configuration updated successfully",
    });
  } catch (error) {
    console.error("[PATCH /api/slot-config] Error:", error);
    return NextResponse.json(
      { error: "Failed to update slot config" },
      { status: 500 }
    );
  }
}
