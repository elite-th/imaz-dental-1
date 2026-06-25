import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createAdminSession, setAdminCookie, hashPassword, verifyPassword } from "@/lib/auth";

/* ------------------------------------------------------------------ */
/*  POST /api/auth/login — Admin login (HMAC cookie-based)            */
/*  Uses database User table with hashed passwords                     */
/* ------------------------------------------------------------------ */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "نام کاربری و رمز عبور الزامی است" },
        { status: 400 }
      );
    }

    // Find user by email field (used as username)
    const user = await db.user.findFirst({
      where: { email: username },
    });

    if (!user) {
      return NextResponse.json(
        { error: "نام کاربری یا رمز عبور اشتباه است" },
        { status: 401 }
      );
    }

    // Verify password
    if (!verifyPassword(password, user.password)) {
      return NextResponse.json(
        { error: "نام کاربری یا رمز عبور اشتباه است" },
        { status: 401 }
      );
    }

    // Create signed session token
    const token = await createAdminSession(user.id);

    const response = NextResponse.json({
      success: true,
      admin: {
        id: user.id,
        username: user.email,
        displayName: user.name || "منشی کلینیک",
        role: user.role,
      },
    });

    // Set HMAC-signed cookie
    setAdminCookie(response, token);

    return response;
  } catch (error) {
    console.error("[POST /api/auth/login] Error:", error);
    return NextResponse.json(
      { error: "خطا در ورود به سیستم" },
      { status: 500 }
    );
  }
}
