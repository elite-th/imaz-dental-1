import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/* ------------------------------------------------------------------ */
/*  Helper: transform DB row to API FAQ (snake_case)                  */
/* ------------------------------------------------------------------ */
function transformFaq(row: any) {
  return {
    id: row.id,
    question_fa: row.questionFa,
    answer_fa: row.answerFa,
    question_en: row.questionEn,
    answer_en: row.answerEn,
    question_ar: row.questionAr,
    answer_ar: row.answerAr,
    sort_order: row.sortOrder,
    is_active: row.isActive,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

/* ------------------------------------------------------------------ */
/*  PATCH /api/faq/[id] — Update an FAQ (partial update)              */
/*  Body: any subset of { questionFa, answerFa, questionEn, answerEn, */
/*        questionAr, answerAr, sortOrder, isActive }                 */
/* ------------------------------------------------------------------ */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.faq.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "FAQ not found" },
        { status: 404 }
      );
    }

    // Build update data — only include fields that are provided
    const data: any = {};

    if (body.questionFa !== undefined) {
      if (typeof body.questionFa !== "string" || body.questionFa.trim() === "") {
        return NextResponse.json(
          { error: "questionFa must be a non-empty string" },
          { status: 400 }
        );
      }
      data.questionFa = body.questionFa.trim();
    }

    if (body.answerFa !== undefined) {
      if (typeof body.answerFa !== "string" || body.answerFa.trim() === "") {
        return NextResponse.json(
          { error: "answerFa must be a non-empty string" },
          { status: 400 }
        );
      }
      data.answerFa = body.answerFa.trim();
    }

    if (body.questionEn !== undefined) {
      if (typeof body.questionEn !== "string" || body.questionEn.trim() === "") {
        return NextResponse.json(
          { error: "questionEn must be a non-empty string" },
          { status: 400 }
        );
      }
      data.questionEn = body.questionEn.trim();
    }

    if (body.answerEn !== undefined) {
      if (typeof body.answerEn !== "string" || body.answerEn.trim() === "") {
        return NextResponse.json(
          { error: "answerEn must be a non-empty string" },
          { status: 400 }
        );
      }
      data.answerEn = body.answerEn.trim();
    }

    if (body.questionAr !== undefined) {
      if (typeof body.questionAr !== "string" || body.questionAr.trim() === "") {
        return NextResponse.json(
          { error: "questionAr must be a non-empty string" },
          { status: 400 }
        );
      }
      data.questionAr = body.questionAr.trim();
    }

    if (body.answerAr !== undefined) {
      if (typeof body.answerAr !== "string" || body.answerAr.trim() === "") {
        return NextResponse.json(
          { error: "answerAr must be a non-empty string" },
          { status: 400 }
        );
      }
      data.answerAr = body.answerAr.trim();
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

    const faq = await db.faq.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      faq: transformFaq(faq),
      message: "FAQ updated successfully",
    });
  } catch (error) {
    console.error("[PATCH /api/faq/:id] Error:", error);
    return NextResponse.json(
      { error: "Failed to update FAQ" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  DELETE /api/faq/[id] — Delete an FAQ                              */
/* ------------------------------------------------------------------ */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.faq.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "FAQ not found" },
        { status: 404 }
      );
    }

    await db.faq.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "FAQ deleted successfully",
    });
  } catch (error) {
    console.error("[DELETE /api/faq/:id] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete FAQ" },
      { status: 500 }
    );
  }
}
