import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/courses", "/knowledge", "/feedback", "/reports", "/opc", "/admin", "/analytics"];
const publicRoutes = ["/", "/login"];

export function proxy(req: NextRequest) {
  const token = req.cookies.get("kymf_session")?.value;
  const pathname = req.nextUrl.pathname;
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  const isPublic = publicRoutes.includes(pathname);

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  if (isPublic && token && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
