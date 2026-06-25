import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/* ------------------------------------------------------------------ */
/*  Helper: transform DB row to API Collaboration (snake_case)        */
/* ------------------------------------------------------------------ */
function transformCollaboration(row: any) {
  return {
    id: row.id,
    name_fa: row.nameFa,
    name_en: row.nameEn,
    name_ar: row.nameAr,
    image: row.image,
    sort_order: row.sortOrder,
    is_active: row.isActive,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

/* ------------------------------------------------------------------ */
/*  PATCH /api/collaborations/[id] — Update a collaboration           */
/* ------------------------------------------------------------------ */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.collaboration.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Collaboration not found" },
        { status: 404 }
      );
    }

    // Build update data — only include fields that are provided
    const data: any = {};

    if (body.nameFa !== undefined) {
      if (typeof body.nameFa !== "string" || body.nameFa.trim() === "") {
        return NextResponse.json(
          { error: "nameFa must be a non-empty string" },
          { status: 400 }
        );
      }
      data.nameFa = body.nameFa.trim();
    }

    if (body.nameEn !== undefined) {
      if (typeof body.nameEn !== "string" || body.nameEn.trim() === "") {
        return NextResponse.json(
          { error: "nameEn must be a non-empty string" },
          { status: 400 }
        );
      }
      data.nameEn = body.nameEn.trim();
    }

    if (body.nameAr !== undefined) {
      if (typeof body.nameAr !== "string" || body.nameAr.trim() === "") {
        return NextResponse.json(
          { error: "nameAr must be a non-empty string" },
          { status: 400 }
        );
      }
      data.nameAr = body.nameAr.trim();
    }

    if (body.image !== undefined) {
      if (typeof body.image !== "string") {
        return NextResponse.json(
          { error: "image must be a string" },
          { status: 400 }
        );
      }
      data.image = body.image.trim();
    }

    if (body.sortOrder !== undefined) {
      if (typeof body.sortOrder !== "number") {
        return NextResponse.json(
          { error: "sortOrder must be a number" },
          { status: 400 }
        );
      }
      data.sortOrder = body.sortOrder;
    }

    if (body.isActive !== undefined) {
      if (typeof body.isActive !== "boolean") {
        return NextResponse.json(
          { error: "isActive must be a boolean" },
          { status: 400 }
        );
      }
      data.isActive = body.isActive;
    }

    // Ensure at least one field is being updated
    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided for update" },
        { status: 400 }
      );
    }

    const item = await db.collaboration.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      item: transformCollaboration(item),
      message: "Collaboration updated successfully",
    });
  } catch (error) {
    console.error("[PATCH /api/collaborations/:id] Error:", error);
    return NextResponse.json(
      { error: "Failed to update collaboration" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  DELETE /api/collaborations/[id] — Delete a collaboration          */
/* ------------------------------------------------------------------ */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.collaboration.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Collaboration not found" },
        { status: 404 }
      );
    }

    await db.collaboration.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Collaboration deleted successfully",
    });
  } catch (error) {
    console.error("[DELETE /api/collaborations/:id] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete collaboration" },
      { status: 500 }
    );
  }
}
