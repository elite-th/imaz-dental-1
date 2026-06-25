import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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
/*  PATCH /api/bookings/[id] — Update booking (status + fields)       */
/* ------------------------------------------------------------------ */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.booking.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Build update data
    const data: any = {};

    // Status update
    if (body.status !== undefined) {
      const validStatuses = ["pending", "confirmed", "rejected", "rescheduled"];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: "Invalid status value" },
          { status: 400 }
        );
      }
      data.status = body.status;
    }

    // Field updates (for editing from admin)
    if (body.date !== undefined) data.date = body.date;
    if (body.time !== undefined) data.time = body.time;
    if (body.notes !== undefined) data.notes = body.notes;
    if (body.fullName !== undefined) data.fullName = body.fullName;
    if (body.phone !== undefined) data.phone = body.phone;
    if (body.email !== undefined) data.email = body.email;
    if (body.service !== undefined) data.service = body.service;

    const booking = await db.booking.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      booking: transformBooking(booking),
      message: "Booking updated successfully",
    });
  } catch (error) {
    console.error("[PATCH /api/bookings/:id] Error:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  DELETE /api/bookings/[id] — Delete a booking                      */
/* ------------------------------------------------------------------ */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.booking.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    await db.booking.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("[DELETE /api/bookings/:id] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}
