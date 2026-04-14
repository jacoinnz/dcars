import { NextResponse } from "next/server";
import type { NextFetchEvent } from "next/server";
import type { NextRequest } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";
import { withAuth } from "next-auth/middleware";

const withAuthMiddleware = withAuth({
  pages: { signIn: "/login" },
});

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  if (process.env.SKIP_AUTH === "true") {
    return NextResponse.next();
  }
  return withAuthMiddleware(request as NextRequestWithAuth, event);
}

export const config = {
  matcher: [
    "/",
    "/entry",
    "/entry/:path*",
    "/dashboard/:path*",
    "/reports",
    "/reports/:path*",
    "/admin/:path*",
    "/teacher-content/:path*",
    "/teachers/:path*",
    "/evaluations/:path*",
    "/examinations/:path*",
    "/communications/:path*",
    "/students",
    "/students/:path*",
    "/hr/:path*",
    "/attendance/:path*",
    "/family/:path*",
    "/parents/:path*",
    "/student/:path*",
    "/settings/:path*",
    "/academics/:path*",
    "/download-center/:path*",
    "/study-material/:path*",
    "/lesson-plan/:path*",
    "/api/participants/:path*",
    "/api/teacher-content/:path*",
  ],
};
