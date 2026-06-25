import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persianFa from "react-date-object/locales/persian_fa";

/* ------------------------------------------------------------------ */
/*  Helper: Get Persian day name from JS Date                         */
/* ------------------------------------------------------------------ */
function getPersianDayName(jsDate: Date): string {
  const persianDays = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];
  // JS: 0=Sun, 1=Mon, ..., 6=Sat
  // Persian: شنبه=Sat, یکشنبه=Sun, ..., جمعه=Fri
  const jsDay = jsDate.getDay();
  // Map: JS Sat(6)→Persian 0(شنبه), JS Sun(0)→Persian 1(یکشنبه), ..., JS Fri(5)→Persian 6(جمعه)
  const persianIndex = (jsDay + 1) % 7;
  return persianDays[persianIndex];
}

/* ------------------------------------------------------------------ */
/*  Helper: Generate time slots from working hours                    */
/* ------------------------------------------------------------------ */
function generateTimeSlots(startTime: string, endTime: string, slotDuration: number, bufferTime: number): string[] {
  const slots: string[] = [];
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  let currentMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  while (currentMinutes + slotDuration <= endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const minutes = currentMinutes % 60;
    const timeStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    slots.push(timeStr);
    currentMinutes += slotDuration + bufferTime;
  }

  return slots;
}

/* ------------------------------------------------------------------ */
/*  Helper: normalize Persian/Arabic digits to Latin digits            */
/* ------------------------------------------------------------------ */
function normalizeDigits(str: string): string {
  return str.replace(/[۰-۹]/g, (d) =>
    String(d.charCodeAt(0) - 0x06F0)
  ).replace(/[٠-٩]/g, (d) =>
    String(d.charCodeAt(0) - 0x0660)
  );
}

/* ------------------------------------------------------------------ */
/*  Helper: convert Latin digits to Persian digits                     */
/* ------------------------------------------------------------------ */
function toPersianDigits(str: string): string {
  return str.replace(/\d/g, (d) =>
    String.fromCharCode(d.charCodeAt(0) + 0x06F0 - 48)
  );
}

