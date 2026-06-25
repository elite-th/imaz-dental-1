import { NextRequest, NextResponse } from "next/server";

/* ------------------------------------------------------------------ */
/*  POST /api/auth — Admin login (simplified, frontend-only auth)      */
/*  Credentials are checked in the frontend directly                   */
/*  This endpoint exists for API compatibility only                    */
/* ------------------------------------------------------------------ */

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "Imaz@2026";

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

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

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const timestamp = Date.now();
      const token = `admin:${timestamp}.${simpleHash(username + timestamp)}`;

      return NextResponse.json({
        success: true,
        token,
        username: ADMIN_USERNAME,
        displayName: "منشی کلینیک",
      });
    }

    return NextResponse.json(
      { error: "نام کاربری یا رمز عبور اشتباه است" },
      { status: 401 }
    );
  } catch (error) {
    console.error("[POST /api/auth] Error:", error);
    return NextResponse.json(
      { error: "خطا در ورود" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  GET /api/auth — Check if admin is authenticated                    */
/* ------------------------------------------------------------------ */
export async function GET(request: NextRequest) {
  return NextResponse.json({ authenticated: false }, { status: 401 });
}
