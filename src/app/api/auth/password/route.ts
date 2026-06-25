import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest, hashPassword, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";

/* ------------------------------------------------------------------ */
/*  POST /api/auth/password — تغییر رمز عبور (ادمین)                  */
/*  با احراز هویت و ذخیره در دیتابیس                                  */
/* ------------------------------------------------------------------ */
export async function POST(request: NextRequest) {
  try {
    // Verify admin is authenticated
    const userId = verifyAdminRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: "احراز هویت الزامی است" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { current_password, new_password } = body;

    if (!current_password || !new_password) {
      return NextResponse.json(
        { error: "رمز عبور فعلی و جدید الزامی است" },
        { status: 400 }
      );
    }

    if (new_password.length < 4) {
      return NextResponse.json(
        { error: "رمز عبور جدید باید حداقل ۴ کاراکتر باشد" },
        { status: 400 }
      );
    }

    // Find user
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) {
      return NextResponse.json(
        { error: "کاربر یافت نشد" },
        { status: 404 }
      );
    }

    // Verify current password
    if (!verifyPassword(current_password, user.password)) {
      return NextResponse.json(
        { error: "رمز عبور فعلی اشتباه است" },
        { status: 401 }
      );
    }

    // Hash and save new password
    const hashedNewPassword = hashPassword(new_password);
    await db.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return NextResponse.json({
      success: true,
      message: "رمز عبور با موفقیت تغییر کرد",
    });
  } catch (error) {
    console.error("[POST /api/auth/password] Error:", error);
    return NextResponse.json(
      { error: "خطا در تغییر رمز عبور" },
      { status: 500 }
    );
  }
}
