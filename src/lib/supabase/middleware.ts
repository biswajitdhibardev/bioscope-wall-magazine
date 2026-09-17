import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isLoginRoute = request.nextUrl.pathname === "/admin/login";

  if (isAdminRoute && !isLoginRoute) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("redirectTo", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // Prefer the database function, but allow the configured owner email as a
    // bootstrap fallback so an owner can still access the portal before the
    // profile role has been synchronized.
    const { data: isAdmin, error } = await supabase.rpc("is_admin", { user_id: user.id });
    const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const isConfiguredOwner = Boolean(
      configuredEmail && user.email?.toLowerCase() === configuredEmail
    );

    if ((error || !isAdmin) && !isConfiguredOwner) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(url);
    }
  }

  if (isLoginRoute && user) {
    const { data: isAdmin } = await supabase.rpc("is_admin", { user_id: user.id });
    const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const isConfiguredOwner = Boolean(
      configuredEmail && user.email?.toLowerCase() === configuredEmail
    );
    if (isAdmin || isConfiguredOwner) {
      const redirectTo = request.nextUrl.searchParams.get("redirectTo") || "/admin";
      const url = request.nextUrl.clone();
      url.pathname = redirectTo;
      url.searchParams.delete("redirectTo");
      url.searchParams.delete("error");
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
