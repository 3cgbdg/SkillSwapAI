import { NextRequest, NextResponse } from "next/server";

const AUTH_PATHS = ["/auth/login", "/auth/signup", "/auth/forgot-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(
    request.cookies.get("access_token") ?? request.cookies.get("refresh_token")
  );
  const isAuthPath = AUTH_PATHS.some((path) => pathname.startsWith(path));

  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(hasSession ? "/dashboard" : "/auth/login", request.url)
    );
  }

  if (!hasSession && !isAuthPath) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (hasSession && isAuthPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|health|favicon.ico|.*\\..*).*)"],
};
