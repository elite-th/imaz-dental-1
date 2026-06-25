import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/* ------------------------------------------------------------------ */
/*  Helper: transform DB row to API SiteText (snake_case)              */
/* ------------------------------------------------------------------ */
function transformSiteText(row: {
  id: string;
  key: string;
  valueFa: string;
  valueEn: string;
  valueAr: string;
  group: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    key: row.key,
    value_fa: row.valueFa,
    value_en: row.valueEn,
    value_ar: row.valueAr,
    group: row.group,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

/* ------------------------------------------------------------------ */
/*  PATCH /api/site-text/[id] — Update a single site text entry        */
/*  Body: { valueFa?, valueEn?, valueAr?, key?, group? }              */
/* ------------------------------------------------------------------ */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.siteText.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Site text not found" },
        { status: 404 }
      );
    }

    // Build update data from provided fields only
    const data: Record<string, string> = {};

    if (body.key !== undefined && typeof body.key === "string") {
      // Check for duplicate key if key is being changed
      if (body.key.trim() !== existing.key) {
        const duplicate = await db.siteText.findUnique({
          where: { key: body.key.trim() },
        });
        if (duplicate) {
          return NextResponse.json(
            { error: "A site text entry with this key already exists" },
            { status: 409 }
          );
        }
      }
      data.key = body.key.trim();
    }

    if (body.valueFa !== undefined && typeof body.valueFa === "string") {
      data.valueFa = body.valueFa;
    }

    if (body.valueEn !== undefined && typeof body.valueEn === "string") {
      data.valueEn = body.valueEn;
    }

    if (body.valueAr !== undefined && typeof body.valueAr === "string") {
      data.valueAr = body.valueAr;
    }

    if (body.group !== undefined && typeof body.group === "string") {
      data.group = body.group.trim();
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided for update" },
        { status: 400 }
      );
    }

    const updated = await db.siteText.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      site_text: transformSiteText(updated),
      info: "Site text updated successfully",
    });
  } catch (error) {
    console.error("[PATCH /api/site-text/:id] Error:", error);
    return NextResponse.json(
      { error: "Failed to update site text" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  DELETE /api/site-text/[id] — Delete a site text entry              */
/* ------------------------------------------------------------------ */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.siteText.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Site text not found" },
        { status: 404 }
      );
    }

    await db.siteText.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      info: "Site text deleted successfully",
    });
  } catch (error) {
    console.error("[DELETE /api/site-text/:id] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete site text" },
      { status: 500 }
    );
  }
}
