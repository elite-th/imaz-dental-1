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
/*  Helper: transform DB row to locale-specific public response       */
/* ------------------------------------------------------------------ */
function transformGalleryItemPublic(row: any, lang: string) {
  const localeMap: Record<string, { title: string; subtitle: string }> = {
    fa: { title: row.titleFa, subtitle: row.subtitleFa },
    en: { title: row.titleEn, subtitle: row.subtitleEn },
    ar: { title: row.titleAr, subtitle: row.subtitleAr },
  };

  const locale = localeMap[lang] || localeMap.fa;

  return {
    id: row.id,
    title: locale.title,
    subtitle: locale.subtitle,
    before_image: row.beforeImage,
    after_image: row.afterImage,
    sort_order: row.sortOrder,
  };
}

/* ------------------------------------------------------------------ */
/*  GET /api/gallery — List gallery items                             */
/*  Public: only active items, locale-specific fields via ?lang=      */
/*  Admin: all items with all fields via ?admin=true                  */
/* ------------------------------------------------------------------ */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get("admin") === "true";
    const lang = searchParams.get("lang") || "fa";

    if (isAdmin) {
      // Admin view: return all items with all fields
      const items = await db.galleryItem.findMany({
        orderBy: { sortOrder: "asc" },
      });

      return NextResponse.json({
        items: items.map(transformGalleryItem),
      });
    }

    // Public view: only active items, locale-specific fields
    const items = await db.galleryItem.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({
      items: items.map((item) => transformGalleryItemPublic(item, lang)),
    });
  } catch (error) {
    console.error("[GET /api/gallery] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery items" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/gallery — Create a new gallery item                     */
/* ------------------------------------------------------------------ */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      titleFa,
      subtitleFa,
      titleEn,
      subtitleEn,
      titleAr,
      subtitleAr,
      beforeImage,
      afterImage,
      sortOrder,
      isActive,
    } = body;

    // Validate required fields
    const missing: string[] = [];
    if (!titleFa || typeof titleFa !== "string" || titleFa.trim() === "") {
      missing.push("titleFa");
    }
    if (!subtitleFa || typeof subtitleFa !== "string" || subtitleFa.trim() === "") {
      missing.push("subtitleFa");
    }
    if (!titleEn || typeof titleEn !== "string" || titleEn.trim() === "") {
      missing.push("titleEn");
    }
    if (!subtitleEn || typeof subtitleEn !== "string" || subtitleEn.trim() === "") {
      missing.push("subtitleEn");
    }
    if (!titleAr || typeof titleAr !== "string" || titleAr.trim() === "") {
      missing.push("titleAr");
    }
    if (!subtitleAr || typeof subtitleAr !== "string" || subtitleAr.trim() === "") {
      missing.push("subtitleAr");
    }
    if (!beforeImage || typeof beforeImage !== "string" || beforeImage.trim() === "") {
      missing.push("beforeImage");
    }
    if (!afterImage || typeof afterImage !== "string" || afterImage.trim() === "") {
      missing.push("afterImage");
    }

    if (missing.length > 0) {
      return NextResponse.json(
        { error: "Missing or invalid required fields", fields: missing },
        { status: 400 }
      );
    }

    const item = await db.galleryItem.create({
      data: {
        titleFa: titleFa.trim(),
        subtitleFa: subtitleFa.trim(),
        titleEn: titleEn.trim(),
        subtitleEn: subtitleEn.trim(),
        titleAr: titleAr.trim(),
        subtitleAr: subtitleAr.trim(),
        beforeImage: beforeImage.trim(),
        afterImage: afterImage.trim(),
        sortOrder:
          sortOrder !== undefined && typeof sortOrder === "number"
            ? sortOrder
            : 0,
        isActive:
          isActive !== undefined && typeof isActive === "boolean"
            ? isActive
            : true,
      },
    });

    return NextResponse.json(
      { item: transformGalleryItem(item), message: "Gallery item created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/gallery] Error:", error);
    return NextResponse.json(
      { error: "Failed to create gallery item" },
      { status: 500 }
    );
  }
}
