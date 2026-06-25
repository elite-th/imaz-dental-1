import { NextRequest, NextResponse } from "next/server";
import { clearAdminCookie } from "@/lib/auth";

/* ------------------------------------------------------------------ */
/*  POST /api/auth/logout — Admin logout                              */
/*  Clears the HMAC-signed admin cookie                                */
/* ------------------------------------------------------------------ */
export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  clearAdminCookie(response);
  return response;
}
