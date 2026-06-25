import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

/* ------------------------------------------------------------------ */
/*  Helper: transform DB row to API WorkingHour (snake_case)          */
/* ------------------------------------------------------------------ */
function transformWorkingHour(row: any) {
  return {
    id: row.id,
    day_of_week: row.dayOfWeek,
    day_name: row.dayName,
    open_time: row.openTime,
    close_time: row.closeTime,
    is_enabled: row.isEnabled ? 1 : 0,
    slot_duration: row.slotDuration,
  };
}

/* ------------------------------------------------------------------ */
/*  GET /api/working-hours — دریافت ساعات کاری (عمومی)                */
/* ------------------------------------------------------------------ */
export async function GET() {
  try {
    let hours = await db.workingHour.findMany({
      orderBy: { dayOfWeek: "asc" },
    });

    // اگر هیچ ساعتی تعریف نشده، مقادیر پیش‌فرض بساز
    if (hours.length === 0) {
      const defaults = [
        { dayOfWeek: 0, dayName: "شنبه", openTime: "09:00", closeTime: "18:00", isEnabled: true, slotDuration: 30 },
        { dayOfWeek: 1, dayName: "یکشنبه", openTime: "09:00", closeTime: "18:00", isEnabled: true, slotDuration: 30 },
        { dayOfWeek: 2, dayName: "دوشنبه", openTime: "09:00", closeTime: "18:00", isEnabled: true, slotDuration: 30 },
        { dayOfWeek: 3, dayName: "سه‌شنبه", openTime: "09:00", closeTime: "18:00", isEnabled: true, slotDuration: 30 },
        { dayOfWeek: 4, dayName: "چهارشنبه", openTime: "09:00", closeTime: "18:00", isEnabled: true, slotDuration: 30 },
        { dayOfWeek: 5, dayName: "پنجشنبه", openTime: "09:00", closeTime: "14:00", isEnabled: true, slotDuration: 30 },
        { dayOfWeek: 6, dayName: "جمعه", openTime: null, closeTime: null, isEnabled: false, slotDuration: 30 },
      ];

      for (const d of defaults) {
        await db.workingHour.create({ data: d });
      }

      hours = await db.workingHour.findMany({
        orderBy: { dayOfWeek: "asc" },
      });
    }

    return NextResponse.json({
      workingHours: hours.map(transformWorkingHour),
    });
  } catch (error) {
    console.error("[GET /api/working-hours] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch working hours" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  PUT /api/working-hours — بروزرسانی ساعات کاری (ادمین)             */
/* ------------------------------------------------------------------ */
export async function PUT(request: NextRequest) {
  try {
    const authResult = requireAdmin(request);
    if ("error" in authResult) return authResult.error;

    const body = await request.json();

    // body = آرایه‌ای از ساعات کاری
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: "Expected an array of working hours" },
        { status: 400 }
      );
    }

    for (const item of body) {
      const { day_of_week, open_time, close_time, is_enabled, slot_duration } = item;

      if (typeof day_of_week !== "number" || day_of_week < 0 || day_of_week > 6) {
        return NextResponse.json(
          { error: `Invalid day_of_week: ${day_of_week}` },
          { status: 400 }
        );
      }

      const dayNames = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];

      await db.workingHour.upsert({
        where: { dayOfWeek: day_of_week },
        update: {
          openTime: is_enabled ? open_time : null,
          closeTime: is_enabled ? close_time : null,
          isEnabled: is_enabled ? true : false,
          slotDuration: slot_duration || 30,
        },
        create: {
          dayOfWeek: day_of_week,
          dayName: dayNames[day_of_week],
          openTime: is_enabled ? open_time : null,
          closeTime: is_enabled ? close_time : null,
          isEnabled: is_enabled ? true : false,
          slotDuration: slot_duration || 30,
        },
      });
    }

    const updated = await db.workingHour.findMany({
      orderBy: { dayOfWeek: "asc" },
    });

    return NextResponse.json({
      workingHours: updated.map(transformWorkingHour),
      message: "ساعات کاری با موفقیت بروزرسانی شد",
    });
  } catch (error) {
    console.error("[PUT /api/working-hours] Error:", error);
    return NextResponse.json(
      { error: "Failed to update working hours" },
      { status: 500 }
    );
  }
}
