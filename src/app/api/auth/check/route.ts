import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth";
import { db } from "@/lib/db";

/* ------------------------------------------------------------------ */
/*  GET /api/auth/check — Check if admin is authenticated             */
/*  Uses HMAC-signed cookie verification + database user lookup        */
/* ------------------------------------------------------------------ */
export async function GET(request: NextRequest) {
  try {
    const userId = verifyAdminRequest(request);

    if (userId) {
      // Look up user from database to get fresh info
      const user = await db.user.findUnique({ where: { id: userId } });

      if (user) {
        return NextResponse.json({
          authenticated: true,
          admin: {
            id: user.id,
            username: user.email,
            displayName: user.name || "منشی کلینیک",
            role: user.role,
          },
        });
      }
    }

    return NextResponse.json({
      authenticated: false,
    });
  } catch (error) {
    console.error("[GET /api/auth/check] Error:", error);
    return NextResponse.json({
      authenticated: false,
    });
  }
}
