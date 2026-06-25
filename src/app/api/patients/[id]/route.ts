import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/* ------------------------------------------------------------------ */
/*  Helper: transform DB row to API Patient (snake_case)              */
/* ------------------------------------------------------------------ */
function transformPatient(row: any) {
  return {
    id: row.id,
    full_name: row.fullName,
    phone: row.phone,
    email: row.email,
    notes: row.notes,
    date_of_birth: row.dateOfBirth,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

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
/*  GET /api/patients/[id] — Get a single patient with bookings       */
/* ------------------------------------------------------------------ */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const patient = await db.patient.findUnique({ where: { id } });
    if (!patient) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    // Find bookings matching the patient's phone number
    const bookings = await db.booking.findMany({
      where: { phone: patient.phone },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      patient: transformPatient(patient),
      bookings: bookings.map(transformBooking),
    });
  } catch (error) {
    console.error("[GET /api/patients/:id] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch patient" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  PATCH /api/patients/[id] — Update a patient                       */
/* ------------------------------------------------------------------ */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.patient.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    // Build update data from provided fields
    const data: any = {};
    if (body.fullName !== undefined) {
      if (typeof body.fullName !== "string" || body.fullName.trim().length < 2) {
        return NextResponse.json(
          { error: "fullName must be at least 2 characters" },
          { status: 400 }
        );
      }
      data.fullName = body.fullName.trim();
    }
    if (body.phone !== undefined) {
      if (typeof body.phone !== "string" || body.phone.replace(/\D/g, "").length < 7) {
        return NextResponse.json(
          { error: "phone must have at least 7 digits" },
          { status: 400 }
        );
      }
      data.phone = body.phone.replace(/\D/g, "");
    }
    if (body.email !== undefined) {
      data.email = typeof body.email === "string" && body.email.trim() !== "" ? body.email.trim() : null;
    }
    if (body.notes !== undefined) {
      data.notes = typeof body.notes === "string" && body.notes.trim() !== "" ? body.notes.trim() : null;
    }
    if (body.dateOfBirth !== undefined) {
      data.dateOfBirth = typeof body.dateOfBirth === "string" && body.dateOfBirth.trim() !== "" ? body.dateOfBirth.trim() : null;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No fields provided to update" },
        { status: 400 }
      );
    }

    const patient = await db.patient.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      patient: transformPatient(patient),
      message: "Patient updated successfully",
    });
  } catch (error) {
    console.error("[PATCH /api/patients/:id] Error:", error);
    return NextResponse.json(
      { error: "Failed to update patient" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  DELETE /api/patients/[id] — Delete a patient                      */
/* ------------------------------------------------------------------ */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.patient.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    // Delete all bookings with the same phone number before deleting the patient
    await db.booking.deleteMany({ where: { phone: existing.phone } });

    await db.patient.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Patient and associated bookings deleted successfully",
    });
  } catch (error) {
    console.error("[DELETE /api/patients/:id] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete patient" },
      { status: 500 }
    );
  }
}
