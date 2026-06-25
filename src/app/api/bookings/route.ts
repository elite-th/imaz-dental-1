import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persianFa from "react-date-object/locales/persian_fa";
import arabic from "react-date-object/calendars/arabic";
import arabicAr from "react-date-object/locales/arabic_ar";
import { notifyNewBooking } from "@/lib/push";

/* ------------------------------------------------------------------ */
/*  Helper: transform DB row to API Booking (snake_case)              */
/* ------------------------------------------------------------------ */
function transformBooking(row: any) {
  return {
    id: row.id,
    full_name: row.fullName,
    phone: row.phone,
    email: row.email,
    service: row.service,
    date: row.date,
    time: row.time,
    notes: row.notes,
    status: row.status,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
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
/*  Helper: generate all possible date formats stored in the DB        */
/* ------------------------------------------------------------------ */
function getAllDateFormats(dateStr: string): string[] {
  const formats = new Set<string>();
  try {
    // Always include original
    formats.add(dateStr);

    // Normalize to Latin digits for parsing
    const normalized = normalizeDigits(dateStr);
    formats.add(normalized);
    formats.add(toPersianDigits(normalized));

    // Try to parse as Gregorian (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      const [y, m, d] = normalized.split("-").map(Number);
      const jsDate = new Date(y, m - 1, d);
      formats.add(dateStr); // Gregorian
      const persianDate = new DateObject(jsDate).convert(persian, persianFa);
      formats.add(persianDate.format("YYYY/MM/DD")); // Persian with Persian digits
      formats.add(normalizeDigits(persianDate.format("YYYY/MM/DD"))); // Persian with Latin digits
      const arabicDate = new DateObject(jsDate).convert(arabic, arabicAr);
      formats.add(arabicDate.format("YYYY/MM/DD")); // Hijri with Arabic digits
    }

    // Try to parse as Persian date (YYYY/MM/DD with Latin digits)
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
        const gregStr = gregorianDate.format("YYYY-MM-DD");
        formats.add(gregStr);
        formats.add(toPersianDigits(normalized));
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
/*  POST /api/bookings — Create a new booking                         */
/* ------------------------------------------------------------------ */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { fullName, phone, email, service, date, time, notes } = body;

    // Validate required fields
    const missing: string[] = [];
    if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
      missing.push("fullName");
    }
    if (!phone || typeof phone !== "string" || phone.replace(/\D/g, "").length < 7) {
      missing.push("phone");
    }
    if (!service || typeof service !== "string" || service.trim() === "") {
      missing.push("service");
    }
    if (!date || typeof date !== "string" || date.trim() === "") {
      missing.push("date");
    }
    if (!time || typeof time !== "string" || time.trim() === "") {
      missing.push("time");
    }

    if (missing.length > 0) {
      return NextResponse.json(
        { error: "Missing or invalid required fields", fields: missing },
        { status: 400 }
      );
    }

    // Check for duplicate booking (same date + time with pending/confirmed status)
    const possibleDateFormats = getAllDateFormats(date.trim());
    const existingBooking = await db.booking.findFirst({
      where: {
        date: { in: possibleDateFormats },
        time: time.trim(),
        status: { in: ["pending", "confirmed"] },
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: "این زمان قبلاً رزرو شده است. لطفاً زمان دیگری انتخاب کنید.", errorKey: "booking.slot_taken" },
        { status: 409 }
      );
    }

    // Check if the time slot has been closed by admin
    const closedSlot = await db.closedSlot.findFirst({
      where: {
        date: { in: possibleDateFormats },
        OR: [
          { time: time.trim() },   // specific time closed
          { time: null },          // full day closed
        ],
      },
    });

    if (closedSlot) {
      return NextResponse.json(
        { error: "این زمان توسط کلینیک بسته شده است. لطفاً زمان دیگری انتخاب کنید.", errorKey: "booking.slot_closed" },
        { status: 410 }
      );
    }

    const booking = await db.booking.create({
      data: {
        fullName: fullName.trim(),
        phone: phone.replace(/\D/g, ""),
        email: email && typeof email === "string" && email.trim() !== "" ? email.trim() : null,
        service: service.trim(),
        date: date.trim(),
        time: time.trim(),
        notes: notes && typeof notes === "string" && notes.trim() !== "" ? notes.trim() : null,
        status: "pending",
      },
    });

    // Send push notification to all subscribed admin browsers (fire-and-forget)
    notifyNewBooking(fullName.trim(), service.trim()).catch(() => {
      // Silently ignore push errors — booking is still created
    });

    return NextResponse.json(
      { booking: transformBooking(booking), message: "Booking created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/bookings] Error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  GET /api/bookings — List all bookings (admin)                     */
/* ------------------------------------------------------------------ */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");
    const searchQuery = searchParams.get("search");

    const where: any = {};
    if (statusFilter) {
      where.status = statusFilter;
    }
    if (searchQuery) {
      where.OR = [
        { fullName: { contains: searchQuery } },
        { phone: { contains: searchQuery } },
        { service: { contains: searchQuery } },
      ];
    }

    const bookings = await db.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Compute stats from all bookings (unfiltered)
    const allBookings = await db.booking.findMany({
      select: { status: true },
    });

    const stats = {
      total: allBookings.length,
      pending: allBookings.filter((b) => b.status === "pending").length,
      confirmed: allBookings.filter((b) => b.status === "confirmed").length,
      rejected: allBookings.filter((b) => b.status === "rejected").length,
      rescheduled: allBookings.filter((b) => b.status === "rescheduled").length,
    };

    return NextResponse.json({
      bookings: bookings.map(transformBooking),
      stats,
    });
  } catch (error) {
    console.error("[GET /api/bookings] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
