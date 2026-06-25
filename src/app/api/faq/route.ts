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
/*  Helper: transform FAQ for public locale-specific response         */
/* ------------------------------------------------------------------ */
function transformFaqPublic(row: any, lang: string) {
  const localeMap: Record<string, { question: string; answer: string }> = {
    fa: { question: row.questionFa, answer: row.answerFa },
    en: { question: row.questionEn, answer: row.answerEn },
    ar: { question: row.questionAr, answer: row.answerAr },
  };

  const locale = localeMap[lang] || localeMap["fa"];

  return {
    id: row.id,
    question: locale.question,
    answer: locale.answer,
    sort_order: row.sortOrder,
  };
}

/* ------------------------------------------------------------------ */
/*  GET /api/faq — List FAQs                                          */
/*  Public: only active FAQs, locale-specific fields (?lang=fa|en|ar) */
/*  Admin: all FAQs with all fields (?admin=true)                     */
/* ------------------------------------------------------------------ */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get("admin") === "true";
    const lang = searchParams.get("lang") || "fa";

    if (isAdmin) {
      // Admin mode: return all FAQs with all fields
      const faqs = await db.faq.findMany({
        orderBy: { sortOrder: "asc" },
      });

      return NextResponse.json({
        faqs: faqs.map(transformFaq),
      });
    }

    // Public mode: only active FAQs with locale-specific fields
    const validLangs = ["fa", "en", "ar"];
    const safeLang = validLangs.includes(lang) ? lang : "fa";

    const faqs = await db.faq.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({
      faqs: faqs.map((faq) => transformFaqPublic(faq, safeLang)),
    });
  } catch (error) {
    console.error("[GET /api/faq] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch FAQs" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/faq — Create a new FAQ                                  */
/*  Body: { questionFa, answerFa, questionEn, answerEn,               */
/*          questionAr, answerAr, sortOrder?, isActive? }             */
/* ------------------------------------------------------------------ */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      questionFa,
      answerFa,
      questionEn,
      answerEn,
      questionAr,
      answerAr,
      sortOrder,
      isActive,
    } = body;

    // Validate required fields
    const missing: string[] = [];
    if (!questionFa || typeof questionFa !== "string" || questionFa.trim() === "") {
      missing.push("questionFa");
    }
    if (!answerFa || typeof answerFa !== "string" || answerFa.trim() === "") {
      missing.push("answerFa");
    }
    if (!questionEn || typeof questionEn !== "string" || questionEn.trim() === "") {
      missing.push("questionEn");
    }
    if (!answerEn || typeof answerEn !== "string" || answerEn.trim() === "") {
      missing.push("answerEn");
    }
    if (!questionAr || typeof questionAr !== "string" || questionAr.trim() === "") {
      missing.push("questionAr");
    }
    if (!answerAr || typeof answerAr !== "string" || answerAr.trim() === "") {
      missing.push("answerAr");
    }

    if (missing.length > 0) {
      return NextResponse.json(
        { error: "Missing or invalid required fields", fields: missing },
        { status: 400 }
      );
    }

    const faq = await db.faq.create({
      data: {
        questionFa: questionFa.trim(),
        answerFa: answerFa.trim(),
        questionEn: questionEn.trim(),
        answerEn: answerEn.trim(),
        questionAr: questionAr.trim(),
        answerAr: answerAr.trim(),
        sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
        isActive: typeof isActive === "boolean" ? isActive : true,
      },
    });

    return NextResponse.json(
      { faq: transformFaq(faq), message: "FAQ created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/faq] Error:", error);
    return NextResponse.json(
      { error: "Failed to create FAQ" },
      { status: 500 }
    );
  }
}
