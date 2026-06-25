import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/* ------------------------------------------------------------------ */
/*  Helper: transform DB row to API GalleryItem (snake_case)          */
/* ------------------------------------------------------------------ */
function transformGalleryItem(row: any) {
  return {
    id: row.id,
    title_fa: row.titleFa,
    subtitle_fa: row.subtitleFa,
    title_en: row.titleEn,
    subtitle_en: row.subtitleEn,
    title_ar: row.titleAr,
    subtitle_ar: row.subtitleAr,
    before_image: row.beforeImage,
    after_image: row.afterImage,
    sort_order: row.sortOrder,
    is_active: row.isActive,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

/* ------------------------------------------------------------------ */
/*  PATCH /api/gallery/[id] — Update a gallery item                   */
/* ------------------------------------------------------------------ */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.galleryItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Gallery item not found" },
        { status: 404 }
      );
    }

    // Build update data — only include fields that are provided
    const data: any = {};

    if (body.titleFa !== undefined) {
      if (typeof body.titleFa !== "string" || body.titleFa.trim() === "") {
        return NextResponse.json(
          { error: "titleFa must be a non-empty string" },
          { status: 400 }
        );
      }
      data.titleFa = body.titleFa.trim();
    }

    if (body.subtitleFa !== undefined) {
      if (typeof body.subtitleFa !== "string" || body.subtitleFa.trim() === "") {
        return NextResponse.json(
          { error: "subtitleFa must be a non-empty string" },
          { status: 400 }
        );
      }
      data.subtitleFa = body.subtitleFa.trim();
    }

    if (body.titleEn !== undefined) {
      if (typeof body.titleEn !== "string" || body.titleEn.trim() === "") {
        return NextResponse.json(
          { error: "titleEn must be a non-empty string" },
          { status: 400 }
        );
      }
      data.titleEn = body.titleEn.trim();
    }

    if (body.subtitleEn !== undefined) {
      if (typeof body.subtitleEn !== "string" || body.subtitleEn.trim() === "") {
        return NextResponse.json(
          { error: "subtitleEn must be a non-empty string" },
          { status: 400 }
        );
      }
      data.subtitleEn = body.subtitleEn.trim();
    }

    if (body.titleAr !== undefined) {
      if (typeof body.titleAr !== "string" || body.titleAr.trim() === "") {
        return NextResponse.json(
          { error: "titleAr must be a non-empty string" },
          { status: 400 }
        );
      }
      data.titleAr = body.titleAr.trim();
    }

    if (body.subtitleAr !== undefined) {
      if (typeof body.subtitleAr !== "string" || body.subtitleAr.trim() === "") {
        return NextResponse.json(
          { error: "subtitleAr must be a non-empty string" },
          { status: 400 }
        );
      }
      data.subtitleAr = body.subtitleAr.trim();
    }

    if (body.beforeImage !== undefined) {
      if (typeof body.beforeImage !== "string" || body.beforeImage.trim() === "") {
        return NextResponse.json(
          { error: "beforeImage must be a non-empty string" },
          { status: 400 }
        );
      }
      data.beforeImage = body.beforeImage.trim();
    }

    if (body.afterImage !== undefined) {
      if (typeof body.afterImage !== "string" || body.afterImage.trim() === "") {
        return NextResponse.json(
          { error: "afterImage must be a non-empty string" },
          { status: 400 }
        );
      }
      data.afterImage = body.afterImage.trim();
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

    const item = await db.galleryItem.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      item: transformGalleryItem(item),
      message: "Gallery item updated successfully",
    });
  } catch (error) {
    console.error("[PATCH /api/gallery/:id] Error:", error);
    return NextResponse.json(
      { error: "Failed to update gallery item" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  DELETE /api/gallery/[id] — Delete a gallery item                  */
/* ------------------------------------------------------------------ */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.galleryItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Gallery item not found" },
        { status: 404 }
      );
    }

    await db.galleryItem.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Gallery item deleted successfully",
    });
  } catch (error) {
    console.error("[DELETE /api/gallery/:id] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete gallery item" },
      { status: 500 }
    );
  }
}
