import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  try {
    return await updateSession(request);
  } catch (error) {
    // A Supabase outage/misconfiguration must never take down every route.
    // Only /admin/** actually depends on this auth check, so on failure we
    // fail *open* for public pages and only block the admin area.
    console.error("Middleware auth check failed:", error);

    if (
      request.nextUrl.pathname.startsWith("/admin") &&
      request.nextUrl.pathname !== "/admin/login"
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Only run this middleware where it's actually needed: the admin area
     * (which needs the auth check) and the admin login page (which needs to
     * redirect already-logged-in admins away). Public pages and API routes
     * (including /api/feedback and /api/health) never touch it, so a
     * Supabase Auth hiccup can't block feedback submissions or public
     * browsing — which is exactly what "failing to fetch data" looked like.
     */
    "/admin/:path*",
  ],
};
