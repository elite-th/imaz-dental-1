import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

/* ------------------------------------------------------------------ */
/*  Helper: transform DB row to API Holiday (snake_case)              */
/* ------------------------------------------------------------------ */
function transformHoliday(row: any) {
  return {
    id: row.id,
    date: row.date,
    title: row.title,
    created_at: row.createdAt,
  };
}

/* ------------------------------------------------------------------ */
/*  GET /api/holidays — لیست تعطیلات (عمومی)                          */
/* ------------------------------------------------------------------ */
export async function GET() {
  try {
    const holidays = await db.holiday.findMany({
      orderBy: { date: "asc" },
    });

    return NextResponse.json({
      holidays: holidays.map(transformHoliday),
    });
  } catch (error) {
    console.error("[GET /api/holidays] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch holidays" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/holidays — افزودن تعطیلی (ادمین)                        */
/* ------------------------------------------------------------------ */
export async function POST(request: NextRequest) {
  try {
    const authResult = requireAdmin(request);
    if ("error" in authResult) return authResult.error;

    const body = await request.json();
    const { date, title } = body;

    if (!date || typeof date !== "string" || date.trim() === "") {
      return NextResponse.json(
        { error: "تاریخ تعطیلی الزامی است" },
        { status: 400 }
      );
    }

    if (!title || typeof title !== "string" || title.trim() === "") {
      return NextResponse.json(
        { error: "عنوان تعطیلی الزامی است" },
        { status: 400 }
      );
    }

    // بررسی تکراری نبودن
    const existing = await db.holiday.findUnique({
      where: { date: date.trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "این تاریخ قبلاً به عنوان تعطیلی ثبت شده است" },
        { status: 409 }
      );
    }

    const holiday = await db.holiday.create({
      data: {
        date: date.trim(),
        title: title.trim(),
      },
    });

    return NextResponse.json(
      { holiday: transformHoliday(holiday), message: "تعطیلی با موفقیت اضافه شد" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/holidays] Error:", error);
    return NextResponse.json(
      { error: "Failed to create holiday" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  DELETE /api/holidays — حذف تعطیلی (ادمین)                         */
/* ------------------------------------------------------------------ */
export async function DELETE(request: NextRequest) {
  try {
    const authResult = requireAdmin(request);
    if ("error" in authResult) return authResult.error;

    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");

    if (!idParam) {
      return NextResponse.json(
        { error: "شناسه تعطیلی الزامی است" },
        { status: 400 }
      );
    }

    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "شناسه نامعتبر" },
        { status: 400 }
      );
    }

    const existing = await db.holiday.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "تعطیلی یافت نشد" },
        { status: 404 }
      );
    }

    await db.holiday.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "تعطیلی با موفقیت حذف شد",
    });
  } catch (error) {
    console.error("[DELETE /api/holidays] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete holiday" },
      { status: 500 }
    );
  }
}
