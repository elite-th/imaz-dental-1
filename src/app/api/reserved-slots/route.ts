import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

/* ------------------------------------------------------------------ */
/*  Helper: transform DB row to API ReservedSlot (snake_case)         */
/* ------------------------------------------------------------------ */
function transformReservedSlot(row: any) {
  return {
    id: row.id,
    date: row.date,
    time: row.time,
    reason: row.reason,
    created_by: row.createdBy,
    created_at: row.createdAt,
  };
}

/* ------------------------------------------------------------------ */
/*  GET /api/reserved-slots — لیست اسلات‌های رزرو شده (عمومی)         */
/* ------------------------------------------------------------------ */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFilter = searchParams.get("date");

    const where: any = {};
    if (dateFilter) {
      where.date = dateFilter;
    }

    const slots = await db.reservedSlot.findMany({
      where,
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });

    return NextResponse.json({
      reservedSlots: slots.map(transformReservedSlot),
    });
  } catch (error) {
    console.error("[GET /api/reserved-slots] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reserved slots" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/reserved-slots — افزودن اسلات رزرو شده (ادمین)          */
/* ------------------------------------------------------------------ */
export async function POST(request: NextRequest) {
  try {
    const authResult = requireAdmin(request);
    if ("error" in authResult) return authResult.error;

    const body = await request.json();
    const { date, time, reason } = body;

    if (!date || typeof date !== "string" || date.trim() === "") {
      return NextResponse.json(
        { error: "تاریخ الزامی است" },
        { status: 400 }
      );
    }

    if (!time || typeof time !== "string" || time.trim() === "") {
      return NextResponse.json(
        { error: "ساعت الزامی است" },
        { status: 400 }
      );
    }

    // بررسی تکراری نبودن
    const existing = await db.reservedSlot.findUnique({
      where: { date_time: { date: date.trim(), time: time.trim() } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "این ساعت قبلاً رزرو شده است" },
        { status: 409 }
      );
    }

    const slot = await db.reservedSlot.create({
      data: {
        date: date.trim(),
        time: time.trim(),
        reason: reason && typeof reason === "string" && reason.trim() !== "" ? reason.trim() : null,
        createdBy: "admin",
      },
    });

    return NextResponse.json(
      { reservedSlot: transformReservedSlot(slot), message: "ساعت رزرو شده با موفقیت اضافه شد" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/reserved-slots] Error:", error);
    return NextResponse.json(
      { error: "Failed to create reserved slot" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  DELETE /api/reserved-slots — حذف اسلات رزرو شده (ادمین)           */
/* ------------------------------------------------------------------ */
export async function DELETE(request: NextRequest) {
  try {
    const authResult = requireAdmin(request);
    if ("error" in authResult) return authResult.error;

    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");

    if (!idParam) {
      return NextResponse.json(
        { error: "شناسه الزامی است" },
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

    const existing = await db.reservedSlot.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "ساعت رزرو شده یافت نشد" },
        { status: 404 }
      );
    }

    await db.reservedSlot.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "ساعت رزرو شده با موفقیت حذف شد",
    });
  } catch (error) {
    console.error("[DELETE /api/reserved-slots] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete reserved slot" },
      { status: 500 }
    );
  }
}
