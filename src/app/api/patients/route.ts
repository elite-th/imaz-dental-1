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
/*  POST /api/patients — Create a new patient                         */
/* ------------------------------------------------------------------ */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { fullName, phone, email, notes, dateOfBirth } = body;

    // Validate required fields
    const missing: string[] = [];
    if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
      missing.push("fullName");
    }
    if (!phone || typeof phone !== "string" || phone.replace(/\D/g, "").length < 7) {
      missing.push("phone");
    }

    if (missing.length > 0) {
      return NextResponse.json(
        { error: "Missing or invalid required fields", fields: missing },
        { status: 400 }
      );
    }

    const patient = await db.patient.create({
      data: {
        fullName: fullName.trim(),
        phone: phone.replace(/\D/g, ""),
        email: email && typeof email === "string" && email.trim() !== "" ? email.trim() : null,
        notes: notes && typeof notes === "string" && notes.trim() !== "" ? notes.trim() : null,
        dateOfBirth: dateOfBirth && typeof dateOfBirth === "string" && dateOfBirth.trim() !== "" ? dateOfBirth.trim() : null,
      },
    });

    return NextResponse.json(
      { patient: transformPatient(patient), message: "Patient created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/patients] Error:", error);
    return NextResponse.json(
      { error: "Failed to create patient" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  GET /api/patients — List all patients (admin)                     */
/* ------------------------------------------------------------------ */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get("search");

    const where: any = {};
    if (searchQuery) {
      where.OR = [
        { fullName: { contains: searchQuery } },
        { phone: { contains: searchQuery } },
        { email: { contains: searchQuery } },
      ];
    }

    const patients = await db.patient.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      patients: patients.map(transformPatient),
    });
  } catch (error) {
    console.error("[GET /api/patients] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch patients" },
      { status: 500 }
    );
  }
}
