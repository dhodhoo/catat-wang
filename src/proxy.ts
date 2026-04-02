import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedPrefixes = ["/dashboard", "/transactions", "/categories", "/reminders", "/settings"];

export function proxy(request: NextRequest) {
  const isProtected = protectedPrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix));
  if (!isProtected) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("insforge_access_token")?.value;
  if (!accessToken) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/transactions/:path*", "/categories/:path*", "/reminders/:path*", "/settings/:path*"]
};
