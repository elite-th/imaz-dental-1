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
/*  GET /api/site-text — List all site texts                           */
/*  Query params:                                                      */
/*    ?group=general  — filter by group                                */
/*    ?lang=fa|en|ar  — return locale-specific key-value pairs          */
/* ------------------------------------------------------------------ */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupFilter = searchParams.get("group");
    const lang = searchParams.get("lang");

    const where: Record<string, string> = {};
    if (groupFilter) {
      where.group = groupFilter;
    }

    const siteTexts = await db.siteText.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: [{ group: "asc" }, { key: "asc" }],
    });

    // If lang is specified, return locale-specific key-value pairs
    if (lang && ["fa", "en", "ar"].includes(lang)) {
      const langField = `value${lang.charAt(0).toUpperCase()}${lang.slice(1)}` as
        | "valueFa"
        | "valueEn"
        | "valueAr";

      const pairs: Record<string, string> = {};
      for (const st of siteTexts) {
        pairs[st.key] = st[langField];
      }

      return NextResponse.json({ texts: pairs, lang });
    }

    return NextResponse.json({
      texts: siteTexts.map(transformSiteText),
    });
  } catch (error) {
    console.error("[GET /api/site-text] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch site texts" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/site-text — Create a new site text entry                 */
/*  Body: { key, valueFa, valueEn, valueAr, group? }                   */
/* ------------------------------------------------------------------ */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { key, valueFa, valueEn, valueAr, group } = body;

    // Validate required fields
    const missing: string[] = [];
    if (!key || typeof key !== "string" || key.trim().length === 0) {
      missing.push("key");
    }
    if (valueFa === undefined || valueFa === null || typeof valueFa !== "string") {
      missing.push("valueFa");
    }
    if (valueEn === undefined || valueEn === null || typeof valueEn !== "string") {
      missing.push("valueEn");
    }
    if (valueAr === undefined || valueAr === null || typeof valueAr !== "string") {
      missing.push("valueAr");
    }

    if (missing.length > 0) {
      return NextResponse.json(
        { error: "Missing or invalid required fields", fields: missing },
        { status: 400 }
      );
    }

    // Check for duplicate key
    const existing = await db.siteText.findUnique({ where: { key: key.trim() } });
    if (existing) {
      return NextResponse.json(
        { error: "A site text entry with this key already exists" },
        { status: 409 }
      );
    }

    const created = await db.siteText.create({
      data: {
        key: key.trim(),
        valueFa: valueFa as string,
        valueEn: valueEn as string,
        valueAr: valueAr as string,
        group:
          group && typeof group === "string" && group.trim() !== ""
            ? group.trim()
            : "general",
      },
    });

    return NextResponse.json(
      {
        site_text: transformSiteText(created),
        info: "Site text created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/site-text] Error:", error);
    return NextResponse.json(
      { error: "Failed to create site text" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  PUT /api/site-text — Bulk update multiple site text entries        */
/*  Body: { items: [{ id, valueFa, valueEn, valueAr }] }              */
/* ------------------------------------------------------------------ */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "items must be a non-empty array" },
        { status: 400 }
      );
    }

    // Validate each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.id || typeof item.id !== "string") {
        return NextResponse.json(
          { error: `Item at index ${i} is missing a valid id` },
          { status: 400 }
        );
      }
    }

    // Update each item
    const updated: ReturnType<typeof transformSiteText>[] = [];
    const errors: { index: number; error: string }[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      try {
        const existing = await db.siteText.findUnique({
          where: { id: item.id },
        });

        if (!existing) {
          errors.push({ index: i, error: "Site text not found" });
          continue;
        }

        const data: Record<string, string> = {};
        if (item.valueFa !== undefined && typeof item.valueFa === "string") {
          data.valueFa = item.valueFa;
        }
        if (item.valueEn !== undefined && typeof item.valueEn === "string") {
          data.valueEn = item.valueEn;
        }
        if (item.valueAr !== undefined && typeof item.valueAr === "string") {
          data.valueAr = item.valueAr;
        }

        if (Object.keys(data).length === 0) {
          // No fields to update, just include existing
          updated.push(transformSiteText(existing));
          continue;
        }

        const result = await db.siteText.update({
          where: { id: item.id },
          data,
        });

        updated.push(transformSiteText(result));
      } catch (itemError) {
        errors.push({ index: i, error: "Update failed" });
      }
    }

    return NextResponse.json({
      site_texts: updated,
      updated_count: updated.length,
      errors: errors.length > 0 ? errors : undefined,
      info: `${updated.length} site text(s) updated successfully`,
    });
  } catch (error) {
    console.error("[PUT /api/site-text] Error:", error);
    return NextResponse.json(
      { error: "Failed to bulk update site texts" },
      { status: 500 }
    );
  }
}