/* ------------------------------------------------------------------ */
/*  Helper: Get all possible date formats for matching                */
/* ------------------------------------------------------------------ */
function getAllDateFormats(dateStr: string): string[] {
  const formats = new Set<string>();
  try {
    formats.add(dateStr);
    const normalized = normalizeDigits(dateStr);
    formats.add(normalized);
    formats.add(toPersianDigits(normalized));

    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      const [y, m, d] = normalized.split("-").map(Number);
      const jsDate = new Date(y, m - 1, d);
      const persianDate = new DateObject(jsDate).convert(persian, persianFa);
      formats.add(persianDate.format("YYYY/MM/DD"));
      formats.add(normalizeDigits(persianDate.format("YYYY/MM/DD")));
    }

    if (/^\d{4}\/\d{2}\/\d{2}$/.test(normalized)) {
      try {
        const persianDateObj = new DateObject({
          year: parseInt(normalized.slice(0, 4)),
          month: parseInt(normalized.slice(5, 7)),
          day: parseInt(normalized.slice(8, 10)),
          calendar: persian,
          locale: persianFa,
        });
        const gregorianDate = persianDateObj.convert();
        formats.add(gregorianDate.format("YYYY-MM-DD"));
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore
  }
  return Array.from(formats);
}

/* ------------------------------------------------------------------ */
/*  GET /api/slots?date=YYYY-MM-DD — Get time slots for a date       */
/* ------------------------------------------------------------------ */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");

    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return NextResponse.json(
        { error: "date query parameter is required (YYYY-MM-DD format)" },
        { status: 400 }
      );
    }

    // Parse date
    const [year, month, day] = dateStr.split("-").map(Number);
    const jsDate = new Date(year, month - 1, day);

    // Get Persian day name
    const persianDayName = getPersianDayName(jsDate);

    // Get slot config
    let slotConfig = await db.slotConfig.findFirst();
    if (!slotConfig) {
      slotConfig = await db.slotConfig.create({
        data: { slotDuration: 30, bufferTime: 0 },
      });
    }

    // Get working hours from settings
    const whSetting = await db.clinicSetting.findUnique({ where: { key: "working_hours" } });
    let workingHours = [
      { day: "شنبه", open: "09:00", close: "18:00", enabled: true },
      { day: "یکشنبه", open: "09:00", close: "18:00", enabled: true },
      { day: "دوشنبه", open: "09:00", close: "18:00", enabled: true },
      { day: "سه‌شنبه", open: "09:00", close: "18:00", enabled: true },
      { day: "چهارشنبه", open: "09:00", close: "18:00", enabled: true },
      { day: "پنجشنبه", open: "09:00", close: "14:00", enabled: true },
      { day: "جمعه", open: "", close: "", enabled: false },
    ];
    if (whSetting?.value) {
      try {
        workingHours = JSON.parse(whSetting.value);
      } catch {
        // use defaults
      }
    }

    // Find working hours for this day
    const dayConfig = workingHours.find((wh: any) => wh.day === persianDayName);
    if (!dayConfig || !dayConfig.enabled || !dayConfig.open || !dayConfig.close) {
      return NextResponse.json({
        date: dateStr,
        persian_day: persianDayName,
        is_working_day: false,
        slots: [],
        config: {
          slot_duration: slotConfig.slotDuration,
          buffer_time: slotConfig.bufferTime,
        },
      });
    }

    // Generate time slots
    const allSlots = generateTimeSlots(dayConfig.open, dayConfig.close, slotConfig.slotDuration, slotConfig.bufferTime);

    // Get closed slots for this date
    const closedSlots = await db.closedSlot.findMany({
      where: {
        date: { in: getAllDateFormats(dateStr) },
      },
    });

    // Check for full-day closure
    const fullDayClosed = closedSlots.some((cs) => cs.time === null);

    if (fullDayClosed) {
      return NextResponse.json({
        date: dateStr,
        persian_day: persianDayName,
        is_working_day: true,
        is_full_day_closed: true,
        full_day_close_reason: closedSlots.find((cs) => cs.time === null)?.reason || null,
        slots: allSlots.map((time) => ({
          time,
          status: "closed",
          close_reason: closedSlots.find((cs) => cs.time === null)?.reason || "تعطیل",
          closed_id: closedSlots.find((cs) => cs.time === null)?.id,
        })),
        config: {
          slot_duration: slotConfig.slotDuration,
          buffer_time: slotConfig.bufferTime,
        },
      });
    }

    // Get existing bookings for this date
    const possibleDateFormats = getAllDateFormats(dateStr);
    const bookings = await db.booking.findMany({
      where: {
        date: { in: possibleDateFormats },
        status: { in: ["pending", "confirmed"] },
      },
      select: { id: true, time: true, fullName: true, service: true, status: true },
    });

    // Build slot map
    const closedTimeMap = new Map<string, { id: string; reason: string | null }>();
    closedSlots.forEach((cs) => {
      if (cs.time) {
        closedTimeMap.set(cs.time, { id: cs.id, reason: cs.reason });
      }
    });

    const bookedTimeMap = new Map<string, { id: string; fullName: string; service: string; status: string }>();
    bookings.forEach((b) => {
      bookedTimeMap.set(b.time, { id: b.id, fullName: b.fullName, service: b.service, status: b.status });
    });

    // Build final slot list
    const slots = allSlots.map((time) => {
      if (closedTimeMap.has(time)) {
        const closed = closedTimeMap.get(time)!;
        return {
          time,
          status: "closed" as const,
          close_reason: closed.reason,
          closed_id: closed.id,
        };
      }
      if (bookedTimeMap.has(time)) {
        const booking = bookedTimeMap.get(time)!;
        return {
          time,
          status: "booked" as const,
          booking_id: booking.id,
          patient_name: booking.fullName,
          service: booking.service,
          booking_status: booking.status,
        };
      }
      return {
        time,
        status: "available" as const,
      };
    });

    return NextResponse.json({
      date: dateStr,
      persian_day: persianDayName,
      is_working_day: true,
      is_full_day_closed: false,
      working_hours: { open: dayConfig.open, close: dayConfig.close },
      slots,
      config: {
        slot_duration: slotConfig.slotDuration,
        buffer_time: slotConfig.bufferTime,
      },
    });
  } catch (error) {
    console.error("[GET /api/slots] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate slots" },
      { status: 500 }
    );
  }
}
