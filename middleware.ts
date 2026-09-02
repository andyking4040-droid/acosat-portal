import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role as string | undefined;

  // Public routes
  if (pathname === "/login" || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Not logged in → redirect to login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Role-based protection
  if (pathname.startsWith("/student") && role !== "student") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/lecturer") && role !== "lecturer") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/student/:path*",
    "/lecturer/:path*",
    "/admin/:path*",
    "/login",
  ],
};