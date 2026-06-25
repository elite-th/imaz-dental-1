import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/* ------------------------------------------------------------------ */
/*  Collaborations API Route                                          */
/* ------------------------------------------------------------------ */

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
/*  Helper: transform DB row to locale-specific public response       */
/* ------------------------------------------------------------------ */
function transformCollaborationPublic(row: any, lang: string) {
  const localeMap: Record<string, { name: string }> = {
    fa: { name: row.nameFa },
    en: { name: row.nameEn },
    ar: { name: row.nameAr },
  };

  const locale = localeMap[lang] || localeMap.fa;

  return {
    id: row.id,
    name: locale.name,
    image: row.image,
    sort_order: row.sortOrder,
  };
}

/* ------------------------------------------------------------------ */
/*  GET /api/collaborations — List collaborations                     */
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
      const items = await db.collaboration.findMany({
        orderBy: { sortOrder: "asc" },
      });

      return NextResponse.json({
        items: items.map(transformCollaboration),
      });
    }

    // Public view: only active items, locale-specific fields
    const items = await db.collaboration.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({
      items: items.map((item) => transformCollaborationPublic(item, lang)),
    });
  } catch (error) {
    console.error("[GET /api/collaborations] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch collaborations" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/collaborations — Create a new collaboration             */
/* ------------------------------------------------------------------ */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      nameFa,
      nameEn,
      nameAr,
      image,
      sortOrder,
      isActive,
    } = body;

    // Validate required fields
    const missing: string[] = [];
    if (!nameFa || typeof nameFa !== "string" || nameFa.trim() === "") {
      missing.push("nameFa");
    }
    if (!nameEn || typeof nameEn !== "string" || nameEn.trim() === "") {
      missing.push("nameEn");
    }
    if (!nameAr || typeof nameAr !== "string" || nameAr.trim() === "") {
      missing.push("nameAr");
    }

    if (missing.length > 0) {
      return NextResponse.json(
        { error: "Missing or invalid required fields", fields: missing },
        { status: 400 }
      );
    }

    const item = await db.collaboration.create({
      data: {
        nameFa: nameFa.trim(),
        nameEn: nameEn.trim(),
        nameAr: nameAr.trim(),
        image: image && typeof image === "string" ? image.trim() : "",
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
      { item: transformCollaboration(item), message: "Collaboration created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/collaborations] Error:", error);
    return NextResponse.json(
      { error: "Failed to create collaboration" },
      { status: 500 }
    );
  }
}
