import { NextRequest, NextResponse } from "next/server";

/* ------------------------------------------------------------------ */
/*  Proxy — passes all requests through (auth disabled)                 */
/*                                                                      */
/*  NOTE: Authentication is disabled. All API routes are public.        */
/*  To re-enable auth, restore the PUBLIC_GET_ROUTES,                   */
/*  PUBLIC_POST_ROUTES, isPublicRoute, verifyToken logic                */
/*  and the auth check block in the proxy function.                     */
/* ------------------------------------------------------------------ */

export function proxy(request: NextRequest) {
  // All requests pass through — no auth check
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
