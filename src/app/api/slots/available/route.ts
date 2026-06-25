import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persianFa from "react-date-object/locales/persian_fa";
import arabic from "react-date-object/calendars/arabic";
import arabicAr from "react-date-object/locales/arabic_ar";

/* ------------------------------------------------------------------ */
/*  GET /api/slots/available?date=YYYY-MM-DD                          */
/*  Returns available time slots for the given Gregorian date          */
/* ------------------------------------------------------------------ */

/** Generate all possible date string formats stored in the DB */
function getAllDateFormats(gregorianDateStr: string): string[] {
  const formats: string[] = [];

  try {
    // Parse the Gregorian date
    const [y, m, d] = gregorianDateStr.split("-").map(Number);
    const jsDate = new Date(y, m - 1, d);

    // 1. Gregorian format (English locale): "YYYY-MM-DD"
    formats.push(gregorianDateStr);

    // 2. Persian calendar with Persian locale: "YYYY/MM/DD" with Persian digits
    const persianDate = new DateObject(jsDate).convert(persian, persianFa);
    formats.push(persianDate.format("YYYY/MM/DD"));

    // 3. Arabic/Hijri calendar with Arabic locale: "YYYY/MM/DD" with Arabic digits
    const arabicDate = new DateObject(jsDate).convert(arabic, arabicAr);
    formats.push(arabicDate.format("YYYY/MM/DD"));
  } catch {
    // If conversion fails, at least include the original Gregorian date
    if (!formats.includes(gregorianDateStr)) {
      formats.push(gregorianDateStr);
    }
  }

  return formats;
}

/** Generate 30-minute time slots between open and close times */
function generateTimeSlots(openTime: string, closeTime: string): string[] {
  const slots: string[] = [];
  const [openH, openM] = openTime.split(":").map(Number);
  const [closeH, closeM] = closeTime.split(":").map(Number);

  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  for (let mins = openMinutes; mins < closeMinutes; mins += 30) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }

  return slots;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    // Validate date parameter
    if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      return NextResponse.json(
        { error: "Invalid date format. Expected YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // Parse the date to determine the day of week
    const [year, month, day] = dateParam.split("-").map(Number);
    const jsDate = new Date(year, month - 1, day);
    const dayOfWeek = jsDate.getDay(); // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat

    // Friday (5) is a day off — return workingHours: null
    if (dayOfWeek === 5) {
      return NextResponse.json({
        slots: [],
        workingHours: null,
        isHoliday: false,
        holidayTitle: null,
      });
    }

    // Determine working hours based on day of week
    // Saturday-Wednesday (0=Sun..3=Wed, 6=Sat): 09:00-18:00
    // Thursday (4): 09:00-14:00
    const isThursday = dayOfWeek === 4;
    const workingHours = isThursday
      ? { open: "09:00", close: "14:00" }
      : { open: "09:00", close: "18:00" };

    // Generate time slots for the day
    const timeSlots = generateTimeSlots(workingHours.open, workingHours.close);

    // Get all possible date formats that could be stored in the DB
    const possibleDateFormats = getAllDateFormats(dateParam);

    // Query bookings for this date with status "pending" or "confirmed"
    const bookedSlots = await db.booking.findMany({
      where: {
        date: { in: possibleDateFormats },
        status: { in: ["pending", "confirmed"] },
      },
      select: { time: true },
    });

    // Build a set of booked times for fast lookup
    const bookedTimes = new Set(bookedSlots.map((b) => b.time));

    // Build the slots response
    const slots = timeSlots.map((time) => ({
      time,
      available: !bookedTimes.has(time),
    }));

    return NextResponse.json({
      slots,
      workingHours,
      isHoliday: false,
      holidayTitle: null,
    });
  } catch (error) {
    console.error("[GET /api/slots/available] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch available slots" },
      { status: 500 }
    );
  }
}
