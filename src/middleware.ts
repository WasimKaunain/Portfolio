import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lightweight protection: keep route hidden and reduce accidental indexing.
// Full protection is enforced by getServerSession in the page.
export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  if (req.nextUrl.pathname.startsWith("/private-admin")) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return res;
}

export const config = {
  matcher: ["/private-admin", "/private-admin/:path*"],
};
