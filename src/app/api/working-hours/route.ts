import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

/* ------------------------------------------------------------------ */
/*  Day name mapping (Persian + English)                              */
/* ------------------------------------------------------------------ */
const DAY_TO_INDEX: Record<string, number> = {
  saturday: 0, sunday: 1, monday: 2, tuesday: 3,
  wednesday: 4, thursday: 5, friday: 6,
};
const DAY_TO_NAME_FA: Record<string, string> = {
  saturday: "شنبه", sunday: "یکشنبه", monday: "دوشنبه", tuesday: "سه‌شنبه",
  wednesday: "چهارشنبه", thursday: "پنجشنبه", friday: "جمعه",
};
const INDEX_TO_DAY: string[] = [
  "saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday",
];

/* ------------------------------------------------------------------ */
/*  Helper: transform DB row to API WorkingHour (snake_case)          */
/* ------------------------------------------------------------------ */
function transformWorkingHour(row: any) {
  return {
    id: row.id,
    day: row.day,
    day_of_week: DAY_TO_INDEX[row.day] ?? 0,
    day_name: DAY_TO_NAME_FA[row.day] || row.day,
    open_time: row.openTime,
    close_time: row.closeTime,
    is_enabled: row.isOpen ? 1 : 0,
  };
}

/* ------------------------------------------------------------------ */
/*  GET /api/working-hours — دریافت ساعات کاری (عمومی)                */
/* ------------------------------------------------------------------ */
export async function GET() {
  try {
    let hours = await db.workingHour.findMany({
      orderBy: { day: "asc" },
    });

    // اگر هیچ ساعتی تعریف نشده، مقادیر پیش‌فرض بساز
    if (hours.length === 0) {
      const defaults = [
        { day: "saturday",  isOpen: true,  openTime: "09:00", closeTime: "21:00" },
        { day: "sunday",    isOpen: true,  openTime: "09:00", closeTime: "21:00" },
        { day: "monday",    isOpen: true,  openTime: "09:00", closeTime: "21:00" },
        { day: "tuesday",   isOpen: true,  openTime: "09:00", closeTime: "21:00" },
        { day: "wednesday", isOpen: true,  openTime: "09:00", closeTime: "21:00" },
        { day: "thursday",  isOpen: true,  openTime: "09:00", closeTime: "15:00" },
        { day: "friday",    isOpen: false, openTime: "00:00", closeTime: "00:00" },
      ];

      for (const d of defaults) {
        await db.workingHour.create({ data: d });
      }

      hours = await db.workingHour.findMany({
        orderBy: { day: "asc" },
      });
    }

    // Sort by day_of_week order (saturday first)
    hours.sort((a: any, b: any) =>
      (DAY_TO_INDEX[a.day] ?? 99) - (DAY_TO_INDEX[b.day] ?? 99)
    );

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
      const { day_of_week, open_time, close_time, is_enabled } = item;

      if (typeof day_of_week !== "number" || day_of_week < 0 || day_of_week > 6) {
        return NextResponse.json(
          { error: `Invalid day_of_week: ${day_of_week}` },
          { status: 400 }
        );
      }

      const day = INDEX_TO_DAY[day_of_week];

      // Find existing record by day name (unique logical key)
      const existing = await db.workingHour.findFirst({ where: { day } });

      if (existing) {
        await db.workingHour.update({
          where: { id: existing.id },
          data: {
            isOpen: !!is_enabled,
            openTime: is_enabled ? (open_time || "09:00") : "00:00",
            closeTime: is_enabled ? (close_time || "18:00") : "00:00",
          },
        });
      } else {
        await db.workingHour.create({
          data: {
            day,
            isOpen: !!is_enabled,
            openTime: is_enabled ? (open_time || "09:00") : "00:00",
            closeTime: is_enabled ? (close_time || "18:00") : "00:00",
          },
        });
      }
    }

    const updated = await db.workingHour.findMany({
      orderBy: { day: "asc" },
    });

    // Sort by day_of_week
    updated.sort((a: any, b: any) =>
      (DAY_TO_INDEX[a.day] ?? 99) - (DAY_TO_INDEX[b.day] ?? 99)
    );

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
