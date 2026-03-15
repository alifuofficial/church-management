import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isApiPage = req.nextUrl.pathname.startsWith("/api");
    const isAdminPage = req.nextUrl.pathname.startsWith("/admin");
    const isDashboardPage = req.nextUrl.pathname.startsWith("/dashboard");

    // Protect administrative routes
    if (isAdminPage && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        
        // Public routes that don't need auth
        if (
          path === "/" || 
          path === "/about" || 
          path === "/contact" ||
          path.startsWith("/api/auth") ||
          path.startsWith("/api/public") ||
          path.startsWith("/_next") ||
          path.includes("favicon.ico") ||
          (['/api/events', '/api/sermons', '/api/settings', '/api/campaigns', '/api/testimonies'].some(p => path.startsWith(p)) && req.method === 'GET')
        ) {
          return true;
        }

        // Basic auth requirement for everything else under /dashboard, /admin, and sensitive /api
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/settings/:path*",
    "/api/users/:path*",
    "/api/donations/:path*",
    "/api/newsletters/:path*",
    "/api/events/:path*",
    "/api/sermons/:path*",
    "/api/upload/:path*",
    "/api/campaigns/:path*",
    "/api/groups/:path*",
    "/api/programs/:path*",
    "/api/prayers/:path*",
    "/api/testimonies/:path*",
  ],
};
