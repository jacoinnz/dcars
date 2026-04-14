import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: [
    "/",
    "/entry/:path*",
    "/dashboard/:path*",
    "/reports/:path*",
    "/admin/:path*",
    "/teacher-content/:path*",
    "/teachers/:path*",
    "/evaluations/:path*",
    "/examinations/:path*",
    "/communications/:path*",
    "/students/:path*",
    "/hr/:path*",
    "/attendance/:path*",
    "/family/:path*",
    "/parents/:path*",
    "/student/:path*",
    "/api/participants/:path*",
    "/api/teacher-content/:path*",
  ],
};
