import { NextRequest, NextResponse } from "next/server";

const AUTH_PATHS = ["/auth/login", "/auth/signup", "/auth/forgot-password"];

/** Routes a logged-out visitor is allowed to see (exact match). */
const PUBLIC_PATHS = ["/"];

/** Public subtrees, e.g. "/legal" once terms/privacy land (prefix match). */
const PUBLIC_PREFIXES = ["/portfolio"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(
    request.cookies.get("access_token") ?? request.cookies.get("refresh_token")
  );
  const isAuthPath = AUTH_PATHS.some((path) => pathname.startsWith(path));
  const isPublicPath =
    PUBLIC_PATHS.includes(pathname) ||
    // The trailing slash stops "/legalese" from matching a "/legal" prefix.
    PUBLIC_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );

  // Signed-in users skip the marketing home and go straight to the app. Keyed
  // on "/" specifically, not isPublicPath — they should still be able to read
  // any future public page such as /legal/terms.
  if (hasSession && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isAuthPath) {
    return hasSession
      ? NextResponse.redirect(new URL("/dashboard", request.url))
      : NextResponse.next();
  }

  if (isPublicPath) {
    return NextResponse.next();
  }

  if (!hasSession) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Already excludes any path containing a dot, so /robots.txt and
  // /sitemap.xml are served without passing through here.
  matcher: ["/((?!_next|health|favicon.ico|.*\\..*).*)"],
};
